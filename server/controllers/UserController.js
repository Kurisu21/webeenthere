// controllers/UserController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EmailService = require('../services/EmailService');
const TokenStorage = require('../services/TokenStorage');
const databaseActivityLogger = require('../services/DatabaseActivityLogger');

class UserController {
  constructor(userModel) {
    this.userModel = userModel;
    this.emailService = new EmailService();
    this.tokenStorage = new TokenStorage();
    
    // Initialize token storage
    this.tokenStorage.initialize().catch(err => {
      console.error('Failed to initialize token storage:', err);
    });
  }


  // Register a new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      console.log('Registration validation errors:', errors.array());
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { username, email, password } = req.body;
      
      // Create user without tokens
      const userId = await this.userModel.create({ 
        username, 
        email, 
        password
      });
      
      // Generate verification token and store it separately
      const verificationToken = await this.tokenStorage.generateVerificationToken(userId, email, username);
      
      // Send verification email
      const emailSent = await this.emailService.sendVerificationEmail(email, username, verificationToken);
      
      if (!emailSent) {
        console.error('Failed to send verification email to:', email);
      }
      
      res.status(201).json({ 
        message: 'User registered successfully. Please check your email for verification.', 
        userId 
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Login a user
  async login(req, res) {
    try {
      console.log('Login attempt:', { email: req.body.email, passwordLength: req.body.password?.length });
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      
      // Trim whitespace from email
      const trimmedEmail = email ? email.trim() : '';
      
      // Get IP address and user agent for logging
      const ipAddress = req.ip || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        req.headers['x-forwarded-for']?.split(',')[0] ||
        'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // Try to find user by email first, then by username if not found
      let user = await this.userModel.findByEmail(trimmedEmail);
      if (!user) {
        user = await this.userModel.findByUsername(trimmedEmail);
      }
      if (!user) {
        // Log failed login attempt - user not found
        await databaseActivityLogger.logActivity({
          userId: null,
          action: 'failed_login_attempt',
          entityType: 'user',
          entityId: null,
          ipAddress: ipAddress,
          userAgent: userAgent,
          details: { 
            email: trimmedEmail, 
            reason: 'User not found',
            timestamp: new Date().toISOString()
          }
        });
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        // Log failed login attempt - wrong password
        await databaseActivityLogger.logActivity({
          userId: user.id,
          action: 'failed_login_attempt',
          entityType: 'user',
          entityId: user.id,
          ipAddress: ipAddress,
          userAgent: userAgent,
          details: { 
            email: trimmedEmail, 
            username: user.username,
            reason: 'Invalid password',
            timestamp: new Date().toISOString()
          }
        });
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Check if user is active
      if (!user.is_active) {
        // Log failed login attempt - account deactivated
        await databaseActivityLogger.logActivity({
          userId: user.id,
          action: 'failed_login_attempt',
          entityType: 'user',
          entityId: user.id,
          ipAddress: ipAddress,
          userAgent: userAgent,
          details: { 
            email: trimmedEmail, 
            username: user.username,
            reason: 'Account deactivated',
            timestamp: new Date().toISOString()
          }
        });
        return res.status(400).json({ 
          error: 'Account is deactivated. Please contact support.' 
        });
      }
      
      // Check if user is verified
      if (!user.is_verified) {
        // Log failed login attempt - account not verified
        await databaseActivityLogger.logActivity({
          userId: user.id,
          action: 'failed_login_attempt',
          entityType: 'user',
          entityId: user.id,
          ipAddress: ipAddress,
          userAgent: userAgent,
          details: { 
            email: trimmedEmail, 
            username: user.username,
            reason: 'Account not verified',
            timestamp: new Date().toISOString()
          }
        });
        return res.status(400).json({ 
          error: 'Account not verified. Please check your email and verify your account.' 
        });
      }
      
      // Log successful login
      await databaseActivityLogger.logActivity({
        userId: user.id,
        action: user.role === 'admin' ? 'admin_login' : 'user_login',
        entityType: 'user',
        entityId: user.id,
        ipAddress: ipAddress,
        userAgent: userAgent,
        details: { 
          email: trimmedEmail, 
          username: user.username,
          role: user.role,
          login_method: 'password',
          timestamp: new Date().toISOString()
        }
      });
      
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username, 
          role: user.role 
        } 
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Verify user email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      
      // Verify token using TokenStorage
      const tokenResult = await this.tokenStorage.verifyToken(token, 'verification');
      if (!tokenResult.valid) {
        return res.status(400).json({ 
          error: tokenResult.error || 'Invalid or expired verification token' 
        });
      }
      
      const tokenData = tokenResult.data;
      
      // Mark token as used
      await this.tokenStorage.markTokenUsed(token, 'verification');
      
      // Verify user in database
      const success = await this.userModel.verifyUser(tokenData.userId);
      if (success) {
        res.json({ 
          message: 'Email verified successfully! You can now log in.' 
        });
      } else {
        res.status(500).json({ error: 'Failed to verify email' });
      }
    } catch (err) {
      console.error('Email verification error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        return res.status(400).json({ 
          error: 'Email not found' 
        });
      }
      
      if (user.is_verified) {
        return res.status(400).json({ 
          error: 'Email is already verified' 
        });
      }
      
      // Generate new verification token and store it separately
      const verificationToken = await this.tokenStorage.generateVerificationToken(user.id, email, user.username);
      
      const emailSent = await this.emailService.sendVerificationEmail(email, user.username, verificationToken);
      
      if (emailSent) {
        res.json({ message: 'Verification email sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send verification email' });
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ 
          message: 'If the email exists, a password reset link has been sent.' 
        });
      }
      
