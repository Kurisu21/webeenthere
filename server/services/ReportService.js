const mysql = require('mysql2/promise');
const cron = require('node-cron');
const { getDatabaseConnection } = require('../database/database');

class ReportService {
  constructor() {
    this.scheduledReports = new Map();
    this.reportTemplates = {
      userActivity: {
        name: 'User Activity Report',
        description: 'Comprehensive user activity and engagement metrics',
        fields: ['user_registrations', 'active_users', 'login_attempts', 'user_retention', 'top_users']
      },
      systemHealth: {
        name: 'System Health Report',
        description: 'System performance and health metrics',
        fields: ['system_uptime', 'error_rates', 'response_times', 'resource_usage', 'database_performance']
      },
      securityAudit: {
        name: 'Security Audit Report',
        description: 'Security events and threat analysis',
        fields: ['login_attempts', 'failed_logins', 'security_threats', 'blocked_ips', 'audit_logs']
      },
      performanceMetrics: {
        name: 'Performance Metrics Report',
        description: 'System performance and optimization metrics',
        fields: ['cpu_usage', 'memory_usage', 'disk_usage', 'api_performance', 'database_performance']
      },
      websiteAnalytics: {
        name: 'Website Analytics Report',
        description: 'Website usage and analytics data',
        fields: ['total_websites', 'page_views', 'popular_pages', 'user_journeys', 'conversion_rates']
      }
    };
  }

  /**
   * Generate user activity report
   */
  async generateUserReport(period = '30d', userId = null) {
    const connection = await getDatabaseConnection();
    
    try {
      const timeCondition = this.getTimeCondition(period);
      const userCondition = userId ? 'AND user_id = ?' : '';
      const params = userId ? [userId] : [];

      // User registrations
      const [registrations] = await connection.execute(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM users 
         WHERE created_at >= ${timeCondition}
         ${userCondition}
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        params
      );

      // Active users
      const [activeUsers] = await connection.execute(
        `SELECT DATE(timestamp) as date, COUNT(DISTINCT user_id) as count
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         AND user_id IS NOT NULL
         GROUP BY DATE(timestamp)
         ORDER BY date DESC`
      );

      // Login attempts
      const [loginAttempts] = await connection.execute(
        `SELECT DATE(timestamp) as date,
         COUNT(CASE WHEN action IN ('user_login', 'admin_login') THEN 1 END) as successful,
         COUNT(CASE WHEN action = 'failed_login_attempt' THEN 1 END) as failed
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         AND action IN ('user_login', 'admin_login', 'failed_login_attempt')
         GROUP BY DATE(timestamp)
         ORDER BY date DESC`
      );

      // Top users by activity
      const [topUsers] = await connection.execute(
        `SELECT u.username, u.email, COUNT(*) as activity_count,
         MAX(a.timestamp) as last_activity
         FROM activity_logs a
         JOIN users u ON a.user_id = u.id
         WHERE a.timestamp >= ${timeCondition}
         GROUP BY u.id, u.username, u.email
         ORDER BY activity_count DESC
         LIMIT 10`
      );

      // User retention (users active in multiple periods)
      const [retentionData] = await connection.execute(
        `SELECT 
           COUNT(DISTINCT CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN user_id END) as week_1,
           COUNT(DISTINCT CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND timestamp < DATE_SUB(NOW(), INTERVAL 7 DAY) THEN user_id END) as week_2,
           COUNT(DISTINCT CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 21 DAY) AND timestamp < DATE_SUB(NOW(), INTERVAL 14 DAY) THEN user_id END) as week_3,
           COUNT(DISTINCT CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 28 DAY) AND timestamp < DATE_SUB(NOW(), INTERVAL 21 DAY) THEN user_id END) as week_4
         FROM activity_logs 
         WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 28 DAY)`
      );

      return {
        type: 'userActivity',
        period: period,
        generatedAt: new Date().toISOString(),
        data: {
          registrations: registrations || [],
          activeUsers: activeUsers || [],
          loginAttempts: loginAttempts || [],
          topUsers: topUsers || [],
          retention: retentionData[0] || {},
          summary: {
            totalRegistrations: registrations.reduce((sum, row) => sum + row.count, 0),
            avgActiveUsers: activeUsers.length > 0 ? 
              activeUsers.reduce((sum, row) => sum + row.count, 0) / activeUsers.length : 0,
            totalLoginAttempts: loginAttempts.reduce((sum, row) => sum + row.successful + row.failed, 0),
            successRate: loginAttempts.length > 0 ? 
              (loginAttempts.reduce((sum, row) => sum + row.successful, 0) / 
               loginAttempts.reduce((sum, row) => sum + row.successful + row.failed, 0) * 100).toFixed(2) : 0
          }
        }
      };
    } catch (error) {
      console.error('Error generating user report:', error);
      throw error;
    }
  }

