// Script to update file_size for existing media_assets records
// Reads file sizes from the filesystem and updates the database

const { getDatabaseConnection } = require('../database/database');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function updateExistingFileSizes() {
  const db = getDatabaseConnection();
  
  try {
    console.log('🔄 Starting file_size update for existing media_assets...');
    
    // First, check if file_size column exists, if not, add it
    console.log('📋 Checking if file_size column exists...');
    try {
      const [columns] = await db.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'media_assets' 
        AND COLUMN_NAME = 'file_size'
      `);
      
      if (columns.length === 0) {
        console.log('➕ file_size column does not exist. Adding it...');
        await db.execute(`
          ALTER TABLE media_assets 
          ADD COLUMN file_size BIGINT NULL 
          COMMENT 'File size in bytes'
        `);
        console.log('✅ file_size column added successfully');
      } else {
        console.log('✅ file_size column already exists');
      }
    } catch (error) {
      console.error('❌ Error checking/adding file_size column:', error.message);
      throw error;
    }
    
    // Get all media assets (we'll update all of them, even if file_size is already set)
    const [mediaAssets] = await db.execute(
      'SELECT id, user_id, file_url FROM media_assets'
    );
    
    console.log(`📊 Found ${mediaAssets.length} media files to process`);
    
    if (mediaAssets.length === 0) {
      console.log('✅ No media files found');
      return;
    }
    
    let updated = 0;
    let failed = 0;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    for (const asset of mediaAssets) {
      try {
        // Extract filename from file_url
        // file_url format: /api/media/uploads/user_{userId}/{filename}
        const urlMatch = asset.file_url.match(/\/user_(\d+)\/(.+)$/);
        if (!urlMatch) {
          console.warn(`⚠️  Could not parse file_url for asset ${asset.id}: ${asset.file_url}`);
          failed++;
          continue;
        }
        
        const [, userId, filename] = urlMatch;
        const filePath = path.join(uploadsDir, `user_${userId}`, filename);
        
        // Check if file exists
        try {
          const stats = await fs.stat(filePath);
          const fileSize = stats.size;
          
          // Check current file_size in database
          const [current] = await db.execute(
            'SELECT file_size FROM media_assets WHERE id = ?',
            [asset.id]
          );
          
          // Only update if file_size is NULL or different (to avoid unnecessary updates)
          if (current[0].file_size !== fileSize) {
            await db.execute(
              'UPDATE media_assets SET file_size = ? WHERE id = ?',
              [fileSize, asset.id]
            );
            
            updated++;
            console.log(`✅ Updated asset ${asset.id}: ${formatFileSize(fileSize)}`);
          } else {
            console.log(`ℹ️  Asset ${asset.id} already has correct file_size: ${formatFileSize(fileSize)}`);
          }
        } catch (fileError) {
          if (fileError.code === 'ENOENT') {
            console.warn(`⚠️  File not found for asset ${asset.id}: ${filePath}`);
          } else {
            console.error(`❌ Error reading file for asset ${asset.id}:`, fileError.message);
          }
          failed++;
        }
      } catch (error) {
        console.error(`❌ Error processing asset ${asset.id}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n✅ Update complete!`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Failed/Not found: ${failed}`);
    console.log(`   - Total processed: ${mediaAssets.length}`);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Run if called directly
if (require.main === module) {
  updateExistingFileSizes()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = updateExistingFileSizes;

