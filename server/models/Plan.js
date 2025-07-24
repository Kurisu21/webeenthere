// models/Plan.js
class Plan {
  constructor(db) {
    this.db = db;
  }

  async create({ name, price, features, is_active }) {
    const [result] = await this.db.execute(
      'INSERT INTO plans (name, price, features, is_active) VALUES (?, ?, ?, ?)',
      [name, price, features, is_active]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM plans WHERE id = ?', [id]);
    return rows[0];
  }

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM plans');
    return rows;
  }

  async update(id, data) {
    // TODO: Implement update logic
  }

  async delete(id) {
    await this.db.execute('DELETE FROM plans WHERE id = ?', [id]);
  }
}

module.exports = Plan; 