const BackupManager = require('../services/BackupManager');
const path = require('path');
const fs = require('fs');

class BackupController {
  constructor() {
    this.backupManager = new BackupManager();
  }

  async createBackup(req, res) {
    try {
      const { type, description, encrypt, password } = req.body;
      
      // Validate backup type
      const validTypes = ['full', 'database', 'files', 'incremental'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid backup type. Must be one of: ${validTypes.join(', ')}`
        });
      }
      
      // Validate encryption options
      if (encrypt && !password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required when encryption is enabled'
        });
      }
      
      const options = {
        description: description || '',
        encrypt: encrypt || false,
        password: password || null
      };
      
      console.log(`📋 Creating ${type} backup with options:`, options);
      
      const result = await this.backupManager.createBackup(type, options);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: `${type} backup created successfully`,
          backup: result.metadata
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error) {
      console.error('Backup creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create backup'
      });
    }
  }

  async listBackups(req, res) {
    try {
      const { type, status, startDate, endDate, page = 1, limit = 20 } = req.query;
      
      const filters = {
        type: type || null,
        status: status || null,
        startDate: startDate || null,
        endDate: endDate || null
      };
      
      const result = await this.backupManager.listBackups(filters);
      
      if (result.success) {
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedBackups = result.backups.slice(startIndex, endIndex);
        
        res.json({
          success: true,
          backups: paginatedBackups,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
            hasNext: endIndex < result.total,
            hasPrev: page > 1
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error) {
      console.error('List backups error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list backups'
      });
    }
  }

  async downloadBackup(req, res) {
    try {
      const { id } = req.params;
      
      // Get backup metadata
      const metadata = await this.backupManager.getBackupMetadata();
      const backup = metadata.backups?.find(b => b.id === id);
      
      if (!backup) {
        return res.status(404).json({
          success: false,
          error: 'Backup not found'
        });
      }
      
      if (backup.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: `Cannot download backup with status: ${backup.status}`
        });
      }
      
      const filePath = path.join(this.backupManager.backupDir, backup.dateFolder, backup.fileName);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Backup file not found'
        });
      }
      
      // Set headers for file download
      const fileName = backup.fileName;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', backup.size);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Failed to download backup file'
          });
        }
      });
      
    } catch (error) {
      console.error('Download backup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download backup'
      });
    }
  }

  async restoreBackup(req, res) {
    try {
      const { id } = req.params;
      const { confirm, password } = req.body;
      
      if (!confirm) {
        return res.status(400).json({
          success: false,
          error: 'Restore confirmation is required'
        });
      }
      
      // Get backup metadata
      const metadata = await this.backupManager.getBackupMetadata();
      const backup = metadata.backups?.find(b => b.id === id);
      
      if (!backup) {
        return res.status(404).json({
          success: false,
          error: 'Backup not found'
        });
      }
      
      if (backup.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: `Cannot restore backup with status: ${backup.status}`
        });
      }
      
      // Validate password if backup is encrypted
      if (backup.isEncrypted && !password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required for encrypted backup'
        });
      }
      
      console.log(`🔄 Restoring backup: ${id}`);
      
      const options = {
        password: password || null
      };
      
      const result = await this.backupManager.restoreBackup(id, options);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Backup restored successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error) {
      console.error('Restore backup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to restore backup'
      });
    }
  }

  async deleteBackup(req, res) {
    try {
      const { id } = req.params;
      
      // Get backup metadata
      const metadata = await this.backupManager.getBackupMetadata();
      const backup = metadata.backups?.find(b => b.id === id);
      
      if (!backup) {
        return res.status(404).json({
          success: false,
          error: 'Backup not found'
        });
      }
      
      console.log(`🗑️ Deleting backup: ${id}`);
      
      const result = await this.backupManager.deleteBackup(id);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Backup deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error) {
      console.error('Delete backup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete backup'
      });
    }
  }

  async getBackupStats(req, res) {
    try {
      const result = await this.backupManager.getBackupStats();
      
      if (result.success) {
        res.json({
          success: true,
          stats: result.stats
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error) {
      console.error('Get backup stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get backup statistics'
      });
    }
  }

  async getBackupSchedule(req, res) {
    try {
      const schedulePath = path.join(this.backupManager.dataDir, 'backup-schedule.json');
      
      if (!fs.existsSync(schedulePath)) {
        // Return default schedule
        const defaultSchedule = {
          enabled: false,
          frequency: 'daily',
          time: '02:00',
          dayOfWeek: 0, // Sunday
          dayOfMonth: 1,
          retentionDays: 30,
          autoDelete: true
        };
        
        return res.json({
          success: true,
          schedule: defaultSchedule
        });
      }
      
      const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
      
      res.json({
        success: true,
        schedule: scheduleData
      });
      
    } catch (error) {
      console.error('Get backup schedule error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get backup schedule'
      });
    }
  }

  async updateBackupSchedule(req, res) {
    try {
      const {
        enabled,
        frequency,
        time,
        dayOfWeek,
        dayOfMonth,
        retentionDays,
        autoDelete
      } = req.body;
      
      // Validate schedule data
      const validFrequencies = ['daily', 'weekly', 'monthly'];
      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({
          success: false,
          error: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`
        });
      }
      
      if (retentionDays < 1 || retentionDays > 365) {
        return res.status(400).json({
          success: false,
          error: 'Retention days must be between 1 and 365'
        });
      }
      
      const scheduleData = {
        enabled: enabled || false,
        frequency,
        time: time || '02:00',
        dayOfWeek: frequency === 'weekly' ? (dayOfWeek || 0) : undefined,
        dayOfMonth: frequency === 'monthly' ? (dayOfMonth || 1) : undefined,
        retentionDays: retentionDays || 30,
        autoDelete: autoDelete !== undefined ? autoDelete : true,
        updated: new Date().toISOString()
      };
      
      const schedulePath = path.join(this.backupManager.dataDir, 'backup-schedule.json');
      fs.writeFileSync(schedulePath, JSON.stringify(scheduleData, null, 2));
      
      console.log('📅 Backup schedule updated:', scheduleData);
      
      res.json({
        success: true,
        message: 'Backup schedule updated successfully',
        schedule: scheduleData
      });
      
    } catch (error) {
      console.error('Update backup schedule error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update backup schedule'
      });
    }
  }

  async validateBackup(req, res) {
    try {
      const { id } = req.params;
      
      const result = await this.backupManager.validateBackup(id);
      
      res.json({
        success: true,
        validation: result
      });
      
    } catch (error) {
      console.error('Validate backup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate backup'
      });
    }
  }
}

module.exports = BackupController;
