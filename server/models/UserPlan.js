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

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM user_plan');
    return rows;
  }

  async update(id, data) {
    // TODO: Implement update logic
  }

  async delete(id) {
    await this.db.execute('DELETE FROM user_plan WHERE id = ?', [id]);
  }
}

module.exports = UserPlan; 