'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './styles/grapesjs-custom.css';

interface GrapesJSBuilderSimpleProps {
  websiteId?: string;
  initialTemplate?: string;
}

const GrapesJSBuilderSimple: React.FC<GrapesJSBuilderSimpleProps> = ({ 
  websiteId, 
  initialTemplate 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const grapesEditor = useRef<any>(null);
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [websiteData, setWebsiteData] = useState({
    title: 'My Website',
    slug: 'my-website',
    description: ''
  });

  // Initialize GrapesJS editor
  useEffect(() => {
    if (editorRef.current && !grapesEditor.current) {
      const editor = grapesjs.init({
        container: editorRef.current,
        height: '100vh',
        width: '100%',
        storageManager: false,
        plugins: [], // Start with no plugins
        canvas: {
          styles: [
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
          ]
        }
      });

      grapesEditor.current = editor;

      // Add some basic blocks
      editor.BlockManager.add('text', {
        label: 'Text',
        content: '<p>Insert your text here</p>',
        category: 'Basic'
      });

      editor.BlockManager.add('image', {
        label: 'Image',
        content: '<img src="https://via.placeholder.com/350x250" alt="Image"/>',
        category: 'Basic'
      });

      editor.BlockManager.add('button', {
        label: 'Button',
        content: '<button class="btn btn-primary">Click me</button>',
        category: 'Basic'
      });

      editor.BlockManager.add('hero-section', {
        label: 'Hero Section',
        content: `
          <section style="padding: 100px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
            <div class="container">
              <h1 style="font-size: 3rem; margin-bottom: 1rem;">Your Amazing Title</h1>
              <p style="font-size: 1.2rem; margin-bottom: 2rem;">Compelling subtitle that describes your value proposition</p>
              <button style="padding: 12px 30px; font-size: 1.1rem; border: none; border-radius: 5px; background: #007bff; color: white; cursor: pointer;">Get Started</button>
            </div>
          </section>
        `,
        category: 'Sections'
      });

      // Load default content
      const defaultHTML = `
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
          <div class="row">
            <div class="col-md-12">
              <h1>Welcome to Your Website</h1>
              <p>Start building your amazing website with GrapesJS!</p>
            </div>
          </div>
        </div>
      `;
      
      editor.setComponents(defaultHTML);

      setIsLoading(false);
    }

    return () => {
      if (grapesEditor.current) {
        grapesEditor.current.destroy();
        grapesEditor.current = null;
      }
    };
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!grapesEditor.current) return;

    setIsSaving(true);
    try {
      const html = grapesEditor.current.getHtml();
      const css = grapesEditor.current.getCss();
      
      console.log('HTML:', html);
      console.log('CSS:', css);
      
      alert('Website saved! Check console for HTML/CSS output.');
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Error saving website. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle export
  const handleExport = () => {
    if (!grapesEditor.current) return;

    const html = grapesEditor.current.getHtml();
    const css = grapesEditor.current.getCss();
    
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${websiteData.title}</title>
    <style>${css}</style>
</head>
<body>
    ${html}
</body>
</html>`;

    // Create and download file
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${websiteData.slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading GrapesJS Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Website
                </>
              )}
            </button>

            <button
              onClick={handleExport}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export HTML
            </button>

            <button
              onClick={() => router.back()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Blocks Panel */}
        <div className="p-4">
          <h3 className="text-white font-semibold mb-3">Blocks</h3>
          <div className="space-y-2">
            <div className="text-gray-300 text-sm">Drag blocks to the canvas to build your website</div>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Panel */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <div className="flex items-center space-x-4">
            <span className="text-white font-medium">
              {websiteData.title}
            </span>
          </div>
        </div>

        {/* GrapesJS Editor */}
        <div className="flex-1 relative">
          <div ref={editorRef} className="w-full h-full" />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Properties Panel */}
        <div className="p-4">
          <h3 className="text-white font-semibold mb-3">Properties</h3>
          <div className="text-gray-300 text-sm">
            Select a component to edit its properties
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrapesJSBuilderSimple;
