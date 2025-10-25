'use client';

import React, { useState, useCallback, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MainContentProps {
  currentWebsite?: any;
}

const MainContent = memo(({ currentWebsite }: MainContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userWebsites, setUserWebsites] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const router = useRouter();

  // Load user data and websites
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load user data from localStorage or API
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(user);
        }

        // Check if user is authenticated before making API calls
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found, skipping website load');
          return;
        }

        // Load user websites
        const { API_ENDPOINTS, apiGet } = await import('../../../lib/apiConfig');
        const response = await apiGet(API_ENDPOINTS.WEBSITES);
        if (response.success) {
          setUserWebsites(response.data);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // If it's an authentication error, the apiCall function will handle redirect
        if (error instanceof Error && error.message.includes('Authentication required')) {
          console.log('User needs to authenticate');
        }
      }
    };

    loadUserData();
  }, []);

  // Update time every second (GMT+8)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const gmt8Time = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const timeString = gmt8Time.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Singapore'
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleContinueEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCreateNew = useCallback(() => {
    console.log('Creating new website...');
    router.push('/user/create');
  }, [router]);

  const handleEditWebsite = useCallback((websiteId: string) => {
    router.push(`/user/build/${websiteId}`);
  }, [router]);

  const handleViewWebsite = useCallback((slug: string) => {
    window.open(`/view/${slug}`, '_blank');
  }, []);

  const getUserInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If user has a current website, show it with continue editing option
  if (currentWebsite) {
    return (
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary mb-2">
              Welcome, {userData?.username || userData?.name || 'User'}
            </h1>
            <p className="text-secondary text-sm md:text-base">{currentTime}</p>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Bar */}
            <div className="relative group flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Search websites..."
                className="w-full md:w-auto pl-10 pr-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all duration-300 group-hover:border-app text-sm md:text-base"
              />
              <svg className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-2.5 text-secondary group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Profile Picture */}
            <div className="w-8 h-8 md:w-10 md:h-10 bg-surface-elevated rounded-full flex items-center justify-center hover:bg-[var(--accent)] transition-all duration-300 transform hover:scale-110 cursor-pointer">
              <span className="text-secondary font-medium text-sm md:text-base">
                {getUserInitial(userData?.username || userData?.name || '')}
              </span>
            </div>
          </div>
        </div>

        {/* Website Preview */}
        <div className="bg-surface-elevated rounded-lg p-6 mb-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">Hiflux</h2>
            <button 
              onClick={handleContinueEditing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
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

  // Main content with dynamic user data
  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary mb-2">
            Welcome, {userData?.username || userData?.name || 'User'}
          </h1>
          <p className="text-secondary text-sm md:text-base">{currentTime}</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search Bar */}
          <div className="relative group flex-1 md:flex-none">
            <input
              type="text"
              placeholder="Search websites..."
              className="w-full md:w-auto pl-10 pr-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all duration-300 group-hover:border-app text-sm md:text-base"
            />
            <svg className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-2.5 text-secondary group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Profile Picture */}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 cursor-pointer">
            <span className="text-gray-300 font-medium text-sm md:text-base">
              {getUserInitial(userData?.username || userData?.name || '')}
            </span>
          </div>
        </div>
      </div>

      {/* Create New Website Section */}
      <div className="bg-surface-elevated rounded-lg p-4 md:p-6 mb-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">
            {userWebsites.length > 0 ? 'Create New Website' : 'Create Your First Website'}
          </h2>
          <p className="text-secondary mb-6 text-sm md:text-base">
            {userWebsites.length > 0 
              ? 'Start building another amazing website' 
              : 'Start building your perfect website with our easy-to-use builder'
            }
          </p>
          <button 
            onClick={handleCreateNew}
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-base md:text-lg"
          >
            + Create New Website
          </button>
        </div>
      </div>

      {/* Past Websites Section */}
      {userWebsites.length > 0 && (
        <div className="bg-surface-elevated rounded-lg p-4 md:p-6 mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-primary mb-4">Your Websites</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userWebsites.map((website) => (
              <div key={website.id} className="bg-surface rounded-lg p-4 hover:bg-surface-elevated transition-colors duration-300">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-primary font-medium text-sm md:text-base truncate">{website.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    website.is_published 
                      ? 'bg-green-600 text-green-100' 
                      : 'bg-yellow-600 text-yellow-100'
                  }`}>
                    {website.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-secondary text-xs mb-3">
                  Created: {formatDate(website.created_at)}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditWebsite(website.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors duration-300"
                  >
                    Edit
                  </button>
                  {website.is_published && (
                    <button
                      onClick={() => handleViewWebsite(website.slug)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors duration-300"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

MainContent.displayName = 'MainContent';

export default MainContent; 