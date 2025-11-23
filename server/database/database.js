const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool without database first
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

// Create a new connection pool with database after initialization
let dbWithDatabase = null;

function getDatabaseConnection() {
  if (!dbWithDatabase) {
    dbWithDatabase = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u875409848_jumaoas',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }).promise();
  }
  return dbWithDatabase;
}

// Test database connection
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ MySQL server connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
}

// Initialize database on startup
async function initializeDatabase() {
  const DatabaseORM = require('./databaseORM');
  const orm = new DatabaseORM();
  
  // Check if database needs initialization
  const status = await orm.getStatus();
  
  if (!status || !status.database) {
    // Database doesn't exist - initialize everything
    console.log('🔧 Database not found, initializing...');
    const success = await orm.initialize();
    if (success) {
      console.log('✅ Database initialization completed');
    } else {
      console.log('❌ Database initialization failed');
      return false;
    }
  } else {
    // Database exists - check if tables exist
    const requiredTables = ['users', 'templates', 'websites', 'plans'];
    const tablesExist = requiredTables.every(tableName => {
      return status.tables && status.tables[tableName] && status.tables[tableName].exists;
    });
    
    if (!tablesExist) {
      console.log('🔧 Database exists but tables are missing, initializing tables...');
      const success = await orm.initialize();
      if (success) {
        console.log('✅ Database initialization completed');
      } else {
        console.log('❌ Database initialization failed');
        return false;
      }
    } else {
      console.log('✅ Database already initialized');
    }
  }
  return true;
}

module.exports = {
  db,
  getDatabaseConnection,
  testConnection,
  initializeDatabase
};