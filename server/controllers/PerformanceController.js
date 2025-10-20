const PerformanceService = require('../services/PerformanceService');

class PerformanceController {
  constructor() {
    this.performanceService = new PerformanceService();
  }

  /**
   * Get overall performance metrics
   */
  async getPerformanceMetrics(req, res) {
    try {
      const metrics = await this.performanceService.getPerformanceMetrics();
      
      if (!metrics) {
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to retrieve performance metrics' 
        });
      }

      res.json({ 
        success: true, 
        metrics: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get performance metrics error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve performance metrics' });
    }
  }

  /**
   * Get system resource usage
   */
  async getSystemResources(req, res) {
    try {
      const [
        cpuMetrics,
        memoryMetrics,
        diskMetrics,
        networkMetrics
      ] = await Promise.all([
        this.performanceService.monitorCPUUsage(),
        this.performanceService.monitorMemoryUsage(),
        this.performanceService.monitorDiskUsage(),
        this.performanceService.monitorNetworkUsage()
      ]);

      const resources = {
        cpu: cpuMetrics,
        memory: memoryMetrics,
        disk: diskMetrics,
        network: networkMetrics,
        timestamp: new Date().toISOString()
      };

      res.json({ 
        success: true, 
        resources: resources,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get system resources error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve system resources' });
    }
  }

  /**
   * Get API performance metrics
   */
  async getAPIPerformance(req, res) {
    try {
      const apiMetrics = await this.performanceService.trackResponseTimes();
      
      res.json({ 
        success: true, 
        apiMetrics: apiMetrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get API performance error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve API performance metrics' });
    }
  }

  /**
   * Get database performance metrics
   */
  async getDatabasePerformance(req, res) {
    try {
      const dbMetrics = await this.performanceService.monitorDatabasePerformance();
      
      res.json({ 
        success: true, 
        databaseMetrics: dbMetrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get database performance error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve database performance metrics' });
    }
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts(req, res) {
    try {
      const alerts = await this.performanceService.getPerformanceAlerts();
      
      res.json({ 
        success: true, 
        alerts: alerts,
        summary: {
          total: alerts.length,
          critical: alerts.filter(a => a.severity === 'critical').length,
          warning: alerts.filter(a => a.severity === 'warning').length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get performance alerts error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve performance alerts' });
    }
  }

  /**
   * Optimize system performance
   */
  async optimizePerformance(req, res) {
    try {
      const optimization = await this.performanceService.optimizePerformance();
      
      res.json({ 
        success: true, 
        message: 'Performance optimization completed',
        optimization: optimization,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Optimize performance error:', error);
      res.status(500).json({ success: false, error: 'Failed to optimize performance' });
    }
  }

  /**
   * Get performance history
   */
  async getPerformanceHistory(req, res) {
    try {
      const { type = 'all', limit = 100 } = req.query;
      const history = this.performanceService.getPerformanceHistory(type, parseInt(limit));
      
      res.json({ 
        success: true, 
        history: history,
        type: type,
        limit: parseInt(limit),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get performance history error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve performance history' });
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo(req, res) {
    try {
      const systemInfo = await this.performanceService.getSystemInfo();
      const uptime = await this.performanceService.getSystemUptime();
      
      res.json({ 
        success: true, 
        systemInfo: systemInfo,
        uptime: uptime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get system info error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve system information' });
    }
  }

  /**
   * Get performance thresholds
   */
  async getPerformanceThresholds(req, res) {
    try {
      const thresholds = this.performanceService.getThresholds();
      
      res.json({ 
        success: true, 
        thresholds: thresholds,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get performance thresholds error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve performance thresholds' });
    }
  }

  /**
   * Update performance thresholds
   */
  async updatePerformanceThresholds(req, res) {
    try {
      const { thresholds } = req.body;
      
      if (!thresholds || typeof thresholds !== 'object') {
        return res.status(400).json({ 
          success: false, 
          error: 'Thresholds object is required' 
        });
      }

      // Validate thresholds
      const validThresholds = this.validateThresholds(thresholds);
      
      this.performanceService.updateThresholds(validThresholds);
      
      res.json({ 
        success: true, 
        message: 'Performance thresholds updated successfully',
        thresholds: validThresholds,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update performance thresholds error:', error);
      res.status(500).json({ success: false, error: 'Failed to update performance thresholds' });
    }
  }

  /**
   * Get real-time performance metrics
   */
  async getRealTimeMetrics(req, res) {
    try {
      const [
        cpuMetrics,
        memoryMetrics,
        alerts
      ] = await Promise.all([
        this.performanceService.monitorCPUUsage(),
        this.performanceService.monitorMemoryUsage(),
        this.performanceService.getPerformanceAlerts()
      ]);

      const realTimeMetrics = {
        cpu: cpuMetrics,
        memory: memoryMetrics,
        alerts: alerts,
        timestamp: new Date().toISOString()
      };

      res.json({ 
        success: true, 
        realTimeMetrics: realTimeMetrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get real-time metrics error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve real-time metrics' });
    }
  }

  /**
   * Validate performance thresholds
   */
  validateThresholds(thresholds) {
    const validThresholds = {};
    
    if (typeof thresholds.cpu === 'number' && thresholds.cpu >= 0 && thresholds.cpu <= 100) {
      validThresholds.cpu = thresholds.cpu;
    }
    
    if (typeof thresholds.memory === 'number' && thresholds.memory >= 0 && thresholds.memory <= 100) {
      validThresholds.memory = thresholds.memory;
    }
    
    if (typeof thresholds.disk === 'number' && thresholds.disk >= 0 && thresholds.disk <= 100) {
      validThresholds.disk = thresholds.disk;
    }
    
    if (typeof thresholds.responseTime === 'number' && thresholds.responseTime >= 0) {
      validThresholds.responseTime = thresholds.responseTime;
    }
    
    if (typeof thresholds.dbConnections === 'number' && thresholds.dbConnections >= 0 && thresholds.dbConnections <= 100) {
      validThresholds.dbConnections = thresholds.dbConnections;
    }
    
    return validThresholds;
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(req, res) {
    try {
      const { period = '24h' } = req.query;
      
      const metrics = await this.performanceService.getPerformanceMetrics();
      const alerts = await this.performanceService.getPerformanceAlerts();
      const history = this.performanceService.getPerformanceHistory('all', 100);
      
      const report = {
        period: period,
        generatedAt: new Date().toISOString(),
        summary: {
          healthScore: metrics?.healthScore || 0,
          totalAlerts: alerts.length,
          criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
          warningAlerts: alerts.filter(a => a.severity === 'warning').length
        },
        metrics: metrics,
        alerts: alerts,
        history: history,
        recommendations: this.generateRecommendations(metrics, alerts)
      };

      res.json({ 
        success: true, 
        report: report,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Generate performance report error:', error);
      res.status(500).json({ success: false, error: 'Failed to generate performance report' });
    }
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(metrics, alerts) {
    const recommendations = [];
    
    if (metrics?.cpu?.usage > 80) {
      recommendations.push('Consider optimizing CPU-intensive operations or scaling horizontally');
    }
    
    if (metrics?.memory?.usage > 80) {
      recommendations.push('Monitor memory usage and consider increasing available memory');
    }
    
    if (metrics?.disk?.disks?.some(disk => disk.usage > 80)) {
      recommendations.push('Consider cleaning up disk space or expanding storage');
    }
    
    if (metrics?.database?.slowQueries > 10) {
      recommendations.push('Review and optimize database queries');
    }
    
    if (alerts.length > 5) {
      recommendations.push('Multiple performance issues detected - consider comprehensive system review');
    }
    
    return recommendations;
  }
}

module.exports = PerformanceController;

