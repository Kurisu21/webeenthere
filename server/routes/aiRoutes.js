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

  return router;
};


