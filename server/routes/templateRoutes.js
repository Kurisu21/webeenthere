// routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/TemplateController');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (db) => {
  const templateController = new TemplateController(db);

  // Configure multer for HTML file uploads
  const uploadDir = path.join(__dirname, '..', '..', 'temp', 'template-imports');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'template-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept HTML files
      if (file.mimetype === 'text/html' || path.extname(file.originalname).toLowerCase() === '.html') {
        cb(null, true);
      } else {
        cb(new Error('Only HTML files are allowed'), false);
      }
    }
  });

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
router.post('/import', authMiddleware, upload.single('htmlFile'), templateController.importTemplateFromHTML.bind(templateController));
router.put('/:id', authMiddleware, templateController.updateTemplate.bind(templateController));
router.put('/:id/toggle-active', authMiddleware, templateController.toggleTemplateActive.bind(templateController));
router.put('/:id/toggle-featured', authMiddleware, templateController.toggleTemplateFeatured.bind(templateController));
router.delete('/:id', authMiddleware, templateController.deleteTemplate.bind(templateController));
router.get('/admin/all-with-creator', authMiddleware, templateController.getAllTemplatesWithCreator.bind(templateController));
router.get('/admin/user/:userId', authMiddleware, templateController.getTemplatesByCreator.bind(templateController));

  return router;
};







