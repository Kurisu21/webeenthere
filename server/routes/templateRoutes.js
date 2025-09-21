// routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/TemplateController');
const authMiddleware = require('../middleware/auth');

const templateController = new TemplateController();

// Public routes (no authentication required)
router.get('/', templateController.getAllTemplates.bind(templateController));
router.get('/category/:category', templateController.getTemplatesByCategory.bind(templateController));
router.get('/featured', templateController.getFeaturedTemplates.bind(templateController));
router.get('/:id', templateController.getTemplate.bind(templateController));

// Admin routes (authentication required)
router.post('/', authMiddleware, templateController.createTemplate.bind(templateController));
router.put('/:id', authMiddleware, templateController.updateTemplate.bind(templateController));
router.delete('/:id', authMiddleware, templateController.deleteTemplate.bind(templateController));

module.exports = router;







