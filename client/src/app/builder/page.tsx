'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the GrapesJS builder to avoid SSR issues
const GrapesJSBuilder = dynamic(
  () => import('../_components/builder/GrapesJSBuilder'),
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

function BuilderPageContent() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <GrapesJSBuilder />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-white">Loading GrapesJS Builder...</p>
      </div>
    </div>}>
      <BuilderPageContent />
    </Suspense>
  );
}