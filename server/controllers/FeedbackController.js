const databaseFeedbackService = require('../services/DatabaseFeedbackService');

class FeedbackController {
  // Create feedback
  async createFeedback(req, res) {
    try {
      const { type, message, priority, attachments } = req.body;
      const userId = req.user?.id; // Get from optional auth middleware

      if (!type || !message) {
        return res.status(400).json({
          success: false,
          message: 'Type and message are required'
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to submit feedback.'
        });
      }

      const feedback = await databaseFeedbackService.createFeedback({
        userId,
        type,
        message,
        priority: priority || 'medium'
      });

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: feedback
      });
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: error.message
      });
    }
  }

  // Update feedback
  async updateFeedback(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const feedback = await databaseFeedbackService.updateFeedback(id, updateData);

      res.json({
        success: true,
        message: 'Feedback updated successfully',
        data: feedback
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update feedback',
        error: error.message
      });
    }
  }

  // Get feedback
  async getFeedback(req, res) {
    try {
      const filters = { ...req.query };
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // For regular users, only show their own feedback by default
      if (userRole !== 'admin') {
        filters.userId = userId;
      }

      const feedback = await databaseFeedbackService.getAllFeedback(filters);

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error getting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get feedback',
        error: error.message
      });
    }
  }

  // Get single feedback
  async getFeedbackById(req, res) {
    try {
      const { id } = req.params;

      const feedback = await databaseFeedbackService.getFeedbackById(id);

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error getting feedback:', error);
      res.status(404).json({
        success: false,
        message: 'Feedback not found',
        error: error.message
      });
    }
  }

  // Assign feedback
  async assignFeedback(req, res) {
    try {
      const { id } = req.params;
      const { adminId } = req.body;

      if (!adminId) {
        return res.status(400).json({
          success: false,
          message: 'Admin ID is required'
        });
      }

      const feedback = await databaseFeedbackService.updateFeedback(id, {
        assignedTo: adminId,
        status: 'assigned'
      });

      res.json({
        success: true,
        message: 'Feedback assigned successfully',
        data: feedback
      });
    } catch (error) {
      console.error('Error assigning feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign feedback',
        error: error.message
      });
    }
  }

  // Close feedback
  async closeFeedback(req, res) {
    try {
      const { id } = req.params;
      const { response } = req.body;
      const adminId = req.user?.id || 'admin';

      // Store response as JSON string in database
      const responseData = response ? JSON.stringify({
        message: response,
        createdAt: new Date().toISOString(),
        adminId
      }) : null;

      const feedback = await databaseFeedbackService.updateFeedback(id, {
        status: 'closed',
        response: responseData
      });

      res.json({
        success: true,
        message: 'Feedback closed successfully',
        data: feedback
      });
    } catch (error) {
      console.error('Error closing feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to close feedback',
        error: error.message
      });
    }
  }

  // Add response to feedback
  async addResponse(req, res) {
    try {
      const { id } = req.params;
      const { response } = req.body;
      const adminId = req.user?.id || 'admin'; // Get from auth middleware

      if (!response) {
        return res.status(400).json({
          success: false,
          message: 'Response is required'
        });
      }

      // Store response as JSON string in database
      const responseData = JSON.stringify({
        message: response,
        createdAt: new Date().toISOString(),
        adminId
      });

      const feedback = await databaseFeedbackService.updateFeedback(id, {
        response: responseData,
        status: 'responded'
      });

      res.json({
        success: true,
        message: 'Response added successfully',
        data: feedback
      });
    } catch (error) {
      console.error('Error adding response:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add response',
        error: error.message
      });
    }
  }

  // Get feedback responses
  async getFeedbackResponses(req, res) {
    try {
      const { id } = req.params;

      const feedback = await databaseFeedbackService.getFeedbackById(id);
      const responses = feedback.response ? [feedback.response] : [];

      res.json({
        success: true,
        data: responses
      });
    } catch (error) {
      console.error('Error getting feedback responses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get feedback responses',
        error: error.message
      });
    }
  }

  // Get feedback statistics
  async getFeedbackStats(req, res) {
    try {
      const stats = await databaseFeedbackService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting feedback statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get feedback statistics',
        error: error.message
      });
    }
  }

  // Get recent feedback
  async getRecentFeedback(req, res) {
    try {
      const { limit = 10 } = req.query;

      const feedback = await databaseFeedbackService.getAllFeedback({ limit: parseInt(limit) });

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error getting recent feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent feedback',
        error: error.message
      });
    }
  }

  // Delete feedback
  async deleteFeedback(req, res) {
    try {
      const { id } = req.params;

      await databaseFeedbackService.deleteFeedback(id);

      res.json({
        success: true,
        message: 'Feedback deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete feedback',
        error: error.message
      });
    }
  }

  // Bulk update feedback
  async bulkUpdateFeedback(req, res) {
    try {
      const { feedbackIds, updateData } = req.body;

      if (!feedbackIds || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Feedback IDs array is required'
        });
      }

      const updatedFeedback = [];
      for (const id of feedbackIds) {
        const feedback = await databaseFeedbackService.updateFeedback(id, updateData);
        updatedFeedback.push(feedback);
      }

      res.json({
        success: true,
        message: 'Feedback updated successfully',
        data: updatedFeedback
      });
    } catch (error) {
      console.error('Error bulk updating feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update feedback',
        error: error.message
      });
    }
  }
}

module.exports = new FeedbackController();
