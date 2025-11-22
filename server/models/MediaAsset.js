// models/MediaAsset.js
class MediaAsset {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, website_id, file_name, file_type, file_url, file_size }) {
    // Insert without file_size (column may not exist in older schemas)
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
    const [rows] = await this.db.execute('SELECT * FROM media_assets ORDER BY uploaded_at DESC');
    return rows;
  }

  async findByUserId(userId) {
    const [rows] = await this.db.execute(
      'SELECT * FROM media_assets WHERE user_id = ? ORDER BY uploaded_at DESC',
      [userId]
    );
    return rows;
  }

  async findByWebsiteId(websiteId) {
    const [rows] = await this.db.execute(
      'SELECT * FROM media_assets WHERE website_id = ? ORDER BY uploaded_at DESC',
      [websiteId]
    );
    return rows;
  }

  async findByUserAndWebsite(userId, websiteId = null) {
    if (websiteId) {
      // Get images from this website OR from user's other websites
      const [rows] = await this.db.execute(
        `SELECT ma.*, w.title as website_title, w.slug as website_slug 
         FROM media_assets ma
         LEFT JOIN websites w ON ma.website_id = w.id
         WHERE ma.user_id = ? AND (ma.website_id = ? OR ma.website_id IS NOT NULL)
         ORDER BY ma.uploaded_at DESC`,
        [userId, websiteId]
      );
      return rows;
    } else {
      // Get all user images
      const [rows] = await this.db.execute(
        `SELECT ma.*, w.title as website_title, w.slug as website_slug 
         FROM media_assets ma
         LEFT JOIN websites w ON ma.website_id = w.id
         WHERE ma.user_id = ?
         ORDER BY ma.uploaded_at DESC`,
        [userId]
      );
      return rows;
    }
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    
    if (data.file_name) {
      fields.push('file_name = ?');
      values.push(data.file_name);
    }
    if (data.website_id !== undefined) {
      fields.push('website_id = ?');
      values.push(data.website_id);
    }
    
    if (fields.length === 0) return;
    
    values.push(id);
    await this.db.execute(
      `UPDATE media_assets SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async delete(id) {
    await this.db.execute('DELETE FROM media_assets WHERE id = ?', [id]);
  }

  async deleteByUserId(userId) {
    await this.db.execute('DELETE FROM media_assets WHERE user_id = ?', [userId]);
  }
}

module.exports = MediaAsset; 