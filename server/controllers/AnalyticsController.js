const analyticsService = require('../services/AnalyticsService');
const userAnalyticsService = require('../services/UserAnalyticsService');
const systemAnalyticsService = require('../services/SystemAnalyticsService');
const websiteAnalyticsService = require('../services/WebsiteAnalyticsService');
const pdfReportService = require('../services/PDFReportService');

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
        const [retention, growth, segments, comparison, evidence] = await Promise.all([
          this.userAnalyticsService.getUserRetention(),
          this.userAnalyticsService.getUserGrowth(),
          this.userAnalyticsService.getUserSegments(),
          this.userAnalyticsService.getUserComparisonMetrics(),
          this.userAnalyticsService.getAnalyticsEvidence()
        ]);

        res.json({ 
          success: true, 
          data: { 
            retention, 
            growth, 
            segments, 
            comparison,
            evidence
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

      if (!['comprehensive', 'user', 'website', 'activity'].includes(type)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid type. Supported: comprehensive, user, website, activity' 
        });
      }

      if (!['json', 'csv', 'pdf'].includes(format)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid format. Supported: json, csv, pdf' 
        });
      }

      const report = await this.analyticsService.generateReports(period, type);

      if (format === 'pdf') {
        // Convert period to days format for PDF service
        const periodMap = {
          'daily': '1d',
          'weekly': '7d',
          'monthly': '30d',
          'yearly': '365d'
        };
        const periodDays = periodMap[period] || '30d';
        const pdfBuffer = await pdfReportService.generatePDFReport(type, periodDays, {});
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${period}-${type}.pdf"`);
        res.send(pdfBuffer);
      } else if (format === 'csv') {
        const csvData = this.convertReportToCSV(report);
        const appName = (process.env.APP_NAME || 'WeBeenthere').toLowerCase().replace(/\s+/g, '-');
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `${appName}-analytics-report-${type}-${period}-${dateStr}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
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

      const [userMetrics, websiteMetrics] = await Promise.all([
        this.analyticsService.collectUserMetrics(),
        this.analyticsService.collectWebsiteMetrics()
      ]);

      res.json({ 
        success: true, 
        data: { 
          userMetrics, 
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
   * Convert report to CSV format with advanced details
   */
  convertReportToCSV(report) {
    const csvRows = [];
    const appName = process.env.APP_NAME || 'WeBeenthere';
    const reportDate = new Date().toISOString();
    const formattedDate = new Date(reportDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    // Report Header Section
    csvRows.push('='.repeat(80));
    csvRows.push(`${appName.toUpperCase()} - ANALYTICS REPORT`);
    csvRows.push('='.repeat(80));
    csvRows.push('');
    csvRows.push(`Report Title,${this.getReportTitle(report.type, report.period)}`);
    csvRows.push(`Brand Name,${appName}`);
    csvRows.push(`Report Type,${report.type.charAt(0).toUpperCase() + report.type.slice(1)}`);
    csvRows.push(`Period,${report.period.charAt(0).toUpperCase() + report.period.slice(1)}`);
    csvRows.push(`Date Created,${formattedDate}`);
    csvRows.push(`Generated At,${report.generatedAt || reportDate}`);
    csvRows.push('');
    csvRows.push('='.repeat(80));
    csvRows.push('');
    
    // User Metrics Section
    csvRows.push('USER METRICS');
    csvRows.push('-'.repeat(80));
    if (report.userMetrics) {
      csvRows.push(`Total Users,${escapeCSV(report.userMetrics.totalUsers || 0)}`);
      csvRows.push(`New Users This Period,${escapeCSV(report.userMetrics.newUsersThisMonth || 0)}`);
      csvRows.push(`Active Users,${escapeCSV(report.userMetrics.activeUsers || 0)}`);
      csvRows.push(`Inactive Users,${escapeCSV(report.userMetrics.inactiveUsers || 0)}`);
      if (report.userMetrics.userGrowth) {
        csvRows.push(`User Growth Rate,${escapeCSV(report.userMetrics.userGrowth)}%`);
      }
      if (report.userMetrics.retentionRate) {
        csvRows.push(`User Retention Rate,${escapeCSV(report.userMetrics.retentionRate)}%`);
      }
    }
    csvRows.push('');
    
    // Website Metrics Section
    csvRows.push('WEBSITE METRICS');
    csvRows.push('-'.repeat(80));
    if (report.websiteMetrics) {
      csvRows.push(`Total Websites,${escapeCSV(report.websiteMetrics.totalWebsites || 0)}`);
      csvRows.push(`Published Websites,${escapeCSV(report.websiteMetrics.publishedWebsites || 0)}`);
      csvRows.push(`Unpublished Websites,${escapeCSV((report.websiteMetrics.totalWebsites || 0) - (report.websiteMetrics.publishedWebsites || 0))}`);
      csvRows.push(`New Websites This Period,${escapeCSV(report.websiteMetrics.newWebsitesThisMonth || 0)}`);
      if (report.websiteMetrics.publicationRate) {
        csvRows.push(`Publication Rate,${escapeCSV(report.websiteMetrics.publicationRate)}%`);
      }
    }
    csvRows.push('');
    
    // Activity Breakdown Section
    if (report.activityBreakdown && report.activityBreakdown.length > 0) {
      csvRows.push('ACTIVITY BREAKDOWN');
      csvRows.push('-'.repeat(80));
      csvRows.push('Action,Count');
      report.activityBreakdown.forEach(activity => {
        csvRows.push(`${escapeCSV(activity.action)},${escapeCSV(activity.count)}`);
      });
      csvRows.push('');
    }
    
    // User Activity Section
    if (report.userActivity && report.userActivity.length > 0) {
      csvRows.push('TOP USER ACTIVITY');
      csvRows.push('-'.repeat(80));
      csvRows.push('Username,Email,Activity Count,Last Activity');
      report.userActivity.forEach(user => {
        csvRows.push(`${escapeCSV(user.username)},${escapeCSV(user.email)},${escapeCSV(user.activity_count)},${escapeCSV(user.last_activity || 'N/A')}`);
      });
      csvRows.push('');
    }
    
    // Summary Section
    csvRows.push('='.repeat(80));
    csvRows.push('REPORT SUMMARY');
    csvRows.push('-'.repeat(80));
    csvRows.push(`Total Records,${this.getTotalRecords(report)}`);
    csvRows.push(`Report Period,${report.period}`);
    csvRows.push(`Report Type,${report.type}`);
    csvRows.push(`Generated By,System`);
    csvRows.push(`Export Format,CSV`);
    csvRows.push('');
    csvRows.push('='.repeat(80));
    csvRows.push(`End of Report - ${appName}`);
    csvRows.push('='.repeat(80));
    
    return csvRows.join('\n');
  }
  
  /**
   * Get report title based on type and period
   */
  getReportTitle(type, period) {
    const typeMap = {
      'comprehensive': 'Comprehensive Analytics Report',
      'user': 'User Analytics Report',
      'website': 'Website Analytics Report',
      'activity': 'Activity Analytics Report'
    };
    
    const periodMap = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'yearly': 'Yearly'
    };
    
    return `${periodMap[period] || 'Monthly'} ${typeMap[type] || 'Analytics Report'}`;
  }
  
  /**
   * Calculate total records in report
   */
  getTotalRecords(report) {
    let total = 0;
    if (report.userMetrics) {
      total += (report.userMetrics.totalUsers || 0);
    }
    if (report.websiteMetrics) {
      total += (report.websiteMetrics.totalWebsites || 0);
    }
    if (report.activityBreakdown) {
      total += report.activityBreakdown.length;
    }
    if (report.userActivity) {
      total += report.userActivity.length;
    }
    return total;
  }
}

module.exports = AnalyticsController;
