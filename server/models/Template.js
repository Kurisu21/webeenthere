// models/Template.js
class Template {
  constructor(db) {
    this.db = db;
  }

  async create({ name, description, category, html_base, css_base, is_featured, is_active, is_community, creator_user_id, source_website_id }) {
    const [result] = await this.db.execute(
      'INSERT INTO templates (name, description, category, html_base, css_base, is_featured, is_active, is_community, creator_user_id, source_website_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, category, html_base, css_base, is_featured, is_active, is_community || false, creator_user_id, source_website_id]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM templates WHERE id = ?', [id]);
    return rows[0];
  }

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM templates WHERE is_active = 1');
    return rows;
  }

  async findByCategory(category) {
    const [rows] = await this.db.execute('SELECT * FROM templates WHERE category = ? AND is_active = 1', [category]);
    return rows;
  }

  async findFeatured() {
    const [rows] = await this.db.execute('SELECT * FROM templates WHERE is_featured = 1 AND is_active = 1');
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
    const query = `UPDATE templates SET ${fields.join(', ')} WHERE id = ?`;
    await this.db.execute(query, values);
  }

  async delete(id) {
    await this.db.execute('DELETE FROM templates WHERE id = ?', [id]);
  }

  // NEW: Community Template Methods
  async findCommunityTemplates() {
    const [rows] = await this.db.execute('SELECT * FROM templates WHERE is_community = 1 AND is_active = 1 ORDER BY created_at DESC');
    return rows;
  }

  async findOfficialTemplates() {
    const [rows] = await this.db.execute('SELECT * FROM templates WHERE is_community = 0 AND is_active = 1 ORDER BY is_featured DESC, created_at DESC');
    return rows;
  }

  async findByCreator(userId) {
    const [rows] = await this.db.execute('SELECT * FROM templates WHERE creator_user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
  }

  async createFromWebsite(websiteId, userId, { name, description, category }) {
    // First get the website data
    const [websiteRows] = await this.db.execute('SELECT html_content, css_content FROM websites WHERE id = ? AND user_id = ? AND is_published = 1', [websiteId, userId]);
    
    if (websiteRows.length === 0) {
      throw new Error('Website not found or not published');
    }

    const website = websiteRows[0];
    
    // Create template from website
    const templateId = await this.create({
      name,
      description,
      category,
      html_base: website.html_content,
      css_base: website.css_content,
      is_featured: false,
      is_active: true,
      is_community: true,
      creator_user_id: userId,
      source_website_id: websiteId
    });

    return templateId;
  }

  async toggleActive(id, isActive) {
    await this.db.execute('UPDATE templates SET is_active = ? WHERE id = ?', [isActive, id]);
  }

  async findAllWithCreator() {
    const [rows] = await this.db.execute(`
      SELECT t.*, u.username as creator_username, u.email as creator_email 
      FROM templates t 
      LEFT JOIN users u ON t.creator_user_id = u.id 
      ORDER BY t.created_at DESC
    `);
    return rows;
  }

  async findActiveWithCreator() {
    const [rows] = await this.db.execute(`
      SELECT t.*, u.username as creator_username, u.email as creator_email 
      FROM templates t 
      LEFT JOIN users u ON t.creator_user_id = u.id 
      WHERE t.is_active = 1
      ORDER BY t.created_at DESC
    `);
    return rows;
  }
}

module.exports = Template; 