'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/AuthContext';
import GrapesJSEditor from './GrapesJSEditor';
import { useGrapesJS } from './hooks/useGrapesJS';
import { API_ENDPOINTS, apiPut } from '../../../lib/apiConfig';
import LeftPanel from './LeftPanel';
import { PropertiesPanel } from './PropertiesPanel';
import WebeenthereAIAssistant from './ai-assistant/WebeenthereAIAssistant';
import PreviewModal from './PreviewModal';
import ImageLibrary from './ImageLibrary';
import './BuilderLayout.css';
import type { Editor } from 'grapesjs';

interface BuilderLayoutProps {
  websiteId: string;
  currentWebsite?: any;
}

export default function BuilderLayout({ websiteId, currentWebsite }: BuilderLayoutProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [editor, setEditor] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewCss, setPreviewCss] = useState('');
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [imageLibraryTarget, setImageLibraryTarget] = useState<{ component: any; editor: Editor } | null>(null);
  const editorRef = useRef<any>(null);
  
  // Get theme mode
  const themeMode = user?.theme_mode || 'light';
  const isDark = themeMode === 'dark';

  // GrapesJS utilities
  const { save, getHtml, getCss, getJson, exportAsHtml } = useGrapesJS(editor);

  // Listen for image library open events from canvas
  useEffect(() => {
    const handleOpenImageLibrary = (event: CustomEvent) => {
      const { component, editor: editorInstance } = event.detail;
      setImageLibraryTarget({ component, editor: editorInstance });
      setShowImageLibrary(true);
    };

    window.addEventListener('openImageLibrary', handleOpenImageLibrary as EventListener);
    return () => {
      window.removeEventListener('openImageLibrary', handleOpenImageLibrary as EventListener);
    };
  }, []);

  // Handle image selection from library
  const handleImageSelect = async (imageUrl: string) => {
    if (imageLibraryTarget && imageLibraryTarget.component && imageLibraryTarget.editor) {
      const component = imageLibraryTarget.component;
      const editorInstance = imageLibraryTarget.editor;
      
      // Ensure URL is properly formatted (should already be from ImageLibrary, but double-check)
      let formattedUrl = imageUrl;
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
        // Import getImageUrl logic if needed
        const { ENV_CONFIG } = await import('../../../lib/envConfig');
        const apiUrl = ENV_CONFIG.isLocal() 
          ? ENV_CONFIG.LOCAL_API_URL 
          : ENV_CONFIG.PRODUCTION_API_URL;
        
        if (imageUrl.startsWith('/api/media')) {
          formattedUrl = `${apiUrl}${imageUrl}`;
        } else if (imageUrl.startsWith('/uploads')) {
          formattedUrl = `${apiUrl}/api/media${imageUrl}`;
        } else if (imageUrl.startsWith('/')) {
          formattedUrl = `${apiUrl}${imageUrl}`;
        }
      }
      
      console.log('[ImagePlaceholder] Setting image URL:', { original: imageUrl, formatted: formattedUrl });
      
      // Set the src attribute with formatted URL
      component.set('src', formattedUrl);
      component.addAttributes({ src: formattedUrl });
      
      // Force view update with a small delay to ensure component is ready
      setTimeout(() => {
        const view = component.getView();
        if (view && view.render) {
          view.render();
        }
        
        // Also update the model's updateImage method directly
        if (component.updateImage && typeof component.updateImage === 'function') {
          component.updateImage();
        }
        
        // Trigger multiple update events to ensure visibility
        editorInstance.trigger('component:update');
        editorInstance.trigger('component:change:src');
        editorInstance.trigger('update');
        editorInstance.trigger('canvas:update');
        
        // Force canvas to refresh the specific component
        const canvas = editorInstance.Canvas;
        if (canvas) {
          const frame = canvas.getFrameEl();
          if (frame && frame.contentDocument) {
            // Find the component in the iframe and update it
            const componentEl = frame.contentDocument.querySelector(`[data-gjs-id="${component.getId()}"]`);
            if (componentEl) {
              const img = componentEl.querySelector('.image-placeholder-img');
              if (img && formattedUrl) {
                (img as HTMLImageElement).src = formattedUrl;
                componentEl.classList.add('has-image');
              }
            }
          }
        }
      }, 100);
    }
    setShowImageLibrary(false);
    setImageLibraryTarget(null);
  };

  // Initialize editor and load content
  useEffect(() => {
    if (editor) {
      editorRef.current = editor;

      // Load initial content if available
      if (currentWebsite?.html_content) {
        try {
          const layout = JSON.parse(currentWebsite.html_content);
          if (layout.html) {
            editor.setComponents(layout.html);
            
            // After loading, restore image placeholder components
            setTimeout(() => {
              const allComponents = editor.getComponents();
              const restoreImagePlaceholders = (comp: any) => {
                // Check if this is an image placeholder (has the class or contains image-placeholder-img)
                const attrs = comp.getAttributes();
                const classes = comp.getClasses();
                const isImagePlaceholder = 
                  attrs?.['data-gjs-type'] === 'image-placeholder' ||
                  classes?.includes('image-placeholder-container') ||
                  (comp.get('content') && comp.get('content').includes('image-placeholder-img'));
                
                if (isImagePlaceholder) {
                  // Ensure it's recognized as image-placeholder type
                  comp.set('type', 'image-placeholder');
                  
                  // Extract src from content if present
                  const content = comp.get('content') || '';
                  const srcMatch = content.match(/src=["']([^"']+)["']/);
                  if (srcMatch && srcMatch[1]) {
                    const extractedSrc = srcMatch[1];
                    if (!comp.get('src') || comp.get('src') !== extractedSrc) {
                      comp.set('src', extractedSrc);
                      comp.addAttributes({ src: extractedSrc });
                      // Trigger update
                      if (comp.updateImage && typeof comp.updateImage === 'function') {
                        setTimeout(() => comp.updateImage(), 100);
                      }
                    }
                  }
                }
                
                // Recursively check children
                const children = comp.components();
                if (children && children.length > 0) {
                  children.forEach((child: any) => restoreImagePlaceholders(child));
                }
              };
              
              allComponents.forEach((comp: any) => restoreImagePlaceholders(comp));
              
              // Trigger update
              editor.trigger('component:update');
              editor.trigger('update');
            }, 300);
          }
          if (layout.css) {
            editor.setStyle(layout.css);
          }
        } catch (e) {
          // If not JSON, try as plain HTML
          if (currentWebsite.html_content) {
            editor.setComponents(currentWebsite.html_content);
            
            // Also restore image placeholders for plain HTML
            setTimeout(() => {
              const allComponents = editor.getComponents();
              const restoreImagePlaceholders = (comp: any) => {
                const content = comp.get('content') || '';
                if (content.includes('image-placeholder-img')) {
                  comp.set('type', 'image-placeholder');
                  const srcMatch = content.match(/src=["']([^"']+)["']/);
                  if (srcMatch && srcMatch[1]) {
                    comp.set('src', srcMatch[1]);
                    comp.addAttributes({ src: srcMatch[1] });
                    if (comp.updateImage && typeof comp.updateImage === 'function') {
                      setTimeout(() => comp.updateImage(), 100);
                    }
                  }
                }
                const children = comp.components();
                if (children && children.length > 0) {
                  children.forEach((child: any) => restoreImagePlaceholders(child));
                }
              };
              allComponents.forEach((comp: any) => restoreImagePlaceholders(comp));
              editor.trigger('component:update');
              editor.trigger('update');
            }, 300);
          }
        }
      }
      
      // CRITICAL: Load CSS from css_content field (for seeded/manually coded sites)
      if (currentWebsite?.css_content) {
        const cssContent = currentWebsite.css_content;
        
        // Apply CSS to editor's style manager
        editor.setStyle(cssContent);
        
        // Inject CSS directly into canvas iframe head to ensure body/html styles work
        // This is necessary because GrapesJS's setStyle() may not properly apply body/html selectors
        const injectStylesIntoCanvas = () => {
          try {
            const canvas = editor.Canvas;
            const frame = canvas?.getFrameEl?.();
            
            if (frame && frame.contentDocument) {
              const frameDoc = frame.contentDocument;
              const frameHead = frameDoc.head || frameDoc.getElementsByTagName('head')[0];
              
              if (frameHead) {
                // Remove existing style tag if present
                const existingStyle = frameDoc.getElementById('website-template-styles');
                if (existingStyle) {
                  existingStyle.remove();
                }
                
                // Create and inject style tag into iframe head
                const styleTag = frameDoc.createElement('style');
                styleTag.id = 'website-template-styles';
                styleTag.textContent = cssContent;
                frameHead.appendChild(styleTag);
              }
            }
          } catch (error) {
            // Cross-origin or other iframe access issues - fallback to setStyle only
            console.warn('Could not inject styles into canvas iframe:', error);
          }
        };
        
        // Try immediately, then retry after delays to ensure canvas is ready
        injectStylesIntoCanvas();
        const timeout1 = setTimeout(injectStylesIntoCanvas, 300);
        const timeout2 = setTimeout(injectStylesIntoCanvas, 1000);
        
        // Listen for canvas frame load/reload events
        const handleFrameLoad = () => {
          injectStylesIntoCanvas();
        };
        editor.on('canvas:frame:load', handleFrameLoad);
        editor.on('canvas:update', handleFrameLoad);
        
        // Cleanup function
        return () => {
          clearTimeout(timeout1);
          clearTimeout(timeout2);
          editor.off('canvas:frame:load', handleFrameLoad);
          editor.off('canvas:update', handleFrameLoad);
        };
      }
    }
  }, [editor, currentWebsite]);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      // CRITICAL: Force GrapesJS to store current state
      // This ensures component.set() changes are persisted
      if (editor.store) {
        editor.store();
      }
      
      // CRITICAL: Trigger update events to ensure GrapesJS has processed all changes
      // This ensures that component.set() changes are reflected in getHtml() and getCss()
      editor.trigger('component:update');
      editor.trigger('update');
      editor.trigger('storage:store');
      
      // Wait longer for GrapesJS to process and store the updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get the latest HTML and CSS after updates are processed
      // Use getJson to get the full component structure, then extract HTML/CSS
      const jsonData = getJson();
      let html, css;
      
      if (jsonData) {
        try {
          const parsed = JSON.parse(jsonData);
          html = parsed.html || getHtml();
          css = parsed.css || getCss();
        } catch {
          html = getHtml();
          css = getCss();
        }
      } else {
        html = getHtml();
        css = getCss();
      }
      
      console.log('[Save] HTML length:', html.length, 'CSS length:', css.length);
      console.log('[Save] HTML preview:', html.substring(0, 200));
      
      // Debug: Check for image-placeholder components in saved HTML
      if (process.env.NODE_ENV === 'development') {
        const imagePlaceholderMatches = html.match(/<div[^>]*data-gjs-type=["']image-placeholder["'][^>]*>/gi);
        const imagePlaceholderImgMatches = html.match(/<img[^>]*class=["'][^"']*image-placeholder-img[^"']*["'][^>]*>/gi);
        console.log('[Save] Image placeholder divs found:', imagePlaceholderMatches?.length || 0);
        console.log('[Save] Image placeholder img tags found:', imagePlaceholderImgMatches?.length || 0);
        
        if (imagePlaceholderImgMatches) {
          imagePlaceholderImgMatches.forEach((match, idx) => {
            const hasSrc = match.includes('src=');
            console.log(`[Save] Image placeholder img ${idx + 1} has src:`, hasSrc, hasSrc ? match.match(/src=["']([^"']+)["']/)?.[1]?.substring(0, 50) : 'NO SRC');
          });
        }
      }
      
      // Parse existing content to compare
      let oldHtml = '';
      let oldCss = '';
      if (currentWebsite?.html_content) {
        try {
          const oldParsed = JSON.parse(currentWebsite.html_content);
          oldHtml = oldParsed.html || currentWebsite.html_content;
          oldCss = oldParsed.css || currentWebsite.css_content || '';
        } catch {
          oldHtml = currentWebsite.html_content;
          oldCss = currentWebsite.css_content || '';
        }
      }
      
      console.log('[Save] === COMPARISON ===');
      console.log('[Save] Old HTML length:', oldHtml.length);
      console.log('[Save] New HTML length:', html.length);
      console.log('[Save] HTML changed:', oldHtml !== html);
      if (oldHtml !== html) {
        console.log('[Save] Old HTML preview:', oldHtml.substring(0, 150));
        console.log('[Save] New HTML preview:', html.substring(0, 150));
      } else {
        console.warn('[Save] ⚠️ WARNING: HTML content is the same as before!');
      }
      console.log('[Save] ===================');
      
      const layout = JSON.stringify({ html, css });
      
      // Save both as separate strings for compatibility with view page
      // Add retry logic for connection errors
      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, {
            html_content: layout,
            css_content: css, // Save CSS separately for view page
          });
          break;
        } catch (error: any) {
          // Check if it's a connection error that we should retry
          if ((error.message?.includes('ECONNRESET') || error.message?.includes('network') || error.status === 500) && retries > 1) {
            console.warn(`[Save] Connection error, retrying... (${retries - 1} retries left)`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }
          throw error;
        }
      }
      
      if (response && response.success) {
        console.log('Website saved successfully');
        // Only show alert for manual saves (not auto-saves)
        // Auto-saves are handled by the AI Assistant component
      } else {
        throw new Error(response?.message || 'Failed to save website');
      }
    } catch (error) {
      console.error('Error saving website:', error);
      // Don't show error to user for connection issues - they're usually transient
      if (error instanceof Error && (error.message.includes('ECONNRESET') || error.message.includes('network'))) {
        console.warn('[Save] Connection error - changes may not have been saved. Please try saving again.');
      }
      // Re-throw error for auto-save to handle gracefully
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [editor, websiteId, getHtml, getCss]);

  const handlePublish = useCallback(async () => {
    if (!editor) return;
    
    try {
      // Get separate HTML and CSS for proper display on view page
      const html = getHtml();
      const css = getCss();
      
      const response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, {
        html_content: html, // Plain HTML for view page
        css_content: css,   // Plain CSS for view page  
        is_published: true,
      });
      
      if (response.success) {
        alert('Website published successfully!');
        // Open published site in new tab
        window.open(`/sites/${currentWebsite?.slug}`, '_blank');
      } else {
        throw new Error(response.message || 'Failed to publish website');
      }
    } catch (error) {
      console.error('Error publishing website:', error);
      alert('Failed to publish website. Please try again.');
    }
  }, [editor, websiteId, currentWebsite, getHtml, getCss]);

  const handleExit = useCallback(() => {
    if (confirm('Are you sure you want to exit? Any unsaved changes will be lost.')) {
      router.push('/user/main');
    }
  }, [router]);

  const handleEditorInit = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  const handleDeviceChange = useCallback((device: string) => {
    if (editor) {
      editor.setDevice(device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Mobile portrait');
      setActiveDevice(device);
    }
  }, [editor]);

  const handleUndo = useCallback(() => {
    editor?.runCommand('core:undo');
  }, [editor]);

  const handleRedo = useCallback(() => {
    editor?.runCommand('core:redo');
  }, [editor]);

  const handlePreview = useCallback(() => {
    if (!editor) return;
    
    // Force store current state
    editor.store();
    editor.trigger('component:update');
    editor.trigger('update');
    
    // Wait for updates to process
    setTimeout(() => {
      const html = getHtml();
      const css = getCss();
      setPreviewHtml(html);
      setPreviewCss(css);
      setShowPreview(true);
    }, 200);
  }, [editor, getHtml, getCss, setPreviewHtml, setPreviewCss, setShowPreview]);

  const handleCodeView = useCallback(() => {
    editor?.runCommand('export-template');
  }, [editor]);

  const handleFullscreen = useCallback(() => {
    editor?.runCommand('fullscreen');
  }, [editor]);

  const handleOutline = useCallback(() => {
    editor?.runCommand('sw-visibility');
  }, [editor]);

  const handleZoomIn = useCallback(() => {
    if (editor && zoomLevel < 200) {
      const newZoom = Math.min(zoomLevel + 10, 200);
      setZoomLevel(newZoom);
      const canvas = editor.Canvas;
      if (canvas) {
        canvas.setZoom(newZoom / 100);
      }
    }
  }, [editor, zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (editor && zoomLevel > 25) {
      const newZoom = Math.max(zoomLevel - 10, 25);
      setZoomLevel(newZoom);
      const canvas = editor.Canvas;
      if (canvas) {
        canvas.setZoom(newZoom / 100);
      }
    }
  }, [editor, zoomLevel]);

  const handleZoomReset = useCallback(() => {
    if (editor) {
      setZoomLevel(100);
      const canvas = editor.Canvas;
      if (canvas) {
        canvas.setZoom(1);
      }
    }
  }, [editor]);

  const handleToggleGrid = useCallback(() => {
    setShowGrid(!showGrid);
    // Grid overlay would be implemented via GrapesJS canvas styling
  }, [showGrid]);

  // Dynamic theme classes based on mode
  const bgPrimary = isDark ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const bgTertiary = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-800' : 'bg-white';
  const toolbarBtnClass = isDark
    ? 'px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors'
    : 'px-2 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors';
  const deviceBtnIdleClass = isDark
    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200';
  const deviceBtnActiveClass = 'bg-blue-600 text-white';

  return (
    <div data-theme={isDark ? 'dark' : 'light'} className={`flex flex-col h-screen ${bgPrimary}`}>
      {/* Top Toolbar */}
      <div className={`flex items-center justify-between px-4 py-3 ${bgSecondary} border-b ${borderColor} shadow-sm`}>
        {/* Left: Title and Exit */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExit}
            className={`px-3 py-2 ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2 rounded-md hover:bg-opacity-10`}
            title="Exit Builder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Exit</span>
          </button>
          <div className="h-6 w-px bg-gray-400 opacity-30"></div>
          <h2 className={`${textPrimary} font-semibold text-lg flex items-center gap-2`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {currentWebsite?.title || 'Building Website'}
          </h2>
        </div>
        
        {/* Center: Device Preview Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleDeviceChange('desktop')}
            className={`px-3 py-2 rounded-md transition-colors ${activeDevice === 'desktop' ? deviceBtnActiveClass : deviceBtnIdleClass}`}
            title="Desktop"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeviceChange('tablet')}
            className={`px-3 py-2 rounded-md transition-colors ${activeDevice === 'tablet' ? deviceBtnActiveClass : deviceBtnIdleClass}`}
            title="Tablet"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeviceChange('mobile')}
            className={`px-3 py-2 rounded-md transition-colors ${activeDevice === 'mobile' ? deviceBtnActiveClass : deviceBtnIdleClass}`}
            title="Mobile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        
        {/* Right: Toolbar Controls and Actions */}
        <div className="flex items-center space-x-2">
          {/* Toolbar Controls */}
          <div className={`flex items-center space-x-1 px-2 border-r ${borderColor}`}>
            <button
              onClick={handleUndo}
              className={toolbarBtnClass}
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={handleRedo}
              className={toolbarBtnClass}
              title="Redo (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m12-2l-6-6m6 6l-6 6" />
              </svg>
            </button>
          </div>

          {/* View Buttons */}
          <div className={`flex items-center space-x-1 px-2 border-r ${borderColor}`}>
            <button
              onClick={handlePreview}
              className={toolbarBtnClass}
              title="Preview"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={handleCodeView}
              className={toolbarBtnClass}
              title="View Code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
            <button
              onClick={handleFullscreen}
              className={toolbarBtnClass}
              title="Fullscreen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={handleOutline}
              className={toolbarBtnClass}
              title="Toggle Outlines"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden sm:inline">Publish</span>
          </button>
        </div>
      </div>

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Navigator & Blocks */}
        <LeftPanel isDark={isDark} editor={editor} />

        {/* Center Panel - Design Canvas */}
        <div className={`flex-1 flex flex-col ${bgPrimary} relative`}>
          <div className="flex-1 gjs-editor-parent relative">
            <GrapesJSEditor onEditorInit={handleEditorInit} />
          </div>
          
          {/* Canvas Controls */}
          <div className={`canvas-controls absolute bottom-4 right-4 flex items-center gap-2 ${bgSecondary} ${borderColor} border rounded-lg px-2 py-1 shadow-lg`}>
            <button
              onClick={handleZoomOut}
              className={`${toolbarBtnClass} text-sm`}
              title="Zoom Out"
              disabled={zoomLevel <= 25}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className={`${textPrimary} text-sm font-medium min-w-[3rem] text-center`}>
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className={`${toolbarBtnClass} text-sm`}
              title="Zoom In"
              disabled={zoomLevel >= 200}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            <div className="h-4 w-px bg-gray-400 opacity-30 mx-1"></div>
            <button
              onClick={handleZoomReset}
              className={`${toolbarBtnClass} text-sm`}
              title="Reset Zoom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="h-4 w-px bg-gray-400 opacity-30 mx-1"></div>
            <button
              onClick={handleToggleGrid}
              className={`${toolbarBtnClass} text-sm ${showGrid ? 'bg-blue-600 text-white' : ''}`}
              title="Toggle Grid"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Panel - Properties Inspector */}
        <div className={`right-panel w-80 ${bgSecondary} border-l ${borderColor} flex flex-col overflow-hidden`}>
          <PropertiesPanel editor={editor} isDark={isDark} websiteId={websiteId} />
          {/* Hidden containers for GrapesJS to attach to (but UI is hidden) */}
          <div className="styles-container" style={{ display: 'none' }} />
          <div className="traits-container" style={{ display: 'none' }} />
        </div>
      </div>

      {/* AI Assistant Component */}
      <WebeenthereAIAssistant 
        editor={editor} 
        isDark={isDark} 
        websiteId={websiteId}
        onAutoSave={handleSave}
        onPreview={handlePreview}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        html={previewHtml}
        css={previewCss}
        isDark={isDark}
      />

      {/* Image Library Modal */}
      <ImageLibrary
        isOpen={showImageLibrary}
        onClose={() => {
          setShowImageLibrary(false);
          setImageLibraryTarget(null);
        }}
        onSelectImage={handleImageSelect}
        websiteId={websiteId}
        isDark={isDark}
      />
    </div>
  );
}

