// controllers/UserController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EmailService = require('../services/EmailService');
const TokenStorage = require('../services/TokenStorage');

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
      
      // Try to find user by email first, then by username if not found
      let user = await this.userModel.findByEmail(email);
      if (!user) {
        user = await this.userModel.findByUsername(email);
      }
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Check if user is verified
      if (!user.is_verified) {
        return res.status(400).json({ 
          error: 'Account not verified. Please check your email and verify your account.' 
        });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );
      res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (err) {
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

  // ...other user-related methods
}

module.exports = UserController; 