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

      const thread = await databaseForumService.updateThread(id, updateData);

      res.json({
        success: true,
        message: 'Thread updated successfully',
        data: thread
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
      const { categoryId, page = 1, limit = 10, sortBy = 'updatedAt' } = req.query;

      let threads;
      if (categoryId) {
        threads = await databaseForumService.getThreadsByCategory(categoryId, parseInt(page), parseInt(limit));
      } else {
        // Get threads from all categories
        const categories = await databaseForumService.getAllCategories();
        threads = [];
        for (const category of categories) {
          const categoryThreads = await databaseForumService.getThreadsByCategory(category.id, 1, parseInt(limit));
          threads = threads.concat(categoryThreads);
        }
      }

      res.json({
        success: true,
        data: threads
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

      const thread = await databaseForumService.getThreadById(id);

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

      const reply = await databaseForumService.updateReply(id, updateData);

      res.json({
        success: true,
        message: 'Reply updated successfully',
        data: reply
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

      const replies = await databaseForumService.getRepliesByThread(id, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        data: replies
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

      // Basic moderation - update thread status
      const thread = await databaseForumService.updateThread(id, {
        isLocked: action === 'lock',
        isPinned: action === 'pin',
        moderationReason: reason,
        moderatedBy: adminId,
        moderatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Thread moderated successfully',
        data: moderation
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
