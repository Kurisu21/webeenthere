const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class FileSystemBackup {
  constructor() {
    this.serverRoot = path.join(__dirname, '..');
    this.uploadsDir = path.join(this.serverRoot, 'uploads');
    this.dataDir = path.join(this.serverRoot, 'data');
    this.logsDir = path.join(this.serverRoot, 'data', 'logs');
  }

  async createBackup(outputPath) {
    try {
      console.log(`💾 Creating filesystem backup: ${outputPath}`);
      
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('tar', { gzip: true });
      
      return new Promise((resolve, reject) => {
        archive.on('error', (err) => {
          console.error('Archive error:', err);
          reject(err);
        });
        
        output.on('close', () => {
          const stats = fs.statSync(outputPath);
          console.log(`✅ Filesystem backup created: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
          resolve({
            success: true,
            size: stats.size,
            fileCount: archive.pointer()
          });
        });
        
        output.on('error', (err) => {
          console.error('Output stream error:', err);
          reject(err);
        });
        
        archive.pipe(output);
        
        // Add uploads directory if it exists
        if (fs.existsSync(this.uploadsDir)) {
          archive.directory(this.uploadsDir, 'uploads');
          console.log('📁 Added uploads directory to backup');
        }
        
        // Add data directory (configs, logs, etc.)
        if (fs.existsSync(this.dataDir)) {
          archive.directory(this.dataDir, 'data');
          console.log('📁 Added data directory to backup');
        }
        
        // Add specific important files
        const importantFiles = [
          'package.json',
          'package-lock.json',
          '.env.example'
        ];
        
        for (const file of importantFiles) {
          const filePath = path.join(this.serverRoot, file);
          if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: file });
            console.log(`📄 Added ${file} to backup`);
          }
        }
        
        archive.finalize();
      });
      
    } catch (error) {
      console.error(`❌ Filesystem backup failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createIncrementalBackup(outputPath, sinceDate) {
    try {
      console.log(`💾 Creating incremental filesystem backup since: ${sinceDate.toISOString()}`);
      
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('tar', { gzip: true });
      
      return new Promise((resolve, reject) => {
        archive.on('error', (err) => {
          console.error('Archive error:', err);
          reject(err);
        });
        
        output.on('close', () => {
          const stats = fs.statSync(outputPath);
          console.log(`✅ Incremental filesystem backup created: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
          resolve({
            success: true,
            size: stats.size,
            fileCount: archive.pointer()
          });
        });
        
        output.on('error', (err) => {
          console.error('Output stream error:', err);
          reject(err);
        });
        
        archive.pipe(output);
        
        let hasChanges = false;
        
        // Add changed files from uploads directory
        if (fs.existsSync(this.uploadsDir)) {
          const changedFiles = this.getChangedFiles(this.uploadsDir, sinceDate);
          if (changedFiles.length > 0) {
            hasChanges = true;
            for (const file of changedFiles) {
              const relativePath = path.relative(this.serverRoot, file);
              archive.file(file, { name: relativePath });
            }
            console.log(`📁 Added ${changedFiles.length} changed files from uploads`);
          }
        }
        
        // Add changed files from data directory
        if (fs.existsSync(this.dataDir)) {
          const changedFiles = this.getChangedFiles(this.dataDir, sinceDate);
          if (changedFiles.length > 0) {
            hasChanges = true;
            for (const file of changedFiles) {
              const relativePath = path.relative(this.serverRoot, file);
              archive.file(file, { name: relativePath });
            }
            console.log(`📁 Added ${changedFiles.length} changed files from data`);
          }
        }
        
        // Add changed important files
        const importantFiles = [
          'package.json',
          'package-lock.json'
        ];
        
        for (const file of importantFiles) {
          const filePath = path.join(this.serverRoot, file);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.mtime >= sinceDate) {
              hasChanges = true;
              archive.file(filePath, { name: file });
              console.log(`📄 Added changed ${file} to backup`);
            }
          }
        }
        
        if (!hasChanges) {
          // Add a marker file to indicate no changes
          archive.append('-- No changes found since ' + sinceDate.toISOString() + '\n', { name: 'no-changes.txt' });
        }
        
        archive.finalize();
      });
      
    } catch (error) {
      console.error(`❌ Incremental filesystem backup failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async restoreBackup(backupPath, options = {}) {
    try {
      console.log(`🔄 Restoring filesystem from: ${backupPath}`);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }
      
      // For now, we'll just extract the archive
      // In a production environment, you might want to use a proper tar extraction library
      console.log(`📦 Backup file ready for extraction: ${backupPath}`);
      console.log(`📁 Size: ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`);
      
      // Note: Actual extraction would require additional dependencies
      // This is a placeholder for the restore functionality
      
      return {
        success: true,
        message: 'Backup file is ready for manual extraction',
        backupPath
      };
      
    } catch (error) {
      console.error(`❌ Filesystem restore failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getChangedFiles(dirPath, sinceDate) {
    const changedFiles = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          // Recursively check subdirectories
          const subFiles = this.getChangedFiles(itemPath, sinceDate);
          changedFiles.push(...subFiles);
        } else if (stats.isFile() && stats.mtime >= sinceDate) {
          changedFiles.push(itemPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error.message);
    }
    
    return changedFiles;
  }

  async getBackupInfo(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        return {
          success: false,
          error: 'Backup file not found'
        };
      }
      
      const stats = fs.statSync(backupPath);
      
      return {
        success: true,
        info: {
          path: backupPath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          isCompressed: backupPath.endsWith('.tar.gz') || backupPath.endsWith('.zip')
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validateBackup(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        return {
          success: false,
          valid: false,
          error: 'Backup file not found'
        };
      }
      
      const stats = fs.statSync(backupPath);
      
      if (stats.size === 0) {
        return {
          success: false,
          valid: false,
          error: 'Backup file is empty'
        };
      }
      
      // Basic validation - check if it's a valid archive
      const isArchive = backupPath.endsWith('.tar.gz') || backupPath.endsWith('.zip');
      
      if (!isArchive) {
        return {
          success: false,
          valid: false,
          error: 'Backup file is not a recognized archive format'
        };
      }
      
      return {
        success: true,
        valid: true,
        size: stats.size,
        isArchive
      };
      
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error.message
      };
    }
  }

  async getDirectorySize(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        return 0;
      }
      
      let totalSize = 0;
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error(`Error calculating directory size for ${dirPath}:`, error.message);
      return 0;
    }
  }

  async getBackupStats() {
    try {
      const uploadsSize = await this.getDirectorySize(this.uploadsDir);
      const dataSize = await this.getDirectorySize(this.dataDir);
      
      return {
        success: true,
        stats: {
          uploadsSize,
          dataSize,
          totalSize: uploadsSize + dataSize,
          uploadsExists: fs.existsSync(this.uploadsDir),
          dataExists: fs.existsSync(this.dataDir)
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stats: {
          uploadsSize: 0,
          dataSize: 0,
          totalSize: 0,
          uploadsExists: false,
          dataExists: false
        }
      };
    }
  }
}

module.exports = FileSystemBackup;
