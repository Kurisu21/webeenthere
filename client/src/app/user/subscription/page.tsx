'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import PricingCard from '../../_components/subscription/PricingCard';
import StripePaymentModal from '../../_components/subscription/StripePaymentModal';
import InvoiceReceipt from '../../_components/subscription/InvoiceReceipt';
import UsageStats from '../../_components/subscription/UsageStats';
import SubscriptionBadge from '../../_components/subscription/SubscriptionBadge';
import SubscriptionHistory from '../../_components/subscription/SubscriptionHistory';
import { subscriptionApi, Plan, Subscription, UsageLimits, SubscriptionLog } from '../../../lib/subscriptionApi';
import { Invoice } from '../../../lib/invoiceApi';
import { useAuth } from '../../_components/auth/AuthContext';

export default function SubscriptionPage() {
  const { user, token } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceReceipt, setShowInvoiceReceipt] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [plansResponse, subscriptionResponse, limitsResponse, historyResponse] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getCurrentSubscription(),
        subscriptionApi.checkLimits(),
        subscriptionApi.getHistory(50)
      ]);

      if (plansResponse.success) {
        setPlans(plansResponse.data);
      }

      if (subscriptionResponse.success) {
        setCurrentSubscription(subscriptionResponse.data);
      }

      if (limitsResponse.success) {
        setUsageLimits(limitsResponse.data);
      }

      if (historyResponse.success) {
        setSubscriptionHistory(historyResponse.data);
      }
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setError('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // For free plans, subscribe directly without showing payment modal
    if (plan.type === 'free' || plan.price === 0) {
      try {
        setIsSubscribing(true);
        setError(null);
        setSuccess(null);

        const response = await subscriptionApi.subscribe(plan.id, undefined);

        if (response.success) {
          setSuccess('Subscription updated successfully!');
          await loadSubscriptionData();
          // Reload history
          const historyResponse = await subscriptionApi.getHistory(50);
          if (historyResponse.success) {
            setSubscriptionHistory(historyResponse.data);
          }
        } else {
          setError(response.error || 'Failed to update subscription');
        }
      } catch (err) {
        console.error('Failed to subscribe:', err);
        setError('Failed to update subscription');
      } finally {
        setIsSubscribing(false);
      }
      return;
    }

    // For paid plans, show payment modal
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentIntentId: string) => {
    if (!selectedPlan) return;

    try {
      setIsSubscribing(true);
      setError(null);
      setSuccess(null);

      // For free plans, paymentIntentId will be empty string
      const response = await subscriptionApi.subscribe(
        selectedPlan.id, 
        paymentIntentId || undefined
      );

      if (response.success) {
        setSuccess('Subscription updated successfully!');
        setShowPaymentModal(false);
        setSelectedPlan(null);
        
        // Show invoice receipt if available (for paid plans)
        if (response.data?.invoice) {
          setInvoice(response.data.invoice);
          setShowInvoiceReceipt(true);
        }
        
        // Reload subscription data
        await loadSubscriptionData();
        // Reload history
        const historyResponse = await subscriptionApi.getHistory(50);
        if (historyResponse.success) {
          setSubscriptionHistory(historyResponse.data);
        }
      } else {
        setError(response.error || 'Failed to update subscription');
      }
    } catch (err) {
      console.error('Failed to subscribe:', err);
      setError('Failed to update subscription');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    if (!confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }

    try {
      setIsSubscribing(true);
      setError(null);
      setSuccess(null);

      const response = await subscriptionApi.cancelSubscription();

      if (response.success) {
        setSuccess('Subscription cancelled successfully');
        // Reload subscription data
        await loadSubscriptionData();
        // Reload history
        const historyResponse = await subscriptionApi.getHistory(50);
        if (historyResponse.success) {
          setSubscriptionHistory(historyResponse.data);
        }
      } else {
        setError(response.error || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError('Failed to cancel subscription');
    } finally {
      setIsSubscribing(false);
    }
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
                <p className="text-primary">Loading subscription...</p>
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
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h1 className="text-3xl font-bold text-primary">Subscription</h1>
                </div>
                {currentSubscription && (
                  <div className="flex items-center space-x-3">
                    <span className="text-secondary">Current Plan:</span>
                    <SubscriptionBadge planType={currentSubscription.plan_type} size="lg" />
                  </div>
                )}
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-900/50 border border-green-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-300">{success}</span>
                </div>
              </div>
            )}

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
                  <p className="text-primary">Loading subscription information...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Current Usage Stats */}
                {usageLimits && (
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-6">Current Usage</h2>
                    <UsageStats limits={usageLimits} />
                  </div>
                )}

                {/* Pricing Cards */}
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-6">Available Plans</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                      const matchingPlan = currentSubscription && currentSubscription.plan_id === plan.id ? plan : null;
                      return (
                        <PricingCard
                          key={plan.id}
                          plan={plan}
                          currentPlan={matchingPlan}
                          onSubscribe={handleSubscribe}
                          isLoading={isSubscribing}
                          isPopular={plan.type === 'monthly'}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Pricing Explanation */}
                  <div className="mt-8 bg-surface-elevated rounded-lg border border-app p-6">
                    <h3 className="text-xl font-bold text-primary mb-4">Why Our Pricing?</h3>
                    <div className="space-y-4 text-secondary">
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Free Plan</h4>
                        <p className="text-sm">
                          Perfect for trying the platform and understanding its capabilities. With 20 AI messages and 1 website, 
                          you can fully experience our AI-powered features before committing to a paid plan. Test template generation, 
                          AI assistant functionality, and website building tools at no cost.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Monthly Plan (₱119.33/month)</h4>
                        <p className="text-sm">
                          Designed for freelancers, small businesses, students, and content creators. At just ₱119.33/month, 
                          this plan makes professional website building tools accessible to a wide range of users. With 300 AI messages 
                          per month (approximately 10 messages per day) and 5 websites, you have ample capacity for regular use and 
                          can manage multiple projects simultaneously. No long-term commitment - perfect for users who want flexibility.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Yearly Plan (₱1,145.52/year, equivalent to ₱95.46/month)</h4>
                        <p className="text-sm">
                          Our premium plan for professional freelancers, agencies, and power users. With 4,000 AI messages per month 
                          (approximately 133 messages per day) and 20 websites, this plan provides extensive capacity for heavy AI usage 
                          and managing multiple client projects. Save 20% compared to monthly billing - equivalent to getting 2.4 months free. 
                          Best for users committed to the platform who want maximum value and professional features.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Subscription Details */}
                {currentSubscription && currentSubscription.plan_type !== 'free' && (
                  <div className="bg-surface-elevated rounded-lg border border-app p-6">
                    <h3 className="text-xl font-bold text-primary mb-4">Current Subscription</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Plan Details</h4>
                        <div className="space-y-2 text-secondary">
                          <div>Plan: {currentSubscription.plan_name}</div>
                          <div>Started: {new Date(currentSubscription.start_date).toLocaleDateString()}</div>
                          {currentSubscription.end_date && (
                            <div>Expires: {new Date(currentSubscription.end_date).toLocaleDateString()}</div>
                          )}
                          <div>Auto-renew: {currentSubscription.auto_renew ? 'Yes' : 'No'}</div>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleCancelSubscription}
                          disabled={isSubscribing}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          {isSubscribing ? 'Cancelling...' : 'Cancel Subscription'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription History */}
                <SubscriptionHistory history={subscriptionHistory} isLoading={isLoadingHistory} />
              </div>
            )}

            {/* Payment Modal */}
            <StripePaymentModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              plan={selectedPlan}
              onConfirm={handlePaymentConfirm}
              isLoading={isSubscribing}
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



