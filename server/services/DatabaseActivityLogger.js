const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class DatabaseActivityLogger {
  async logActivity(data) {
    const connection = await getDatabaseConnection();
    
    const {
      userId = null,
      action,
      entityType = null,
      entityId = null,
      ipAddress = null,
      userAgent = null,
      details = null
    } = data;
    
    try {
      await connection.execute(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, details) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          action,
          entityType,
          entityId,
          ipAddress,
          userAgent,
          details ? JSON.stringify(details) : null
        ]
      );
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error to prevent breaking the main flow
    }
  }

  async getActivities(filters = {}) {
    const connection = await getDatabaseConnection();
    let query = `SELECT a.*, u.username 
                 FROM activity_logs a 
                 LEFT JOIN users u ON a.user_id = u.id 
                 WHERE 1=1`;
    const params = [];
    
    if (filters.userId) {
      query += ' AND a.user_id = ?';
      params.push(filters.userId);
    }
    if (filters.action) {
      query += ' AND a.action = ?';
      params.push(filters.action);
    }
    if (filters.entityType) {
      query += ' AND a.entity_type = ?';
      params.push(filters.entityType);
    }
    if (filters.entityId) {
      query += ' AND a.entity_id = ?';
      params.push(filters.entityId);
    }
    if (filters.startDate) {
      query += ' AND a.timestamp >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND a.timestamp <= ?';
      params.push(filters.endDate);
    }
    
    query += ' ORDER BY a.timestamp DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const [rows] = await connection.execute(query, params);
    
    // Parse JSON details for each log entry
    const parsedRows = rows.map(row => {
      let parsedDetails = row.details;
      
      if (row.details && typeof row.details === 'string') {
        try {
          parsedDetails = JSON.parse(row.details);
        } catch (error) {
          console.error('Failed to parse activity details JSON:', error, 'Raw details:', row.details);
          parsedDetails = { raw: row.details };
        }
      }
      
      return {
        ...row,
        userId: row.user_id, // Map user_id to userId for frontend
        details: parsedDetails
      };
    });
    
    return parsedRows;
  }

  async getActivitiesByUser(userId, limit = 50) {
    return this.getActivities({ userId, limit });
  }

  async getActivitiesByAction(action, limit = 100) {
    return this.getActivities({ action, limit });
  }

  async getActivitiesByEntity(entityType, entityId, limit = 50) {
    return this.getActivities({ entityType, entityId, limit });
  }

  async getRecentActivities(limit = 100) {
    return this.getActivities({ limit });
  }

  async getActivitiesByDateRange(startDate, endDate, limit = 1000) {
    return this.getActivities({ startDate, endDate, limit });
  }

  // Method expected by ActivityController
  async getActivityLogs(filters = {}) {
    const connection = await getDatabaseConnection();
    let query = `SELECT a.*, u.username 
                 FROM activity_logs a 
                 LEFT JOIN users u ON a.user_id = u.id 
                 WHERE 1=1`;
    const params = [];
    
    if (filters.userId) {
      query += ' AND a.user_id = ?';
      params.push(filters.userId);
    }
    if (filters.action) {
      query += ' AND a.action = ?';
      params.push(filters.action);
    }
    if (filters.entityType) {
      query += ' AND a.entity_type = ?';
      params.push(filters.entityType);
    }
    if (filters.entityId) {
      query += ' AND a.entity_id = ?';
      params.push(filters.entityId);
    }
    if (filters.startDate) {
      query += ' AND a.timestamp >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND a.timestamp <= ?';
      params.push(filters.endDate);
    }
    if (filters.search) {
      query += ' AND (a.action LIKE ? OR a.entity_type LIKE ? OR u.username LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Get total count for pagination
    const countQuery = query.replace('SELECT a.*, u.username', 'SELECT COUNT(*) as total');
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;
    
    query += ' ORDER BY a.timestamp DESC';
    
    // Add pagination
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(filters.limit, offset);
    } else if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const [rows] = await connection.execute(query, params);
    
    // Parse JSON details for each log entry
    const parsedRows = rows.map(row => {
      let parsedDetails = row.details;
      
      if (row.details && typeof row.details === 'string') {
        try {
          parsedDetails = JSON.parse(row.details);
        } catch (error) {
          console.error('Failed to parse activity details JSON:', error, 'Raw details:', row.details);
          parsedDetails = { raw: row.details };
        }
      }
      
      return {
        ...row,
        userId: row.user_id, // Map user_id to userId for frontend
        details: parsedDetails
      };
    });
    
    return {
      logs: parsedRows,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: total,
        totalPages: Math.ceil(total / (filters.limit || 50))
      }
    };
  }

  // Method expected by ActivityController for stats
  async getActivityStats() {
    return this.getStats();
  }

  // Method expected by ActivityController for trends
  async getActivityTrends(period = 'daily', days = 30) {
    const connection = await getDatabaseConnection();
    
    let dateFormat;
    if (period === 'daily') {
      dateFormat = 'DATE(timestamp)';
    } else if (period === 'weekly') {
      dateFormat = 'DATE(DATE_SUB(timestamp, INTERVAL WEEKDAY(timestamp) DAY))';
    } else if (period === 'monthly') {
      dateFormat = 'DATE_FORMAT(timestamp, "%Y-%m")';
    }
    
    const [rows] = await connection.execute(
      `SELECT ${dateFormat} as date, COUNT(*) as count 
       FROM activity_logs 
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY ${dateFormat}
       ORDER BY date ASC`,
      [days]
    );
    
    return rows;
  }

  // Method expected by ActivityController for CSV export
  async exportLogsToCSV(filters = {}) {
    const result = await this.getActivityLogs({ ...filters, limit: 10000 });
    
    const headers = ['ID', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'User Agent', 'Timestamp', 'Details'];
    const csvRows = [headers.join(',')];
    
    result.logs.forEach(log => {
      const row = [
        log.id,
        log.user_name || 'Anonymous',
        log.action,
        log.entity_type || '',
        log.entity_id || '',
        log.ip_address || '',
        log.user_agent || '',
        log.timestamp,
        log.details || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`);
      
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Method expected by ActivityController for log rotation
  async rotateLogFile() {
    // For MySQL, we don't need file rotation, but we can clean old logs
    const deletedCount = await this.cleanupOldLogs(90);
    return `Cleaned ${deletedCount} old activity logs`;
  }

  async getStats() {
    const connection = await getDatabaseConnection();
    
    // Get total activities
    const [totalStats] = await connection.execute(
      'SELECT COUNT(*) as total FROM activity_logs'
    );
    
    // Get today's activities
    const [todayStats] = await connection.execute(
      'SELECT COUNT(*) as today_count FROM activity_logs WHERE DATE(timestamp) = CURDATE()'
    );
    
    // Get top actions
    const [actionStats] = await connection.execute(
      'SELECT action, COUNT(*) as count FROM activity_logs GROUP BY action ORDER BY count DESC LIMIT 10'
    );
    
    // Get top users by activity count
    const [userStats] = await connection.execute(
      `SELECT CONCAT(u.username, ' (', u.email, ')') as user, COUNT(*) as count 
       FROM activity_logs a 
       LEFT JOIN users u ON a.user_id = u.id 
       WHERE a.user_id IS NOT NULL 
       GROUP BY a.user_id, u.username, u.email 
       ORDER BY count DESC 
       LIMIT 10`
    );
    
    // Get recent activities with user info
    const [recentActivities] = await connection.execute(
      `SELECT a.*, u.username 
       FROM activity_logs a 
       LEFT JOIN users u ON a.user_id = u.id 
       ORDER BY a.timestamp DESC 
       LIMIT 10`
    );
    
    return {
      totalActivities: totalStats[0].total,
      todayActivities: todayStats[0].today_count,
      topActions: actionStats || [],
      topUsers: userStats || [],
      recentActivities: recentActivities || []
    };
  }

  async getUserActivityStats(userId) {
    const connection = await getDatabaseConnection();
    
    const [totalStats] = await connection.execute(
      'SELECT COUNT(*) as total FROM activity_logs WHERE user_id = ?',
      [userId]
    );
    
    const [actionStats] = await connection.execute(
      'SELECT action, COUNT(*) as count FROM activity_logs WHERE user_id = ? GROUP BY action ORDER BY count DESC',
      [userId]
    );
    
    const [recentStats] = await connection.execute(
      'SELECT COUNT(*) as recent_count FROM activity_logs WHERE user_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
      [userId]
    );
    
    return {
      total: totalStats[0].total,
      recentWeek: recentStats[0].recent_count,
      actions: actionStats
    };
  }

  async cleanupOldLogs(daysToKeep = 90) {
    const connection = await getDatabaseConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM activity_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysToKeep]
    );
    
    return result.affectedRows;
  }

  // Convenience methods for common activities
  async logUserLogin(userId, ipAddress, userAgent) {
    await this.logActivity({
      userId,
      action: 'user_login',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      details: { login_method: 'password' }
    });
  }

  async logUserLogout(userId, ipAddress, userAgent) {
    await this.logActivity({
      userId,
      action: 'user_logout',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent
    });
  }

  async logWebsiteCreated(userId, websiteId, ipAddress, userAgent, details = {}) {
    await this.logActivity({
      userId,
      action: 'website_created',
      entityType: 'website',
      entityId: websiteId,
      ipAddress,
      userAgent,
      details
    });
  }

  async logWebsiteUpdated(userId, websiteId, ipAddress, userAgent, details = {}) {
    await this.logActivity({
      userId,
      action: 'website_updated',
      entityType: 'website',
      entityId: websiteId,
      ipAddress,
      userAgent,
      details
    });
  }

  async logWebsitePublished(userId, websiteId, ipAddress, userAgent, details = {}) {
    await this.logActivity({
      userId,
      action: 'website_published',
      entityType: 'website',
      entityId: websiteId,
      ipAddress,
      userAgent,
      details
    });
  }

  async logFeedbackSubmitted(userId, feedbackId, ipAddress, userAgent, details = {}) {
    await this.logActivity({
      userId,
      action: 'feedback_submitted',
      entityType: 'feedback',
      entityId: feedbackId,
      ipAddress,
      userAgent,
      details
    });
  }

  async logForumThreadCreated(userId, threadId, ipAddress, userAgent, details = {}) {
    await this.logActivity({
      userId,
      action: 'forum_thread_created',
      entityType: 'forum_thread',
      entityId: threadId,
      ipAddress,
      userAgent,
      details
    });
  }

  async logSupportTicketCreated(userId, ticketId, ipAddress, userAgent, details = {}) {
    await this.logActivity({
      userId,
      action: 'support_ticket_created',
      entityType: 'support_ticket',
      entityId: ticketId,
      ipAddress,
      userAgent,
      details
    });
  }

  async logAdminAction(adminId, action, entityType, entityId, ipAddress, userAgent, details = {}) {
    await this.logActivity({
      userId: adminId,
      action: `admin_${action}`,
      entityType,
      entityId,
      ipAddress,
      userAgent,
      details: { ...details, admin_action: true }
    });
  }
}

module.exports = new DatabaseActivityLogger();
