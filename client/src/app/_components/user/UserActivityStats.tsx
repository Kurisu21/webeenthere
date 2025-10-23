'use client';

import React, { useState, useEffect } from 'react';
import { userActivityApi } from '../../../lib/userActivityApi';

interface UserActivityStatsProps {
  className?: string;
}

const UserActivityStats: React.FC<UserActivityStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<{
    total: number;
    recentWeek: number;
    actions: Array<{ action: string; count: number }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userActivityApi.getUserActivityStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch activity stats:', err);
      setError('Failed to load activity statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-app rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-surface-elevated rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-surface-elevated rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`bg-red-500/20 border border-red-500/30 rounded-lg p-4 ${className}`}>
        <p className="text-red-400">{error || 'Failed to load statistics'}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {/* Total Activities */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Total Activities</p>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Week Activities */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Last 7 Days</p>
            <p className="text-3xl font-bold mt-2">{stats.recentWeek}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Most Common Action */}
      <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Most Common Action</p>
            <p className="text-lg font-bold mt-2 truncate">
              {stats.actions && stats.actions.length > 0
                ? stats.actions[0].action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                : 'No activities yet'}
            </p>
            {stats.actions && stats.actions.length > 0 && (
              <p className="text-sm opacity-75 mt-1">{stats.actions[0].count} times</p>
            )}
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityStats;



