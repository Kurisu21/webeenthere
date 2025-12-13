'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../_components/auth/AuthContext';
import { API_ENDPOINTS, apiGet, apiPut, apiPost } from '../../../../lib/apiConfig';
import WebeenthereAIAssistant from '../../../_components/builder/ai-assistant/WebeenthereAIAssistant';
import type { Editor } from 'grapesjs';
import dynamic from 'next/dynamic';

// Dynamically import GrapesJS editor
const GrapesJSEditor = dynamic(
  () => import('../../../_components/builder/GrapesJSEditor'),
  { ssr: false }
);

export default function TestAIPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [websiteId, setWebsiteId] = useState<string>('56'); // Default test website ID
  const [currentWebsite, setCurrentWebsite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<Editor | null>(null);

  // Load website data
  useEffect(() => {
    if (websiteId) {
      loadWebsiteData();
    }
  }, [websiteId]);

  const loadWebsiteData = async () => {
    try {
      setIsLoading(true);
      const response = await apiGet(`${API_ENDPOINTS.WEBSITES}/${websiteId}`);
      
      if (response.success) {
        setCurrentWebsite(response.data);
      } else {
        console.error('Failed to load website:', response.message);
      }
    } catch (error) {
      console.error('Error loading website:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorInit = (editorInstance: Editor) => {
    setEditor(editorInstance);
    editorRef.current = editorInstance;

    // Wait for editor to be fully initialized before loading content
    const loadContent = async () => {
      // Wait a bit for editor to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if editor is ready
      if (!editorInstance) {
        console.warn('Editor instance is null');
        return;
      }
      
      // Try to access wrapper with retries
      let wrapper = null;
      for (let i = 0; i < 10; i++) {
        try {
          if (editorInstance.getWrapper && typeof editorInstance.getWrapper === 'function') {
            wrapper = editorInstance.getWrapper();
            if (wrapper) {
              break;
            }
          }
        } catch (e) {
          // Not ready yet
        }
        
        if (i < 9) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (!wrapper) {
        console.warn('Editor wrapper not available after waiting');
        return;
      }

      // Load content if available
      if (currentWebsite?.html_content) {
        try {
          const layout = JSON.parse(currentWebsite.html_content);
          if (layout.html) {
            try {
              editorInstance.setComponents(layout.html);
            } catch (e) {
              console.error('Error setting components:', e);
            }
          }
          if (layout.css) {
            try {
              editorInstance.setStyle(layout.css);
            } catch (e) {
              console.error('Error setting styles:', e);
            }
          }
        } catch (e) {
          // If not JSON, try as plain HTML
          if (currentWebsite.html_content) {
            try {
              editorInstance.setComponents(currentWebsite.html_content);
            } catch (e2) {
              console.error('Error setting plain HTML:', e2);
            }
          }
        }
      }

      // Load CSS if available
      if (currentWebsite?.css_content) {
        try {
          editorInstance.setStyle(currentWebsite.css_content);
        } catch (e) {
          console.error('Error setting CSS:', e);
        }
      }
    };
    
    loadContent();
  };

  // Brute force save - directly update HTML and save to database
  // Only update the canvas, don't reload the page or website data
  const handleBruteForceSave = async (html: string, css: string) => {
    if (!websiteId) return;

    try {
      console.log('[BruteForce] Saving directly to database...');
      console.log('[BruteForce] HTML length:', html.length);
      console.log('[BruteForce] CSS length:', css.length);

      const layout = JSON.stringify({ html, css });
      
      const response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, {
        html_content: layout,
        css_content: css,
      });

      if (response.success) {
        console.log('[BruteForce] ✅ Saved to database successfully');
        
        // Update editor canvas directly without reloading website data
        if (editorRef.current) {
          try {
            const editor = editorRef.current;
            
            console.log('[BruteForce] Updating canvas with new content...');
            
            // Update components and styles
            editor.setComponents(html);
            editor.setStyle(css);
            
            // Force canvas updates to show changes
            editor.trigger('component:update');
            editor.trigger('update');
            editor.trigger('canvas:update');
            
            // Force canvas to refresh visually
            const canvas = editor.Canvas;
            if (canvas) {
              // Trigger canvas refresh events
              editor.trigger('canvas:frame:load');
              
              // Force iframe refresh without reloading
              const frame = canvas.getFrameEl();
              if (frame && frame.contentWindow) {
                try {
                  frame.contentWindow.dispatchEvent(new Event('resize', { bubbles: true }));
                  frame.contentWindow.dispatchEvent(new Event('scroll', { bubbles: true }));
                } catch (e) {
                  // Cross-origin or other issue - ignore
                }
              }
            }
            
            console.log('[BruteForce] ✅ Canvas updated with new content');
          } catch (updateError: any) {
            console.warn('[BruteForce] Could not update canvas, but changes are saved:', updateError.message);
            // Don't throw - changes are saved to DB which is what matters
          }
        }
        
        return true;
      } else {
        throw new Error(response.message || 'Failed to save');
      }
    } catch (error) {
      console.error('[BruteForce] ❌ Save failed:', error);
      throw error;
    }
  };

  // Get HTML/CSS from editor
  const getHtml = () => {
    if (!editorRef.current) return '';
    
    try {
      // Build HTML from component model
      const buildHtmlFromComponent = (comp: any): string => {
        try {
          if (comp.toHTML && typeof comp.toHTML === 'function') {
            return comp.toHTML();
          }
          
          const tagName = comp.get('tagName') || 'div';
          const content = comp.get('content') || '';
          const attributes = comp.getAttributes() || {};
          const classes = comp.getClasses() || [];
          const styles = comp.getStyle() || {};
          
          let attrs = '';
          
          Object.keys(attributes).forEach(key => {
            if (key !== 'class' && key !== 'style' && key !== 'id') {
              const value = attributes[key];
              if (value !== null && value !== undefined && value !== '') {
                attrs += ` ${key}="${String(value).replace(/"/g, '&quot;')}"`;
              }
            }
          });
          
          const id = comp.getId();
          if (id) {
            attrs += ` id="${id}"`;
          }
          
          if (classes.length > 0) {
            attrs += ` class="${classes.join(' ')}"`;
          }
          
          if (Object.keys(styles).length > 0) {
            const styleStr = Object.keys(styles).map(key => {
              const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
              const value = styles[key];
              if (value !== null && value !== undefined && value !== '') {
                return `${cssKey}: ${value}`;
              }
              return null;
            }).filter(Boolean).join('; ');
            if (styleStr) {
              attrs += ` style="${styleStr}"`;
            }
          }
          
          const children = comp.components();
          let childrenHtml = '';
          if (children && children.length > 0) {
            childrenHtml = children.map((child: any) => buildHtmlFromComponent(child)).join('');
          }
          
          const innerContent = childrenHtml || content;
          const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'].includes(tagName.toLowerCase());
          if (selfClosing && !innerContent) {
            return `<${tagName}${attrs} />`;
          }
          
          return `<${tagName}${attrs}>${innerContent}</${tagName}>`;
        } catch (e) {
          return '';
        }
      };
      
      const components = editorRef.current.getComponents();
      const html = components.map((comp: any) => buildHtmlFromComponent(comp)).join('');
      return html || editorRef.current.getHtml();
    } catch (e) {
      return editorRef.current.getHtml();
    }
  };

  const getCss = () => {
    if (!editorRef.current) return '';
    return editorRef.current.getCss();
  };

  // Enhanced auto-save that uses brute force approach
  const handleAutoSave = async () => {
    if (!editorRef.current) {
      console.warn('[AutoSave] Editor not available');
      return;
    }
    
    try {
      // Get HTML and CSS - use editor methods directly if custom functions aren't available
      let html = '';
      let css = '';
      
      if (getHtml) {
        html = getHtml();
      } else if (editorRef.current.getHtml) {
        html = editorRef.current.getHtml();
      }
      
      if (getCss) {
        css = getCss();
      } else if (editorRef.current.getCss) {
        css = editorRef.current.getCss();
      }
      
      console.log('[AutoSave] Saving HTML length:', html.length, 'CSS length:', css.length);
      
      // Just save to database - don't try to reload editor
      await handleBruteForceSave(html, css);
    } catch (error: any) {
      console.error('[AutoSave] Failed:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading AI Test Page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Side - Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-white text-xl font-bold">AI Assistant Test - Canvas</h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={websiteId}
                onChange={(e) => setWebsiteId(e.target.value)}
                placeholder="Website ID"
                className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
              <button
                onClick={loadWebsiteData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload
              </button>
              <button
                onClick={() => router.push('/user/main')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative bg-white">
          <div className="absolute inset-0">
            <GrapesJSEditor onEditorInit={handleEditorInit} />
          </div>
        </div>
      </div>

      {/* Right Side - AI Assistant */}
      <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white text-lg font-semibold">AI Assistant</h2>
          <p className="text-gray-400 text-sm mt-1">Test page for AI assistant with direct save</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <WebeenthereAIAssistant
            editor={editor}
            isDark={true}
            websiteId={websiteId}
            onAutoSave={handleAutoSave}
            getHtml={getHtml}
            getCss={getCss}
          />
        </div>
      </div>
    </div>
  );
}

