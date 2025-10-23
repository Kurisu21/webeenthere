'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContent from '../../_components/layout/MainContent';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function UserMainPage() {
  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <MainContent />
        </MainContentWrapper>
      </div>
    </div>
  );
}
