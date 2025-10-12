'use client';

import React, { useRef, useEffect } from 'react';

interface BuilderCanvasProps {
  grapesEditor: React.MutableRefObject<any>;
  isLoading: boolean;
}

const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ grapesEditor, isLoading }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && grapesEditor.current) {
      // GrapesJS editor is already initialized, just ensure it's properly mounted
      console.log('✅ Canvas component mounted with existing editor');
    }
  }, [grapesEditor]);

  return (
    <div className="flex-1 relative">
      <div ref={editorRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white">Loading GrapesJS Builder...</p>
            <p className="text-gray-400 text-sm mt-2">Check console for detailed progress</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuilderCanvas;



