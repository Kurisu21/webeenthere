// controllers/StripeWebhookController.js
const StripeService = require('../services/StripeService');
const SubscriptionService = require('../services/SubscriptionService');
const { getDatabaseConnection } = require('../database/database');

class StripeWebhookController {
  constructor() {
    this.db = getDatabaseConnection();
    this.stripeService = new StripeService();
    this.subscriptionService = new SubscriptionService(this.db);
  }

  // POST /api/stripe/webhook
  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Verify webhook signature
      event = this.stripeService.verifyWebhook(req.body, sig);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook event:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }

  /**
   * Handle successful payment intent
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    try {
      const { userId, planId } = paymentIntent.metadata;

      if (!userId || !planId) {
        console.warn('Payment intent missing metadata:', paymentIntent.id);
        return;
      }

      // Update payment transaction status
      await this.db.execute(
        `UPDATE payment_transactions 
         SET status = 'completed' 
         WHERE transaction_reference = ?`,
        [paymentIntent.id]
      );

      // Update subscription log payment status (update all matching payment references, not just pending)
      await this.db.execute(
        `UPDATE subscription_logs 
         SET payment_status = 'completed' 
         WHERE payment_reference = ?`,
        [paymentIntent.id]
      );

      console.log(`✅ Payment succeeded for user ${userId}, plan ${planId}`);
    } catch (error) {
      console.error('Error handling payment intent succeeded:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment intent
   */
  async handlePaymentIntentFailed(paymentIntent) {
    try {
      const { userId, planId } = paymentIntent.metadata;

      if (!userId || !planId) {
        console.warn('Payment intent missing metadata:', paymentIntent.id);
        return;
      }

      // Update payment transaction status
      await this.db.execute(
        `UPDATE payment_transactions 
         SET status = 'failed' 
         WHERE transaction_reference = ?`,
        [paymentIntent.id]
      );

      // Update subscription log payment status
      await this.db.execute(
        `UPDATE subscription_logs 
         SET payment_status = 'failed' 
         WHERE payment_reference = ?`,
        [paymentIntent.id]
      );

      console.log(`❌ Payment failed for user ${userId}, plan ${planId}`);
    } catch (error) {
      console.error('Error handling payment intent failed:', error);
      throw error;
    }
  }

  /**
   * Handle successful invoice payment (for recurring subscriptions)
   */
  async handleInvoicePaymentSucceeded(invoice) {
    try {
      const customerId = invoice.customer;
      const amount = invoice.amount_paid / 100; // Convert cents to dollars

      // If you have customer metadata with userId, you can process renewal here
      console.log(`✅ Invoice payment succeeded: ${invoice.id}, Amount: $${amount}`);
      
      // You can add logic here to handle subscription renewals
      // For example, extend the subscription end_date
    } catch (error) {
      console.error('Error handling invoice payment succeeded:', error);
      throw error;
    }
  }

  /**
   * Handle failed invoice payment
   */
  async handleInvoicePaymentFailed(invoice) {
    try {
      const customerId = invoice.customer;
      console.log(`❌ Invoice payment failed: ${invoice.id}`);
      
      // You can add logic here to handle failed subscription renewals
      // For example, notify the user or suspend their account
    } catch (error) {
      console.error('Error handling invoice payment failed:', error);
      throw error;
    }
  }
}

module.exports = StripeWebhookController;