      // Generate reset token and store it separately
      const resetToken = await this.tokenStorage.generatePasswordResetToken(user.id, email);
      
      const emailSent = await this.emailService.sendPasswordResetEmail(email, user.username, resetToken);
      
      res.json({ 
        message: 'If the email exists, a password reset link has been sent.' 
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters' 
        });
      }
      
      // Verify token using TokenStorage
      const tokenResult = await this.tokenStorage.verifyToken(token, 'passwordReset');
      if (!tokenResult.valid) {
        return res.status(400).json({ 
          error: tokenResult.error || 'Invalid or expired reset token' 
        });
      }
      
      const tokenData = tokenResult.data;
      
      // Mark token as used
      await this.tokenStorage.markTokenUsed(token, 'passwordReset');
      
      const passwordHash = await bcrypt.hash(password, 10);
      const success = await this.userModel.updatePassword(tokenData.userId, passwordHash);
      
      if (success) {
        res.json({ 
          message: 'Password reset successfully! You can now log in with your new password.' 
        });
      } else {
        res.status(500).json({ error: 'Failed to reset password' });
      }
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { username, email, profile_image, theme_mode } = req.body;

      // Check if username is already taken by another user
      if (username) {
        const existingUser = await this.userModel.findByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({
            success: false,
            error: 'Username is already taken'
          });
        }
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await this.userModel.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({
            success: false,
            error: 'Email is already registered'
          });
        }
      }

      // Update user profile
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (profile_image) updateData.profile_image = profile_image;
      if (theme_mode) updateData.theme_mode = theme_mode;

      const success = await this.userModel.updateProfile(userId, updateData);

      if (success) {
        // User updated successfully

        res.json({
          success: true,
          message: 'Profile updated successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update profile'
        });
      }
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }

  // Admin-specific methods

  // Get all users with pagination
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const role = req.query.role || '';
      const status = req.query.status || '';

      const offset = (page - 1) * limit;
      
      const users = await this.userModel.findAll({
        page,
        limit,
        offset,
        search,
        role,
        status
      });

      const totalUsers = await this.userModel.countAll({ search, role, status });
      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (err) {
      console.error('Get all users error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await this.userModel.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive data
      const { password_hash, ...userData } = user;
      res.json({ user: userData });
    } catch (err) {
      console.error('Get user by ID error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Update user role (only user to user, not admin)
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (role !== 'user') {
        return res.status(400).json({ 
          error: 'Can only assign user role. Admin role cannot be assigned through this endpoint.' 
        });
      }

      const success = await this.userModel.updateRole(id, role);
      if (success) {
        res.json({ message: 'User role updated successfully' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Update user role error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Update user status (is_active, is_verified)
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active, is_verified } = req.body;

      const success = await this.userModel.updateStatus(id, { is_active, is_verified });
      if (success) {
        res.json({ message: 'User status updated successfully' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Update user status error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Update user profile (admin can edit any user)
  async updateUserProfile(req, res) {
    try {
      const { id } = req.params;
      const { username, email, profile_image, theme_mode } = req.body;

      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (profile_image !== undefined) updateData.profile_image = profile_image;
      if (theme_mode) updateData.theme_mode = theme_mode;

      const success = await this.userModel.updateProfile(id, updateData);
      if (success) {
        res.json({ message: 'User profile updated successfully' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Update user profile error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await this.userModel.getStats();
      res.json({ stats });
    } catch (err) {
      console.error('Get dashboard stats error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // ...other user-related methods
}

module.exports = UserController; 