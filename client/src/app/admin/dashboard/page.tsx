'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import StatsCard from '../../_components/admin/StatsCard';
import { adminApi, UserStats } from '../../../lib/adminApi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userStats = await adminApi.getUserStats();
        setStats(userStats);
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard statistics');
        // Set default stats on error so UI doesn't break
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          adminUsers: 0,
          recentUsers: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-primary">Loading dashboard...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-primary text-lg font-medium mb-2">Error Loading Dashboard</p>
                <p className="text-secondary">{error}</p>
              </div>
            </div>
          ) : (
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">Admin Dashboard</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm text-secondary">Last updated:</span>
                  <span className="text-xs sm:text-sm text-primary">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatsCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
                color="blue"
                subtitle="Registered users"
              />
              
              <StatsCard
                title="Active Users"
                value={stats?.activeUsers || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
                subtitle="Currently active"
              />
              
              <StatsCard
                title="Verified Users"
                value={stats?.verifiedUsers || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                color="purple"
                subtitle="Email verified"
              />
              
              <StatsCard
                title="Admin Users"
                value={stats?.adminUsers || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                color="red"
                subtitle="Administrators"
              />
            </div>

            {/* Recent Users */}
            <div className="bg-surface-elevated rounded-lg border border-app">
              <div className="p-4 sm:p-6 border-b border-app">
                <h2 className="text-lg sm:text-xl font-semibold text-primary">Recent User Registrations</h2>
                <p className="text-secondary text-xs sm:text-sm">Latest 5 user registrations</p>
              </div>
              
              <div className="p-4 sm:p-6">
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {stats.recentUsers.map((user) => (
                      <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 bg-surface/50 rounded-lg hover:bg-surface/70 transition-colors">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-surface border border-app rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-primary font-medium text-sm sm:text-base truncate">{user.username}</h3>
                            <p className="text-secondary text-xs sm:text-sm truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex sm:flex-col sm:text-right items-start sm:items-end gap-2 sm:gap-1">
                          <p className="text-primary text-xs sm:text-sm">{formatDate(user.created_at)}</p>
                          <div className="flex items-center flex-wrap gap-1 sm:gap-2 sm:mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_active 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_verified 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {user.is_verified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-secondary">No recent users found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-surface-elevated rounded-lg border border-app p-4 sm:p-6 hover:border-primary/30 transition-all duration-200 group cursor-pointer">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base text-primary font-medium">Manage Users</h3>
                    <p className="text-xs sm:text-sm text-secondary">View and edit user accounts</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-elevated rounded-lg border border-app p-4 sm:p-6 hover:border-primary/30 transition-all duration-200 group cursor-pointer sm:col-span-2 lg:col-span-1">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base text-primary font-medium">View Analytics</h3>
                    <p className="text-xs sm:text-sm text-secondary">System performance metrics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </MainContentWrapper>
      </div>
    </div>
  );
}

