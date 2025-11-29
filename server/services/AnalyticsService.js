const { getDatabaseConnection } = require('../database/database');

class AnalyticsService {
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
   * Collect comprehensive user metrics
   */
  async collectUserMetrics() {
    const connection = await this.getConnection();
    
    try {
      // Total users
      const [totalUsers] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE is_active = true'
      );

      // New users this month
      const [newUsersThisMonth] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND is_active = true'
      );

      // Active users (users with activity in last 30 days)
      const [activeUsers] = await connection.execute(
        `SELECT COUNT(DISTINCT user_id) as count 
         FROM activity_logs 
         WHERE user_id IS NOT NULL 
         AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      );

      // User registration trend (last 12 months)
      const [registrationTrend] = await connection.execute(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
         FROM users 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month ASC`
      );

      // User role distribution
      const [roleDistribution] = await connection.execute(
        'SELECT role, COUNT(*) as count FROM users WHERE is_active = true GROUP BY role'
      );

      return {
        totalUsers: totalUsers[0].count,
        newUsersThisMonth: newUsersThisMonth[0].count,
        activeUsers: activeUsers[0].count,
        registrationTrend: registrationTrend,
        roleDistribution: roleDistribution
      };
    } catch (error) {
      console.error('Error collecting user metrics:', error);
      throw error;
    }
  }

  /**
   * Collect system performance metrics
   */
  async collectSystemMetrics() {
    const connection = await this.getConnection();
    
    try {
      // Total activities
      const [totalActivities] = await connection.execute(
        'SELECT COUNT(*) as count FROM activity_logs'
      );

      // Activities today
      const [todayActivities] = await connection.execute(
        'SELECT COUNT(*) as count FROM activity_logs WHERE DATE(timestamp) = CURDATE()'
      );

      // Activities this week
      const [weekActivities] = await connection.execute(
        'SELECT COUNT(*) as count FROM activity_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 WEEK)'
      );

      // Error rate (failed login attempts)
      const [errorRate] = await connection.execute(
        `SELECT 
           COUNT(*) as total_attempts,
           SUM(CASE WHEN action LIKE '%failed%' THEN 1 ELSE 0 END) as failed_attempts
         FROM activity_logs 
         WHERE action LIKE '%login%' 
         AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
      );

      // System uptime (based on activity logs)
      const [uptimeStats] = await connection.execute(
        `SELECT 
           MIN(timestamp) as first_activity,
           MAX(timestamp) as last_activity,
           COUNT(*) as total_activities
         FROM activity_logs`
      );

      return {
        totalActivities: totalActivities[0].count,
        todayActivities: todayActivities[0].count,
        weekActivities: weekActivities[0].count,
        errorRate: errorRate[0],
        uptimeStats: uptimeStats[0]
      };
    } catch (error) {
      console.error('Error collecting system metrics:', error);
      throw error;
    }
  }

  /**
   * Collect website usage metrics
   */
  async collectWebsiteMetrics() {
    const connection = await this.getConnection();
    
    try {
      // Total websites
      const [totalWebsites] = await connection.execute(
        'SELECT COUNT(*) as count FROM websites WHERE is_active = true'
      );

      // Published websites
      const [publishedWebsites] = await connection.execute(
        'SELECT COUNT(*) as count FROM websites WHERE is_published = true AND is_active = true'
      );

      // Websites created this month
      const [newWebsitesThisMonth] = await connection.execute(
        'SELECT COUNT(*) as count FROM websites WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND is_active = true'
      );

      // Website creation trend
      const [websiteTrend] = await connection.execute(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
         FROM websites 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month ASC`
      );

      // Most popular templates
      const [popularTemplates] = await connection.execute(
        `SELECT t.name, COUNT(w.id) as usage_count
         FROM templates t
         LEFT JOIN websites w ON t.id = w.template_id AND w.is_active = true
         GROUP BY t.id, t.name
         ORDER BY usage_count DESC
         LIMIT 10`
      );

      // Website analytics (if available)
      const [websiteAnalytics] = await connection.execute(
        `SELECT 
           COUNT(DISTINCT wa.website_id) as websites_with_analytics,
           COUNT(*) as total_page_views,
           AVG(views_per_website) as avg_views_per_website
         FROM (
           SELECT website_id, COUNT(*) as views_per_website
           FROM website_analytics
           GROUP BY website_id
         ) wa`
      );

      return {
        totalWebsites: totalWebsites[0].count,
        publishedWebsites: publishedWebsites[0].count,
        newWebsitesThisMonth: newWebsitesThisMonth[0].count,
        websiteTrend: websiteTrend,
        popularTemplates: popularTemplates,
        websiteAnalytics: websiteAnalytics[0]
      };
    } catch (error) {
      console.error('Error collecting website metrics:', error);
      throw error;
    }
  }

  /**
   * Generate analytics reports
   */
  async generateReports(period = 'monthly', type = 'comprehensive') {
    const connection = await this.getConnection();
    
    try {
      let dateFilter = '';
      switch (period) {
        case 'daily':
          dateFilter = 'DATE(timestamp) = CURDATE()';
          break;
        case 'weekly':
          dateFilter = 'timestamp >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
          break;
        case 'monthly':
          dateFilter = 'timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
          break;
        case 'yearly':
          dateFilter = 'timestamp >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
        default:
          dateFilter = 'timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      }

      const report = {
        period,
        type,
        generatedAt: new Date().toISOString(),
        userMetrics: await this.collectUserMetrics(),
        websiteMetrics: await this.collectWebsiteMetrics()
      };

      // Add period-specific data
      if (type === 'comprehensive' || type === 'activity') {
        const [activityBreakdown] = await connection.execute(
          `SELECT action, COUNT(*) as count
           FROM activity_logs
           WHERE ${dateFilter}
           GROUP BY action
           ORDER BY count DESC`
        );
        report.activityBreakdown = activityBreakdown;
      }

      if (type === 'comprehensive' || type === 'user') {
        const [userActivity] = await connection.execute(
          `SELECT 
             u.username,
             u.email,
             COUNT(a.id) as activity_count,
             MAX(a.timestamp) as last_activity
           FROM users u
           LEFT JOIN activity_logs a ON u.id = a.user_id AND ${dateFilter}
           WHERE u.is_active = true
           GROUP BY u.id, u.username, u.email
           ORDER BY activity_count DESC
           LIMIT 20`
        );
        report.userActivity = userActivity;
      }

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get dashboard metrics overview
   */
  async getDashboardMetrics() {
    try {
      const [userMetrics, systemMetrics, websiteMetrics] = await Promise.all([
        this.collectUserMetrics(),
        this.collectSystemMetrics(),
        this.collectWebsiteMetrics()
      ]);

      return {
        users: {
          total: userMetrics.totalUsers,
          newThisMonth: userMetrics.newUsersThisMonth,
          active: userMetrics.activeUsers
        },
        system: {
          totalActivities: systemMetrics.totalActivities,
          todayActivities: systemMetrics.todayActivities,
          errorRate: systemMetrics.errorRate
        },
        websites: {
          total: websiteMetrics.totalWebsites,
          published: websiteMetrics.publishedWebsites,
          newThisMonth: websiteMetrics.newWebsitesThisMonth
        },
        trends: {
          userRegistration: userMetrics.registrationTrend.slice(-6), // Last 6 months
          websiteCreation: websiteMetrics.websiteTrend.slice(-6) // Last 6 months
        }
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(format = 'json', filters = {}) {
    const connection = await this.getConnection();
    
    try {
      let query = `
        SELECT 
          a.id,
          a.timestamp,
          u.username,
          u.email,
          a.action,
          a.entity_type,
          a.entity_id,
          a.ip_address,
          a.details
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE 1=1
      `;
      
      const params = [];

      if (filters.startDate) {
        query += ' AND a.timestamp >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND a.timestamp <= ?';
        params.push(filters.endDate);
      }

      if (filters.userId) {
        query += ' AND a.user_id = ?';
        params.push(filters.userId);
      }

      if (filters.action) {
        query += ' AND a.action LIKE ?';
        params.push(`%${filters.action}%`);
      }

      query += ' ORDER BY a.timestamp DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      const [rows] = await connection.execute(query, params);

      if (format === 'csv') {
        return this.convertToCSV(rows);
      } else if (format === 'json') {
        return JSON.stringify(rows, null, 2);
      } else {
        throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return `"${String(value || '').replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics() {
    const connection = await this.getConnection();
    
    try {
      // Activities in last hour
      const [lastHourActivities] = await connection.execute(
        'SELECT COUNT(*) as count FROM activity_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)'
      );

      // Active users in last hour
      const [activeUsersLastHour] = await connection.execute(
        `SELECT COUNT(DISTINCT user_id) as count 
         FROM activity_logs 
         WHERE user_id IS NOT NULL 
         AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`
      );

      // Recent activities
      const [recentActivities] = await connection.execute(
        `SELECT a.action, a.timestamp, u.username
         FROM activity_logs a
         LEFT JOIN users u ON a.user_id = u.id
         ORDER BY a.timestamp DESC
         LIMIT 10`
      );

      // System health indicators
      const [systemHealth] = await connection.execute(
        `SELECT 
           COUNT(*) as total_activities_today,
           COUNT(DISTINCT user_id) as unique_users_today,
           SUM(CASE WHEN action LIKE '%failed%' THEN 1 ELSE 0 END) as failed_attempts_today
         FROM activity_logs 
         WHERE DATE(timestamp) = CURDATE()`
      );

      return {
        lastHourActivities: lastHourActivities[0].count,
        activeUsersLastHour: activeUsersLastHour[0].count,
        recentActivities: recentActivities,
        systemHealth: systemHealth[0],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