  /**
   * Generate system health report
   */
  async generateSystemReport(period = '7d') {
    const connection = await getDatabaseConnection();
    
    try {
      const timeCondition = this.getTimeCondition(period);

      // System uptime (based on activity logs)
      const [uptimeData] = await connection.execute(
        `SELECT 
           MIN(timestamp) as first_activity,
           MAX(timestamp) as last_activity,
           COUNT(*) as total_activities
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}`
      );

      // Error rates
      const [errorRates] = await connection.execute(
        `SELECT DATE(timestamp) as date,
         COUNT(CASE WHEN action LIKE '%error%' OR action LIKE '%failed%' THEN 1 END) as errors,
         COUNT(*) as total_activities
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         GROUP BY DATE(timestamp)
         ORDER BY date DESC`
      );

      // Response times (if available in details)
      const [responseTimes] = await connection.execute(
        `SELECT action,
         AVG(TIMESTAMPDIFF(MICROSECOND, 
           STR_TO_DATE(JSON_EXTRACT(details, '$.startTime'), '%Y-%m-%dT%H:%i:%s.%fZ'),
           timestamp
         )) as avg_response_time_microseconds,
         COUNT(*) as request_count
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         AND JSON_EXTRACT(details, '$.startTime') IS NOT NULL
         GROUP BY action
         ORDER BY avg_response_time_microseconds DESC`
      );

      // Database performance
      const [dbPerformance] = await connection.execute(
        `SELECT 
           COUNT(*) as total_queries,
           COUNT(CASE WHEN JSON_EXTRACT(details, '$.queryTime') > 1000 THEN 1 END) as slow_queries
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         AND JSON_EXTRACT(details, '$.queryTime') IS NOT NULL`
      );

      return {
        type: 'systemHealth',
        period: period,
        generatedAt: new Date().toISOString(),
        data: {
          uptime: uptimeData[0] || {},
          errorRates: errorRates || [],
          responseTimes: responseTimes.map(rt => ({
            ...rt,
            avg_response_time_ms: Math.round(rt.avg_response_time_microseconds / 1000)
          })) || [],
          databasePerformance: dbPerformance[0] || {},
          summary: {
            uptimeHours: uptimeData[0] ? 
              Math.round((new Date(uptimeData[0].last_activity) - new Date(uptimeData[0].first_activity)) / (1000 * 60 * 60)) : 0,
            avgErrorRate: errorRates.length > 0 ? 
              (errorRates.reduce((sum, row) => sum + row.errors, 0) / 
               errorRates.reduce((sum, row) => sum + row.total_activities, 0) * 100).toFixed(2) : 0,
            avgResponseTime: responseTimes.length > 0 ? 
              Math.round(responseTimes.reduce((sum, row) => sum + row.avg_response_time_microseconds, 0) / 
                        responseTimes.length / 1000) : 0
          }
        }
      };
    } catch (error) {
      console.error('Error generating system report:', error);
      throw error;
    }
  }

