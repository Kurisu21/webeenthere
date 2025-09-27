// routes/aiRoutes.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const AiController = require('../controllers/AiController');
  const aiController = new AiController(db);

  // Generate complete website template
  router.post('/generate-template', async (req, res) => {
    await aiController.generateTemplate(req, res);
  });

  return router;
};


