'use client';

import React, { useState, useEffect } from 'react';
import { analyticsApi, UserAnalytics as UserAnalyticsType, formatNumber, formatPercentage } from '../../../lib/analyticsApi';
import AnalyticsCharts from './AnalyticsCharts';

interface UserAnalyticsProps {
  className?: string;
}

export default function UserAnalytics({ className = '' }: UserAnalyticsProps) {
  const [analytics, setAnalytics] = useState<UserAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'retention' | 'growth' | 'segments'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsApi.getUserAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch user analytics:', err);
      setError('Failed to load user analytics');
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-surface rounded"></div>
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
          <p className="text-red-400 text-lg font-medium mb-2">Error Loading User Analytics</p>
          <p className="text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">User Analytics</h2>
        <div className="flex space-x-1 bg-surface rounded-lg p-1">
          {(['overview', 'retention', 'growth', 'segments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedTab === tab
                  ? 'bg-purple-600 text-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && analytics.comparison && (
        <div className="space-y-6">
          {/* User Engagement Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">User Engagement Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.comparison.engagementDistribution.map((item, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{formatNumber(item.user_count)}</p>
                    <p className="text-sm text-secondary">{item.engagement_level}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Average Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-semibold text-primary mb-3">Activity Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-secondary">Avg Activities/User:</span>
                  <span className="text-primary font-medium">{analytics.comparison.activityMetrics.avg_activities_per_user.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Max Activities:</span>
                  <span className="text-primary font-medium">{formatNumber(analytics.comparison.activityMetrics.max_activities)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Min Activities:</span>
                  <span className="text-primary font-medium">{formatNumber(analytics.comparison.activityMetrics.min_activities)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-semibold text-primary mb-3">Website Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-secondary">Avg Websites/User:</span>
                  <span className="text-primary font-medium">{analytics.comparison.websiteMetrics.avg_websites_per_user.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Max Websites:</span>
                  <span className="text-primary font-medium">{formatNumber(analytics.comparison.websiteMetrics.max_websites)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Min Websites:</span>
                  <span className="text-primary font-medium">{formatNumber(analytics.comparison.websiteMetrics.min_websites)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'retention' && analytics.retention && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">User Retention Rates</h3>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <AnalyticsCharts
              data={analytics.retention}
              type="line"
              dataKey="firstMonthRetention"
              xAxisKey="month"
              height={300}
              color="#8B5CF6"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.retention.slice(-4).map((month, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{month.firstMonthRetention}%</p>
                  <p className="text-sm text-secondary">1st Month Retention</p>
                  <p className="text-xs text-gray-500">{month.month}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'growth' && analytics.growth && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">User Growth</h3>
          
          {/* Monthly Growth Chart */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-md font-semibold text-primary mb-3">Monthly User Growth</h4>
            <AnalyticsCharts
              data={analytics.growth.monthly}
              type="bar"
              dataKey="new_users"
              xAxisKey="month"
              height={300}
              color="#10B981"
            />
          </div>

          {/* Growth Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatNumber(analytics.growth.monthly[analytics.growth.monthly.length - 1]?.cumulative_users || 0)}</p>
                <p className="text-sm text-secondary">Total Users</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatNumber(analytics.growth.monthly[analytics.growth.monthly.length - 1]?.new_users || 0)}</p>
                <p className="text-sm text-secondary">New This Month</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatNumber(analytics.growth.weekly[analytics.growth.weekly.length - 1]?.new_users || 0)}</p>
                <p className="text-sm text-secondary">New This Week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'segments' && analytics.segments && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">User Segments</h3>
          
          {/* Segment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.segments.summary.powerUsersCount}</p>
                <p className="text-sm text-secondary">Power Users</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.segments.summary.newUsersCount}</p>
                <p className="text-sm text-secondary">New Users</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.segments.summary.inactiveUsersCount}</p>
                <p className="text-sm text-secondary">Inactive Users</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.segments.summary.publishersCount}</p>
                <p className="text-sm text-secondary">Publishers</p>
              </div>
            </div>
          </div>

          {/* Power Users */}
          <div>
            <h4 className="text-md font-semibold text-primary mb-3">Top Power Users</h4>
            <div className="space-y-2">
              {analytics.segments.powerUsers.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs text-purple-400 font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{user.username}</p>
                      <p className="text-xs text-secondary">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{formatNumber(user.activity_count)} activities</p>
                    <p className="text-xs text-secondary">{formatNumber(user.website_count)} websites</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
