'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import AnalyticsDashboard from '../../_components/admin/AnalyticsDashboard';
import UserAnalytics from '../../_components/admin/UserAnalytics';
import SystemAnalytics from '../../_components/admin/SystemAnalytics';
import WebsiteAnalytics from '../../_components/admin/WebsiteAnalytics';

export default function AnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'users' | 'system' | 'websites'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'websites', label: 'Websites', icon: '🌐' }
  ] as const;

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserAnalytics />;
      case 'system':
        return <SystemAnalytics />;
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
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">Analytics</h1>
              <p className="text-secondary">
                Comprehensive analytics and insights for your platform
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="border-b border-app">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        selectedTab === tab.id
                          ? 'border-purple-500 text-purple-400'
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
            <div className="space-y-6">
              {renderTabContent()}
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
