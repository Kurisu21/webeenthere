const databaseHelpCenterService = require('../services/DatabaseHelpCenterService');

class HelpCenterController {
  // Create article
  async createArticle(req, res) {
    try {
      const { category, title, content, tags } = req.body;
      const authorId = req.user?.id || 'admin'; // Get from auth middleware

      if (!category || !title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Category, title, and content are required'
        });
      }

      const article = await databaseHelpCenterService.createArticle({
        category: category, // Service will handle both category and categoryId
        title,
        content,
        authorId,
        isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
        tags: tags || []
      });

      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: article
      });
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create article',
        error: error.message
      });
    }
  }

  // Update article
  async updateArticle(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const article = await databaseHelpCenterService.updateArticle(id, updateData);

      res.json({
        success: true,
        message: 'Article updated successfully',
        data: article
      });
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update article',
        error: error.message
      });
    }
  }

  // Delete article
  async deleteArticle(req, res) {
    try {
      const { id } = req.params;

      await databaseHelpCenterService.deleteArticle(id);

      res.json({
        success: true,
        message: 'Article deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete article',
        error: error.message
      });
    }
  }

  // Get articles
  async getArticles(req, res) {
    try {
      const { category, search, page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      let articles;
      if (search) {
        articles = await databaseHelpCenterService.searchArticles(search, category);
      } else if (category) {
        articles = await databaseHelpCenterService.getArticlesByCategory(category);
      } else {
        articles = await databaseHelpCenterService.getAllArticles(true); // published only
      }

      // Ensure articles is an array
      if (!Array.isArray(articles)) {
        articles = [];
      }

      // Calculate pagination
      const total = articles.length;
      const totalPages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedArticles = articles.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          articles: paginatedArticles,
          total: total,
          page: pageNum,
          limit: limitNum,
          totalPages: totalPages
        }
      });
    } catch (error) {
      console.error('Error getting articles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get articles',
        error: error.message
      });
    }
  }

  // Get single article
  async getArticle(req, res) {
    try {
      const { id } = req.params;

      // Increment view count when article is viewed (no user tracking - simple count increment)
      // Views are incremented every time this endpoint is called, regardless of user authentication
      await databaseHelpCenterService.incrementArticleViews(id);
      
      const article = await databaseHelpCenterService.getArticleById(id);
      
      // Get user's vote if they're logged in
      let userVote = null;
      if (req.user?.id) {
        userVote = await databaseHelpCenterService.getUserVote(id, req.user.id);
      }

      res.json({
        success: true,
        data: {
          ...article,
          userVote: userVote
        }
      });
    } catch (error) {
      console.error('Error getting article:', error);
      res.status(404).json({
        success: false,
        message: 'Article not found',
        error: error.message
      });
    }
  }

  // Search articles
  async searchArticles(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const articles = await databaseHelpCenterService.searchArticles(q);

      res.json({
        success: true,
        data: articles
      });
    } catch (error) {
      console.error('Error searching articles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search articles',
        error: error.message
      });
    }
  }

  // Get categories
  async getCategories(req, res) {
    try {
      const categories = await databaseHelpCenterService.getAllCategories();

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

  // Create category
  async createCategory(req, res) {
    try {
      const { name, description, icon } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const category = await databaseHelpCenterService.createCategory({
        name,
        description,
        icon
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

      const category = await databaseHelpCenterService.updateCategory(id, updateData);

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

      await databaseHelpCenterService.deleteCategory(id);

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

  // Rate article
  async rateArticle(req, res) {
    try {
      const { id } = req.params;
      const { isHelpful } = req.body;
      // Get user ID from auth middleware or use a default for anonymous users
      // For now, we'll use IP address or session ID as fallback
      const userId = req.user?.id || req.ip || 'anonymous';

      if (typeof isHelpful !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isHelpful must be a boolean value'
        });
      }

      // For anonymous users, we'll use a combination of IP and user agent
      // In production, you should require authentication for voting
      const voteUserId = req.user?.id || null;
      
      if (!voteUserId) {
        return res.status(401).json({
          success: false,
          message: 'You must be logged in to vote'
        });
      }

      await databaseHelpCenterService.rateArticle(id, isHelpful, voteUserId);
      const article = await databaseHelpCenterService.getArticleById(id);
      const userVote = await databaseHelpCenterService.getUserVote(id, voteUserId);

      res.json({
        success: true,
        message: 'Article rated successfully',
        data: {
          ...article,
          userVote: userVote // Include user's vote status
        }
      });
    } catch (error) {
      console.error('Error rating article:', error);
      const statusCode = error.message.includes('already voted') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to rate article',
        error: error.message
      });
    }
  }

  // Get statistics
  async getStats(req, res) {
    try {
      const stats = await databaseHelpCenterService.getStats();

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

module.exports = new HelpCenterController();
