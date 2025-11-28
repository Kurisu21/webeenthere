// Migration script to add file_size column to media_assets table
// This script adds the file_size column if it doesn't exist

const { getDatabaseConnection } = require('../database/database');
require('dotenv').config();

async function migrateFileSizeColumn() {
  const db = getDatabaseConnection();
  
  try {
    console.log('🔄 Starting file_size column migration for media_assets...');
    
    // Check if column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'media_assets' 
      AND COLUMN_NAME = 'file_size'
    `);
    
    if (columns.length > 0) {
      console.log('✅ file_size column already exists');
      return;
    }
    
    // Add the column
    await db.execute(`
      ALTER TABLE media_assets 
      ADD COLUMN file_size BIGINT NULL 
      COMMENT 'File size in bytes'
    `);
    
    console.log('✅ file_size column added successfully');
    console.log('ℹ️  Note: Existing records will have NULL file_size. New uploads will include file size.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateFileSizeColumn()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateFileSizeColumn;

