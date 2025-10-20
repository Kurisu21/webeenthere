const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const { adminAuthMiddleware } = require('../middleware/auth');

const reportController = new ReportController();

// Apply admin authentication middleware to all routes
router.use(adminAuthMiddleware);

// Report generation endpoints
router.post('/generate', reportController.generateReport.bind(reportController));
router.get('/templates', reportController.getReportTemplates.bind(reportController));

// Specific report type endpoints
router.get('/user', reportController.generateUserReport.bind(reportController));
router.get('/system', reportController.generateSystemReport.bind(reportController));
router.get('/security', reportController.generateSecurityReport.bind(reportController));
router.get('/performance', reportController.generatePerformanceReport.bind(reportController));
router.get('/website', reportController.generateWebsiteReport.bind(reportController));

// Report scheduling endpoints
router.post('/schedule', reportController.scheduleReport.bind(reportController));
router.get('/scheduled', reportController.getScheduledReports.bind(reportController));
router.delete('/scheduled/:reportId', reportController.cancelScheduledReport.bind(reportController));

// Report export and history endpoints
router.post('/export', reportController.exportReport.bind(reportController));
router.get('/history', reportController.getReportHistory.bind(reportController));

module.exports = router;

