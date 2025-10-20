'use client';

import React, { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';

interface MainContentProps {
  currentWebsite?: any;
}

const MainContent = memo(({ currentWebsite }: MainContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleContinueEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCreateNew = useCallback(() => {
    console.log('Creating new website...');
    router.push('/user/create');
  }, [router]);

  // If user has a current website, show it with continue editing option
  if (currentWebsite) {
    return (
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary mb-2">Welcome, Amanda</h1>
            <p className="text-secondary text-sm md:text-base">Tue, 07 June 2022</p>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Bar */}
            <div className="relative group flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Search"
                className="w-full md:w-auto pl-10 pr-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors-fast group-hover:border-app text-sm md:text-base"
              />
              <svg className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-2.5 text-secondary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Profile Picture */}
            <div className="w-8 h-8 md:w-10 md:h-10 bg-surface-elevated rounded-full flex items-center justify-center hover:bg-[var(--accent)] transition-all duration-300 transform hover:scale-110 cursor-pointer">
              <span className="text-secondary font-medium text-sm md:text-base">M</span>
            </div>
          </div>
        </div>

        {/* Website Preview */}
        <div className="bg-surface-elevated rounded-lg p-6 mb-6 hover:shadow-2xl transition-colors-fast transform hover:scale-[1.02]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">Hiflux</h2>
            <button 
              onClick={handleContinueEditing}
              className="btn-primary px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Continue Editing →
            </button>
          </div>
          <div className="bg-surface rounded-lg p-8 text-center hover:bg-surface-elevated transition-colors duration-300">
            <p className="text-secondary">Website preview will be shown here</p>
            <p className="text-sm text-secondary mt-2">Your current website: Hiflux</p>
          </div>
        </div>
      </div>
    );
  }

  // If no current website, show create new option
  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary mb-2">Welcome, Amanda</h1>
          <p className="text-secondary text-sm md:text-base">Tue, 07 June 2022</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search Bar */}
          <div className="relative group flex-1 md:flex-none">
            <input
              type="text"
              placeholder="Search"
              className="w-full md:w-auto pl-10 pr-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors-fast group-hover:border-app text-sm md:text-base"
            />
            <svg className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-2.5 text-secondary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Profile Picture */}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-surface-elevated rounded-full flex items-center justify-center hover:bg-[var(--accent)] transition-all duration-300 transform hover:scale-110 cursor-pointer">
            <span className="text-secondary font-medium text-sm md:text-base">M</span>
          </div>
        </div>
      </div>

      {/* Create New Website */}
      <div className="bg-surface-elevated rounded-lg p-4 md:p-6 hover:shadow-2xl transition-colors-fast transform hover:scale-[1.02]">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">Create Your First Website</h2>
          <p className="text-secondary mb-6 text-sm md:text-base">Start building your perfect website with our easy-to-use builder</p>
          <button 
            onClick={handleCreateNew}
            className="w-full md:w-auto btn-primary px-6 md:px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-base md:text-lg"
          >
            + Create New Website
          </button>
        </div>
      </div>
    </div>
  );
});

MainContent.displayName = 'MainContent';

export default MainContent; 