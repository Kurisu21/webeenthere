const analyticsService = require('../services/AnalyticsService');
const userAnalyticsService = require('../services/UserAnalyticsService');
const systemAnalyticsService = require('../services/SystemAnalyticsService');
const websiteAnalyticsService = require('../services/WebsiteAnalyticsService');

class AnalyticsController {
  constructor() {
    this.analyticsService = analyticsService;
    this.userAnalyticsService = userAnalyticsService;
    this.systemAnalyticsService = systemAnalyticsService;
    this.websiteAnalyticsService = websiteAnalyticsService;
  }

  /**
   * Get dashboard metrics overview
   */
  async getDashboardMetrics(req, res) {
    try {
      const metrics = await this.analyticsService.getDashboardMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve dashboard metrics' });
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(req, res) {
    try {
      const { userId, period = '30' } = req.query;

      if (userId) {
        // Get analytics for specific user
        const [engagement, timeline] = await Promise.all([
          this.userAnalyticsService.getUserEngagement(parseInt(userId)),
          this.userAnalyticsService.getUserActivityTimeline(parseInt(userId), parseInt(period))
        ]);

        res.json({ 
          success: true, 
          data: { 
            engagement, 
            timeline,
            userId: parseInt(userId)
          } 
        });
      } else {
        // Get general user analytics
        const [retention, growth, segments, comparison] = await Promise.all([
          this.userAnalyticsService.getUserRetention(),
          this.userAnalyticsService.getUserGrowth(),
          this.userAnalyticsService.getUserSegments(),
          this.userAnalyticsService.getUserComparisonMetrics()
        ]);

        res.json({ 
          success: true, 
          data: { 
            retention, 
            growth, 
            segments, 
            comparison 
          } 
        });
      }
    } catch (error) {
      console.error('Get user analytics error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve user analytics' });
    }
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics(req, res) {
    try {
      const [performance, uptime, resources, alerts] = await Promise.all([
        this.systemAnalyticsService.getPerformanceMetrics(),
        this.systemAnalyticsService.getUptimeStats(),
        this.systemAnalyticsService.monitorResources(),
        this.systemAnalyticsService.getSystemAlerts()
      ]);

      res.json({ 
        success: true, 
        data: { 
          performance, 
          uptime, 
          resources, 
          alerts 
        } 
      });
    } catch (error) {
      console.error('Get system analytics error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve system analytics' });
    }
  }

  /**
   * Get website analytics
   */
  async getWebsiteAnalytics(req, res) {
    try {
      const { period = '30', websiteId } = req.query;

      const [overview, popularPages, trafficSources, conversionRates, performance, geoDistribution] = await Promise.all([
        this.websiteAnalyticsService.getWebsiteAnalyticsOverview(period),
        this.websiteAnalyticsService.getPopularPages(10, period),
        this.websiteAnalyticsService.getTrafficSources(period),
        this.websiteAnalyticsService.getConversionRates(period),
        this.websiteAnalyticsService.getWebsitePerformanceMetrics(websiteId),
        this.websiteAnalyticsService.getGeographicDistribution(period)
      ]);

      res.json({ 
        success: true, 
        data: { 
          overview, 
          popularPages, 
          trafficSources, 
          conversionRates, 
          performance, 
          geoDistribution,
          period: parseInt(period),
          websiteId: websiteId ? parseInt(websiteId) : null
        } 
      });
    } catch (error) {
      console.error('Get website analytics error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve website analytics' });
    }
  }

