'use client';

import React, { memo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { useAuth } from '../auth/AuthContext';
import ThemeToggle from '../theme/ThemeToggle';
import SubscriptionBadge from '../subscription/SubscriptionBadge';
import { subscriptionApi, Subscription } from '../../../lib/subscriptionApi';
import LogoutConfirmationDialog from '../dialogs/LogoutConfirmationDialog';
import { API_ENDPOINTS, apiPost } from '../../../lib/apiConfig';

const DashboardHeader = memo(() => {
  const { isCollapsed, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      loadCurrentSubscription();
    }
  }, [user]);

  const loadCurrentSubscription = async () => {
    try {
      setIsLoadingSubscription(true);
      const response = await subscriptionApi.getCurrentSubscription();
      if (response.success) {
        setCurrentSubscription(response.data);
      }
    } catch (error: any) {
      // Silently handle network errors - don't show error if API is unavailable
      // This prevents the app from breaking when the backend is not running
      if (error?.isNetworkError || error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError') || error?.message?.includes('Network error')) {
        console.warn('Subscription API unavailable - continuing without subscription data');
      } else {
        console.error('Failed to load current subscription:', error);
      }
      // Set subscription to null so UI doesn't break
      setCurrentSubscription(null);
    } finally {
      setIsLoadingSubscription(false);
    }
  };
  return (
    <header className={`bg-surface-elevated/80 backdrop-blur-sm border-b border-app px-4 md:px-8 py-3 md:py-4 relative z-10 transition-all duration-300 ml-0 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
      <div className="flex justify-center items-center relative">
        {/* Left side - Mobile menu button */}
        <div className="absolute left-0 flex items-center gap-2">
          <button 
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 text-primary hover:text-secondary transition-colors rounded-lg hover:bg-surface-elevated"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Center - Brand name with gradient */}
        <div className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          WEBeenThere
        </div>

        {/* Right side - Social icons */}
        <div className="absolute right-0 flex items-center space-x-2 md:space-x-4">
          {/* Social Icons - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex space-x-3">
            <a href="#" className="text-secondary hover:text-primary transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>

            <a href="#" className="text-secondary hover:text-primary transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
              </svg>
            </a>

            <a href="#" className="text-secondary hover:text-primary transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            <a href="#" className="text-secondary hover:text-primary transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </a>

            <a href="#" className="text-secondary hover:text-primary transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors duration-300">
                <span className="text-gray-600 font-medium text-sm">M</span>
              </div>
            </a>
          </div>
          
          {/* Desktop user menu */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Subscription Badge */}
            {user && !isLoadingSubscription && currentSubscription && (
              <div className="flex items-center">
                <SubscriptionBadge 
                  planType={currentSubscription.plan_type} 
                  size="sm"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-surface-elevated border border-app rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span className="text-primary text-sm font-medium">
                {user ? user.username : 'User'}
              </span>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          </div>
          
          {/* Mobile user avatar and theme toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <div className="w-8 h-8 bg-surface-elevated border border-app rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        isOpen={showLogoutConfirm}
        onConfirm={async () => {
          try {
            // Call logout API BEFORE clearing storage (needs token for authentication)
            await apiPost(`${API_ENDPOINTS.USERS}/logout`, {});
          } catch (error) {
            // Log error but continue with logout - client-side logout should always succeed
            // The API call is for server-side cleanup (session token, activity logging)
            console.warn('Logout API call failed (continuing with client-side logout):', error);
          }
          
          // Clear local storage and state (always do this, even if API call failed)
          logout();
          
          // Redirect to login
          router.push('/login');
        }}
        onCancel={() => setShowLogoutConfirm(false)}
        userType="user"
      />
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader; 