// models/Invoice.js
class Invoice {
  constructor(db) {
    this.db = db;
  }

  async create(data) {
    const {
      invoice_number,
      user_id,
      transaction_id,
      plan_id,
      amount,
      tax_amount = 0,
      total_amount,
      status = 'draft',
      issue_date,
      due_date,
      paid_date = null,
      billing_address = null,
      notes = null
    } = data;

    const [result] = await this.db.execute(
      `INSERT INTO invoices (
        invoice_number, user_id, transaction_id, plan_id, amount, tax_amount, 
        total_amount, status, issue_date, due_date, paid_date, billing_address, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_number, user_id, transaction_id, plan_id, amount, tax_amount,
        total_amount, status, issue_date, due_date, paid_date, billing_address, notes
      ]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      `SELECT i.*, 
              u.username, u.email,
              p.name as plan_name, p.type as plan_type,
              pt.transaction_reference, pt.status as transaction_status
       FROM invoices i
       JOIN users u ON i.user_id = u.id
       JOIN plans p ON i.plan_id = p.id
       LEFT JOIN payment_transactions pt ON i.transaction_id = pt.id
       WHERE i.id = ?`,
      [id]
    );
    return rows[0];
  }

  async findByInvoiceNumber(invoiceNumber) {
    const [rows] = await this.db.execute(
      `SELECT i.*, 
              u.username, u.email,
              p.name as plan_name, p.type as plan_type,
              pt.transaction_reference, pt.status as transaction_status
       FROM invoices i
       JOIN users u ON i.user_id = u.id
       JOIN plans p ON i.plan_id = p.id
       JOIN payment_transactions pt ON i.transaction_id = pt.id
       WHERE i.invoice_number = ?`,
      [invoiceNumber]
    );
    return rows[0];
  }

  async findByUserId(userId, filters = {}) {
    let query = `
      SELECT i.*, 
             u.username, u.email,
             p.name as plan_name, p.type as plan_type,
             pt.transaction_reference, pt.status as transaction_status
      FROM invoices i
      JOIN users u ON i.user_id = u.id
      JOIN plans p ON i.plan_id = p.id
      JOIN payment_transactions pt ON i.transaction_id = pt.id
      WHERE i.user_id = ?
    `;
    const params = [userId];

    if (filters.status) {
      query += ' AND i.status = ?';
      params.push(filters.status);
    }

    if (filters.start_date) {
      query += ' AND i.issue_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND i.issue_date <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY i.issue_date DESC, i.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await this.db.execute(query, params);
    return rows;
  }

  async findAll(filters = {}) {
    let query = `
      SELECT i.*, 
             u.username, u.email,
             p.name as plan_name, p.type as plan_type,
             pt.transaction_reference, pt.status as transaction_status
      FROM invoices i
      JOIN users u ON i.user_id = u.id
      JOIN plans p ON i.plan_id = p.id
      JOIN payment_transactions pt ON i.transaction_id = pt.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND i.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.status) {
      query += ' AND i.status = ?';
      params.push(filters.status);
    }

    if (filters.start_date) {
      query += ' AND i.issue_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND i.issue_date <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY i.issue_date DESC, i.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await this.db.execute(query, params);
    return rows;
  }

  async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    await this.db.execute(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async generateInvoiceNumber() {
    const prefix = 'INV';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get the last invoice number for this month
    const [rows] = await this.db.execute(
      `SELECT invoice_number FROM invoices 
       WHERE invoice_number LIKE ? 
       ORDER BY invoice_number DESC LIMIT 1`,
      [`${prefix}-${year}${month}-%`]
    );

    let sequence = 1;
    if (rows.length > 0) {
      const lastNumber = rows[0].invoice_number;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
}

module.exports = Invoice;

