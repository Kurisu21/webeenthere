'use client';

import React, { useEffect, useRef, useState } from 'react';

const GrapesJSBuilderDebug: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log('DEBUG:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo('Component mounted');
    
    const initGrapesJS = async () => {
      try {
        addDebugInfo('Starting GrapesJS initialization...');
        
        // Check if we're in browser
        if (typeof window === 'undefined') {
          addDebugInfo('Not in browser environment');
          setError('Not in browser environment');
          setIsLoading(false);
          return;
        }

        addDebugInfo('Browser environment confirmed');

        // Check if container exists
        if (!editorRef.current) {
          addDebugInfo('Editor container not found');
          setError('Editor container not found');
          setIsLoading(false);
          return;
        }

        addDebugInfo('Editor container found');

        // Dynamic import
        addDebugInfo('Importing GrapesJS...');
        const grapesjs = (await import('grapesjs')).default;
        addDebugInfo('GrapesJS imported successfully');

        console.log('GrapesJS version:', grapesjs.version || 'unknown');
        
        addDebugInfo('Initializing GrapesJS editor...');
        
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

        addDebugInfo('GrapesJS editor initialized');

        // Add basic blocks
        addDebugInfo('Adding blocks...');
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

        addDebugInfo('Blocks added successfully');

        // Set initial content
        addDebugInfo('Setting initial content...');
        editor.setComponents('<div style="padding: 20px;"><h1>Welcome to GrapesJS!</h1><p>Drag blocks from the left panel to build your website.</p></div>');
        addDebugInfo('Initial content set');

        addDebugInfo('GrapesJS setup complete - setting loading to false');
        setIsLoading(false);
        addDebugInfo('Component ready');

      } catch (err) {
        console.error('GrapesJS initialization error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        addDebugInfo(`Error: ${errorMessage}`);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    addDebugInfo('Setting timeout for initialization...');
    const timer = setTimeout(() => {
      addDebugInfo('Timeout triggered - starting initialization');
      initGrapesJS();
    }, 100);

    return () => {
      addDebugInfo('Cleanup - clearing timeout');
      clearTimeout(timer);
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-2xl">
          <div className="text-red-400 text-xl mb-4">❌ Error</div>
          <p className="text-white mb-4">Failed to load GrapesJS Builder</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          
          <div className="text-left bg-gray-800 p-4 rounded mb-4">
            <h4 className="text-white font-semibold mb-2">Debug Log:</h4>
            <div className="text-gray-300 text-xs max-h-40 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="mb-1">{info}</div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
        <div className="text-center max-w-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading GrapesJS Builder...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing editor...</p>
          
          <div className="text-left bg-gray-800 p-4 rounded mt-4">
            <h4 className="text-white font-semibold mb-2">Debug Log:</h4>
            <div className="text-gray-300 text-xs max-h-40 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="mb-1">{info}</div>
              ))}
            </div>
          </div>
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
          
          <div className="mt-4 text-left bg-gray-700 p-3 rounded">
            <h4 className="text-white font-semibold mb-2 text-xs">Debug Log:</h4>
            <div className="text-gray-300 text-xs max-h-32 overflow-y-auto">
              {debugInfo.slice(-10).map((info, index) => (
                <div key={index} className="mb-1">{info}</div>
              ))}
            </div>
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

export default GrapesJSBuilderDebug;






