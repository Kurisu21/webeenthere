// server.js
require('dotenv').config();
const app = require('./app');
const { testConnection, initializeDatabase } = require('./database/database');
const { createBackup, scheduleBackups } = require('./backupService');
const TokenStorage = require('./services/TokenStorage');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      console.log('💡 Make sure MySQL is running (XAMPP)');
      process.exit(1);
    }

    // Initialize database if needed (auto-initialization)
    console.log('🔧 Auto-checking database initialization...');
    const initSuccess = await initializeDatabase();
    
    if (!initSuccess) {
      console.error('❌ Database initialization failed');
      process.exit(1);
    }

    // Create initial backup
    console.log('💾 Creating initial database backup...');
    await createBackup();

    // Schedule regular backups (every 6 hours)
    scheduleBackups();

    // Initialize token storage and cleanup expired tokens
    console.log('🧹 Initializing token storage...');
    const tokenStorage = new TokenStorage();
    await tokenStorage.initializeAndCleanup();
    
    // Schedule token cleanup every hour
    setInterval(async () => {
      await tokenStorage.cleanup();
      console.log('🧹 Scheduled token cleanup completed');
    }, 60 * 60 * 1000); // 1 hour

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: webeenthere`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Auto-backup: Every 6 hours`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 