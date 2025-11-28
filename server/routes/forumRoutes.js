const express = require('express');
const router = express.Router();
const ForumController = require('../controllers/ForumController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/categories', ForumController.getCategories);
router.get('/threads', ForumController.getThreads);
router.get('/threads/:id', ForumController.getThread);
router.get('/threads/:id/replies', ForumController.getReplies);
router.get('/search', ForumController.searchThreads);

// Authenticated routes (require login)
router.post('/threads', authMiddleware, ForumController.createThread);
router.put('/threads/:id', authMiddleware, ForumController.updateThread);
router.delete('/threads/:id', authMiddleware, ForumController.deleteThread);

router.post('/threads/:id/replies', authMiddleware, ForumController.createReply);
router.put('/replies/:id', authMiddleware, ForumController.updateReply);
router.delete('/replies/:id', authMiddleware, ForumController.deleteReply);

// Like routes (require authentication)
router.post('/threads/:id/like', authMiddleware, ForumController.toggleThreadLike);
router.post('/replies/:id/like', authMiddleware, ForumController.toggleReplyLike);

// Admin routes (require authentication and admin role)
router.post('/categories', authMiddleware, adminAuthMiddleware, ForumController.createCategory);
router.put('/categories/:id', authMiddleware, adminAuthMiddleware, ForumController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminAuthMiddleware, ForumController.deleteCategory);

router.post('/threads/:id/moderate', authMiddleware, adminAuthMiddleware, ForumController.moderateThread);
router.get('/stats', authMiddleware, adminAuthMiddleware, ForumController.getStats);

module.exports = router;
