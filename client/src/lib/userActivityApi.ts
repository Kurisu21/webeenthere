import { apiCall } from './apiConfig';
import {
  ActivityLog,
  ActivityFilters,
  ActivityPagination,
  formatActivityDate,
  getActionIcon,
  getActionColor,
  downloadBlob
} from './activityApi';

// User Activity API functions (for user's own activities)
export const userActivityApi = {
  // Get current user's activity logs with filtering and pagination
  getUserActivityLogs: async (filters: Omit<ActivityFilters, 'userId'> = {}): Promise<{
    logs: ActivityLog[];
    pagination: ActivityPagination;
  }> => {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.search) queryParams.append('search', filters.search);

    const url = `/api/user/activity/logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiCall(url, { method: 'GET' });
    const data = await response.json();
    
    if (data.success && data.data && data.pagination) {
      return {
        logs: data.data,
        pagination: data.pagination
      };
    }
    throw new Error(data.error || 'Failed to fetch activity logs');
  },

  // Get current user's activity statistics
  getUserActivityStats: async (): Promise<{
    total: number;
    recentWeek: number;
    actions: Array<{ action: string; count: number }>;
  }> => {
    const response = await apiCall('/api/user/activity/stats', { method: 'GET' });
    const data = await response.json();
    if (data.success && data.stats) {
      return data.stats;
    }
    throw new Error(data.error || 'Failed to fetch activity statistics');
  },

  // Export current user's activity logs
  exportUserActivityLogs: async (filters: Omit<ActivityFilters, 'userId'> = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.search) queryParams.append('search', filters.search);

    const url = `/api/user/activity/export?${queryParams.toString()}`;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Export activity logs failed:', error);
      throw error;
    }
  }
};

// Re-export utility functions from activityApi
export {
  formatActivityDate,
  getActionIcon,
  getActionColor,
  downloadBlob
};

export default userActivityApi;

