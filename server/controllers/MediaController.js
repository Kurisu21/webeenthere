// controllers/MediaController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

class MediaController {
  constructor(db) {
    this.db = db;
    this.MediaAsset = require('../models/MediaAsset');
    this.mediaAssetModel = new this.MediaAsset(db);
    
    // Configure multer for file uploads
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Ensure uploads directory exists
    fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);
    
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const userId = req.user?.id;
        const userUploadsDir = path.join(uploadsDir, `user_${userId}`);
        await fs.mkdir(userUploadsDir, { recursive: true });
        cb(null, userUploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `image-${uniqueSuffix}${ext}`);
      }
    });

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'));
        }
      }
    });
  }

  // Upload single image
  async uploadImage(req, res) {
    try {
      const userId = req.user?.id;
      const { website_id } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      // Create file URL (must match the route path - /api/media/uploads/...)
      const fileUrl = `/api/media/uploads/user_${userId}/${req.file.filename}`;
      
      console.log('[MediaController] File uploaded:', {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        fileUrl: fileUrl,
        userId: userId
      });
      
      // Save to database
      const mediaId = await this.mediaAssetModel.create({
        user_id: userId,
        website_id: website_id || null,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_url: fileUrl,
        file_size: req.file.size
      });

      const mediaAsset = await this.mediaAssetModel.findById(mediaId);

      res.json({
        success: true,
        media: {
          id: mediaAsset.id,
          file_name: mediaAsset.file_name,
          file_url: mediaAsset.file_url,
          file_type: mediaAsset.file_type,
          file_size: mediaAsset.file_size,
          uploaded_at: mediaAsset.uploaded_at,
          website_id: mediaAsset.website_id
        }
      });
    } catch (error) {
      console.error('Upload Image Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload image'
      });
    }
  }

  // Get user's images (from all websites or specific website)
  async getUserImages(req, res) {
    try {
      const userId = req.user?.id;
      const { website_id } = req.query;

      const images = await this.mediaAssetModel.findByUserAndWebsite(userId, website_id || null);

      res.json({
        success: true,
        images: images.map(img => ({
          id: img.id,
          file_name: img.file_name,
          file_url: img.file_url,
          file_type: img.file_type,
          file_size: img.file_size,
          uploaded_at: img.uploaded_at,
          website_id: img.website_id,
          website_title: img.website_title,
          website_slug: img.website_slug
        }))
      });
    } catch (error) {
      console.error('Get User Images Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get images'
      });
    }
  }

  // Delete image
  async deleteImage(req, res) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      // Verify ownership
      const mediaAsset = await this.mediaAssetModel.findById(id);
      if (!mediaAsset) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }

      if (mediaAsset.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this image'
        });
      }

      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', mediaAsset.file_url);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('Failed to delete file:', err.message);
      }

      // Delete from database
      await this.mediaAssetModel.delete(id);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Delete Image Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete image'
      });
    }
  }

  // Get multer upload middleware (disk storage for regular media)
  getUploadMiddleware() {
    return this.upload.single('image');
  }

  // Get multer upload middleware for profile images (memory storage for blob)
  getProfileImageUploadMiddleware() {
    const memoryStorage = multer.memoryStorage();
    
    return multer({
      storage: memoryStorage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'));
        }
      }
    }).single('image');
  }
}

module.exports = MediaController;

