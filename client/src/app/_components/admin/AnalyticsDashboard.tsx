'use client';

import React, { useState, useEffect } from 'react';
import { analyticsApi, DashboardMetrics, formatNumber } from '../../../lib/analyticsApi';
import AnalyticsCharts from './AnalyticsCharts';
import RealTimeMetrics from './RealTimeMetrics';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    fetchMetrics();
  }, [selectedPeriod]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsApi.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError('Failed to load analytics dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-surface rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-surface rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-surface rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 text-lg font-medium mb-2">Error Loading Analytics</p>
          <p className="text-secondary mb-4">{error}</p>
          <button
            onClick={fetchMetrics}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary font-medium py-2 px-4 rounded-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          {(['7', '30', '90'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-purple-600 text-primary'
                  : 'bg-gray-700 text-secondary hover:bg-gray-600'
              }`}
            >
              {period} Days
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Metrics */}
        <div className="bg-surface-elevated rounded-lg border border-app p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Users</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(metrics.users.total)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg border border-app p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">New This Month</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(metrics.users.newThisMonth)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg border border-app p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Active Users</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(metrics.users.active)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="bg-surface-elevated rounded-lg border border-app p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Activities</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(metrics.system.totalActivities)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg border border-app p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Today's Activities</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(metrics.system.todayActivities)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Website Metrics */}
        <div className="bg-surface-elevated rounded-lg border border-app p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Websites</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(metrics.websites.total)}</p>
            </div>
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg border border-app p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Published</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(metrics.websites.published)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg border border-app p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">New This Month</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(metrics.websites.newThisMonth)}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trend */}
        <div className="bg-surface-elevated rounded-lg border border-app p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">User Registration Trend</h3>
          <AnalyticsCharts
            data={metrics.trends.userRegistration}
            type="line"
            dataKey="count"
            xAxisKey="month"
            height={300}
          />
        </div>

        {/* Website Creation Trend */}
        <div className="bg-surface-elevated rounded-lg border border-app p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Website Creation Trend</h3>
          <AnalyticsCharts
            data={metrics.trends.websiteCreation}
            type="bar"
            dataKey="count"
            xAxisKey="month"
            height={300}
          />
        </div>
      </div>

      {/* Real-time Metrics */}
      <RealTimeMetrics />
    </div>
  );
}
