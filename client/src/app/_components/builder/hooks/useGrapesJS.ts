import { useState, useCallback, useEffect } from 'react';

type GrapesEditorLike = {
  trigger: (event: string) => void;
  setComponents: (components: any) => void;
  setStyle: (style: any) => void;
  getHtml: () => string;
  getCss: () => string;
  getComponents: () => { toJSON: () => any };
};

export function useGrapesJS(editor: GrapesEditorLike | null) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (editor) {
      setIsReady(true);
    }
  }, [editor]);

  const save = useCallback(() => {
    if (editor) {
      editor.trigger('save');
    }
  }, [editor]);

  const load = useCallback((content: string) => {
    if (editor && content) {
      try {
        const data = JSON.parse(content);
        if (data.html || data.components) {
          editor.setComponents(data.html || data.components);
          if (data.css) {
            editor.setStyle(data.css);
          }
        } else if (typeof content === 'string' && !content.startsWith('{')) {
          // If it's plain HTML
          editor.setComponents(content);
        }
      } catch (e) {
        console.error('Failed to load content:', e);
        if (content) {
          editor.setComponents(content);
        }
      }
    }
  }, [editor]);

  const getHtml = useCallback(() => {
    if (!editor) return '';
    
    // CRITICAL: Build HTML directly from component model data
    // This ensures we get the current state after component.set() calls
    // editor.getHtml() might return cached HTML that doesn't reflect changes
    try {
      // Function to build HTML from component data model
      const buildHtmlFromComponent = (comp: any): string => {
        try {
          // Check if component has custom toHTML method (for image-placeholder, etc.)
          if (comp.toHTML && typeof comp.toHTML === 'function') {
            try {
              const html = comp.toHTML();
              if (process.env.NODE_ENV === 'development') {
                const compType = comp.getAttributes()?.['data-gjs-type'] || comp.get('type') || 'unknown';
                console.log(`[useGrapesJS] Using custom toHTML for component type: ${compType}`, html.substring(0, 150));
              }
              return html;
            } catch (e) {
              console.warn('[useGrapesJS] Error calling component.toHTML():', e);
              // Fall through to default behavior
            }
          }
          
          const tagName = comp.get('tagName') || 'div';
          const content = comp.get('content') || '';
          const attributes = comp.getAttributes() || {};
          const classes = comp.getClasses() || [];
          const styles = comp.getStyle() || {};
          
          // Build attributes string
          let attrs = '';
          
          // Add regular attributes (excluding class and style which we handle separately)
          Object.keys(attributes).forEach(key => {
            if (key !== 'class' && key !== 'style' && key !== 'id') {
              const value = attributes[key];
              if (value !== null && value !== undefined && value !== '') {
                attrs += ` ${key}="${String(value).replace(/"/g, '&quot;')}"`;
              }
            }
          });
          
          // Add ID if present
          const id = comp.getId();
          if (id) {
            attrs += ` id="${id}"`;
          }
          
          // Add classes
          if (classes.length > 0) {
            attrs += ` class="${classes.join(' ')}"`;
          }
          
          // Add inline styles - CRITICAL: Always include styles as inline for links
          // This ensures custom link colors and text-decoration are preserved
          if (Object.keys(styles).length > 0) {
            const styleStr = Object.keys(styles).map(key => {
              // Convert camelCase to kebab-case
              const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
              const value = styles[key];
              // Ensure values are properly formatted
              if (value !== null && value !== undefined && value !== '') {
                return `${cssKey}: ${value}`;
              }
              return null;
            }).filter(Boolean).join('; ');
            if (styleStr) {
              attrs += ` style="${styleStr}"`;
            }
          }
          
          // For link elements, also check if there are styles in the DOM element
          // This is a fallback to ensure styles are preserved
          if (tagName.toLowerCase() === 'a') {
            try {
              const view = comp.getView();
              if (view && view.el) {
                const domStyle = (view.el as HTMLElement).getAttribute('style');
                if (domStyle && domStyle.trim() !== '') {
                  // Merge DOM styles with component styles
                  const existingStyle = attrs.match(/style="([^"]*)"/);
                  if (existingStyle) {
                    // Merge styles
                    const mergedStyle = `${existingStyle[1]}; ${domStyle}`;
                    attrs = attrs.replace(/style="[^"]*"/, `style="${mergedStyle}"`);
                  } else {
                    // Add DOM style if no component style exists
                    attrs += ` style="${domStyle}"`;
                  }
                }
              }
            } catch (e) {
              // Ignore errors
            }
          }
          
          // Get children HTML recursively
          const children = comp.components();
          let childrenHtml = '';
          if (children && children.length > 0) {
            childrenHtml = children.map((child: any) => buildHtmlFromComponent(child)).join('');
          }
          
          // Use children HTML if available, otherwise use content
          const innerContent = childrenHtml || content;
          
          // Self-closing tags
          const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'].includes(tagName.toLowerCase());
          if (selfClosing && !innerContent) {
            return `<${tagName}${attrs} />`;
          }
          
          return `<${tagName}${attrs}>${innerContent}</${tagName}>`;
        } catch (e) {
          console.warn('[useGrapesJS] Error building HTML from component:', e);
          return '';
        }
      };
      
      // Build HTML from all root components
      const components = editor.getComponents();
      const htmlFromModel = components.map((comp: any) => buildHtmlFromComponent(comp)).join('');
      
      // Also trigger updates for visual consistency
      editor.trigger('component:update');
      editor.trigger('update');
      
      if (htmlFromModel && htmlFromModel.length > 0) {
        console.log('[useGrapesJS] Built HTML from component model, length:', htmlFromModel.length);
        return htmlFromModel;
      }
      
      // Fallback to editor.getHtml() if building from model failed
      console.warn('[useGrapesJS] Could not build HTML from model, using editor.getHtml()');
      return editor.getHtml();
    } catch (e) {
      console.warn('[useGrapesJS] Error building HTML, using getHtml() fallback:', e);
      return editor.getHtml();
    }
  }, [editor]);

  const getCss = useCallback(() => {
    if (!editor) return '';
    
    // Get CSS from editor's style manager
    const css = editor.getCss();
    
    // GrapesJS automatically stores CSS from inline styles in the style manager
    // editor.getCss() returns all styles including those from inline attributes
    return css;
  }, [editor]);

  const getJson = useCallback(() => {
    if (!editor) return null;
    // Use our custom getHtml to ensure toHTML methods are called
    // Note: getHtml is defined above, so we can reference it
    const html = getHtml();
    return JSON.stringify({
      html: html,
      css: editor.getCss(),
      components: editor.getComponents().toJSON(),
    });
  }, [editor, getHtml]);

  const exportAsHtml = useCallback(() => {
    if (!editor) return '';
    const html = editor.getHtml();
    const css = editor.getCss();
    return `<style>${css}</style>${html}`;
  }, [editor]);

  const applyHtmlCss = useCallback((payload: { html?: string; css?: string }) => {
    if (!editor || !payload) return;
    const { html, css } = payload;
    if (typeof html === 'string' && html.length > 0) {
      editor.setComponents(html);
    }
    if (typeof css === 'string') {
      editor.setStyle(css);
    }
  }, [editor]);

  return {
    editor,
    isReady,
    save,
    load,
    getHtml,
    getCss,
    getJson,
    exportAsHtml,
    applyHtmlCss,
  };
}
