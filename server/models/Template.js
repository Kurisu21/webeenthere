// models/Template.js
class Template {
  constructor(db) {
    this.db = db;
  }

  async create({ name, description, category, html_base, css_base, is_featured, is_active }) {
    const [result] = await this.db.execute(
      'INSERT INTO templates (name, description, category, html_base, css_base, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, category, html_base, css_base, is_featured, is_active]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM templates WHERE id = ?', [id]);
    return rows[0];
  }

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM templates');
    return rows;
  }

  async update(id, data) {
    // TODO: Implement update logic
  }

  async delete(id) {
    await this.db.execute('DELETE FROM templates WHERE id = ?', [id]);
  }
}

module.exports = Template; 