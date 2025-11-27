// routes/stripeWebhookRoutes.js
const express = require('express');
const router = express.Router();
const StripeWebhookController = require('../controllers/StripeWebhookController');

const webhookController = new StripeWebhookController();

// Stripe webhook endpoint
// Note: Raw body parsing is handled in app.js before this route
router.post(
  '/webhook',
  webhookController.handleWebhook.bind(webhookController)
);

module.exports = router;

