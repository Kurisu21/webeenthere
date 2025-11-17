'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../../_components/layout/MainContentWrapper';
import { subscriptionApi, SubscriptionLog } from '../../../../lib/subscriptionApi';
import { useAuth } from '../../../_components/auth/AuthContext';

export default function SubscriptionHistoryPage() {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<SubscriptionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionHistory();
  }, []);

  const loadSubscriptionHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await subscriptionApi.getHistory(100);

      if (response.success) {
        setHistory(response.data);
      } else {
        setError(response.error || 'Failed to load subscription history');
      }
    } catch (err) {
      console.error('Failed to load subscription history:', err);
      setError('Failed to load subscription history');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-blue-500';
      case 'upgraded': return 'bg-green-500';
      case 'downgraded': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'renewed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <DashboardSidebar />
          <MainContentWrapper>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-primary">Loading subscription history...</p>
              </div>
            </div>
          </MainContentWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">Subscription History</h1>
                  <p className="text-secondary">View your subscription changes and payment history</p>
                </div>
                <div className="text-sm text-secondary">
                  {history.length} total records
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-300">{error}</span>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-primary">Loading subscription history...</p>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-xl font-semibold text-primary mb-2">No Subscription History</h3>
                <p className="text-secondary">You haven't made any subscription changes yet.</p>
              </div>
            ) : (
              <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface border-b border-app">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Reference
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {history.map((log) => (
                        <tr key={log.id} className="hover:bg-surface transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                            {formatDateTime(log.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getActionBadgeColor(log.action)}`}>
                              {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                            {log.plan_name} ({log.plan_type})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                            {formatCurrency(log.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getPaymentStatusBadgeColor(log.payment_status)}`}>
                              {log.payment_status.charAt(0).toUpperCase() + log.payment_status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary font-mono">
                            {log.payment_reference || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}



