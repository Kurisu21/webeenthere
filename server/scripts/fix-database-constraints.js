// Script to fix foreign key constraint issues by clearing problematic tables
// Run: node scripts/fix-database-constraints.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u875409848_jumaoas'
  });

  // Add error handler to prevent unhandled errors
  connection.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.log('🔄 Database connection lost.');
    } else if (err.fatal) {
      console.error('💥 Fatal database connection error:', err);
    }
  });

  try {
    console.log('🔧 Fixing database foreign key constraints...');
    
    // Disable foreign key checks temporarily
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear tables in correct order
    console.log('Clearing payment_transactions...');
    await connection.execute('DELETE FROM payment_transactions');
    
    console.log('Clearing subscription_logs...');
    await connection.execute('DELETE FROM subscription_logs');
    
    console.log('Clearing user_plan...');
    await connection.execute('DELETE FROM user_plan');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Database tables cleared successfully!');
    console.log('You can now restart your server and it will re-seed the data correctly.');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
  } finally {
    await connection.end();
  }
}

fixDatabase();

















