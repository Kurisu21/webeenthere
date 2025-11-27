// services/InvoiceService.js
const PaymentTransaction = require('../models/PaymentTransaction');
const Plan = require('../models/Plan');
const PDFDocument = require('pdfkit');
const EmailService = require('./EmailService');

class InvoiceService {
  constructor(db) {
    this.db = db;
    this.paymentTransactionModel = new PaymentTransaction(db);
    this.planModel = new Plan(db);
    this.emailService = new EmailService();
  }

  /**
   * Generate invoice number from transaction
   */
  generateInvoiceNumber(transactionId, createdAt) {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const id = String(transactionId).padStart(6, '0');
    return `INV-${year}${month}${day}-${id}`;
  }

  /**
   * Get invoice data from payment transaction (no database storage)
   */
  async getInvoiceFromTransaction(transactionId) {
    // Get transaction with user and plan details
    const [rows] = await this.db.execute(
      `SELECT pt.*, 
              u.username, u.email,
              p.name as plan_name, p.type as plan_type
       FROM payment_transactions pt
       JOIN users u ON pt.user_id = u.id
       JOIN plans p ON pt.plan_id = p.id
       WHERE pt.id = ?`,
      [transactionId]
    );

    if (rows.length === 0) {
      throw new Error('Transaction not found');
    }

    const transaction = rows[0];
    
    // Generate invoice number
    const invoiceNumber = this.generateInvoiceNumber(transaction.id, transaction.created_at);
    
    // Calculate dates
    const issueDate = new Date(transaction.created_at);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

    // Calculate amounts (assuming no tax for now, can be configured)
    const taxAmount = 0;
    const totalAmount = parseFloat(transaction.amount) + taxAmount;

    // Return invoice object (not stored in DB)
    return {
      id: transaction.id, // Use transaction ID as invoice ID
      invoice_number: invoiceNumber,
      user_id: transaction.user_id,
      transaction_id: transaction.id,
      plan_id: transaction.plan_id,
      plan_name: transaction.plan_name,
      plan_type: transaction.plan_type,
      amount: parseFloat(transaction.amount),
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: transaction.status === 'completed' ? 'paid' : 'sent',
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      paid_date: transaction.status === 'completed' ? issueDate.toISOString().split('T')[0] : null,
      transaction_reference: transaction.transaction_reference,
      transaction_status: transaction.status,
      username: transaction.username,
      email: transaction.email,
      notes: `Subscription: ${transaction.plan_name} (${transaction.plan_type})`,
      created_at: transaction.created_at,
      updated_at: transaction.created_at
    };
  }

  /**
   * Create invoice from payment transaction (returns invoice data without storing)
   */
  async createInvoiceFromTransaction(transactionId) {
    return await this.getInvoiceFromTransaction(transactionId);
  }

