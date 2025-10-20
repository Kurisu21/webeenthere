const si = require('systeminformation');
const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class PerformanceService {
  constructor() {
    this.metricsHistory = [];
    this.maxHistorySize = 1000;
    this.thresholds = {
      cpu: 80, // CPU usage percentage
      memory: 85, // Memory usage percentage
      disk: 90, // Disk usage percentage
      responseTime: 2000, // Response time in milliseconds
      dbConnections: 80 // Database connection percentage
    };
  }

  /**
   * Monitor CPU usage
   */
  async monitorCPUUsage() {
    try {
      const cpuData = await si.currentLoad();
      const cpuInfo = await si.cpu();
      
      const cpuMetrics = {
        usage: Math.round(cpuData.currentLoad),
        cores: cpuInfo.cores,
        physicalCores: cpuInfo.physicalCores,
        processors: cpuInfo.processors,
        speed: cpuInfo.speed,
        temperature: await this.getCPUTemperature(),
        timestamp: new Date().toISOString()
      };

      // Store in history
      this.addToHistory('cpu', cpuMetrics);
      
      return cpuMetrics;
    } catch (error) {
      console.error('Error monitoring CPU usage:', error);
      return null;
    }
  }

  /**
   * Monitor memory usage
   */
  async monitorMemoryUsage() {
    try {
      const memData = await si.mem();
      const memLayout = await si.memLayout();
      
      const totalMemory = memData.total;
      const usedMemory = memData.used;
      const freeMemory = memData.free;
      const availableMemory = memData.available;
      
      const memoryMetrics = {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        available: availableMemory,
        usage: Math.round((usedMemory / totalMemory) * 100),
        swap: {
          total: memData.swaptotal,
          used: memData.swapused,
          free: memData.swapfree
        },
        layout: memLayout,
        timestamp: new Date().toISOString()
      };

      // Store in history
      this.addToHistory('memory', memoryMetrics);
      
      return memoryMetrics;
    } catch (error) {
      console.error('Error monitoring memory usage:', error);
      return null;
    }
  }

  /**
   * Monitor disk usage
   */
  async monitorDiskUsage() {
    try {
      const diskData = await si.fsSize();
      const diskIO = await si.disksIO();
      
      const diskMetrics = {
        disks: diskData.map(disk => ({
          fs: disk.fs,
          type: disk.type,
          size: disk.size,
          used: disk.used,
          available: disk.available,
          usage: Math.round((disk.used / disk.size) * 100),
          mount: disk.mount
        })),
        io: diskIO,
        timestamp: new Date().toISOString()
      };

      // Store in history
      this.addToHistory('disk', diskMetrics);
      
      return diskMetrics;
    } catch (error) {
      console.error('Error monitoring disk usage:', error);
      return null;
    }
  }

  /**
   * Monitor network usage
   */
  async monitorNetworkUsage() {
    try {
      const networkStats = await si.networkStats();
      const networkInterfaces = await si.networkInterfaces();
      
      const networkMetrics = {
        interfaces: networkInterfaces.map(iface => ({
          iface: iface.iface,
          type: iface.type,
          ip4: iface.ip4,
          ip6: iface.ip6,
          mac: iface.mac,
          speed: iface.speed,
          internal: iface.internal
        })),
        stats: networkStats.map(stat => ({
          iface: stat.iface,
          rx_bytes: stat.rx_bytes,
          tx_bytes: stat.tx_bytes,
          rx_sec: stat.rx_sec,
          tx_sec: stat.tx_sec,
          ms: stat.ms
        })),
        timestamp: new Date().toISOString()
      };

      // Store in history
      this.addToHistory('network', networkMetrics);
      
      return networkMetrics;
    } catch (error) {
      console.error('Error monitoring network usage:', error);
      return null;
    }
  }

  /**
   * Track API response times
   */
  async trackResponseTimes() {
    const connection = await getDatabaseConnection();
    
    try {
      // Get recent API response times from activity logs
      const [responseTimes] = await connection.execute(
        `SELECT 
           action,
           COUNT(*) as count,
           AVG(TIMESTAMPDIFF(MICROSECOND, 
             STR_TO_DATE(JSON_EXTRACT(details, '$.startTime'), '%Y-%m-%dT%H:%i:%s.%fZ'),
             timestamp
           )) as avg_response_time_microseconds
         FROM activity_logs 
         WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
         AND JSON_EXTRACT(details, '$.startTime') IS NOT NULL
         GROUP BY action
         ORDER BY avg_response_time_microseconds DESC`
      );

      const apiMetrics = {
        endpoints: responseTimes.map(endpoint => ({
          action: endpoint.action,
          count: endpoint.count,
          avgResponseTime: Math.round(endpoint.avg_response_time_microseconds / 1000), // Convert to milliseconds
          avgResponseTimeMs: Math.round(endpoint.avg_response_time_microseconds / 1000)
        })),
        timestamp: new Date().toISOString()
      };

      // Store in history
      this.addToHistory('api', apiMetrics);
      
      return apiMetrics;
    } catch (error) {
      console.error('Error tracking API response times:', error);
      return null;
    }
  }

  /**
   * Monitor database performance
   */
  async monitorDatabasePerformance() {
    const connection = await getDatabaseConnection();
    
    try {
      // Get database status
      const [dbStatus] = await connection.execute('SHOW STATUS');
      const [dbVariables] = await connection.execute('SHOW VARIABLES');
      
      // Get table sizes
      const [tableSizes] = await connection.execute(
        `SELECT 
           table_name,
           ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
           table_rows
         FROM information_schema.tables 
         WHERE table_schema = DATABASE()
         ORDER BY (data_length + index_length) DESC`
      );

      // Get slow queries (if slow query log is enabled)
      const [slowQueries] = await connection.execute(
        `SELECT 
           COUNT(*) as slow_query_count
         FROM information_schema.processlist 
         WHERE command = 'Query' 
         AND time > 2`
      );

      const dbMetrics = {
        status: dbStatus.reduce((acc, row) => {
          acc[row.Variable_name] = row.Value;
          return acc;
        }, {}),
        variables: dbVariables.reduce((acc, row) => {
          acc[row.Variable_name] = row.Value;
          return acc;
        }, {}),
        tableSizes: tableSizes,
        slowQueries: slowQueries[0]?.slow_query_count || 0,
        connectionPool: {
          activeConnections: connection.pool ? connection.pool._allConnections.length : 0,
          idleConnections: connection.pool ? connection.pool._freeConnections.length : 0
        },
        timestamp: new Date().toISOString()
      };

      // Store in history
      this.addToHistory('database', dbMetrics);
      
      return dbMetrics;
    } catch (error) {
      console.error('Error monitoring database performance:', error);
      return null;
    }
  }

  /**
   * Get comprehensive performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const [
        cpuMetrics,
        memoryMetrics,
        diskMetrics,
        networkMetrics,
        apiMetrics,
        dbMetrics
      ] = await Promise.all([
        this.monitorCPUUsage(),
        this.monitorMemoryUsage(),
        this.monitorDiskUsage(),
        this.monitorNetworkUsage(),
        this.trackResponseTimes(),
        this.monitorDatabasePerformance()
      ]);

      const overallMetrics = {
        cpu: cpuMetrics,
        memory: memoryMetrics,
        disk: diskMetrics,
        network: networkMetrics,
        api: apiMetrics,
        database: dbMetrics,
        system: await this.getSystemInfo(),
        uptime: await this.getSystemUptime(),
        timestamp: new Date().toISOString()
      };

      // Calculate overall health score
      overallMetrics.healthScore = this.calculateHealthScore(overallMetrics);
      
      return overallMetrics;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return null;
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo() {
    try {
      const systemInfo = await si.system();
      const osInfo = await si.osInfo();
      
      return {
        manufacturer: systemInfo.manufacturer,
        model: systemInfo.model,
        version: systemInfo.version,
        serial: systemInfo.serial,
        uuid: systemInfo.uuid,
        sku: systemInfo.sku,
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          codename: osInfo.codename,
          kernel: osInfo.kernel,
          arch: osInfo.arch,
          hostname: osInfo.hostname,
          fqdn: osInfo.fqdn,
          codepage: osInfo.codepage,
          logofile: osInfo.logofile,
          serial: osInfo.serial,
          build: osInfo.build,
          servicepack: osInfo.servicepack,
          uefi: osInfo.uefi
        }
      };
    } catch (error) {
      console.error('Error getting system info:', error);
      return null;
    }
  }

  /**
   * Get system uptime
   */
  async getSystemUptime() {
    try {
      const uptime = await si.time();
      return {
        uptime: uptime.uptime,
        uptimeFormatted: this.formatUptime(uptime.uptime),
        boottime: uptime.boottime,
        timezone: uptime.timezone,
        timezoneName: uptime.timezoneName
      };
    } catch (error) {
      console.error('Error getting system uptime:', error);
      return null;
    }
  }

  /**
   * Get CPU temperature (if available)
   */
  async getCPUTemperature() {
    try {
      const temp = await si.cpuTemperature();
      return temp.main || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate overall system health score
   */
  calculateHealthScore(metrics) {
    let score = 100;
    
    // CPU usage penalty
    if (metrics.cpu && metrics.cpu.usage > this.thresholds.cpu) {
      score -= Math.min(20, (metrics.cpu.usage - this.thresholds.cpu) * 0.5);
    }
    
    // Memory usage penalty
    if (metrics.memory && metrics.memory.usage > this.thresholds.memory) {
      score -= Math.min(20, (metrics.memory.usage - this.thresholds.memory) * 0.5);
    }
    
    // Disk usage penalty
    if (metrics.disk && metrics.disk.disks.length > 0) {
      const maxDiskUsage = Math.max(...metrics.disk.disks.map(d => d.usage));
      if (maxDiskUsage > this.thresholds.disk) {
        score -= Math.min(15, (maxDiskUsage - this.thresholds.disk) * 0.3);
      }
    }
    
    // Database performance penalty
    if (metrics.database && metrics.database.slowQueries > 5) {
      score -= Math.min(10, metrics.database.slowQueries * 2);
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts() {
    const metrics = await this.getPerformanceMetrics();
    const alerts = [];
    
    if (!metrics) return alerts;
    
    // CPU alerts
    if (metrics.cpu && metrics.cpu.usage > this.thresholds.cpu) {
      alerts.push({
        type: 'cpu',
        severity: metrics.cpu.usage > 95 ? 'critical' : 'warning',
        message: `High CPU usage: ${metrics.cpu.usage}%`,
        value: metrics.cpu.usage,
        threshold: this.thresholds.cpu,
        timestamp: new Date().toISOString()
      });
    }
    
    // Memory alerts
    if (metrics.memory && metrics.memory.usage > this.thresholds.memory) {
      alerts.push({
        type: 'memory',
        severity: metrics.memory.usage > 95 ? 'critical' : 'warning',
        message: `High memory usage: ${metrics.memory.usage}%`,
        value: metrics.memory.usage,
        threshold: this.thresholds.memory,
        timestamp: new Date().toISOString()
      });
    }
    
    // Disk alerts
    if (metrics.disk && metrics.disk.disks.length > 0) {
      metrics.disk.disks.forEach(disk => {
        if (disk.usage > this.thresholds.disk) {
          alerts.push({
            type: 'disk',
            severity: disk.usage > 95 ? 'critical' : 'warning',
            message: `High disk usage on ${disk.mount}: ${disk.usage}%`,
            value: disk.usage,
            threshold: this.thresholds.disk,
            mount: disk.mount,
            timestamp: new Date().toISOString()
          });
        }
      });
    }
    
    // Database alerts
    if (metrics.database && metrics.database.slowQueries > 5) {
      alerts.push({
        type: 'database',
        severity: metrics.database.slowQueries > 20 ? 'critical' : 'warning',
        message: `High number of slow queries: ${metrics.database.slowQueries}`,
        value: metrics.database.slowQueries,
        threshold: 5,
        timestamp: new Date().toISOString()
      });
    }
    
    return alerts;
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(type = 'all', limit = 100) {
    if (type === 'all') {
      return this.metricsHistory.slice(-limit);
    }
    
    return this.metricsHistory
      .filter(metric => metric.type === type)
      .slice(-limit);
  }

  /**
   * Add metrics to history
   */
  addToHistory(type, metrics) {
    this.metricsHistory.push({
      type,
      metrics,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the most recent metrics
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Format uptime duration
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Get current thresholds
   */
  getThresholds() {
    return this.thresholds;
  }

  /**
   * Optimize performance (placeholder for optimization tasks)
   */
  async optimizePerformance() {
    const connection = await getDatabaseConnection();
    
    try {
      // Analyze tables for optimization
      const [tables] = await connection.execute(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = DATABASE()`
      );
      
      const optimizations = [];
      
      for (const table of tables) {
        try {
          await connection.execute(`ANALYZE TABLE ${table.table_name}`);
          optimizations.push({
            table: table.table_name,
            action: 'analyzed',
            status: 'success'
          });
        } catch (error) {
          optimizations.push({
            table: table.table_name,
            action: 'analyze',
            status: 'failed',
            error: error.message
          });
        }
      }
      
      return {
        optimizations,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error optimizing performance:', error);
      throw error;
    }
  }
}

module.exports = PerformanceService;

