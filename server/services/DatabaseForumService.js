const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class DatabaseForumService {
  // Categories
  async getAllCategories() {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM forum_categories WHERE is_active = true ORDER BY name ASC'
    );
    return rows;
  }

  async getCategoryById(id) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM forum_categories WHERE id = ?',
      [id]
    );
    if (rows.length === 0) throw new Error('Category not found');
    return rows[0];
  }

  async createCategory(data) {
    const connection = await getDatabaseConnection();
    const [result] = await connection.execute(
      'INSERT INTO forum_categories (name, description, icon, color) VALUES (?, ?, ?, ?)',
      [data.name, data.description, data.icon, data.color]
    );
    return this.getCategoryById(result.insertId);
  }

  async updateCategory(id, data) {
    const connection = await getDatabaseConnection();
    const updates = [];
    const params = [];
    
    if (data.name) { updates.push('name = ?'); params.push(data.name); }
    if (data.description !== undefined) { updates.push('description = ?'); params.push(data.description); }
    if (data.icon) { updates.push('icon = ?'); params.push(data.icon); }
    if (data.color) { updates.push('color = ?'); params.push(data.color); }
    if (data.is_active !== undefined) { updates.push('is_active = ?'); params.push(data.is_active); }
    
    if (updates.length === 0) return this.getCategoryById(id);
    
    params.push(id);
    await connection.execute(
      `UPDATE forum_categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.getCategoryById(id);
  }

  async deleteCategory(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('UPDATE forum_categories SET is_active = false WHERE id = ?', [id]);
  }

  // Threads
  async getThreadsByCategory(categoryId, page = 1, limit = 10) {
    const connection = await getDatabaseConnection();
    const offset = (page - 1) * limit;
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as author_name, c.name as category_name 
       FROM forum_threads t 
       LEFT JOIN users u ON t.author_id = u.id 
       LEFT JOIN forum_categories c ON t.category_id = c.id 
       WHERE t.category_id = ? AND t.is_deleted = false 
       ORDER BY t.is_pinned DESC, t.created_at DESC 
       LIMIT ? OFFSET ?`,
      [categoryId, limit, offset]
    );
    return rows;
  }

  async getThreadById(id) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as author_name, c.name as category_name 
       FROM forum_threads t 
       LEFT JOIN users u ON t.author_id = u.id 
       LEFT JOIN forum_categories c ON t.category_id = c.id 
       WHERE t.id = ? AND t.is_deleted = false`,
      [id]
    );
    if (rows.length === 0) throw new Error('Thread not found');
    return rows[0];
  }

  async createThread(data) {
    const connection = await getDatabaseConnection();
    const [result] = await connection.execute(
      'INSERT INTO forum_threads (category_id, author_id, title, content) VALUES (?, ?, ?, ?)',
      [data.categoryId, data.authorId, data.title, data.content]
    );
    
    // Update thread count in category
    await connection.execute(
      'UPDATE forum_categories SET thread_count = thread_count + 1, last_activity = NOW() WHERE id = ?',
      [data.categoryId]
    );
    
    return this.getThreadById(result.insertId);
  }

  async updateThread(id, data) {
    const connection = await getDatabaseConnection();
    const updates = [];
    const params = [];
    
    if (data.title) { updates.push('title = ?'); params.push(data.title); }
    if (data.content) { updates.push('content = ?'); params.push(data.content); }
    if (data.is_pinned !== undefined) { updates.push('is_pinned = ?'); params.push(data.is_pinned); }
    if (data.is_locked !== undefined) { updates.push('is_locked = ?'); params.push(data.is_locked); }
    
    if (updates.length === 0) return this.getThreadById(id);
    
    params.push(id);
    await connection.execute(
      `UPDATE forum_threads SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.getThreadById(id);
  }

  async deleteThread(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('UPDATE forum_threads SET is_deleted = true WHERE id = ?', [id]);
  }

  async incrementThreadViews(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('UPDATE forum_threads SET views = views + 1 WHERE id = ?', [id]);
  }

  // Replies
  async getRepliesByThread(threadId, page = 1, limit = 10) {
    const connection = await getDatabaseConnection();
    const offset = (page - 1) * limit;
    const [rows] = await connection.execute(
      `SELECT r.*, u.username as author_name 
       FROM forum_replies r 
       LEFT JOIN users u ON r.author_id = u.id 
       WHERE r.thread_id = ? AND r.is_deleted = false 
       ORDER BY r.created_at ASC 
       LIMIT ? OFFSET ?`,
      [threadId, limit, offset]
    );
    return rows;
  }

  async createReply(data) {
    const connection = await getDatabaseConnection();
    const [result] = await connection.execute(
      'INSERT INTO forum_replies (thread_id, author_id, content) VALUES (?, ?, ?)',
      [data.threadId, data.authorId, data.content]
    );
    
    // Update reply count in thread
    await connection.execute(
      'UPDATE forum_threads SET replies_count = replies_count + 1 WHERE id = ?',
      [data.threadId]
    );
    
    return result.insertId;
  }

  async updateReply(id, data) {
    const connection = await getDatabaseConnection();
    const updates = [];
    const params = [];
    
    if (data.content) { updates.push('content = ?'); params.push(data.content); }
    
    if (updates.length === 0) return;
    
    params.push(id);
    await connection.execute(
      `UPDATE forum_replies SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  async deleteReply(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('UPDATE forum_replies SET is_deleted = true WHERE id = ?', [id]);
  }

  // Search
  async searchThreads(query, categoryId = null) {
    const connection = await getDatabaseConnection();
    let sql = `SELECT t.*, u.username as author_name, c.name as category_name 
               FROM forum_threads t 
               LEFT JOIN users u ON t.author_id = u.id 
               LEFT JOIN forum_categories c ON t.category_id = c.id 
               WHERE t.is_deleted = false AND (t.title LIKE ? OR t.content LIKE ?)`;
    const params = [`%${query}%`, `%${query}%`];
    
    if (categoryId) {
      sql += ' AND t.category_id = ?';
      params.push(categoryId);
    }
    
    sql += ' ORDER BY t.created_at DESC';
    
    const [rows] = await connection.execute(sql, params);
    return rows;
  }

  // Stats
  async getStats() {
    const connection = await getDatabaseConnection();
    const [categoryStats] = await connection.execute(
      'SELECT COUNT(*) as total_categories FROM forum_categories WHERE is_active = true'
    );
    const [threadStats] = await connection.execute(
      'SELECT COUNT(*) as total_threads FROM forum_threads WHERE is_deleted = false'
    );
    const [replyStats] = await connection.execute(
      'SELECT COUNT(*) as total_replies FROM forum_replies WHERE is_deleted = false'
    );
    
    return {
      totalCategories: categoryStats[0].total_categories,
      totalThreads: threadStats[0].total_threads,
      totalReplies: replyStats[0].total_replies
    };
  }
}

module.exports = new DatabaseForumService();
