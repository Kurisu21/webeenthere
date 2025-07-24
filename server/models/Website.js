// models/Website.js
class Website {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, title, slug, html_content, css_content, template_id, is_published, is_active }) {
    const [result] = await this.db.execute(
      'INSERT INTO websites (user_id, title, slug, html_content, css_content, template_id, is_published, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, slug, html_content, css_content, template_id, is_published, is_active]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM websites WHERE id = ?', [id]);
    return rows[0];
  }

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM websites');
    return rows;
  }

  async update(id, data) {
    // TODO: Implement update logic
  }

  async delete(id) {
    await this.db.execute('DELETE FROM websites WHERE id = ?', [id]);
  }
}

module.exports = Website; 