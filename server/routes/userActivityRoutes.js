const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const ActivityController = require('../controllers/ActivityController');
const { query, validationResult } = require('express-validator');

// Initialize controller
const activityController = new ActivityController();

// Apply user authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/user/activity/logs
 * @desc Get current user's activity logs with filtering and pagination
 * @access User (own data only)
 */
router.get('/logs', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('action')
    .optional()
    .isString()
    .withMessage('Action must be a string'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  activityController.getCurrentUserActivityLogs(req, res);
});

/**
 * @route GET /api/user/activity/stats
 * @desc Get current user's activity statistics
 * @access User (own data only)
 */
router.get('/stats', (req, res) => activityController.getCurrentUserActivityStats(req, res));

/**
 * @route GET /api/user/activity/export
 * @desc Export current user's activity logs
 * @access User (own data only)
 */
router.get('/export', [
  query('format')
    .optional()
    .isIn(['csv', 'json'])
    .withMessage('Format must be csv or json'),
  query('action')
    .optional()
    .isString()
    .withMessage('Action must be a string'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  activityController.exportCurrentUserActivityLogs(req, res);
});

module.exports = router;


