'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Template } from '../../_data/templates-simple';

interface GrapesJSComponentProps {
  template?: Template;
  onSave?: (html: string, css: string) => void;
  onCancel?: () => void;
}

const GrapesJSComponent = ({ template, onSave, onCancel }: GrapesJSComponentProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editorRef.current || typeof window === 'undefined') return;

    const initEditor = async () => {
      try {
        console.log('🚀 Starting editor...');
        
        // Import GrapeJS
        const grapesjs = (await import('grapesjs')).default;
        console.log('✅ GrapeJS loaded');
        
        // CSS will be loaded by Next.js
        console.log('✅ CSS loaded');

        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        const editorInstance = grapesjs.init({
          container: editorRef.current!,
          height: '100%',
          width: '100%',
          
          // Minimal configuration
          plugins: [],
          pluginsOpts: {},
          
          // Block manager
          blockManager: {
            appendTo: '.blocks-container',
            blocks: [
              {
                id: 'text',
                label: 'Text',
                content: '<div style="padding: 20px;"><h2>Your Heading</h2><p>Your text content goes here. Click to edit.</p></div>',
                category: 'Content'
              },
              {
                id: 'image',
                label: 'Image',
                content: '<div style="padding: 20px;"><img src="https://via.placeholder.com/400x300" alt="Image" style="max-width: 100%; height: auto;"></div>',
                category: 'Content'
              },
              {
                id: 'button',
                label: 'Button',
                content: '<div style="padding: 20px;"><button style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Click Me</button></div>',
                category: 'Content'
              }
            ]
          },
          
          // Layer manager
          layerManager: {
            appendTo: '.layers-container',
          },
          
          // Trait manager
          traitManager: {
            appendTo: '.traits-container',
          },
          
          // Selector manager
          selectorManager: {
            appendTo: '.styles-container',
          },
          
          // Panels
          panels: {
            defaults: [
              {
                id: 'layers',
                el: '.panel__right',
                resizable: {
                  maxDim: 350,
                  minDim: 200,
                  tc: false,
                  cl: true,
                  cr: false,
                  bc: false,
                  keyWidth: 'flex-basis',
                },
              },
              {
                id: 'panel-switcher',
                el: '.panel__switcher',
                buttons: [
                  {
                    id: 'show-layers',
                    active: true,
                    label: 'Layers',
                    command: 'show-layers',
                    togglable: false,
                  },
                  {
                    id: 'show-style',
                    active: true,
                    label: 'Styles',
                    command: 'show-styles',
                    togglable: false,
                  },
                  {
                    id: 'show-traits',
                    active: true,
                    label: 'Settings',
                    command: 'show-traits',
                    togglable: false,
                  },
                ],
              },
              {
                id: 'panel-devices',
                el: '.panel__devices',
                buttons: [
                  {
                    id: 'device-desktop',
                    label: 'Desktop',
                    command: 'set-device-desktop',
                    active: true,
                    togglable: false,
                  },
                  {
                    id: 'device-tablet',
                    label: 'Tablet',
                    command: 'set-device-tablet',
                    togglable: false,
                  },
                  {
                    id: 'device-mobile',
                    label: 'Mobile',
                    command: 'set-device-mobile',
                    togglable: false,
                  },
                ],
              },
            ],
          },
          
          // Device manager
          deviceManager: {
            devices: [
              {
                name: 'Desktop',
                width: '',
              },
              {
                name: 'Tablet',
                width: '768px',
                widthMedia: '992px',
              },
              {
                name: 'Mobile',
                width: '320px',
                widthMedia: '768px',
              },
            ],
          },
        });

        console.log('✅ Editor instance created');

        // Add commands
        editorInstance.Commands.add('show-layers', {
          getRowEl(editor: any) { return editor.getContainer().closest('.editor-row'); },
          getLayersEl(row: any) { return row.querySelector('.layers-container'); },
          run(editor: any, sender: any) {
            const rowEl = this.getRowEl(editor);
            const layersEl = this.getLayersEl(rowEl);
            if (layersEl) layersEl.style.display = '';
          },
          stop(editor: any, sender: any) {
            const rowEl = this.getRowEl(editor);
            const layersEl = this.getLayersEl(rowEl);
            if (layersEl) layersEl.style.display = 'none';
          },
        });

        editorInstance.Commands.add('show-styles', {
          getRowEl(editor: any) { return editor.getContainer().closest('.editor-row'); },
          getStyleEl(row: any) { return row.querySelector('.styles-container'); },
          run(editor: any, sender: any) {
            const rowEl = this.getRowEl(editor);
            const styleEl = this.getStyleEl(rowEl);
            if (styleEl) styleEl.style.display = '';
          },
          stop(editor: any, sender: any) {
            const rowEl = this.getRowEl(editor);
            const styleEl = this.getStyleEl(rowEl);
            if (styleEl) styleEl.style.display = 'none';
          },
        });

        editorInstance.Commands.add('show-traits', {
          getRowEl(editor: any) { return editor.getContainer().closest('.editor-row'); },
          getTraitsEl(row: any) { return row.querySelector('.traits-container'); },
          run(editor: any, sender: any) {
            const rowEl = this.getRowEl(editor);
            const traitsEl = this.getTraitsEl(rowEl);
            if (traitsEl) traitsEl.style.display = '';
          },
          stop(editor: any, sender: any) {
            const rowEl = this.getRowEl(editor);
            const traitsEl = this.getTraitsEl(rowEl);
            if (traitsEl) traitsEl.style.display = 'none';
          },
        });

        // Device commands
        editorInstance.Commands.add('set-device-desktop', {
          run: (editor: any) => editor.setDevice('Desktop')
        });
        editorInstance.Commands.add('set-device-tablet', {
          run: (editor: any) => editor.setDevice('Tablet')
        });
        editorInstance.Commands.add('set-device-mobile', {
          run: (editor: any) => editor.setDevice('Mobile')
        });

        console.log('✅ Commands added');

        // Load template if provided
        if (template) {
          console.log('📄 Loading template:', template.name);
          editorInstance.setComponents(template.html_base);
          editorInstance.setStyle(template.css_base);
          console.log('✅ Template loaded');
        }

        // Force render
        setTimeout(() => {
          setEditor(editorInstance);
          setIsLoading(false);
          console.log('🎉 Editor ready!');
        }, 200);

      } catch (err) {
        console.error('❌ Error:', err);
        setError(`Failed to load: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    initEditor();

    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [template]);

  const handleSave = () => {
    if (editor && onSave) {
      const html = editor.getHtml();
      const css = editor.getCss();
      onSave(html, css);
    }
  };

  const handlePreview = () => {
    if (editor) {
      const html = editor.getHtml();
      const css = editor.getCss();
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Preview</title>
              <style>${css}</style>
            </head>
            <body>${html}</body>
          </html>
        `);
        previewWindow.document.close();
      }
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-400 text-center max-w-md">
          <div className="text-lg font-semibold mb-2">❌ Error</div>
          <div className="text-sm mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-lg font-semibold">Loading Editor</div>
          <div className="text-sm text-gray-400 mt-2">Setting up interface...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Top Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-semibold">🎨 Website Builder</h2>
          <div className="panel__devices"></div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreview}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            👁️ Preview
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            💾 Save
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex-1 flex editor-row">
        {/* Left Sidebar - Blocks */}
        <div className="w-64 bg-gray-800 border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-medium">🧱 Blocks</h3>
            <p className="text-gray-400 text-xs mt-1">Drag to canvas</p>
          </div>
          <div className="blocks-container h-full overflow-y-auto"></div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative bg-white">
          <div ref={editorRef} className="h-full"></div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <div className="panel__switcher"></div>
          <div className="layers-container"></div>
          <div className="styles-container"></div>
          <div className="traits-container"></div>
        </div>
      </div>
    </div>
  );
};

export default GrapesJSComponent;