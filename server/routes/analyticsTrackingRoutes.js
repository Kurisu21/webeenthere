const express = require('express');
const router = express.Router();
const { getDatabaseConnection } = require('../database/database');

/**
 * @route POST /api/analytics/track-visit
 * @desc Track a website visit for analytics
 * @access Public (no authentication required)
 */
router.post('/track-visit', async (req, res) => {
  try {
    console.log('🔍 Received tracking request:', req.body);
    
    const { slug, userAgent, referrer, timestamp, url, visitorId, sessionId } = req.body;

    if (!slug) {
      console.log('❌ No slug provided');
      return res.status(400).json({
        success: false,
        message: 'Website slug is required'
      });
    }

    const connection = await getDatabaseConnection();

    // First, get the website ID from the slug
    const [websites] = await connection.execute(
      'SELECT id FROM websites WHERE slug = ? AND is_published = 1',
      [slug]
    );

    console.log('🔍 Found websites:', websites);

    if (websites.length === 0) {
      console.log('❌ Website not found or not published:', slug);
      return res.status(404).json({
        success: false,
        message: 'Website not found or not published'
      });
    }

    const websiteId = websites[0].id;
    console.log('✅ Website ID found:', websiteId);

    // Get visitor IP
    const visitorIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    
    // Generate visitor fingerprint for better unique visitor identification
    const visitorFingerprint = generateVisitorFingerprint(userAgent, visitorIp);
    
    // Use visitorId if provided (from client-side), otherwise use fingerprint
    const finalVisitorId = visitorId || visitorFingerprint;
    
    console.log('📊 Using visitor ID:', finalVisitorId);
    console.log('📊 Session ID:', sessionId);

    // Check if this is a returning visitor (same visitor_id within last 30 days)
    const [existingVisitor] = await connection.execute(
      `SELECT id FROM website_analytics 
       WHERE website_id = ? AND visitor_id = ? 
       AND visit_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       LIMIT 1`,
      [websiteId, finalVisitorId]
    );

    const isReturningVisitor = existingVisitor.length > 0;
    console.log('🔄 Is returning visitor:', isReturningVisitor);

    // Insert the visit record with visitor_id and session_id
    const insertResult = await connection.execute(
      `INSERT INTO website_analytics 
       (website_id, visitor_ip, visitor_id, session_id, user_agent, referrer, visit_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        websiteId,
        visitorIp,
        finalVisitorId,
        sessionId || null,
        userAgent || 'Unknown',
        referrer || null,
        timestamp || new Date()
      ]
    );

    console.log('✅ Visit inserted successfully:', insertResult);

    res.json({
      success: true,
      message: 'Visit tracked successfully',
      websiteId: websiteId,
      visitorId: finalVisitorId,
      sessionId: sessionId,
      isReturningVisitor: isReturningVisitor
    });

  } catch (error) {
    console.error('❌ Error tracking visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track visit',
      error: error.message
    });
  }
});

// Helper function to generate visitor fingerprint
function generateVisitorFingerprint(userAgent, ip) {
  const crypto = require('crypto');
  
  // Create a hash based on user agent and IP
  const fingerprint = crypto
    .createHash('md5')
    .update(`${userAgent}-${ip}`)
    .digest('hex')
    .substring(0, 16); // Use first 16 characters for shorter ID
    
  return fingerprint;
}

/**
 * @route GET /api/analytics/website-stats/:slug
 * @desc Get website statistics by slug
 * @access Public (for public websites)
 */
router.get('/website-stats/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const connection = await getDatabaseConnection();

    // Get website info
    const [websites] = await connection.execute(
      'SELECT id, title, slug FROM websites WHERE slug = ? AND is_published = 1',
      [slug]
    );

    if (websites.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    const websiteId = websites[0].id;

    // Get analytics data
    const [stats] = await connection.execute(
      `SELECT 
         COUNT(*) as total_views,
         COUNT(DISTINCT visitor_ip) as unique_visitors,
         MAX(visit_time) as last_visit
       FROM website_analytics 
       WHERE website_id = ?`,
      [websiteId]
    );

    res.json({
      success: true,
      data: {
        website: websites[0],
        stats: stats[0]
      }
    });

  } catch (error) {
    console.error('Error getting website stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get website stats',
      error: error.message
    });
  }
});

/**
 * @route GET /api/analytics/debug/websites
 * @desc Debug endpoint to check all websites and their status
 * @access Public (for debugging)
 */
router.get('/debug/websites', async (req, res) => {
  try {
    const connection = await getDatabaseConnection();
    
    const [websites] = await connection.execute(
      'SELECT id, title, slug, is_published, created_at FROM websites ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: websites
    });
  } catch (error) {
    console.error('Error getting websites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get websites',
      error: error.message
    });
  }
});

/**
 * @route POST /api/analytics/test-visit
 * @desc Test endpoint to manually insert a visit record
 * @access Public (for debugging)
 */
router.post('/test-visit', async (req, res) => {
  try {
    const { slug } = req.body;
    const connection = await getDatabaseConnection();
    
    // Find website
    const [websites] = await connection.execute(
      'SELECT id FROM websites WHERE slug = ? AND is_published = 1',
      [slug]
    );
    
    if (websites.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Website not found or not published'
      });
    }
    
    const websiteId = websites[0].id;
    const mockIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
    
    // Insert test visit
    const result = await connection.execute(
      'INSERT INTO website_analytics (website_id, visitor_ip, user_agent, referrer, visit_time) VALUES (?, ?, ?, ?, ?)',
      [websiteId, mockIp, 'Test User Agent', 'Test Referrer', new Date()]
    );
    
    res.json({
      success: true,
      message: 'Test visit inserted',
      websiteId: websiteId,
      visitId: result[0].insertId,
      visitorIp: mockIp
    });
  } catch (error) {
    console.error('Error inserting test visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to insert test visit',
      error: error.message
    });
  }
});

/**
 * @route GET /api/analytics/debug/db-structure
 * @desc Debug endpoint to check database structure
 * @access Public (for debugging)
 */
router.get('/debug/db-structure', async (req, res) => {
  try {
    const connection = await getDatabaseConnection();
    
    // Check if website_analytics table exists and get its structure
    const [tableInfo] = await connection.execute(
      'DESCRIBE website_analytics'
    );
    
    // Check if there are any records
    const [recordCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM website_analytics'
    );
    
    res.json({
      success: true,
      data: {
        tableStructure: tableInfo,
        recordCount: recordCount[0].count
      }
    });
  } catch (error) {
    console.error('Error checking database structure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check database structure',
      error: error.message
    });
  }
});

module.exports = router;
