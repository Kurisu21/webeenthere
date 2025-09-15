'use client';

import React, { useState, useCallback, useMemo } from 'react';
import DashboardHeader from '../_components/DashboardHeader';
import DashboardSidebar from '../_components/DashboardSidebar';
import WebsiteBuilder from '../_components/WebsiteBuilder';
import UserProfile from '../_components/UserProfile';
import MainContent from '../_components/MainContent';

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('main');
  const [currentWebsite, setCurrentWebsite] = useState(null);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

  const handleCreateWebsite = useCallback(() => {
    setActiveSection('builder');
  }, []);

  const renderMainContent = useMemo(() => {
    switch (activeSection) {
      case 'profile':
        return <UserProfile />;
      case 'builder':
        return <WebsiteBuilder currentWebsite={currentWebsite} />;
      case 'main':
      default:
        return <MainContent currentWebsite={currentWebsite} onCreateWebsite={handleCreateWebsite} />;
    }
  }, [activeSection, currentWebsite, handleCreateWebsite]);

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <main className="flex-1 md:ml-64">
          <div className="min-h-[calc(100vh-120px)] p-4 md:p-6">
            <div className="transition-all duration-300">
              {renderMainContent}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 