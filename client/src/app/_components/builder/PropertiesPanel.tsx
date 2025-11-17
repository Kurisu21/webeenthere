'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Editor } from 'grapesjs';
import { SectionHeader } from './properties/SectionHeader';
import { SegmentedControl } from './properties/SegmentedControl';
import { InputWithClear } from './properties/InputWithClear';
import { ColorPickerButton } from './properties/ColorPickerButton';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  editor: Editor | null;
  isDark?: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  editor,
  isDark = true,
}) => {
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['layout', 'typography', 'style'])
  );

  // Get computed styles from selected component
  const getStyleValue = (property: string): string => {
    if (!selectedComponent) return '';
    const style = selectedComponent.getStyle();
    return style[property] || '';
  };

  // Update style property
  const updateStyle = (property: string, value: string) => {
    if (!selectedComponent || !editor) return;
    const styleManager = editor.StyleManager;
    if (styleManager && selectedComponent) {
      selectedComponent.setStyle({ [property]: value });
      editor.trigger('component:update');
      editor.trigger('component:styleUpdate');
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

  // Listen to component selection
  useEffect(() => {
    if (!editor) return;

    const handleComponentSelected = (component: any) => {
      setSelectedComponent(component);
    };

    const handleComponentUpdate = () => {
      // Refresh if component is still selected
      const updated = editor.getSelected();
      if (updated && updated === selectedComponent) {
        setSelectedComponent(updated);
      }
    };

    editor.on('component:selected', handleComponentSelected);
    editor.on('component:update', handleComponentUpdate);
    editor.on('component:styleUpdate', handleComponentUpdate);

    // Set initial selection
    const initial = editor.getSelected();
    if (initial) {
      setSelectedComponent(initial);
    }

    return () => {
      editor.off('component:selected', handleComponentSelected);
      editor.off('component:update', handleComponentUpdate);
      editor.off('component:styleUpdate', handleComponentUpdate);
    };
  }, [editor]);

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
        {/* Link Section */}
        {filterSection('link', ['href', 'target']) && (
          <div className="properties-section">
            <SectionHeader
              title="Link"
              isExpanded={expandedSections.has('link')}
              onToggle={() => toggleSection('link')}
              isDark={isDark}
            />
            {expandedSections.has('link') && (
              <div className="properties-section-content">
                <div className="property-row">
                  <label className="property-label">Href</label>
                  <InputWithClear
                    value={getAttribute('href') || ''}
                    onChange={(value) => updateAttribute('href', value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Target</label>
                  <select
                    value={getAttribute('target') || '_self'}
                    onChange={(e) => updateAttribute('target', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Window</option>
                  </select>
                </div>
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
                  <InputWithClear
                    value={getStyleValue('font-family')}
                    onChange={(value) => updateStyle('font-family', value)}
                    placeholder="Poppins"
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Weight</label>
                  <InputWithClear
                    value={getStyleValue('font-weight')}
                    onChange={(value) => updateStyle('font-weight', value)}
                    placeholder="Bold"
                  />
                </div>
                <div className="property-row">
                  <label className="property-label">Size</label>
                  <InputWithClear
                    value={getStyleValue('font-size')}
                    onChange={(value) => updateStyle('font-size', value)}
                    placeholder="140px"
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
                      const url = prompt('Enter image URL:');
                      if (url) {
                        updateStyle('background-image', `url(${url})`);
                      }
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 transition-colors text-left"
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-600 border border-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Set Background</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

