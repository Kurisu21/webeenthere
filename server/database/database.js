const mysql = require('mysql2');
require('dotenv').config();

// Connection pool configuration with error handling
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Connection timeout settings
  connectTimeout: 60000, // 60 seconds
  // Enable automatic reconnection (mysql2 handles this automatically)
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool without database first
const pool = mysql.createPool(poolConfig);

// Add error handler to prevent unhandled errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.log('🔄 Database connection lost. Pool will attempt to reconnect...');
  } else if (err.fatal) {
    console.error('💥 Fatal database error:', err);
  }
});

const db = pool.promise();

// Create a new connection pool with database after initialization
let dbWithDatabase = null;

function getDatabaseConnection() {
  if (!dbWithDatabase) {
    const poolWithDb = mysql.createPool({
      ...poolConfig,
      database: process.env.DB_NAME || 'u875409848_jumaoas'
    });
    
    // Add error handler to prevent unhandled errors
    poolWithDb.on('error', (err) => {
      console.error('❌ Database pool (with DB) error:', err.message);
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('🔄 Database connection lost. Pool will attempt to reconnect...');
      } else if (err.fatal) {
        console.error('💥 Fatal database error:', err);
      }
    });
    
    dbWithDatabase = poolWithDb.promise();
  }
  return dbWithDatabase;
}

// Helper function to handle connection errors gracefully
function handleConnectionError(err, context = '') {
  const errorMessage = context ? `${context}: ${err.message}` : err.message;
  
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.warn(`⚠️  Database connection lost${context ? ` (${context})` : ''}. Will retry on next query.`);
    return false; // Not fatal, connection will be recreated
  } else if (err.code === 'ECONNREFUSED') {
    console.error(`❌ Database connection refused${context ? ` (${context})` : ''}. Is MySQL running?`);
    return true; // Fatal
  } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error(`❌ Database access denied${context ? ` (${context})` : ''}. Check credentials.`);
    return true; // Fatal
  } else if (err.fatal) {
    console.error(`💥 Fatal database error${context ? ` (${context})` : ''}:`, errorMessage);
    return true; // Fatal
  } else {
    console.error(`⚠️  Database error${context ? ` (${context})` : ''}:`, errorMessage);
    return false; // Not fatal
  }
}

// Test database connection
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ MySQL server connected successfully');
    connection.release();
    return true;
  } catch (error) {
    handleConnectionError(error, 'testConnection');
    return false;
  }
}

// Initialize database on startup
async function initializeDatabase() {
  const DatabaseORM = require('./databaseORM');
  const orm = new DatabaseORM();
  
  // Check if database needs initialization
  let status;
  try {
    status = await orm.getStatus();
  } catch (error) {
    // If status check fails (timeout, connection issues), assume database exists
    // and skip initialization to avoid connection errors
    console.log('⚠️  Could not check database status (connection issue). Assuming database exists and skipping initialization.');
    return true;
  }
  
  // If status is null/undefined, assume database exists and skip initialization
  if (!status) {
    console.log('⚠️  Could not determine database status. Assuming database exists and skipping initialization.');
    return true;
  }
  
  if (!status.database) {
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
    // Database exists - check if all required tables exist
    const requiredTables = ['users', 'templates', 'websites', 'ai_prompts', 'media_assets', 'website_analytics', 'custom_blocks', 'plans', 'user_plan', 'subscription_logs', 'payment_transactions', 'invoices', 'feedback', 'feedback_responses', 'forum_categories', 'forum_threads', 'forum_replies', 'forum_thread_likes', 'forum_reply_likes', 'help_categories', 'help_articles', 'help_article_votes', 'support_tickets', 'support_messages', 'activity_logs', 'system_settings'];
    const allTablesExist = requiredTables.every(tableName => {
      return status.tables && status.tables[tableName] && status.tables[tableName].exists;
    });
    
    if (!allTablesExist) {
      console.log('🔧 Database exists but some tables are missing, initializing tables...');
      const success = await orm.initialize();
      if (success) {
        console.log('✅ Database initialization completed');
      } else {
        console.log('❌ Database initialization failed');
        return false;
      }
    } else {
      // Database and all tables exist - skip all initialization
      console.log('✅ Database and all tables already exist. Skipping initialization.');
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