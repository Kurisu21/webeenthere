import { useState, useCallback, useEffect } from 'react';
import type Editor from 'grapesjs';

export function useGrapesJS(editor: Editor | null) {
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
    return editor ? editor.getHtml() : '';
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
    return JSON.stringify({
      html: editor.getHtml(),
      css: editor.getCss(),
      components: editor.getComponents().toJSON(),
    });
  }, [editor]);

  const exportAsHtml = useCallback(() => {
    if (!editor) return '';
    const html = editor.getHtml();
    const css = editor.getCss();
    return `<style>${css}</style>${html}`;
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
  };
}
