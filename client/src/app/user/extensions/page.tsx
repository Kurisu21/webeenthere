'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function ExtensionsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <div className="bg-surface-elevated rounded-lg p-6">
            <h1 className="text-2xl font-bold text-primary mb-4">✏️ Extensions & Plugins</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-surface rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary mb-2">🎨 Theme Extensions</h3>
                <p className="text-secondary text-sm mb-4">Customize your website appearance</p>
                <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Browse Themes
                </button>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary mb-2">🔌 Functionality</h3>
                <p className="text-secondary text-sm mb-4">Add new features to your site</p>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Add Features
                </button>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary mb-2">📱 Mobile Apps</h3>
                <p className="text-secondary text-sm mb-4">Create mobile app versions</p>
                <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Create App
                </button>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
