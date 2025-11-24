// controllers/UserController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EmailService = require('../services/EmailService');
const TokenStorage = require('../services/TokenStorage');
const databaseActivityLogger = require('../services/DatabaseActivityLogger');
const SubscriptionService = require('../services/SubscriptionService');
const { getDatabaseConnection } = require('../database/database');

class UserController {
  constructor(userModel) {
    this.userModel = userModel;
    this.emailService = new EmailService();
    this.tokenStorage = new TokenStorage();
    this.db = getDatabaseConnection();
    this.subscriptionService = new SubscriptionService(this.db);
    
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
      
      // Automatically assign free plan to new user
      try {
        const freePlanId = 1; // Free plan is always plan_id 1
        await this.subscriptionService.createSubscription(userId, freePlanId, 'REGISTRATION_FREE_PLAN');
        console.log(`✅ Assigned free plan to new user ${userId}`);
      } catch (subscriptionError) {
        console.error('Failed to assign free plan to new user:', subscriptionError);
        // Continue with registration even if plan assignment fails
      }
      
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      
      // Store verification code in database
      await this.userModel.storeVerificationCode(userId, verificationCode, expiresAt);
      
      // Send verification code email
      const codeEmailSent = await this.emailService.sendVerificationCodeEmail(email, username, verificationCode);
      if (!codeEmailSent) {
        console.error('Failed to send verification code email to:', email);
      }
      
      // Send welcome email
      const welcomeEmailSent = await this.emailService.sendWelcomeEmail(email, username);
      if (!welcomeEmailSent) {
        console.error('Failed to send welcome email to:', email);
      }
      
      res.status(201).json({ 
        message: 'User registered successfully. Please check your email for the verification code.', 
        userId,
        email
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
      const { extractClientIP } = require('../utils/ipExtractor');
      const ipAddress = extractClientIP(req);
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
      
      // Store session token in database
      try {
        await this.db.execute(
          'UPDATE users SET session_token = ? WHERE id = ?',
          [token, user.id]
        );
      } catch (tokenError) {
        console.error('Failed to store session token:', tokenError);
        // Continue with login even if token storage fails
      }
      
      // Log successful login
      await databaseActivityLogger.logUserLogin(user.id, ipAddress, userAgent);
      
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

  // Logout a user
  async logout(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Clear session token from database
      try {
        await this.db.execute(
          'UPDATE users SET session_token = NULL WHERE id = ?',
          [userId]
        );
        
        // Log logout activity
        const ipAddress = req.ip || 
          req.connection.remoteAddress || 
          req.socket.remoteAddress ||
          (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
          req.headers['x-forwarded-for']?.split(',')[0] ||
          'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        
        await databaseActivityLogger.logActivity({
          userId: userId,
          action: 'user_logout',
          entityType: 'user',
          entityId: userId,
          ipAddress: ipAddress,
          userAgent: userAgent,
          details: { 
            timestamp: new Date().toISOString()
          }
        });
        
        res.json({ message: 'Logged out successfully' });
      } catch (error) {
        console.error('Failed to clear session token:', error);
        res.status(500).json({ error: 'Failed to logout' });
      }
    } catch (err) {
      console.error('Logout error:', err);
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

  // Verify email with 6-digit code
  async verifyEmailCode(req, res) {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ 
          error: 'Email and verification code are required' 
        });
      }
      
      // Find user by email
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        return res.status(400).json({ 
          error: 'User not found' 
        });
      }
      
      if (user.is_verified) {
        return res.status(400).json({ 
          error: 'Email is already verified' 
        });
      }
      
      // Verify the code
      const verificationResult = await this.userModel.verifyEmailCode(user.id, code);
      
      if (!verificationResult.valid) {
        return res.status(400).json({ 
          error: verificationResult.error || 'Invalid verification code' 
        });
      }
      
      // Mark user as verified
      const success = await this.userModel.verifyUser(user.id);
      if (!success) {
        return res.status(500).json({ error: 'Failed to verify email' });
      }
      
      // Clear verification code
      await this.userModel.clearVerificationCode(user.id);
      
      res.json({ 
        message: 'Email verified successfully! You can now log in.' 
      });
    } catch (err) {
      console.error('Email verification error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Resend verification code
  async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          error: 'Email is required' 
        });
      }
      
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
      
      // Generate new 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      
      // Store verification code in database
      await this.userModel.storeVerificationCode(user.id, verificationCode, expiresAt);
      
      // Send verification code email
      const emailSent = await this.emailService.sendVerificationCodeEmail(email, user.username, verificationCode);
      
      if (emailSent) {
        res.json({ message: 'Verification code sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send verification code email' });
      }
    } catch (err) {
      console.error('Resend verification code error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Resend verification email (legacy method for backward compatibility)
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
      const { token, password } = req.body;
      
      if (!token) {
        return res.status(400).json({ 
          error: 'Reset token is required' 
        });
      }
      
      if (!password || password.length < 8) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters' 
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
        // Log password change activity
        await databaseActivityLogger.logActivity({
          userId: tokenData.userId,
          action: 'password_changed',
          entityType: 'user',
          entityId: tokenData.userId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: {
            method: 'password_reset',
            timestamp: new Date().toISOString()
          }
        });
        
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
        // Log profile update activity
        await databaseActivityLogger.logActivity({
          userId: id,
          action: 'profile_updated',
          entityType: 'user',
          entityId: id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: {
            fields_changed: Object.keys(updateData),
            username: updateData.username,
            email: updateData.email,
            theme_mode: updateData.theme_mode
          }
        });
        
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