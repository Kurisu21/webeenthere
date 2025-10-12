// routes/websiteRoutes.js
const express = require('express');
const router = express.Router();
const WebsiteController = require('../controllers/WebsiteController');
const { authMiddleware } = require('../middleware/auth');

module.exports = (db) => {
  const websiteController = new WebsiteController(db);

// Public routes (no authentication required)
router.get('/public/:slug', websiteController.getPublicWebsite.bind(websiteController));

// Protected routes (authentication required)
router.get('/', authMiddleware, websiteController.getUserWebsites.bind(websiteController));
router.get('/:id', authMiddleware, websiteController.getWebsite.bind(websiteController));
router.post('/', authMiddleware, websiteController.createWebsite.bind(websiteController));
router.put('/:id', authMiddleware, websiteController.updateWebsite.bind(websiteController));
router.delete('/:id', authMiddleware, websiteController.deleteWebsite.bind(websiteController));
router.post('/:id/publish', authMiddleware, websiteController.publishWebsite.bind(websiteController));
router.post('/:id/unpublish', authMiddleware, websiteController.unpublishWebsite.bind(websiteController));

  return router;
};







