'use client';

import React, { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { useAuth } from '../auth/AuthContext';
import ThemeToggle from '../theme/ThemeToggle';
import SubscriptionBadge from '../subscription/SubscriptionBadge';
import { subscriptionApi, Subscription } from '../../../lib/subscriptionApi';
import LogoutConfirmationDialog from '../dialogs/LogoutConfirmationDialog';
import { API_ENDPOINTS, apiPost, getProfileImageUrl } from '../../../lib/apiConfig';

const DashboardHeader = memo(() => {
  const { isCollapsed, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

        {/* Right side - User menu */}
        <div className="absolute right-0 flex items-center space-x-2 md:space-x-4">
          {/* GitHub Icon - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex">
            <a href="#" className="text-secondary hover:text-primary transition-all duration-300 transform hover:scale-110 hover:rotate-12">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
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
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center focus:outline-none"
              >
                {user?.id && getProfileImageUrl(user.id) ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-4 border-app cursor-pointer hover:opacity-80 transition-opacity">
                    <img
                      src={getProfileImageUrl(user.id) || ''}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-surface-elevated border border-app rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-surface-elevated border-4 border-app rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                    <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-app rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-app">
                      <div className="flex items-center gap-3">
                        {user?.id && getProfileImageUrl(user.id) ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-4 border-app flex-shrink-0">
                            <img
                              src={getProfileImageUrl(user.id) || ''}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full bg-surface-elevated border border-app rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-surface-elevated border-4 border-app rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-primary font-semibold text-sm truncate">
                            {user?.username || 'User'}
                          </div>
                          <div className="text-secondary text-xs truncate">
                            {user?.email || ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1">
                      <Link
                        href={user?.role === 'admin' ? '/admin/settings' : '/user/profile'}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-primary hover:bg-surface transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">Profile</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-app py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-primary hover:bg-surface transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm">Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile user avatar and theme toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center focus:outline-none"
              >
                {user?.id && getProfileImageUrl(user.id) ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-4 border-app">
                    <img
                      src={getProfileImageUrl(user.id) || ''}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-surface-elevated border border-app rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-surface-elevated border-4 border-app rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </button>

              {/* Mobile Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-app rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-app">
                      <div className="flex items-center gap-3">
                        {user?.id && getProfileImageUrl(user.id) ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-4 border-app flex-shrink-0">
                            <img
                              src={getProfileImageUrl(user.id) || ''}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full bg-surface-elevated border border-app rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-surface-elevated border-4 border-app rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-primary font-semibold text-sm truncate">
                            {user?.username || 'User'}
                          </div>
                          <div className="text-secondary text-xs truncate">
                            {user?.email || ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1">
                      <Link
                        href={user?.role === 'admin' ? '/admin/settings' : '/user/profile'}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-primary hover:bg-surface transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">Profile</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-app py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-primary hover:bg-surface transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm">Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
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