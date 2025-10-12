const ActivityLogger = require('../services/ActivityLogger');
const { getDatabaseConnection } = require('../database/database');

// Initialize activity logger
const activityLogger = new ActivityLogger(getDatabaseConnection());

/**
 * Middleware to automatically log admin actions
 * Should be applied after adminAuthMiddleware
 */
const activityLoggerMiddleware = (actionType = 'unknown') => {
  return async (req, res, next) => {
    try {
      // Get client IP address
      const ipAddress = req.ip || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        req.headers['x-forwarded-for']?.split(',')[0] ||
        'unknown';

      // Get user agent
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Prepare details object
      const details = {
        method: req.method,
        url: req.originalUrl,
        actionType: actionType,
        body: req.method !== 'GET' ? req.body : undefined,
        params: req.params,
        query: req.query
      };

      // Log the activity
      await activityLogger.logActivity(
        req.user.id,
        actionType,
        details,
        ipAddress,
        userAgent
      );

      next();
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Activity logging middleware error:', error);
      next();
    }
  };
};

/**
 * Middleware for specific admin actions
 */
const logUserManagement = activityLoggerMiddleware('user_management');
const logSettingsUpdate = activityLoggerMiddleware('settings_update');
const logRoleChange = activityLoggerMiddleware('role_change');
const logStatusChange = activityLoggerMiddleware('status_change');
const logProfileUpdate = activityLoggerMiddleware('profile_update');
const logSystemAction = activityLoggerMiddleware('system_action');

/**
 * Middleware to log failed login attempts
 */
const logFailedLogin = async (req, res, next) => {
  try {
    const ipAddress = req.ip || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    const details = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      reason: 'Failed login attempt'
    };

    await activityLogger.logActivity(
      null, // No user ID for failed attempts
      'failed_login_attempt',
      details,
      ipAddress,
      userAgent
    );

    next();
  } catch (error) {
    console.error('Failed login logging error:', error);
    next();
  }
};

/**
 * Middleware to log successful admin logins
 */
const logAdminLogin = async (req, res, next) => {
  try {
    const ipAddress = req.ip || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    const details = {
      method: req.method,
      url: req.originalUrl,
      loginType: 'admin',
      success: true
    };

    await activityLogger.logActivity(
      req.user.id,
      'admin_login',
      details,
      ipAddress,
      userAgent
    );

    next();
  } catch (error) {
    console.error('Admin login logging error:', error);
    next();
  }
};

/**
 * Middleware to log data export activities
 */
const logDataExport = activityLoggerMiddleware('data_export');

/**
 * Middleware to log system maintenance actions
 */
const logSystemMaintenance = activityLoggerMiddleware('system_maintenance');

/**
 * Generic middleware for any admin action
 */
const logAdminAction = (customAction) => {
  return activityLoggerMiddleware(customAction);
};

module.exports = {
  activityLoggerMiddleware,
  logUserManagement,
  logSettingsUpdate,
  logRoleChange,
  logStatusChange,
  logProfileUpdate,
  logSystemAction,
  logFailedLogin,
  logAdminLogin,
  logDataExport,
  logSystemMaintenance,
  logAdminAction
};
