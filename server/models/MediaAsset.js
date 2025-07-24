// models/MediaAsset.js
class MediaAsset {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, website_id, file_name, file_type, file_url }) {
    const [result] = await this.db.execute(
      'INSERT INTO media_assets (user_id, website_id, file_name, file_type, file_url) VALUES (?, ?, ?, ?, ?)',
      [user_id, website_id, file_name, file_type, file_url]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM media_assets WHERE id = ?', [id]);
    return rows[0];
  }

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM media_assets');
    return rows;
  }

  async update(id, data) {
    // TODO: Implement update logic
  }

  async delete(id) {
    await this.db.execute('DELETE FROM media_assets WHERE id = ?', [id]);
  }
}

module.exports = MediaAsset; 