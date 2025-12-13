'use client';

import React, { useState, useEffect } from 'react';
import { activityApi, ActivityStats as ActivityStatsType } from '../../../lib/activityApi';

interface ActivityStatsProps {
  className?: string;
}

export default function ActivityStats({ className = '' }: ActivityStatsProps) {
  const [stats, setStats] = useState<ActivityStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const statsData = await activityApi.getActivityStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch activity stats:', err);
      setError('Failed to load activity statistics');
      setStats(null); // Set to null on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) {
      return '0';
    }
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendIcon = (action: string): string => {
    const actionIcons: Record<string, string> = {
      'user_management': '👤',
      'settings_update': '⚙️',
      'role_change': '🔑',
      'status_change': '📊',
      'profile_update': '✏️',
      'system_action': '🔧',
      'admin_login': '🔐',
      'failed_login_attempt': '❌',
      'data_export': '📤',
      'system_maintenance': '🛠️'
    };

    for (const [key, icon] of Object.entries(actionIcons)) {
      if (action.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '📝';
  };

  const getActionColor = (action: string): string => {
    if (action.includes('login')) return 'text-green-400';
    if (action.includes('failed')) return 'text-red-400';
    if (action.includes('role') || action.includes('status')) return 'text-yellow-400';
    if (action.includes('settings') || action.includes('system')) return 'text-blue-400';
    if (action.includes('export') || action.includes('maintenance')) return 'text-purple-400';
    return 'text-secondary';
  };

  if (isLoading) {
    return (
      <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-surface rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <p className="text-red-400 text-lg font-medium mb-2">Error Loading Statistics</p>
          <p className="text-secondary">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary font-medium py-2 px-4 rounded-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Activity Statistics</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-elevated rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Activities</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(stats.totalActivities)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Today's Activities</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(stats.todayActivities)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Top Action</p>
              <p className="text-lg font-semibold text-primary truncate">
                {stats.topActions[0]?.action || 'N/A'}
              </p>
              <p className="text-sm text-secondary">
                {stats.topActions[0]?.count || 0} times
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-lg">
                {getTrendIcon(stats.topActions[0]?.action || '')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Most Active User</p>
              <p className="text-lg font-semibold text-primary truncate">
                {stats.topUsers[0]?.user.split(' (')[0] || 'N/A'}
              </p>
              <p className="text-sm text-secondary">
                {stats.topUsers[0]?.count || 0} activities
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Top Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Top Actions</h3>
        <div className="space-y-2">
          {stats.topActions.slice(0, 5).map((action, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-3">{getTrendIcon(action.action)}</span>
                <span className={`font-medium ${getActionColor(action.action)}`}>
                  {action.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <span className="text-primary font-semibold">{action.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h3 className="text-lg font-semibold text-primary mb-4">Recent Activities</h3>
        <div className="space-y-2">
          {stats.recentActivities.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-3">{getTrendIcon(activity.action)}</span>
                <div>
                  <p className={`text-sm font-medium ${getActionColor(activity.action)}`}>
                    {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-secondary">{activity.username}</p>
                </div>
              </div>
              <span className="text-xs text-secondary">
                {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
