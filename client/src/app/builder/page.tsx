'use client';

import React, { useState } from 'react';
import DashboardHeader from '../_components/layout/DashboardHeader';
import DashboardSidebar from '../_components/layout/DashboardSidebar';
import MainContentWrapper from '../_components/layout/MainContentWrapper';
import WebsiteBuilder from '../_components/builder/WebsiteBuilder';

export default function PageBuilder() {
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <WebsiteBuilder currentWebsite={null} />
        </MainContentWrapper>
      </div>
    </div>
  );
}






