// controllers/SubscriptionController.js
const SubscriptionService = require('../services/SubscriptionService');
const Plan = require('../models/Plan');
const { getDatabaseConnection } = require('../database/database');

class SubscriptionController {
  constructor() {
    this.db = getDatabaseConnection();
    this.subscriptionService = new SubscriptionService(this.db);
    this.planModel = new Plan(this.db);
  }

  // GET /api/subscriptions/plans
  async getPlans(req, res) {
    try {
      const plans = await this.planModel.findAll();
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch plans'
      });
    }
  }

  // GET /api/subscriptions/current
  async getCurrentSubscription(req, res) {
    try {
      const userId = req.user.id;
      const subscription = await this.subscriptionService.userPlanModel.findByUserId(userId);
      
      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch current subscription'
      });
    }
  }

  // POST /api/subscriptions/subscribe
  async subscribe(req, res) {
    try {
      const userId = req.user.id;
      const { planId, paymentReference } = req.body;

      if (!planId) {
        return res.status(400).json({
          success: false,
          error: 'Plan ID is required'
        });
      }

      const subscriptionId = await this.subscriptionService.createSubscription(
        userId, 
        planId, 
        paymentReference
      );

      res.json({
        success: true,
        data: {
          subscriptionId,
          message: 'Subscription created successfully'
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create subscription'
      });
    }
  }

  // PUT /api/subscriptions/cancel
  async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;
      const subscription = await this.subscriptionService.userPlanModel.findByUserId(userId);
      
      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'No active subscription found'
        });
      }

      await this.subscriptionService.userPlanModel.cancelSubscription(subscription.id);

      // Log cancellation
      await this.subscriptionService.subscriptionLogModel.create({
        user_id: userId,
        plan_id: subscription.plan_id,
        action: 'cancelled',
        payment_status: 'completed',
        amount: 0,
        payment_reference: `CANCELLED_${Date.now()}`
      });

      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription'
      });
    }
  }

  // GET /api/subscriptions/history
  async getSubscriptionHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 50 } = req.query;
      
      const logs = await this.subscriptionService.subscriptionLogModel.findByUserId(userId, parseInt(limit));
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription history'
      });
    }
  }

  // GET /api/subscriptions/limits
  async checkLimits(req, res) {
    try {
      const userId = req.user.id;
      
      const [websiteLimits, aiChatLimits] = await Promise.all([
        this.subscriptionService.checkWebsiteLimit(userId),
        this.subscriptionService.checkAiChatLimit(userId)
      ]);

      res.json({
        success: true,
        data: {
          website: websiteLimits,
          aiChat: aiChatLimits
        }
      });
    } catch (error) {
      console.error('Error checking limits:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check limits'
      });
    }
  }

  // GET /api/subscriptions/usage
  async getUsage(req, res) {
    try {
      const userId = req.user.id;
      const usage = await this.subscriptionService.getWebsiteUsage(userId);
      return res.json({ success: true, ...usage });
    } catch (error) {
      console.error('Error getting usage:', error);
      return res.status(500).json({ success: false, error: 'Failed to get usage' });
    }
  }
}

module.exports = SubscriptionController;
