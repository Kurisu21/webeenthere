// routes/aiRoutes.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const AiController = require('../controllers/AiController');
  const aiController = new AiController(db);

  // Generate new website section
  router.post('/generate-section', async (req, res) => {
    await aiController.generateSection(req, res);
  });

  // Improve existing content
  router.post('/improve-content', async (req, res) => {
    await aiController.improveContent(req, res);
  });

  // Get AI suggestions
  router.get('/suggestions', async (req, res) => {
    await aiController.getSuggestions(req, res);
  });

  // Get user's AI prompts history
  router.get('/prompts/:userId', async (req, res) => {
    await aiController.getUserPrompts(req, res);
  });

  return router;
};


