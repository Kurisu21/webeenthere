// routes/adminWebsiteRoutes.js
const express = require('express');
const router = express.Router();
const WebsiteController = require('../controllers/WebsiteController');
const { adminAuthMiddleware } = require('../middleware/auth');
const { getDatabaseConnection } = require('../database/database');

module.exports = (db) => {
  const websiteController = new WebsiteController(db);

  // Apply admin authentication middleware to all routes
  router.use(adminAuthMiddleware);

  /**
   * @route GET /api/admin/websites
   * @desc Get all websites with filters and pagination
   * @access Admin
   */
  router.get('/', websiteController.getAllWebsites.bind(websiteController));

  /**
   * @route GET /api/admin/websites/stats
   * @desc Get hosting statistics
   * @access Admin
   */
  router.get('/stats', websiteController.getHostingStats.bind(websiteController));

  /**
   * @route GET /api/admin/websites/:id
   * @desc Get specific website details
   * @access Admin
   */
  router.get('/:id', websiteController.getWebsite.bind(websiteController));

  /**
   * @route PUT /api/admin/websites/:id/slug
   * @desc Update website slug
   * @access Admin
   */
  router.put('/:id/slug', websiteController.updateWebsiteSlug.bind(websiteController));

  /**
   * @route POST /api/admin/websites/:id/publish
   * @desc Force publish website
   * @access Admin
   */
  router.post('/:id/publish', websiteController.adminPublishWebsite.bind(websiteController));

  /**
   * @route POST /api/admin/websites/:id/unpublish
   * @desc Force unpublish website
   * @access Admin
   */
  router.post('/:id/unpublish', websiteController.adminUnpublishWebsite.bind(websiteController));

  /**
   * @route DELETE /api/admin/websites/:id
   * @desc Delete any website
   * @access Admin
   */
  router.delete('/:id', websiteController.adminDeleteWebsite.bind(websiteController));

  return router;
};
