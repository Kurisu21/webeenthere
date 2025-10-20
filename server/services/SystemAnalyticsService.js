const { getDatabaseConnection } = require('../database/database');
const os = require('os');
const fs = require('fs').promises;

class SystemAnalyticsService {
  constructor() {
    this.performanceMetrics = [];
    this.errorLogs = [];
  }

  async getConnection() {
    return await getDatabaseConnection();
  }

  /**
   * Monitor system performance
   */
  async monitorPerformance() {
    try {
      const connection = await this.getConnection();
      
      // Database performance metrics
      const startTime = Date.now();
      await connection.execute('SELECT 1');
      const dbResponseTime = Date.now() - startTime;

      // System resource metrics
      const systemMetrics = {
        timestamp: new Date().toISOString(),
        cpu: {
          loadAverage: os.loadavg(),
          cores: os.cpus().length,
          model: os.cpus()[0].model
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        uptime: os.uptime(),
        platform: os.platform(),
        arch: os.arch(),
        database: {
          responseTime: dbResponseTime,
          connectionCount: connection.pool ? connection.pool._allConnections.length : 'N/A'
        }
      };

      // Store performance metrics (keep last 100 entries)
      this.performanceMetrics.push(systemMetrics);
      if (this.performanceMetrics.length > 100) {
        this.performanceMetrics = this.performanceMetrics.slice(-100);
      }

      return systemMetrics;
    } catch (error) {
      console.error('Error monitoring performance:', error);
      throw error;
    }
  }

  /**
   * Track system errors
   */
  async trackErrors(error, context = {}) {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        context: context,
        type: error.name || 'Error'
      };

      // Store error logs (keep last 1000 entries)
      this.errorLogs.push(errorLog);
      if (this.errorLogs.length > 1000) {
        this.errorLogs = this.errorLogs.slice(-1000);
      }

      // Also log to database if connection is available
      const connection = await this.getConnection();
      await connection.execute(
        'INSERT INTO activity_logs (action, details) VALUES (?, ?)',
        ['system_error', JSON.stringify(errorLog)]
      );

      return errorLog;
    } catch (dbError) {
      console.error('Error tracking error:', dbError);
      // Don't throw here to prevent infinite error loops
    }
  }

  /**
   * Monitor resource usage
   */
  async monitorResources() {
    try {
      const connection = await this.getConnection();
      
      // Database table sizes
      const [tableSizes] = await connection.execute(
        `SELECT 
           table_name,
           ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
           table_rows
         FROM information_schema.tables 
         WHERE table_schema = DATABASE()
         ORDER BY (data_length + index_length) DESC`
      );

      // Database connection pool status
      const poolStatus = connection.pool ? {
        totalConnections: connection.pool._allConnections.length,
        freeConnections: connection.pool._freeConnections.length,
        acquiringConnections: connection.pool._acquiringConnections.length
      } : null;

      // Disk usage (if possible)
      let diskUsage = null;
      try {
        const stats = await fs.stat('.');
        diskUsage = {
          available: true,
          // Note: This is a simplified check, actual disk usage would require more complex logic
        };
      } catch (error) {
        diskUsage = { available: false, error: error.message };
      }

      return {
        timestamp: new Date().toISOString(),
        database: {
          tableSizes: tableSizes,
          poolStatus: poolStatus
        },
        diskUsage: diskUsage,
        system: {
          loadAverage: os.loadavg(),
          memoryUsage: {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem()
          }
        }
      };
    } catch (error) {
      console.error('Error monitoring resources:', error);
      throw error;
    }
  }

  /**
   * Get system uptime statistics
   */
  async getUptimeStats() {
    try {
      const connection = await this.getConnection();
      
      // System uptime
      const systemUptime = os.uptime();
      
      // Application uptime (based on earliest activity log)
      const [appUptime] = await connection.execute(
        'SELECT MIN(timestamp) as start_time, MAX(timestamp) as last_activity FROM activity_logs'
      );

      // Database uptime (simplified check)
      const dbStartTime = Date.now();
      await connection.execute('SELECT 1');
      const dbResponseTime = Date.now() - dbStartTime;

      // Calculate uptime periods
      const now = new Date();
      const appStartTime = appUptime[0].start_time ? new Date(appUptime[0].start_time) : now;
      const appUptimeMs = now.getTime() - appStartTime.getTime();

      return {
        system: {
          uptime: systemUptime,
          uptimeFormatted: this.formatUptime(systemUptime),
          bootTime: new Date(Date.now() - systemUptime * 1000).toISOString()
        },
        application: {
          uptime: appUptimeMs,
          uptimeFormatted: this.formatUptime(appUptimeMs / 1000),
          startTime: appStartTime.toISOString(),
          lastActivity: appUptime[0].last_activity
        },
        database: {
          responseTime: dbResponseTime,
          status: dbResponseTime < 100 ? 'healthy' : 'slow'
        }
      };
    } catch (error) {
      console.error('Error getting uptime stats:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics history
   */
  async getPerformanceMetrics() {
    try {
      // Get recent performance metrics
      const recentMetrics = this.performanceMetrics.slice(-24); // Last 24 entries
      
      // Calculate averages
      const avgCpuLoad = recentMetrics.length > 0 
        ? recentMetrics.reduce((sum, m) => sum + m.cpu.loadAverage[0], 0) / recentMetrics.length 
        : 0;
      
      const avgMemoryUsage = recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + parseFloat(m.memory.usagePercent), 0) / recentMetrics.length
        : 0;

      const avgDbResponseTime = recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.database.responseTime, 0) / recentMetrics.length
        : 0;

      // Get error count in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentErrors = this.errorLogs.filter(error => 
        new Date(error.timestamp) > oneHourAgo
      );

      return {
        current: recentMetrics[recentMetrics.length - 1] || null,
        averages: {
          cpuLoad: avgCpuLoad.toFixed(2),
          memoryUsage: avgMemoryUsage.toFixed(2),
          dbResponseTime: avgDbResponseTime.toFixed(2)
        },
        recentMetrics: recentMetrics,
        errorCount: recentErrors.length,
        status: this.getSystemStatus(avgCpuLoad, avgMemoryUsage, avgDbResponseTime)
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get system health status
   */
  getSystemStatus(cpuLoad, memoryUsage, dbResponseTime) {
    const issues = [];
    
    if (cpuLoad > 2.0) issues.push('High CPU load');
    if (memoryUsage > 80) issues.push('High memory usage');
    if (dbResponseTime > 100) issues.push('Slow database response');
    
    if (issues.length === 0) {
      return { status: 'healthy', message: 'All systems operational' };
    } else if (issues.length === 1) {
      return { status: 'warning', message: issues[0] };
    } else {
      return { status: 'critical', message: `Multiple issues: ${issues.join(', ')}` };
    }
  }

  /**
   * Format uptime in human readable format
   */
  formatUptime(seconds) {
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
  }

  /**
   * Get system alerts
   */
  async getSystemAlerts() {
    try {
      const alerts = [];
      const metrics = await this.getPerformanceMetrics();
      
      // Check for performance issues
      if (metrics.averages.cpuLoad > 2.0) {
        alerts.push({
          type: 'warning',
          category: 'performance',
          message: 'High CPU load detected',
          value: metrics.averages.cpuLoad,
          threshold: 2.0,
          timestamp: new Date().toISOString()
        });
      }

      if (metrics.averages.memoryUsage > 80) {
        alerts.push({
          type: 'warning',
          category: 'performance',
          message: 'High memory usage detected',
          value: metrics.averages.memoryUsage,
          threshold: 80,
          timestamp: new Date().toISOString()
        });
      }

      if (metrics.averages.dbResponseTime > 100) {
        alerts.push({
          type: 'warning',
          category: 'database',
          message: 'Slow database response time',
          value: metrics.averages.dbResponseTime,
          threshold: 100,
          timestamp: new Date().toISOString()
        });
      }

      // Check for recent errors
      if (metrics.errorCount > 10) {
        alerts.push({
          type: 'error',
          category: 'system',
          message: 'High error rate detected',
          value: metrics.errorCount,
          threshold: 10,
          timestamp: new Date().toISOString()
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error getting system alerts:', error);
      throw error;
    }
  }

  /**
   * Get system summary
   */
  async getSystemSummary() {
    try {
      const [performance, uptime, resources, alerts] = await Promise.all([
        this.getPerformanceMetrics(),
        this.getUptimeStats(),
        this.monitorResources(),
        this.getSystemAlerts()
      ]);

      return {
        performance,
        uptime,
        resources,
        alerts,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting system summary:', error);
      throw error;
    }
  }
}

module.exports = new SystemAnalyticsService();
