'use client';

import React, { useState, useEffect } from 'react';
import { analyticsApi, RealTimeMetrics as RealTimeMetricsType, formatNumber } from '../../../lib/analyticsApi';

interface RealTimeMetricsProps {
  className?: string;
}

export default function RealTimeMetrics({ className = '' }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState<RealTimeMetricsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchMetrics();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await analyticsApi.getRealTimeMetrics();
      setMetrics(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch real-time metrics:', err);
      setError('Failed to load real-time metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className={`bg-surface rounded-lg border border-app p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-surface-elevated rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-surface-elevated rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-surface-elevated rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-surface rounded-lg border border-app p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium mb-2">Error Loading Real-time Data</p>
          <p className="text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className={`bg-surface rounded-lg border border-app p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-primary mb-1">Real-time Metrics</h3>
          <p className="text-sm text-secondary">Live activity monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-secondary">
            {lastUpdate ? `Updated ${formatTime(lastUpdate.toISOString())}` : 'Live'}
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-elevated rounded-lg border border-app p-6 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm mb-1">Last Hour Activities</p>
              <p className="text-3xl font-bold text-primary">{formatNumber(metrics.lastHourActivities)}</p>
            </div>
            <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg border border-app p-6 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm mb-1">Active Users (1h)</p>
              <p className="text-3xl font-bold text-primary">{formatNumber(metrics.activeUsersLastHour)}</p>
            </div>
            <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg border border-app p-6 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm mb-1">Today's Activities</p>
              <p className="text-3xl font-bold text-primary">{formatNumber(metrics.systemHealth.total_activities_today)}</p>
            </div>
            <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-primary mb-4">Recent Activities</h4>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {metrics.recentActivities.length > 0 ? (
            metrics.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg border border-app hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-medium text-primary">
                      {activity.username ? activity.username.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-secondary">
                      {activity.username || 'Anonymous'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-secondary">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-surface-elevated rounded-lg border border-app">
              <svg className="w-12 h-12 text-secondary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-secondary">No recent activities</p>
            </div>
          )}
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="pt-6 border-t border-app">
        <h4 className="text-lg font-semibold text-primary mb-4">Today's Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{formatNumber(metrics.systemHealth.unique_users_today)}</p>
            <p className="text-sm text-secondary">Unique Users Today</p>
          </div>
          <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{formatNumber(metrics.systemHealth.failed_attempts_today)}</p>
            <p className="text-sm text-secondary">Failed Attempts</p>
          </div>
          <div className="bg-surface-elevated rounded-lg border border-app p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">
              {metrics.systemHealth.failed_attempts_today > 0 
                ? ((metrics.systemHealth.total_activities_today - metrics.systemHealth.failed_attempts_today) / metrics.systemHealth.total_activities_today * 100).toFixed(1)
                : 100
              }%
            </p>
            <p className="text-sm text-secondary">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
