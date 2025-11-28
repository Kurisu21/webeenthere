'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import StatsCard from '../../_components/admin/StatsCard';
import ForumCategories from '../../_components/admin/ForumCategories';
import ThreadList from '../../_components/admin/ThreadList';
import { forumApi, ForumStats } from '../../../lib/forumApi';

export default function AdminForumPage() {
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'threads'>('categories');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await forumApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch forum stats:', error);
      setError('Failed to load forum statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = (threadId: string, action: string) => {
    setRefreshTrigger(prev => prev + 1);
    fetchStats();
  };

  const handleCategoryChange = () => {
    fetchStats();
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
                <p className="text-primary">Loading forum...</p>
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
                <p className="text-primary text-lg font-medium mb-2">Error Loading Forum</p>
                <p className="text-secondary">{error}</p>
              </div>
            </div>
          ) : (
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">Forum Management</h1>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-secondary">Last updated:</span>
                  <span className="text-sm text-secondary">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Categories"
                value={stats?.totalCategories || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
                color="blue"
                subtitle="Forum categories"
              />
              
              <StatsCard
                title="Threads"
                value={stats?.totalThreads || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                }
                color="purple"
                subtitle="Discussion threads"
              />
              
              <StatsCard
                title="Replies"
                value={stats?.totalReplies || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
                color="green"
                subtitle="User replies"
              />
              
              <StatsCard
                title="Views"
                value={stats?.totalViews || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
                color="yellow"
                subtitle="Total views"
              />
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-app">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('categories')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'categories'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-secondary hover:text-primary hover:border-app'
                    }`}
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => setActiveTab('threads')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'threads'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-secondary hover:text-primary hover:border-app'
                    }`}
                  >
                    Threads
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'categories' && (
              <ForumCategories onCategoryChange={handleCategoryChange} />
            )}

            {activeTab === 'threads' && (
              <ThreadList
                onModerate={handleModerate}
                refreshTrigger={refreshTrigger}
              />
            )}

            {/* Additional Stats */}
            <div className="mt-8">
              <div className="bg-surface-elevated rounded-lg border border-app p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Community Engagement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Total Likes</span>
                    <span className="text-primary font-medium">{stats?.totalLikes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Avg Replies per Thread</span>
                    <span className="text-primary font-medium">{stats?.averageRepliesPerThread || 0}</span>
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
