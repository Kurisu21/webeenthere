// routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/TemplateController');
const { authMiddleware } = require('../middleware/auth');

module.exports = (db) => {
  const templateController = new TemplateController(db);

// Public routes (no authentication required)
router.get('/', templateController.getAllTemplates.bind(templateController));
router.get('/community', templateController.getCommunityTemplates.bind(templateController));
router.get('/official', templateController.getOfficialTemplates.bind(templateController));
router.get('/active-with-creator', templateController.getActiveTemplatesWithCreator.bind(templateController));
router.get('/category/:category', templateController.getTemplatesByCategory.bind(templateController));
router.get('/featured', templateController.getFeaturedTemplates.bind(templateController));
router.get('/:id', templateController.getTemplate.bind(templateController));

// User routes (authentication required)
router.post('/from-website/:websiteId', authMiddleware, templateController.createTemplateFromWebsite.bind(templateController));

// Admin routes (authentication required)
router.post('/', authMiddleware, templateController.createTemplate.bind(templateController));
router.put('/:id', authMiddleware, templateController.updateTemplate.bind(templateController));
router.put('/:id/toggle-active', authMiddleware, templateController.toggleTemplateActive.bind(templateController));
router.put('/:id/toggle-featured', authMiddleware, templateController.toggleTemplateFeatured.bind(templateController));
router.delete('/:id', authMiddleware, templateController.deleteTemplate.bind(templateController));
router.get('/admin/all-with-creator', authMiddleware, templateController.getAllTemplatesWithCreator.bind(templateController));
router.get('/admin/user/:userId', authMiddleware, templateController.getTemplatesByCreator.bind(templateController));

  return router;
};







