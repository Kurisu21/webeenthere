'use client';

import React, { useState, useEffect } from 'react';
import { getUserWebsiteAnalytics, UserWebsitePerformance, formatNumber } from '../../../lib/analyticsApi';

interface UserWebsitePerformanceProps {
  className?: string;
}

export default function UserWebsitePerformance({ className = '' }: UserWebsitePerformanceProps) {
  const [data, setData] = useState<UserWebsitePerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedWebsite]);

  const fetchData = async () => {
    try {
      const websiteData = await getUserWebsiteAnalytics(selectedWebsite || undefined);
      
      // Check if user has any websites
      if (!websiteData.websites || websiteData.websites.length === 0) {
        setData(null);
        setError(null);
        return;
      }
      
      setData(websiteData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch website performance:', err);
      setError('Failed to load website performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };


  if (isLoading) {
    return (
      <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-surface rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-surface rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-surface rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium mb-2">Error Loading Data</p>
          <p className="text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-secondary font-medium mb-2">No Website Data</p>
          <p className="text-muted text-sm">Create and publish websites to see performance metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-elevated rounded-lg border border-app p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary">Website Performance</h3>
        {data.websites.length > 1 && (
          <select
            value={selectedWebsite || ''}
            onChange={(e) => setSelectedWebsite(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-1 text-sm border border-app rounded-md bg-surface text-primary"
          >
            <option value="">All Websites</option>
            {data.websites.map((website) => (
              <option key={website.id} value={website.id}>
                {website.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-500/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Views</p>
              <p className="text-2xl font-bold text-primary">
                {formatNumber(data.performance.totalViews)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Unique Visitors</p>
              <p className="text-2xl font-bold text-primary">
                {formatNumber(data.performance.uniqueVisitors)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-purple-500/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Avg Views/Day</p>
              <p className="text-2xl font-bold text-primary">
                {formatNumber(data.performance.avgViewsPerDay)}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Website List */}
      <div>
        <h4 className="text-md font-semibold text-primary mb-4">Your Websites</h4>
        {data.websites.length > 0 ? (
          <div className="space-y-3">
            {data.websites.map((website) => (
              <div key={website.id} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-primary">{website.title}</p>
                    <p className="text-sm text-secondary">
                      {website.is_published ? 'Published' : 'Draft'} • Created: {formatDate(website.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">
                    {formatNumber(website.total_views || 0)} views
                  </p>
                  <p className="text-sm text-secondary">
                    {formatNumber(website.unique_visitors || 0)} unique visitors
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">No Websites Yet</h3>
            <p className="text-secondary mb-4">Create your first website to start tracking performance metrics</p>
            <button
              onClick={() => window.location.href = '/user/create'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Website
            </button>
          </div>
        )}
      </div>


      {/* Performance Tips */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-primary text-sm font-medium">Website Performance Tips</p>
            <ul className="text-secondary text-xs mt-1 space-y-1">
              <li>• Share your website URL to increase visitor count</li>
              <li>• Publish your website to make it publicly accessible</li>
              <li>• Update content regularly to encourage return visits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
