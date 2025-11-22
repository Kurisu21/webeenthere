// models/AiPrompt.js
class AiPrompt {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, prompt_type, prompt_text, response_html, used_on_site, website_id, conversation_id, message_type, execution_status }) {
    const [result] = await this.db.execute(
      'INSERT INTO ai_prompts (user_id, prompt_type, prompt_text, response_html, used_on_site, website_id, conversation_id, message_type, execution_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, prompt_type, prompt_text, response_html, used_on_site || false, website_id || null, conversation_id || null, message_type || 'user', execution_status || 'pending']
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM ai_prompts WHERE id = ?', [id]);
    return rows[0];
  }

  async findByUserId(userId) {
    const [rows] = await this.db.execute(
      'SELECT * FROM ai_prompts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM ai_prompts');
    return rows;
  }

  async update(id, data) {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    
    await this.db.execute(
      `UPDATE ai_prompts SET ${fields} WHERE id = ?`,
      values
    );
  }

  async delete(id) {
    await this.db.execute('DELETE FROM ai_prompts WHERE id = ?', [id]);
  }

  async findByWebsiteId(websiteId) {
    const [rows] = await this.db.execute(
      'SELECT * FROM ai_prompts WHERE website_id = ? ORDER BY created_at ASC',
      [websiteId]
    );
    return rows;
  }

  async findByConversationId(conversationId) {
    const [rows] = await this.db.execute(
      'SELECT * FROM ai_prompts WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );
    return rows;
  }

  async updateExecutionStatus(id, status) {
    await this.db.execute(
      'UPDATE ai_prompts SET execution_status = ? WHERE id = ?',
      [status, id]
    );
  }
}

module.exports = AiPrompt; 