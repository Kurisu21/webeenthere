'use client';

import React, { useEffect, useRef, useState } from 'react';

const GrapesJSBuilderMinimal: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initGrapesJS = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const grapesjs = (await import('grapesjs')).default;
        
        if (!editorRef.current) {
          setError('Editor container not found');
          setIsLoading(false);
          return;
        }

        console.log('Initializing GrapesJS...');
        
        const editor = grapesjs.init({
          container: editorRef.current,
          height: '100vh',
          width: '100%',
          storageManager: false,
          plugins: [],
          canvas: {
            styles: []
          }
        });

        console.log('GrapesJS initialized successfully');

        // Add basic blocks
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

        // Set initial content
        editor.setComponents('<div style="padding: 20px;"><h1>Welcome to GrapesJS!</h1><p>Drag blocks from the left panel to build your website.</p></div>');

        setIsLoading(false);
        console.log('GrapesJS setup complete');

      } catch (err) {
        console.error('GrapesJS initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initGrapesJS, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Error</div>
          <p className="text-white mb-4">Failed to load GrapesJS Builder</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading GrapesJS Builder...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">GrapesJS Builder</h3>
          <p className="text-gray-400 text-sm mt-1">Drag blocks to build your website</p>
        </div>
        
        <div className="p-4">
          <div className="text-gray-300 text-sm">
            <p>✅ GrapesJS loaded successfully!</p>
            <p className="mt-2">Blocks are available in the editor.</p>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <span className="text-white font-medium">Website Builder</span>
        </div>

        {/* GrapesJS Editor */}
        <div className="flex-1 relative">
          <div ref={editorRef} className="w-full h-full" />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4">
          <h3 className="text-white font-semibold">Properties</h3>
          <p className="text-gray-400 text-sm mt-1">Select a component to edit its properties</p>
        </div>
      </div>
    </div>
  );
};

export default GrapesJSBuilderMinimal;
