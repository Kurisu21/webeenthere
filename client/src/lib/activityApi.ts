import { apiCall } from './apiConfig';

// TypeScript interfaces for activity data
export interface ActivityLog {
  id: string;
  userId: number;
  username: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  topUsers: Array<{
    user: string;
    count: number;
  }>;
  recentActivities: ActivityLog[];
}

export interface ActivityTrend {
  date: string;
  count: number;
}

export interface ActivityFilters {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ActivityPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ActivityResponse {
  success: boolean;
  data?: ActivityLog[];
  logs?: ActivityLog[];
  stats?: ActivityStats;
  trends?: ActivityTrend[];
  pagination?: ActivityPagination;
  error?: string;
}

export interface LogFileMetadata {
  path: string;
  size: number;
  modified: string;
  sizeFormatted: string;
}

// Activity API functions
export const activityApi = {
  // Get activity logs with filtering and pagination
  getActivityLogs: async (filters: ActivityFilters = {}): Promise<{
    logs: ActivityLog[];
    pagination: ActivityPagination;
  }> => {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.userId) queryParams.append('userId', filters.userId.toString());
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.search) queryParams.append('search', filters.search);

    const url = `/api/admin/activity/logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiCall(url, { method: 'GET' });
    const data = await response.json() as ActivityResponse;
    
    if (data.success && data.data && data.pagination) {
      return {
        logs: data.data,
        pagination: data.pagination
      };
    }
    throw new Error(data.error || 'Failed to fetch activity logs');
  },

  // Get activity statistics
  getActivityStats: async (): Promise<ActivityStats> => {
    const response = await apiCall('/api/admin/activity/stats', { method: 'GET' });
    const data = await response.json() as ActivityResponse;
    if (data.success && data.stats) {
      return data.stats;
    }
    throw new Error(data.error || 'Failed to fetch activity statistics');
  },

  // Get specific activity log by ID
  getActivityLogById: async (id: string): Promise<ActivityLog> => {
    const response = await apiCall(`/api/admin/activity/logs/${id}`, { method: 'GET' });
    const data = await response.json() as any;
    if (data.success && data.log) {
      return data.log;
    }
    throw new Error(data.error || 'Failed to fetch activity log');
  },

  // Get activity logs for a specific user
  getUserActivityLogs: async (userId: number, page = 1, limit = 50): Promise<{
    logs: ActivityLog[];
    pagination: ActivityPagination;
  }> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const url = `/api/admin/activity/user/${userId}?${queryParams.toString()}`;
    const response = await apiCall(url, { method: 'GET' });
    const data = await response.json() as ActivityResponse;
    
    if (data.success && data.data && data.pagination) {
      return {
        logs: data.data,
        pagination: data.pagination
      };
    }
    throw new Error(data.error || 'Failed to fetch user activity logs');
  },

  // Get critical activities
  getCriticalActivities: async (limit = 20): Promise<ActivityLog[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());

    const url = `/api/admin/activity/critical?${queryParams.toString()}`;
    const response = await apiCall(url, { method: 'GET' });
    const data = await response.json() as ActivityResponse;
    
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch critical activities');
  },

  // Get activity trends
  getActivityTrends: async (period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30): Promise<ActivityTrend[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    queryParams.append('days', days.toString());

    const url = `/api/admin/activity/trends?${queryParams.toString()}`;
    const response = await apiCall(url, { method: 'GET' });
    const data = await response.json() as ActivityResponse;
    
    if (data.success && data.trends) {
      return data.trends;
    }
    throw new Error(data.error || 'Failed to fetch activity trends');
  },

  // Export activity logs
  exportActivityLogs: async (filters: ActivityFilters = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (filters.userId) queryParams.append('userId', filters.userId.toString());
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.search) queryParams.append('search', filters.search);

    const url = `/api/admin/activity/export?${queryParams.toString()}`;
    
    try {
      const token = localStorage.getItem('token');
      const { API_BASE_URL } = await import('./apiConfig');
      const response = await fetch(`${API_BASE_URL}${url}`, {
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
  },

  // Rotate log files manually
  rotateLogFiles: async (): Promise<{ success: boolean; message: string; archiveFile?: string }> => {
    const response = await apiCall('/api/admin/activity/rotate', { method: 'POST' });
    const data = await response.json() as any;
    if (data.success) {
      return {
        success: true,
        message: data.message || 'Log files rotated successfully',
        archiveFile: data.archiveFile
      };
    }
    throw new Error(data.error || 'Failed to rotate log files');
  },

  // Get log file metadata
  getLogFileMetadata: async (): Promise<LogFileMetadata[]> => {
    const response = await apiCall('/api/admin/activity/metadata', { method: 'GET' });
    const data = await response.json() as any;
    if (data.success && data.metadata) {
      return data.metadata;
    }
    throw new Error(data.error || 'Failed to fetch log file metadata');
  }
};

// Utility functions
export const formatActivityDate = (dateString: string): string => {
  if (!dateString) {
    return 'N/A';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatActivityTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const getActionIcon = (action: string): string => {
  if (!action || typeof action !== 'string') {
    return '📝'; // Default icon for invalid actions
  }

  const actionIcons: Record<string, string> = {
    'user_management': '👤',
    'settings_update': '⚙️',
    'role_change': '🔑',
    'status_change': '📊',
    'profile_update': '✏️',
    'system_action': '🔧',
    'admin_login': '🔐',
    'failed_login_attempt': '❌',
    'data_export': '📤',
    'system_maintenance': '🛠️'
  };

  // Find matching icon based on action keywords
  for (const [key, icon] of Object.entries(actionIcons)) {
    if (action.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }

  return '📝'; // Default icon
};

export const getActionColor = (action: string): string => {
  if (!action || typeof action !== 'string') {
    return 'text-gray-400'; // Default color for invalid actions
  }

  if (action.includes('login')) return 'text-green-400';
  if (action.includes('failed')) return 'text-red-400';
  if (action.includes('role') || action.includes('status')) return 'text-yellow-400';
  if (action.includes('settings') || action.includes('system')) return 'text-blue-400';
  if (action.includes('export') || action.includes('maintenance')) return 'text-purple-400';
  return 'text-gray-400';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Filter helpers
export const createDateFilter = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

export const getCriticalActions = (): string[] => {
  return [
    'user_role_changed',
    'user_status_changed',
    'system_settings_updated',
    'user_deleted',
    'admin_login',
    'failed_login_attempt'
  ];
};

export default activityApi;
