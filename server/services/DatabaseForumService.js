const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class DatabaseForumService {
  // Categories
  async getAllCategories() {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT c.*, 
              COUNT(DISTINCT t.id) as threadCount,
              MAX(t.updated_at) as lastActivity
       FROM forum_categories c
       LEFT JOIN forum_threads t ON c.id = t.category_id AND t.is_deleted = false
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    
    return rows.map(row => ({
      ...row,
      threadCount: parseInt(row.threadCount) || 0,
      lastActivity: row.lastActivity || null
    }));
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
  async getThreadsByCategory(categoryId, page = 1, limit = 10, sortBy = 'updatedAt') {
    const connection = await getDatabaseConnection();
    const offset = (page - 1) * limit;
    
    // Build ORDER BY clause based on sortBy
    let orderBy = 't.is_pinned DESC, ';
    switch (sortBy) {
      case 'replies':
        orderBy += 't.replies_count DESC';
        break;
      case 'views':
        orderBy += 't.views DESC';
        break;
      case 'likes':
        orderBy += 't.likes DESC';
        break;
      case 'updatedAt':
      default:
        orderBy += 't.updated_at DESC, t.created_at DESC';
        break;
    }
    
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as author_name, COALESCE(u.id, t.author_id) as author_id, c.name as category_name, t.category_id as categoryId
       FROM forum_threads t 
       LEFT JOIN users u ON t.author_id = u.id 
       LEFT JOIN forum_categories c ON t.category_id = c.id 
       WHERE t.category_id = ? AND t.is_deleted = false 
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [categoryId, limit, offset]
    );
    
    // Get total count
    const [countRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM forum_threads WHERE category_id = ? AND is_deleted = false`,
      [categoryId]
    );
    const total = countRows[0].total;
    
    // Map replies_count to replies for consistency and ensure author_id and categoryId
    return {
      threads: rows.map(row => ({
        ...row,
        author_id: row.author_id || row.authorId,
        categoryId: (row.categoryId || row.category_id)?.toString() || '',
        replies: row.replies_count || 0
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getThreadsByAuthor(authorId, page = 1, limit = 10, sortBy = 'updatedAt') {
    const connection = await getDatabaseConnection();
    const offset = (page - 1) * limit;
    
    // Build ORDER BY clause based on sortBy
    let orderBy = 't.is_pinned DESC, ';
    switch (sortBy) {
      case 'replies':
        orderBy += 't.replies_count DESC';
        break;
      case 'views':
        orderBy += 't.views DESC';
        break;
      case 'likes':
        orderBy += 't.likes DESC';
        break;
      case 'updatedAt':
      default:
        orderBy += 't.updated_at DESC, t.created_at DESC';
        break;
    }
    
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as author_name, COALESCE(u.id, t.author_id) as author_id, c.name as category_name, t.category_id as categoryId
       FROM forum_threads t 
       LEFT JOIN users u ON t.author_id = u.id 
       LEFT JOIN forum_categories c ON t.category_id = c.id 
       WHERE t.author_id = ? AND t.is_deleted = false 
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [authorId, limit, offset]
    );
    
    // Get total count
    const [countRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM forum_threads WHERE author_id = ? AND is_deleted = false`,
      [authorId]
    );
    const total = countRows[0].total;
    
    return {
      threads: rows.map(row => ({
        ...row,
        author_id: row.author_id || row.authorId,
        categoryId: (row.categoryId || row.category_id)?.toString() || '',
        replies: row.replies_count || 0
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getAllThreads(page = 1, limit = 10, sortBy = 'updatedAt') {
    const connection = await getDatabaseConnection();
    const offset = (page - 1) * limit;
    
    // Build ORDER BY clause based on sortBy
    let orderBy = 't.is_pinned DESC, ';
    switch (sortBy) {
      case 'replies':
        orderBy += 't.replies_count DESC';
        break;
      case 'views':
        orderBy += 't.views DESC';
        break;
      case 'likes':
        orderBy += 't.likes DESC';
        break;
      case 'updatedAt':
      default:
        orderBy += 't.updated_at DESC, t.created_at DESC';
        break;
    }
    
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as author_name, COALESCE(u.id, t.author_id) as author_id, c.name as category_name, t.category_id as categoryId
       FROM forum_threads t 
       LEFT JOIN users u ON t.author_id = u.id 
       LEFT JOIN forum_categories c ON t.category_id = c.id 
       WHERE t.is_deleted = false 
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // Get total count
    const [countRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM forum_threads WHERE is_deleted = false`
    );
    const total = countRows[0].total;
    
    return {
      threads: rows.map(row => ({
        ...row,
        author_id: row.author_id || row.authorId,
        categoryId: (row.categoryId || row.category_id)?.toString() || '',
        replies: row.replies_count || 0
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPinnedThreads(limit = 10) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as author_name, COALESCE(u.id, t.author_id) as author_id, c.name as category_name, t.category_id as categoryId
       FROM forum_threads t 
       LEFT JOIN users u ON t.author_id = u.id 
       LEFT JOIN forum_categories c ON t.category_id = c.id 
       WHERE t.is_pinned = true AND t.is_deleted = false 
       ORDER BY t.created_at DESC 
       LIMIT ?`,
      [limit]
    );
    
    return rows.map(row => ({
      ...row,
      author_id: row.author_id || row.authorId,
      categoryId: (row.categoryId || row.category_id)?.toString() || '',
      replies: row.replies_count || 0
    }));
  }

  // Sort threads helper method
  sortThreads(threads, sortBy = 'updatedAt') {
    if (!Array.isArray(threads)) return threads;
    
    return threads.sort((a, b) => {
      // Always put pinned threads first
      const aPinned = a.is_pinned || a.isPinned || false;
      const bPinned = b.is_pinned || b.isPinned || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      // Then sort by the specified field
      switch (sortBy) {
        case 'replies':
          return (b.replies_count || b.replies || 0) - (a.replies_count || a.replies || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        case 'updatedAt':
        default:
          const aDate = new Date(a.updated_at || a.updatedAt || a.created_at || a.createdAt || 0);
          const bDate = new Date(b.updated_at || b.updatedAt || b.created_at || b.createdAt || 0);
          return bDate.getTime() - aDate.getTime();
      }
    });
  }

  async getThreadById(id, userId = null) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as author_name, COALESCE(u.id, t.author_id) as author_id, c.name as category_name, t.category_id as categoryId
       FROM forum_threads t 
       LEFT JOIN users u ON t.author_id = u.id 
       LEFT JOIN forum_categories c ON t.category_id = c.id 
       WHERE t.id = ? AND t.is_deleted = false`,
      [id]
    );
    if (rows.length === 0) throw new Error('Thread not found');
    const thread = rows[0];
    
    // Ensure author_id is set (use thread's author_id as fallback)
    if (!thread.author_id && thread.authorId) {
      thread.author_id = thread.authorId;
    }
    
    // Ensure categoryId is set (map from category_id)
    if (!thread.categoryId && thread.category_id) {
      thread.categoryId = thread.category_id.toString();
    } else if (thread.categoryId) {
      thread.categoryId = thread.categoryId.toString();
    }
    
    // Map replies_count to replies for consistency
    thread.replies = thread.replies_count || 0;
    
    // Get user's like status if userId provided
    if (userId) {
      thread.userLiked = await this.getUserThreadLike(id, userId);
    }
    
    return thread;
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
    if (data.categoryId !== undefined) { updates.push('category_id = ?'); params.push(data.categoryId); }
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

  // Simple in-memory cache to prevent duplicate view increments within a short time window
  // Format: { threadId: timestamp }
  static viewIncrementCache = {};
  static VIEW_INCREMENT_COOLDOWN = 2000; // 2 seconds cooldown between increments for same thread

  async incrementThreadViews(id) {
    const now = Date.now();
    const lastIncrement = DatabaseForumService.viewIncrementCache[id];
    
    // Prevent duplicate increments within cooldown period
    if (lastIncrement && (now - lastIncrement) < DatabaseForumService.VIEW_INCREMENT_COOLDOWN) {
      console.log(`Skipping duplicate view increment for thread ${id} (cooldown active)`);
      return; // Skip increment if within cooldown period
    }
    
    // Update cache with current timestamp
    DatabaseForumService.viewIncrementCache[id] = now;
    
    // Clean up old cache entries (older than 1 minute) to prevent memory leak
    const oneMinuteAgo = now - 60000;
    Object.keys(DatabaseForumService.viewIncrementCache).forEach(threadId => {
      if (DatabaseForumService.viewIncrementCache[threadId] < oneMinuteAgo) {
        delete DatabaseForumService.viewIncrementCache[threadId];
      }
    });
    
    const connection = await getDatabaseConnection();
    await connection.execute('UPDATE forum_threads SET views = views + 1 WHERE id = ?', [id]);
  }

  // Replies
  async getRepliesByThread(threadId, page = 1, limit = 10, userId = null) {
    const connection = await getDatabaseConnection();
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM forum_replies WHERE thread_id = ? AND is_deleted = false`,
      [threadId]
    );
    const total = countRows[0].total;
    
    // Get replies
    const [rows] = await connection.execute(
      `SELECT r.*, u.username as author_name, COALESCE(u.id, r.author_id) as author_id 
       FROM forum_replies r 
       LEFT JOIN users u ON r.author_id = u.id 
       WHERE r.thread_id = ? AND r.is_deleted = false 
       ORDER BY r.created_at ASC 
       LIMIT ? OFFSET ?`,
      [threadId, limit, offset]
    );
    
    // Ensure author_id is set for each reply
    rows.forEach(reply => {
      if (!reply.author_id) {
        reply.author_id = reply.authorId;
      }
    });
    
    // Get user's like status for each reply if userId provided
    if (userId) {
      for (const reply of rows) {
        reply.userLiked = await this.getUserReplyLike(reply.id, userId);
      }
    }
    
    return {
      replies: rows,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    };
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
    let sql = `SELECT t.*, u.username as author_name, COALESCE(u.id, t.author_id) as author_id, c.name as category_name, t.category_id as categoryId
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
    // Map replies_count to replies for consistency and ensure author_id and categoryId
    return rows.map(row => ({
      ...row,
      author_id: row.author_id || row.authorId,
      categoryId: (row.categoryId || row.category_id)?.toString() || '',
      replies: row.replies_count || 0
    }));
  }

  // Thread Likes
  async toggleThreadLike(threadId, userId) {
    const connection = await getDatabaseConnection();
    
    // Check if user is the author of the thread
    const [threadRows] = await connection.execute(
      'SELECT author_id FROM forum_threads WHERE id = ?',
      [threadId]
    );
    
    if (threadRows.length === 0) {
      throw new Error('Thread not found');
    }
    
    if (threadRows[0].author_id == userId) {
      throw new Error('You cannot like your own thread');
    }
    
    // Check if user has already liked
    const [existingLikes] = await connection.execute(
      'SELECT * FROM forum_thread_likes WHERE thread_id = ? AND user_id = ?',
      [threadId, userId]
    );
    
    if (existingLikes.length > 0) {
      const existingLike = existingLikes[0];
      // If user has liked (likes = 1), remove like (set to 0)
      if (existingLike.likes === 1) {
        await connection.execute(
          'UPDATE forum_thread_likes SET likes = 0 WHERE thread_id = ? AND user_id = ?',
          [threadId, userId]
        );
        // Decrement thread likes count
        await connection.execute('UPDATE forum_threads SET likes = likes - 1 WHERE id = ?', [threadId]);
        return { liked: false };
      } else {
        // User previously unliked, now liking again
        await connection.execute(
          'UPDATE forum_thread_likes SET likes = 1 WHERE thread_id = ? AND user_id = ?',
          [threadId, userId]
        );
        // Increment thread likes count
        await connection.execute('UPDATE forum_threads SET likes = likes + 1 WHERE id = ?', [threadId]);
        return { liked: true };
      }
    } else {
      // New like - insert and increment count
      await connection.execute(
        'INSERT INTO forum_thread_likes (thread_id, user_id, likes) VALUES (?, ?, 1)',
        [threadId, userId]
      );
      await connection.execute('UPDATE forum_threads SET likes = likes + 1 WHERE id = ?', [threadId]);
      return { liked: true };
    }
  }

  async getUserThreadLike(threadId, userId) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      'SELECT likes FROM forum_thread_likes WHERE thread_id = ? AND user_id = ?',
      [threadId, userId]
    );
    if (rows.length === 0) return null;
    return rows[0].likes === 1;
  }

  // Reply Likes
  async toggleReplyLike(replyId, userId) {
    const connection = await getDatabaseConnection();
    
    // Check if user is the author of the reply
    const [replyRows] = await connection.execute(
      'SELECT author_id FROM forum_replies WHERE id = ?',
      [replyId]
    );
    
    if (replyRows.length === 0) {
      throw new Error('Reply not found');
    }
    
    if (replyRows[0].author_id == userId) {
      throw new Error('You cannot like your own reply');
    }
    
    // Check if user has already liked
    const [existingLikes] = await connection.execute(
      'SELECT * FROM forum_reply_likes WHERE reply_id = ? AND user_id = ?',
      [replyId, userId]
    );
    
    if (existingLikes.length > 0) {
      const existingLike = existingLikes[0];
      // If user has liked (likes = 1), remove like (set to 0)
      if (existingLike.likes === 1) {
        await connection.execute(
          'UPDATE forum_reply_likes SET likes = 0 WHERE reply_id = ? AND user_id = ?',
          [replyId, userId]
        );
        // Decrement reply likes count
        await connection.execute('UPDATE forum_replies SET likes = likes - 1 WHERE id = ?', [replyId]);
        return { liked: false };
      } else {
        // User previously unliked, now liking again
        await connection.execute(
          'UPDATE forum_reply_likes SET likes = 1 WHERE reply_id = ? AND user_id = ?',
          [replyId, userId]
        );
        // Increment reply likes count
        await connection.execute('UPDATE forum_replies SET likes = likes + 1 WHERE id = ?', [replyId]);
        return { liked: true };
      }
    } else {
      // New like - insert and increment count
      await connection.execute(
        'INSERT INTO forum_reply_likes (reply_id, user_id, likes) VALUES (?, ?, 1)',
        [replyId, userId]
      );
      await connection.execute('UPDATE forum_replies SET likes = likes + 1 WHERE id = ?', [replyId]);
      return { liked: true };
    }
  }

  async getUserReplyLike(replyId, userId) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      'SELECT likes FROM forum_reply_likes WHERE reply_id = ? AND user_id = ?',
      [replyId, userId]
    );
    if (rows.length === 0) return null;
    return rows[0].likes === 1;
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
    
    // Get total views
    const [viewsStats] = await connection.execute(
      'SELECT COALESCE(SUM(views), 0) as total_views FROM forum_threads WHERE is_deleted = false'
    );
    
    // Get total likes (from threads and replies)
    const [threadLikesStats] = await connection.execute(
      'SELECT COALESCE(SUM(likes), 0) as total_thread_likes FROM forum_threads WHERE is_deleted = false'
    );
    const [replyLikesStats] = await connection.execute(
      'SELECT COALESCE(SUM(likes), 0) as total_reply_likes FROM forum_replies WHERE is_deleted = false'
    );
    
    const totalThreads = threadStats[0].total_threads;
    const totalReplies = replyStats[0].total_replies;
    const averageRepliesPerThread = totalThreads > 0 
      ? (totalReplies / totalThreads).toFixed(2)
      : '0.00';
    
    return {
      totalCategories: categoryStats[0].total_categories,
      totalThreads: totalThreads,
      totalReplies: totalReplies,
      totalViews: parseInt(viewsStats[0].total_views) || 0,
      totalLikes: parseInt(threadLikesStats[0].total_thread_likes) + parseInt(replyLikesStats[0].total_reply_likes) || 0,
      averageRepliesPerThread: averageRepliesPerThread
    };
  }
}

module.exports = new DatabaseForumService();
