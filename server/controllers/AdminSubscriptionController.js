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
      const { userId, planId, paymentReference } = req.body;

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

      // Calculate start_date and end_date based on plan type
      const startDate = new Date().toISOString().split('T')[0];
      let endDate = null;
      if (plan.type === 'monthly') {
        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        endDate = end.toISOString().split('T')[0];
      } else if (plan.type === 'yearly') {
        const end = new Date();
        end.setFullYear(end.getFullYear() + 1);
        endDate = end.toISOString().split('T')[0];
      }
      // For free plans, endDate remains null (unlimited)

      // Create new subscription
      const subscriptionId = await this.subscriptionService.userPlanModel.create({
        user_id: userId,
        plan_id: planId,
        start_date: startDate,
        end_date: endDate,
        auto_renew: plan.type !== 'free',
        payment_reference: paymentReference || `ADMIN_ASSIGNED_${Date.now()}`
      });

      // Create payment transaction if not free
      let invoice = null;
      if (plan.type !== 'free' && plan.price > 0) {
        const transactionRef = paymentReference || `ADMIN_ASSIGNED_${Date.now()}`;
        const transactionId = await this.paymentTransactionModel.create({
          user_id: userId,
          plan_id: planId,
          amount: plan.price,
          status: 'completed',
          transaction_reference: transactionRef
        });

        // Create invoice for the transaction
        try {
          invoice = await this.subscriptionService.invoiceService.createInvoiceFromTransaction(transactionId);
          
          // Send invoice via email
          try {
            await this.subscriptionService.invoiceService.sendInvoiceEmail(transactionId);
          } catch (emailError) {
            console.error('Failed to send invoice email:', emailError);
            // Don't fail plan assignment if email fails
          }
        } catch (error) {
          console.error('Failed to create invoice:', error);
        }
      }

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
          invoice: invoice || null,
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

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        user_id,
        action,
        payment_status,
        start_date,
        end_date,
        limit: limitNum,
        offset: offset
      };

      // Get total count and paginated logs in parallel
      const [total, logs] = await Promise.all([
        this.subscriptionLogModel.count({
          user_id,
          action,
          payment_status,
          start_date,
          end_date
        }),
        this.subscriptionLogModel.findAll(filters)
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      });
    } catch (error) {
      console.error('Error fetching subscription logs:', error);
      
      // Handle timeout errors specifically
      if (error.message && error.message.includes('timeout')) {
        return res.status(504).json({
          success: false,
          error: 'Request timeout: The query took too long to execute. Please try with more specific filters or contact support.'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch subscription logs'
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

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const filterParams = {
        user_id,
        status,
        start_date,
        end_date,
        min_amount: min_amount ? parseFloat(min_amount) : undefined,
        max_amount: max_amount ? parseFloat(max_amount) : undefined
      };

      const filters = {
        ...filterParams,
        limit: limitNum,
        offset: offset
      };

      // Get total count and paginated transactions in parallel
      const [total, transactions] = await Promise.all([
        this.paymentTransactionModel.count(filterParams),
        this.paymentTransactionModel.findAll(filters)
      ]);

      res.json({
        success: true,
        data: transactions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
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
