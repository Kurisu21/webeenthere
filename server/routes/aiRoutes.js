// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

module.exports = (db) => {
  const AiController = require('../controllers/AiController');
  const aiController = new AiController(db);

  // Generate complete website template
  router.post('/generate-template', authMiddleware, async (req, res) => {
    await aiController.generateTemplate(req, res);
  });

  // Improve existing canvas (HTML/CSS)
  router.post('/improve-canvas', authMiddleware, async (req, res) => {
    await aiController.improveCanvas(req, res);
  });

  // AI Assistant endpoint for real-time suggestions and user prompts
  // Uses optional auth - works with or without authentication
  // If authenticated, tracks usage and chat history. If not, still works but without tracking.
  router.post('/assistant', optionalAuthMiddleware, async (req, res) => {
    await aiController.handleAssistantRequest(req, res);
  });

  // Get AI Assistant chat history for a website
  // Uses optional auth - returns history if authenticated, empty if not
  router.get('/assistant/history/:websiteId', optionalAuthMiddleware, async (req, res) => {
    await aiController.getChatHistory(req, res);
  });

  return router;
};


