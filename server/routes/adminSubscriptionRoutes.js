// routes/adminSubscriptionRoutes.js
const express = require('express');
const router = express.Router();
const { getDatabaseConnection } = require('../database/database');
const AdminSubscriptionController = require('../controllers/AdminSubscriptionController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// Create controller instance
const adminSubscriptionController = new AdminSubscriptionController();

// All routes require admin authentication
router.use(adminAuthMiddleware);

// Subscription management routes
router.get('/', adminSubscriptionController.getAllSubscriptions.bind(adminSubscriptionController));
router.post('/assign', adminSubscriptionController.assignPlan.bind(adminSubscriptionController));
router.get('/logs', adminSubscriptionController.getSubscriptionLogs.bind(adminSubscriptionController));
router.get('/transactions', adminSubscriptionController.getPaymentTransactions.bind(adminSubscriptionController));
router.get('/user/:userId', adminSubscriptionController.getUserSubscriptionDetails.bind(adminSubscriptionController));
router.get('/stats', adminSubscriptionController.getSubscriptionStats.bind(adminSubscriptionController));

module.exports = router;
