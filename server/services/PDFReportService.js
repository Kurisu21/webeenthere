const PDFDocument = require('pdfkit');
const { getDatabaseConnection } = require('../database/database');
const analyticsService = require('./AnalyticsService');
const userAnalyticsService = require('./UserAnalyticsService');
const websiteAnalyticsService = require('./WebsiteAnalyticsService');

class PDFReportService {
  constructor() {
    this.connection = null;
  }

  async getConnection() {
    if (!this.connection) {
      this.connection = await getDatabaseConnection();
    }
    return this.connection;
  }

  /**
   * Generate comprehensive PDF report
   */
  async generatePDFReport(reportType = 'comprehensive', period = 'monthly', filters = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Get website/app name from environment or default
        const appName = process.env.APP_NAME || 'WeBeenthere';
        const reportDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        // Convert period to number for queries
        const periodDaysNum = typeof period === 'string' && period.includes('d') 
          ? parseInt(period.replace('d', '')) 
          : (typeof period === 'number' ? period : 30);

        // Convert period to days string for display
        const periodDaysStr = typeof period === 'string' && period.includes('d') 
          ? period.replace('d', '') 
          : (typeof period === 'number' ? period.toString() : '30');

        // Header
        this.addHeader(doc, appName, reportDate, reportType, `${periodDaysStr} days`);

        // Generate report content based on type
        switch (reportType) {
          case 'comprehensive':
            await this.addComprehensiveReport(doc, periodDaysNum);
            break;
          case 'user':
            await this.addUserReport(doc, periodDaysNum, filters);
            break;
          case 'website':
            await this.addWebsiteReport(doc, periodDaysNum, filters);
            break;
          default:
            await this.addComprehensiveReport(doc, periodDaysNum);
        }

        // Footer
        this.addFooter(doc, reportDate);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header to PDF
   */
  addHeader(doc, appName, reportDate, reportType, period) {
    // Title background
    doc.rect(0, 0, doc.page.width, 120)
      .fillColor('#6366f1')
      .fill();

    // App name
    doc.fillColor('#ffffff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text(appName, 50, 30, { align: 'left' });

    // Report title
    doc.fontSize(18)
      .text(`${this.formatReportType(reportType)} Report`, 50, 65, { align: 'left' });

    // Report date and period
    doc.fontSize(10)
      .font('Helvetica')
      .text(`Generated: ${reportDate} | Period: ${period} days`, 50, 95, { align: 'left' });

    // Reset color
    doc.fillColor('#000000');
    doc.y = 140;
  }

  /**
   * Add footer to PDF
   */
  addFooter(doc, reportDate) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
        .fillColor('#666666')
        .text(
          `Page ${i + 1} of ${pageCount} | Generated on ${reportDate}`,
          50,
          doc.page.height - 30,
          { align: 'center' }
        );
    }
    doc.fillColor('#000000');
  }

  /**
   * Format report type for display
   */
  formatReportType(type) {
    const types = {
      comprehensive: 'Comprehensive Analytics',
      user: 'User Analytics',
      website: 'Website Analytics'
    };
    return types[type] || 'Analytics';
  }

