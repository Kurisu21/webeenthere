'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function GoalsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <div className="bg-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-4">🎯 Problems & Goals</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">📋 Current Problems</h3>
                <div className="space-y-3">
                  <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
                    <p className="text-red-200 text-sm">Website loading speed needs improvement</p>
                  </div>
                  <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
                    <p className="text-red-200 text-sm">Mobile responsiveness issues</p>
                  </div>
                  <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
                    <p className="text-red-200 text-sm">SEO optimization needed</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">🎯 Goals & Objectives</h3>
                <div className="space-y-3">
                  <div className="bg-green-900/30 border border-green-500 rounded-lg p-3">
                    <p className="text-green-200 text-sm">Increase website traffic by 50%</p>
                  </div>
                  <div className="bg-green-900/30 border border-green-500 rounded-lg p-3">
                    <p className="text-green-200 text-sm">Improve user engagement</p>
                  </div>
                  <div className="bg-green-900/30 border border-green-500 rounded-lg p-3">
                    <p className="text-green-200 text-sm">Launch new features</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
