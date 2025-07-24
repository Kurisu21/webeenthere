// routes/userRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import User model and controller
const db = require('../database');
const User = require('../models/User');
const UserController = require('../controllers/UserController');

const userModel = new User(db);
const userController = new UserController(userModel);

// Register route
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  (req, res) => userController.register(req, res)
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  (req, res) => userController.login(req, res)
);

module.exports = router; 