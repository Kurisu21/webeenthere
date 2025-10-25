// Migration script to add visitor_id and session_id columns to website_analytics table
const { getDatabaseConnection } = require('../database/database');

async function migrateAnalyticsTable() {
  const connection = await getDatabaseConnection();
  
  try {
    console.log('🔄 Starting analytics table migration...');
    
    // Check if visitor_id column exists
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'website_analytics' AND COLUMN_NAME = 'visitor_id'"
    );
    
    if (columns.length === 0) {
      console.log('➕ Adding visitor_id column...');
      await connection.execute(
        'ALTER TABLE website_analytics ADD COLUMN visitor_id VARCHAR(50) AFTER visitor_ip'
      );
      
      // Add index for visitor_id
      await connection.execute(
        'ALTER TABLE website_analytics ADD INDEX idx_visitor_id (visitor_id)'
      );
      
      console.log('✅ visitor_id column added successfully');
    } else {
      console.log('ℹ️ visitor_id column already exists');
    }
    
    // Check if session_id column exists
    const [sessionColumns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'website_analytics' AND COLUMN_NAME = 'session_id'"
    );
    
    if (sessionColumns.length === 0) {
      console.log('➕ Adding session_id column...');
      await connection.execute(
        'ALTER TABLE website_analytics ADD COLUMN session_id VARCHAR(50) AFTER visitor_id'
      );
      
      // Add index for session_id
      await connection.execute(
        'ALTER TABLE website_analytics ADD INDEX idx_session_id (session_id)'
      );
      
      console.log('✅ session_id column added successfully');
    } else {
      console.log('ℹ️ session_id column already exists');
    }
    
    // Check if visit_time index exists
    const [timeIndexes] = await connection.execute(
      "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_NAME = 'website_analytics' AND INDEX_NAME = 'idx_visit_time'"
    );
    
    if (timeIndexes.length === 0) {
      console.log('➕ Adding visit_time index...');
      await connection.execute(
        'ALTER TABLE website_analytics ADD INDEX idx_visit_time (visit_time)'
      );
      console.log('✅ visit_time index added successfully');
    } else {
      console.log('ℹ️ visit_time index already exists');
    }
    
    // Generate visitor_id for existing records that don't have one
    console.log('🔄 Generating visitor_id for existing records...');
    const [existingRecords] = await connection.execute(
      'SELECT id, visitor_ip, user_agent FROM website_analytics WHERE visitor_id IS NULL'
    );
    
    if (existingRecords.length > 0) {
      console.log(`📊 Found ${existingRecords.length} records without visitor_id`);
      
      for (const record of existingRecords) {
        // Generate a visitor_id based on IP and user agent
        const crypto = require('crypto');
        const visitorId = crypto
          .createHash('md5')
          .update(`${record.user_agent || 'unknown'}-${record.visitor_ip || 'unknown'}`)
          .digest('hex')
          .substring(0, 16);
        
        await connection.execute(
          'UPDATE website_analytics SET visitor_id = ? WHERE id = ?',
          [visitorId, record.id]
        );
      }
      
      console.log('✅ Generated visitor_id for existing records');
    } else {
      console.log('ℹ️ All records already have visitor_id');
    }
    
    console.log('🎉 Analytics table migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateAnalyticsTable()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateAnalyticsTable;
