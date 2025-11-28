'use client';

import React, { useState, useEffect } from 'react';
import { SubscriptionLog } from '../../../../lib/subscriptionApi';

// Custom hook to detect dark mode
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(isDark);
      }
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => observer.disconnect();
  }, []);

  return { isDarkMode };
};

interface SubscriptionHistoryProps {
  history: SubscriptionLog[];
  isLoading?: boolean;
}

export default function SubscriptionHistory({ history, isLoading }: SubscriptionHistoryProps) {
  const { isDarkMode } = useDarkMode();

  const formatAction = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  const formatPaymentStatus = (status: string) => {
    if (status === 'completed') return 'Success';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="bg-surface-elevated rounded-lg border border-app p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Subscription History</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-surface-elevated rounded-lg border border-app p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Subscription History</h2>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-primary mb-2">No History Yet</h3>
          <p className="text-secondary">Your subscription history will appear here once you make changes to your plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-lg border border-app p-6">
      <h2 className="text-xl font-bold text-primary mb-6">Subscription History</h2>
      <div className="space-y-4">
        {history.map((log) => {
          const isSuccess = log.payment_status === 'completed';
          const isFailed = log.payment_status === 'failed';
          const isPending = log.payment_status === 'pending';

          return (
            <div
              key={log.id}
              className={`border rounded-lg p-4 ${
                isDarkMode 
                  ? 'bg-surface border-app text-primary' 
                  : 'bg-white border-gray-200 text-black'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold text-lg text-primary">
                      {formatAction(log.action)} - {log.plan_name}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      isSuccess
                        ? 'bg-green-500 text-white'
                        : isFailed
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {formatPaymentStatus(log.payment_status)}
                    </span>
                  </div>
                  <div className="text-sm text-secondary space-y-1">
                    <div>Plan Type: <span className="font-medium text-primary">{log.plan_type}</span></div>
                    {log.amount > 0 && (
                      <div>Amount: <span className="font-medium text-primary">${parseFloat(log.amount.toString()).toFixed(2)}</span></div>
                    )}
                    {log.payment_reference && (
                      <div className="text-xs">
                        Reference: <span className="font-mono text-primary">{log.payment_reference}</span>
                      </div>
                    )}
                    <div className="text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
