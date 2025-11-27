// controllers/SubscriptionController.js
const SubscriptionService = require('../services/SubscriptionService');
const StripeService = require('../services/StripeService');
const Plan = require('../models/Plan');
const { getDatabaseConnection } = require('../database/database');

class SubscriptionController {
  constructor() {
    this.db = getDatabaseConnection();
    this.subscriptionService = new SubscriptionService(this.db);
    this.stripeService = new StripeService();
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

  // POST /api/subscriptions/create-payment-intent
  async createPaymentIntent(req, res) {
    try {
      const userId = req.user.id;
      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({
          success: false,
          error: 'Plan ID is required'
        });
      }

      // Get plan details
      const plan = await this.planModel.findById(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
      }

      // Skip payment for free plans
      if (plan.type === 'free' || plan.price === 0) {
        return res.status(400).json({
          success: false,
          error: 'Free plans do not require payment'
        });
      }

      // Get user info for metadata
      const [userRows] = await this.db.execute(
        'SELECT email, username FROM users WHERE id = ?',
        [userId]
      );
      const user = userRows[0];

      // Create payment intent
      const paymentIntent = await this.stripeService.createPaymentIntent(
        plan.price,
        'usd',
        {
          userId: userId.toString(),
          planId: planId.toString(),
          planName: plan.name,
          planType: plan.type,
          userEmail: user.email,
        }
      );

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.clientSecret,
          paymentIntentId: paymentIntent.paymentIntentId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        }
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create payment intent'
      });
    }
  }

  // POST /api/subscriptions/subscribe
  async subscribe(req, res) {
    try {
      const userId = req.user.id;
      const { planId, paymentIntentId } = req.body;

      if (!planId) {
        return res.status(400).json({
          success: false,
          error: 'Plan ID is required'
        });
      }

      // Get plan details
      const plan = await this.planModel.findById(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
      }

      // For paid plans, verify payment intent
      let paymentReference = null;
      if (plan.type !== 'free' && plan.price > 0) {
        if (!paymentIntentId) {
          return res.status(400).json({
            success: false,
            error: 'Payment Intent ID is required for paid plans'
          });
        }

        // Verify payment intent status
        const paymentIntent = await this.stripeService.getPaymentIntent(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({
            success: false,
            error: `Payment not completed. Status: ${paymentIntent.status}`
          });
        }

        paymentReference = paymentIntentId;
      }

      // Create subscription
      const { subscriptionId, invoice } = await this.subscriptionService.createSubscription(
        userId, 
        planId, 
        paymentReference
      );

      res.json({
        success: true,
        data: {
          subscriptionId,
          invoice: invoice || null,
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

      // Cancel current subscription
      await this.subscriptionService.userPlanModel.cancelSubscription(subscription.id);

      // Find free plan and assign it to user
      const freePlan = await this.planModel.findActiveByType('free');
      if (freePlan) {
        // Create free plan subscription
        await this.subscriptionService.userPlanModel.create({
          user_id: userId,
          plan_id: freePlan.id,
          start_date: new Date().toISOString().split('T')[0],
          end_date: null, // Free plan has no end date
          auto_renew: false,
          payment_reference: `CANCELLED_TO_FREE_${Date.now()}`
        });

        // Log the downgrade to free
        await this.subscriptionService.subscriptionLogModel.create({
          user_id: userId,
          plan_id: freePlan.id,
          action: 'downgraded',
          payment_status: 'completed',
          amount: 0,
          payment_reference: `CANCELLED_TO_FREE_${Date.now()}`
        });
      }

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
        message: 'Subscription cancelled successfully. You have been moved to the free plan.'
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
