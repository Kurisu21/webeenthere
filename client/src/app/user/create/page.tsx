'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import WebsiteBuilder from '../../_components/builder/WebsiteBuilder';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function CreateWebsitePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <WebsiteBuilder />
        </MainContentWrapper>
      </div>
    </div>
  );
}
