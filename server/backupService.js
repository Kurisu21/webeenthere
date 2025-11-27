const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
require('dotenv').config();

const execAsync = promisify(exec);

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, 'backups');
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}`);
    }
  }

  generateBackupFileName() {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);
    return `webeenthere_backup_${timestamp}.sql`;
  }

  generateDateFolderName() {
    const now = new Date();
    return now.toISOString().slice(0, 10); // YYYY-MM-DD format
  }

  async createBackup() {
    try {
      const fileName = this.generateBackupFileName();
      const dateFolder = this.generateDateFolderName();
      const dateFolderPath = path.join(this.backupDir, dateFolder);
      
      // Create date folder if it doesn't exist
      if (!fs.existsSync(dateFolderPath)) {
        fs.mkdirSync(dateFolderPath, { recursive: true });
        console.log(`📁 Created date folder: ${dateFolder}`);
      }
      
      const filePath = path.join(dateFolderPath, fileName);
      
      console.log(`💾 Creating backup: ${dateFolder}/${fileName}`);
      
      // Use Node.js MySQL connection to create backup
      const mysql = require('mysql2');
      const connection = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'u875409848_jumaoas',
        port: process.env.DB_PORT || 3306
      });
      
      // Add error handler to prevent unhandled errors
      connection.on('error', (err) => {
        console.error('❌ Backup connection error:', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
          console.log('🔄 Backup connection lost.');
        } else if (err.fatal) {
          console.error('💥 Fatal backup connection error:', err);
        }
      });
      
      const db = connection.promise();
      
      // Get all tables
      const [tables] = await db.execute('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      
      let backupContent = '';
      backupContent += `-- Webeenthere Database Backup\n`;
      backupContent += `-- Generated: ${new Date().toISOString()}\n`;
      backupContent += `-- Database: ${process.env.DB_NAME || 'u875409848_jumaoas'}\n\n`;
      
      // Disable foreign key checks
      backupContent += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
      
      // Backup each table
      for (const tableName of tableNames) {
        backupContent += `-- Table: ${tableName}\n`;
        
        // Get table structure
        const [createTable] = await db.execute(`SHOW CREATE TABLE \`${tableName}\``);
        backupContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        backupContent += `${createTable[0]['Create Table']};\n\n`;
        
        // Get table data
        const [rows] = await db.execute(`SELECT * FROM \`${tableName}\``);
        if (rows.length > 0) {
          const columns = Object.keys(rows[0]);
          backupContent += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES\n`;
          
          const values = rows.map(row => {
            const rowValues = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              return value;
            });
            return `(${rowValues.join(', ')})`;
          });
          
          backupContent += values.join(',\n') + ';\n\n';
        }
      }
      
      // Re-enable foreign key checks
      backupContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;
      
      // Write backup file
      fs.writeFileSync(filePath, backupContent, 'utf8');
      
      connection.end();
      
      // Check if backup file was created and has content
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          console.log(`✅ Backup created successfully: ${dateFolder}/${fileName} (${(stats.size / 1024).toFixed(2)} KB)`);
          return { success: true, fileName, filePath, size: stats.size, dateFolder };
        } else {
          console.log(`⚠️ Backup file created but is empty: ${dateFolder}/${fileName}`);
          return { success: false, error: 'Empty backup file' };
        }
      } else {
        console.log(`❌ Backup file was not created: ${dateFolder}/${fileName}`);
        return { success: false, error: 'Backup file not created' };
      }
    } catch (error) {
      console.error(`❌ Backup failed:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async restoreBackup(fileName, dateFolder = null) {
    try {
      let filePath;
      
      if (dateFolder) {
        filePath = path.join(this.backupDir, dateFolder, fileName);
      } else {
        // Search for the file in all date folders
        const dateFolders = fs.readdirSync(this.backupDir)
          .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory());
        
        let found = false;
        for (const folder of dateFolders) {
          const testPath = path.join(this.backupDir, folder, fileName);
          if (fs.existsSync(testPath)) {
            filePath = testPath;
            found = true;
            break;
          }
        }
        
        if (!found) {
          throw new Error(`Backup file not found: ${fileName}`);
        }
      }
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Backup file not found: ${fileName}`);
      }

      console.log(`🔄 Restoring backup: ${fileName}`);
      
      // Read backup file
      const backupContent = fs.readFileSync(filePath, 'utf8');
      
      // Use Node.js MySQL connection to restore backup
      const mysql = require('mysql2');
      const connection = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'u875409848_jumaoas',
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
      });
      
      // Add error handler to prevent unhandled errors
      connection.on('error', (err) => {
        console.error('❌ Restore connection error:', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
          console.log('🔄 Restore connection lost.');
        } else if (err.fatal) {
          console.error('💥 Fatal restore connection error:', err);
        }
      });
      
      const db = connection.promise();
      
      // Execute backup SQL
      await db.execute(backupContent);
      
      connection.end();
      console.log(`✅ Backup restored successfully: ${fileName}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Restore failed:`, error.message);
      return { success: false, error: error.message };
    }
  }

  listBackups() {
    try {
      const backups = [];
      
      // Get all date folders
      const dateFolders = fs.readdirSync(this.backupDir)
        .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
        .sort((a, b) => b.localeCompare(a)); // Sort by date descending
      
      for (const dateFolder of dateFolders) {
        const dateFolderPath = path.join(this.backupDir, dateFolder);
        const files = fs.readdirSync(dateFolderPath)
          .filter(file => file.endsWith('.sql'))
          .map(file => {
            const filePath = path.join(dateFolderPath, file);
            const stats = fs.statSync(filePath);
            return {
              fileName: file,
              dateFolder: dateFolder,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime,
              fullPath: filePath
            };
          })
          .sort((a, b) => b.created - a.created);
        
        backups.push(...files);
      }
      
      return backups;
    } catch (error) {
      console.error('❌ Failed to list backups:', error.message);
      return [];
    }
  }

  // Removed auto-cleanup functionality as requested
  // Backups are now organized by date folders and kept indefinitely
}

const backupService = new BackupService();

// Create backup function
async function createBackup() {
  const result = await backupService.createBackup();
  return result;
}

// Schedule regular backups
function scheduleBackups(intervalHours = 6) {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`⏰ Scheduling backups every ${intervalHours} hours`);
  
  setInterval(async () => {
    console.log(`⏰ Running scheduled backup...`);
    await createBackup();
  }, intervalMs);
}

// List backups function
function listBackups() {
  return backupService.listBackups();
}

// Restore backup function
async function restoreBackup(fileName, dateFolder = null) {
  return await backupService.restoreBackup(fileName, dateFolder);
}

module.exports = {
  createBackup,
  scheduleBackups,
  listBackups,
  restoreBackup,
  BackupService
};
