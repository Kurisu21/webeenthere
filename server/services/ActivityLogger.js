const JsonDataManager = require('./JsonDataManager');
const fs = require('fs').promises;
const path = require('path');

class ActivityLogger {
  constructor(dbConnection) {
    this.jsonManager = new JsonDataManager();
    this.dbConnection = dbConnection;
    this.logFilePrefix = 'activity';
    this.maxLogsPerFile = 10000; // Rotate when file gets too large
  }

  /**
   * Generate unique log ID
   */
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current log file name based on date
   */
  getCurrentLogFileName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `logs/${this.logFilePrefix}-${year}-${month}.json`;
  }

  /**
   * Log activity with automatic username sync
   */
  async logActivity(userId, action, details = {}, ipAddress = null, userAgent = null) {
    try {
      // Get fresh user data from database
      const userData = await this.jsonManager.getUserData(userId, this.dbConnection);
      const username = userData ? userData.username : 'unknown';

      const logEntry = {
        id: this.generateLogId(),
        userId: userId,
        username: username,
        action: action,
        details: details,
        ipAddress: ipAddress,
        userAgent: userAgent,
        timestamp: new Date().toISOString()
      };

      const logFileName = this.getCurrentLogFileName();
      const logData = await this.jsonManager.readJsonFile(logFileName);

      // Initialize logs array if it doesn't exist
      if (!logData.logs) {
        logData.logs = [];
      }

      // Add new log entry
      logData.logs.push(logEntry);
      logData.lastUpdated = new Date().toISOString();
      logData.totalLogs = logData.logs.length;

      // Check if rotation is needed
      if (logData.logs.length >= this.maxLogsPerFile) {
        await this.rotateLogFile();
        // Log the current entry in the new file
        const newLogData = await this.jsonManager.readJsonFile(this.getCurrentLogFileName());
        newLogData.logs.push(logEntry);
        newLogData.lastUpdated = new Date().toISOString();
        newLogData.totalLogs = newLogData.logs.length;
        await this.jsonManager.writeJsonFile(this.getCurrentLogFileName(), newLogData);
      } else {
        await this.jsonManager.writeJsonFile(logFileName, logData);
      }

      console.log(`Activity logged: ${action} by ${username} (${userId})`);
      return logEntry;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  }

  /**
   * Get activity logs with filtering and pagination
   */
  async getActivityLogs(filters = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        userId = null,
        action = null,
        startDate = null,
        endDate = null,
        search = null
      } = filters;

      const logFileName = this.getCurrentLogFileName();
      const logData = await this.jsonManager.readJsonFile(logFileName);

      if (!logData.logs) {
        return {
          logs: [],
          pagination: {
            page: 1,
            limit: limit,
            total: 0,
            totalPages: 0
          }
        };
      }

      let filteredLogs = [...logData.logs];

      // Apply filters
      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      if (action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(action.toLowerCase())
        );
      }

      if (startDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= new Date(startDate)
        );
      }

      if (endDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= new Date(endDate)
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.username.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.details).toLowerCase().includes(searchLower)
        );
      }

      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Pagination
      const total = filteredLogs.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

      return {
        logs: paginatedLogs,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: totalPages
        }
      };
    } catch (error) {
      console.error('Failed to get activity logs:', error);
      throw error;
    }
  }

  /**
   * Rotate log file (create new monthly file)
   */
  async rotateLogFile() {
    try {
      const currentFileName = this.getCurrentLogFileName();
      const logData = await this.jsonManager.readJsonFile(currentFileName);

      // Archive current file
      const archiveFileName = currentFileName.replace('.json', `-archive-${Date.now()}.json`);
      await this.jsonManager.writeJsonFile(archiveFileName, logData);

      // Create new empty log file
      const newLogData = {
        logs: [],
        lastRotation: new Date().toISOString(),
        totalLogs: 0,
        previousFile: currentFileName
      };

      await this.jsonManager.writeJsonFile(currentFileName, newLogData);
      console.log(`Log file rotated: ${currentFileName} -> ${archiveFileName}`);
      
      return archiveFileName;
    } catch (error) {
      console.error('Failed to rotate log file:', error);
      throw error;
    }
  }

  /**
   * Clean up old log files (keep indefinitely but compress)
   */
  async cleanupOldLogs() {
    try {
      const files = await this.jsonManager.listJsonFiles();
      const logFiles = files.filter(file => 
        file.path.startsWith('logs/') && 
        file.path.includes('archive')
      );

      // For now, just log the files - compression can be added later
      console.log(`Found ${logFiles.length} archived log files`);
      return logFiles;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      throw error;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats() {
    try {
      const logFileName = this.getCurrentLogFileName();
      const logData = await this.jsonManager.readJsonFile(logFileName);

      if (!logData.logs) {
        return {
          totalActivities: 0,
          todayActivities: 0,
          topActions: [],
          topUsers: [],
          recentActivities: []
        };
      }

      const logs = logData.logs;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Today's activities
      const todayActivities = logs.filter(log => 
        new Date(log.timestamp) >= today
      ).length;

      // Top actions
      const actionCounts = {};
      logs.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });

      const topActions = Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([action, count]) => ({ action, count }));

      // Top users
      const userCounts = {};
      logs.forEach(log => {
        const key = `${log.username} (${log.userId})`;
        userCounts[key] = (userCounts[key] || 0) + 1;
      });

      const topUsers = Object.entries(userCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([user, count]) => ({ user, count }));

      // Recent activities (last 10)
      const recentActivities = logs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      return {
        totalActivities: logs.length,
        todayActivities: todayActivities,
        topActions: topActions,
        topUsers: topUsers,
        recentActivities: recentActivities
      };
    } catch (error) {
      console.error('Failed to get activity stats:', error);
      throw error;
    }
  }

  /**
   * Export logs to CSV format
   */
  async exportLogsToCSV(filters = {}) {
    try {
      const { logs } = await this.getActivityLogs({ ...filters, limit: 10000 });
      
      if (logs.length === 0) {
        return 'No logs found';
      }

      const headers = ['ID', 'User ID', 'Username', 'Action', 'Details', 'IP Address', 'Timestamp'];
      const csvRows = [headers.join(',')];

      logs.forEach(log => {
        const row = [
          log.id,
          log.userId,
          `"${log.username}"`,
          `"${log.action}"`,
          `"${JSON.stringify(log.details).replace(/"/g, '""')}"`,
          log.ipAddress || '',
          log.timestamp
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      console.error('Failed to export logs to CSV:', error);
      throw error;
    }
  }

  /**
   * Sync username in all log files (called by JsonDataManager)
   */
  async syncUsernameInLogs(userId, newUsername) {
    try {
      const files = await this.jsonManager.listJsonFiles();
      const logFiles = files.filter(file => 
        file.path.startsWith('logs/') && file.path.endsWith('.json')
      );

      for (const file of logFiles) {
        try {
          const logData = await this.jsonManager.readJsonFile(file.path);
          if (logData.logs) {
            let updated = false;
            logData.logs.forEach(log => {
              if (log.userId === userId) {
                log.username = newUsername;
                updated = true;
              }
            });

            if (updated) {
              await this.jsonManager.writeJsonFile(file.path, logData);
              console.log(`Updated username in ${file.path} for userId ${userId}`);
            }
          }
        } catch (error) {
          console.error(`Failed to sync username in ${file.path}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Failed to sync username in logs:', error);
      throw error;
    }
  }
}

module.exports = ActivityLogger;
