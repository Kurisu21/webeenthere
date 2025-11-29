import { apiCall } from './apiConfig';

// TypeScript interfaces for analytics data
export interface DashboardMetrics {
  users: {
    total: number;
    newThisMonth: number;
    active: number;
  };
  system: {
    totalActivities: number;
    todayActivities: number;
    errorRate: {
      total_attempts: number;
      failed_attempts: number;
    };
  };
  websites: {
    total: number;
    published: number;
    newThisMonth: number;
  };
  trends: {
    userRegistration: Array<{
      month: string;
      count: number;
    }>;
    websiteCreation: Array<{
      month: string;
      count: number;
    }>;
  };
}

export interface UserAnalytics {
  engagement?: {
    totalActivities: number;
    recentActivities: number;
    weekActivities: number;
    topActions: Array<{
      action: string;
      count: number;
    }>;
    activityPattern: Array<{
      date: string;
      count: number;
    }>;
    websites: {
      total: number;
      published: number;
    };
  };
  timeline?: Array<{
    date: string;
    activity_count: number;
    actions: string;
  }>;
  retention?: Array<{
    month: string;
    registered: number;
    firstMonthActive: number;
    secondMonthActive: number;
    firstMonthRetention: string;
    secondMonthRetention: string;
  }>;
  growth?: {
    totalUsers?: number;
    monthly: Array<{
      month: string;
      new_users: number;
      cumulative_users: number;
    }>;
    weekly: Array<{
      week: string;
      new_users: number;
    }>;
    daily: Array<{
      date: string;
      new_users: number;
    }>;
  };
  segments?: {
    powerUsers: Array<{
      id: number;
      username: string;
      email: string;
      activity_count: number;
      website_count: number;
    }>;
    newUsers: Array<{
      id: number;
      username: string;
      email: string;
      created_at: string;
      activity_count: number;
    }>;
    inactiveUsers: Array<{
      id: number;
      username: string;
      email: string;
      created_at: string;
      last_activity: string | null;
    }>;
    publishers: Array<{
      id: number;
      username: string;
      email: string;
      published_count: number;
    }>;
    summary: {
      powerUsersCount: number;
      newUsersCount: number;
      inactiveUsersCount: number;
      publishersCount: number;
    };
  };
  comparison?: {
    activityMetrics: {
      avg_activities_per_user: number;
      max_activities: number;
      min_activities: number;
    };
    websiteMetrics: {
      avg_websites_per_user: number;
      max_websites: number;
      min_websites: number;
    };
    engagementDistribution: Array<{
      engagement_level: string;
      user_count: number;
    }>;
  };
  evidence?: {
    activityLogs: {
      total: number;
      period: string;
      description: string;
    };
    registrations: {
      total: number;
      period: string;
      description: string;
    };
    websiteCreations: {
      total: number;
      period: string;
      description: string;
    };
    publications: {
      total: number;
      period: string;
      description: string;
    };
    recentActivities: Array<{
      action: string;
      count: number;
      unique_users: number;
    }>;
    verificationStats: {
      total: number;
      verified: number;
      unverified: number;
    };
    authProviderStats: Array<{
      auth_provider: string;
      count: number;
    }>;
  };
}

export interface SystemAnalytics {
  performance: {
    current: {
      timestamp: string;
      cpu: {
        loadAverage: number[];
        cores: number;
        model: string;
      };
      memory: {
        total: number;
        free: number;
        used: number;
        usagePercent: string;
      };
      uptime: number;
      platform: string;
      arch: string;
      database: {
        responseTime: number;
        connectionCount: number | string;
      };
    } | null;
    averages: {
      cpuLoad: string;
      memoryUsage: string;
      dbResponseTime: string;
    };
    recentMetrics: Array<any>;
    errorCount: number;
    status: {
      status: string;
      message: string;
    };
  };
  uptime: {
    system: {
      uptime: number;
      uptimeFormatted: string;
      bootTime: string;
    };
    application: {
      uptime: number;
      uptimeFormatted: string;
      startTime: string;
      lastActivity: string | null;
    };
    database: {
      responseTime: number;
      status: string;
    };
  };
  resources: {
    timestamp: string;
    database: {
      tableSizes: Array<{
        table_name: string;
        'Size (MB)': number;
        table_rows: number;
      }>;
      poolStatus: {
        totalConnections: number;
        freeConnections: number;
        acquiringConnections: number;
      } | null;
    };
    diskUsage: {
      available: boolean;
      error?: string;
    };
    system: {
      loadAverage: number[];
      memoryUsage: {
        total: number;
        free: number;
        used: number;
      };
    };
  };
  alerts: Array<{
    type: string;
    category: string;
    message: string;
    value: string | number;
    threshold: number;
    timestamp: string;
  }>;
}

