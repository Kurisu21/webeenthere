'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import AnalyticsDashboard from '../../_components/admin/AnalyticsDashboard';
import UserAnalytics from '../../_components/admin/UserAnalytics';
import WebsiteAnalytics from '../../_components/admin/WebsiteAnalytics';

export default function AnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'users' | 'websites'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'websites', label: 'Websites', icon: '🌐' }
  ] as const;

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserAnalytics />;
      case 'websites':
        return <WebsiteAnalytics />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Analytics</h1>
              <p className="text-secondary text-lg">
                Comprehensive analytics and insights for users and websites
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="flex space-x-1 bg-surface-elevated rounded-lg p-1 border border-app">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedTab === tab.id
                        ? 'bg-surface text-primary border border-app'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {renderTabContent()}
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
