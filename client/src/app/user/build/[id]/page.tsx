'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import WebsiteBuilder from '../../../_components/builder/WebsiteBuilder';

export default function BuildWebsitePage() {
  const params = useParams();
  const websiteId = params.id as string;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <WebsiteBuilder websiteId={websiteId} />
    </div>
  );
}



