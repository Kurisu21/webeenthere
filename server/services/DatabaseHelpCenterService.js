const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class DatabaseHelpCenterService {
  // Categories
  async getAllCategories() {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT c.*, COUNT(a.id) as article_count
       FROM help_categories c
       LEFT JOIN help_articles a ON c.id = a.category_id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    // Map database fields to client-expected format
    return rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description || '',
      icon: row.icon || '',
      articleCount: row.article_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
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
    
    // Map database fields to client-expected format
    const row = rows[0];
    return {
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
    };
  }

  async createArticle(data) {
    const connection = await getDatabaseConnection();
    // Handle both categoryId and category for compatibility
    const categoryId = data.categoryId || data.category;
    if (!categoryId) {
      throw new Error('Category ID is required');
    }
    const [result] = await connection.execute(
      'INSERT INTO help_articles (category_id, title, content, author_id, is_published) VALUES (?, ?, ?, ?, ?)',
      [categoryId, data.title, data.content, data.authorId, data.isPublished !== undefined ? data.isPublished : false]
    );
    return this.getArticleById(result.insertId);
  }

  async updateArticle(id, data) {
    const connection = await getDatabaseConnection();
    const updates = [];
    const params = [];
    
    if (data.title) { updates.push('title = ?'); params.push(data.title); }
    if (data.content) { updates.push('content = ?'); params.push(data.content); }
    if (data.category !== undefined) { 
      updates.push('category_id = ?'); 
      params.push(data.category); 
    }
    if (data.isPublished !== undefined) { 
      updates.push('is_published = ?'); 
      params.push(data.isPublished); 
    } else if (data.is_published !== undefined) { 
      updates.push('is_published = ?'); 
      params.push(data.is_published); 
    }
    
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

  // Increment article view count - simple counter, no user tracking
  // Called automatically when an article is viewed via getArticle endpoint
  async incrementArticleViews(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('UPDATE help_articles SET views = views + 1 WHERE id = ?', [id]);
  }

  async rateArticle(id, helpful, userId) {
    const connection = await getDatabaseConnection();
    
    // Check if user has already voted
    const [existingVotes] = await connection.execute(
      'SELECT * FROM help_article_votes WHERE article_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (existingVotes.length > 0) {
      const existingVote = existingVotes[0];
      // If user is voting the same way, return early
      if (existingVote.is_helpful === helpful) {
        throw new Error('You have already voted on this article');
      }
      
      // User is changing their vote - update the vote and adjust counts
      await connection.execute(
        'UPDATE help_article_votes SET is_helpful = ? WHERE article_id = ? AND user_id = ?',
        [helpful, id, userId]
      );
      
      // Adjust counts: remove old vote, add new vote
      if (existingVote.is_helpful) {
        await connection.execute('UPDATE help_articles SET helpful_count = helpful_count - 1 WHERE id = ?', [id]);
      } else {
        await connection.execute('UPDATE help_articles SET not_helpful_count = not_helpful_count - 1 WHERE id = ?', [id]);
      }
      
      if (helpful) {
        await connection.execute('UPDATE help_articles SET helpful_count = helpful_count + 1 WHERE id = ?', [id]);
      } else {
        await connection.execute('UPDATE help_articles SET not_helpful_count = not_helpful_count + 1 WHERE id = ?', [id]);
      }
    } else {
      // New vote - insert and increment count
      await connection.execute(
        'INSERT INTO help_article_votes (article_id, user_id, is_helpful) VALUES (?, ?, ?)',
        [id, userId, helpful]
      );
      
      if (helpful) {
        await connection.execute('UPDATE help_articles SET helpful_count = helpful_count + 1 WHERE id = ?', [id]);
      } else {
        await connection.execute('UPDATE help_articles SET not_helpful_count = not_helpful_count + 1 WHERE id = ?', [id]);
      }
    }
  }

  async getUserVote(articleId, userId) {
    const connection = await getDatabaseConnection();
    const [votes] = await connection.execute(
      'SELECT is_helpful FROM help_article_votes WHERE article_id = ? AND user_id = ?',
      [articleId, userId]
    );
    // Convert MySQL TINYINT(1) to JavaScript boolean
    // MySQL returns 1 for true, 0 for false, so we need to convert
    if (votes.length > 0) {
      const isHelpful = votes[0].is_helpful;
      // Handle both number (1/0) and boolean (true/false) from database
      return isHelpful === 1 || isHelpful === true;
    }
    return null;
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
    const [helpfulStats] = await connection.execute(
      'SELECT SUM(helpful_count) as total_helpful, SUM(not_helpful_count) as total_not_helpful FROM help_articles'
    );
    
    // Ensure proper number conversion (MySQL SUM can return null or string)
    const totalHelpful = Number(helpfulStats[0]?.total_helpful) || 0;
    const totalNotHelpful = Number(helpfulStats[0]?.total_not_helpful) || 0;
    const totalVotes = totalHelpful + totalNotHelpful;
    
    // Calculate helpful rating percentage
    let helpfulRating = '0.0';
    if (totalVotes > 0) {
      const percentage = (totalHelpful / totalVotes) * 100;
      helpfulRating = percentage.toFixed(1);
    }
    
    return {
      totalCategories: categoryStats[0].total_categories,
      totalArticles: articleStats[0].total_articles,
      publishedArticles: publishedStats[0].published_articles,
      totalViews: viewStats[0].total_views || 0,
      totalHelpful: totalHelpful,
      totalNotHelpful: totalNotHelpful,
      averageRating: helpfulRating
    };
  }
}

module.exports = new DatabaseHelpCenterService();
