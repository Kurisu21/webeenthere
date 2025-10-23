'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import UserProfile from '../../_components/ui/UserProfile';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <UserProfile />
        </MainContentWrapper>
      </div>
    </div>
  );
}
