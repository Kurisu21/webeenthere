const databaseForumService = require('../services/DatabaseForumService');

class ForumController {
  // Create category
  async createCategory(req, res) {
    try {
      const { name, description, icon, color } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const category = await databaseForumService.createCategory({
        name,
        description,
        icon,
        color
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
  }

  // Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const category = await databaseForumService.updateCategory(id, updateData);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }
  }

  // Delete category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      await databaseForumService.deleteCategory(id);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message
      });
    }
  }

  // Get categories
  async getCategories(req, res) {
    try {
      const categories = await databaseForumService.getAllCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get categories',
        error: error.message
      });
    }
  }

  // Create thread
  async createThread(req, res) {
    try {
      const { categoryId, title, content, tags } = req.body;
      const userId = req.user?.id || 'user'; // Get from auth middleware

      if (!categoryId || !title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Category, title, and content are required'
        });
      }

      const thread = await databaseForumService.createThread({
        categoryId,
        title,
        content,
        authorId: userId,
        tags: tags || []
      });

      res.status(201).json({
        success: true,
        message: 'Thread created successfully',
        data: thread
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create thread',
        error: error.message
      });
    }
  }

  // Update thread
  async updateThread(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'You must be logged in to update threads'
        });
      }

      // Check if user is the author of the thread
      const thread = await databaseForumService.getThreadById(id);
      if (thread.author_id != userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own threads'
        });
      }

      const updatedThread = await databaseForumService.updateThread(id, updateData);

      res.json({
        success: true,
        message: 'Thread updated successfully',
        data: updatedThread
      });
    } catch (error) {
      console.error('Error updating thread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update thread',
        error: error.message
      });
    }
  }

  // Delete thread
  async deleteThread(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'You must be logged in to delete threads'
        });
      }

      // Check if user is the author of the thread
      const thread = await databaseForumService.getThreadById(id);
      if (thread.author_id != userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own threads'
        });
      }

      await databaseForumService.deleteThread(id);

      res.json({
        success: true,
        message: 'Thread deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting thread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete thread',
        error: error.message
      });
    }
  }

  // Get threads
  async getThreads(req, res) {
    try {
      const { categoryId, page = 1, limit = 10, sortBy = 'updatedAt', authorId, pinned } = req.query;

      let threads;
      if (pinned === 'true') {
        // Get pinned threads
        threads = await databaseForumService.getPinnedThreads(parseInt(limit));
        threads = {
          threads: threads,
          total: threads.length,
          page: 1,
          limit: parseInt(limit),
          totalPages: 1
        };
      } else if (authorId) {
        // Get threads by specific author
        threads = await databaseForumService.getThreadsByAuthor(authorId, parseInt(page), parseInt(limit), sortBy);
      } else if (categoryId && categoryId.trim() !== '') {
        // Get threads by category (only if categoryId is provided and not empty)
        threads = await databaseForumService.getThreadsByCategory(categoryId, parseInt(page), parseInt(limit), sortBy);
      } else {
        // Get threads from all categories (when no categoryId or empty string)
        threads = await databaseForumService.getAllThreads(parseInt(page), parseInt(limit), sortBy);
      }

      // Build simple pagination metadata (best-effort)
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      let responseData;
      
      // Check if threads already has pagination structure (object with threads property)
      if (threads && typeof threads === 'object' && !Array.isArray(threads) && threads.threads) {
        // Already has pagination data (from getAllThreads, getThreadsByAuthor, etc.)
        responseData = threads;
      } else if (Array.isArray(threads)) {
        // Array of threads (from getPinnedThreads when not wrapped)
        const total = threads.length;
        const totalPages = total > 0 ? Math.max(1, Math.ceil(total / limitNum)) : 1;
        responseData = {
          threads: threads,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        };
      } else {
        // Fallback: empty result
        responseData = {
          threads: [],
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 1
        };
      }

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('Error getting threads:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get threads',
        error: error.message
      });
    }
  }

  // Get single thread
  async getThread(req, res) {
    try {
      const { id } = req.params;
      const { noIncrement } = req.query;
      const userId = req.user?.id || null;

      // Only increment view count if noIncrement is not set (initial view)
      if (!noIncrement) {
        await databaseForumService.incrementThreadViews(id);
      }

      const thread = await databaseForumService.getThreadById(id, userId);

      res.json({
        success: true,
        data: thread
      });
    } catch (error) {
      console.error('Error getting thread:', error);
      res.status(404).json({
        success: false,
        message: 'Thread not found',
        error: error.message
      });
    }
  }

  // Create reply
  async createReply(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id || 'user'; // Get from auth middleware

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Reply content is required'
        });
      }

      // Check if thread is locked (is_locked is 0 or 1 in database)
      const thread = await databaseForumService.getThreadById(id);
      if (thread.is_locked === 1 || thread.is_locked === true || thread.isLocked === true) {
        return res.status(403).json({
          success: false,
          message: 'This thread is locked. You cannot add replies.'
        });
      }

      const reply = await databaseForumService.createReply({
        threadId: id,
        content,
        authorId: userId
      });

      res.status(201).json({
        success: true,
        message: 'Reply created successfully',
        data: reply
      });
    } catch (error) {
      console.error('Error creating reply:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create reply',
        error: error.message
      });
    }
  }

  // Update reply
  async updateReply(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'You must be logged in to update replies'
        });
      }

      // Check if user is the author of the reply
      const connection = await require('../database/database').getDatabaseConnection();
      const [replyRows] = await connection.execute(
        'SELECT author_id FROM forum_replies WHERE id = ?',
        [id]
      );

      if (replyRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found'
        });
      }

      if (replyRows[0].author_id != userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own replies'
        });
      }

      await databaseForumService.updateReply(id, updateData);
      const [updatedReplyRows] = await connection.execute(
        'SELECT r.*, u.username as author_name FROM forum_replies r LEFT JOIN users u ON r.author_id = u.id WHERE r.id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Reply updated successfully',
        data: updatedReplyRows[0] || null
      });
    } catch (error) {
      console.error('Error updating reply:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reply',
        error: error.message
      });
    }
  }

  // Delete reply
  async deleteReply(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'You must be logged in to delete replies'
        });
      }

      const connection = await require('../database/database').getDatabaseConnection();
      
      // Get reply and thread info
      const [replyRows] = await connection.execute(
        'SELECT r.*, t.author_id as thread_author_id FROM forum_replies r LEFT JOIN forum_threads t ON r.thread_id = t.id WHERE r.id = ?',
        [id]
      );

      if (replyRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found'
        });
      }

      const reply = replyRows[0];
      
      // Allow deletion if user is the reply author OR the thread author
      if (reply.author_id != userId && reply.thread_author_id != userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own replies or replies in your own threads'
        });
      }

      await databaseForumService.deleteReply(id);

      res.json({
        success: true,
        message: 'Reply deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting reply:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete reply',
        error: error.message
      });
    }
  }

  // Get replies
  async getReplies(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user?.id || null;

      const replyData = await databaseForumService.getRepliesByThread(id, parseInt(page), parseInt(limit), userId);

      res.json({
        success: true,
        data: replyData
      });
    } catch (error) {
      console.error('Error getting replies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get replies',
        error: error.message
      });
    }
  }

  // Search threads
  async searchThreads(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const threads = await databaseForumService.searchThreads(q);

      res.json({
        success: true,
        data: threads
      });
    } catch (error) {
      console.error('Error searching threads:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search threads',
        error: error.message
      });
    }
  }

  // Moderate thread
  async moderateThread(req, res) {
    try {
      const { id } = req.params;
      const { action, reason } = req.body;
      const adminId = req.user?.id || 'admin'; // Get from auth middleware

      if (!action) {
        return res.status(400).json({
          success: false,
          message: 'Moderation action is required'
        });
      }

      // Handle delete action separately
      if (action === 'delete') {
        await databaseForumService.deleteThread(id);
        return res.json({
          success: true,
          message: 'Thread deleted successfully'
        });
      }

      // Handle pin/unpin and lock/unlock
      const updateData = {};
      if (action === 'pin' || action === 'unpin') {
        updateData.is_pinned = action === 'pin';
      }
      if (action === 'lock' || action === 'unlock') {
        updateData.is_locked = action === 'lock';
      }

      const thread = await databaseForumService.updateThread(id, updateData);

      res.json({
        success: true,
        message: 'Thread moderated successfully',
        data: thread
      });
    } catch (error) {
      console.error('Error moderating thread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to moderate thread',
        error: error.message
      });
    }
  }

  // Like/Unlike thread
  async toggleThreadLike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'You must be logged in to like threads'
        });
      }

      // Check if thread is locked (is_locked is 0 or 1 in database)
      const thread = await databaseForumService.getThreadById(id);
      if (thread.is_locked === 1 || thread.is_locked === true || thread.isLocked === true) {
        return res.status(403).json({
          success: false,
          message: 'This thread is locked. You cannot like or unlike it.'
        });
      }

      const result = await databaseForumService.toggleThreadLike(id, userId);
      const updatedThread = await databaseForumService.getThreadById(id, userId);

      res.json({
        success: true,
        message: result.liked ? 'Thread liked successfully' : 'Thread unliked successfully',
        data: {
          ...updatedThread,
          userLiked: result.liked
        }
      });
    } catch (error) {
      console.error('Error toggling thread like:', error);
      // Return 400 for validation errors (like own content), 403 for locked, 500 for other errors
      let statusCode = 500;
      if (error.message?.includes('cannot like your own')) {
        statusCode = 400;
      } else if (error.message?.includes('locked')) {
        statusCode = 403;
      }
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to toggle thread like'
      });
    }
  }

  // Like/Unlike reply
  async toggleReplyLike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'You must be logged in to like replies'
        });
      }

      // Check if parent thread is locked
      const { getDatabaseConnection } = require('../database/database');
      const connection = await getDatabaseConnection();
      const [replies] = await connection.execute(
        'SELECT r.*, t.is_locked FROM forum_replies r LEFT JOIN forum_threads t ON r.thread_id = t.id WHERE r.id = ?',
        [id]
      );
      
      if (replies.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found'
        });
      }

      const reply = replies[0];
      // Check if parent thread is locked (is_locked is 0 or 1 in database)
      if (reply.is_locked === 1 || reply.is_locked === true) {
        return res.status(403).json({
          success: false,
          message: 'This thread is locked. You cannot like or unlike replies.'
        });
      }

      const result = await databaseForumService.toggleReplyLike(id, userId);
      const userLiked = await databaseForumService.getUserReplyLike(id, userId);
      
      // Get updated reply with like count
      const [updatedReplies] = await connection.execute(
        'SELECT r.*, u.username as author_name FROM forum_replies r LEFT JOIN users u ON r.author_id = u.id WHERE r.id = ?',
        [id]
      );
      
      const updatedReply = updatedReplies[0];
      if (updatedReply) {
        updatedReply.userLiked = userLiked;
      }

      res.json({
        success: true,
        message: result.liked ? 'Reply liked successfully' : 'Reply unliked successfully',
        data: updatedReply
      });
    } catch (error) {
      console.error('Error toggling reply like:', error);
      // Return 400 for validation errors (like own content), 403 for locked, 500 for other errors
      let statusCode = 500;
      if (error.message?.includes('cannot like your own')) {
        statusCode = 400;
      } else if (error.message?.includes('locked')) {
        statusCode = 403;
      }
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to toggle reply like'
      });
    }
  }

  // Get statistics
  async getStats(req, res) {
    try {
      const stats = await databaseForumService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message
      });
    }
  }
}

module.exports = new ForumController();
