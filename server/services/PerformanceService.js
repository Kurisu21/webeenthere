const si = require('systeminformation');
const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class PerformanceService {
  constructor() {
    this.metricsHistory = [];
    this.maxHistorySize = 1000;
    this.thresholds = {
      responseTime: 2000, // Response time in milliseconds
      dbConnections: 80 // Database connection percentage
    };
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
        apiMetrics,
        dbMetrics
      ] = await Promise.all([
        this.trackResponseTimes(),
        this.monitorDatabasePerformance()
      ]);

      const overallMetrics = {
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
   * Calculate overall system health score
   */
  calculateHealthScore(metrics) {
    let score = 100;
    
    // Database performance penalty
    if (metrics.database && metrics.database.slowQueries > 5) {
      score -= Math.min(10, metrics.database.slowQueries * 2);
    }
    
    // API performance penalty
    if (metrics.api && metrics.api.endpoints.length > 0) {
      const avgResponseTime = metrics.api.endpoints.reduce((sum, ep) => sum + ep.avgResponseTimeMs, 0) / metrics.api.endpoints.length;
      if (avgResponseTime > this.thresholds.responseTime) {
        score -= Math.min(15, (avgResponseTime - this.thresholds.responseTime) / 100);
      }
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
    
    // API response time alerts
    if (metrics.api && metrics.api.endpoints.length > 0) {
      metrics.api.endpoints.forEach(endpoint => {
        if (endpoint.avgResponseTimeMs > this.thresholds.responseTime) {
          alerts.push({
            type: 'api',
            severity: endpoint.avgResponseTimeMs > 5000 ? 'critical' : 'warning',
            message: `Slow API response for ${endpoint.action}: ${endpoint.avgResponseTimeMs}ms`,
            value: endpoint.avgResponseTimeMs,
            threshold: this.thresholds.responseTime,
            endpoint: endpoint.action,
            timestamp: new Date().toISOString()
          });
        }
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

