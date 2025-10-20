const ReportService = require('../services/ReportService');

class ReportController {
  constructor() {
    this.reportService = new ReportService();
  }

  /**
   * Generate custom report
   */
  async generateReport(req, res) {
    try {
      const { template, period = '30d', filters = {} } = req.body;

      if (!template) {
        return res.status(400).json({
          success: false,
          message: 'Report template is required'
        });
      }

      const report = await this.reportService.generateCustomReport(template, period, filters);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate report',
        error: error.message
      });
    }
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(req, res) {
    try {
      const templates = this.reportService.getReportTemplates();

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting report templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get report templates',
        error: error.message
      });
    }
  }

  /**
   * Schedule recurring report
   */
  async scheduleReport(req, res) {
    try {
      const { template, schedule, email } = req.body;

      if (!template || !schedule) {
        return res.status(400).json({
          success: false,
          message: 'Template and schedule are required'
        });
      }

      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.reportService.scheduleReport(reportId, template, schedule, email);

      res.json({
        success: true,
        data: {
          reportId,
          template,
          schedule,
          email,
          message: 'Report scheduled successfully'
        }
      });
    } catch (error) {
      console.error('Error scheduling report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule report',
        error: error.message
      });
    }
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(req, res) {
    try {
      const scheduledReports = this.reportService.getScheduledReports();

      res.json({
        success: true,
        data: scheduledReports
      });
    } catch (error) {
      console.error('Error getting scheduled reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get scheduled reports',
        error: error.message
      });
    }
  }

  /**
   * Cancel scheduled report
   */
  async cancelScheduledReport(req, res) {
    try {
      const { reportId } = req.params;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          message: 'Report ID is required'
        });
      }

      const cancelled = this.reportService.cancelScheduledReport(reportId);

      if (cancelled) {
        res.json({
          success: true,
          message: 'Scheduled report cancelled successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Scheduled report not found'
        });
      }
    } catch (error) {
      console.error('Error cancelling scheduled report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel scheduled report',
        error: error.message
      });
    }
  }

  /**
   * Export report in various formats
   */
  async exportReport(req, res) {
    try {
      const { report } = req.body;
      const { format = 'json' } = req.query;

      if (!report) {
        return res.status(400).json({
          success: false,
          message: 'Report data is required'
        });
      }

      const exportedData = await this.reportService.exportReport(report, format);

      // Set appropriate content type
      const contentTypes = {
        'json': 'application/json',
        'csv': 'text/csv',
        'xml': 'application/xml'
      };

      res.setHeader('Content-Type', contentTypes[format] || 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="report.${format}"`);

      res.send(exportedData);
    } catch (error) {
      console.error('Error exporting report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: error.message
      });
    }
  }

  /**
   * Get report history
   */
  async getReportHistory(req, res) {
    try {
      const { limit = 50 } = req.query;
      const history = await this.reportService.getReportHistory(parseInt(limit));

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error getting report history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get report history',
        error: error.message
      });
    }
  }

  /**
   * Generate user activity report
   */
  async generateUserReport(req, res) {
    try {
      const { period = '30d', userId } = req.query;
      const report = await this.reportService.generateUserReport(period, userId);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating user report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate user report',
        error: error.message
      });
    }
  }

  /**
   * Generate system health report
   */
  async generateSystemReport(req, res) {
    try {
      const { period = '7d' } = req.query;
      const report = await this.reportService.generateSystemReport(period);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating system report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate system report',
        error: error.message
      });
    }
  }

  /**
   * Generate security audit report
   */
  async generateSecurityReport(req, res) {
    try {
      const { period = '7d' } = req.query;
      const report = await this.reportService.generateSecurityReport(period);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating security report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate security report',
        error: error.message
      });
    }
  }

  /**
   * Generate performance metrics report
   */
  async generatePerformanceReport(req, res) {
    try {
      const { period = '7d' } = req.query;
      const report = await this.reportService.generatePerformanceReport(period);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating performance report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate performance report',
        error: error.message
      });
    }
  }

  /**
   * Generate website analytics report
   */
  async generateWebsiteReport(req, res) {
    try {
      const { period = '30d' } = req.query;
      const report = await this.reportService.generateWebsiteReport(period);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating website report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate website report',
        error: error.message
      });
    }
  }
}

module.exports = ReportController;

