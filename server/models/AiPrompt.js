// models/AiPrompt.js
class AiPrompt {
  constructor(db) {
    this.db = db;
  }

  async create({ user_id, prompt_type, prompt_text, response_html, used_on_site }) {
    const [result] = await this.db.execute(
      'INSERT INTO ai_prompts (user_id, prompt_type, prompt_text, response_html, used_on_site) VALUES (?, ?, ?, ?, ?)',
      [user_id, prompt_type, prompt_text, response_html, used_on_site]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.db.execute('SELECT * FROM ai_prompts WHERE id = ?', [id]);
    return rows[0];
  }

  async findAll() {
    const [rows] = await this.db.execute('SELECT * FROM ai_prompts');
    return rows;
  }

  async update(id, data) {
    // TODO: Implement update logic
  }

  async delete(id) {
    await this.db.execute('DELETE FROM ai_prompts WHERE id = ?', [id]);
  }
}

module.exports = AiPrompt; 