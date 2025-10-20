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
  const [selectedTab, setSelectedTab] = useState<'performance' | 'uptime' | 'resources' | 'alerts'>('performance');

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
      <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 text-lg font-medium mb-2">Error Loading System Analytics</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">System Analytics</h2>
        <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
          {(['performance', 'uptime', 'resources', 'alerts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
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
              <h3 className="text-lg font-semibold text-white">System Status</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(analytics.performance.status.status)} ${getStatusColor(analytics.performance.status.status)}`}>
                {analytics.performance.status.status.toUpperCase()}
              </div>
            </div>
            <p className="text-gray-400">{analytics.performance.status.message}</p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{analytics.performance.averages.cpuLoad}</p>
                <p className="text-sm text-gray-400">Avg CPU Load</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{analytics.performance.averages.memoryUsage}%</p>
                <p className="text-sm text-gray-400">Avg Memory Usage</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{analytics.performance.averages.dbResponseTime}ms</p>
                <p className="text-sm text-gray-400">Avg DB Response</p>
              </div>
            </div>
          </div>

          {/* Current System Info */}
          {analytics.performance.current && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-semibold text-white mb-3">Current System Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">CPU Cores: <span className="text-white">{analytics.performance.current.cpu.cores}</span></p>
                  <p className="text-sm text-gray-400">CPU Model: <span className="text-white">{analytics.performance.current.cpu.model}</span></p>
                  <p className="text-sm text-gray-400">Platform: <span className="text-white">{analytics.performance.current.platform}</span></p>
                  <p className="text-sm text-gray-400">Architecture: <span className="text-white">{analytics.performance.current.arch}</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Memory Total: <span className="text-white">{formatBytes(analytics.performance.current.memory.total)}</span></p>
                  <p className="text-sm text-gray-400">Memory Used: <span className="text-white">{formatBytes(analytics.performance.current.memory.used)}</span></p>
                  <p className="text-sm text-gray-400">Memory Free: <span className="text-white">{formatBytes(analytics.performance.current.memory.free)}</span></p>
                  <p className="text-sm text-gray-400">Usage: <span className="text-white">{analytics.performance.current.memory.usagePercent}%</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Error Count */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-white">Recent Errors</h4>
              <span className="text-2xl font-bold text-red-400">{analytics.performance.errorCount}</span>
            </div>
            <p className="text-sm text-gray-400">Errors in the last hour</p>
          </div>
        </div>
      )}

      {selectedTab === 'uptime' && analytics.uptime && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">System Uptime</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatUptime(analytics.uptime.system.uptime)}</p>
                <p className="text-sm text-gray-400">System Uptime</p>
                <p className="text-xs text-gray-500">Boot: {new Date(analytics.uptime.system.bootTime).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatUptime(analytics.uptime.application.uptime / 1000)}</p>
                <p className="text-sm text-gray-400">Application Uptime</p>
                <p className="text-xs text-gray-500">Started: {new Date(analytics.uptime.application.startTime).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{analytics.uptime.database.responseTime}ms</p>
                <p className="text-sm text-gray-400">DB Response Time</p>
                <p className={`text-xs ${analytics.uptime.database.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
                  Status: {analytics.uptime.database.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'resources' && analytics.resources && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Resource Usage</h3>
          
          {/* Database Table Sizes */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-md font-semibold text-white mb-3">Database Table Sizes</h4>
            <div className="space-y-2">
              {analytics.resources.database.tableSizes.slice(0, 5).map((table, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                  <span className="text-white font-medium">{table.table_name}</span>
                  <div className="text-right">
                    <span className="text-white">{table['Size (MB)']} MB</span>
                    <span className="text-gray-400 text-sm ml-2">({formatNumber(table.table_rows)} rows)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Pool Status */}
          {analytics.resources.database.poolStatus && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-md font-semibold text-white mb-3">Database Connection Pool</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{analytics.resources.database.poolStatus.totalConnections}</p>
                  <p className="text-sm text-gray-400">Total Connections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{analytics.resources.database.poolStatus.freeConnections}</p>
                  <p className="text-sm text-gray-400">Free Connections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{analytics.resources.database.poolStatus.acquiringConnections}</p>
                  <p className="text-sm text-gray-400">Acquiring</p>
                </div>
              </div>
            </div>
          )}

          {/* System Resources */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-md font-semibold text-white mb-3">System Resources</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Load Average (1m): <span className="text-white">{analytics.resources.system.loadAverage[0].toFixed(2)}</span></p>
                <p className="text-sm text-gray-400">Load Average (5m): <span className="text-white">{analytics.resources.system.loadAverage[1].toFixed(2)}</span></p>
                <p className="text-sm text-gray-400">Load Average (15m): <span className="text-white">{analytics.resources.system.loadAverage[2].toFixed(2)}</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Memory Total: <span className="text-white">{formatBytes(analytics.resources.system.memoryUsage.total)}</span></p>
                <p className="text-sm text-gray-400">Memory Used: <span className="text-white">{formatBytes(analytics.resources.system.memoryUsage.used)}</span></p>
                <p className="text-sm text-gray-400">Memory Free: <span className="text-white">{formatBytes(analytics.resources.system.memoryUsage.free)}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'alerts' && analytics.alerts && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">System Alerts</h3>
          
          {analytics.alerts.length > 0 ? (
            <div className="space-y-3">
              {analytics.alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'bg-red-500/10 border-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                  'bg-blue-500/10 border-blue-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{alert.message}</p>
                      <p className="text-sm text-gray-400">Category: {alert.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Value: {alert.value}</p>
                      <p className="text-sm text-gray-400">Threshold: {alert.threshold}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400">No active alerts</p>
              <p className="text-sm text-gray-500">All systems are operating normally</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
