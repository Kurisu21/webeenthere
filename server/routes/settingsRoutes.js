const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../middleware/auth');
const SettingsController = require('../controllers/SettingsController');
const { body, validationResult } = require('express-validator');

// Initialize controller
const settingsController = new SettingsController();

// Apply admin authentication middleware to all routes
router.use(adminAuthMiddleware);

/**
 * @route GET /api/admin/settings/all
 * @desc Get all settings (system, features, email)
 * @access Admin
 */
router.get('/all', (req, res) => settingsController.getAllSettings(req, res));

/**
 * @route GET /api/admin/settings/metadata
 * @desc Get settings file metadata
 * @access Admin
 */
router.get('/metadata', (req, res) => settingsController.getSettingsMetadata(req, res));

// System Settings Routes

/**
 * @route GET /api/admin/settings/system
 * @desc Get system settings
 * @access Admin
 */
router.get('/system', (req, res) => settingsController.getSystemSettings(req, res));

/**
 * @route PUT /api/admin/settings/system
 * @desc Update system settings
 * @access Admin
 */
router.put('/system', [
  body('appName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('App name must be between 1 and 100 characters'),
  body('maintenanceMode')
    .optional()
    .isBoolean()
    .withMessage('Maintenance mode must be a boolean'),
  body('registrationEnabled')
    .optional()
    .isBoolean()
    .withMessage('Registration enabled must be a boolean'),
  body('maxUploadSizeMB')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max upload size must be between 1 and 1000 MB')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  settingsController.updateSystemSettings(req, res);
});

// Feature Flags Routes

/**
 * @route GET /api/admin/settings/features
 * @desc Get feature flags
 * @access Admin
 */
router.get('/features', (req, res) => settingsController.getFeatureFlags(req, res));

/**
 * @route PUT /api/admin/settings/features
 * @desc Update feature flags
 * @access Admin
 */
router.put('/features', [
  body('aiFeatures')
    .optional()
    .isBoolean()
    .withMessage('AI features must be a boolean'),
  body('templates')
    .optional()
    .isBoolean()
    .withMessage('Templates must be a boolean'),
  body('analytics')
    .optional()
    .isBoolean()
    .withMessage('Analytics must be a boolean'),
  body('forum')
    .optional()
    .isBoolean()
    .withMessage('Forum must be a boolean'),
  body('supportTickets')
    .optional()
    .isBoolean()
    .withMessage('Support tickets must be a boolean')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  settingsController.updateFeatureFlags(req, res);
});

// Email Configuration Routes

/**
 * @route GET /api/admin/settings/email
 * @desc Get email configuration
 * @access Admin
 */
router.get('/email', (req, res) => settingsController.getEmailConfig(req, res));

/**
 * @route PUT /api/admin/settings/email
 * @desc Update email configuration
 * @access Admin
 */
router.put('/email', [
  body('smtpHost')
    .optional()
    .isLength({ min: 1 })
    .withMessage('SMTP host is required'),
  body('smtpPort')
    .optional()
    .isInt({ min: 1, max: 65535 })
    .withMessage('SMTP port must be between 1 and 65535'),
  body('smtpUser')
    .optional()
    .isLength({ min: 1 })
    .withMessage('SMTP user is required'),
  body('smtpPassword')
    .optional()
    .isLength({ min: 1 })
    .withMessage('SMTP password is required'),
  body('fromEmail')
    .optional()
    .isEmail()
    .withMessage('From email must be a valid email address'),
  body('fromName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('From name must be between 1 and 100 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  settingsController.updateEmailConfig(req, res);
});

/**
 * @route POST /api/admin/settings/email/test
 * @desc Test email configuration
 * @access Admin
 */
router.post('/email/test', (req, res) => settingsController.testEmailConfig(req, res));

module.exports = router;
