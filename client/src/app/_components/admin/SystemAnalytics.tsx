'use client';

import React, { useState, useEffect } from 'react';
import { analyticsApi, SystemAnalytics as SystemAnalyticsType, formatBytes, formatUptime, getStatusColor, getStatusBgColor } from '../../../lib/analyticsApi';
import AnalyticsCharts from './AnalyticsCharts';

interface SystemAnalyticsProps {
  className?: string;
}

export default function SystemAnalytics({ className = '' }: SystemAnalyticsProps) {
  const [analytics, setAnalytics] = useState<SystemAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'performance' | 'uptime'>('performance');

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await analyticsApi.getSystemAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch system analytics:', err);
      setError('Failed to load system analytics');
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
          <p className="text-red-400 text-lg font-medium mb-2">Error Loading System Analytics</p>
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
        <h2 className="text-xl font-semibold text-primary">System Analytics</h2>
        <div className="flex space-x-1 bg-surface rounded-lg p-1">
          {(['performance', 'uptime'] as const).map((tab) => (
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
      {selectedTab === 'performance' && analytics.performance && (
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">System Status</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(analytics.performance.status.status)} ${getStatusColor(analytics.performance.status.status)}`}>
                {analytics.performance.status.status.toUpperCase()}
              </div>
            </div>
            <p className="text-secondary">{analytics.performance.status.message}</p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.performance.averages.dbResponseTime}ms</p>
                <p className="text-sm text-secondary">Avg DB Response</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.performance.averages.apiResponseTime}ms</p>
                <p className="text-sm text-secondary">Avg API Response</p>
              </div>
            </div>
          </div>

          {/* Current System Info */}
          {analytics.performance.current && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-semibold text-primary mb-3">Current System Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-secondary">CPU Cores: <span className="text-primary">{analytics.performance.current.cpu.cores}</span></p>
                  <p className="text-sm text-secondary">CPU Model: <span className="text-primary">{analytics.performance.current.cpu.model}</span></p>
                  <p className="text-sm text-secondary">Platform: <span className="text-primary">{analytics.performance.current.platform}</span></p>
                  <p className="text-sm text-secondary">Architecture: <span className="text-primary">{analytics.performance.current.arch}</span></p>
                </div>
                <div>
                  <p className="text-sm text-secondary">Memory Total: <span className="text-primary">{formatBytes(analytics.performance.current.memory.total)}</span></p>
                  <p className="text-sm text-secondary">Memory Used: <span className="text-primary">{formatBytes(analytics.performance.current.memory.used)}</span></p>
                  <p className="text-sm text-secondary">Memory Free: <span className="text-primary">{formatBytes(analytics.performance.current.memory.free)}</span></p>
                  <p className="text-sm text-secondary">Usage: <span className="text-primary">{analytics.performance.current.memory.usagePercent}%</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Error Count */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-primary">Recent Errors</h4>
              <span className="text-2xl font-bold text-red-400">{analytics.performance.errorCount}</span>
            </div>
            <p className="text-sm text-secondary">Errors in the last hour</p>
          </div>
        </div>
      )}

      {selectedTab === 'uptime' && analytics.uptime && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">System Uptime</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatUptime(analytics.uptime.system.uptime)}</p>
                <p className="text-sm text-secondary">System Uptime</p>
                <p className="text-xs text-gray-500">Boot: {new Date(analytics.uptime.system.bootTime).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatUptime(analytics.uptime.application.uptime / 1000)}</p>
                <p className="text-sm text-secondary">Application Uptime</p>
                <p className="text-xs text-gray-500">Started: {new Date(analytics.uptime.application.startTime).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{analytics.uptime.database.responseTime}ms</p>
                <p className="text-sm text-secondary">DB Response Time</p>
                <p className={`text-xs ${analytics.uptime.database.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
                  Status: {analytics.uptime.database.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
