// routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const { getDatabaseConnection } = require('../database/database');
const SubscriptionController = require('../controllers/SubscriptionController');
const { authMiddleware } = require('../middleware/auth');

// Create controller instance
const subscriptionController = new SubscriptionController();

// Public routes
router.get('/plans', subscriptionController.getPlans.bind(subscriptionController));

// Protected routes (require authentication)
router.get('/current', authMiddleware, subscriptionController.getCurrentSubscription.bind(subscriptionController));
router.post('/subscribe', authMiddleware, subscriptionController.subscribe.bind(subscriptionController));
router.put('/cancel', authMiddleware, subscriptionController.cancelSubscription.bind(subscriptionController));
router.get('/history', authMiddleware, subscriptionController.getSubscriptionHistory.bind(subscriptionController));
router.get('/limits', authMiddleware, subscriptionController.checkLimits.bind(subscriptionController));

module.exports = router;
