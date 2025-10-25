// services/SubscriptionService.js
const Plan = require('../models/Plan');
const UserPlan = require('../models/UserPlan');
const SubscriptionLog = require('../models/SubscriptionLog');
const PaymentTransaction = require('../models/PaymentTransaction');

class SubscriptionService {
  constructor(db) {
    this.db = db;
    this.planModel = new Plan(db);
    this.userPlanModel = new UserPlan(db);
    this.subscriptionLogModel = new SubscriptionLog(db);
    this.paymentTransactionModel = new PaymentTransaction(db);
  }

  async createSubscription(userId, planId, paymentReference = null) {
    const plan = await this.planModel.findById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if user already has an active subscription
    const currentSubscription = await this.userPlanModel.findByUserId(userId);
    
    let action = 'created';
    if (currentSubscription) {
      // Determine if this is an upgrade or downgrade
      const currentPlan = await this.planModel.findById(currentSubscription.plan_id);
      if (currentPlan.price < plan.price) {
        action = 'upgraded';
      } else if (currentPlan.price > plan.price) {
        action = 'downgraded';
      }
      
      // End current subscription
      await this.userPlanModel.cancelSubscription(currentSubscription.id);
    }

    // Calculate end date based on plan type
    let endDate = null;
    if (plan.type === 'monthly') {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.type === 'yearly') {
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create new subscription
    const subscriptionId = await this.userPlanModel.create({
      user_id: userId,
      plan_id: planId,
      start_date: new Date().toISOString().split('T')[0],
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      auto_renew: plan.type !== 'free',
      payment_reference: paymentReference
    });

    // Create subscription log
    await this.subscriptionLogModel.create({
      user_id: userId,
      plan_id: planId,
      action: action,
      payment_status: plan.type === 'free' ? 'completed' : 'pending',
      amount: plan.price,
      payment_reference: paymentReference
    });

    // Create payment transaction if not free
    if (plan.type !== 'free') {
      const transactionRef = paymentReference || `TXN_${Date.now()}_${userId}`;
      await this.paymentTransactionModel.create({
        user_id: userId,
        plan_id: planId,
        amount: plan.price,
        status: 'completed', // Mock payment - always succeeds
        transaction_reference: transactionRef
      });
    }

    return subscriptionId;
  }

  async checkWebsiteLimit(userId) {
    const subscription = await this.userPlanModel.findByUserId(userId);
    if (!subscription) {
      // Default to free plan limits
      return { canCreate: false, remaining: 0, limit: 3 };
    }

    // If unlimited (null limit), return true
    if (subscription.website_limit === null) {
      return { canCreate: true, remaining: -1, limit: -1 }; // -1 means unlimited
    }

    // Count user's websites
    const [result] = await this.db.execute(
      'SELECT COUNT(*) as count FROM websites WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );
    const websiteCount = result[0].count;
    const remaining = subscription.website_limit - websiteCount;

    return {
      canCreate: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: subscription.website_limit,
      used: websiteCount
    };
  }

  async checkAiChatLimit(userId) {
    const subscription = await this.userPlanModel.findByUserId(userId);
    if (!subscription) {
      // Default to free plan limits
      return { canUse: false, remaining: 0, limit: 200 };
    }

    // If unlimited (null limit), return true
    if (subscription.ai_chat_limit === null) {
      return { canUse: true, remaining: -1, limit: -1 }; // -1 means unlimited
    }

    // Get user's AI chat usage
    const [result] = await this.db.execute(
      'SELECT ai_chat_usage FROM users WHERE id = ?',
      [userId]
    );
    const usage = result[0]?.ai_chat_usage || 0;
    const remaining = subscription.ai_chat_limit - usage;

    return {
      canUse: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: subscription.ai_chat_limit,
      used: usage
    };
  }

  async incrementAiChatUsage(userId) {
    await this.db.execute(
      'UPDATE users SET ai_chat_usage = ai_chat_usage + 1 WHERE id = ?',
      [userId]
    );
  }

  async resetAiChatUsage(userId) {
    const now = new Date();
    await this.db.execute(
      'UPDATE users SET ai_chat_usage = 0, ai_chat_reset_date = ? WHERE id = ?',
      [now, userId]
    );
  }

  async processAutoRenewals() {
    // Find subscriptions that need renewal
    const [rows] = await this.db.execute(
      `SELECT up.*, p.name as plan_name, p.type as plan_type, p.price
       FROM user_plan up 
       JOIN plans p ON up.plan_id = p.id 
       WHERE up.auto_renew = TRUE 
       AND up.end_date <= CURDATE()`
    );

    const renewals = [];
    for (const subscription of rows) {
      try {
        // Create new subscription period
        let endDate = null;
        if (subscription.plan_type === 'monthly') {
          endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (subscription.plan_type === 'yearly') {
          endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const newSubscriptionId = await this.userPlanModel.create({
          user_id: subscription.user_id,
          plan_id: subscription.plan_id,
          start_date: new Date().toISOString().split('T')[0],
          end_date: endDate ? endDate.toISOString().split('T')[0] : null,
          auto_renew: true,
          payment_reference: `AUTO_RENEW_${Date.now()}`
        });

        // Log renewal
        await this.subscriptionLogModel.create({
          user_id: subscription.user_id,
          plan_id: subscription.plan_id,
          action: 'renewed',
          payment_status: 'completed',
          amount: subscription.price,
          payment_reference: `AUTO_RENEW_${Date.now()}`
        });

        renewals.push({
          userId: subscription.user_id,
          subscriptionId: newSubscriptionId,
          planName: subscription.plan_name
        });
      } catch (error) {
        console.error(`Failed to renew subscription for user ${subscription.user_id}:`, error);
      }
    }

    return renewals;
  }

  async getUserSubscriptionDetails(userId) {
    const subscription = await this.userPlanModel.findByUserId(userId);
    const logs = await this.subscriptionLogModel.findByUserId(userId, 10);
    const transactions = await this.paymentTransactionModel.findByUserId(userId, 10);
    
    return {
      subscription,
      logs,
      transactions
    };
  }

  async getAllSubscriptions(filters = {}) {
    return await this.userPlanModel.findAll(filters);
  }

  async getSubscriptionStats() {
    const [subscriptionStats] = await this.db.execute(`
      SELECT 
        p.type,
        COUNT(up.id) as count,
        SUM(p.price) as total_revenue
      FROM user_plan up
      JOIN plans p ON up.plan_id = p.id
      WHERE (up.end_date IS NULL OR up.end_date > CURDATE())
      GROUP BY p.type
    `);

    const [recentSubscriptions] = await this.db.execute(`
      SELECT 
        COUNT(*) as count
      FROM user_plan 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    return {
      byType: subscriptionStats,
      recentCount: recentSubscriptions[0].count
    };
  }
}

module.exports = SubscriptionService;



