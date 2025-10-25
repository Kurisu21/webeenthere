// lib/adminSubscriptionApi.ts
import { API_ENDPOINTS, apiGet, apiPost } from './apiConfig';
import { Plan, Subscription, SubscriptionLog, PaymentTransaction } from './subscriptionApi';

// Admin-specific interfaces
export interface AdminSubscription extends Subscription {
  username: string;
  email: string;
}

export interface AdminSubscriptionLog extends SubscriptionLog {
  username: string;
  email: string;
}

export interface AdminPaymentTransaction extends PaymentTransaction {
  username: string;
  email: string;
}

export interface SubscriptionStats {
  byType: Array<{
    type: string;
    count: number;
    total_revenue: number;
  }>;
  recentCount: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface AdminSubscriptionsResponse {
  success: boolean;
  data: AdminSubscription[];
  pagination: PaginationInfo;
  error?: string;
}

export interface AdminLogsResponse {
  success: boolean;
  data: AdminSubscriptionLog[];
  pagination: PaginationInfo;
  error?: string;
}

export interface AdminTransactionsResponse {
  success: boolean;
  data: AdminPaymentTransaction[];
  pagination: PaginationInfo;
  error?: string;
}

export interface UserSubscriptionDetails {
  subscription: Subscription | null;
  logs: SubscriptionLog[];
  transactions: PaymentTransaction[];
}

export interface AdminUserDetailsResponse {
  success: boolean;
  data: UserSubscriptionDetails;
  error?: string;
}

export interface AdminStatsResponse {
  success: boolean;
  data: SubscriptionStats;
  error?: string;
}

// Admin API functions
export const adminSubscriptionApi = {
  // Get all subscriptions with pagination and filters
  async getAllSubscriptions(filters: {
    page?: number;
    limit?: number;
    plan_type?: string;
    is_active?: boolean;
    search?: string;
  } = {}): Promise<AdminSubscriptionsResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.plan_type) params.append('plan_type', filters.plan_type);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `${API_ENDPOINTS.ADMIN_SUBSCRIPTIONS}${queryString ? `?${queryString}` : ''}`;
    
    return await apiGet(url);
  },

  // Manually assign a plan to a user
  async assignPlan(data: {
    userId: number;
    planId: number;
    startDate?: string;
    endDate?: string;
    paymentReference?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return await apiPost(`${API_ENDPOINTS.ADMIN_SUBSCRIPTIONS}/assign`, data);
  },

  // Get subscription logs with filters
  async getSubscriptionLogs(filters: {
    page?: number;
    limit?: number;
    user_id?: number;
    action?: string;
    payment_status?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<AdminLogsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${API_ENDPOINTS.ADMIN_SUBSCRIPTIONS}/logs${queryString ? `?${queryString}` : ''}`;
    
    return await apiGet(url);
  },

  // Get payment transactions with filters
  async getPaymentTransactions(filters: {
    page?: number;
    limit?: number;
    user_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    min_amount?: number;
    max_amount?: number;
  } = {}): Promise<AdminTransactionsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${API_ENDPOINTS.ADMIN_SUBSCRIPTIONS}/transactions${queryString ? `?${queryString}` : ''}`;
    
    return await apiGet(url);
  },

  // Get detailed subscription info for a specific user
  async getUserSubscriptionDetails(userId: number): Promise<AdminUserDetailsResponse> {
    return await apiGet(`${API_ENDPOINTS.ADMIN_SUBSCRIPTIONS}/user/${userId}`);
  },

  // Get subscription statistics
  async getSubscriptionStats(): Promise<AdminStatsResponse> {
    return await apiGet(`${API_ENDPOINTS.ADMIN_SUBSCRIPTIONS}/stats`);
  }
};

// Helper functions for admin
export const adminSubscriptionHelpers = {
  // Format subscription status
  getSubscriptionStatus(subscription: AdminSubscription): string {
    if (!subscription.end_date) return 'Active';
    
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    
    if (endDate > now) {
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `Active (${daysLeft} days left)`;
    }
    
    return 'Expired';
  },

  // Get status badge color
  getStatusBadgeColor(subscription: AdminSubscription): string {
    if (!subscription.end_date) return 'bg-green-500';
    
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    
    if (endDate > now) {
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7) return 'bg-yellow-500';
      return 'bg-green-500';
    }
    
    return 'bg-red-500';
  },

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format datetime
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get action badge color
  getActionBadgeColor(action: string): string {
    switch (action) {
      case 'created': return 'bg-blue-500';
      case 'upgraded': return 'bg-green-500';
      case 'downgraded': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'renewed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  },

  // Get payment status badge color
  getPaymentStatusBadgeColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
};

export default adminSubscriptionApi;



