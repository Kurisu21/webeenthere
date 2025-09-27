'use client';

import React, { useState } from 'react';
import WebsiteBuilder from '../_components/builder/WebsiteBuilder';

export default function BuilderPage() {
  const [currentWebsite, setCurrentWebsite] = useState(null);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <WebsiteBuilder currentWebsite={currentWebsite} />
    </div>
  );
}