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

      // Verify email address exists
      if (!invoice.email) {
        console.error('No email address found for invoice:', invoice);
        throw new Error('User email address not found');
      }

      console.log(`Sending invoice email to: ${invoice.email} for invoice ${invoice.invoice_number}`);

      // Generate PDF
      const pdfBuffer = await this.generatePDF(transactionId);

      // Format dates
      const issueDate = new Date(invoice.issue_date);
      const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;
      const formattedIssueDate = issueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const formattedDueDate = dueDate ? dueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 'N/A';

      // Send email with PDF attachment
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: invoice.email, // User's email from the database
        subject: `Invoice ${invoice.invoice_number} - Payment Receipt`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice ${invoice.invoice_number}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f5f7fa;
                padding: 20px;
                line-height: 1.6;
              }
              .email-wrapper {
                max-width: 700px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 40px 30px;
                color: white;
              }
              .header h1 {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 5px;
                letter-spacing: -0.5px;
              }
              .header .subtitle {
                font-size: 16px;
                opacity: 0.95;
                font-weight: 300;
              }
              .content {
                padding: 40px;
              }
              .invoice-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
                padding-bottom: 30px;
                border-bottom: 2px solid #e5e7eb;
              }
              .invoice-details {
                flex: 1;
              }
              .invoice-meta {
                text-align: right;
                flex: 1;
              }
              .invoice-meta h2 {
                font-size: 24px;
                color: #1f2937;
                margin-bottom: 20px;
                font-weight: 600;
              }
              .meta-row {
                margin-bottom: 12px;
                font-size: 14px;
              }
              .meta-label {
                color: #6b7280;
                font-weight: 500;
                display: inline-block;
                min-width: 100px;
                margin-bottom: 4px;
              }
              .meta-value {
                color: #1f2937;
                font-weight: 600;
                display: block;
              }
              .status-badge {
                display: inline-block;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 8px;
              }
              .status-paid {
                background-color: #d1fae5;
                color: #065f46;
              }
              .status-pending {
                background-color: #fef3c7;
                color: #92400e;
              }
              .bill-to {
                margin-bottom: 40px;
              }
              .bill-to h3 {
                font-size: 14px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 12px;
                font-weight: 600;
              }
              .bill-to p {
                color: #1f2937;
                font-size: 15px;
                margin-bottom: 4px;
              }
              .bill-to .name {
                font-weight: 600;
                font-size: 16px;
                margin-bottom: 6px;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              .items-table thead {
                background-color: #f9fafb;
                border-bottom: 2px solid #e5e7eb;
              }
              .items-table th {
                padding: 14px 16px;
                text-align: left;
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .items-table td {
                padding: 18px 16px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 15px;
                color: #1f2937;
              }
              .items-table tbody tr:last-child td {
                border-bottom: none;
              }
              .item-description {
                font-weight: 600;
                color: #1f2937;
              }
              .item-type {
                color: #6b7280;
                font-size: 14px;
                margin-top: 4px;
              }
              .item-amount {
                text-align: right;
                font-weight: 600;
                color: #1f2937;
              }
              .totals {
                margin-top: 20px;
                margin-left: auto;
                width: 300px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                font-size: 15px;
              }
              .total-row.subtotal {
                color: #6b7280;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 10px;
              }
              .total-row.grand-total {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 2px solid #1f2937;
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
              }
              .total-label {
                font-weight: 500;
              }
              .total-value {
                font-weight: 600;
              }
              .payment-info {
                background-color: #f9fafb;
                border-left: 4px solid #667eea;
                padding: 20px;
                border-radius: 6px;
                margin: 30px 0;
              }
              .payment-info h4 {
                font-size: 14px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                font-weight: 600;
              }
              .payment-info p {
                color: #1f2937;
                font-size: 14px;
                font-family: 'Courier New', monospace;
                word-break: break-all;
              }
              .notes {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
              .notes h4 {
                font-size: 14px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                font-weight: 600;
              }
              .notes p {
                color: #1f2937;
                font-size: 14px;
              }
              .footer {
                background-color: #f9fafb;
                padding: 30px 40px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
              }
              .footer p {
                color: #6b7280;
                font-size: 13px;
                margin-bottom: 8px;
              }
              .footer .company {
                color: #1f2937;
                font-weight: 600;
                margin-top: 10px;
              }
              @media only screen and (max-width: 600px) {
                .invoice-header {
                  flex-direction: column;
                }
                .invoice-meta {
                  text-align: left;
                  margin-top: 20px;
                }
                .totals {
                  width: 100%;
                }
                .content {
                  padding: 20px;
                }
                .header {
                  padding: 30px 20px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="header">
                <h1>Webeenthere</h1>
                <div class="subtitle">Invoice</div>
              </div>
              
              <div class="content">
                <div class="invoice-header">
                  <div class="invoice-details">
                    <div class="bill-to">
                      <h3>Bill To</h3>
                      <p class="name">${invoice.username || 'Customer'}</p>
                      <p>${invoice.email || ''}</p>
                    </div>
                  </div>
                  
                  <div class="invoice-meta">
                    <h2>Invoice #${invoice.invoice_number}</h2>
                    <div class="meta-row">
                      <span class="meta-label">Issue Date:</span>
                      <span class="meta-value">${formattedIssueDate}</span>
                    </div>
                    ${dueDate ? `
                    <div class="meta-row">
                      <span class="meta-label">Due Date:</span>
                      <span class="meta-value">${formattedDueDate}</span>
                    </div>
                    ` : ''}
                    <div class="meta-row">
                      <span class="meta-label">Status:</span>
                      <span class="meta-value">
                        <span class="status-badge ${invoice.status === 'paid' ? 'status-paid' : 'status-pending'}">
                          ${invoice.status.toUpperCase()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style="text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="item-description">${invoice.plan_name || 'Subscription'}</div>
                        <div class="item-type">${invoice.plan_type || ''} Plan</div>
                      </td>
                      <td class="item-amount">$${parseFloat(invoice.amount).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="totals">
                  <div class="total-row subtotal">
                    <span class="total-label">Subtotal</span>
                    <span class="total-value">$${parseFloat(invoice.amount).toFixed(2)}</span>
                  </div>
                  ${parseFloat(invoice.tax_amount) > 0 ? `
                  <div class="total-row subtotal">
                    <span class="total-label">Tax</span>
                    <span class="total-value">$${parseFloat(invoice.tax_amount).toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div class="total-row grand-total">
                    <span class="total-label">Total</span>
                    <span class="total-value">$${parseFloat(invoice.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                ${invoice.transaction_reference ? `
                <div class="payment-info">
                  <h4>Payment Reference</h4>
                  <p>${invoice.transaction_reference}</p>
                </div>
                ` : ''}

                ${invoice.notes ? `
                <div class="notes">
                  <h4>Notes</h4>
                  <p>${invoice.notes}</p>
                </div>
                ` : ''}
              </div>

              <div class="footer">
                <p>Your invoice PDF is attached to this email for your records.</p>
                <p>If you have any questions about this invoice, please contact our support team.</p>
                <p class="company">&copy; ${new Date().getFullYear()} Webeenthere. All rights reserved.</p>
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

      const info = await this.emailService.transporter.sendMail(mailOptions);
      console.log(`Invoice email sent successfully to ${invoice.email}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      console.error('Email details:', {
        transactionId,
        email: invoice?.email,
        invoiceNumber: invoice?.invoice_number
      });
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

        // Invoice Details (Right aligned)
        doc.fontSize(12);
        const rightColumnX = 450;
        doc.text(`Invoice #: ${invoice.invoice_number}`, rightColumnX, 50, { align: 'right', width: 100 });
        doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, rightColumnX, 70, { align: 'right', width: 100 });
        if (invoice.due_date) {
          doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, rightColumnX, 90, { align: 'right', width: 100 });
        }
        doc.text(`Status: ${invoice.status.toUpperCase()}`, rightColumnX, 110, { align: 'right', width: 100 });

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

        // Totals section - properly spaced to avoid overlap
        // Use fixed positions: labels at 400, values at 500 (right-aligned from 550)
        const totalsLabelStart = 400;  // Start position for labels
        const totalsValueStart = 500;   // Start position for values (right edge at 550)
        
        doc.font('Helvetica-Bold').fontSize(10);
        // Subtotal - label left-aligned, value right-aligned
        doc.text('Subtotal:', totalsLabelStart, totalsTop + 10);
        doc.text(`$${parseFloat(invoice.amount).toFixed(2)}`, totalsValueStart, totalsTop + 10, { align: 'right', width: 50 });

        if (parseFloat(invoice.tax_amount) > 0) {
          doc.text('Tax:', totalsLabelStart, totalsTop + 30);
          doc.text(`$${parseFloat(invoice.tax_amount).toFixed(2)}`, totalsValueStart, totalsTop + 30, { align: 'right', width: 50 });
        }

        // Total - with separator line and larger font
        const totalTop = totalsTop + (parseFloat(invoice.tax_amount) > 0 ? 50 : 30);
        doc.moveTo(400, totalTop)
          .lineTo(550, totalTop)
          .stroke();
        
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Total:', totalsLabelStart, totalTop + 10);
        doc.text(`$${parseFloat(invoice.total_amount).toFixed(2)}`, totalsValueStart, totalTop + 10, { align: 'right', width: 50 });

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

