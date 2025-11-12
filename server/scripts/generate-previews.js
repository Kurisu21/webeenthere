// scripts/generate-previews.js
// Script to generate previews for all existing websites that don't have one

const { getDatabaseConnection } = require('../database/database');
const Website = require('../models/Website');
const PreviewService = require('../services/PreviewService');

async function generatePreviews() {
  const db = await getDatabaseConnection();
  const websiteModel = new Website(db);
  const previewService = new PreviewService();

  try {
    console.log('🚀 Starting preview generation for all websites...');

    // Get all websites without previews or with empty previews
    const [websites] = await db.execute(`
      SELECT * FROM websites 
      WHERE (preview_url IS NULL OR preview_url = '') 
      AND html_content IS NOT NULL 
      AND html_content != ''
      AND is_active = 1
    `);

    console.log(`📋 Found ${websites.length} websites without previews`);

    let successCount = 0;
    let errorCount = 0;

    for (const website of websites) {
      try {
        console.log(`🖼️  Generating preview for website: ${website.title} (ID: ${website.id})`);
        
        const previewBuffer = await previewService.generatePreview(
          website.html_content,
          website.css_content || ''
        );

        await websiteModel.update(website.id, { preview_url: previewBuffer });
        successCount++;
        console.log(`✅ Preview generated for: ${website.title}`);
      } catch (error) {
        console.error(`❌ Error generating preview for website ${website.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Preview generation completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total: ${websites.length}`);

    // Close browser
    await previewService.closeBrowser();
    
    db.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error during preview generation:', error);
    await previewService.closeBrowser();
    db.end();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generatePreviews();
}

module.exports = generatePreviews;

