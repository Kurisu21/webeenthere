// models/WebsiteAnalytics.js
class WebsiteAnalytics {
  constructor(db) {
    this.db = db;
  }

  async create({ website_id, visit_time, visitor_ip, user_agent, referrer }) {
    const [result] = await this.db.execute(
      'INSERT INTO website_analytics (website_id, visit_time, visitor_ip, user_agent, referrer) VALUES (?, ?, ?, ?, ?)',
      [website_id, visit_time, visitor_ip, user_agent, referrer]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM website_analytics WHERE id = ?', [id]);
    return rows[0];
  }

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM website_analytics');
    return rows;
  }

  async update(id, data) {
    // TODO: Implement update logic
  }

  async delete(id) {
    await this.db.execute('DELETE FROM website_analytics WHERE id = ?', [id]);
  }
}

module.exports = WebsiteAnalytics; 