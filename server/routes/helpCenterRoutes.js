const express = require('express');
const router = express.Router();
const HelpCenterController = require('../controllers/HelpCenterController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/articles', HelpCenterController.getArticles);
router.get('/articles/:id', HelpCenterController.getArticle);
router.get('/search', HelpCenterController.searchArticles);
router.get('/categories', HelpCenterController.getCategories);
router.post('/articles/:id/rate', HelpCenterController.rateArticle);

// Admin routes (require authentication and admin role)
router.post('/articles', authMiddleware, adminAuthMiddleware, HelpCenterController.createArticle);
router.put('/articles/:id', authMiddleware, adminAuthMiddleware, HelpCenterController.updateArticle);
router.delete('/articles/:id', authMiddleware, adminAuthMiddleware, HelpCenterController.deleteArticle);

router.post('/categories', authMiddleware, adminAuthMiddleware, HelpCenterController.createCategory);
router.put('/categories/:id', authMiddleware, adminAuthMiddleware, HelpCenterController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminAuthMiddleware, HelpCenterController.deleteCategory);

router.get('/stats', authMiddleware, adminAuthMiddleware, HelpCenterController.getStats);

module.exports = router;
