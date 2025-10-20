import { apiCall } from './apiConfig';

// Report interfaces
export interface ReportTemplate {
  name: string;
  description: string;
  fields: string[];
}

export interface ReportData {
  type: string;
  period: string;
  generatedAt: string;
  data: any;
}

export interface UserReportData extends ReportData {
  data: {
    registrations: Array<{ date: string; count: number }>;
    activeUsers: Array<{ date: string; count: number }>;
    loginAttempts: Array<{ date: string; successful: number; failed: number }>;
    topUsers: Array<{ username: string; email: string; activity_count: number; last_activity: string }>;
    retention: {
      week_1: number;
      week_2: number;
      week_3: number;
      week_4: number;
    };
    summary: {
      totalRegistrations: number;
      avgActiveUsers: number;
      totalLoginAttempts: number;
      successRate: string;
    };
  };
}

export interface SystemReportData extends ReportData {
  data: {
    uptime: {
      first_activity: string;
      last_activity: string;
      total_activities: number;
    };
    errorRates: Array<{ date: string; errors: number; total_activities: number }>;
    responseTimes: Array<{ action: string; avg_response_time_ms: number; request_count: number }>;
    databasePerformance: {
      total_queries: number;
      slow_queries: number;
    };
    summary: {
      uptimeHours: number;
      avgErrorRate: string;
      avgResponseTime: number;
    };
  };
}

export interface PerformanceReportData extends ReportData {
  data: {
    apiPerformance: Array<{ action: string; request_count: number; avg_response_time_ms: number; max_response_time_ms: number }>;
    databasePerformance: {
      total_queries: number;
      slow_queries: number;
      avg_query_time: number;
    };
    resourceUsage: Array<{ date: string; avg_cpu: number; avg_memory: number; avg_disk: number }>;
    summary: {
      avgResponseTime: number;
      slowQueryRate: string;
      avgCPUUsage: string;
      avgMemoryUsage: string;
    };
  };
}

export interface WebsiteReportData extends ReportData {
  data: {
    totalWebsites: number;
    websiteCreation: Array<{ date: string; count: number }>;
    popularWebsites: Array<{ title: string; url: string; activity_count: number; last_activity: string }>;
    userJourneys: Array<{ username: string; websites_accessed: number; total_activities: number }>;
    conversionRates: {
      total_websites: number;
      published_websites: number;
      draft_websites: number;
    };
    summary: {
      totalWebsites: number;
      newWebsites: number;
      conversionRate: string;
      avgWebsitesPerUser: string;
    };
  };
}

export interface ScheduledReport {
  id: string;
  template: string;
  schedule: string;
  email: string | null;
  createdAt: string;
}

export interface ReportHistory {
  id: string;
  report: ReportData;
  email: string | null;
  generatedAt: string;
  storedAt: string;
}

// Report generation functions
export const generateReport = async (template: string, period: string = '30d', filters: any = {}) => {
  return apiCall('/admin/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ template, period, filters })
  });
};

export const getReportTemplates = async (): Promise<Record<string, ReportTemplate>> => {
  return apiCall('/admin/reports/templates');
};

// Specific report generation functions
export const generateUserReport = async (period: string = '30d', userId?: string): Promise<UserReportData> => {
  const params = new URLSearchParams({ period });
  if (userId) params.append('userId', userId);
  
  return apiCall(`/admin/reports/user?${params.toString()}`);
};

export const generateSystemReport = async (period: string = '7d'): Promise<SystemReportData> => {
  const params = new URLSearchParams({ period });
  return apiCall(`/admin/reports/system?${params.toString()}`);
};

export const generatePerformanceReport = async (period: string = '7d'): Promise<PerformanceReportData> => {
  const params = new URLSearchParams({ period });
  return apiCall(`/admin/reports/performance?${params.toString()}`);
};

export const generateWebsiteReport = async (period: string = '30d'): Promise<WebsiteReportData> => {
  const params = new URLSearchParams({ period });
  return apiCall(`/admin/reports/website?${params.toString()}`);
};

// Report scheduling functions
export const scheduleReport = async (template: string, schedule: string, email?: string) => {
  return apiCall('/admin/reports/schedule', {
    method: 'POST',
    body: JSON.stringify({ template, schedule, email })
  });
};

export const getScheduledReports = async (): Promise<ScheduledReport[]> => {
  return apiCall('/admin/reports/scheduled');
};

export const cancelScheduledReport = async (reportId: string) => {
  return apiCall(`/admin/reports/scheduled/${reportId}`, {
    method: 'DELETE'
  });
};

// Report export and history functions
export const exportReport = async (report: ReportData, format: 'json' | 'csv' | 'xml' = 'json') => {
  const response = await fetch('/api/admin/reports/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    },
    body: JSON.stringify({ report })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report.${format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const getReportHistory = async (limit: number = 50): Promise<ReportHistory[]> => {
  const params = new URLSearchParams({ limit: limit.toString() });
  return apiCall(`/admin/reports/history?${params.toString()}`);
};

// Utility functions
export const formatPeriod = (period: string): string => {
  const periods: Record<string, string> = {
    '1h': 'Last Hour',
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days'
  };
  return periods[period] || period;
};

export const formatSchedule = (schedule: string): string => {
  const schedules: Record<string, string> = {
    'hourly': 'Every Hour',
    'daily': 'Daily',
    'weekly': 'Weekly',
    'monthly': 'Monthly'
  };
  return schedules[schedule] || schedule;
};

export const getReportTypeDisplayName = (type: string): string => {
  const types: Record<string, string> = {
    'userActivity': 'User Activity',
    'systemHealth': 'System Health',
    'performanceMetrics': 'Performance Metrics',
    'websiteAnalytics': 'Website Analytics'
  };
  return types[type] || type;
};

