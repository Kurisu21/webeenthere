const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../middleware/auth');
const ActivityController = require('../controllers/ActivityController');
const { query, param, validationResult } = require('express-validator');

// Initialize controller
const activityController = new ActivityController();

// Apply admin authentication middleware to all routes
router.use(adminAuthMiddleware);

/**
 * @route GET /api/admin/activity/logs
 * @desc Get activity logs with filtering and pagination
 * @access Admin
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
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  activityController.getActivityLogs(req, res);
});

/**
 * @route GET /api/admin/activity/stats
 * @desc Get activity statistics
 * @access Admin
 */
router.get('/stats', (req, res) => activityController.getActivityStats(req, res));

/**
 * @route GET /api/admin/activity/export
 * @desc Export activity logs
 * @access Admin
 */
router.get('/export', [
  query('format')
    .optional()
    .isIn(['csv', 'json'])
    .withMessage('Format must be csv or json'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  activityController.exportActivityLogs(req, res);
});

/**
 * @route GET /api/admin/activity/logs/:id
 * @desc Get specific activity log by ID
 * @access Admin
 */
router.get('/logs/:id', [
  param('id')
    .notEmpty()
    .withMessage('Activity log ID is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  activityController.getActivityLogById(req, res);
});

/**
 * @route GET /api/admin/activity/user/:userId
 * @desc Get activity logs for a specific user
 * @access Admin
 */
router.get('/user/:userId', [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  activityController.getUserActivityLogs(req, res);
});

/**
 * @route GET /api/admin/activity/critical
 * @desc Get recent critical activities
 * @access Admin
 */
router.get('/critical', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  activityController.getCriticalActivities(req, res);
});

/**
 * @route GET /api/admin/activity/trends
 * @desc Get activity trends
 * @access Admin
 */
router.get('/trends', [
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Period must be daily, weekly, or monthly'),
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  activityController.getActivityTrends(req, res);
});

/**
 * @route POST /api/admin/activity/rotate
 * @desc Manually rotate log files
 * @access Admin
 */
router.post('/rotate', (req, res) => activityController.rotateLogFiles(req, res));

/**
 * @route GET /api/admin/activity/metadata
 * @desc Get log file metadata
 * @access Admin
 */
router.get('/metadata', (req, res) => activityController.getLogFileMetadata(req, res));

module.exports = router;
