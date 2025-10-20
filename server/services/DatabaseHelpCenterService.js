const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class DatabaseHelpCenterService {
  // Categories
  async getAllCategories() {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM help_categories ORDER BY name ASC'
    );
    return rows;
  }

  async getCategoryById(id) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM help_categories WHERE id = ?',
      [id]
    );
    if (rows.length === 0) throw new Error('Category not found');
    return rows[0];
  }

  async createCategory(data) {
    const connection = await getDatabaseConnection();
    const [result] = await connection.execute(
      'INSERT INTO help_categories (name, description, icon) VALUES (?, ?, ?)',
      [data.name, data.description, data.icon]
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
    
    if (updates.length === 0) return this.getCategoryById(id);
    
    params.push(id);
    await connection.execute(
      `UPDATE help_categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.getCategoryById(id);
  }

  async deleteCategory(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('DELETE FROM help_categories WHERE id = ?', [id]);
  }

  // Articles
  async getArticlesByCategory(categoryId, publishedOnly = true) {
    const connection = await getDatabaseConnection();
    let query = `SELECT a.*, u.username as author_name, c.name as category_name 
                 FROM help_articles a 
                 LEFT JOIN users u ON a.author_id = u.id 
                 LEFT JOIN help_categories c ON a.category_id = c.id 
                 WHERE a.category_id = ?`;
    const params = [categoryId];
    
    if (publishedOnly) {
      query += ' AND a.is_published = true';
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const [rows] = await connection.execute(query, params);
    
    // Map database fields to client-expected format
    return rows.map(row => ({
      id: row.id.toString(),
      category: row.category_id.toString(),
      title: row.title,
      content: row.content,
      authorId: row.author_id.toString(),
      tags: [], // Default empty array since tags column doesn't exist
      views: row.views || 0,
      helpful: row.helpful_count || 0,
      notHelpful: row.not_helpful_count || 0,
      isPublished: Boolean(row.is_published),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      authorName: row.author_name,
      categoryName: row.category_name
    }));
  }

  async getArticleById(id) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT a.*, u.username as author_name, c.name as category_name 
       FROM help_articles a 
       LEFT JOIN users u ON a.author_id = u.id 
       LEFT JOIN help_categories c ON a.category_id = c.id 
       WHERE a.id = ?`,
      [id]
    );
    if (rows.length === 0) throw new Error('Article not found');
    return rows[0];
  }

  async createArticle(data) {
    const connection = await getDatabaseConnection();
    const [result] = await connection.execute(
      'INSERT INTO help_articles (category_id, title, content, author_id, is_published) VALUES (?, ?, ?, ?, ?)',
      [data.categoryId, data.title, data.content, data.authorId, data.isPublished || false]
    );
    return this.getArticleById(result.insertId);
  }

  async updateArticle(id, data) {
    const connection = await getDatabaseConnection();
    const updates = [];
    const params = [];
    
    if (data.title) { updates.push('title = ?'); params.push(data.title); }
    if (data.content) { updates.push('content = ?'); params.push(data.content); }
    if (data.is_published !== undefined) { updates.push('is_published = ?'); params.push(data.is_published); }
    
    if (updates.length === 0) return this.getArticleById(id);
    
    params.push(id);
    await connection.execute(
      `UPDATE help_articles SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.getArticleById(id);
  }

  async deleteArticle(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('DELETE FROM help_articles WHERE id = ?', [id]);
  }

  async incrementArticleViews(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('UPDATE help_articles SET views = views + 1 WHERE id = ?', [id]);
  }

  async rateArticle(id, helpful) {
    const connection = await getDatabaseConnection();
    if (helpful) {
      await connection.execute('UPDATE help_articles SET helpful_count = helpful_count + 1 WHERE id = ?', [id]);
    } else {
      await connection.execute('UPDATE help_articles SET not_helpful_count = not_helpful_count + 1 WHERE id = ?', [id]);
    }
  }

  // Search
  async searchArticles(query, categoryId = null) {
    const connection = await getDatabaseConnection();
    let sql = `SELECT a.*, u.username as author_name, c.name as category_name 
               FROM help_articles a 
               LEFT JOIN users u ON a.author_id = u.id 
               LEFT JOIN help_categories c ON a.category_id = c.id 
               WHERE a.is_published = true AND (a.title LIKE ? OR a.content LIKE ?)`;
    const params = [`%${query}%`, `%${query}%`];
    
    if (categoryId) {
      sql += ' AND a.category_id = ?';
      params.push(categoryId);
    }
    
    sql += ' ORDER BY a.views DESC, a.created_at DESC';
    
    const [rows] = await connection.execute(sql, params);
    
    // Map database fields to client-expected format
    return rows.map(row => ({
      id: row.id.toString(),
      category: row.category_id.toString(),
      title: row.title,
      content: row.content,
      authorId: row.author_id.toString(),
      tags: [], // Default empty array since tags column doesn't exist
      views: row.views || 0,
      helpful: row.helpful_count || 0,
      notHelpful: row.not_helpful_count || 0,
      isPublished: Boolean(row.is_published),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      authorName: row.author_name,
      categoryName: row.category_name
    }));
  }

  async getPopularArticles(limit = 10) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT a.*, u.username as author_name, c.name as category_name 
       FROM help_articles a 
       LEFT JOIN users u ON a.author_id = u.id 
       LEFT JOIN help_categories c ON a.category_id = c.id 
       WHERE a.is_published = true 
       ORDER BY a.views DESC, a.helpful_count DESC 
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  async getRecentArticles(limit = 10) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT a.*, u.username as author_name, c.name as category_name 
       FROM help_articles a 
       LEFT JOIN users u ON a.author_id = u.id 
       LEFT JOIN help_categories c ON a.category_id = c.id 
       WHERE a.is_published = true 
       ORDER BY a.created_at DESC 
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Admin functions
  async getAllArticles(publishedOnly = false) {
    const connection = await getDatabaseConnection();
    let query = `SELECT a.*, u.username as author_name, c.name as category_name 
                 FROM help_articles a 
                 LEFT JOIN users u ON a.author_id = u.id 
                 LEFT JOIN help_categories c ON a.category_id = c.id`;
    const params = [];
    
    if (publishedOnly) {
      query += ' WHERE a.is_published = true';
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const [rows] = await connection.execute(query, params);
    
    // Map database fields to client-expected format
    return rows.map(row => ({
      id: row.id.toString(),
      category: row.category_id.toString(),
      title: row.title,
      content: row.content,
      authorId: row.author_id.toString(),
      tags: [], // Default empty array since tags column doesn't exist
      views: row.views || 0,
      helpful: row.helpful_count || 0,
      notHelpful: row.not_helpful_count || 0,
      isPublished: Boolean(row.is_published),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      authorName: row.author_name,
      categoryName: row.category_name
    }));
  }

  // Stats
  async getStats() {
    const connection = await getDatabaseConnection();
    const [categoryStats] = await connection.execute(
      'SELECT COUNT(*) as total_categories FROM help_categories'
    );
    const [articleStats] = await connection.execute(
      'SELECT COUNT(*) as total_articles FROM help_articles'
    );
    const [publishedStats] = await connection.execute(
      'SELECT COUNT(*) as published_articles FROM help_articles WHERE is_published = true'
    );
    const [viewStats] = await connection.execute(
      'SELECT SUM(views) as total_views FROM help_articles'
    );
    
    return {
      totalCategories: categoryStats[0].total_categories,
      totalArticles: articleStats[0].total_articles,
      publishedArticles: publishedStats[0].published_articles,
      totalViews: viewStats[0].total_views || 0
    };
  }
}

module.exports = new DatabaseHelpCenterService();
