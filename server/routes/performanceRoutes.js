const express = require('express');
const { body, validationResult } = require('express-validator');
const PerformanceController = require('../controllers/PerformanceController');
const { adminAuthMiddleware } = require('../middleware/auth');

const router = express.Router();
const performanceController = new PerformanceController();

// Apply admin authentication middleware to all routes
router.use(adminAuthMiddleware);

/**
 * @route GET /api/admin/performance/metrics
 * @desc Get overall performance metrics
 * @access Admin
 */
router.get('/metrics', (req, res) => performanceController.getPerformanceMetrics(req, res));

/**
 * @route GET /api/admin/performance/resources
 * @desc Get system resource usage
 * @access Admin
 */
router.get('/resources', (req, res) => performanceController.getSystemResources(req, res));

/**
 * @route GET /api/admin/performance/api
 * @desc Get API performance metrics
 * @access Admin
 */
router.get('/api', (req, res) => performanceController.getAPIPerformance(req, res));

/**
 * @route GET /api/admin/performance/database
 * @desc Get database performance metrics
 * @access Admin
 */
router.get('/database', (req, res) => performanceController.getDatabasePerformance(req, res));

/**
 * @route GET /api/admin/performance/alerts
 * @desc Get performance alerts
 * @access Admin
 */
router.get('/alerts', (req, res) => performanceController.getPerformanceAlerts(req, res));

/**
 * @route POST /api/admin/performance/optimize
 * @desc Optimize system performance
 * @access Admin
 */
router.post('/optimize', (req, res) => performanceController.optimizePerformance(req, res));

/**
 * @route GET /api/admin/performance/history
 * @desc Get performance history
 * @access Admin
 */
router.get('/history', (req, res) => performanceController.getPerformanceHistory(req, res));

/**
 * @route GET /api/admin/performance/system-info
 * @desc Get system information
 * @access Admin
 */
router.get('/system-info', (req, res) => performanceController.getSystemInfo(req, res));

/**
 * @route GET /api/admin/performance/thresholds
 * @desc Get performance thresholds
 * @access Admin
 */
router.get('/thresholds', (req, res) => performanceController.getPerformanceThresholds(req, res));

/**
 * @route PUT /api/admin/performance/thresholds
 * @desc Update performance thresholds
 * @access Admin
 */
router.put('/thresholds', [
  body('thresholds')
    .isObject()
    .withMessage('Thresholds must be an object'),
  body('thresholds.cpu')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('CPU threshold must be between 0 and 100'),
  body('thresholds.memory')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Memory threshold must be between 0 and 100'),
  body('thresholds.disk')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Disk threshold must be between 0 and 100'),
  body('thresholds.responseTime')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Response time threshold must be a positive number'),
  body('thresholds.dbConnections')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Database connections threshold must be between 0 and 100')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  performanceController.updatePerformanceThresholds(req, res);
});

/**
 * @route GET /api/admin/performance/realtime
 * @desc Get real-time performance metrics
 * @access Admin
 */
router.get('/realtime', (req, res) => performanceController.getRealTimeMetrics(req, res));

/**
 * @route GET /api/admin/performance/report
 * @desc Generate performance report
 * @access Admin
 */
router.get('/report', (req, res) => performanceController.generatePerformanceReport(req, res));

/**
 * @route GET /api/admin/performance/cpu
 * @desc Get CPU metrics only
 * @access Admin
 */
router.get('/cpu', async (req, res) => {
  try {
    const cpuMetrics = await performanceController.performanceService.monitorCPUUsage();
    res.json({ 
      success: true, 
      cpu: cpuMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get CPU metrics error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve CPU metrics' });
  }
});

/**
 * @route GET /api/admin/performance/memory
 * @desc Get memory metrics only
 * @access Admin
 */
router.get('/memory', async (req, res) => {
  try {
    const memoryMetrics = await performanceController.performanceService.monitorMemoryUsage();
    res.json({ 
      success: true, 
      memory: memoryMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get memory metrics error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve memory metrics' });
  }
});

/**
 * @route GET /api/admin/performance/disk
 * @desc Get disk metrics only
 * @access Admin
 */
router.get('/disk', async (req, res) => {
  try {
    const diskMetrics = await performanceController.performanceService.monitorDiskUsage();
    res.json({ 
      success: true, 
      disk: diskMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get disk metrics error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve disk metrics' });
  }
});

/**
 * @route GET /api/admin/performance/network
 * @desc Get network metrics only
 * @access Admin
 */
router.get('/network', async (req, res) => {
  try {
    const networkMetrics = await performanceController.performanceService.monitorNetworkUsage();
    res.json({ 
      success: true, 
      network: networkMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get network metrics error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve network metrics' });
  }
});

/**
 * @route GET /api/admin/performance/uptime
 * @desc Get system uptime
 * @access Admin
 */
router.get('/uptime', async (req, res) => {
  try {
    const uptime = await performanceController.performanceService.getSystemUptime();
    res.json({ 
      success: true, 
      uptime: uptime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get uptime error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve uptime information' });
  }
});

module.exports = router;

