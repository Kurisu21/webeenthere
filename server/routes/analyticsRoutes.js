const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/AnalyticsController');
const { adminAuthMiddleware } = require('../middleware/auth');

const analyticsController = new AnalyticsController();

// Apply admin authentication middleware to all routes
router.use(adminAuthMiddleware);

/**
 * @route GET /api/admin/analytics/dashboard
 * @desc Get dashboard metrics overview
 * @access Admin
 */
router.get('/dashboard', analyticsController.getDashboardMetrics.bind(analyticsController));

/**
 * @route GET /api/admin/analytics/users
 * @desc Get user analytics
 * @access Admin
 * @query {number} userId - Optional specific user ID
 * @query {number} period - Period in days (default: 30)
 */
router.get('/users', analyticsController.getUserAnalytics.bind(analyticsController));

/**
 * @route GET /api/admin/analytics/system
 * @desc Get system analytics
 * @access Admin
 */
router.get('/system', analyticsController.getSystemAnalytics.bind(analyticsController));

/**
 * @route GET /api/admin/analytics/websites
 * @desc Get website analytics
 * @access Admin
 * @query {number} period - Period in days (default: 30)
 * @query {number} websiteId - Optional specific website ID
 */
router.get('/websites', analyticsController.getWebsiteAnalytics.bind(analyticsController));

/**
 * @route POST /api/admin/analytics/reports
 * @desc Generate custom analytics report
 * @access Admin
 * @body {string} period - daily, weekly, monthly, yearly
 * @body {string} type - comprehensive, user, system, website, activity
 * @body {string} format - json, csv
 */
router.post('/reports', analyticsController.generateReport.bind(analyticsController));

/**
 * @route GET /api/admin/analytics/export
 * @desc Export analytics data
 * @access Admin
 * @query {string} format - json, csv
 * @query {string} startDate - Start date filter
 * @query {string} endDate - End date filter
 * @query {number} userId - User ID filter
 * @query {string} action - Action filter
 * @query {number} limit - Limit results (default: 10000)
 */
router.get('/export', analyticsController.exportAnalytics.bind(analyticsController));

/**
 * @route GET /api/admin/analytics/realtime
 * @desc Get real-time metrics
 * @access Admin
 */
router.get('/realtime', analyticsController.getRealTimeMetrics.bind(analyticsController));

/**
 * @route POST /api/admin/analytics/track-pageview
 * @desc Track page view for analytics
 * @access Admin
 * @body {number} websiteId - Website ID
 * @body {string} page - Page path (default: '/')
 * @body {string} referrer - Referrer URL
 * @body {string} userAgent - User agent string
 */
router.post('/track-pageview', analyticsController.trackPageView.bind(analyticsController));

/**
 * @route POST /api/admin/analytics/track-journey
 * @desc Track user journey
 * @access Admin
 * @body {number} userId - User ID
 * @body {string} path - Navigation path
 * @body {number} websiteId - Optional website ID
 */
router.post('/track-journey', analyticsController.trackUserJourney.bind(analyticsController));

/**
 * @route GET /api/admin/analytics/summary
 * @desc Get analytics summary
 * @access Admin
 * @query {number} period - Period in days (default: 30)
 */
router.get('/summary', analyticsController.getAnalyticsSummary.bind(analyticsController));

module.exports = router;
