'use client';

import React, { useState, useEffect } from 'react';
import { analyticsApi, WebsiteAnalytics as WebsiteAnalyticsType, formatNumber, formatPercentage } from '../../../lib/analyticsApi';
import AnalyticsCharts from './AnalyticsCharts';

interface WebsiteAnalyticsProps {
  className?: string;
}

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
    <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Website Analytics</h2>
        <div className="flex space-x-2">
          {(['7', '30', '90'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-purple-600 text-primary'
                  : 'bg-surface-elevated text-secondary hover:bg-surface'
              }`}
            >
              {period} Days
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-surface rounded-lg p-1 mb-6">
        {(['overview', 'traffic', 'performance', 'conversion'] as const).map((tab) => (
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

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatNumber(analytics.overview.totalPageViews)}</p>
                <p className="text-sm text-secondary">Total Page Views</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatNumber(analytics.overview.uniqueVisitors)}</p>
                <p className="text-sm text-secondary">Unique Visitors</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.overview.activeWebsites.length}</p>
                <p className="text-sm text-secondary">Active Websites</p>
              </div>
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-primary mb-4">Daily Page Views Trend</h3>
            <AnalyticsCharts
              data={analytics.overview.dailyTrend}
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
            <div className="space-y-2">
              {analytics.overview.activeWebsites.slice(0, 5).map((website, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs text-purple-400 font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{website.title}</p>
                      <p className="text-xs text-secondary">by {website.owner}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{formatNumber(website.page_views)} views</p>
                    <p className="text-xs text-secondary">{formatNumber(website.unique_visitors)} unique</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'traffic' && analytics.trafficSources && (
        <div className="space-y-6">
          {/* Traffic Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-primary mb-4">Traffic by Source</h3>
              <AnalyticsCharts
                data={analytics.trafficSources.trafficByDomain}
                type="pie"
                dataKey="visits"
                xAxisKey="source"
                height={300}
              />
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-primary mb-4">Traffic by Device</h3>
              <AnalyticsCharts
                data={analytics.trafficSources.trafficByDevice}
                type="bar"
                dataKey="visits"
                xAxisKey="device_type"
                height={300}
                color="#10B981"
              />
            </div>
          </div>

          {/* Hourly Traffic Pattern */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-primary mb-4">Hourly Traffic Pattern</h3>
            <AnalyticsCharts
              data={analytics.trafficSources.hourlyTraffic}
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
                {analytics.trafficSources.trafficByDomain.slice(0, 5).map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-primary font-medium">{source.source}</span>
                    <div className="text-right">
                      <span className="text-primary">{formatNumber(source.visits)}</span>
                      <span className="text-secondary text-sm ml-2">({formatNumber(source.unique_visitors)} unique)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-md font-semibold text-primary mb-3">Device Distribution</h4>
              <div className="space-y-2">
                {analytics.trafficSources.trafficByDevice.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-primary font-medium">{device.device_type}</span>
                    <div className="text-right">
                      <span className="text-primary">{formatNumber(device.visits)}</span>
                      <span className="text-secondary text-sm ml-2">({formatNumber(device.unique_visitors)} unique)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'performance' && analytics.performance && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">Website Performance Metrics</h3>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.performance.avgVisitsPerDay.avg_visits_per_day.toFixed(1)}</p>
                <p className="text-sm text-secondary">Avg Visits/Day</p>
                <p className="text-xs text-gray-500">Max: {formatNumber(analytics.performance.avgVisitsPerDay.max_daily_visits)}</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.performance.bounceRate.bounce_rate.toFixed(1)}%</p>
                <p className="text-sm text-secondary">Bounce Rate</p>
                <p className="text-xs text-gray-500">{formatNumber(analytics.performance.bounceRate.bounced_visitors)} bounced</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.performance.returnVisitorRate.return_rate.toFixed(1)}%</p>
                <p className="text-sm text-secondary">Return Rate</p>
                <p className="text-xs text-gray-500">{formatNumber(analytics.performance.returnVisitorRate.return_visitors)} returned</p>
              </div>
            </div>
          </div>

          {/* Performance Details */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-md font-semibold text-primary mb-3">Performance Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-secondary mb-2">Visitor Behavior</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-secondary">Total Visitors:</span>
                    <span className="text-primary">{formatNumber(analytics.performance.bounceRate.total_visitors)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Unique Visitors:</span>
                    <span className="text-primary">{formatNumber(analytics.performance.returnVisitorRate.total_unique_visitors)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Return Visitors:</span>
                    <span className="text-primary">{formatNumber(analytics.performance.returnVisitorRate.return_visitors)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-secondary mb-2">Engagement Metrics</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-secondary">Bounce Rate:</span>
                    <span className="text-primary">{analytics.performance.bounceRate.bounce_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Return Rate:</span>
                    <span className="text-primary">{analytics.performance.returnVisitorRate.return_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Avg Daily Visits:</span>
                    <span className="text-primary">{analytics.performance.avgVisitsPerDay.avg_visits_per_day.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'conversion' && analytics.conversionRates && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">Conversion Rates</h3>
          
          {/* Conversion Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.conversionRates.publicationRate.publication_rate.toFixed(1)}%</p>
                <p className="text-sm text-secondary">Publication Rate</p>
                <p className="text-xs text-gray-500">{formatNumber(analytics.conversionRates.publicationRate.published)}/{formatNumber(analytics.conversionRates.publicationRate.total_created)}</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.conversionRates.engagementRate.engagement_rate.toFixed(1)}%</p>
                <p className="text-sm text-secondary">User Engagement</p>
                <p className="text-xs text-gray-500">{formatNumber(analytics.conversionRates.engagementRate.users_with_websites)}/{formatNumber(analytics.conversionRates.engagementRate.total_users)}</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.conversionRates.templateUsageRate.template_usage_rate.toFixed(1)}%</p>
                <p className="text-sm text-secondary">Template Usage</p>
                <p className="text-xs text-gray-500">{formatNumber(analytics.conversionRates.templateUsageRate.websites_with_templates)}/{formatNumber(analytics.conversionRates.templateUsageRate.total_websites)}</p>
              </div>
            </div>
          </div>

          {/* Conversion Details */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-md font-semibold text-primary mb-3">Conversion Funnel</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-600/30 rounded">
                <span className="text-primary font-medium">Users Registered</span>
                <span className="text-primary">{formatNumber(analytics.conversionRates.engagementRate.total_users)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-600/30 rounded">
                <span className="text-primary font-medium">Users Created Websites</span>
                <span className="text-primary">{formatNumber(analytics.conversionRates.engagementRate.users_with_websites)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-600/30 rounded">
                <span className="text-primary font-medium">Websites Published</span>
                <span className="text-primary">{formatNumber(analytics.conversionRates.publicationRate.published)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
