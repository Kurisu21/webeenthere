// models/Website.js
class Website {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, title, slug, html_content, css_content, template_id, is_published, is_active, preview_url }) {
    const [result] = await this.db.execute(
      'INSERT INTO websites (user_id, title, slug, html_content, css_content, template_id, is_published, is_active, preview_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, slug, html_content, css_content, template_id, is_published, is_active, preview_url || null]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM websites WHERE id = ?', [id]);
    return rows[0];
  }

  async findByUserId(user_id) {
    const [rows] = await this.db.execute('SELECT * FROM websites WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
    return rows;
  }

  async findBySlug(slug) {
    const [rows] = await this.db.execute('SELECT * FROM websites WHERE slug = ?', [slug]);
    return rows[0];
  }

  async findPublicWebsites() {
    const [rows] = await this.db.execute('SELECT * FROM websites WHERE is_published = 1 ORDER BY created_at DESC');
    return rows;
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
    const query = `UPDATE websites SET ${fields.join(', ')} WHERE id = ?`;
    
    console.log(`[Website Model] Executing UPDATE query for website ${id}`);
    console.log(`[Website Model] Fields being updated: ${fields.join(', ')}`);
    if (data.html_content) {
      console.log(`[Website Model] HTML content length: ${data.html_content.length}`);
    }
    if (data.css_content) {
      console.log(`[Website Model] CSS content length: ${data.css_content.length}`);
    }
    
    const [result] = await this.db.execute(query, values);
    console.log(`[Website Model] Update result - Affected rows: ${result.affectedRows}`);
    
    return result;
  }

  async delete(id) {
    await this.db.execute('DELETE FROM websites WHERE id = ?', [id]);
  }

  async getPublishedWebsites() {
    const [rows] = await this.db.execute('SELECT * FROM websites WHERE is_published = 1 AND is_active = 1');
    return rows;
  }
}

module.exports = Website;