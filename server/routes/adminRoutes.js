// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../middleware/auth');

// Import UserController
const UserController = require('../controllers/UserController');
const User = require('../models/User');
const { getDatabaseConnection } = require('../database/database');

// Initialize UserController with User model
const userController = new UserController(new User(getDatabaseConnection()));

// Apply admin authentication middleware to all routes
router.use(adminAuthMiddleware);

// Admin dashboard statistics
router.get('/stats', (req, res) => userController.getDashboardStats(req, res));

// User management routes
router.get('/users', (req, res) => userController.getAllUsers(req, res));
router.get('/users/:id', (req, res) => userController.getUserById(req, res));
router.put('/users/:id/role', (req, res) => userController.updateUserRole(req, res));
router.put('/users/:id/status', (req, res) => userController.updateUserStatus(req, res));
router.put('/users/:id/profile', (req, res) => userController.updateUserProfile(req, res));

module.exports = router;

