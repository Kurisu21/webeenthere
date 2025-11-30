const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const { getDatabaseConnection, testConnection } = require('../database/database');
require('dotenv').config();

class DatabaseBackup {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u875409848_jumaoas',
      port: process.env.DB_PORT || 3306
    };
  }

  async createBackup(outputPath) {
    try {
      console.log(`💾 Creating database backup: ${outputPath}`);
      
      // Wait for database connection to be ready
      console.log('🔌 Waiting for database connection...');
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection not available. Please try again.');
      }
      
      // Use the connection pool directly (it handles connection management)
      const db = getDatabaseConnection();
      console.log('✅ Database connection established');
      
      // Get all tables
      const [tables] = await db.execute('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      
      let backupContent = '';
      backupContent += `-- Webeenthere Database Backup\n`;
      backupContent += `-- Generated: ${new Date().toISOString()}\n`;
      backupContent += `-- Database: ${this.dbConfig.database}\n\n`;
      
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
      fs.writeFileSync(outputPath, backupContent, 'utf8');
      
      // Verify backup file
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
          console.log(`✅ Database backup created: ${outputPath} (${(stats.size / 1024).toFixed(2)} KB)`);
          return { success: true, size: stats.size };
        } else {
          throw new Error('Backup file is empty');
        }
      } else {
        throw new Error('Backup file was not created');
      }
      
    } catch (error) {
      console.error(`❌ Database backup failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async restoreBackup(backupPath) {
    let connection = null;
    try {
      console.log(`🔄 Restoring database from: ${backupPath}`);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }
      
      // Wait for database connection to be ready
      console.log('🔌 Waiting for database connection...');
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection not available. Please try again.');
      }
      
      // Read backup file
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      
      // Get connection from pool for restore (need multiple statements)
      // For restore, we need a direct connection with multipleStatements
      const mysql = require('mysql2');
      connection = mysql.createConnection({
        ...this.dbConfig,
        multipleStatements: true
      });
      
      // Wait for connection to be established
      await new Promise((resolve, reject) => {
        connection.connect((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      const db = connection.promise();
      
      // Execute backup SQL
      await db.execute(backupContent);
      
      connection.end();
      connection = null;
      
      console.log(`✅ Database restored successfully: ${backupPath}`);
      return { success: true };
      
    } catch (error) {
      console.error(`❌ Database restore failed: ${error.message}`);
      if (connection) {
        try {
          connection.end();
        } catch (endError) {
          console.error('Error closing connection:', endError);
        }
      }
      return { success: false, error: error.message };
    }
  }

  async createIncrementalBackup(outputPath, sinceDate) {
    try {
      console.log(`💾 Creating incremental database backup since: ${sinceDate.toISOString()}`);
      
      // Wait for database connection to be ready
      console.log('🔌 Waiting for database connection...');
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection not available. Please try again.');
      }
      
      // Use the connection pool directly (it handles connection management)
      const db = getDatabaseConnection();
      console.log('✅ Database connection established');
      
      // Get all tables
      const [tables] = await db.execute('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      
      let backupContent = '';
      backupContent += `-- Webeenthere Incremental Database Backup\n`;
      backupContent += `-- Generated: ${new Date().toISOString()}\n`;
      backupContent += `-- Since: ${sinceDate.toISOString()}\n`;
      backupContent += `-- Database: ${this.dbConfig.database}\n\n`;
      
      // Disable foreign key checks
      backupContent += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
      
      let hasChanges = false;
      
      // Backup each table with changes
      for (const tableName of tableNames) {
        // Check if table has timestamp columns
        const [columns] = await db.execute(`DESCRIBE \`${tableName}\``);
        const timestampColumns = columns.filter(col => 
          col.Type.includes('timestamp') || col.Type.includes('datetime')
        );
        
        if (timestampColumns.length === 0) {
          // No timestamp columns, skip this table for incremental backup
          continue;
        }
        
        // Build WHERE clause for incremental data
        const whereClause = timestampColumns.map(col => 
          `\`${col.Field}\` >= '${sinceDate.toISOString().slice(0, 19).replace('T', ' ')}'`
        ).join(' OR ');
        
        // Get changed rows
        const [rows] = await db.execute(`SELECT * FROM \`${tableName}\` WHERE ${whereClause}`);
        
        if (rows.length > 0) {
          hasChanges = true;
          backupContent += `-- Table: ${tableName} (${rows.length} changed rows)\n`;
          
          // Get table structure
          const [createTable] = await db.execute(`SHOW CREATE TABLE \`${tableName}\``);
          backupContent += `DROP TABLE IF EXISTS \`${tableName}_temp\`;\n`;
          backupContent += `CREATE TABLE \`${tableName}_temp\` AS SELECT * FROM \`${tableName}\` WHERE ${whereClause};\n\n`;
          
          // Insert changed data
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
      
      if (!hasChanges) {
        backupContent += `-- No changes found since ${sinceDate.toISOString()}\n`;
      }
      
      // Write backup file
      fs.writeFileSync(outputPath, backupContent, 'utf8');
      
      // Verify backup file
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`✅ Incremental database backup created: ${outputPath} (${(stats.size / 1024).toFixed(2)} KB)`);
        return { success: true, size: stats.size, hasChanges };
      } else {
        throw new Error('Backup file was not created');
      }
      
    } catch (error) {
      console.error(`❌ Incremental database backup failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async getTableInfo() {
    try {
      // Wait for database connection to be ready
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection not available. Please try again.');
      }
      
      // Use the connection pool directly (it handles connection management)
      const db = getDatabaseConnection();
      
      const [tables] = await db.execute('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      
      const tableInfo = [];
      
      for (const tableName of tableNames) {
        const [rows] = await db.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        const [createTable] = await db.execute(`SHOW CREATE TABLE \`${tableName}\``);
        
        tableInfo.push({
          name: tableName,
          rowCount: rows[0].count,
          createStatement: createTable[0]['Create Table']
        });
      }
      
      return {
        success: true,
        tables: tableInfo,
        totalTables: tableNames.length
      };
      
    } catch (error) {
      console.error(`❌ Failed to get table info: ${error.message}`);
      return {
        success: false,
        error: error.message,
        tables: [],
        totalTables: 0
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
      
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      
      // Basic validation - check for SQL statements
      const hasCreateTable = backupContent.includes('CREATE TABLE');
      const hasInsert = backupContent.includes('INSERT INTO');
      const hasForeignKeyChecks = backupContent.includes('FOREIGN_KEY_CHECKS');
      
      if (!hasCreateTable && !hasInsert) {
        return {
          success: false,
          valid: false,
          error: 'Backup file appears to be empty or invalid'
        };
      }
      
      return {
        success: true,
        valid: true,
        hasCreateTable,
        hasInsert,
        hasForeignKeyChecks
      };
      
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = DatabaseBackup;
