const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { simulateWebsiteVisits, getUserWebsites, clearWebsiteAnalytics } = require('../utils/testAnalytics');

/**
 * @route POST /api/user/analytics/test/simulate-visits
 * @desc Simulate website visits for development/testing
 * @access Private (User)
 */
router.post('/simulate-visits', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { websiteId, visitCount = 10 } = req.body;

    if (!websiteId) {
      return res.status(400).json({
        success: false,
        message: 'Website ID is required'
      });
    }

    // Verify the website belongs to the user
    const websites = await getUserWebsites(userId);
    const website = websites.find(w => w.id === websiteId);
    
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found or access denied'
      });
    }

    // Simulate visits
    await simulateWebsiteVisits(websiteId, visitCount);

    res.json({
      success: true,
      message: `Successfully simulated ${visitCount} visits for "${website.title}"`
    });

  } catch (error) {
    console.error('Error simulating visits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate visits',
      error: error.message
    });
  }
});

/**
 * @route GET /api/user/analytics/test/websites
 * @desc Get user's websites for testing
 * @access Private (User)
 */
router.get('/websites', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const websites = await getUserWebsites(userId);

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
 * @route DELETE /api/user/analytics/test/clear/:websiteId
 * @desc Clear analytics data for a website
 * @access Private (User)
 */
router.delete('/clear/:websiteId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const websiteId = parseInt(req.params.websiteId);

    // Verify the website belongs to the user
    const websites = await getUserWebsites(userId);
    const website = websites.find(w => w.id === websiteId);
    
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found or access denied'
      });
    }

    await clearWebsiteAnalytics(websiteId);

    res.json({
      success: true,
      message: `Cleared analytics data for "${website.title}"`
    });

  } catch (error) {
    console.error('Error clearing analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear analytics',
      error: error.message
    });
  }
});

module.exports = router;


