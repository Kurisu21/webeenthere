'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function HostPage() {
  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <div className="bg-surface-elevated rounded-lg p-6">
            <h1 className="text-2xl font-bold text-primary mb-4">🚀 Hosting & Deployment</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-surface rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary mb-2">🌐 Deploy Website</h3>
                <p className="text-secondary text-sm mb-4">Deploy your website to the cloud</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Deploy Now
                </button>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary mb-2">📊 Analytics</h3>
                <p className="text-secondary text-sm mb-4">Track your website performance</p>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                  View Analytics
                </button>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary mb-2">🔧 Settings</h3>
                <p className="text-secondary text-sm mb-4">Configure hosting settings</p>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