  /**
   * Add comprehensive report content
   */
  async addComprehensiveReport(doc, period) {
    try {
      // User Metrics
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('User Metrics', 50, doc.y + 20);
      doc.moveDown(0.5);

      const userMetrics = await analyticsService.collectUserMetrics();
      doc.fontSize(11)
        .font('Helvetica')
        .text(`Total Users: ${userMetrics.totalUsers}`, { indent: 20 })
        .text(`New Users This Month: ${userMetrics.newUsersThisMonth}`, { indent: 20 })
        .text(`Active Users (30 days): ${userMetrics.activeUsers}`, { indent: 20 });
      doc.moveDown();

      // Website Metrics
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('Website Metrics', 50, doc.y + 10);
      doc.moveDown(0.5);

      const websiteMetrics = await analyticsService.collectWebsiteMetrics();
      doc.fontSize(11)
        .font('Helvetica')
        .text(`Total Websites: ${websiteMetrics.totalWebsites}`, { indent: 20 })
        .text(`Published Websites: ${websiteMetrics.publishedWebsites}`, { indent: 20 })
        .text(`New Websites This Month: ${websiteMetrics.newWebsitesThisMonth}`, { indent: 20 });
      doc.moveDown();

      // Website Performance
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('Website Performance', 50, doc.y + 10);
      doc.moveDown(0.5);

      // Helper function to safely convert to number and format
      const safeToFixed = (value, decimals = 1) => {
        if (value === null || value === undefined) return '0';
        const num = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(num) ? '0' : num.toFixed(decimals);
      };

      const performance = await websiteAnalyticsService.getWebsitePerformanceMetrics();
      doc.fontSize(11)
        .font('Helvetica')
        .text(`Average Visits Per Day: ${safeToFixed(performance.avgVisitsPerDay?.avg_visits_per_day)}`, { indent: 20 })
        .text(`Bounce Rate: ${safeToFixed(performance.bounceRate?.bounce_rate)}%`, { indent: 20 })
        .text(`Return Visitor Rate: ${safeToFixed(performance.returnVisitorRate?.return_rate)}%`, { indent: 20 });
      doc.moveDown();

      // Top Websites
      if (performance.topWebsites && performance.topWebsites.length > 0) {
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .text('Top Performing Websites', 50, doc.y + 10);
        doc.moveDown(0.3);

        performance.topWebsites.slice(0, 10).forEach((website, index) => {
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }
          doc.fontSize(10)
            .font('Helvetica')
            .text(`${index + 1}. ${website.title || 'Untitled'} (by ${website.owner || 'Unknown'})`, { indent: 20 })
            .text(`   Views: ${website.total_views} | Unique: ${website.unique_visitors} | Status: ${website.is_published ? 'Published' : 'Draft'}`, { indent: 30 });
          doc.moveDown(0.3);
        });
      }

    } catch (error) {
      doc.fontSize(11)
        .fillColor('#ff0000')
        .text(`Error generating report: ${error.message}`, { indent: 20 });
      doc.fillColor('#000000');
    }
  }

  /**
   * Add user report content
   */
  async addUserReport(doc, period, filters) {
    try {
      const [retention, growth, segments, comparison] = await Promise.all([
        userAnalyticsService.getUserRetention(),
        userAnalyticsService.getUserGrowth(),
        userAnalyticsService.getUserSegments(),
        userAnalyticsService.getUserComparisonMetrics()
      ]);

      // User Growth
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('User Growth', 50, doc.y + 20);
      doc.moveDown(0.5);

      doc.fontSize(11)
        .font('Helvetica')
        .text(`Total Users: ${growth.totalUsers || 0}`, { indent: 20 });
      
      if (growth.monthly && growth.monthly.length > 0) {
        const lastMonth = growth.monthly[growth.monthly.length - 1];
        doc.text(`New Users Last Month: ${lastMonth.new_users || 0}`, { indent: 20 });
      }
      doc.moveDown();

      // User Segments
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('User Segments', 50, doc.y + 10);
      doc.moveDown(0.5);

      if (segments && segments.summary) {
        doc.fontSize(11)
          .font('Helvetica')
          .text(`Power Users: ${segments.summary.powerUsersCount || 0}`, { indent: 20 })
          .text(`New Users: ${segments.summary.newUsersCount || 0}`, { indent: 20 })
          .text(`Inactive Users: ${segments.summary.inactiveUsersCount || 0}`, { indent: 20 })
          .text(`Publishers: ${segments.summary.publishersCount || 0}`, { indent: 20 });
      }
      doc.moveDown();

      // Comparison Metrics
      if (comparison) {
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('Activity Metrics', 50, doc.y + 10);
        doc.moveDown(0.5);

        if (comparison.activityMetrics) {
          doc.fontSize(11)
            .font('Helvetica')
            .text(`Avg Activities/User: ${comparison.activityMetrics.avg_activities_per_user?.toFixed(1) || 0}`, { indent: 20 })
            .text(`Max Activities: ${comparison.activityMetrics.max_activities || 0}`, { indent: 20 });
        }

        if (comparison.websiteMetrics) {
          doc.text(`Avg Websites/User: ${comparison.websiteMetrics.avg_websites_per_user?.toFixed(1) || 0}`, { indent: 20 })
            .text(`Max Websites: ${comparison.websiteMetrics.max_websites || 0}`, { indent: 20 });
        }
      }

    } catch (error) {
      doc.fontSize(11)
        .fillColor('#ff0000')
        .text(`Error generating user report: ${error.message}`, { indent: 20 });
      doc.fillColor('#000000');
    }
  }

  /**
   * Add website report content
   */
  async addWebsiteReport(doc, period, filters) {
    try {
      const [overview, performance, conversionRates] = await Promise.all([
        websiteAnalyticsService.getWebsiteAnalyticsOverview(period),
        websiteAnalyticsService.getWebsitePerformanceMetrics(filters.websiteId),
        websiteAnalyticsService.getConversionRates(period)
      ]);

      // Overview
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('Website Overview', 50, doc.y + 20);
      doc.moveDown(0.5);

      doc.fontSize(11)
        .font('Helvetica')
        .text(`Total Page Views: ${overview.totalPageViews || 0}`, { indent: 20 })
        .text(`Unique Visitors: ${overview.uniqueVisitors || 0}`, { indent: 20 })
        .text(`Active Websites: ${overview.activeWebsites?.length || 0}`, { indent: 20 });
      doc.moveDown();

      // Performance
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('Performance Metrics', 50, doc.y + 10);
      doc.moveDown(0.5);

      // Helper function to safely convert to number and format
      const safeToFixed = (value, decimals = 1) => {
        if (value === null || value === undefined) return '0';
        const num = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(num) ? '0' : num.toFixed(decimals);
      };

      doc.fontSize(11)
        .font('Helvetica')
        .text(`Avg Visits/Day: ${safeToFixed(performance.avgVisitsPerDay?.avg_visits_per_day)}`, { indent: 20 })
        .text(`Bounce Rate: ${safeToFixed(performance.bounceRate?.bounce_rate)}%`, { indent: 20 })
        .text(`Return Rate: ${safeToFixed(performance.returnVisitorRate?.return_rate)}%`, { indent: 20 });
      doc.moveDown();

      // Conversion Rates
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('Conversion Rates', 50, doc.y + 10);
      doc.moveDown(0.5);

      if (conversionRates.publicationRate) {
        doc.fontSize(11)
          .font('Helvetica')
          .text(`Publication Rate: ${safeToFixed(conversionRates.publicationRate.publication_rate)}%`, { indent: 20 })
          .text(`  (${conversionRates.publicationRate.published || 0} / ${conversionRates.publicationRate.total_created || 0} websites)`, { indent: 30 });
      }

      if (conversionRates.engagementRate) {
        doc.text(`User Engagement: ${safeToFixed(conversionRates.engagementRate.engagement_rate)}%`, { indent: 20 })
          .text(`  (${conversionRates.engagementRate.users_with_websites || 0} / ${conversionRates.engagementRate.total_users || 0} users)`, { indent: 30 });
      }

      // Top Websites
      if (performance.topWebsites && performance.topWebsites.length > 0) {
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .text('Top Performing Websites', 50, doc.y + 20);
        doc.moveDown(0.3);

        performance.topWebsites.slice(0, 15).forEach((website, index) => {
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }
          doc.fontSize(10)
            .font('Helvetica')
            .text(`${index + 1}. ${website.title || 'Untitled'}`, { indent: 20 })
            .text(`   Owner: ${website.owner || 'Unknown'} | Views: ${website.total_views} | Unique: ${website.unique_visitors}`, { indent: 30 });
          doc.moveDown(0.3);
        });
      }

    } catch (error) {
      doc.fontSize(11)
        .fillColor('#ff0000')
        .text(`Error generating website report: ${error.message}`, { indent: 20 });
      doc.fillColor('#000000');
    }
  }

}

module.exports = new PDFReportService();
