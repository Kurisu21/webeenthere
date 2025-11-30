// models/SubscriptionLog.js
class SubscriptionLog {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, plan_id, action, payment_status, amount, payment_reference }) {
    const [result] = await this.db.execute(
      'INSERT INTO subscription_logs (user_id, plan_id, action, payment_status, amount, payment_reference) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, plan_id, action, payment_status, amount, payment_reference]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM subscription_logs WHERE id = ?', [id]);
    return rows[0];
  }

  async findByUserId(userId, limit = 50) {
    const [rows] = await this.db.execute(
      `SELECT sl.*, p.name as plan_name, p.type as plan_type 
       FROM subscription_logs sl 
       JOIN plans p ON sl.plan_id = p.id 
       WHERE sl.user_id = ? 
       ORDER BY sl.created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  async findAll(filters = {}) {
    let query = `
      SELECT sl.*, p.name as plan_name, p.type as plan_type, u.username, u.email
      FROM subscription_logs sl 
      JOIN plans p ON sl.plan_id = p.id 
      JOIN users u ON sl.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (filters.user_id) {
      conditions.push('sl.user_id = ?');
      params.push(filters.user_id);
    }

    if (filters.action) {
      conditions.push('sl.action = ?');
      params.push(filters.action);
    }

    if (filters.payment_status) {
      conditions.push('sl.payment_status = ?');
      params.push(filters.payment_status);
    }

    if (filters.start_date) {
      conditions.push('sl.created_at >= ?');
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      conditions.push('sl.created_at <= ?');
      params.push(filters.end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sl.created_at DESC';

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
      FROM subscription_logs sl
    `;
    const params = [];
    const conditions = [];

    if (filters.user_id) {
      conditions.push('sl.user_id = ?');
      params.push(filters.user_id);
    }

    if (filters.action) {
      conditions.push('sl.action = ?');
      params.push(filters.action);
    }

    if (filters.payment_status) {
      conditions.push('sl.payment_status = ?');
      params.push(filters.payment_status);
    }

    if (filters.start_date) {
      conditions.push('sl.created_at >= ?');
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      conditions.push('sl.created_at <= ?');
      params.push(filters.end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await this.db.execute(query, params);
    return rows[0].total;
  }

  async getStats() {
    const [rows] = await this.db.execute(`
      SELECT 
        action,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM subscription_logs 
      WHERE payment_status = 'completed'
      GROUP BY action
    `);
    return rows;
  }
}

module.exports = SubscriptionLog;



