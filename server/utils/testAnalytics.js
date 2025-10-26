// Development utility to simulate website visits
// This file helps you test website analytics in development mode

const { getDatabaseConnection } = require('../database/database');

/**
 * Simulate website visits for development/testing
 * @param {number} websiteId - The website ID to add visits to
 * @param {number} visitCount - Number of visits to simulate (default: 10)
 */
async function simulateWebsiteVisits(websiteId, visitCount = 10) {
  const connection = await getDatabaseConnection();
  
  try {
    console.log(`Simulating ${visitCount} visits for website ID: ${websiteId}`);
    
    // Generate random visitor data
    const visitors = [];
    for (let i = 0; i < visitCount; i++) {
      visitors.push([
        websiteId,
        `192.168.1.${Math.floor(Math.random() * 255)}`, // Random IP
        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`, // User agent
        Math.random() > 0.5 ? 'https://google.com' : null, // Random referrer
        new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last week
      ]);
    }
    
    // Insert visits into database
    const query = `
      INSERT INTO website_analytics (website_id, visitor_ip, user_agent, referrer, visit_time) 
      VALUES ?
    `;
    
    await connection.execute(query, [visitors]);
    
    console.log(`✅ Successfully added ${visitCount} visits to website ${websiteId}`);
    
    // Show updated stats
    const [stats] = await connection.execute(
      `SELECT 
         COUNT(*) as total_views,
         COUNT(DISTINCT visitor_ip) as unique_visitors
       FROM website_analytics 
       WHERE website_id = ?`,
      [websiteId]
    );
    
    console.log(`📊 Updated stats: ${stats[0].total_views} total views, ${stats[0].unique_visitors} unique visitors`);
    
  } catch (error) {
    console.error('Error simulating visits:', error);
  }
}

/**
 * Get all user websites for easy testing
 */
async function getUserWebsites(userId) {
  const connection = await getDatabaseConnection();
  
  try {
    const [websites] = await connection.execute(
      `SELECT id, title, slug, is_published FROM websites WHERE user_id = ?`,
      [userId]
    );
    
    console.log('📋 User websites:');
    websites.forEach(website => {
      console.log(`  - ID: ${website.id}, Title: "${website.title}", Published: ${website.is_published}`);
    });
    
    return websites;
  } catch (error) {
    console.error('Error getting websites:', error);
    return [];
  }
}

/**
 * Clear all analytics data for a website (for testing)
 */
async function clearWebsiteAnalytics(websiteId) {
  const connection = await getDatabaseConnection();
  
  try {
    await connection.execute(
      'DELETE FROM website_analytics WHERE website_id = ?',
      [websiteId]
    );
    
    console.log(`🗑️ Cleared all analytics data for website ${websiteId}`);
  } catch (error) {
    console.error('Error clearing analytics:', error);
  }
}

// Example usage:
async function testAnalytics() {
  console.log('🧪 Testing Website Analytics...\n');
  
  // Get websites for user ID 1 (change this to your user ID)
  const websites = await getUserWebsites(1);
  
  if (websites.length > 0) {
    const websiteId = websites[0].id;
    
    // Clear existing data
    await clearWebsiteAnalytics(websiteId);
    
    // Simulate visits
    await simulateWebsiteVisits(websiteId, 25);
    
    console.log('\n🎉 Test completed! Check your website performance dashboard.');
  } else {
    console.log('❌ No websites found. Create a website first.');
  }
}

// Export functions for use in other files
module.exports = {
  simulateWebsiteVisits,
  getUserWebsites,
  clearWebsiteAnalytics,
  testAnalytics
};

// Run test if this file is executed directly
if (require.main === module) {
  testAnalytics().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}



