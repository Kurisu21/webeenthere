import { apiCall } from './apiConfig';

// Performance API interfaces
export interface CPUMetrics {
  usage: number;
  cores: number;
  physicalCores: number;
  processors: number;
  speed: number;
  temperature?: number;
  timestamp: string;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  available: number;
  usage: number;
  swap: {
    total: number;
    used: number;
    free: number;
  };
  layout: any[];
  timestamp: string;
}

export interface DiskMetrics {
  disks: Array<{
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    usage: number;
    mount: string;
  }>;
  io: any;
  timestamp: string;
}

export interface NetworkMetrics {
  interfaces: Array<{
    iface: string;
    type: string;
    ip4: string;
    ip6: string;
    mac: string;
    speed: number;
    internal: boolean;
  }>;
  stats: Array<{
    iface: string;
    rx_bytes: number;
    tx_bytes: number;
    rx_sec: number;
    tx_sec: number;
    ms: number;
  }>;
  timestamp: string;
}

export interface APIMetrics {
  endpoints: Array<{
    action: string;
    count: number;
    avgResponseTime: number;
    avgResponseTimeMs: number;
  }>;
  timestamp: string;
}

export interface DatabaseMetrics {
  status: Record<string, any>;
  variables: Record<string, any>;
  tableSizes: Array<{
    table_name: string;
    size_mb: number;
    table_rows: number;
  }>;
  slowQueries: number;
  connectionPool: {
    activeConnections: number;
    idleConnections: number;
  };
  timestamp: string;
}

export interface PerformanceAlert {
  type: string;
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  mount?: string;
  timestamp: string;
}

export interface SystemInfo {
  manufacturer: string;
  model: string;
  version: string;
  serial: string;
  uuid: string;
  sku: string;
  os: {
    platform: string;
    distro: string;
    release: string;
    codename: string;
    kernel: string;
    arch: string;
    hostname: string;
    fqdn: string;
    codepage: string;
    logofile: string;
    serial: string;
    build: string;
    servicepack: string;
    uefi: boolean;
  };
}

export interface UptimeInfo {
  uptime: number;
  uptimeFormatted: string;
  boottime: number;
  timezone: string;
  timezoneName: string;
}

export interface PerformanceMetrics {
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  api: APIMetrics;
  database: DatabaseMetrics;
  system: SystemInfo;
  uptime: UptimeInfo;
  healthScore: number;
  timestamp: string;
}

export interface PerformanceThresholds {
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
  dbConnections: number;
}

export interface PerformanceReport {
  period: string;
  generatedAt: string;
  summary: {
    healthScore: number;
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
  };
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
  history: any[];
  recommendations: string[];
}

