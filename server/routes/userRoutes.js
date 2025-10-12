// routes/userRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Import User model and controller
const { getDatabaseConnection } = require('../database/database');
const User = require('../models/User');
const UserController = require('../controllers/UserController');

const userModel = new User(getDatabaseConnection());
const userController = new UserController(userModel);

// Register route
router.post(
  '/register',
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
      .custom(async (value) => {
        const { getDatabaseConnection } = require('../database/database');
        const User = require('../models/User');
        const userModel = new User(getDatabaseConnection());
        const existingUser = await userModel.findByUsername(value);
        if (existingUser) {
          throw new Error('Username is already taken');
        }
      }),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail()
      .custom(async (value) => {
        const { getDatabaseConnection } = require('../database/database');
        const User = require('../models/User');
        const userModel = new User(getDatabaseConnection());
        const existingUser = await userModel.findByEmail(value);
        console.log('Checking email:', value, 'Found user:', !!existingUser);
        if (existingUser) {
          throw new Error('Email is already registered');
        }
      }),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ],
  (req, res) => userController.register(req, res)
);

// Login route
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  (req, res) => userController.login(req, res)
);

// Email verification route
router.get('/verify/:token', (req, res) => userController.verifyEmail(req, res));

// Resend verification email
router.post(
  '/resend-verification',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  (req, res) => userController.resendVerification(req, res)
);

// Forgot password route
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  (req, res) => userController.forgotPassword(req, res)
);

// Reset password route
router.post(
  '/reset-password/:token',
  [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  (req, res) => userController.resetPassword(req, res)
);

// Update user profile route (authenticated)
router.put(
  '/profile',
  authMiddleware,
  [
    body('username')
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    body('profile_image')
      .optional()
      .isURL()
      .withMessage('Profile image must be a valid URL'),
    body('theme_mode')
      .optional()
      .isIn(['light', 'dark'])
      .withMessage('Theme mode must be either light or dark'),
  ],
  (req, res) => userController.updateProfile(req, res)
);

module.exports = router; 