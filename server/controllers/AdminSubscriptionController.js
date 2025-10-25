// controllers/AdminSubscriptionController.js
const SubscriptionService = require('../services/SubscriptionService');
const Plan = require('../models/Plan');
const SubscriptionLog = require('../models/SubscriptionLog');
const PaymentTransaction = require('../models/PaymentTransaction');
const { getDatabaseConnection } = require('../database/database');

class AdminSubscriptionController {
  constructor() {
    this.db = getDatabaseConnection();
    this.subscriptionService = new SubscriptionService(this.db);
    this.planModel = new Plan(this.db);
    this.subscriptionLogModel = new SubscriptionLog(this.db);
    this.paymentTransactionModel = new PaymentTransaction(this.db);
  }

  // GET /api/admin/subscriptions
  async getAllSubscriptions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        plan_type,
        is_active,
        search
      } = req.query;

      const filters = {
        plan_type,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        limit: parseInt(limit)
      };

      let subscriptions = await this.subscriptionService.getAllSubscriptions(filters);

      // Apply search filter if provided
      if (search) {
        subscriptions = subscriptions.filter(sub => 
          sub.username.toLowerCase().includes(search.toLowerCase()) ||
          sub.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Calculate pagination
      const total = subscriptions.length;
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedSubscriptions = subscriptions.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedSubscriptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscriptions'
      });
    }
  }

  // POST /api/admin/subscriptions/assign
  async assignPlan(req, res) {
    try {
      const { userId, planId, startDate, endDate, paymentReference } = req.body;

      if (!userId || !planId) {
        return res.status(400).json({
          success: false,
          error: 'User ID and Plan ID are required'
        });
      }

      // Check if user exists
      const [userRows] = await this.db.execute('SELECT id FROM users WHERE id = ?', [userId]);
      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if plan exists
      const plan = await this.planModel.findById(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
      }

      // Cancel any existing active subscription
      const existingSubscription = await this.subscriptionService.userPlanModel.findByUserId(userId);
      if (existingSubscription) {
        await this.subscriptionService.userPlanModel.cancelSubscription(existingSubscription.id);
      }

      // Create new subscription
      const subscriptionId = await this.subscriptionService.userPlanModel.create({
        user_id: userId,
        plan_id: planId,
        start_date: startDate || new Date().toISOString().split('T')[0],
        end_date: endDate,
        auto_renew: plan.type !== 'free',
        payment_reference: paymentReference || `ADMIN_ASSIGNED_${Date.now()}`
      });

      // Log the assignment
      await this.subscriptionService.subscriptionLogModel.create({
        user_id: userId,
        plan_id: planId,
        action: 'created',
        payment_status: 'completed',
        amount: plan.price,
        payment_reference: paymentReference || `ADMIN_ASSIGNED_${Date.now()}`
      });

      res.json({
        success: true,
        data: {
          subscriptionId,
          message: 'Plan assigned successfully'
        }
      });
    } catch (error) {
      console.error('Error assigning plan:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to assign plan'
      });
    }
  }

  // GET /api/admin/subscriptions/logs
  async getSubscriptionLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        user_id,
        action,
        payment_status,
        start_date,
        end_date
      } = req.query;

      const filters = {
        user_id,
        action,
        payment_status,
        start_date,
        end_date,
        limit: parseInt(limit)
      };

      const logs = await this.subscriptionLogModel.findAll(filters);

      // Calculate pagination
      const total = logs.length;
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedLogs = logs.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching subscription logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription logs'
      });
    }
  }

  // GET /api/admin/subscriptions/transactions
  async getPaymentTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        user_id,
        status,
        start_date,
        end_date,
        min_amount,
        max_amount
      } = req.query;

      const filters = {
        user_id,
        status,
        start_date,
        end_date,
        min_amount: min_amount ? parseFloat(min_amount) : undefined,
        max_amount: max_amount ? parseFloat(max_amount) : undefined,
        limit: parseInt(limit)
      };

      const transactions = await this.paymentTransactionModel.findAll(filters);

      // Calculate pagination
      const total = transactions.length;
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedTransactions = transactions.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedTransactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment transactions'
      });
    }
  }

  // GET /api/admin/subscriptions/user/:userId
  async getUserSubscriptionDetails(req, res) {
    try {
      const { userId } = req.params;
      
      const details = await this.subscriptionService.getUserSubscriptionDetails(parseInt(userId));
      
      res.json({
        success: true,
        data: details
      });
    } catch (error) {
      console.error('Error fetching user subscription details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user subscription details'
      });
    }
  }

  // GET /api/admin/subscriptions/stats
  async getSubscriptionStats(req, res) {
    try {
      const stats = await this.subscriptionService.getSubscriptionStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription stats'
      });
    }
  }
}

module.exports = AdminSubscriptionController;
