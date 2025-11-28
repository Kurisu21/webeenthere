// routes/mediaRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

module.exports = (db) => {
  const MediaController = require('../controllers/MediaController');
  const mediaController = new MediaController(db);

  // Upload image
  router.post('/upload', authMiddleware, mediaController.getUploadMiddleware(), async (req, res) => {
    await mediaController.uploadImage(req, res);
  });

  // Get user's images
  router.get('/images', authMiddleware, async (req, res) => {
    await mediaController.getUserImages(req, res);
  });

  // Delete image
  router.delete('/images/:id', authMiddleware, async (req, res) => {
    await mediaController.deleteImage(req, res);
  });

  // Serve uploaded media files (images, videos, audio)
  router.get('/uploads/user_:userId/:filename', async (req, res) => {
    try {
      const { userId, filename } = req.params;
      const path = require('path');
      const fs = require('fs').promises;
      
      const filePath = path.join(__dirname, '../uploads', `user_${userId}`, filename);
      
      console.log('[MediaRoutes] Serving media file:', { userId, filename, filePath });
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (err) {
        console.error('[MediaRoutes] File not found:', filePath, err.message);
        return res.status(404).json({ success: false, error: 'Media file not found' });
      }
      
      // Set proper content type
      const ext = path.extname(filename).toLowerCase();
      const contentTypes = {
        // Images
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        // Videos
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.ogg': 'video/ogg',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.mkv': 'video/x-matroska',
        // Audio
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.aac': 'audio/aac',
        '.m4a': 'audio/mp4',
        '.flac': 'audio/flac',
        '.wma': 'audio/x-ms-wma',
        '.oga': 'audio/ogg'
      };
      const contentType = contentTypes[ext] || 'application/octet-stream';
      
      // Set CORS headers to allow images to be loaded from any origin (public images)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('[MediaRoutes] Error sending file:', err);
          if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Error serving image' });
          }
        } else {
          console.log('[MediaRoutes] Successfully served media file:', filename);
        }
      });
    } catch (error) {
      console.error('[MediaRoutes] Serve media file error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Error serving media file' });
      }
    }
  });

  return router;
};

