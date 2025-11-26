'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from 'grapesjs';
import { SectionHeader } from './properties/SectionHeader';
import { SegmentedControl } from './properties/SegmentedControl';
import { InputWithClear } from './properties/InputWithClear';
import { ColorPickerButton } from './properties/ColorPickerButton';
import { FontSizeSelector } from './properties/FontSizeSelector';
import { FontFamilySelector } from './properties/FontFamilySelector';
import ImageLibrary from './ImageLibrary';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  editor: Editor | null;
  isDark?: boolean;
  websiteId?: string;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  editor,
  isDark = true,
  websiteId,
}) => {
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['layout', 'typography', 'style', 'image-placeholder', 'link'])
  );
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [imageLibraryMode, setImageLibraryMode] = useState<'src' | 'background'>('src');
  const [urlInputValue, setUrlInputValue] = useState('');
  const [availableSections, setAvailableSections] = useState<Array<{ id: string; label: string }>>([]);

  // Get computed styles from selected component - tries to get actual rendered value
  const getStyleValue = (property: string): string => {
    if (!selectedComponent) return '';
    
    // First try to get inline style (what user set)
    const inlineStyle = selectedComponent.getStyle();
    if (inlineStyle[property]) {
      return inlineStyle[property];
    }
    
    // If no inline style, try to get computed style from DOM element
    try {
      const view = selectedComponent.getView();
      if (view && view.el) {
        const computedStyle = window.getComputedStyle(view.el);
        const computedValue = computedStyle.getPropertyValue(property.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (computedValue && computedValue !== 'none' && computedValue !== 'normal') {
          return computedValue.trim();
        }
      }
    } catch (e) {
      // Fallback to inline style if computed style fails
      console.warn('Failed to get computed style:', e);
    }
    
    return '';
  };

  // Update style property
  const updateStyle = (property: string, value: string) => {
    if (!selectedComponent || !editor) return;
    const styleManager = editor.StyleManager;
    if (styleManager && selectedComponent) {
      // Get current styles and merge with new property
      const currentStyles = selectedComponent.getStyle() || {};
      const newStyles = { ...currentStyles, [property]: value };
      
      // Set style on component (merge with existing styles)
      selectedComponent.setStyle(newStyles);
      
      // Also update the DOM element directly to ensure it's visible immediately
      try {
        const view = selectedComponent.getView();
        if (view && view.el) {
          const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
          (view.el as HTMLElement).style.setProperty(cssProperty, value);
        }
      } catch (e) {
        console.warn('Could not update DOM style directly:', e);
      }
      
      // Force GrapesJS to update and store the styles
      editor.trigger('component:update');
      editor.trigger('component:styleUpdate');
      editor.trigger('update');
      editor.trigger('storage:store');
    }
  };

  // Get attribute value
  const getAttribute = (attr: string): string => {
    if (!selectedComponent) return '';
    return selectedComponent.getAttributes()[attr] || '';
  };

  // Update attribute
  const updateAttribute = (attr: string, value: string) => {
    if (!selectedComponent) return;
    selectedComponent.addAttributes({ [attr]: value });
    editor?.trigger('component:update');
  };

  // Handle image selection from library
  const handleImageSelect = (imageUrl: string) => {
    if (!selectedComponent || !editor) return;
    
    if (imageLibraryMode === 'src') {
      // For image placeholder components
      if (isImagePlaceholder()) {
        updateImagePlaceholderSrc(imageUrl);
      }
      // For regular image components, set src attribute
      else if (selectedComponent.get('type') === 'image' || selectedComponent.get('tagName') === 'img') {
        updateAttribute('src', imageUrl);
        updateAttribute('alt', selectedComponent.getAttributes()['alt'] || 'Image');
      }
    } else if (imageLibraryMode === 'background') {
      // For background images, set background-image style
      updateStyle('background-image', `url(${imageUrl})`);
    }
    
    // Force update
    editor.trigger('component:update');
    editor.trigger('update');
    editor.trigger('canvas:update');
    
    setShowImageLibrary(false);
  };

  // Get image src for image components
  const getImageSrc = (): string => {
    if (!selectedComponent) return '';
    if (selectedComponent.get('type') === 'image' || selectedComponent.get('tagName') === 'img') {
      return getAttribute('src') || '';
    }
    return '';
  };

  // Check if selected component is an image
  const isImageComponent = (): boolean => {
    if (!selectedComponent) return false;
    return selectedComponent.get('type') === 'image' || selectedComponent.get('tagName') === 'img';
  };

  // Check if selected component is an image placeholder
  const isImagePlaceholder = (): boolean => {
    if (!selectedComponent) return false;
    return selectedComponent.get('type') === 'image-placeholder' || 
           selectedComponent.getAttributes()?.['data-gjs-type'] === 'image-placeholder' ||
           selectedComponent.getClasses()?.includes('image-placeholder-container');
  };

  // Check if selected component can have a link (links, buttons, or text elements)
  const isLinkComponent = (): boolean => {
    if (!selectedComponent) return false;
    
    try {
      const tagName = selectedComponent.get('tagName')?.toLowerCase();
      const attrs = selectedComponent.getAttributes() || {};
      const dataType = attrs['data-gjs-type'];
      const componentType = selectedComponent.get('type');
      const href = attrs.href || selectedComponent.get('href');
      
      // Text elements that can be made into links
      const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'li', 'td', 'th', 'label', 'button'];
      
      // Check multiple ways to identify a link component or linkable text
      const isLink = tagName === 'a' || 
                     dataType === 'link-button' || 
                     dataType === 'text-link' ||
                     componentType === 'link-button' ||
                     componentType === 'text-link' ||
                     componentType === 'link' ||
                     (href !== undefined && href !== null && href !== '') ||
                     textTags.includes(tagName); // Allow any text element to have a link
      
      // Debug logging in development - always log, not just when isLink is true
      if (process.env.NODE_ENV === 'development') {
        console.log('[PropertiesPanel] Checking if link component:', {
          tagName,
          dataType,
          componentType,
          href,
          isLink,
          allAttributes: attrs,
          modelHref: selectedComponent.get('href')
        });
      }
      
      return isLink;
    } catch (e) {
      console.warn('[PropertiesPanel] Error checking link component:', e);
      return false;
    }
  };
  
  // Check if component is a text element that can be converted to a link
  const isTextElement = (): boolean => {
    if (!selectedComponent) return false;
    const tagName = selectedComponent.get('tagName')?.toLowerCase();
    const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'li', 'td', 'th', 'label'];
    return textTags.includes(tagName) && selectedComponent.get('tagName')?.toLowerCase() !== 'a';
  };

  // Get image placeholder src
  const getImagePlaceholderSrc = (): string => {
    if (!selectedComponent) return '';
    return selectedComponent.get('src') || selectedComponent.getAttributes()?.src || '';
  };

  // Update image placeholder src
  const updateImagePlaceholderSrc = (src: string) => {
    if (!selectedComponent || !editor) return;
    selectedComponent.set('src', src);
    selectedComponent.addAttributes({ src });
    editor.trigger('component:update');
    editor.trigger('component:change:src');
    editor.trigger('update');
  };

  // Get object-fit style for image placeholder
  const getObjectFit = (): string => {
    if (!selectedComponent) return 'cover';
    const img = selectedComponent.getView()?.el?.querySelector('.image-placeholder-img');
    if (img) {
      return (img as HTMLElement).style.objectFit || 'cover';
    }
    return getStyleValue('object-fit') || 'cover';
  };

  // Update object-fit for image placeholder
  const updateObjectFit = (value: string) => {
    if (!selectedComponent || !editor) return;
    const view = selectedComponent.getView();
    if (view && view.el) {
      const img = view.el.querySelector('.image-placeholder-img');
      if (img) {
        (img as HTMLElement).style.objectFit = value;
      }
    }
    // Also set on component style
    updateStyle('object-fit', value);
    editor.trigger('component:update');
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Get all sections with IDs from the editor
  const getAllSections = useCallback(() => {
    if (!editor) return [];
    
    const sections: Array<{ id: string; label: string }> = [];
    const components = editor.getComponents();
    
    // Recursive function to find all components with IDs
    const findComponentsWithIds = (component: any) => {
      if (!component) return;
      
      const tagName = component.get('tagName')?.toLowerCase();
      const attrs = component.getAttributes() || {};
      const id = attrs.id;
      
      // Check if it's a section or has an ID
      if (id && id.trim() !== '') {
        // Get a label for the section (try to get text content or use ID)
        let label = id;
        try {
          const view = component.getView();
          if (view && view.el) {
            // Try to get text content from the element
            const textContent = view.el.textContent?.trim();
            if (textContent && textContent.length > 0 && textContent.length < 50) {
              label = `${id} - ${textContent}`;
            } else {
              // Try to get heading or first text element
              const heading = view.el.querySelector('h1, h2, h3, h4, h5, h6');
              if (heading) {
                label = `${id} - ${heading.textContent?.trim() || ''}`;
              }
            }
          }
        } catch (e) {
          // If we can't get label, just use ID
        }
        
        sections.push({ id, label });
      }
      
      // Recursively check children
      const children = component.components ? component.components().models || [] : [];
      children.forEach((child: any) => {
        findComponentsWithIds(child);
      });
    };
    
    // Start from root components
    const rootComponents = components.models || [];
    rootComponents.forEach((comp: any) => {
      findComponentsWithIds(comp);
    });
    
    return sections;
  }, [editor]);

  // Listen to component selection
  useEffect(() => {
    if (!editor) return;

    const handleComponentSelected = (component: any) => {
      setSelectedComponent(component);
      // Update URL input value when component is selected
      if (component) {
        const href = component.getAttributes()?.href || component.get('href') || '';
        setUrlInputValue(href);
      } else {
        setUrlInputValue('');
      }
      // Debug: Log component info when selected
      if (process.env.NODE_ENV === 'development' && component) {
        console.log('[PropertiesPanel] Component selected:', {
          tagName: component.get('tagName'),
          type: component.get('type'),
          attributes: component.getAttributes(),
          classes: component.getClasses()
        });
      }
    };

    const handleComponentUpdate = () => {
      // Refresh if component is still selected - use requestAnimationFrame to debounce
      requestAnimationFrame(() => {
        const updated = editor.getSelected();
        if (updated && updated === selectedComponent) {
          // Only update if something actually changed
          const newHref = updated.getAttributes()?.href || updated.get('href') || '';
          const currentHref = urlInputValue;
          if (newHref !== currentHref) {
            setUrlInputValue(newHref);
          }
          // Don't call setSelectedComponent if it's the same component
          // This prevents unnecessary re-renders
        }
      });
    };

    editor.on('component:selected', handleComponentSelected);
    editor.on('component:update', handleComponentUpdate);
    editor.on('component:styleUpdate', handleComponentUpdate);

    // Set initial selection
    const initial = editor.getSelected();
    if (initial) {
      setSelectedComponent(initial);
      const href = initial.getAttributes()?.href || initial.get('href') || '';
      setUrlInputValue(href);
    }

    // Update available sections when components change
    const updateSections = () => {
      const sections = getAllSections();
      setAvailableSections(sections);
    };

    // Initial sections load
    updateSections();

    // Listen for component changes to update sections list
    editor.on('component:add', updateSections);
    editor.on('component:remove', updateSections);
    editor.on('component:update', updateSections);
    editor.on('update', updateSections);

    return () => {
      editor.off('component:selected', handleComponentSelected);
      editor.off('component:update', handleComponentUpdate);
      editor.off('component:styleUpdate', handleComponentUpdate);
      editor.off('component:add', updateSections);
      editor.off('component:remove', updateSections);
      editor.off('update', updateSections);
    };
  }, [editor, getAllSections]);

  if (!selectedComponent) {
    return (
      <div className="properties-panel-empty">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-400">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  // Filter sections based on search
  const filterSection = (sectionId: string, properties: string[]): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sectionId.toLowerCase().includes(query) ||
      properties.some((prop) => prop.toLowerCase().includes(query))
    );
  };

  // Get display type (Stack/Grid based on display property)
  const getDisplayType = (): string => {
    const display = getStyleValue('display');
    if (display === 'grid') return 'grid';
    if (display === 'flex') return 'stack';
    return 'stack';
  };

  const setDisplayType = (type: string) => {
    if (type === 'grid') {
      updateStyle('display', 'grid');
    } else {
      updateStyle('display', 'flex');
    }
  };

  // Get flex-grow value
  const getFlexGrow = (): string => {
    const grow = getStyleValue('flex-grow');
    return grow && grow !== '0' ? 'yes' : 'no';
  };

  const setFlexGrow = (value: string) => {
    updateStyle('flex-grow', value === 'yes' ? '1' : '0');
  };

  // Get flex-shrink value
  const getFlexShrink = (): string => {
    const shrink = getStyleValue('flex-shrink');
    return shrink && shrink !== '0' ? 'yes' : 'no';
  };

  const setFlexShrink = (value: string) => {
    updateStyle('flex-shrink', value === 'yes' ? '1' : '0');
  };

  // Get text align value
  const getTextAlign = (): string => {
    return getStyleValue('text-align') || 'left';
  };

  const setTextAlign = (value: string) => {
    updateStyle('text-align', value);
  };

  return (
    <div className={`properties-panel ${isDark ? 'dark' : 'light'}`}>
      {/* Search Bar */}
      <div className="properties-search">
        <div className="relative">
          <input
            type="text"
            placeholder="Search properties"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="properties-content">
        {/* Image Section - Show for image components */}
        {isImageComponent() && filterSection('image', ['src', 'alt']) && (
          <div className="properties-section">
            <SectionHeader
              title="Image"
              isExpanded={expandedSections.has('image')}
              onToggle={() => toggleSection('image')}
              isDark={isDark}
            />
            {expandedSections.has('image') && (
              <div className="properties-section-content">
                <div className="property-row">
                  <label className="property-label">Image Source</label>
                  <button
                    type="button"
                    onClick={() => {
                      setImageLibraryMode('src');
                      setShowImageLibrary(true);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 transition-colors text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-300">Choose from Library</span>
                  </button>
                </div>
                {getImageSrc() && (
                  <div className="property-row">
                    <label className="property-label">Current Image</label>
                    <div className="w-full aspect-video bg-gray-800 rounded-md overflow-hidden border border-gray-700">
                      <img src={getImageSrc()} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
                <div className="property-row">
                  <label className="property-label">Alt Text</label>
                  <InputWithClear
                    value={getAttribute('alt') || ''}
                    onChange={(value) => updateAttribute('alt', value)}
                    placeholder="Image description"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Placeholder Section - Show for image placeholder components */}
        {isImagePlaceholder() && filterSection('image-placeholder', ['src', 'object-fit', 'width', 'height']) && (
          <div className="properties-section">
            <SectionHeader
              title="Image Settings"
              isExpanded={expandedSections.has('image-placeholder')}
              onToggle={() => toggleSection('image-placeholder')}
              isDark={isDark}
            />
            {expandedSections.has('image-placeholder') && (
              <div className="properties-section-content">
                <div className="property-row">
                  <label className="property-label">Image Source</label>
                  <button
                    type="button"
                    onClick={() => {
                      setImageLibraryMode('src');
                      setShowImageLibrary(true);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 transition-colors text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-300">Choose from Library</span>
                  </button>
                </div>
                {getImagePlaceholderSrc() && (
                  <>
                    <div className="property-row">
                      <label className="property-label">Image Preview</label>
                      <div className="w-full aspect-video bg-gray-800 rounded-md overflow-hidden border border-gray-700">
                        <img src={getImagePlaceholderSrc()} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="property-row">
                      <label className="property-label">Image Fit</label>
                      <SegmentedControl
                        value={getObjectFit()}
                        onChange={updateObjectFit}
                        options={[
                          { value: 'cover', label: 'Cover' },
                          { value: 'contain', label: 'Contain' },
                          { value: 'fill', label: 'Fill' },
                          { value: 'scale-down', label: 'Scale Down' },
                        ]}
                        isDark={isDark}
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Width</label>
                      <div className="flex gap-2">
                        <InputWithClear
                          value={getStyleValue('width') || '100%'}
                          onChange={(value) => updateStyle('width', value || '100%')}
                          placeholder="100%"
                        />
                        <select
                          value={getStyleValue('width')?.includes('%') ? '%' : 'px'}
                          onChange={(e) => {
                            const current = getStyleValue('width') || '100';
                            const num = current.replace(/[^0-9.]/g, '');
                            updateStyle('width', `${num}${e.target.value}`);
                          }}
                          className="px-2 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
                        >
                          <option value="%">%</option>
                          <option value="px">px</option>
                        </select>
                      </div>
                    </div>
                    <div className="property-row">
                      <label className="property-label">Height</label>
                      <div className="flex gap-2">
                        <InputWithClear
                          value={getStyleValue('height') || 'auto'}
                          onChange={(value) => updateStyle('height', value || 'auto')}
                          placeholder="auto"
                        />
                        <select
                          value={getStyleValue('height')?.includes('%') ? '%' : getStyleValue('height')?.includes('px') ? 'px' : 'auto'}
                          onChange={(e) => {
                            if (e.target.value === 'auto') {
                              updateStyle('height', 'auto');
                            } else {
                              const current = getStyleValue('height') || '200';
                              const num = current.replace(/[^0-9.]/g, '');
                              updateStyle('height', `${num}${e.target.value}`);
                            }
                          }}
                          className="px-2 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
                        >
                          <option value="auto">auto</option>
                          <option value="px">px</option>
                          <option value="%">%</option>
                        </select>
                      </div>
                    </div>
                    <div className="property-row">
                      <label className="property-label">Border Radius</label>
                      <InputWithClear
                        value={getStyleValue('border-radius') || '8px'}
                        onChange={(value) => updateStyle('border-radius', value || '8px')}
                        placeholder="8px"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Remove Image</label>
                      <button
                        type="button"
                        onClick={() => {
                          updateImagePlaceholderSrc('');
                          if (editor) {
                            editor.trigger('component:update');
                            editor.trigger('update');
                          }
                        }}
                        className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Link Section - Show for any link element or text element */}
        {isLinkComponent() && filterSection('link', ['href', 'target']) && (
          <div className="properties-section">
            <SectionHeader
              title="Link Settings"
              isExpanded={expandedSections.has('link')}
              onToggle={() => toggleSection('link')}
              isDark={isDark}
            />
            {expandedSections.has('link') && (
              <div className="properties-section-content">
                <div className="property-row">
                  <label className="property-label">Link Type</label>
                  <select
                    value={(urlInputValue?.startsWith('#') || urlInputValue?.startsWith('/')) && !urlInputValue?.startsWith('http') ? 'internal' : 'external'}
                    onChange={(e) => {
                      const currentValue = urlInputValue || '';
                      if (e.target.value === 'internal') {
                        // If it's an external URL, convert to internal
                        if (currentValue.startsWith('http')) {
                          setUrlInputValue('#section');
                        } else if (!currentValue.startsWith('#') && !currentValue.startsWith('/')) {
                          setUrlInputValue('#section');
                        }
                        // Keep internal format if already internal
                      } else {
                        // If it's internal, convert to external
                        if (currentValue.startsWith('#') || (currentValue.startsWith('/') && !currentValue.startsWith('//'))) {
                          setUrlInputValue('https://');
                        } else if (!currentValue.startsWith('http')) {
                          setUrlInputValue('https://');
                        }
                        // Keep external format if already external
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  >
                    <option value="external">External URL</option>
                    <option value="internal">Internal Page / Section</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {((urlInputValue?.startsWith('#') || urlInputValue?.startsWith('/')) && !urlInputValue?.startsWith('http')) 
                      ? 'Use #section-name for page sections or /page-path for internal pages' 
                      : 'Enter full URL (e.g., https://example.com)'}
                  </p>
                </div>
                {/* Section Selector - Only show for internal links */}
                {((urlInputValue?.startsWith('#') || urlInputValue?.startsWith('/')) && !urlInputValue?.startsWith('http')) && availableSections.length > 0 && (
                  <div className="property-row">
                    <label className="property-label">Select Section</label>
                    <select
                      value={urlInputValue?.startsWith('#') ? urlInputValue.substring(1) : ''}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (selectedId) {
                          const newHref = `#${selectedId}`;
                          setUrlInputValue(newHref);
                          // Update the component href
                          if (selectedComponent && editor) {
                            const tagName = selectedComponent.get('tagName')?.toLowerCase();
                            
                            if (isTextElement() && tagName !== 'a') {
                              selectedComponent.addAttributes({ 'data-original-tag': tagName });
                              selectedComponent.set('tagName', 'a');
                              selectedComponent.addAttributes({ 
                                href: newHref,
                                target: getAttribute('target') || '_self',
                                'data-gjs-type': 'text-link'
                              });
                              selectedComponent.set('href', newHref);
                              
                              const view = selectedComponent.getView();
                              if (view && view.el) {
                                const newEl = document.createElement('a');
                                newEl.href = newHref;
                                newEl.target = getAttribute('target') || '_self';
                                newEl.setAttribute('data-gjs-type', 'text-link');
                                newEl.setAttribute('data-original-tag', tagName);
                                newEl.innerHTML = view.el.innerHTML;
                                
                                Array.from(view.el.attributes).forEach(attr => {
                                  if (attr.name !== 'href' && attr.name !== 'target' && 
                                      attr.name !== 'data-gjs-type' && attr.name !== 'data-original-tag') {
                                    newEl.setAttribute(attr.name, attr.value);
                                  }
                                });
                                
                                if (view.el.parentNode) {
                                  view.el.parentNode.replaceChild(newEl, view.el);
                                  view.el = newEl;
                                }
                              }
                              
                              editor.trigger('component:update');
                              editor.trigger('component:change:tagName');
                            } else {
                              selectedComponent.addAttributes({ href: newHref });
                              selectedComponent.set('href', newHref);
                              
                              const view = selectedComponent.getView();
                              if (view && view.el) {
                                const el = view.el as HTMLElement;
                                if (el.tagName?.toLowerCase() === 'a') {
                                  (el as HTMLAnchorElement).href = newHref;
                                } else {
                                  el.setAttribute('href', newHref);
                                }
                              }
                            }
                            
                            editor.trigger('component:update');
                            editor.trigger('component:change:href');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    >
                      <option value="">-- Select a section --</option>
                      {availableSections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a section from your page to navigate to
                    </p>
                  </div>
                )}
                <div className="property-row">
                  <label className="property-label">URL (href)</label>
                  <InputWithClear
                    value={urlInputValue}
                    onChange={(value) => {
                      setUrlInputValue(value);
                      // Update both attribute and model property
                      if (selectedComponent && editor) {
                        const tagName = selectedComponent.get('tagName')?.toLowerCase();
                        
                        // Prevent navigation when clicking links in editor - handled in GrapesJS
                        
                        if (value && value.trim() !== '' && value !== '#') {
                          // If text element and not already a link, convert to <a> tag
                          if (isTextElement() && tagName !== 'a') {
                            // Store original tag for later restoration
                            selectedComponent.addAttributes({ 'data-original-tag': tagName });
                            
                            // Change tagName to 'a' and set href
                            selectedComponent.set('tagName', 'a');
                            selectedComponent.addAttributes({ 
                              href: value,
                              target: getAttribute('target') || '_self',
                              'data-gjs-type': 'text-link'
                            });
                            selectedComponent.set('href', value);
                            
                            // Update the view to reflect the change
                            const view = selectedComponent.getView();
                            if (view && view.el) {
                              // Create new <a> element
                              const newEl = document.createElement('a');
                              newEl.href = value;
                              newEl.target = getAttribute('target') || '_self';
                              newEl.setAttribute('data-gjs-type', 'text-link');
                              newEl.setAttribute('data-original-tag', tagName);
                              
                              // Copy content
                              newEl.innerHTML = view.el.innerHTML;
                              
                              // Copy attributes
                              Array.from(view.el.attributes).forEach(attr => {
                                if (attr.name !== 'href' && attr.name !== 'target' && 
                                    attr.name !== 'data-gjs-type' && attr.name !== 'data-original-tag') {
                                  newEl.setAttribute(attr.name, attr.value);
                                }
                              });
                              
                              // Replace in DOM
                              if (view.el.parentNode) {
                                view.el.parentNode.replaceChild(newEl, view.el);
                                view.el = newEl;
                              }
                            }
                            
                            editor.trigger('component:update');
                            editor.trigger('component:change:tagName');
                            return;
                          } else {
                            // Regular link element - just update href
                            selectedComponent.addAttributes({ href: value });
                            selectedComponent.set('href', value);
                            
                            // Update the actual DOM element
                            const view = selectedComponent.getView();
                            if (view && view.el) {
                              const el = view.el as HTMLElement;
                              if (el.tagName?.toLowerCase() === 'a') {
                                (el as HTMLAnchorElement).href = value;
                              } else {
                                el.setAttribute('href', value);
                              }
                            }
                          }
                        } else {
                          // Remove link - if it's an <a> tag from text conversion, convert back
                          if (tagName === 'a' && selectedComponent.getAttributes()?.['data-gjs-type'] === 'text-link') {
                            const originalTag = selectedComponent.getAttributes()?.['data-original-tag'] || 'span';
                            
                            // Remove link styles explicitly
                            const currentStyle = selectedComponent.getStyle();
                            const newStyle: any = { ...currentStyle };
                            // Remove text-decoration and color if they were set for the link
                            if (newStyle['text-decoration'] === 'underline' || newStyle['text-decoration'] === 'none') {
                              delete newStyle['text-decoration'];
                            }
                            // Only remove color if it's a typical link color
                            const linkColors = ['#2563eb', '#1d4ed8', '#1e40af', 'rgb(37, 99, 235)', 'rgb(29, 78, 216)'];
                            if (linkColors.includes(newStyle.color)) {
                              delete newStyle.color;
                            }
                            selectedComponent.setStyle(newStyle);
                            
                            // Change tagName back to original
                            selectedComponent.set('tagName', originalTag);
                            selectedComponent.removeAttributes('href');
                            selectedComponent.removeAttributes('target');
                            selectedComponent.removeAttributes('data-gjs-type');
                            selectedComponent.removeAttributes('data-original-tag');
                            selectedComponent.set('href', '');
                            
                            // Update the view to reflect the change
                            const view = selectedComponent.getView();
                            if (view && view.el) {
                              // Create new element with original tag
                              const newEl = document.createElement(originalTag);
                              
                              // Copy content
                              newEl.innerHTML = view.el.innerHTML;
                              
                              // Copy attributes (excluding link-specific ones)
                              Array.from(view.el.attributes).forEach(attr => {
                                if (attr.name !== 'href' && attr.name !== 'target' && 
                                    attr.name !== 'data-gjs-type' && attr.name !== 'data-original-tag') {
                                  newEl.setAttribute(attr.name, attr.value);
                                }
                              });
                              
                              // Remove link styles from inline style attribute
                              const inlineStyle = newEl.getAttribute('style') || '';
                              if (inlineStyle) {
                                const styleObj: any = {};
                                inlineStyle.split(';').forEach(rule => {
                                  const [key, val] = rule.split(':').map(s => s.trim());
                                  if (key && val) {
                                    // Skip text-decoration and link colors
                                    if (key !== 'text-decoration' && 
                                        !linkColors.some(lc => val.includes(lc))) {
                                      styleObj[key] = val;
                                    }
                                  }
                                });
                                const newStyleStr = Object.entries(styleObj)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join('; ');
                                if (newStyleStr) {
                                  newEl.setAttribute('style', newStyleStr);
                                } else {
                                  newEl.removeAttribute('style');
                                }
                              }
                              
                              // Make element easily selectable
                              newEl.style.userSelect = 'text';
                              newEl.style.cursor = 'text';
                              newEl.style.pointerEvents = 'auto';
                              // Mark as previously a link for CSS targeting
                              newEl.setAttribute('data-was-link', 'true');
                              
                              // Replace in DOM
                              if (view.el.parentNode) {
                                view.el.parentNode.replaceChild(newEl, view.el);
                                view.el = newEl;
                              }
                            }
                            
                            editor.trigger('component:update');
                            editor.trigger('component:change:tagName');
                            return;
                          } else {
                            // Just remove href attribute and link styles
                            selectedComponent.removeAttributes('href');
                            selectedComponent.set('href', '');
                            
                            // Remove link styles
                            const currentStyle = selectedComponent.getStyle();
                            const newStyle: any = { ...currentStyle };
                            if (newStyle['text-decoration'] === 'underline') {
                              delete newStyle['text-decoration'];
                            }
                            const linkColors = ['#2563eb', '#1d4ed8', '#1e40af', 'rgb(37, 99, 235)', 'rgb(29, 78, 216)'];
                            if (linkColors.includes(newStyle.color)) {
                              delete newStyle.color;
                            }
                            selectedComponent.setStyle(newStyle);
                            
                              // Update DOM element
                              const view = selectedComponent.getView();
                              if (view && view.el) {
                                const el = view.el as HTMLElement;
                                el.style.userSelect = 'text';
                                el.style.cursor = 'text';
                                el.style.pointerEvents = 'auto';
                                // Mark as previously a link
                                el.setAttribute('data-was-link', 'true');
                                // Remove underline and link color
                                if (el.style.textDecoration === 'underline') {
                                  el.style.textDecoration = 'none';
                                }
                                const linkColors = ['#2563eb', '#1d4ed8', '#1e40af', 'rgb(37, 99, 235)', 'rgb(29, 78, 216)'];
                                if (linkColors.some(lc => el.style.color.includes(lc))) {
                                  el.style.color = '';
                                }
                              }
                          }
                        }
                        
                        editor.trigger('component:update');
                        editor.trigger('component:change:href');
                        // Ensure URL input value is synced
                        setUrlInputValue(value);
                      }
                    }}
                    placeholder="https://example.com or leave empty to remove link"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isTextElement() && selectedComponent?.get('tagName')?.toLowerCase() !== 'a' 
                      ? 'Enter URL to convert this text to a clickable link' 
                      : 'Enter full URL (e.g., https://youtube.com) or leave empty to remove link'}
                  </p>
                </div>
                {(getAttribute('href') && getAttribute('href') !== '' && getAttribute('href') !== '#') && (
                  <>
                    <div className="property-row">
                      <label className="property-label">Open In</label>
                      <select
                        value={getAttribute('target') || selectedComponent?.get('target') || '_self'}
                        onChange={(e) => {
                          updateAttribute('target', e.target.value);
                          // Also update the model property
                          if (selectedComponent) {
                            selectedComponent.addAttributes({ target: e.target.value });
                            selectedComponent.set('target', e.target.value);
                            // Update the actual DOM element
                            const view = selectedComponent.getView();
                            if (view && view.el) {
                              const el = view.el as HTMLElement;
                              if (el.tagName?.toLowerCase() === 'a') {
                                (el as HTMLAnchorElement).target = e.target.value;
                              } else {
                                el.setAttribute('target', e.target.value);
                              }
                            }
                            editor?.trigger('component:update');
                          }
                        }}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="_self">Same Window</option>
                        <option value="_blank">New Tab</option>
                      </select>
                    </div>
                    <div className="property-row">
                      <label className="property-label">Link Color</label>
                      <ColorPickerButton
                        value={getStyleValue('color') || '#2563eb'}
                        onChange={(value) => updateStyle('color', value)}
                        label="Choose Color"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Hover Color</label>
                      <ColorPickerButton
                        value={selectedComponent?.getAttributes()?.['data-hover-color'] || getStyleValue('color') || '#1d4ed8'}
                        onChange={(value) => {
                          if (selectedComponent && editor) {
                            const view = selectedComponent.getView();
                            if (view && view.el) {
                              // Store hover color as data attribute
                              view.el.setAttribute('data-hover-color', value);
                              selectedComponent.addAttributes({ 'data-hover-color': value });
                              
                              // Add CSS for hover effect using component ID
                              const componentId = selectedComponent.cid || selectedComponent.getAttributes()?.['data-gjs-id'];
                              if (componentId) {
                                // Remove existing hover style
                                const existingStyle = document.getElementById(`hover-style-${componentId}`);
                                if (existingStyle) {
                                  existingStyle.remove();
                                }
                                
                                // Add new hover style
                                const styleEl = document.createElement('style');
                                styleEl.id = `hover-style-${componentId}`;
                                styleEl.textContent = `
                                  [data-gjs-id="${componentId}"]:hover,
                                  [data-gjs-id="${componentId}"] a:hover {
                                    color: ${value} !important;
                                  }
                                `;
                                document.head.appendChild(styleEl);
                              }
                              
                              editor.trigger('component:update');
                            }
                          }
                        }}
                        label="Choose Hover Color"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Underline</label>
                      <SegmentedControl
                        options={[
                          { value: 'underline', label: 'Yes' },
                          { value: 'none', label: 'No' },
                        ]}
                        value={(() => {
                          const textDec = getStyleValue('text-decoration');
                          // Check if underline is present (either explicitly or as default link style)
                          if (textDec && textDec.includes('underline')) {
                            return 'underline';
                          }
                          // Check computed style if inline style doesn't have it
                          try {
                            if (selectedComponent) {
                              const view = selectedComponent.getView();
                              if (view && view.el) {
                                const computed = window.getComputedStyle(view.el);
                                if (computed.textDecoration && computed.textDecoration.includes('underline')) {
                                  return 'underline';
                                }
                              }
                            }
                          } catch (e) {
                            // Ignore
                          }
                          return 'none';
                        })()}
                        onChange={(value) => {
                          if (value === 'underline') {
                            updateStyle('text-decoration', 'underline');
                          } else {
                            // Explicitly set to none to override any inherited styles
                            updateStyle('text-decoration', 'none');
                            // Also update DOM directly
                            if (selectedComponent) {
                              const view = selectedComponent.getView();
                              if (view && view.el) {
                                (view.el as HTMLElement).style.textDecoration = 'none';
                              }
                            }
                          }
                        }}
                        isDark={isDark}
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Remove Link</label>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedComponent && editor) {
                            const tagName = selectedComponent.get('tagName')?.toLowerCase();
                            
                            // If it's a converted text link, convert back
                            if (tagName === 'a' && selectedComponent.getAttributes()?.['data-gjs-type'] === 'text-link') {
                              const originalTag = selectedComponent.getAttributes()?.['data-original-tag'] || 'span';
                              
                              // Remove link styles explicitly
                              const currentStyle = selectedComponent.getStyle();
                              const newStyle: any = { ...currentStyle };
                              if (newStyle['text-decoration'] === 'underline' || newStyle['text-decoration'] === 'none') {
                                delete newStyle['text-decoration'];
                              }
                              const linkColors = ['#2563eb', '#1d4ed8', '#1e40af', 'rgb(37, 99, 235)', 'rgb(29, 78, 216)'];
                              if (linkColors.includes(newStyle.color)) {
                                delete newStyle.color;
                              }
                              selectedComponent.setStyle(newStyle);
                              
                              selectedComponent.set('tagName', originalTag);
                              selectedComponent.removeAttributes('href');
                              selectedComponent.removeAttributes('target');
                              selectedComponent.removeAttributes('data-gjs-type');
                              selectedComponent.removeAttributes('data-original-tag');
                              selectedComponent.set('href', '');
                              
                              const view = selectedComponent.getView();
                              if (view && view.el) {
                                const newEl = document.createElement(originalTag);
                                newEl.innerHTML = view.el.innerHTML;
                                Array.from(view.el.attributes).forEach(attr => {
                                  if (attr.name !== 'href' && attr.name !== 'target' && 
                                      attr.name !== 'data-gjs-type' && attr.name !== 'data-original-tag') {
                                    newEl.setAttribute(attr.name, attr.value);
                                  }
                                });
                                
                                // Remove link styles from inline style attribute
                                const inlineStyle = newEl.getAttribute('style') || '';
                                if (inlineStyle) {
                                  const styleObj: any = {};
                                  const linkColors = ['#2563eb', '#1d4ed8', '#1e40af', 'rgb(37, 99, 235)', 'rgb(29, 78, 216)'];
                                  inlineStyle.split(';').forEach(rule => {
                                    const [key, val] = rule.split(':').map(s => s.trim());
                                    if (key && val) {
                                      // Skip text-decoration and link colors
                                      if (key !== 'text-decoration' && 
                                          !linkColors.some(lc => val.includes(lc))) {
                                        styleObj[key] = val;
                                      }
                                    }
                                  });
                                  const newStyleStr = Object.entries(styleObj)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join('; ');
                                  if (newStyleStr) {
                                    newEl.setAttribute('style', newStyleStr);
                                  } else {
                                    newEl.removeAttribute('style');
                                  }
                                }
                                
                                // Make element easily selectable
                                newEl.style.userSelect = 'text';
                                newEl.style.cursor = 'text';
                                newEl.style.pointerEvents = 'auto';
                                newEl.setAttribute('data-was-link', 'true');
                                
                                if (view.el.parentNode) {
                                  view.el.parentNode.replaceChild(newEl, view.el);
                                  view.el = newEl;
                                }
                              }
                              
                              editor.trigger('component:update');
                              editor.trigger('component:change:tagName');
                            } else {
                              // Just remove href attribute and link styles
                              selectedComponent.removeAttributes('href');
                              selectedComponent.set('href', '');
                              
                              // Remove link styles
                              const currentStyle = selectedComponent.getStyle();
                              const newStyle: any = { ...currentStyle };
                              if (newStyle['text-decoration'] === 'underline') {
                                delete newStyle['text-decoration'];
                              }
                              const linkColors = ['#2563eb', '#1d4ed8', '#1e40af', 'rgb(37, 99, 235)', 'rgb(29, 78, 216)'];
                              if (linkColors.includes(newStyle.color)) {
                                delete newStyle.color;
                              }
                              selectedComponent.setStyle(newStyle);
                              
                              // Update DOM element
                              const view = selectedComponent.getView();
                              if (view && view.el) {
                                const el = view.el as HTMLElement;
                                el.style.userSelect = 'text';
                                el.style.cursor = 'text';
                                el.style.pointerEvents = 'auto';
                                el.setAttribute('data-was-link', 'true');
                                // Remove underline and link color
                                if (el.style.textDecoration === 'underline') {
                                  el.style.textDecoration = 'none';
                                }
                                const linkColors = ['#2563eb', '#1d4ed8', '#1e40af', 'rgb(37, 99, 235)', 'rgb(29, 78, 216)'];
                                if (linkColors.some(lc => el.style.color.includes(lc))) {
                                  el.style.color = '';
                                }
                              }
                            }
                            
                            editor.trigger('component:update');
                            editor.trigger('component:change:href');
                          }
                        }}
                        className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                      >
                        Remove Link
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Layout Section */}
        {filterSection('layout', ['display', 'flex-grow', 'flex-shrink']) && (
          <div className="properties-section">
            <SectionHeader
              title="Layout"
              isExpanded={expandedSections.has('layout')}
              onToggle={() => toggleSection('layout')}
              isDark={isDark}
            />
            {expandedSections.has('layout') && (
              <div className="properties-section-content">
                <div className="property-row">
                  <label className="property-label">Type</label>
                  <SegmentedControl
                    options={[
                      { value: 'stack', label: 'Stack' },
                      { value: 'grid', label: 'Grid' },
                    ]}
                    value={getDisplayType()}
                    onChange={setDisplayType}
                    isDark={isDark}
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Grow</label>
                  <SegmentedControl
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                    ]}
                    value={getFlexGrow()}
                    onChange={setFlexGrow}
                    isDark={isDark}
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Shrink</label>
                  <SegmentedControl
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                    ]}
                    value={getFlexShrink()}
                    onChange={setFlexShrink}
                    isDark={isDark}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Typography Section */}
        {filterSection('typography', [
          'font-family',
          'font-weight',
          'font-size',
          'line-height',
          'letter-spacing',
          'text-transform',
          'text-align',
        ]) && (
          <div className="properties-section">
            <SectionHeader
              title="Typography"
              isExpanded={expandedSections.has('typography')}
              onToggle={() => toggleSection('typography')}
              isDark={isDark}
            />
            {expandedSections.has('typography') && (
              <div className="properties-section-content">
                <div className="property-row">
                  <label className="property-label">Family</label>
                  <FontFamilySelector
                    value={getStyleValue('font-family')}
                    onChange={(value) => updateStyle('font-family', value)}
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Weight</label>
                  <select
                    value={getStyleValue('font-weight') || 'normal'}
                    onChange={(e) => updateStyle('font-weight', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="100">Thin (100)</option>
                    <option value="200">Extra Light (200)</option>
                    <option value="300">Light (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                    <option value="900">Black (900)</option>
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Lighter</option>
                    <option value="bolder">Bolder</option>
                  </select>
                </div>
                <div className="property-row">
                  <label className="property-label">Size</label>
                  <FontSizeSelector
                    value={getStyleValue('font-size')}
                    onChange={(value) => updateStyle('font-size', value)}
                    placeholder="16px"
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Height</label>
                  <InputWithClear
                    value={getStyleValue('line-height')}
                    onChange={(value) => updateStyle('line-height', value)}
                    placeholder="148px"
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Letter</label>
                  <InputWithClear
                    value={getStyleValue('letter-spacing')}
                    onChange={(value) => updateStyle('letter-spacing', value)}
                    placeholder="-6px"
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Transform</label>
                  <select
                    value={getStyleValue('text-transform') || 'unset'}
                    onChange={(e) => updateStyle('text-transform', e.target.value === 'unset' ? '' : e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="unset">unset</option>
                    <option value="uppercase">uppercase</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">capitalize</option>
                    <option value="none">none</option>
                  </select>
                </div>
                <div className="property-row">
                  <label className="property-label">Align</label>
                  <SegmentedControl
                    options={[
                      {
                        value: 'left',
                        label: '',
                        icon: (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                          </svg>
                        ),
                      },
                      {
                        value: 'center',
                        label: '',
                        icon: (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M9 14h6M3 6h18M9 18h6" />
                          </svg>
                        ),
                      },
                      {
                        value: 'right',
                        label: '',
                        icon: (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-18M15 14h6M21 6h-18M15 18h6" />
                          </svg>
                        ),
                      },
                    ]}
                    value={getTextAlign()}
                    onChange={setTextAlign}
                    isDark={isDark}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Style Section */}
        {filterSection('style', [
          'background-color',
          'color',
          'border-color',
          'background-image',
        ]) && (
          <div className="properties-section">
            <SectionHeader
              title="Style"
              isExpanded={expandedSections.has('style')}
              onToggle={() => toggleSection('style')}
              isDark={isDark}
            />
            {expandedSections.has('style') && (
              <div className="properties-section-content">
                <div className="property-row">
                  <label className="property-label">BG Color</label>
                  <ColorPickerButton
                    value={getStyleValue('background-color')}
                    onChange={(value) => updateStyle('background-color', value)}
                    label="Set Color"
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Text Color</label>
                  <div className="relative">
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className="w-5 h-5 rounded-full border border-gray-600 flex-shrink-0"
                        style={{
                          backgroundColor: getStyleValue('color') || '#0C0C0C',
                        }}
                      />
                      <InputWithClear
                        value={getStyleValue('color') || '#0C0C0C'}
                        onChange={(value) => updateStyle('color', value)}
                        placeholder="#0C0C0C"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="property-row">
                  <label className="property-label">Border Color</label>
                  <ColorPickerButton
                    value={getStyleValue('border-color')}
                    onChange={(value) => updateStyle('border-color', value)}
                    label="Set Color"
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">BG Image</label>
                  <button
                    type="button"
                    onClick={() => {
                      setImageLibraryMode('background');
                      setShowImageLibrary(true);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 transition-colors text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-300">Choose from Library</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Library Modal - Only render when needed */}
      {showImageLibrary && (
        <ImageLibrary
          isOpen={showImageLibrary}
          onClose={() => setShowImageLibrary(false)}
          onSelectImage={handleImageSelect}
          websiteId={websiteId}
          isDark={isDark}
        />
      )}
    </div>
  );
};

