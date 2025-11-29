'use client';

import React, { useState, useEffect } from 'react';
import { analyticsApi, UserAnalytics as UserAnalyticsType, formatNumber, formatPercentage } from '../../../lib/analyticsApi';
import AnalyticsCharts from './AnalyticsCharts';

interface UserAnalyticsProps {
  className?: string;
}

// Helper functions to safely access nested values
const safeGet = (obj: any, path: string[], defaultValue: any = 0) => {
  try {
    let value = obj;
    for (const key of path) {
      if (value == null) return defaultValue;
      value = value[key];
    }
    return value != null ? value : defaultValue;
  } catch {
    return defaultValue;
  }
};

const safeToFixed = (value: any, decimals: number = 1): string => {
  if (value == null || isNaN(value)) return '0.0';
  return Number(value).toFixed(decimals);
};

export default function UserAnalytics({ className = '' }: UserAnalyticsProps) {
  const [analytics, setAnalytics] = useState<UserAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'retention' | 'growth' | 'segments' | 'evidence'>('overview');

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
    <div className={`bg-surface rounded-lg border border-app p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-primary">User Analytics</h2>
        <div className="flex space-x-1 bg-surface-elevated rounded-lg p-1 border border-app">
          {(['overview', 'retention', 'growth', 'segments', 'evidence'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedTab === tab
                  ? 'bg-surface text-primary border border-app'
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
              {analytics.comparison.engagementDistribution && Array.isArray(analytics.comparison.engagementDistribution) && analytics.comparison.engagementDistribution.length > 0 ? (
                analytics.comparison.engagementDistribution.map((item, index) => (
                  <div key={`engagement-${index}-${item.engagement_level || index}`} className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
                    <p className="text-3xl font-bold text-primary mb-2">{formatNumber(item.user_count || 0)}</p>
                    <p className="text-sm text-secondary">{item.engagement_level || 'Unknown'}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-8 bg-surface-elevated rounded-lg border border-app">
                  <p className="text-secondary">No engagement distribution data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Average Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-lg font-semibold text-primary mb-4">Activity Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-app">
                  <span className="text-secondary">Avg Activities/User:</span>
                  <span className="text-primary font-semibold">{safeToFixed(safeGet(analytics, ['comparison', 'activityMetrics', 'avg_activities_per_user']))}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-app">
                  <span className="text-secondary">Max Activities:</span>
                  <span className="text-primary font-semibold">{formatNumber(safeGet(analytics, ['comparison', 'activityMetrics', 'max_activities']))}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-secondary">Min Activities:</span>
                  <span className="text-primary font-semibold">{formatNumber(safeGet(analytics, ['comparison', 'activityMetrics', 'min_activities']))}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-lg font-semibold text-primary mb-4">Website Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-app">
                  <span className="text-secondary">Avg Websites/User:</span>
                  <span className="text-primary font-semibold">{safeToFixed(safeGet(analytics, ['comparison', 'websiteMetrics', 'avg_websites_per_user']))}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-app">
                  <span className="text-secondary">Max Websites:</span>
                  <span className="text-primary font-semibold">{formatNumber(safeGet(analytics, ['comparison', 'websiteMetrics', 'max_websites']))}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-secondary">Min Websites:</span>
                  <span className="text-primary font-semibold">{formatNumber(safeGet(analytics, ['comparison', 'websiteMetrics', 'min_websites']))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'retention' && analytics.retention && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary mb-4">User Retention Rates</h3>
          <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-6">
            <AnalyticsCharts
              data={Array.isArray(analytics.retention) ? analytics.retention : []}
              type="line"
              dataKey="firstMonthRetention"
              xAxisKey="month"
              height={300}
              color="#8B5CF6"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.retention && Array.isArray(analytics.retention) && analytics.retention.length > 0 ? (
              analytics.retention.slice(-4).map((month, index) => (
                <div key={`retention-${index}-${month.month || index}`} className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
                  <p className="text-2xl font-bold text-primary mb-2">{month.firstMonthRetention || 0}%</p>
                  <p className="text-sm text-secondary">1st Month Retention</p>
                  <p className="text-xs text-secondary mt-1">{month.month || 'Unknown'}</p>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-8 bg-surface-elevated rounded-lg border border-app">
                <p className="text-secondary">No retention data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'growth' && analytics.growth && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">User Growth</h3>
          
          {/* Monthly Growth Chart */}
          <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-6">
            <h4 className="text-lg font-semibold text-primary mb-4">Monthly User Growth</h4>
            <AnalyticsCharts
              data={analytics.growth.monthly && Array.isArray(analytics.growth.monthly) ? analytics.growth.monthly : []}
              type="bar"
              dataKey="new_users"
              xAxisKey="month"
              height={300}
              color="#10B981"
            />
          </div>

          {/* Growth Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {formatNumber(analytics.growth?.totalUsers || 
                  (analytics.growth?.monthly && Array.isArray(analytics.growth.monthly) && analytics.growth.monthly.length > 0
                    ? analytics.growth.monthly[analytics.growth.monthly.length - 1]?.cumulative_users || 0
                    : 0)
                )}
              </p>
              <p className="text-sm text-secondary">Total Users</p>
              <p className="text-xs text-secondary mt-1">All active users</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {analytics.growth.monthly && Array.isArray(analytics.growth.monthly) && analytics.growth.monthly.length > 0
                  ? formatNumber(analytics.growth.monthly[analytics.growth.monthly.length - 1]?.new_users || 0)
                  : formatNumber(0)
                }
              </p>
              <p className="text-sm text-secondary">New This Month</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {analytics.growth.weekly && Array.isArray(analytics.growth.weekly) && analytics.growth.weekly.length > 0
                  ? formatNumber(analytics.growth.weekly[analytics.growth.weekly.length - 1]?.new_users || 0)
                  : formatNumber(0)
                }
              </p>
              <p className="text-sm text-secondary">New This Week</p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'segments' && analytics.segments && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">User Segments</h3>
          
          {/* Segment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">{analytics.segments?.summary?.powerUsersCount ?? 0}</p>
              <p className="text-sm text-secondary">Power Users</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">{analytics.segments?.summary?.newUsersCount ?? 0}</p>
              <p className="text-sm text-secondary">New Users</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">{analytics.segments?.summary?.inactiveUsersCount ?? 0}</p>
              <p className="text-sm text-secondary">Inactive Users</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">{analytics.segments?.summary?.publishersCount ?? 0}</p>
              <p className="text-sm text-secondary">Publishers</p>
            </div>
          </div>

          {/* Power Users */}
          <div>
            <h4 className="text-lg font-semibold text-primary mb-4">Top Power Users</h4>
            <div className="space-y-3">
              {analytics.segments?.powerUsers && Array.isArray(analytics.segments.powerUsers) && analytics.segments.powerUsers.length > 0 ? (
                analytics.segments.powerUsers.slice(0, 5).map((user, index) => (
                  <div key={`power-user-${index}-${user.username || user.email || index}`} className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg border border-app hover:border-primary/30 transition-all duration-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mr-4">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{user.username || 'Unknown'}</p>
                        <p className="text-xs text-secondary">{user.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{formatNumber(user.activity_count || 0)} activities</p>
                      <p className="text-xs text-secondary">{formatNumber(user.website_count || 0)} websites</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-surface-elevated rounded-lg border border-app">
                  <p className="text-secondary">No power users data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'evidence' && analytics.evidence && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">Data Sources & Evidence</h3>
          
          {/* Data Sources Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-sm font-semibold text-secondary mb-2">Activity Logs</h4>
              <p className="text-2xl font-bold text-primary mb-1">{formatNumber(analytics.evidence.activityLogs?.total || 0)}</p>
              <p className="text-xs text-secondary">{analytics.evidence.activityLogs?.period || 'N/A'}</p>
              <p className="text-xs text-secondary mt-1">{analytics.evidence.activityLogs?.description || ''}</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-sm font-semibold text-secondary mb-2">Registrations</h4>
              <p className="text-2xl font-bold text-primary mb-1">{formatNumber(analytics.evidence.registrations?.total || 0)}</p>
              <p className="text-xs text-secondary">{analytics.evidence.registrations?.period || 'N/A'}</p>
              <p className="text-xs text-secondary mt-1">{analytics.evidence.registrations?.description || ''}</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-sm font-semibold text-secondary mb-2">Website Creations</h4>
              <p className="text-2xl font-bold text-primary mb-1">{formatNumber(analytics.evidence.websiteCreations?.total || 0)}</p>
              <p className="text-xs text-secondary">{analytics.evidence.websiteCreations?.period || 'N/A'}</p>
              <p className="text-xs text-secondary mt-1">{analytics.evidence.websiteCreations?.description || ''}</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-sm font-semibold text-secondary mb-2">Publications</h4>
              <p className="text-2xl font-bold text-primary mb-1">{formatNumber(analytics.evidence.publications?.total || 0)}</p>
              <p className="text-xs text-secondary">{analytics.evidence.publications?.period || 'N/A'}</p>
              <p className="text-xs text-secondary mt-1">{analytics.evidence.publications?.description || ''}</p>
            </div>
          </div>

          {/* Recent Activities */}
          {analytics.evidence.recentActivities && Array.isArray(analytics.evidence.recentActivities) && analytics.evidence.recentActivities.length > 0 && (
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-md font-semibold text-primary mb-4">Recent Activities (Last 7 Days)</h4>
              <div className="space-y-2">
                {analytics.evidence.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-app">
                    <div>
                      <p className="text-sm font-medium text-primary">{activity.action || 'Unknown'}</p>
                      <p className="text-xs text-secondary">{activity.unique_users || 0} unique users</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">{formatNumber(activity.count || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification & Auth Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-md font-semibold text-primary mb-4">User Verification Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-app">
                  <span className="text-secondary">Total Users:</span>
                  <span className="text-primary font-semibold">{formatNumber(analytics.evidence.verificationStats?.total || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-app">
                  <span className="text-secondary">Verified:</span>
                  <span className="text-primary font-semibold">{formatNumber(analytics.evidence.verificationStats?.verified || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-secondary">Unverified:</span>
                  <span className="text-primary font-semibold">{formatNumber(analytics.evidence.verificationStats?.unverified || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-md font-semibold text-primary mb-4">Authentication Provider Distribution</h4>
              <div className="space-y-2">
                {analytics.evidence.authProviderStats && Array.isArray(analytics.evidence.authProviderStats) && analytics.evidence.authProviderStats.length > 0 ? (
                  analytics.evidence.authProviderStats.map((provider, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-surface rounded border border-app">
                      <span className="text-sm text-primary capitalize">{provider.auth_provider || 'Unknown'}</span>
                      <span className="text-sm font-semibold text-primary">{formatNumber(provider.count || 0)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-secondary">No auth provider data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