// Performance API functions
export const performanceApi = {
  // Get overall performance metrics
  getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
    const response = await apiCall('/api/admin/performance/metrics');
    const data = await response.json();
    if (data.success && data.metrics) {
      return data.metrics;
    }
    throw new Error(data.error || 'Failed to fetch performance metrics');
  },

  // Get system resources
  getSystemResources: async (): Promise<{
    cpu: CPUMetrics;
    memory: MemoryMetrics;
    disk: DiskMetrics;
    network: NetworkMetrics;
  }> => {
    const response = await apiCall('/api/admin/performance/resources');
    const data = await response.json();
    if (data.success && data.resources) {
      return data.resources;
    }
    throw new Error(data.error || 'Failed to fetch system resources');
  },

  // Get API performance metrics
  getAPIPerformance: async (): Promise<APIMetrics> => {
    const response = await apiCall('/api/admin/performance/api');
    const data = await response.json();
    if (data.success && data.apiMetrics) {
      return data.apiMetrics;
    }
    throw new Error(data.error || 'Failed to fetch API performance metrics');
  },

  // Get database performance metrics
  getDatabasePerformance: async (): Promise<DatabaseMetrics> => {
    const response = await apiCall('/api/admin/performance/database');
    const data = await response.json();
    if (data.success && data.databaseMetrics) {
      return data.databaseMetrics;
    }
    throw new Error(data.error || 'Failed to fetch database performance metrics');
  },

  // Get performance alerts
  getPerformanceAlerts: async (): Promise<{
    alerts: PerformanceAlert[];
    summary: any;
  }> => {
    const response = await apiCall('/api/admin/performance/alerts');
    const data = await response.json();
    if (data.success) {
      return {
        alerts: data.alerts || [],
        summary: data.summary || {}
      };
    }
    throw new Error(data.error || 'Failed to fetch performance alerts');
  },

  // Optimize performance
  optimizePerformance: async (): Promise<any> => {
    const response = await apiCall('/api/admin/performance/optimize', {
      method: 'POST'
    });
    const data = await response.json();
    if (data.success && data.optimization) {
      return data.optimization;
    }
    throw new Error(data.error || 'Failed to optimize performance');
  },

  // Get performance history
  getPerformanceHistory: async (type: string = 'all', limit: number = 100): Promise<any[]> => {
    const response = await apiCall(`/api/admin/performance/history?type=${type}&limit=${limit}`);
    const data = await response.json();
    if (data.success && data.history) {
      return data.history;
    }
    throw new Error(data.error || 'Failed to fetch performance history');
  },

  // Get system information
  getSystemInfo: async (): Promise<{
    systemInfo: SystemInfo;
    uptime: UptimeInfo;
  }> => {
    const response = await apiCall('/api/admin/performance/system-info');
    const data = await response.json();
    if (data.success) {
      return {
        systemInfo: data.systemInfo,
        uptime: data.uptime
      };
    }
    throw new Error(data.error || 'Failed to fetch system information');
  },

  // Get performance thresholds
  getPerformanceThresholds: async (): Promise<PerformanceThresholds> => {
    const response = await apiCall('/api/admin/performance/thresholds');
    const data = await response.json();
    if (data.success && data.thresholds) {
      return data.thresholds;
    }
    throw new Error(data.error || 'Failed to fetch performance thresholds');
  },

  // Update performance thresholds
  updatePerformanceThresholds: async (thresholds: Partial<PerformanceThresholds>): Promise<PerformanceThresholds> => {
    const response = await apiCall('/api/admin/performance/thresholds', {
      method: 'PUT',
      body: JSON.stringify({ thresholds })
    });
    const data = await response.json();
    if (data.success && data.thresholds) {
      return data.thresholds;
    }
    throw new Error(data.error || 'Failed to update performance thresholds');
  },

  // Get real-time metrics
  getRealTimeMetrics: async (): Promise<{
    cpu: CPUMetrics;
    memory: MemoryMetrics;
    alerts: PerformanceAlert[];
  }> => {
    const response = await apiCall('/api/admin/performance/realtime');
    const data = await response.json();
    if (data.success && data.realTimeMetrics) {
      return data.realTimeMetrics;
    }
    throw new Error(data.error || 'Failed to fetch real-time metrics');
  },

  // Generate performance report
  generatePerformanceReport: async (period: string = '24h'): Promise<PerformanceReport> => {
    const response = await apiCall(`/api/admin/performance/report?period=${period}`);
    const data = await response.json();
    if (data.success && data.report) {
      return data.report;
    }
    throw new Error(data.error || 'Failed to generate performance report');
  },

  // Get individual metrics
  getCPUMetrics: async (): Promise<CPUMetrics> => {
    const response = await apiCall('/api/admin/performance/cpu');
    const data = await response.json();
    if (data.success && data.cpu) {
      return data.cpu;
    }
    throw new Error(data.error || 'Failed to fetch CPU metrics');
  },

  getMemoryMetrics: async (): Promise<MemoryMetrics> => {
    const response = await apiCall('/api/admin/performance/memory');
    const data = await response.json();
    if (data.success && data.memory) {
      return data.memory;
    }
    throw new Error(data.error || 'Failed to fetch memory metrics');
  },

  getDiskMetrics: async (): Promise<DiskMetrics> => {
    const response = await apiCall('/api/admin/performance/disk');
    const data = await response.json();
    if (data.success && data.disk) {
      return data.disk;
    }
    throw new Error(data.error || 'Failed to fetch disk metrics');
  },

  getNetworkMetrics: async (): Promise<NetworkMetrics> => {
    const response = await apiCall('/api/admin/performance/network');
    const data = await response.json();
    if (data.success && data.network) {
      return data.network;
    }
    throw new Error(data.error || 'Failed to fetch network metrics');
  },

  getUptime: async (): Promise<UptimeInfo> => {
    const response = await apiCall('/api/admin/performance/uptime');
    const data = await response.json();
    if (data.success && data.uptime) {
      return data.uptime;
    }
    throw new Error(data.error || 'Failed to fetch uptime information');
  }
};

export default performanceApi;

