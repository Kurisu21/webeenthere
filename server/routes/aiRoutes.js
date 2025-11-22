// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

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
  router.post('/assistant', authMiddleware, async (req, res) => {
    await aiController.handleAssistantRequest(req, res);
  });

  // Get AI Assistant chat history for a website
  router.get('/assistant/history/:websiteId', authMiddleware, async (req, res) => {
    await aiController.getChatHistory(req, res);
  });

  return router;
};


