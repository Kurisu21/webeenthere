'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import AdminHosting from '../../_components/admin/AdminHosting';

export default function AdminHostingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <AdminHosting />
        </MainContentWrapper>
      </div>
    </div>
  );
}
