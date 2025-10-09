'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the GrapesJS builder to avoid SSR issues
const GrapesJSBuilderClient = dynamic(
  () => import('./GrapesJSBuilderClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading GrapesJS Builder...</p>
        </div>
      </div>
    )
  }
);

interface GrapesJSBuilderProps {
  websiteId?: string;
  initialTemplate?: string;
}

const GrapesJSBuilder: React.FC<GrapesJSBuilderProps> = ({ 
  websiteId, 
  initialTemplate 
}) => {
  return (
    <GrapesJSBuilderClient 
      websiteId={websiteId} 
      initialTemplate={initialTemplate} 
    />
  );
};

export default GrapesJSBuilder;
