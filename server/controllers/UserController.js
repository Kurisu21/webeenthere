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
      
      // Set auth_provider to 'email' for email/password users
      await this.db.execute(
        'UPDATE users SET auth_provider = ? WHERE id = ?',
        ['email', userId]
      );
      
      // Automatically assign free plan to new user
      try {
        // Find free plan dynamically by type instead of hardcoding plan_id
        const Plan = require('../models/Plan');
        const planModel = new Plan(this.db);
        const freePlan = await planModel.findActiveByType('free');
        if (freePlan) {
          await this.subscriptionService.createSubscription(userId, freePlan.id, 'REGISTRATION_FREE_PLAN');
          console.log(`✅ Assigned free plan to new user ${userId}`);
        } else {
          console.error('Free plan not found - cannot assign to new user');
        }
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
      
      // Include profile_image if it's a URL (Auth0 users), otherwise exclude blob data
      const userResponse = { 
        id: user.id, 
        email: user.email, 
        username: user.username, 
        role: user.role 
      };
      
      // Check if user is Auth0 user using auth_provider column
      const isAuth0User = user.auth_provider === 'google';
      
      // If profile_image is a URL (starts with http/https), include it (Auth0 users)
      if (isAuth0User && user.profile_image && typeof user.profile_image === 'string' && 
          (user.profile_image.startsWith('http://') || user.profile_image.startsWith('https://'))) {
        userResponse.profile_image = user.profile_image;
      }
      
      // Include isAuth0User flag for frontend
      userResponse.isAuth0User = isAuth0User;
      
      res.json({ 
        token, 
        user: userResponse
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
      const { username, email, profile_image, theme_mode, email_verification_code } = req.body;

      // Get current user to check if email is changing
      const currentUser = await this.userModel.findById(userId);
      const isEmailChanging = email && email.toLowerCase() !== currentUser.email.toLowerCase();

      // If email is changing, require verification code
      if (isEmailChanging) {
        if (!email_verification_code) {
          return res.status(400).json({
            success: false,
            error: 'Email verification code is required to change email address. Please request a verification code first.',
            requires_verification: true
          });
        }

        // Verify the code is valid and recent (within 15 minutes)
        const verificationResult = await this.userModel.verifyEmailCode(userId, email_verification_code);
        if (!verificationResult.valid) {
          return res.status(400).json({
            success: false,
            error: verificationResult.error || 'Invalid or expired verification code',
            requires_verification: true
          });
        }

        // Since the code was sent to the new email address, if user has the code,
        // they have proven access to that email. We accept the email they provide.
        // Check if new email is already taken by another user
        const existingUser = await this.userModel.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({
            success: false,
            error: 'Email is already registered to another account'
          });
        }

        // Clear verification code after successful verification
        await this.userModel.clearVerificationCode(userId);
      }

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

      // Update user profile
      const updateData = {};
      if (username) updateData.username = username;
      if (email && isEmailChanging) {
        updateData.email = email;
        // Mark email as verified after successful change
        await this.userModel.verifyUser(userId);
      }
      if (profile_image) updateData.profile_image = profile_image;
      if (theme_mode) updateData.theme_mode = theme_mode;

      const success = await this.userModel.updateProfile(userId, updateData);

      if (success) {
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

  // Request email change - sends verification code to new email
  async requestEmailChange(req, res) {
    try {
      const userId = req.user.id;
      const { new_email } = req.body;

      if (!new_email) {
        return res.status(400).json({
          success: false,
          error: 'New email address is required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(new_email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Get current user
      const currentUser = await this.userModel.findById(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if new email is same as current
      if (new_email.toLowerCase() === currentUser.email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          error: 'New email must be different from current email'
        });
      }

      // Check if new email is already taken
      const existingUser = await this.userModel.findByEmail(new_email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          error: 'Email is already registered to another account'
        });
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      // Store verification code in database
      // Note: We don't need to store pending_email - if user has the code, they have access to the email
      await this.userModel.storeVerificationCode(userId, verificationCode, expiresAt);

      // Send verification code email to NEW email address
      const emailSent = await this.emailService.sendEmailChangeVerificationCode(
        new_email, 
        currentUser.username, 
        verificationCode
      );

      if (emailSent) {
        res.json({
          success: true,
          message: 'Verification code sent to new email address'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to send verification code email'
        });
      }
    } catch (err) {
      console.error('Request email change error:', err);
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

  // Update user role (admin can change to any role)
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || (role !== 'user' && role !== 'admin')) {
        return res.status(400).json({ 
          error: 'Role must be either "user" or "admin"' 
        });
      }

      const success = await this.userModel.updateRole(id, role);
      if (success) {
        // Log role change activity
        await databaseActivityLogger.logActivity({
          userId: id,
          action: 'role_changed',
          entityType: 'user',
          entityId: id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: {
            new_role: role,
            timestamp: new Date().toISOString()
          }
        });
        
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
      if (email) {
        // Check if email is being changed
        const user = await this.userModel.findById(id);
        if (user && user.email !== email) {
          // Email is being changed, mark as unverified and send verification code
          updateData.email = email;
          // Mark user as unverified when email changes
          await this.userModel.updateStatus(id, { is_verified: false });
          
          // Generate verification code
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          await this.userModel.storeVerificationCode(id, verificationCode, expiresAt);
          
          // Send verification code to new email
          await this.emailService.sendVerificationCodeEmail(email, username || user.username, verificationCode);
        } else {
          updateData.email = email;
        }
      }
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

  // Update user password (admin can change any user's password)
  async updateUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters' 
        });
      }

      // Hash the new password
      const passwordHash = await bcrypt.hash(password, 10);
      
      const success = await this.userModel.updatePassword(id, passwordHash);
      if (success) {
        // Log password change activity
        await databaseActivityLogger.logActivity({
          userId: id,
          action: 'password_changed',
          entityType: 'user',
          entityId: id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: {
            method: 'admin_password_reset',
            timestamp: new Date().toISOString()
          }
        });
        
        res.json({ message: 'User password updated successfully' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Update user password error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Create user (admin can create users)
  async createUser(req, res) {
    try {
      const { username, email, password, role, is_verified } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({ 
          error: 'Username, email, and password are required' 
        });
      }

      if (password.length < 8) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters' 
        });
      }

      // Check if username already exists
      const existingUsername = await this.userModel.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username is already taken' });
      }

      // Check if email already exists
      const existingEmail = await this.userModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      // Create user
      const userId = await this.userModel.create({ 
        username, 
        email, 
        password
      });

      // Set auth_provider to 'email'
      await this.db.execute(
        'UPDATE users SET auth_provider = ? WHERE id = ?',
        ['email', userId]
      );

      // Set role if provided (default to 'user')
      const userRole = role === 'admin' ? 'admin' : 'user';
      await this.userModel.updateRole(userId, userRole);

      // Set verification status (default to verified if admin creates)
      const verified = is_verified !== undefined ? is_verified : true;
      await this.userModel.updateStatus(userId, { is_verified: verified, is_active: true });

      // Automatically assign free plan to new user
      try {
        const Plan = require('../models/Plan');
        const planModel = new Plan(this.db);
        const freePlan = await planModel.findActiveByType('free');
        if (freePlan) {
          await this.subscriptionService.createSubscription(userId, freePlan.id, 'ADMIN_CREATED_USER');
          console.log(`✅ Assigned free plan to admin-created user ${userId}`);
        }
      } catch (subscriptionError) {
        console.error('Failed to assign free plan to admin-created user:', subscriptionError);
      }

      // Log user creation activity
      await databaseActivityLogger.logActivity({
        userId: req.user?.id, // Admin who created the user
        action: 'user_created',
        entityType: 'user',
        entityId: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          created_user_id: userId,
          username,
          email,
          role: userRole,
          is_verified: verified,
          timestamp: new Date().toISOString()
        }
      });

      res.json({ 
        message: 'User created successfully',
        user: {
          id: userId,
          username,
          email,
          role: userRole,
          is_verified: verified
        }
      });
    } catch (err) {
      console.error('Create user error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Upload profile image
  async uploadProfileImage(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Read file buffer (from memory storage)
      const imageBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;

      console.log('[UserController] Uploading profile image:', {
        userId,
        bufferSize: imageBuffer ? imageBuffer.length : 0,
        mimeType,
        originalName: req.file.originalname
      });

      // Store blob in database
      const updateResult = await this.userModel.updateProfileImage(userId, imageBuffer, mimeType);
      
      if (!updateResult) {
        console.error('[UserController] Failed to update profile image in database');
        return res.status(500).json({ error: 'Failed to save profile image to database' });
      }
      
      console.log('[UserController] Profile image saved successfully');

      res.json({ 
        success: true,
        message: 'Profile image uploaded successfully'
      });
    } catch (error) {
      console.error('Upload profile image error:', error);
      res.status(500).json({ error: 'Failed to upload profile image' });
    }
  }

  // Get profile image as blob
  async getProfileImage(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const profileImage = await this.userModel.getProfileImage(userId);

      if (!profileImage || !profileImage.data) {
        console.log(`[UserController] Profile image not found for user ${userId}`);
        return res.status(404).json({ error: 'Profile image not found' });
      }

      console.log(`[UserController] Serving profile image for user ${userId}:`, {
        dataSize: profileImage.data ? profileImage.data.length : 0,
        mimeType: profileImage.mimeType
      });

      // Set appropriate content type
      const contentType = profileImage.mimeType || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Don't cache to see updates immediately
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Send the blob data
      res.send(profileImage.data);
    } catch (error) {
      console.error('Get profile image error:', error);
      res.status(500).json({ error: 'Failed to retrieve profile image' });
    }
  }

  // Change password (for email/password users only)
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 8 characters'
        });
      }

      // Validate password strength (must contain uppercase, lowercase, and number)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'New password must contain at least one lowercase letter, one uppercase letter, and one number'
        });
      }

      // Get user with password_hash and auth_provider to check if Auth0 user
      const [userRows] = await this.db.execute(
        'SELECT id, password_hash, auth_provider FROM users WHERE id = ?',
        [userId]
      );

      if (!userRows || userRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const user = userRows[0];

      // Check if user is Auth0 user using auth_provider column
      const isAuth0User = user.auth_provider === 'google';

      if (isAuth0User) {
        return res.status(400).json({
          success: false,
          error: 'Password change is not available for Google Auth0 accounts. Please use Google to sign in.'
        });
      }

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      // Update password
      const success = await this.userModel.updatePassword(userId, passwordHash);

      if (success) {
        // Log password change activity
        await databaseActivityLogger.logActivity({
          userId: userId,
          action: 'password_changed',
          entityType: 'user',
          entityId: userId,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          details: {
            method: 'profile_change',
            timestamp: new Date().toISOString()
          }
        });

        res.json({
          success: true,
          message: 'Password changed successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update password'
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }


  // Check if user is Auth0 user (for frontend)
  async checkUserType(req, res) {
    try {
      const userId = req.user.id;
      
      const [userRows] = await this.db.execute(
        'SELECT auth_provider FROM users WHERE id = ?',
        [userId]
      );

      if (!userRows || userRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const user = userRows[0];
      const isAuth0User = user.auth_provider === 'google';

      res.json({
        success: true,
        isAuth0User: !!isAuth0User
      });
    } catch (error) {
      console.error('Check user type error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
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

  // Delete user with cascading deletes (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Check if user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent deleting admin users (safety check)
      if (user.role === 'admin') {
        return res.status(403).json({ error: 'Cannot delete admin users' });
      }

      const connection = await this.db.getConnection();
      
      try {
        await connection.beginTransaction();

        // Delete related records in order (respecting foreign key constraints)
        // 1. Delete user_plan entries
        await connection.execute('DELETE FROM user_plan WHERE user_id = ?', [userId]);
        console.log(`Deleted user_plan entries for user ${userId}`);

        // 2. Delete website analytics (via websites) - get website IDs first
        const [websiteRows] = await connection.execute('SELECT id FROM websites WHERE user_id = ?', [userId]);
        const websiteIds = websiteRows.map((row) => row.id);
        if (websiteIds.length > 0) {
          const placeholders = websiteIds.map(() => '?').join(',');
          await connection.execute(
            `DELETE FROM website_analytics WHERE website_id IN (${placeholders})`,
            websiteIds
          );
          console.log(`Deleted website_analytics for user ${userId}`);
        }

        // 3. Delete media assets
        await connection.execute('DELETE FROM media_assets WHERE user_id = ?', [userId]);
        console.log(`Deleted media_assets for user ${userId}`);

        // 4. Delete AI prompts
        await connection.execute('DELETE FROM ai_prompts WHERE user_id = ?', [userId]);
        console.log(`Deleted ai_prompts for user ${userId}`);

        // 5. Delete custom blocks
        await connection.execute('DELETE FROM custom_blocks WHERE user_id = ?', [userId]);
        console.log(`Deleted custom_blocks for user ${userId}`);

        // 6. Delete forum replies (by author)
        await connection.execute('DELETE FROM forum_replies WHERE author_id = ?', [userId]);
        console.log(`Deleted forum_replies for user ${userId}`);

        // 7. Delete forum threads (by author) - this will cascade delete replies via FK
        await connection.execute('DELETE FROM forum_threads WHERE author_id = ?', [userId]);
        console.log(`Deleted forum_threads for user ${userId}`);

        // 8. Delete support messages (via tickets) - get ticket IDs first
        const [ticketRows] = await connection.execute('SELECT id FROM support_tickets WHERE user_id = ?', [userId]);
        const ticketIds = ticketRows.map((row) => row.id);
        if (ticketIds.length > 0) {
          const placeholders = ticketIds.map(() => '?').join(',');
          await connection.execute(
            `DELETE FROM support_messages WHERE ticket_id IN (${placeholders})`,
            ticketIds
          );
          console.log(`Deleted support_messages for user ${userId}`);
        }

        // 9. Delete support tickets
        await connection.execute('DELETE FROM support_tickets WHERE user_id = ?', [userId]);
        console.log(`Deleted support_tickets for user ${userId}`);

        // 10. Delete feedback responses
        await connection.execute('DELETE FROM feedback_responses WHERE user_id = ?', [userId]);
        console.log(`Deleted feedback_responses for user ${userId}`);

        // 11. Delete feedback
        await connection.execute('DELETE FROM feedback WHERE user_id = ?', [userId]);
        console.log(`Deleted feedback for user ${userId}`);

        // 12. Delete activity logs
        await connection.execute('DELETE FROM activity_logs WHERE user_id = ?', [userId]);
        console.log(`Deleted activity_logs for user ${userId}`);

        // 13. Delete websites (this will cascade delete website_analytics if FK is set up)
        await connection.execute('DELETE FROM websites WHERE user_id = ?', [userId]);
        console.log(`Deleted websites for user ${userId}`);

        // 14. Update templates created by this user (set creator_user_id to NULL)
        await connection.execute('UPDATE templates SET creator_user_id = NULL WHERE creator_user_id = ?', [userId]);
        console.log(`Updated templates for user ${userId}`);

        // 15. Finally, delete the user
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        console.log(`Deleted user ${userId}`);

        await connection.commit();

        // Log deletion activity
        await databaseActivityLogger.logActivity({
          userId: req.user?.id || null,
          action: 'user_deleted',
          entityType: 'user',
          entityId: userId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: {
            deleted_user_id: userId,
            deleted_username: user.username,
            deleted_email: user.email,
            timestamp: new Date().toISOString()
          }
        });

        res.json({ 
          message: 'User and all related data deleted successfully',
          deletedUserId: userId
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ 
        error: 'Failed to delete user',
        details: err.message 
      });
    }
  }

  // ...other user-related methods
}

module.exports = UserController; 