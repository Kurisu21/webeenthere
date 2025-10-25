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

  async findActiveByType(type) {
    const [rows] = await this.db.execute('SELECT * FROM plans WHERE type = ? AND is_active = TRUE', [type]);
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
      `UPDATE plans SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async delete(id) {
    await this.db.execute('DELETE FROM plans WHERE id = ?', [id]);
  }
}

module.exports = Plan; 