export interface WebsiteAnalytics {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    activeWebsites: Array<{
      id: number;
      title: string;
      slug: string;
      owner: string;
      page_views: number;
      unique_visitors: number;
      last_visit: string | null;
    }>;
    dailyTrend: Array<{
      date: string;
      page_views: number;
      unique_visitors: number;
    }>;
  };
  popularPages: {
    popularWebsites: Array<{
      id: number;
      title: string;
      slug: string;
      owner: string;
      page_views: number;
      unique_visitors: number;
      last_visit: string | null;
    }>;
    popularReferrers: Array<{
      referrer: string;
      visits: number;
      unique_visitors: number;
    }>;
  };
  trafficSources: {
    trafficByDomain: Array<{
      source: string;
      visits: number;
      unique_visitors: number;
    }>;
    trafficByDevice: Array<{
      device_type: string;
      visits: number;
      unique_visitors: number;
    }>;
    hourlyTraffic: Array<{
      hour: number;
      visits: number;
    }>;
  };
  conversionRates: {
    publicationRate: {
      total_created: number;
      published: number;
      publication_rate: number;
    };
    engagementRate: {
      total_users: number;
      users_with_websites: number;
      engagement_rate: number;
    };
    templateUsageRate: {
      total_websites: number;
      websites_with_templates: number;
      template_usage_rate: number;
    };
  };
  performance: {
    avgVisitsPerDay: {
      avg_visits_per_day: number;
      max_daily_visits: number;
      min_daily_visits: number;
    };
    bounceRate: {
      total_visitors: number;
      bounced_visitors: number;
      bounce_rate: number;
    };
    returnVisitorRate: {
      total_unique_visitors: number;
      return_visitors: number;
      return_rate: number;
    };
    topWebsites?: Array<{
      id: number;
      title: string;
      slug: string;
      is_published: boolean;
      owner: string;
      owner_email: string;
      total_views: number;
      unique_visitors: number;
      active_days: number;
      last_visit: string | null;
      first_visit: string | null;
    }>;
  };
  geoDistribution: Array<{
    location_type: string;
    visits: number;
    unique_visitors: number;
  }>;
  period: number;
  websiteId: number | null;
}

export interface RealTimeMetrics {
  lastHourActivities: number;
  activeUsersLastHour: number;
  recentActivities: Array<{
    action: string;
    timestamp: string;
    username: string | null;
  }>;
  systemHealth: {
    total_activities_today: number;
    unique_users_today: number;
    failed_attempts_today: number;
  };
  timestamp: string;
}

export interface AnalyticsReport {
  period: string;
  type: string;
  generatedAt: string;
  userMetrics: any;
  systemMetrics: any;
  websiteMetrics: any;
  activityBreakdown?: Array<{
    action: string;
    count: number;
  }>;
  userActivity?: Array<{
    username: string;
    email: string;
    activity_count: number;
    last_activity: string | null;
  }>;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  userId?: number;
  action?: string;
  limit?: number;
}

