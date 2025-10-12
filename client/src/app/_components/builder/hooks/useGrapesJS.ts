import { useState, useRef, useCallback } from 'react';
import grapesjs from 'grapesjs';

export const useGrapesJS = () => {
  const editorRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeEditor = useCallback((editor: any) => {
    editorRef.current = editor;
    setIsInitialized(true);

    // Configure editor events
    editor.on('component:add', (component: any) => {
      console.log('Component added:', component);
    });

    editor.on('component:update', (component: any) => {
      console.log('Component updated:', component);
    });

    editor.on('component:remove', (component: any) => {
      console.log('Component removed:', component);
    });

    // Add custom commands
    editor.Commands.add('show-layers', {
      getRowEl(editor: any) {
        return editor.getContainer().closest('.editor-row');
      },
      getLayersEl(row: any) {
        return row.querySelector('.layers-container');
      },

      run(editor: any, sender: any) {
        const rowEl = this.getRowEl(editor);
        const layersEl = this.getLayersEl(rowEl);
        layersEl.style.display = '';
      },

      stop(editor: any, sender: any) {
        const rowEl = this.getRowEl(editor);
        const layersEl = this.getLayersEl(rowEl);
        layersEl.style.display = 'none';
      }
    });

    editor.Commands.add('show-styles', {
      getRowEl(editor: any) {
        return editor.getContainer().closest('.editor-row');
      },
      getStyleEl(row: any) {
        return row.querySelector('.styles-container');
      },

      run(editor: any, sender: any) {
        const rowEl = this.getRowEl(editor);
        const styleEl = this.getStyleEl(rowEl);
        styleEl.style.display = '';
      },

      stop(editor: any, sender: any) {
        const rowEl = this.getRowEl(editor);
        const styleEl = this.getStyleEl(rowEl);
        styleEl.style.display = 'none';
      }
    });

    editor.Commands.add('show-traits', {
      getRowEl(editor: any) {
        return editor.getContainer().closest('.editor-row');
      },
      getTraitsEl(row: any) {
        return row.querySelector('.traits-container');
      },

      run(editor: any, sender: any) {
        const rowEl = this.getRowEl(editor);
        const traitsEl = this.getTraitsEl(rowEl);
        traitsEl.style.display = '';
      },

      stop(editor: any, sender: any) {
        const rowEl = this.getRowEl(editor);
        const traitsEl = this.getTraitsEl(rowEl);
        traitsEl.style.display = 'none';
      }
    });

    // Add custom blocks
    editor.BlockManager.add('hero-section', {
      label: 'Hero Section',
      content: `
        <section class="hero-section" style="padding: 100px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
          <div class="container">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">Your Amazing Title</h1>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">Compelling subtitle that describes your value proposition</p>
            <button class="btn btn-primary" style="padding: 12px 30px; font-size: 1.1rem; border: none; border-radius: 5px; background: #007bff; color: white; cursor: pointer;">Get Started</button>
          </div>
        </section>
      `,
      category: 'Sections'
    });

    editor.BlockManager.add('about-section', {
      label: 'About Section',
      content: `
        <section class="about-section" style="padding: 80px 0; background: #f8f9fa;">
          <div class="container">
            <div class="row">
              <div class="col-md-6">
                <h2 style="margin-bottom: 1rem;">About Us</h2>
                <p style="margin-bottom: 1rem;">Tell your story and what makes you unique. This is where you can share your mission, values, and the people behind your brand.</p>
                <p>Add more details about your company, team, or personal journey that connects with your audience.</p>
              </div>
              <div class="col-md-6">
                <img src="https://via.placeholder.com/500x300" alt="About Us" style="width: 100%; height: auto; border-radius: 8px;">
              </div>
            </div>
          </div>
        </section>
      `,
      category: 'Sections'
    });

    editor.BlockManager.add('contact-section', {
      label: 'Contact Section',
      content: `
        <section class="contact-section" style="padding: 80px 0; background: #343a40; color: white;">
          <div class="container">
            <div class="row">
              <div class="col-md-6">
                <h2 style="margin-bottom: 1rem;">Get In Touch</h2>
                <p style="margin-bottom: 2rem;">Ready to work together? Let's start a conversation.</p>
                <div style="margin-bottom: 1rem;">
                  <strong>Email:</strong> hello@example.com
                </div>
                <div style="margin-bottom: 1rem;">
                  <strong>Phone:</strong> +1 (555) 123-4567
                </div>
                <div>
                  <strong>Address:</strong> 123 Main St, City, State 12345
                </div>
              </div>
              <div class="col-md-6">
                <form style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 8px;">
                  <div style="margin-bottom: 1rem;">
                    <input type="text" placeholder="Your Name" style="width: 100%; padding: 10px; border: none; border-radius: 4px;">
                  </div>
                  <div style="margin-bottom: 1rem;">
                    <input type="email" placeholder="Your Email" style="width: 100%; padding: 10px; border: none; border-radius: 4px;">
                  </div>
                  <div style="margin-bottom: 1rem;">
                    <textarea placeholder="Your Message" rows="4" style="width: 100%; padding: 10px; border: none; border-radius: 4px; resize: vertical;"></textarea>
                  </div>
                  <button type="submit" style="width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      `,
      category: 'Sections'
    });

    // Add AI-powered blocks
    editor.BlockManager.add('ai-content', {
      label: 'AI Generated Content',
      content: `
        <div class="ai-content-placeholder" style="padding: 2rem; border: 2px dashed #007bff; text-align: center; background: #f8f9fa; border-radius: 8px;">
          <p style="color: #007bff; margin-bottom: 1rem;">🤖 AI Content Placeholder</p>
          <p style="color: #6c757d;">Click to generate content with AI</p>
        </div>
      `,
      category: 'AI Blocks'
    });

  }, []);

  const destroyEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
      setIsInitialized(false);
    }
  }, []);

  const saveWebsite = useCallback(async (websiteData: any) => {
    if (!editorRef.current) return null;

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    
    return {
      ...websiteData,
      html_content: html,
      css_content: css
    };
  }, []);

  const loadWebsite = useCallback((html: string, css: string) => {
    if (!editorRef.current) return;

    editorRef.current.setComponents(html);
    editorRef.current.setStyle(css);
  }, []);

  const exportWebsite = useCallback(() => {
    if (!editorRef.current) return null;

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    
    return {
      html,
      css,
      fullHTML: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Website</title>
    <style>${css}</style>
</head>
<body>
    ${html}
</body>
</html>`
    };
  }, []);

  return {
    editor: editorRef.current,
    isInitialized,
    initializeEditor,
    destroyEditor,
    saveWebsite,
    loadWebsite,
    exportWebsite
  };
};








