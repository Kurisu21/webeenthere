const ActivityLogger = require('../services/ActivityLogger');
const { getDatabaseConnection } = require('../database/database');

class ActivityController {
  constructor() {
    this.activityLogger = new ActivityLogger(getDatabaseConnection());
  }

  /**
   * Get activity logs with filtering and pagination
   */
  async getActivityLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        userId = null,
        action = null,
        startDate = null,
        endDate = null,
        search = null
      } = req.query;

      // Convert string parameters to appropriate types
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        userId: userId ? parseInt(userId) : null,
        action: action || null,
        startDate: startDate || null,
        endDate: endDate || null,
        search: search || null
      };

      // Validate pagination parameters
      if (filters.page < 1) {
        return res.status(400).json({ 
          success: false, 
          error: 'Page must be greater than 0' 
        });
      }

      if (filters.limit < 1 || filters.limit > 1000) {
        return res.status(400).json({ 
          success: false, 
          error: 'Limit must be between 1 and 1000' 
        });
      }

      const result = await this.activityLogger.getActivityLogs(filters);

      res.json({ 
        success: true, 
        data: result.logs,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get activity logs error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve activity logs' });
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(req, res) {
    try {
      const stats = await this.activityLogger.getActivityStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Get activity stats error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve activity statistics' });
    }
  }

  /**
   * Export activity logs
   */
  async exportActivityLogs(req, res) {
    try {
      const {
        format = 'csv',
        userId = null,
        action = null,
        startDate = null,
        endDate = null,
        search = null
      } = req.query;

      const filters = {
        userId: userId ? parseInt(userId) : null,
        action: action || null,
        startDate: startDate || null,
        endDate: endDate || null,
        search: search || null
      };

      if (format === 'csv') {
        const csvData = await this.activityLogger.exportLogsToCSV(filters);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.csv"');
        res.send(csvData);
      } else if (format === 'json') {
        const result = await this.activityLogger.getActivityLogs({ ...filters, limit: 10000 });
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.json"');
        res.json(result.logs);
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid format. Supported formats: csv, json' 
        });
      }
    } catch (error) {
      console.error('Export activity logs error:', error);
      res.status(500).json({ success: false, error: 'Failed to export activity logs' });
    }
  }

  /**
   * Get activity log by ID
   */
  async getActivityLogById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Activity log ID is required' 
        });
      }

      const result = await this.activityLogger.getActivityLogs({ 
        search: id, 
        limit: 1 
      });

      if (result.logs.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Activity log not found' 
        });
      }

      res.json({ success: true, log: result.logs[0] });
    } catch (error) {
      console.error('Get activity log by ID error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve activity log' });
    }
  }

  /**
   * Get activity logs for a specific user
   */
  async getUserActivityLogs(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({ 
          success: false, 
          error: 'Valid user ID is required' 
        });
      }

      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        userId: parseInt(userId)
      };

      const result = await this.activityLogger.getActivityLogs(filters);

      res.json({ 
        success: true, 
        data: result.logs,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user activity logs error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve user activity logs' });
    }
  }

  /**
   * Get recent critical activities
   */
  async getCriticalActivities(req, res) {
    try {
      const { limit = 20 } = req.query;

      // Define critical actions
      const criticalActions = [
        'user_role_changed',
        'user_status_changed',
        'system_settings_updated',
        'user_deleted',
        'admin_login',
        'failed_login_attempt'
      ];

      const result = await this.activityLogger.getActivityLogs({ 
        limit: parseInt(limit) 
      });

      // Filter for critical actions
      const criticalLogs = result.logs.filter(log => 
        criticalActions.some(action => log.action.includes(action))
      );

      res.json({ 
        success: true, 
        data: criticalLogs,
        total: criticalLogs.length
      });
    } catch (error) {
      console.error('Get critical activities error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve critical activities' });
    }
  }

  /**
   * Get activity trends (daily/weekly/monthly)
   */
  async getActivityTrends(req, res) {
    try {
      const { period = 'daily', days = 30 } = req.query;

      if (!['daily', 'weekly', 'monthly'].includes(period)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid period. Supported: daily, weekly, monthly' 
        });
      }

      const result = await this.activityLogger.getActivityLogs({ 
        limit: 10000 
      });

      // Group logs by period
      const trends = {};
      const now = new Date();

      result.logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        let key;

        if (period === 'daily') {
          key = logDate.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (period === 'weekly') {
          const weekStart = new Date(logDate);
          weekStart.setDate(logDate.getDate() - logDate.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else if (period === 'monthly') {
          key = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!trends[key]) {
          trends[key] = 0;
        }
        trends[key]++;
      });

      // Convert to array and sort
      const trendArray = Object.entries(trends)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      res.json({ 
        success: true, 
        trends: trendArray,
        period: period
      });
    } catch (error) {
      console.error('Get activity trends error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve activity trends' });
    }
  }

  /**
   * Rotate log files manually
   */
  async rotateLogFiles(req, res) {
    try {
      const archiveFileName = await this.activityLogger.rotateLogFile();
      
      res.json({ 
        success: true, 
        message: 'Log files rotated successfully',
        archiveFile: archiveFileName
      });
    } catch (error) {
      console.error('Rotate log files error:', error);
      res.status(500).json({ success: false, error: 'Failed to rotate log files' });
    }
  }

  /**
   * Get log file metadata
   */
  async getLogFileMetadata(req, res) {
    try {
      const files = await this.activityLogger.jsonManager.listJsonFiles();
      const logFiles = files.filter(file => 
        file.path.startsWith('logs/')
      );

      const metadata = logFiles.map(file => ({
        path: file.path,
        size: file.size,
        modified: file.modified,
        sizeFormatted: this.formatFileSize(file.size)
      }));

      res.json({ success: true, metadata });
    } catch (error) {
      console.error('Get log file metadata error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve log file metadata' });
    }
  }

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = ActivityController;
