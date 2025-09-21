'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function SharePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <div className="bg-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-4">📤 Share & Collaborate</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">🔗 Share Link</h3>
                <p className="text-gray-300 text-sm mb-4">Get a shareable link for your website</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Generate Link
                </button>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">👥 Collaborate</h3>
                <p className="text-gray-300 text-sm mb-4">Invite team members to edit</p>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Invite Team
                </button>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">📱 Social Media</h3>
                <p className="text-gray-300 text-sm mb-4">Share on social platforms</p>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Share Now
                </button>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
