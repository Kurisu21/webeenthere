'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function ImagesPage() {
  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <div className="bg-surface-elevated rounded-lg p-6">
            <h1 className="text-2xl font-bold text-primary mb-4">🖼️ Image Gallery</h1>
            <div className="mb-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                📁 Upload New Images
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="bg-surface rounded-lg p-4 aspect-square flex items-center justify-center">
                  <span className="text-secondary text-sm">Image {i}</span>
                </div>
              ))}
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
