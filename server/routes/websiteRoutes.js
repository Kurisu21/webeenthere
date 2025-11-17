// routes/websiteRoutes.js
const express = require('express');
const router = express.Router();
const WebsiteController = require('../controllers/WebsiteController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

module.exports = (db) => {
  const websiteController = new WebsiteController(db);

// Public routes (no authentication required)
// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/public/stats', websiteController.getPublicStats.bind(websiteController));
router.get('/public/all', websiteController.getAllPublicWebsites.bind(websiteController));
router.get('/public/:slug', websiteController.getPublicWebsite.bind(websiteController));

// Preview route - optional auth (allows public access for published websites)
router.get('/preview/:id', optionalAuthMiddleware, websiteController.getWebsitePreview.bind(websiteController));

// Protected routes (authentication required)
router.get('/', authMiddleware, websiteController.getUserWebsites.bind(websiteController));
router.get('/check-slug', authMiddleware, websiteController.checkSlugAvailability.bind(websiteController));
router.get('/:id', authMiddleware, websiteController.getWebsite.bind(websiteController));
router.post('/', authMiddleware, websiteController.createWebsite.bind(websiteController));
router.put('/:id', authMiddleware, websiteController.updateWebsite.bind(websiteController));
router.delete('/:id', authMiddleware, websiteController.deleteWebsite.bind(websiteController));
router.post('/:id/publish', authMiddleware, websiteController.publishWebsite.bind(websiteController));
router.post('/:id/unpublish', authMiddleware, websiteController.unpublishWebsite.bind(websiteController));
router.put('/:id/slug', authMiddleware, websiteController.updateWebsiteSlug.bind(websiteController));
router.get('/:id/export', authMiddleware, websiteController.exportWebsite.bind(websiteController));

  return router;
};