  /**
   * Generate security audit report
   */
  async generateSecurityReport(period = '7d') {
    const connection = await getDatabaseConnection();
    
    try {
      const timeCondition = this.getTimeCondition(period);

      // Login attempts
      const [loginAttempts] = await connection.execute(
        `SELECT DATE(timestamp) as date,
         COUNT(CASE WHEN action IN ('user_login', 'admin_login') THEN 1 END) as successful,
         COUNT(CASE WHEN action = 'failed_login_attempt' THEN 1 END) as failed,
         COUNT(DISTINCT ip_address) as unique_ips
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         AND action IN ('user_login', 'admin_login', 'failed_login_attempt')
         GROUP BY DATE(timestamp)
         ORDER BY date DESC`
      );

      // Security threats
      const [threats] = await connection.execute(
        `SELECT ip_address, COUNT(*) as attempts,
         GROUP_CONCAT(DISTINCT JSON_EXTRACT(details, '$.reason')) as reasons,
         MIN(timestamp) as first_attempt,
         MAX(timestamp) as last_attempt
         FROM activity_logs 
         WHERE action = 'failed_login_attempt'
         AND timestamp >= ${timeCondition}
         GROUP BY ip_address
         HAVING attempts >= 5
         ORDER BY attempts DESC`
      );

      // Blocked IPs
      const [blockedIPs] = await connection.execute(
        `SELECT setting_value 
         FROM system_settings 
         WHERE setting_key = 'blocked_ips'`
      );

      // Audit logs
      const [auditLogs] = await connection.execute(
        `SELECT action, COUNT(*) as count,
         COUNT(DISTINCT user_id) as unique_users,
         COUNT(DISTINCT ip_address) as unique_ips
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         AND action IN ('admin_login', 'settings_update', 'role_change', 'status_change')
         GROUP BY action
         ORDER BY count DESC`
      );

      let blockedIPsList = [];
      if (blockedIPs.length > 0) {
        try {
          blockedIPsList = JSON.parse(blockedIPs[0].setting_value);
        } catch (error) {
          console.error('Error parsing blocked IPs:', error);
        }
      }

      return {
        type: 'securityAudit',
        period: period,
        generatedAt: new Date().toISOString(),
        data: {
          loginAttempts: loginAttempts || [],
          threats: threats || [],
          blockedIPs: blockedIPsList || [],
          auditLogs: auditLogs || [],
          summary: {
            totalLoginAttempts: loginAttempts.reduce((sum, row) => sum + row.successful + row.failed, 0),
            failedLoginRate: loginAttempts.length > 0 ? 
              (loginAttempts.reduce((sum, row) => sum + row.failed, 0) / 
               loginAttempts.reduce((sum, row) => sum + row.successful + row.failed, 0) * 100).toFixed(2) : 0,
            threatIPs: threats.length,
            blockedIPCount: blockedIPsList.length,
            totalAuditEvents: auditLogs.reduce((sum, row) => sum + row.count, 0)
          }
        }
      };
    } catch (error) {
      console.error('Error generating security report:', error);
      throw error;
    }
  }

