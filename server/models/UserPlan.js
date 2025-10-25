// models/UserPlan.js
class UserPlan {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, plan_id, start_date, end_date, auto_renew, payment_reference }) {
    const [result] = await this.db.execute(
      'INSERT INTO user_plan (user_id, plan_id, start_date, end_date, auto_renew, payment_reference) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, plan_id, start_date, end_date, auto_renew, payment_reference]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM user_plan WHERE id = ?', [id]);
    return rows[0];
  }

  async findByUserId(userId) {
    const [rows] = await this.db.execute(
      `SELECT up.*, p.name as plan_name, p.type as plan_type, p.price, p.features, p.website_limit, p.ai_chat_limit
       FROM user_plan up 
       JOIN plans p ON up.plan_id = p.id 
       WHERE up.user_id = ? AND (up.end_date IS NULL OR up.end_date > CURDATE())
       ORDER BY up.created_at DESC 
       LIMIT 1`,
      [userId]
    );
    return rows[0];
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
      `UPDATE user_plan SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async cancelSubscription(userPlanId) {
    await this.db.execute(
      'UPDATE user_plan SET end_date = CURDATE(), auto_renew = FALSE WHERE id = ?',
      [userPlanId]
    );
  }

  async checkAndAutoRenew(userId) {
    // Find active subscriptions that should be renewed
    const [rows] = await this.db.execute(
      `SELECT up.*, p.name as plan_name, p.type as plan_type, p.price
       FROM user_plan up 
       JOIN plans p ON up.plan_id = p.id 
       WHERE up.user_id = ? 
       AND up.auto_renew = TRUE 
       AND up.end_date <= CURDATE()`,
      [userId]
    );

    return rows;
  }

  async findAll(filters = {}) {
    let query = `
      SELECT up.*, p.name as plan_name, p.type as plan_type, p.price, u.username, u.email
      FROM user_plan up 
      JOIN plans p ON up.plan_id = p.id 
      JOIN users u ON up.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (filters.user_id) {
      conditions.push('up.user_id = ?');
      params.push(filters.user_id);
    }

    if (filters.plan_type) {
      conditions.push('p.type = ?');
      params.push(filters.plan_type);
    }

    if (filters.is_active !== undefined) {
      if (filters.is_active) {
        conditions.push('(up.end_date IS NULL OR up.end_date > CURDATE())');
      } else {
        conditions.push('up.end_date IS NOT NULL AND up.end_date <= CURDATE()');
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY up.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await this.db.execute(query, params);
    return rows;
  }

  async delete(id) {
    await this.db.execute('DELETE FROM user_plan WHERE id = ?', [id]);
  }
}

module.exports = UserPlan; 