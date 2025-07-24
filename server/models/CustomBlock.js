// models/CustomBlock.js
class CustomBlock {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, name, block_type, html_content, css_content }) {
    const [result] = await this.db.execute(
      'INSERT INTO custom_blocks (user_id, name, block_type, html_content, css_content) VALUES (?, ?, ?, ?, ?)',
      [user_id, name, block_type, html_content, css_content]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM custom_blocks WHERE id = ?', [id]);
    return rows[0];
  }

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM custom_blocks');
    return rows;
  }

  async update(id, data) {
    // TODO: Implement update logic
  }

  async delete(id) {
    await this.db.execute('DELETE FROM custom_blocks WHERE id = ?', [id]);
  }
}

module.exports = CustomBlock; 