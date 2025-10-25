const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const WebsiteAnalyticsService = require('../services/WebsiteAnalyticsService');

/**
 * @route GET /api/user/analytics/websites
 * @desc Get user's website performance metrics
 * @access Private (User)
 */
router.get('/websites', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { websiteId } = req.query; // Optional: filter by specific website

    // Get basic websites data
    const { getDatabaseConnection } = require('../database/database');
    const connection = await getDatabaseConnection();
    
    const [userWebsites] = await connection.execute(
      `SELECT 
         w.id,
         w.title,
         w.slug,
         w.is_published,
         w.created_at,
         w.updated_at
       FROM websites w
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );

    // Get real analytics data for each website
    const websiteIds = userWebsites.map(w => w.id);
    let totalViews = 0;
    let totalUniqueVisitors = 0;
    let avgViewsPerDay = 0;

    if (websiteIds.length > 0) {
      const placeholders = websiteIds.map(() => '?').join(',');
      
      // Get total views and unique visitors
      const [analyticsStats] = await connection.execute(
        `SELECT 
           COUNT(*) as total_views,
           COUNT(DISTINCT visitor_id) as unique_visitors
         FROM website_analytics 
         WHERE website_id IN (${placeholders})`,
        websiteIds
      );

      totalViews = analyticsStats[0].total_views || 0;
      totalUniqueVisitors = analyticsStats[0].unique_visitors || 0;

      // Calculate average views per day (last 30 days)
      const [dailyStats] = await connection.execute(
        `SELECT 
           COUNT(*) as views_last_30_days
         FROM website_analytics 
         WHERE website_id IN (${placeholders})
         AND visit_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        websiteIds
      );

      avgViewsPerDay = Math.round((dailyStats[0].views_last_30_days || 0) / 30);
    }

    // Update websites with individual stats
    for (let website of userWebsites) {
      const [websiteStats] = await connection.execute(
        `SELECT 
           COUNT(*) as total_views,
           COUNT(DISTINCT visitor_id) as unique_visitors,
           MAX(visit_time) as last_visit
         FROM website_analytics 
         WHERE website_id = ?`,
        [website.id]
      );

      website.total_views = websiteStats[0].total_views || 0;
      website.unique_visitors = websiteStats[0].unique_visitors || 0;
      website.last_visit = websiteStats[0].last_visit;
    }

    const basicData = {
      websites: userWebsites,
      performance: {
        totalViews,
        uniqueVisitors: totalUniqueVisitors,
        avgViewsPerDay
      }
    };

    res.json({
      success: true,
      data: basicData
    });
  } catch (error) {
    console.error('Error getting user website analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get website analytics',
      error: error.message
    });
  }
});

/**
 * @route GET /api/user/analytics/websites/:websiteId
 * @desc Get specific website performance metrics for user
 * @access Private (User)
 */
router.get('/websites/:websiteId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const websiteId = parseInt(req.params.websiteId);

    // Verify the website belongs to the user
    const websitePerformance = await WebsiteAnalyticsService.getUserWebsitePerformance(userId, websiteId);
    
    if (!websitePerformance.websites.find(w => w.id === websiteId)) {
      return res.status(404).json({
        success: false,
        message: 'Website not found or access denied'
      });
    }

    res.json({
      success: true,
      data: websitePerformance
    });
  } catch (error) {
    console.error('Error getting website analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get website analytics',
      error: error.message
    });
  }
});

module.exports = router;
