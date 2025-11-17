'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import FeedbackList from '../../_components/admin/FeedbackList';
import FeedbackStats from '../../_components/admin/FeedbackStats';
import { feedbackApi, FeedbackStats as FeedbackStatsType } from '../../../lib/feedbackApi';

export default function AdminFeedbackPage() {
  const [stats, setStats] = useState<FeedbackStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback'>('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await feedbackApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch feedback stats:', error);
      setError('Failed to load feedback statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = (feedbackId: string, adminId: string) => {
    setRefreshTrigger(prev => prev + 1);
    fetchStats();
  };

  const handleRespond = (feedbackId: string, response: string) => {
    setRefreshTrigger(prev => prev + 1);
    fetchStats();
  };

  const handleClose = (feedbackId: string, response?: string) => {
    setRefreshTrigger(prev => prev + 1);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-primary">Loading feedback...</p>
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
                <p className="text-primary text-lg font-medium mb-2">Error Loading Feedback</p>
                <p className="text-secondary">{error}</p>
              </div>
            </div>
          ) : (
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">Feedback Management</h1>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-secondary">Last updated:</span>
                  <span className="text-sm text-secondary">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-surface-elevated rounded-lg border border-app p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">{stats?.total || 0}</p>
                  <p className="text-secondary text-sm">Total Feedback</p>
                </div>
              </div>

              <div className="bg-surface-elevated rounded-lg border border-app p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">{stats?.open || 0}</p>
                  <p className="text-secondary text-sm">Open</p>
                </div>
              </div>

              <div className="bg-surface-elevated rounded-lg border border-app p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">{stats?.closed || 0}</p>
                  <p className="text-secondary text-sm">Closed</p>
                </div>
              </div>

              <div className="bg-surface-elevated rounded-lg border border-app p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">{stats?.averageResponseTime || 0}h</p>
                  <p className="text-secondary text-sm">Avg Response Time</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-app">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'overview'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-secondary hover:text-primary hover:border-app'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'feedback'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-secondary hover:text-primary hover:border-app'
                    }`}
                  >
                    Feedback List
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'overview' && <FeedbackStats />}

            {activeTab === 'feedback' && (
              <FeedbackList
                onAssign={handleAssign}
                onRespond={handleRespond}
                onClose={handleClose}
                refreshTrigger={refreshTrigger}
              />
            )}

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-elevated rounded-xl border border-app p-6 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-primary font-medium group-hover:text-blue-400 transition-colors">Assign Feedback</h3>
                    <p className="text-secondary text-sm">Assign feedback to team members</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-elevated rounded-xl border border-app p-6 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-primary font-medium group-hover:text-purple-400 transition-colors">Bulk Actions</h3>
                    <p className="text-secondary text-sm">Process multiple feedback items</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-elevated rounded-xl border border-app p-6 hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-primary font-medium group-hover:text-green-400 transition-colors">Export Reports</h3>
                    <p className="text-secondary text-sm">Generate feedback reports</p>
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
