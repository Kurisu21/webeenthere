// services/StripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️  STRIPE_SECRET_KEY not found in environment variables');
    }
  }

  /**
   * Create a Payment Intent for one-time payment
   * @param {number} amount - Amount in dollars (will be converted to cents)
   * @param {string} currency - Currency code (default: 'usd')
   * @param {Object} metadata - Additional metadata (userId, planId, etc.)
   * @returns {Promise<Object>} Payment Intent object
   */
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      // Convert dollars to cents
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Retrieve a Payment Intent by ID
   * @param {string} paymentIntentId - Stripe Payment Intent ID
   * @returns {Promise<Object>} Payment Intent object
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm a Payment Intent
   * @param {string} paymentIntentId - Stripe Payment Intent ID
   * @returns {Promise<Object>} Confirmed Payment Intent
   */
  async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw new Error(`Failed to confirm payment intent: ${error.message}`);
    }
  }

  /**
   * Create a Customer in Stripe
   * @param {string} email - Customer email
   * @param {string} name - Customer name
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Customer object
   */
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Create an Invoice (for recurring subscriptions or manual invoicing)
   * @param {string} customerId - Stripe Customer ID
   * @param {number} amount - Amount in dollars
   * @param {string} description - Invoice description
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Invoice object
   */
  async createInvoice(customerId, amount, description, metadata = {}) {
    try {
      const amountInCents = Math.round(amount * 100);

      // Create invoice item
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: amountInCents,
        currency: 'usd',
        description: description,
      });

      // Create and finalize invoice
      const invoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: true, // Automatically finalize
        metadata: metadata,
      });

      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

      return finalizedInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * @param {string} payload - Raw request body
   * @param {string} signature - Stripe signature header
   * @returns {Object} Event object
   */
  verifyWebhook(payload, signature) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET not configured');
      }

      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error(`Webhook verification failed: ${error.message}`);
    }
  }

  /**
   * Handle payment intent succeeded event
   * @param {Object} paymentIntent - Payment Intent object from webhook
   * @returns {Object} Processed payment data
   */
  processPaymentSuccess(paymentIntent) {
    return {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert cents to dollars
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
      customerId: paymentIntent.customer,
    };
  }
}

module.exports = StripeService;

