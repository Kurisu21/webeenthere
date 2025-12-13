// routes/websiteRoutes.js
const express = require('express');
const router = express.Router();
const WebsiteController = require('../controllers/WebsiteController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (db) => {
  const websiteController = new WebsiteController(db);

  // Configure multer for HTML file uploads
  const uploadDir = path.join(__dirname, '..', '..', 'temp', 'website-imports');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'website-' + uniqueSuffix + path.extname(file.originalname));
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
// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/public/stats', websiteController.getPublicStats.bind(websiteController));
router.get('/public/all', websiteController.getAllPublicWebsites.bind(websiteController));
router.get('/public/:slug', websiteController.getPublicWebsite.bind(websiteController));

// Preview route - optional auth (allows public access for published websites)
router.get('/preview/:id', optionalAuthMiddleware, websiteController.getWebsitePreview.bind(websiteController));

// Protected routes (authentication required)
router.get('/', authMiddleware, websiteController.getUserWebsites.bind(websiteController));
router.get('/check-slug', authMiddleware, websiteController.checkSlugAvailability.bind(websiteController));
router.post('/import', authMiddleware, upload.single('htmlFile'), websiteController.importWebsiteFromHTML.bind(websiteController));
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







