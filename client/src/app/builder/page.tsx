'use client';

import React, { useState, Suspense } from 'react';
import WebsiteBuilder from '../_components/builder/WebsiteBuilder';

function BuilderPageContent() {
  const [currentWebsite, setCurrentWebsite] = useState(null);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <WebsiteBuilder currentWebsite={currentWebsite} />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
      <BuilderPageContent />
    </Suspense>
  );
}