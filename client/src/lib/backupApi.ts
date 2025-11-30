// lib/backupApi.ts
import { API_ENDPOINTS, API_BASE_URL, apiGet, apiPost, apiPut, apiDelete, apiCall } from './apiConfig';

// Type definitions
export interface Backup {
  id: string;
  type: 'full' | 'database' | 'files' | 'incremental';
  fileName: string;
  dateFolder: string;
  size: number;
  created: string;
  description?: string;
  isEncrypted: boolean;
  status: 'completed' | 'in_progress' | 'failed';
  integrityHash?: string;
  duration?: number;
  error?: string;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  lastBackupDate: string | null;
  backupsByType: Record<string, number>;
  successRate: number;
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  retentionDays: number;
  autoDelete: boolean;
  created?: string;
  updated?: string;
}

export interface BackupFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BackupPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BackupListResponse {
  success: boolean;
  backups: Backup[];
  pagination: BackupPagination;
}

export interface BackupCreateRequest {
  type: 'full' | 'database' | 'files' | 'incremental';
  description?: string;
  encrypt?: boolean;
  password?: string;
}

export interface BackupRestoreRequest {
  confirm: boolean;
  password?: string;
}

// Backup API functions
export const backupApi = {
  // Create a new backup
  createBackup: async (request: BackupCreateRequest) => {
    return apiPost('/api/admin/backup/create', request);
  },

  // List all backups with optional filters
  listBackups: async (filters: BackupFilters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    return apiGet(`/api/admin/backup/list${queryString ? `?${queryString}` : ''}`);
  },

  // Download a backup file
  downloadBackup: async (backupId: string) => {
    const response = await apiCall(`/api/admin/backup/${backupId}/download`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to download backup');
    }

    return response.blob();
  },

  // Restore from a backup
  restoreBackup: async (backupId: string, request: BackupRestoreRequest) => {
    return apiPost(`/api/admin/backup/${backupId}/restore`, request);
  },

  // Delete a backup
  deleteBackup: async (backupId: string) => {
    return apiDelete(`/api/admin/backup/${backupId}`);
  },

  // Get backup statistics
  getStats: async (): Promise<{ success: boolean; stats: BackupStats }> => {
    return apiGet('/api/admin/backup/stats');
  },

  // Get backup schedule configuration
  getSchedule: async (): Promise<{ success: boolean; schedule: ScheduleConfig }> => {
    return apiGet('/api/admin/backup/schedule');
  },

  // Update backup schedule configuration
  updateSchedule: async (schedule: ScheduleConfig) => {
    return apiPut('/api/admin/backup/schedule', schedule);
  },

  // Validate a backup
  validateBackup: async (backupId: string) => {
    return apiGet(`/api/admin/backup/${backupId}/validate`);
  },

  // Export entire database
  exportDatabase: async () => {
    try {
      console.log('[BackupAPI] Calling export endpoint: /api/admin/backup/export');
      
      const response = await apiCall('/api/admin/backup/export', {
        method: 'GET',
      });

      console.log('[BackupAPI] Response status:', response.status);
      console.log('[BackupAPI] Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          const clonedResponse = response.clone();
          errorData = await clonedResponse.json();
          console.error('[BackupAPI] Error response:', errorData);
        } catch (parseError) {
          const textError = await response.text();
          console.error('[BackupAPI] Error response text:', textError);
          errorData = { error: `HTTP error! status: ${response.status}`, details: textError };
        }
        
        const errorMessage = errorData?.error || errorData?.message || `Failed to export database (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      console.log('[BackupAPI] Received blob, size:', blob.size, 'bytes');
      
      if (!blob || blob.size === 0) {
        throw new Error('Received empty backup file from server');
      }

      return blob;
    } catch (error: any) {
      console.error('[BackupAPI] Export error:', error);
      // Re-throw with more context if needed
      if (error.message) {
        throw error;
      }
      throw new Error(error.message || 'Failed to export database. Please check your connection and try again.');
    }
  },

  // Import entire database (kept for potential future use, but not exposed in UI)
  importDatabase: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Use apiPost with isFormData option for proper FormData handling
    return apiPost('/api/admin/backup/import', formData, { isFormData: true });
  },
};

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatBackupDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getBackupTypeLabel = (type: string): string => {
  const labels = {
    full: 'Full Backup',
    database: 'Database Only',
    files: 'Files Only',
    incremental: 'Incremental',
  };
  return labels[type as keyof typeof labels] || type;
};

export const getBackupTypeColor = (type: string): string => {
  const colors = {
    full: 'bg-purple-600',
    database: 'bg-blue-600',
    files: 'bg-green-600',
    incremental: 'bg-orange-600',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-600';
};

export const getBackupStatusColor = (status: string): string => {
  const colors = {
    completed: 'text-green-400',
    in_progress: 'text-yellow-400',
    failed: 'text-red-400',
  };
  return colors[status as keyof typeof colors] || 'text-gray-400';
};

export const getBackupStatusLabel = (status: string): string => {
  const labels = {
    completed: 'Completed',
    in_progress: 'In Progress',
    failed: 'Failed',
  };
  return labels[status as keyof typeof labels] || status;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatBackupDate(dateString);
  }
};

export default backupApi;
