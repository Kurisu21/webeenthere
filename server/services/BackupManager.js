const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');
const DatabaseBackup = require('./DatabaseBackup');
const FileSystemBackup = require('./FileSystemBackup');
const JsonDataManager = require('./JsonDataManager');

class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.dataDir = path.join(__dirname, '..', 'data', 'backups');
    this.jsonManager = new JsonDataManager();
    this.databaseBackup = new DatabaseBackup();
    this.fileSystemBackup = new FileSystemBackup();
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  generateBackupId() {
    return crypto.randomUUID();
  }

  generateBackupFileName(type, timestamp) {
    const dateStr = timestamp.toISOString().slice(0, 19).replace(/[:.]/g, '-').replace('T', '_');
    return `webeenthere_${type}_${dateStr}`;
  }

  generateDateFolder(timestamp) {
    return timestamp.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  async createBackup(type, options = {}) {
    const startTime = new Date();
    const backupId = this.generateBackupId();
    const dateFolder = this.generateDateFolder(startTime);
    const fileName = this.generateBackupFileName(type, startTime);
    
    try {
      console.log(`💾 Creating ${type} backup: ${backupId}`);
      
      // Create date folder
      const dateFolderPath = path.join(this.backupDir, dateFolder);
      if (!fs.existsSync(dateFolderPath)) {
        fs.mkdirSync(dateFolderPath, { recursive: true });
      }

      let backupResult;
      let filePath;

      switch (type) {
        case 'full':
          backupResult = await this.createFullBackup(backupId, fileName, dateFolder, options);
          break;
        case 'database':
          backupResult = await this.createDatabaseBackup(backupId, fileName, dateFolder, options);
          break;
        case 'files':
          backupResult = await this.createFilesBackup(backupId, fileName, dateFolder, options);
          break;
        case 'incremental':
          backupResult = await this.createIncrementalBackup(backupId, fileName, dateFolder, options);
          break;
        default:
          throw new Error(`Invalid backup type: ${type}`);
      }

      if (!backupResult.success) {
        throw new Error(backupResult.error);
      }

      filePath = backupResult.filePath;
      const stats = fs.statSync(filePath);
      
      // Calculate integrity hash
      const integrityHash = await this.calculateFileHash(filePath);
      
      // Create metadata
      const metadata = {
        id: backupId,
        type,
        fileName: backupResult.fileName,
        dateFolder,
        size: stats.size,
        created: startTime.toISOString(),
        description: options.description || '',
        isEncrypted: options.encrypt || false,
        status: 'completed',
        integrityHash,
        duration: Date.now() - startTime.getTime()
      };

      // Save metadata
      await this.saveBackupMetadata(metadata);

      console.log(`✅ Backup created successfully: ${backupId} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      
      return {
        success: true,
        backupId,
        metadata
      };

    } catch (error) {
      console.error(`❌ Backup creation failed: ${error.message}`);
      
      // Save failed backup metadata
      const failedMetadata = {
        id: backupId,
        type,
        fileName: `${fileName}.failed`,
        dateFolder,
        size: 0,
        created: startTime.toISOString(),
        description: options.description || '',
        isEncrypted: options.encrypt || false,
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime.getTime()
      };
      
      await this.saveBackupMetadata(failedMetadata);
      
      return {
        success: false,
        error: error.message,
        backupId
      };
    }
  }

  async createFullBackup(backupId, fileName, dateFolder, options) {
    const dateFolderPath = path.join(this.backupDir, dateFolder);
    const archivePath = path.join(dateFolderPath, `${fileName}.tar.gz`);
    
    // Create archive
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('tar', { gzip: true });
    
    return new Promise((resolve, reject) => {
      archive.on('error', reject);
      output.on('close', () => {
        resolve({
          success: true,
          fileName: `${fileName}.tar.gz`,
          filePath: archivePath
        });
      });

      archive.pipe(output);

      // Add database backup
      archive.append('-- Database Backup\n', { name: 'database.sql' });
      // Add files backup
      archive.directory(path.join(__dirname, '..', 'data'), 'data');
      archive.directory(path.join(__dirname, '..', 'uploads'), 'uploads', false);
      
      archive.finalize();
    });
  }

  async createDatabaseBackup(backupId, fileName, dateFolder, options) {
    const dateFolderPath = path.join(this.backupDir, dateFolder);
    const sqlPath = path.join(dateFolderPath, `${fileName}.sql`);
    
    const result = await this.databaseBackup.createBackup(sqlPath);
    
    if (result.success) {
      return {
        success: true,
        fileName: `${fileName}.sql`,
        filePath: sqlPath
      };
    } else {
      throw new Error(result.error);
    }
  }

  async createFilesBackup(backupId, fileName, dateFolder, options) {
    const dateFolderPath = path.join(this.backupDir, dateFolder);
    const archivePath = path.join(dateFolderPath, `${fileName}.tar.gz`);
    
    const result = await this.fileSystemBackup.createBackup(archivePath);
    
    if (result.success) {
      return {
        success: true,
        fileName: `${fileName}.tar.gz`,
        filePath: archivePath
      };
    } else {
      throw new Error(result.error);
    }
  }

  async createIncrementalBackup(backupId, fileName, dateFolder, options) {
    // Get last backup timestamp
    const lastBackup = await this.getLastBackup();
    const sinceDate = lastBackup ? new Date(lastBackup.created) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago
    
    const dateFolderPath = path.join(this.backupDir, dateFolder);
    const archivePath = path.join(dateFolderPath, `${fileName}.tar.gz`);
    
    const result = await this.fileSystemBackup.createIncrementalBackup(archivePath, sinceDate);
    
    if (result.success) {
      return {
        success: true,
        fileName: `${fileName}.tar.gz`,
        filePath: archivePath
      };
    } else {
      throw new Error(result.error);
    }
  }

  async listBackups(filters = {}) {
    try {
      const metadata = await this.getBackupMetadata();
      
      let backups = metadata.backups || [];
      
      // Apply filters
      if (filters.type) {
        backups = backups.filter(backup => backup.type === filters.type);
      }
      
      if (filters.status) {
        backups = backups.filter(backup => backup.status === filters.status);
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        backups = backups.filter(backup => new Date(backup.created) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        backups = backups.filter(backup => new Date(backup.created) <= endDate);
      }
      
      // Sort by creation date (newest first)
      backups.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      return {
        success: true,
        backups,
        total: backups.length
      };
      
    } catch (error) {
      console.error('Failed to list backups:', error);
      return {
        success: false,
        error: error.message,
        backups: []
      };
    }
  }

  async restoreBackup(backupId, options = {}) {
    try {
      const metadata = await this.getBackupMetadata();
      const backup = metadata.backups?.find(b => b.id === backupId);
      
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }
      
      if (backup.status !== 'completed') {
        throw new Error(`Cannot restore backup with status: ${backup.status}`);
      }
      
      const filePath = path.join(this.backupDir, backup.dateFolder, backup.fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Backup file not found: ${filePath}`);
      }
      
      // Verify integrity if hash exists
      if (backup.integrityHash) {
        const currentHash = await this.calculateFileHash(filePath);
        if (currentHash !== backup.integrityHash) {
          throw new Error('Backup file integrity check failed');
        }
      }
      
      console.log(`🔄 Restoring backup: ${backupId}`);
      
      let result;
      switch (backup.type) {
        case 'database':
          result = await this.databaseBackup.restoreBackup(filePath);
          break;
        case 'files':
          result = await this.fileSystemBackup.restoreBackup(filePath, options);
          break;
        case 'full':
        case 'incremental':
          result = await this.fileSystemBackup.restoreBackup(filePath, options);
          break;
        default:
          throw new Error(`Unsupported backup type for restore: ${backup.type}`);
      }
      
      if (result.success) {
        console.log(`✅ Backup restored successfully: ${backupId}`);
        return { success: true };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error(`❌ Backup restore failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteBackup(backupId) {
    try {
      const metadata = await this.getBackupMetadata();
      const backup = metadata.backups?.find(b => b.id === backupId);
      
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }
      
      const filePath = path.join(this.backupDir, backup.dateFolder, backup.fileName);
      
      // Delete file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted backup file: ${filePath}`);
      }
      
      // Remove from metadata
      metadata.backups = metadata.backups.filter(b => b.id !== backupId);
      await this.saveBackupMetadata(metadata);
      
      console.log(`✅ Backup deleted: ${backupId}`);
      return { success: true };
      
    } catch (error) {
      console.error(`❌ Backup deletion failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getBackupStats() {
    try {
      const metadata = await this.getBackupMetadata();
      const backups = metadata.backups || [];
      
      const completedBackups = backups.filter(b => b.status === 'completed');
      const totalSize = completedBackups.reduce((sum, b) => sum + b.size, 0);
      const lastBackup = completedBackups.length > 0 ? completedBackups[0] : null;
      
      const backupsByType = completedBackups.reduce((acc, backup) => {
        acc[backup.type] = (acc[backup.type] || 0) + 1;
        return acc;
      }, {});
      
      return {
        success: true,
        stats: {
          totalBackups: completedBackups.length,
          totalSize,
          lastBackupDate: lastBackup ? lastBackup.created : null,
          backupsByType,
          successRate: completedBackups.length / backups.length * 100 || 0
        }
      };
      
    } catch (error) {
      console.error('Failed to get backup stats:', error);
      return {
        success: false,
        error: error.message,
        stats: {
          totalBackups: 0,
          totalSize: 0,
          lastBackupDate: null,
          backupsByType: {},
          successRate: 0
        }
      };
    }
  }

  async validateBackup(backupId) {
    try {
      const metadata = await this.getBackupMetadata();
      const backup = metadata.backups?.find(b => b.id === backupId);
      
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }
      
      const filePath = path.join(this.backupDir, backup.dateFolder, backup.fileName);
      
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          valid: false,
          error: 'Backup file not found'
        };
      }
      
      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size !== backup.size) {
        return {
          success: false,
          valid: false,
          error: 'File size mismatch'
        };
      }
      
      // Check integrity hash if available
      if (backup.integrityHash) {
        const currentHash = await this.calculateFileHash(filePath);
        if (currentHash !== backup.integrityHash) {
          return {
            success: false,
            valid: false,
            error: 'Integrity hash mismatch'
          };
        }
      }
      
      return {
        success: true,
        valid: true
      };
      
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error.message
      };
    }
  }

  async calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  async getBackupMetadata() {
    const metadataPath = path.join(this.dataDir, 'backup-metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return { backups: [] };
    }
    
    try {
      const data = fs.readFileSync(metadataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read backup metadata:', error);
      return { backups: [] };
    }
  }

  async saveBackupMetadata(metadata) {
    const metadataPath = path.join(this.dataDir, 'backup-metadata.json');
    const currentData = await this.getBackupMetadata();
    
    if (!currentData.backups) {
      currentData.backups = [];
    }
    
    // Update or add backup
    const existingIndex = currentData.backups.findIndex(b => b.id === metadata.id);
    if (existingIndex >= 0) {
      currentData.backups[existingIndex] = metadata;
    } else {
      currentData.backups.push(metadata);
    }
    
    fs.writeFileSync(metadataPath, JSON.stringify(currentData, null, 2));
  }

  async getLastBackup() {
    const metadata = await this.getBackupMetadata();
    const completedBackups = metadata.backups?.filter(b => b.status === 'completed') || [];
    
    if (completedBackups.length === 0) {
      return null;
    }
    
    return completedBackups.sort((a, b) => new Date(b.created) - new Date(a.created))[0];
  }
}

module.exports = BackupManager;
