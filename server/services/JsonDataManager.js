const fs = require('fs').promises;
const path = require('path');

class JsonDataManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.userCache = new Map(); // Cache for user data (userId -> {username, email})
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Ensure data directory exists
   */
  async ensureDataDir(subDir = '') {
    const fullPath = path.join(this.dataDir, subDir);
    try {
      await fs.access(fullPath);
    } catch {
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  /**
   * Read JSON file with error handling
   */
  async readJsonFile(filePath) {
    try {
      const fullPath = path.join(this.dataDir, filePath);
      const data = await fs.readFile(fullPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`JSON file not found: ${filePath}, creating default structure`);
        return this.createDefaultStructure(filePath);
      }
      throw new Error(`Failed to read JSON file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write JSON file with backup and error handling
   */
  async writeJsonFile(filePath, data) {
    try {
      const fullPath = path.join(this.dataDir, filePath);
      const dir = path.dirname(fullPath);
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });
      
      // Create backup if file exists
      try {
        await fs.access(fullPath);
        const backupPath = `${fullPath}.backup`;
        await fs.copyFile(fullPath, backupPath);
      } catch {
        // File doesn't exist, no backup needed
      }
      
      // Write new data
      await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
      
      // Remove backup after successful write
      try {
        const backupPath = `${fullPath}.backup`;
        await fs.unlink(backupPath);
      } catch {
        // Backup removal failed, not critical
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to write JSON file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Create default structure for missing JSON files
   */
  async createDefaultStructure(filePath) {
    const defaults = {
      'settings/system-settings.json': {
        appName: 'WEBeenThere',
        maintenanceMode: false,
        registrationEnabled: true,
        maxUploadSizeMB: 10,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      },
      'settings/feature-flags.json': {
        aiFeatures: true,
        templates: true,
        analytics: true,
        forum: true,
        supportTickets: true
      },
      'settings/email-config.json': {
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: '',
        fromName: 'WEBeenThere',
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      },
      'logs/activity-logs.json': {
        logs: [],
        lastRotation: new Date().toISOString(),
        totalLogs: 0
      },
      'community/feedback.json': {
        feedback: []
      },
      'support/tickets.json': {
        tickets: []
      },
      'forum/categories.json': {
        categories: []
      },
      'forum/threads.json': {
        threads: []
      }
    };

    const defaultData = defaults[filePath];
    if (defaultData) {
      await this.writeJsonFile(filePath, defaultData);
      return defaultData;
    }
    
    return {};
  }

  /**
   * Sync user data across all JSON files
   * Updates username wherever userId is found
   */
  async syncUserDataInJson(userId, newUsername) {
    try {
      console.log(`Syncing user data: userId=${userId}, username=${newUsername}`);
      
      // Files that might contain user references
      const filesToSync = [
        'community/feedback.json',
        'support/tickets.json',
        'forum/threads.json',
        'logs/activity-logs.json'
      ];

      for (const filePath of filesToSync) {
        try {
          const data = await this.readJsonFile(filePath);
          let updated = false;

          // Update feedback.json
          if (filePath === 'community/feedback.json' && data.feedback) {
            data.feedback.forEach(item => {
              if (item.userId === userId) {
                item.username = newUsername;
                updated = true;
              }
            });
          }

          // Update tickets.json
          if (filePath === 'support/tickets.json' && data.tickets) {
            data.tickets.forEach(ticket => {
              if (ticket.userId === userId) {
                ticket.username = newUsername;
                updated = true;
              }
            });
          }

          // Update forum threads
          if (filePath === 'forum/threads.json' && data.threads) {
            data.threads.forEach(thread => {
              if (thread.userId === userId) {
                thread.username = newUsername;
                updated = true;
              }
              // Update replies too
              if (thread.replies) {
                thread.replies.forEach(reply => {
                  if (reply.userId === userId) {
                    reply.username = newUsername;
                    updated = true;
                  }
                });
              }
            });
          }

          // Update activity logs
          if (filePath === 'logs/activity-logs.json' && data.logs) {
            data.logs.forEach(log => {
              if (log.userId === userId) {
                log.username = newUsername;
                updated = true;
              }
            });
          }

          if (updated) {
            await this.writeJsonFile(filePath, data);
            console.log(`Updated ${filePath} with new username for userId ${userId}`);
          }
        } catch (error) {
          console.error(`Failed to sync ${filePath}:`, error.message);
        }
      }

      // Update cache
      this.userCache.set(userId, {
        username: newUsername,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Failed to sync user data in JSON files:', error);
      throw error;
    }
  }

  /**
   * Get user data from cache or database
   */
  async getUserData(userId, dbConnection) {
    // Check cache first
    const cached = this.userCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached;
    }

    // Fetch from database
    try {
      const [rows] = await dbConnection.execute(
        'SELECT id, username, email FROM users WHERE id = ?',
        [userId]
      );

      if (rows.length > 0) {
        const userData = {
          username: rows[0].username,
          email: rows[0].email,
          timestamp: Date.now()
        };
        
        this.userCache.set(userId, userData);
        return userData;
      }
    } catch (error) {
      console.error('Failed to fetch user data from database:', error);
    }

    return null;
  }

  /**
   * Clear user cache
   */
  clearUserCache() {
    this.userCache.clear();
  }

  /**
   * Get file size for monitoring
   */
  async getFileSize(filePath) {
    try {
      const fullPath = path.join(this.dataDir, filePath);
      const stats = await fs.stat(fullPath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * List all JSON files in data directory
   */
  async listJsonFiles() {
    try {
      const files = [];
      const scanDir = async (dir, relativePath = '') => {
        const items = await fs.readdir(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const relativeItemPath = path.join(relativePath, item);
          const stats = await fs.stat(fullPath);
          
          if (stats.isDirectory()) {
            await scanDir(fullPath, relativeItemPath);
          } else if (item.endsWith('.json')) {
            files.push({
              path: relativeItemPath,
              size: stats.size,
              modified: stats.mtime
            });
          }
        }
      };

      await scanDir(this.dataDir);
      return files;
    } catch (error) {
      console.error('Failed to list JSON files:', error);
      return [];
    }
  }
}

module.exports = JsonDataManager;
