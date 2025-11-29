'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import ReportGenerator from '@/app/_components/admin/ReportGenerator';
import { analyticsApi } from '@/lib/analyticsApi';

const ReportsPage: React.FC = () => {
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary">Analytics Reports</h1>
              <p className="mt-2 text-secondary">
                Generate comprehensive analytics reports from dashboard and analytics data. Download as PDF, CSV, or JSON.
              </p>
            </div>

            {/* Report Generator */}
            <div className="space-y-6">
              <ReportGenerator onReportGenerated={setGeneratedReport} />
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
};

export default ReportsPage;

