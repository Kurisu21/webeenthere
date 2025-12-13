// lib/subscriptionApi.ts
import { API_ENDPOINTS, apiGet, apiPost, apiPut } from './apiConfig';
import { formatPriceInPhp } from './currencyUtils';

// TypeScript interfaces
export interface Plan {
  id: number;
  name: string;
  type: 'free' | 'monthly' | 'yearly';
  price: number;
  features: string;
  website_limit: number | null;
  ai_chat_limit: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  plan_type: string;
  price: number;
  features: string;
  website_limit: number | null;
  ai_chat_limit: number | null;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  payment_reference: string | null;
  created_at: string;
}

export interface SubscriptionLog {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  plan_type: string;
  action: 'created' | 'upgraded' | 'downgraded' | 'cancelled' | 'renewed';
  payment_status: 'pending' | 'completed' | 'failed';
  amount: number;
  payment_reference: string | null;
  created_at: string;
}

export interface PaymentTransaction {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  plan_type: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transaction_reference: string;
  created_at: string;
}

export interface UsageLimits {
  website: {
    canCreate: boolean;
    remaining: number;
    limit: number;
    used?: number;
  };
  aiChat: {
    canUse: boolean;
    remaining: number;
    limit: number;
    used?: number;
  };
}

export interface SubscriptionResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface PlansResponse {
  success: boolean;
  data: Plan[];
  error?: string;
}

export interface SubscriptionHistoryResponse {
  success: boolean;
  data: SubscriptionLog[];
  error?: string;
}

export interface LimitsResponse {
  success: boolean;
  data: UsageLimits;
  error?: string;
}

// API functions
export const subscriptionApi = {
  // Get all available plans
  async getPlans(): Promise<PlansResponse> {
    return await apiGet(`${API_ENDPOINTS.SUBSCRIPTIONS}/plans`);
  },

  // Get user's current subscription
  async getCurrentSubscription(): Promise<SubscriptionResponse> {
    return await apiGet(`${API_ENDPOINTS.SUBSCRIPTIONS}/current`);
  },

  // Create payment intent for Stripe
  async createPaymentIntent(planId: number): Promise<{
    success: boolean;
    data?: {
      clientSecret: string;
      paymentIntentId: string;
      amount: number;
      currency: string;
    };
    error?: string;
  }> {
    return await apiPost(`${API_ENDPOINTS.SUBSCRIPTIONS}/create-payment-intent`, {
      planId
    });
  },

  // Subscribe to a plan
  async subscribe(planId: number, paymentIntentId?: string): Promise<SubscriptionResponse> {
    return await apiPost(`${API_ENDPOINTS.SUBSCRIPTIONS}/subscribe`, {
      planId,
      paymentIntentId
    });
  },

  // Cancel current subscription
  async cancelSubscription(): Promise<SubscriptionResponse> {
    return await apiPut(`${API_ENDPOINTS.SUBSCRIPTIONS}/cancel`, {});
  },

  // Get subscription history
  async getHistory(limit?: number): Promise<SubscriptionHistoryResponse> {
    const params = limit ? `?limit=${limit}` : '';
    return await apiGet(`${API_ENDPOINTS.SUBSCRIPTIONS}/history${params}`);
  },

  // Check usage limits
  async checkLimits(): Promise<LimitsResponse> {
    return await apiGet(`${API_ENDPOINTS.SUBSCRIPTIONS}/limits`);
  }
};

// Helper functions
export const planHelpers = {
  // Get plan display name with pricing (in PHP for display)
  getDisplayName(plan: Plan): string {
    if (plan.type === 'free') return 'Free';
    if (plan.type === 'monthly') return `Monthly - ${formatPriceInPhp(plan.price, 'month')}`;
    if (plan.type === 'yearly') return `Yearly - ${formatPriceInPhp(plan.price, 'year')}`;
    return plan.name;
  },

  // Get plan badge color
  getBadgeColor(planType: string): string {
    switch (planType) {
      case 'free': return 'bg-gray-500';
      case 'monthly': return 'bg-blue-500';
      case 'yearly': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  },

  // Check if plan is unlimited
  isUnlimited(limit: number | null): boolean {
    return limit === null;
  },

  // Format usage display
  formatUsage(used: number, limit: number | null): string {
    if (limit === null) return 'Unlimited';
    return `${used}/${limit}`;
  },

  // Calculate savings for yearly plan
  calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
    const monthlyYearlyTotal = monthlyPrice * 12;
    return monthlyYearlyTotal - yearlyPrice;
  }
};

export default subscriptionApi;