// Analytics API functions
export const analyticsApi = {
  // Get dashboard metrics overview
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiCall('/api/admin/analytics/dashboard', { method: 'GET' });
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch dashboard metrics');
  },

  // Get user analytics
  getUserAnalytics: async (userId?: number, period: number = 30): Promise<UserAnalytics> => {
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('userId', userId.toString());
    queryParams.append('period', period.toString());

    const url = `/api/admin/analytics/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiCall(url, { method: 'GET' });
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch user analytics');
  },

  // Get system analytics
  getSystemAnalytics: async (): Promise<SystemAnalytics> => {
    const response = await apiCall('/api/admin/analytics/system', { method: 'GET' });
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch system analytics');
  },

  // Get website analytics
  getWebsiteAnalytics: async (period: number = 30, websiteId?: number): Promise<WebsiteAnalytics> => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());
    if (websiteId) queryParams.append('websiteId', websiteId.toString());

    const url = `/api/admin/analytics/websites?${queryParams.toString()}`;
    const response = await apiCall(url, { method: 'GET' });
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch website analytics');
  },

  // Generate custom report
  generateReport: async (period: string = 'monthly', type: string = 'comprehensive', format: string = 'json'): Promise<AnalyticsReport | Blob> => {
    try {
      const response = await apiCall('/api/admin/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period, type, format })
      });

      if (format === 'csv' || format === 'pdf') {
        // For blob responses, we need to check content type
        const contentType = response.headers.get('content-type');
        if (contentType && (contentType.includes('pdf') || contentType.includes('csv') || contentType.includes('text/csv'))) {
          const blob = await response.blob();
          // Create download link for PDF/CSV
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-report-${period}-${type}.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return blob;
        } else {
          // If not a blob, try to parse as JSON to get error
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Failed to generate report');
        }
      } else {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
        throw new Error(data.error || data.message || 'Failed to generate report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      // Check if it's an authentication error
      if (error.message && error.message.includes('Authentication')) {
        throw new Error('Please log in as an admin to generate reports. Make sure you are logged in with admin privileges.');
      }
      throw new Error(error.message || 'Failed to generate report');
    }
  },

  // Export analytics data
  exportAnalytics: async (filters: AnalyticsFilters = {}, format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.userId) queryParams.append('userId', filters.userId.toString());
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const url = `/api/admin/analytics/export?${queryParams.toString()}`;
    const response = await apiCall(url, { method: 'GET' });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  },

  // Get real-time metrics
  getRealTimeMetrics: async (): Promise<RealTimeMetrics> => {
    const response = await apiCall('/api/admin/analytics/realtime', { method: 'GET' });
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch real-time metrics');
  },

  // Track page view
  trackPageView: async (websiteId: number, page: string = '/', referrer?: string, userAgent?: string): Promise<void> => {
    const response = await apiCall('/api/admin/analytics/track-pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ websiteId, page, referrer, userAgent })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to track page view');
    }
  },

  // Track user journey
  trackUserJourney: async (userId: number, path: string, websiteId?: number): Promise<void> => {
    const response = await apiCall('/api/admin/analytics/track-journey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, path, websiteId })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to track user journey');
    }
  },

  // Get analytics summary
  getAnalyticsSummary: async (period: number = 30): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period.toString());

    const url = `/api/admin/analytics/summary?${queryParams.toString()}`;
    const response = await apiCall(url, { method: 'GET' });
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch analytics summary');
  }
};

// Utility functions
export const formatNumber = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return ((value / total) * 100).toFixed(1) + '%';
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'healthy':
      return 'text-green-400';
    case 'warning':
      return 'text-yellow-400';
    case 'critical':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

// User Website Analytics interfaces
export interface UserWebsitePerformance {
  websites: Array<{
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    total_views: number;
    unique_visitors: number;
    last_visit: string | null;
  }>;
  performance: {
    totalViews: number;
    uniqueVisitors: number;
    avgViewsPerDay: number;
  };
}

// User Website Analytics API functions
export const getUserWebsiteAnalytics = async (websiteId?: number): Promise<UserWebsitePerformance> => {
  const url = websiteId 
    ? `/api/user/analytics/websites/${websiteId}`
    : '/api/user/analytics/websites';
  
  const response = await apiCall(url);
  const data = await response.json();
  
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error(data.message || 'Failed to fetch user website analytics');
};

export const getStatusBgColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'healthy':
      return 'bg-green-500/20';
    case 'warning':
      return 'bg-yellow-500/20';
    case 'critical':
      return 'bg-red-500/20';
    default:
      return 'bg-gray-500/20';
  }
};

export default analyticsApi;