  /**
   * Generate custom reports
   */
  async generateReport(req, res) {
    try {
      const { period = 'monthly', type = 'comprehensive', format = 'json' } = req.body;

      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid period. Supported: daily, weekly, monthly, yearly' 
        });
      }

      if (!['comprehensive', 'user', 'system', 'website', 'activity'].includes(type)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid type. Supported: comprehensive, user, system, website, activity' 
        });
      }

      const report = await this.analyticsService.generateReports(period, type);

      if (format === 'csv') {
        const csvData = this.convertReportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${period}-${type}.csv"`);
        res.send(csvData);
      } else {
        res.json({ success: true, data: report });
      }
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({ success: false, error: 'Failed to generate report' });
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(req, res) {
    try {
      const { 
        format = 'json', 
        startDate, 
        endDate, 
        userId, 
        action, 
        limit = 10000 
      } = req.query;

      if (!['json', 'csv'].includes(format)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid format. Supported: json, csv' 
        });
      }

      const filters = {
        startDate,
        endDate,
        userId: userId ? parseInt(userId) : null,
        action,
        limit: parseInt(limit)
      };

      const data = await this.analyticsService.exportAnalytics(format, filters);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.csv"');
        res.send(data);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.json"');
        res.send(data);
      }
    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({ success: false, error: 'Failed to export analytics data' });
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(req, res) {
    try {
      const metrics = await this.analyticsService.getRealTimeMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error('Get real-time metrics error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve real-time metrics' });
    }
  }

  /**
   * Track page view
   */
  async trackPageView(req, res) {
    try {
      const { websiteId, page = '/', referrer, userAgent } = req.body;
      const visitorIp = req.ip || req.connection.remoteAddress;

      if (!websiteId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Website ID is required' 
        });
      }

      await this.websiteAnalyticsService.trackPageViews(websiteId, page, {
        visitorIp,
        userAgent,
        referrer
      });

      res.json({ success: true, message: 'Page view tracked successfully' });
    } catch (error) {
      console.error('Track page view error:', error);
      res.status(500).json({ success: false, error: 'Failed to track page view' });
    }
  }

  /**
   * Track user journey
   */
  async trackUserJourney(req, res) {
    try {
      const { userId, path, websiteId } = req.body;

      if (!userId || !path) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID and path are required' 
        });
      }

      await this.websiteAnalyticsService.trackUserJourney(userId, path, websiteId);

      res.json({ success: true, message: 'User journey tracked successfully' });
    } catch (error) {
      console.error('Track user journey error:', error);
      res.status(500).json({ success: false, error: 'Failed to track user journey' });
    }
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(req, res) {
    try {
      const { period = '30' } = req.query;

      const [userMetrics, systemMetrics, websiteMetrics] = await Promise.all([
        this.analyticsService.collectUserMetrics(),
        this.analyticsService.collectSystemMetrics(),
        this.analyticsService.collectWebsiteMetrics()
      ]);

      res.json({ 
        success: true, 
        data: { 
          userMetrics, 
          systemMetrics, 
          websiteMetrics,
          period: parseInt(period),
          generatedAt: new Date().toISOString()
        } 
      });
    } catch (error) {
      console.error('Get analytics summary error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve analytics summary' });
    }
  }

  /**
   * Convert report to CSV format
   */
  convertReportToCSV(report) {
    const csvRows = [];
    
    // Add header
    csvRows.push('Metric,Value,Period,Generated At');
    
    // Add user metrics
    csvRows.push(`Total Users,${report.userMetrics.totalUsers},${report.period},${report.generatedAt}`);
    csvRows.push(`New Users This Month,${report.userMetrics.newUsersThisMonth},${report.period},${report.generatedAt}`);
    csvRows.push(`Active Users,${report.userMetrics.activeUsers},${report.period},${report.generatedAt}`);
    
    // Add system metrics
    csvRows.push(`Total Activities,${report.systemMetrics.totalActivities},${report.period},${report.generatedAt}`);
    csvRows.push(`Today Activities,${report.systemMetrics.todayActivities},${report.period},${report.generatedAt}`);
    csvRows.push(`Week Activities,${report.systemMetrics.weekActivities},${report.period},${report.generatedAt}`);
    
    // Add website metrics
    csvRows.push(`Total Websites,${report.websiteMetrics.totalWebsites},${report.period},${report.generatedAt}`);
    csvRows.push(`Published Websites,${report.websiteMetrics.publishedWebsites},${report.period},${report.generatedAt}`);
    csvRows.push(`New Websites This Month,${report.websiteMetrics.newWebsitesThisMonth},${report.period},${report.generatedAt}`);
    
    return csvRows.join('\n');
  }
}

module.exports = AnalyticsController;