  /**
   * Generate performance metrics report
   */
  async generatePerformanceReport(period = '7d') {
    const connection = await getDatabaseConnection();
    
    try {
      const timeCondition = this.getTimeCondition(period);

      // API performance
      const [apiPerformance] = await connection.execute(
        `SELECT action,
         COUNT(*) as request_count,
         AVG(TIMESTAMPDIFF(MICROSECOND, 
           STR_TO_DATE(JSON_EXTRACT(details, '$.startTime'), '%Y-%m-%dT%H:%i:%s.%fZ'),
           timestamp
         )) as avg_response_time_microseconds,
         MAX(TIMESTAMPDIFF(MICROSECOND, 
           STR_TO_DATE(JSON_EXTRACT(details, '$.startTime'), '%Y-%m-%dT%H:%i:%s.%fZ'),
           timestamp
         )) as max_response_time_microseconds
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         AND JSON_EXTRACT(details, '$.startTime') IS NOT NULL
         GROUP BY action
         ORDER BY avg_response_time_microseconds DESC`
      );

      // Database performance
      const [dbPerformance] = await connection.execute(
        `SELECT 
           COUNT(*) as total_queries,
           COUNT(CASE WHEN JSON_EXTRACT(details, '$.queryTime') > 1000 THEN 1 END) as slow_queries,
           AVG(JSON_EXTRACT(details, '$.queryTime')) as avg_query_time
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         AND JSON_EXTRACT(details, '$.queryTime') IS NOT NULL`
      );

      // System resource usage (if available)
      const [resourceUsage] = await connection.execute(
        `SELECT DATE(timestamp) as date,
         AVG(JSON_EXTRACT(details, '$.cpuUsage')) as avg_cpu,
         AVG(JSON_EXTRACT(details, '$.memoryUsage')) as avg_memory,
         AVG(JSON_EXTRACT(details, '$.diskUsage')) as avg_disk
         FROM activity_logs 
         WHERE timestamp >= ${timeCondition}
         AND JSON_EXTRACT(details, '$.cpuUsage') IS NOT NULL
         GROUP BY DATE(timestamp)
         ORDER BY date DESC`
      );

      return {
        type: 'performanceMetrics',
        period: period,
        generatedAt: new Date().toISOString(),
        data: {
          apiPerformance: apiPerformance.map(api => ({
            ...api,
            avg_response_time_ms: Math.round(api.avg_response_time_microseconds / 1000),
            max_response_time_ms: Math.round(api.max_response_time_microseconds / 1000)
          })) || [],
          databasePerformance: dbPerformance[0] || {},
          resourceUsage: resourceUsage || [],
          summary: {
            avgResponseTime: apiPerformance.length > 0 ? 
              Math.round(apiPerformance.reduce((sum, row) => sum + row.avg_response_time_microseconds, 0) / 
                        apiPerformance.length / 1000) : 0,
            slowQueryRate: dbPerformance[0] ? 
              ((dbPerformance[0].slow_queries / dbPerformance[0].total_queries) * 100).toFixed(2) : 0,
            avgCPUUsage: resourceUsage.length > 0 ? 
              (resourceUsage.reduce((sum, row) => sum + (row.avg_cpu || 0), 0) / resourceUsage.length).toFixed(2) : 0,
            avgMemoryUsage: resourceUsage.length > 0 ? 
              (resourceUsage.reduce((sum, row) => sum + (row.avg_memory || 0), 0) / resourceUsage.length).toFixed(2) : 0
          }
        }
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  /**
   * Generate website analytics report
   */
  async generateWebsiteReport(period = '30d') {
    const connection = await getDatabaseConnection();
    
    try {
      const timeCondition = this.getTimeCondition(period);

      // Total websites
      const [totalWebsites] = await connection.execute(
        `SELECT COUNT(*) as count FROM websites`
      );

      // Website creation over time
      const [websiteCreation] = await connection.execute(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM websites 
         WHERE created_at >= ${timeCondition}
         GROUP BY DATE(created_at)
         ORDER BY date DESC`
      );

      // Popular websites (by activity)
      const [popularWebsites] = await connection.execute(
        `SELECT w.title, w.url, COUNT(*) as activity_count,
         MAX(a.timestamp) as last_activity
         FROM activity_logs a
         JOIN websites w ON a.entity_id = w.id
         WHERE a.timestamp >= ${timeCondition}
         AND a.entity_type = 'website'
         GROUP BY w.id, w.title, w.url
         ORDER BY activity_count DESC
         LIMIT 10`
      );

      // User journeys (website-related activities)
      const [userJourneys] = await connection.execute(
        `SELECT u.username, COUNT(DISTINCT a.entity_id) as websites_accessed,
         COUNT(*) as total_activities
         FROM activity_logs a
         JOIN users u ON a.user_id = u.id
         WHERE a.timestamp >= ${timeCondition}
         AND a.entity_type = 'website'
         GROUP BY u.id, u.username
         ORDER BY websites_accessed DESC
         LIMIT 10`
      );

      // Conversion rates (websites published vs created)
      const [conversionRates] = await connection.execute(
        `SELECT 
           COUNT(*) as total_websites,
           COUNT(CASE WHEN status = 'published' THEN 1 END) as published_websites,
           COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_websites
         FROM websites 
         WHERE created_at >= ${timeCondition}`
      );

      return {
        type: 'websiteAnalytics',
        period: period,
        generatedAt: new Date().toISOString(),
        data: {
          totalWebsites: totalWebsites[0]?.count || 0,
          websiteCreation: websiteCreation || [],
          popularWebsites: popularWebsites || [],
          userJourneys: userJourneys || [],
          conversionRates: conversionRates[0] || {},
          summary: {
            totalWebsites: totalWebsites[0]?.count || 0,
            newWebsites: websiteCreation.reduce((sum, row) => sum + row.count, 0),
            conversionRate: conversionRates[0] ? 
              ((conversionRates[0].published_websites / conversionRates[0].total_websites) * 100).toFixed(2) : 0,
            avgWebsitesPerUser: userJourneys.length > 0 ? 
              (userJourneys.reduce((sum, row) => sum + row.websites_accessed, 0) / userJourneys.length).toFixed(2) : 0
          }
        }
      };
    } catch (error) {
      console.error('Error generating website report:', error);
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(template, period = '30d', filters = {}) {
    switch (template) {
      case 'userActivity':
        return this.generateUserReport(period, filters.userId);
      case 'systemHealth':
        return this.generateSystemReport(period);
      case 'securityAudit':
        return this.generateSecurityReport(period);
      case 'performanceMetrics':
        return this.generatePerformanceReport(period);
      case 'websiteAnalytics':
        return this.generateWebsiteReport(period);
      default:
        throw new Error(`Unknown report template: ${template}`);
    }
  }

  /**
   * Schedule recurring reports
   */
  scheduleReport(reportId, template, schedule, email = null) {
    const cronExpression = this.parseSchedule(schedule);
    
    if (!cron.validate(cronExpression)) {
      throw new Error('Invalid cron expression');
    }

    const task = cron.schedule(cronExpression, async () => {
      try {
        const report = await this.generateCustomReport(template);
        
        // Store scheduled report
        await this.storeScheduledReport(reportId, report, email);
        
        console.log(`Scheduled report ${reportId} generated successfully`);
      } catch (error) {
        console.error(`Error generating scheduled report ${reportId}:`, error);
      }
    });

    this.scheduledReports.set(reportId, {
      task,
      template,
      schedule,
      email,
      createdAt: new Date().toISOString()
    });

    return reportId;
  }

  /**
   * Cancel scheduled report
   */
  cancelScheduledReport(reportId) {
    const scheduledReport = this.scheduledReports.get(reportId);
    if (scheduledReport) {
      scheduledReport.task.destroy();
      this.scheduledReports.delete(reportId);
      return true;
    }
    return false;
  }

  /**
   * Get scheduled reports
   */
  getScheduledReports() {
    const reports = [];
    for (const [id, report] of this.scheduledReports) {
      reports.push({
        id,
        template: report.template,
        schedule: report.schedule,
        email: report.email,
        createdAt: report.createdAt
      });
    }
    return reports;
  }

  /**
   * Export report in various formats
   */
  async exportReport(report, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'csv':
        return this.convertToCSV(report);
      case 'xml':
        return this.convertToXML(report);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get available report templates
   */
  getReportTemplates() {
    return this.reportTemplates;
  }

  /**
   * Store scheduled report in database
   */
  async storeScheduledReport(reportId, report, email) {
    const connection = await getDatabaseConnection();
    
    try {
      await connection.execute(
        `INSERT INTO system_settings (setting_key, setting_value, updated_by) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value), 
         updated_at = NOW(), 
         updated_by = VALUES(updated_by)`,
        [`scheduled_report_${reportId}`, JSON.stringify({
          report,
          email,
          generatedAt: new Date().toISOString()
        }), 'system']
      );
    } catch (error) {
      console.error('Error storing scheduled report:', error);
    }
  }

  /**
   * Get report history
   */
  async getReportHistory(limit = 50) {
    const connection = await getDatabaseConnection();
    
    try {
      const [reports] = await connection.execute(
        `SELECT setting_key, setting_value, updated_at
         FROM system_settings 
         WHERE setting_key LIKE 'scheduled_report_%'
         ORDER BY updated_at DESC
         LIMIT ?`,
        [limit]
      );

      return reports.map(row => {
        try {
          const data = JSON.parse(row.setting_value);
          return {
            id: row.setting_key.replace('scheduled_report_', ''),
            report: data.report,
            email: data.email,
            generatedAt: data.generatedAt,
            storedAt: row.updated_at
          };
        } catch (error) {
          return null;
        }
      }).filter(report => report !== null);
    } catch (error) {
      console.error('Error getting report history:', error);
      return [];
    }
  }

  /**
   * Helper method to get time condition for SQL queries
   */
  getTimeCondition(period) {
    const conditions = {
      '1h': 'DATE_SUB(NOW(), INTERVAL 1 HOUR)',
      '24h': 'DATE_SUB(NOW(), INTERVAL 1 DAY)',
      '7d': 'DATE_SUB(NOW(), INTERVAL 7 DAY)',
      '30d': 'DATE_SUB(NOW(), INTERVAL 30 DAY)',
      '90d': 'DATE_SUB(NOW(), INTERVAL 90 DAY)'
    };
    
    return conditions[period] || conditions['30d'];
  }

  /**
   * Parse schedule string to cron expression
   */
  parseSchedule(schedule) {
    const schedules = {
      'hourly': '0 * * * *',
      'daily': '0 0 * * *',
      'weekly': '0 0 * * 0',
      'monthly': '0 0 1 * *'
    };
    
    return schedules[schedule] || schedule;
  }

  /**
   * Convert report to CSV format with advanced details
   */
  convertToCSV(report) {
    const csvRows = [];
    const appName = process.env.APP_NAME || 'WeBeenthere';
    const reportDate = report.generatedAt || new Date().toISOString();
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
    csvRows.push(['='.repeat(80)]);
    csvRows.push([`${appName.toUpperCase()} - ANALYTICS REPORT`]);
    csvRows.push(['='.repeat(80)]);
    csvRows.push([]);
    csvRows.push(['Report Title', this.getReportTitle(report.type, report.period)]);
    csvRows.push(['Brand Name', appName]);
    csvRows.push(['Report Type', report.type ? report.type.charAt(0).toUpperCase() + report.type.slice(1) : 'N/A']);
    csvRows.push(['Period', report.period ? report.period.charAt(0).toUpperCase() + report.period.slice(1) : 'N/A']);
    csvRows.push(['Date Created', formattedDate]);
    csvRows.push(['Generated At', reportDate]);
    csvRows.push([]);
    csvRows.push(['='.repeat(80)]);
    csvRows.push([]);
    
    // Add summary data
    if (report.data && report.data.summary) {
      csvRows.push(['SUMMARY']);
      csvRows.push(['-'.repeat(80)]);
      Object.entries(report.data.summary).forEach(([key, value]) => {
        csvRows.push([key, escapeCSV(value)]);
      });
      csvRows.push([]);
    }
    
    // Add detailed data
    if (report.data) {
      Object.entries(report.data).forEach(([key, value]) => {
        if (key !== 'summary' && Array.isArray(value) && value.length > 0) {
          csvRows.push([key.toUpperCase().replace(/_/g, ' ')]);
          csvRows.push(['-'.repeat(80)]);
          // Add headers
          csvRows.push(Object.keys(value[0]).map(k => k.replace(/_/g, ' ').toUpperCase()));
          // Add rows
          value.forEach(row => {
            csvRows.push(Object.values(row).map(v => escapeCSV(v)));
          });
          csvRows.push([]);
        } else if (key !== 'summary' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
          csvRows.push([key.toUpperCase().replace(/_/g, ' ')]);
          csvRows.push(['-'.repeat(80)]);
          Object.entries(value).forEach(([subKey, subValue]) => {
            csvRows.push([subKey.replace(/_/g, ' '), escapeCSV(subValue)]);
          });
          csvRows.push([]);
        }
      });
    }
    
    // Summary Section
    csvRows.push(['='.repeat(80)]);
    csvRows.push(['REPORT SUMMARY']);
    csvRows.push(['-'.repeat(80)]);
    csvRows.push(['Total Sections', report.data ? Object.keys(report.data).length : 0]);
    csvRows.push(['Report Period', report.period || 'N/A']);
    csvRows.push(['Report Type', report.type || 'N/A']);
    csvRows.push(['Generated By', 'System']);
    csvRows.push(['Export Format', 'CSV']);
    csvRows.push([]);
    csvRows.push(['='.repeat(80)]);
    csvRows.push([`End of Report - ${appName}`]);
    csvRows.push(['='.repeat(80)]);
    
    return csvRows.map(row => 
      Array.isArray(row) 
        ? row.map(cell => escapeCSV(cell)).join(',')
        : escapeCSV(row)
    ).join('\n');
  }
  
  /**
   * Get report title based on type and period
   */
  getReportTitle(type, period) {
    if (!type) return 'Analytics Report';
    
    const typeMap = {
      'comprehensive': 'Comprehensive Analytics Report',
      'user': 'User Analytics Report',
      'website': 'Website Analytics Report',
      'activity': 'Activity Analytics Report',
      'userActivity': 'User Activity Report',
      'systemHealth': 'System Health Report',
      'securityAudit': 'Security Audit Report',
      'performanceMetrics': 'Performance Metrics Report',
      'websiteAnalytics': 'Website Analytics Report'
    };
    
    const periodMap = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'yearly': 'Yearly',
      '1d': 'Daily',
      '7d': 'Weekly',
      '30d': 'Monthly',
      '365d': 'Yearly'
    };
    
    const typeLabel = typeMap[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Report`;
    const periodLabel = periodMap[period] || '';
    
    return periodLabel ? `${periodLabel} ${typeLabel}` : typeLabel;
  }

  /**
   * Convert report to XML format
   */
  convertToXML(report) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<report>\n';
    
    xml += `  <type>${report.type}</type>\n`;
    xml += `  <period>${report.period}</period>\n`;
    xml += `  <generatedAt>${report.generatedAt}</generatedAt>\n`;
    
    if (report.data.summary) {
      xml += '  <summary>\n';
      Object.entries(report.data.summary).forEach(([key, value]) => {
        xml += `    <${key}>${this.escapeXml(String(value))}</${key}>\n`;
      });
      xml += '  </summary>\n';
    }
    
    xml += '  <data>\n';
    Object.entries(report.data).forEach(([key, value]) => {
      if (key !== 'summary') {
        xml += `    <${key}>\n`;
        if (Array.isArray(value)) {
          value.forEach(item => {
            xml += '      <item>\n';
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              xml += `        <${itemKey}>${this.escapeXml(String(itemValue))}</${itemKey}>\n`;
            });
            xml += '      </item>\n';
          });
        } else {
          xml += `      ${this.escapeXml(String(value))}\n`;
        }
        xml += `    </${key}>\n`;
      }
    });
    xml += '  </data>\n';
    xml += '</report>';
    
    return xml;
  }

  /**
   * Escape XML special characters
   */
  escapeXml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
  }
}

module.exports = ReportService;

