const express = require('express');
const router = express.Router();
const FeedbackController = require('../controllers/FeedbackController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/', FeedbackController.createFeedback);

// Authenticated routes (require login)
router.get('/my', authMiddleware, FeedbackController.getFeedback);
router.get('/:id', authMiddleware, FeedbackController.getFeedbackById);
router.put('/:id', authMiddleware, FeedbackController.updateFeedback);
router.delete('/:id', authMiddleware, FeedbackController.deleteFeedback);

// Admin routes (require authentication and admin role)
router.get('/', authMiddleware, adminAuthMiddleware, FeedbackController.getFeedback);
router.post('/:id/assign', authMiddleware, adminAuthMiddleware, FeedbackController.assignFeedback);
router.post('/:id/close', authMiddleware, adminAuthMiddleware, FeedbackController.closeFeedback);
router.post('/:id/response', authMiddleware, adminAuthMiddleware, FeedbackController.addResponse);
router.get('/:id/responses', authMiddleware, adminAuthMiddleware, FeedbackController.getFeedbackResponses);
router.get('/stats/overview', authMiddleware, adminAuthMiddleware, FeedbackController.getFeedbackStats);
router.get('/recent/list', authMiddleware, adminAuthMiddleware, FeedbackController.getRecentFeedback);
router.post('/bulk/update', authMiddleware, adminAuthMiddleware, FeedbackController.bulkUpdateFeedback);

module.exports = router;
