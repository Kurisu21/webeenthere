'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../../_components/layout/DashboardHeader';
import AdminSidebar from '../../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../../_components/layout/MainContentWrapper';
import AssignPlanModal from '../../../_components/admin/AssignPlanModal';
import InvoiceReceipt from '../../../_components/subscription/InvoiceReceipt';
import { adminSubscriptionApi, UserSubscriptionDetails, SubscriptionLog, PaymentTransaction } from '../../../../lib/adminSubscriptionApi';
import { Invoice } from '../../../../lib/invoiceApi';
import { useRouter, useParams } from 'next/navigation';

export default function UserSubscriptionDetailsPage() {
  const [userDetails, setUserDetails] = useState<UserSubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showInvoiceReceipt, setShowInvoiceReceipt] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const router = useRouter();
  const params = useParams();
  
  const userId = params?.userId ? parseInt(params.userId as string) : null;

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminSubscriptionApi.getUserSubscriptionDetails(userId);
      
      if (response.success) {
        setUserDetails(response.data);
      } else {
        setError(response.error || 'Failed to load user subscription details');
      }
    } catch (err) {
      console.error('Failed to fetch user subscription details:', err);
      setError('Failed to load user subscription details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignPlan = async (data: {
    userId: number;
    planId: number;
    startDate?: string;
    endDate?: string;
    paymentReference?: string;
  }) => {
    try {
      setIsAssigning(true);
      setError(null);

      const response = await adminSubscriptionApi.assignPlan(data);

      if (response.success) {
        setShowAssignModal(false);
        
        // Show invoice receipt if available (for paid plans)
        if (response.data?.invoice) {
          setInvoice(response.data.invoice);
          setShowInvoiceReceipt(true);
        }
        
        await fetchUserDetails();
      } else {
        setError(response.error || 'Failed to assign plan');
      }
    } catch (err) {
      console.error('Failed to assign plan:', err);
      setError('Failed to assign plan');
    } finally {
      setIsAssigning(false);
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <MainContentWrapper>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-primary">Loading user subscription details...</p>
              </div>
            </div>
          </MainContentWrapper>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <MainContentWrapper>
            <div className="p-6">
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-xl font-semibold text-primary mb-2">Error Loading Details</h3>
                <p className="text-secondary mb-4">{error}</p>
                <button
                  onClick={() => router.back()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Go Back
                </button>
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
        <AdminSidebar />
        <MainContentWrapper>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">User Subscription Details</h1>
                  <p className="text-secondary">User ID: {userId}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.back()}
                    className="bg-surface-elevated hover:bg-surface border border-app text-primary px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Assign New Plan
                  </button>
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

            {userDetails && (
              <div className="space-y-8">
                {/* Current Subscription */}
                <div className="bg-surface-elevated rounded-lg border border-app p-6">
                  <h2 className="text-xl font-bold text-primary mb-4">Current Subscription</h2>
                  {userDetails.subscription ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-primary mb-2">Plan Details</h3>
                        <div className="space-y-2 text-secondary">
                          <div>Plan: {userDetails.subscription.plan_name} ({userDetails.subscription.plan_type})</div>
                          <div>Price: {formatCurrency(userDetails.subscription.price)}</div>
                          <div>Started: {new Date(userDetails.subscription.start_date).toLocaleDateString()}</div>
                          {userDetails.subscription.end_date && (
                            <div>Expires: {new Date(userDetails.subscription.end_date).toLocaleDateString()}</div>
                          )}
                          <div>Auto-renew: {userDetails.subscription.auto_renew ? 'Yes' : 'No'}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary mb-2">Features</h3>
                        <div className="space-y-2 text-secondary">
                          <div>Websites: {userDetails.subscription.website_limit === null ? 'Unlimited' : userDetails.subscription.website_limit}</div>
                          <div>AI Chat: {userDetails.subscription.ai_chat_limit === null ? 'Unlimited' : userDetails.subscription.ai_chat_limit}</div>
                          <div>Features: {userDetails.subscription.features}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-primary mb-2">No Active Subscription</h3>
                      <p className="text-secondary">This user doesn't have an active subscription.</p>
                    </div>
                  )}
                </div>

                {/* Subscription History */}
                <div className="bg-surface-elevated rounded-lg border border-app p-6">
                  <h2 className="text-xl font-bold text-primary mb-4">Subscription History</h2>
                  {userDetails.logs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-surface border-b border-app">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Action</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Plan</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                          {userDetails.logs.map((log) => (
                            <tr key={log.id}>
                              <td className="px-4 py-3 text-sm text-secondary">{formatDateTime(log.created_at)}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getActionBadgeColor(log.action)}`}>
                                  {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-primary">{log.plan_name}</td>
                              <td className="px-4 py-3 text-sm text-secondary">{formatCurrency(log.amount)}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusBadgeColor(log.payment_status)}`}>
                                  {log.payment_status.charAt(0).toUpperCase() + log.payment_status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-secondary">No subscription history found.</p>
                    </div>
                  )}
                </div>

                {/* Payment Transactions */}
                <div className="bg-surface-elevated rounded-lg border border-app p-6">
                  <h2 className="text-xl font-bold text-primary mb-4">Payment Transactions</h2>
                  {userDetails.transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-surface border-b border-app">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Plan</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-app">
                          {userDetails.transactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td className="px-4 py-3 text-sm text-secondary">{formatDateTime(transaction.created_at)}</td>
                              <td className="px-4 py-3 text-sm text-primary">{transaction.plan_name}</td>
                              <td className="px-4 py-3 text-sm text-secondary">{formatCurrency(transaction.amount)}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusBadgeColor(transaction.status)}`}>
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-secondary font-mono">{transaction.transaction_reference}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-secondary">No payment transactions found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assign Plan Modal */}
            <AssignPlanModal
              isOpen={showAssignModal}
              onClose={() => setShowAssignModal(false)}
              onAssign={handleAssignPlan}
              isLoading={isAssigning}
              userId={userId}
            />

            {/* Invoice Receipt */}
            {invoice && showInvoiceReceipt && (
              <InvoiceReceipt
                invoice={invoice}
                onClose={() => {
                  setShowInvoiceReceipt(false);
                  setInvoice(null);
                }}
              />
            )}
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}


