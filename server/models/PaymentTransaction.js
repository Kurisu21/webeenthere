// models/PaymentTransaction.js
class PaymentTransaction {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, plan_id, amount, status, transaction_reference }) {
    const [result] = await this.db.execute(
      'INSERT INTO payment_transactions (user_id, plan_id, amount, status, transaction_reference) VALUES (?, ?, ?, ?, ?)',
      [user_id, plan_id, amount, status, transaction_reference]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM payment_transactions WHERE id = ?', [id]);
    return rows[0];
  }

  async findByUserId(userId, limit = 50) {
    const [rows] = await this.db.execute(
      `SELECT pt.*, p.name as plan_name, p.type as plan_type 
       FROM payment_transactions pt 
       JOIN plans p ON pt.plan_id = p.id 
       WHERE pt.user_id = ? 
       ORDER BY pt.created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  async findByTransactionReference(reference) {
    const [rows] = await this.db.execute('SELECT * FROM payment_transactions WHERE transaction_reference = ?', [reference]);
    return rows[0];
  }

  async findAll(filters = {}) {
    let query = `
      SELECT pt.*, p.name as plan_name, p.type as plan_type, u.username, u.email
      FROM payment_transactions pt 
      JOIN plans p ON pt.plan_id = p.id 
      JOIN users u ON pt.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (filters.user_id) {
      conditions.push('pt.user_id = ?');
      params.push(filters.user_id);
    }

    if (filters.status) {
      conditions.push('pt.status = ?');
      params.push(filters.status);
    }

    if (filters.start_date) {
      conditions.push('pt.created_at >= ?');
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      conditions.push('pt.created_at <= ?');
      params.push(filters.end_date);
    }

    if (filters.min_amount) {
      conditions.push('pt.amount >= ?');
      params.push(filters.min_amount);
    }

    if (filters.max_amount) {
      conditions.push('pt.amount <= ?');
      params.push(filters.max_amount);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY pt.created_at DESC';

    // Add OFFSET for pagination
    if (filters.offset !== undefined) {
      query += ' LIMIT ? OFFSET ?';
      params.push(filters.limit || 50);
      params.push(filters.offset);
    } else if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await this.db.execute(query, params);
    return rows;
  }

  async count(filters = {}) {
    let query = `
      SELECT COUNT(*) as total
      FROM payment_transactions pt
    `;
    const params = [];
    const conditions = [];

    if (filters.user_id) {
      conditions.push('pt.user_id = ?');
      params.push(filters.user_id);
    }

    if (filters.status) {
      conditions.push('pt.status = ?');
      params.push(filters.status);
    }

    if (filters.start_date) {
      conditions.push('pt.created_at >= ?');
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      conditions.push('pt.created_at <= ?');
      params.push(filters.end_date);
    }

    if (filters.min_amount) {
      conditions.push('pt.amount >= ?');
      params.push(filters.min_amount);
    }

    if (filters.max_amount) {
      conditions.push('pt.amount <= ?');
      params.push(filters.max_amount);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await this.db.execute(query, params);
    return rows[0].total;
  }

  async updateStatus(id, status) {
    await this.db.execute(
      'UPDATE payment_transactions SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  async getStats() {
    const [rows] = await this.db.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM payment_transactions 
      GROUP BY status
    `);
    return rows;
  }
}

module.exports = PaymentTransaction;



