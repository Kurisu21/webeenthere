'use client';

import React, { useState, useEffect } from 'react';
import { analyticsApi, WebsiteAnalytics as WebsiteAnalyticsType, formatNumber, formatPercentage } from '../../../lib/analyticsApi';
import AnalyticsCharts from './AnalyticsCharts';

interface WebsiteAnalyticsProps {
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

export default function WebsiteAnalytics({ className = '' }: WebsiteAnalyticsProps) {
  const [analytics, setAnalytics] = useState<WebsiteAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'traffic' | 'performance' | 'conversion'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsApi.getWebsiteAnalytics(parseInt(selectedPeriod));
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch website analytics:', err);
      setError('Failed to load website analytics');
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
          <p className="text-red-400 text-lg font-medium mb-2">Error Loading Website Analytics</p>
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
        <h2 className="text-2xl font-semibold text-primary">Website Analytics</h2>
        <div className="flex space-x-2">
          {(['7', '30', '90'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
                selectedPeriod === period
                  ? 'bg-surface text-primary border-app'
                  : 'bg-surface-elevated text-secondary hover:text-primary border-app hover:border-primary/30'
              }`}
            >
              {period} Days
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-surface-elevated rounded-lg p-1 mb-6 border border-app">
        {(['overview', 'traffic', 'performance', 'conversion'] as const).map((tab) => (
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

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">{formatNumber(safeGet(analytics, ['overview', 'totalPageViews']))}</p>
              <p className="text-sm text-secondary">Total Page Views</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">{formatNumber(safeGet(analytics, ['overview', 'uniqueVisitors']))}</p>
              <p className="text-sm text-secondary">Unique Visitors</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {Array.isArray(analytics.overview?.activeWebsites) ? analytics.overview.activeWebsites.length : 0}
              </p>
              <p className="text-sm text-secondary">Active Websites</p>
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Daily Page Views Trend</h3>
            <AnalyticsCharts
              data={Array.isArray(analytics.overview?.dailyTrend) ? analytics.overview.dailyTrend : []}
              type="line"
              dataKey="page_views"
              xAxisKey="date"
              height={300}
              color="#8B5CF6"
            />
          </div>

          {/* Top Active Websites */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Top Active Websites</h3>
            <div className="space-y-3">
              {Array.isArray(analytics.overview?.activeWebsites) && analytics.overview.activeWebsites.length > 0 ? (
                analytics.overview.activeWebsites.slice(0, 5).map((website, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg border border-app hover:border-primary/30 transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{website.title}</p>
                      <p className="text-xs text-secondary">by {website.owner}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{formatNumber(website.page_views)} views</p>
                    <p className="text-xs text-secondary">{formatNumber(website.unique_visitors)} unique</p>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8 bg-surface-elevated rounded-lg border border-app">
                  <p className="text-secondary">No active websites data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'traffic' && analytics.trafficSources && (
        <div className="space-y-6">
          {/* Traffic Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Traffic by Source</h3>
              <AnalyticsCharts
                data={Array.isArray(analytics.trafficSources?.trafficByDomain) ? analytics.trafficSources.trafficByDomain : []}
                type="pie"
                dataKey="visits"
                xAxisKey="source"
                height={300}
              />
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Traffic by Device</h3>
              <AnalyticsCharts
                data={Array.isArray(analytics.trafficSources?.trafficByDevice) ? analytics.trafficSources.trafficByDevice : []}
                type="bar"
                dataKey="visits"
                xAxisKey="device_type"
                height={300}
                color="#10B981"
              />
            </div>
          </div>

          {/* Hourly Traffic Pattern */}
          <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Hourly Traffic Pattern</h3>
            <AnalyticsCharts
              data={Array.isArray(analytics.trafficSources?.hourlyTraffic) ? analytics.trafficSources.hourlyTraffic : []}
              type="line"
              dataKey="visits"
              xAxisKey="hour"
              height={300}
              color="#F59E0B"
            />
          </div>

          {/* Traffic Source Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold text-primary mb-3">Top Traffic Sources</h4>
              <div className="space-y-2">
                {Array.isArray(analytics.trafficSources?.trafficByDomain) && analytics.trafficSources.trafficByDomain.length > 0 ? (
                  analytics.trafficSources.trafficByDomain.slice(0, 5).map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg border border-app">
                    <span className="text-primary font-medium">{source.source}</span>
                    <div className="text-right">
                      <span className="text-primary font-semibold">{formatNumber(source.visits)}</span>
                      <span className="text-secondary text-sm ml-2">({formatNumber(source.unique_visitors)} unique)</span>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-secondary">No traffic source data available</div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-md font-semibold text-primary mb-3">Device Distribution</h4>
              <div className="space-y-2">
                {Array.isArray(analytics.trafficSources?.trafficByDevice) && analytics.trafficSources.trafficByDevice.length > 0 ? (
                  analytics.trafficSources.trafficByDevice.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg border border-app">
                    <span className="text-primary font-medium">{device.device_type}</span>
                    <div className="text-right">
                      <span className="text-primary font-semibold">{formatNumber(device.visits)}</span>
                      <span className="text-secondary text-sm ml-2">({formatNumber(device.unique_visitors)} unique)</span>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-secondary">No device data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'performance' && analytics.performance && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">Website Performance Metrics</h3>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {safeToFixed(safeGet(analytics, ['performance', 'avgVisitsPerDay', 'avg_visits_per_day']))}
              </p>
              <p className="text-sm text-secondary">Avg Visits/Day</p>
              <p className="text-xs text-secondary mt-1">Max: {formatNumber(safeGet(analytics, ['performance', 'avgVisitsPerDay', 'max_daily_visits']))}</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {safeToFixed(safeGet(analytics, ['performance', 'bounceRate', 'bounce_rate']))}%
              </p>
              <p className="text-sm text-secondary">Bounce Rate</p>
              <p className="text-xs text-secondary mt-1">{formatNumber(safeGet(analytics, ['performance', 'bounceRate', 'bounced_visitors']))} bounced</p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {safeToFixed(safeGet(analytics, ['performance', 'returnVisitorRate', 'return_rate']))}%
              </p>
              <p className="text-sm text-secondary">Return Rate</p>
              <p className="text-xs text-secondary mt-1">{formatNumber(safeGet(analytics, ['performance', 'returnVisitorRate', 'return_visitors']))} returned</p>
            </div>
          </div>

          {/* Performance Details */}
          <div className="bg-surface-elevated rounded-lg border border-app p-6">
            <h4 className="text-md font-semibold text-primary mb-3">Performance Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-secondary mb-2">Visitor Behavior</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-secondary">Total Visitors:</span>
                    <span className="text-primary">{formatNumber(safeGet(analytics, ['performance', 'bounceRate', 'total_visitors']))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Unique Visitors:</span>
                    <span className="text-primary">{formatNumber(safeGet(analytics, ['performance', 'returnVisitorRate', 'total_unique_visitors']))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Return Visitors:</span>
                    <span className="text-primary">{formatNumber(safeGet(analytics, ['performance', 'returnVisitorRate', 'return_visitors']))}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-secondary mb-2">Engagement Metrics</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-secondary">Bounce Rate:</span>
                    <span className="text-primary">
                      {safeToFixed(safeGet(analytics, ['performance', 'bounceRate', 'bounce_rate']))}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Return Rate:</span>
                    <span className="text-primary">
                      {safeToFixed(safeGet(analytics, ['performance', 'returnVisitorRate', 'return_rate']))}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Avg Daily Visits:</span>
                    <span className="text-primary">
                      {safeToFixed(safeGet(analytics, ['performance', 'avgVisitsPerDay', 'avg_visits_per_day']))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Websites */}
          {Array.isArray(analytics.performance?.topWebsites) && analytics.performance.topWebsites.length > 0 && (
            <div className="bg-surface-elevated rounded-lg border border-app p-6">
              <h4 className="text-md font-semibold text-primary mb-4">Top Performing Websites (Last 30 Days)</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-app">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Website</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Owner</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-primary">Views</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-primary">Unique</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-primary">Active Days</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-primary">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.performance.topWebsites.map((website, index) => (
                      <tr key={website.id} className="border-b border-app hover:bg-surface transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-primary">{website.title || 'Untitled'}</p>
                            <p className="text-xs text-secondary">{website.slug || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-primary">{website.owner || 'Unknown'}</p>
                            <p className="text-xs text-secondary">{website.owner_email || ''}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-primary font-semibold">
                          {formatNumber(website.total_views)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-primary">
                          {formatNumber(website.unique_visitors)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-secondary">
                          {website.active_days} days
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            website.is_published 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {website.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'conversion' && analytics.conversionRates && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">Conversion Rates</h3>
          
          {/* Conversion Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {safeToFixed(safeGet(analytics, ['conversionRates', 'publicationRate', 'publication_rate']))}%
              </p>
              <p className="text-sm text-secondary">Publication Rate</p>
              <p className="text-xs text-secondary mt-1">
                {formatNumber(safeGet(analytics, ['conversionRates', 'publicationRate', 'published']))}/
                {formatNumber(safeGet(analytics, ['conversionRates', 'publicationRate', 'total_created']))}
              </p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {safeToFixed(safeGet(analytics, ['conversionRates', 'engagementRate', 'engagement_rate']))}%
              </p>
              <p className="text-sm text-secondary">User Engagement</p>
              <p className="text-xs text-secondary mt-1">
                {formatNumber(safeGet(analytics, ['conversionRates', 'engagementRate', 'users_with_websites']))}/
                {formatNumber(safeGet(analytics, ['conversionRates', 'engagementRate', 'total_users']))}
              </p>
            </div>
            <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center hover:border-primary/30 transition-all duration-200">
              <p className="text-3xl font-bold text-primary mb-2">
                {safeToFixed(safeGet(analytics, ['conversionRates', 'templateUsageRate', 'template_usage_rate']))}%
              </p>
              <p className="text-sm text-secondary">Template Usage</p>
              <p className="text-xs text-secondary mt-1">
                {formatNumber(safeGet(analytics, ['conversionRates', 'templateUsageRate', 'websites_with_templates']))}/
                {formatNumber(safeGet(analytics, ['conversionRates', 'templateUsageRate', 'total_websites']))}
              </p>
            </div>
          </div>

          {/* Conversion Details */}
          <div className="bg-surface-elevated rounded-lg border border-app p-6">
            <h4 className="text-lg font-semibold text-primary mb-4">Conversion Funnel</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-app">
                <span className="text-primary font-medium">Users Registered</span>
                <span className="text-primary font-semibold">{formatNumber(safeGet(analytics, ['conversionRates', 'engagementRate', 'total_users']))}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-app">
                <span className="text-primary font-medium">Users Created Websites</span>
                <span className="text-primary font-semibold">{formatNumber(safeGet(analytics, ['conversionRates', 'engagementRate', 'users_with_websites']))}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-app">
                <span className="text-primary font-medium">Websites Published</span>
                <span className="text-primary font-semibold">{formatNumber(safeGet(analytics, ['conversionRates', 'publicationRate', 'published']))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
