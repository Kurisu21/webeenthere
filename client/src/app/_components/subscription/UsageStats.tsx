'use client';

import React from 'react';
import { UsageLimits } from '../../../lib/subscriptionApi';

interface UsageStatsProps {
  limits: UsageLimits;
  className?: string;
}

const UsageStats: React.FC<UsageStatsProps> = ({ limits, className = '' }) => {
  const { website, aiChat } = limits;

  const getProgressPercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (canUse: boolean, remaining: number, limit: number) => {
    if (limit === -1) return 'Unlimited';
    if (!canUse) return 'Limit reached';
    if (remaining <= 2) return 'Almost full';
    return `${remaining} remaining`;
  };

  const getStatusColor = (canUse: boolean, remaining: number, limit: number) => {
    if (limit === -1) return 'text-green-500';
    if (!canUse) return 'text-red-500';
    if (remaining <= 2) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Website Usage */}
      <div className="bg-surface-elevated rounded-lg p-6 border border-app">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-primary">Websites</h3>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(website.canCreate, website.remaining, website.limit)}`}>
            {getStatusText(website.canCreate, website.remaining, website.limit)}
          </span>
        </div>

        {website.limit !== -1 && (
          <>
            <div className="flex items-center justify-between text-sm text-secondary mb-2">
              <span>{website.used || 0} used</span>
              <span>{website.limit} total</span>
            </div>
            <div className="w-full bg-surface rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(getProgressPercentage(website.used || 0, website.limit))}`}
                style={{ width: `${getProgressPercentage(website.used || 0, website.limit)}%` }}
              ></div>
            </div>
          </>
        )}

        {website.limit === -1 && (
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-green-500 mb-2">∞</div>
            <div className="text-secondary">Unlimited websites</div>
          </div>
        )}
      </div>

      {/* AI Chat Usage */}
      <div className="bg-surface-elevated rounded-lg p-6 border border-app">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-semibold text-primary">AI Chat Messages</h3>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(aiChat.canUse, aiChat.remaining, aiChat.limit)}`}>
            {getStatusText(aiChat.canUse, aiChat.remaining, aiChat.limit)}
          </span>
        </div>

        {aiChat.limit !== -1 && (
          <>
            <div className="flex items-center justify-between text-sm text-secondary mb-2">
              <span>{aiChat.used || 0} used</span>
              <span>{aiChat.limit} total</span>
            </div>
            <div className="w-full bg-surface rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(getProgressPercentage(aiChat.used || 0, aiChat.limit))}`}
                style={{ width: `${getProgressPercentage(aiChat.used || 0, aiChat.limit)}%` }}
              ></div>
            </div>
          </>
        )}

        {aiChat.limit === -1 && (
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-green-500 mb-2">∞</div>
            <div className="text-secondary">Unlimited AI messages</div>
          </div>
        )}
      </div>

      {/* Usage Tips (theme-aware) */}
      <div className="rounded-lg p-4 border flex items-start bg-surface-elevated border-app">
        <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-primary text-sm font-medium">Usage Tips</p>
          <ul className="text-secondary text-xs mt-1 space-y-1">
            <li>• AI chat usage resets monthly</li>
            <li>• Website limits are permanent until you upgrade</li>
            <li>• Upgrade anytime to unlock unlimited features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UsageStats;