  /**
   * Send invoice via email
   */
  async sendInvoiceEmail(transactionId) {
    try {
      const invoice = await this.getInvoiceFromTransaction(transactionId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Generate PDF
      const pdfBuffer = await this.generatePDF(transactionId);

      // Send email with PDF attachment
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: invoice.email,
        subject: `Payment Receipt - Invoice ${invoice.invoice_number}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Payment Receipt</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
              }
              .email-container {
                background: white;
                border-radius: 15px;
                padding: 40px;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              }
              .logo {
                font-size: 2.5em;
                font-weight: bold;
                background: linear-gradient(45deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                color: transparent;
                margin-bottom: 20px;
                text-align: center;
              }
              h1 {
                color: #333;
                margin-bottom: 20px;
                font-size: 1.8em;
              }
              .receipt-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #764ba2;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .info-label {
                font-weight: 600;
                color: #666;
              }
              .info-value {
                color: #333;
              }
              .amount {
                font-size: 1.5em;
                font-weight: bold;
                color: #764ba2;
                text-align: center;
                margin: 20px 0;
              }
              .footer {
                color: #999;
                font-size: 0.9em;
                margin-top: 30px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="logo">WEBeenThere</div>
              <h1>Payment Receipt</h1>
              <p>Dear ${invoice.username},</p>
              <p>Thank you for your subscription! Your payment has been successfully processed.</p>
              
              <div class="receipt-info">
                <div class="info-row">
                  <span class="info-label">Invoice Number:</span>
                  <span class="info-value">${invoice.invoice_number}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Plan:</span>
                  <span class="info-value">${invoice.plan_name} (${invoice.plan_type})</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Transaction Reference:</span>
                  <span class="info-value">${invoice.transaction_reference}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Issue Date:</span>
                  <span class="info-value">${new Date(invoice.issue_date).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="info-value" style="color: ${invoice.status === 'paid' ? '#28a745' : '#ffc107'}; font-weight: bold;">${invoice.status.toUpperCase()}</span>
                </div>
              </div>

              <div class="amount">
                Total: $${parseFloat(invoice.total_amount).toFixed(2)}
              </div>

              <p>Your receipt PDF is attached to this email for your records.</p>
              
              <div class="footer">
                <p>If you have any questions, please contact our support team.</p>
                <p>&copy; ${new Date().getFullYear()} WEBeenThere. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: `invoice-${invoice.invoice_number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      await this.emailService.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      return false;
    }
  }

  /**
   * Generate PDF for invoice from transaction ID
   */
  async generatePDF(transactionId) {
    const invoice = await this.getInvoiceFromTransaction(transactionId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Company/Service Info
        doc.fontSize(24).text('Webeenthere', 50, 50);
        doc.fontSize(10).text('Invoice', 50, 80);
        doc.moveDown();

        // Invoice Details
        doc.fontSize(12);
        doc.text(`Invoice #: ${invoice.invoice_number}`, 400, 50);
        doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 400, 70);
        if (invoice.due_date) {
          doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 400, 90);
        }
        doc.text(`Status: ${invoice.status.toUpperCase()}`, 400, 110);

        // Bill To
        doc.moveDown(2);
        doc.fontSize(14).text('Bill To:', 50);
        doc.fontSize(11);
        doc.text(invoice.username || 'Customer', 50);
        doc.text(invoice.email || '', 50);
        if (invoice.billing_address) {
          const addressLines = invoice.billing_address.split('\n');
          addressLines.forEach((line, index) => {
            doc.text(line, 50);
          });
        }

        // Line Items
        doc.moveDown(2);
        const tableTop = doc.y;
        
        // Table Header
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Description', 50, tableTop);
        doc.text('Plan Type', 200, tableTop);
        doc.text('Amount', 450, tableTop, { align: 'right' });
        
        // Table Line
        doc.moveTo(50, tableTop + 15)
          .lineTo(550, tableTop + 15)
          .stroke();

        // Table Content
        doc.font('Helvetica');
        const itemTop = tableTop + 25;
        doc.text(invoice.plan_name || 'Subscription', 50, itemTop);
        doc.text(invoice.plan_type || '', 200, itemTop);
        doc.text(`$${parseFloat(invoice.amount).toFixed(2)}`, 450, itemTop, { align: 'right' });

        // Totals
        const totalsTop = itemTop + 30;
        doc.moveTo(50, totalsTop)
          .lineTo(550, totalsTop)
          .stroke();

        doc.font('Helvetica-Bold');
        doc.text('Subtotal:', 400, totalsTop + 10, { align: 'right' });
        doc.text(`$${parseFloat(invoice.amount).toFixed(2)}`, 500, totalsTop + 10, { align: 'right' });

        if (parseFloat(invoice.tax_amount) > 0) {
          doc.text('Tax:', 400, totalsTop + 30, { align: 'right' });
          doc.text(`$${parseFloat(invoice.tax_amount).toFixed(2)}`, 500, totalsTop + 30, { align: 'right' });
        }

        doc.fontSize(12);
        doc.text('Total:', 400, totalsTop + 50, { align: 'right' });
        doc.text(`$${parseFloat(invoice.total_amount).toFixed(2)}`, 500, totalsTop + 50, { align: 'right' });

        // Payment Info
        if (invoice.transaction_reference) {
          doc.moveDown(2);
          doc.fontSize(10).font('Helvetica');
          doc.text(`Payment Reference: ${invoice.transaction_reference}`, 50);
        }

        // Notes
        if (invoice.notes) {
          doc.moveDown(1);
          doc.fontSize(10);
          doc.text('Notes:', 50);
          doc.text(invoice.notes, 50);
        }

        // Footer
        const footerY = 750;
        doc.fontSize(8).text(
          'Thank you for your business!',
          50,
          footerY,
          { align: 'center', width: 500 }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get invoice with all details (from transaction ID)
   */
  async getInvoiceDetails(transactionId) {
    return await this.getInvoiceFromTransaction(transactionId);
  }

  /**
   * Get user invoices (from payment transactions)
   */
  async getUserInvoices(userId, filters = {}) {
    let query = `
      SELECT pt.*, 
             u.username, u.email,
             p.name as plan_name, p.type as plan_type
      FROM payment_transactions pt
      JOIN users u ON pt.user_id = u.id
      JOIN plans p ON pt.plan_id = p.id
      WHERE pt.user_id = ?
    `;
    const params = [userId];

    if (filters.status) {
      query += ' AND pt.status = ?';
      params.push(filters.status);
    }

    if (filters.start_date) {
      query += ' AND DATE(pt.created_at) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(pt.created_at) <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY pt.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await this.db.execute(query, params);
    
    // Convert transactions to invoice format
    return rows.map(transaction => {
      const invoiceNumber = this.generateInvoiceNumber(transaction.id, transaction.created_at);
      const issueDate = new Date(transaction.created_at);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30);
      const taxAmount = 0;
      const totalAmount = parseFloat(transaction.amount) + taxAmount;

      return {
        id: transaction.id,
        invoice_number: invoiceNumber,
        user_id: transaction.user_id,
        transaction_id: transaction.id,
        plan_id: transaction.plan_id,
        plan_name: transaction.plan_name,
        plan_type: transaction.plan_type,
        amount: parseFloat(transaction.amount),
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: transaction.status === 'completed' ? 'paid' : 'sent',
        issue_date: issueDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        paid_date: transaction.status === 'completed' ? issueDate.toISOString().split('T')[0] : null,
        transaction_reference: transaction.transaction_reference,
        transaction_status: transaction.status,
        username: transaction.username,
        email: transaction.email,
        notes: `Subscription: ${transaction.plan_name} (${transaction.plan_type})`,
        created_at: transaction.created_at,
        updated_at: transaction.created_at
      };
    });
  }

  /**
   * Get all invoices (admin) - from payment transactions
   */
  async getAllInvoices(filters = {}) {
    let query = `
      SELECT pt.*, 
             u.username, u.email,
             p.name as plan_name, p.type as plan_type
      FROM payment_transactions pt
      JOIN users u ON pt.user_id = u.id
      JOIN plans p ON pt.plan_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND pt.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.status) {
      query += ' AND pt.status = ?';
      params.push(filters.status);
    }

    if (filters.start_date) {
      query += ' AND DATE(pt.created_at) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(pt.created_at) <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY pt.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await this.db.execute(query, params);
    
    // Convert transactions to invoice format
    return rows.map(transaction => {
      const invoiceNumber = this.generateInvoiceNumber(transaction.id, transaction.created_at);
      const issueDate = new Date(transaction.created_at);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30);
      const taxAmount = 0;
      const totalAmount = parseFloat(transaction.amount) + taxAmount;

      return {
        id: transaction.id,
        invoice_number: invoiceNumber,
        user_id: transaction.user_id,
        transaction_id: transaction.id,
        plan_id: transaction.plan_id,
        plan_name: transaction.plan_name,
        plan_type: transaction.plan_type,
        amount: parseFloat(transaction.amount),
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: transaction.status === 'completed' ? 'paid' : 'sent',
        issue_date: issueDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        paid_date: transaction.status === 'completed' ? issueDate.toISOString().split('T')[0] : null,
        transaction_reference: transaction.transaction_reference,
        transaction_status: transaction.status,
        username: transaction.username,
        email: transaction.email,
        notes: `Subscription: ${transaction.plan_name} (${transaction.plan_type})`,
        created_at: transaction.created_at,
        updated_at: transaction.created_at
      };
    });
  }
}

module.exports = InvoiceService;

