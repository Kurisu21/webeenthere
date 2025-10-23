'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import ReportGenerator from '@/app/_components/admin/ReportGenerator';
import ReportTemplates from '@/app/_components/admin/ReportTemplates';
import ScheduledReports from '@/app/_components/admin/ScheduledReports';
import ReportHistory from '@/app/_components/admin/ReportHistory';
import ReportCharts from '@/app/_components/admin/ReportCharts';
import ReportExporter from '@/app/_components/admin/ReportExporter';
import { ReportData } from '@/lib/reportApi';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'templates' | 'scheduled' | 'history'>('generate');
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [showCharts, setShowCharts] = useState(false);
  const [showExporter, setShowExporter] = useState(false);

  const handleReportGenerated = (report: ReportData) => {
    setGeneratedReport(report);
    setShowCharts(true);
    setShowExporter(true);
  };

  const handleTemplateSelect = (templateKey: string) => {
    // This could be used to pre-populate the report generator
    console.log('Template selected:', templateKey);
  };

  const tabs = [
    { key: 'generate', label: 'Generate Report', icon: '📊' },
    { key: 'templates', label: 'Templates', icon: '📋' },
    { key: 'scheduled', label: 'Scheduled', icon: '⏰' },
    { key: 'history', label: 'History', icon: '📚' }
  ];

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary">Reports Dashboard</h1>
              <p className="mt-2 text-secondary">
                Generate, schedule, and manage comprehensive system reports
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8">
              <div className="border-b border-app">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-secondary hover:text-primary hover:border-app'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'generate' && (
                <div className="space-y-8">
                  <ReportGenerator onReportGenerated={handleReportGenerated} />
                  
                  {generatedReport && showCharts && (
                    <div className="bg-surface-elevated rounded-lg border border-app p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-primary">Report Visualizations</h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowCharts(!showCharts)}
                            className="px-4 py-2 text-sm bg-surface text-secondary rounded-md hover:bg-surface-elevated"
                          >
                            {showCharts ? 'Hide Charts' : 'Show Charts'}
                          </button>
                        </div>
                      </div>
                      <ReportCharts report={generatedReport} />
                    </div>
                  )}

                  {generatedReport && showExporter && (
                    <div className="bg-surface-elevated rounded-lg border border-app p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-primary">Export Report</h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowExporter(!showExporter)}
                            className="px-4 py-2 text-sm bg-surface text-secondary rounded-md hover:bg-surface-elevated"
                          >
                            {showExporter ? 'Hide Exporter' : 'Show Exporter'}
                          </button>
                        </div>
                      </div>
                      <ReportExporter report={generatedReport} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'templates' && (
                <ReportTemplates onTemplateSelect={handleTemplateSelect} />
              )}

              {activeTab === 'scheduled' && (
                <ScheduledReports />
              )}

              {activeTab === 'history' && (
                <ReportHistory />
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-12 bg-surface-elevated rounded-lg border border-app p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('generate')}
                  className="p-4 border border-app rounded-lg hover:border-blue-300 hover:bg-surface transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="font-medium text-primary">Generate Report</h3>
                    <p className="text-sm text-secondary">Create a new report</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('templates')}
                  className="p-4 border border-app rounded-lg hover:border-blue-300 hover:bg-surface transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <h3 className="font-medium text-primary">View Templates</h3>
                    <p className="text-sm text-secondary">Browse report templates</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('scheduled')}
                  className="p-4 border border-app rounded-lg hover:border-blue-300 hover:bg-surface transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⏰</div>
                    <h3 className="font-medium text-primary">Scheduled Reports</h3>
                    <p className="text-sm text-secondary">Manage recurring reports</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className="p-4 border border-app rounded-lg hover:border-blue-300 hover:bg-surface transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📚</div>
                    <h3 className="font-medium text-primary">Report History</h3>
                    <p className="text-sm text-secondary">View past reports</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
};

export default ReportsPage;

