// services/EmailService.js
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async sendVerificationEmail(email, username, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Verify Your WEBeenThere Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .email-container {
              background: white;
              border-radius: 15px;
              padding: 40px;
              max-width: 500px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }
            .logo {
              font-size: 2.5em;
              font-weight: bold;
              background: linear-gradient(45deg, #667eea, #764ba2);
              -webkit-background-clip: text;
              color: transparent;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 30px;
              font-size: 1.8em;
            }
            .verification-button {
              display: inline-block;
              background: linear-gradient(45deg, #667eea, #764ba2);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              transition: transform 0.3s ease;
            }
            .verification-button:hover {
              transform: translateY(-2px);
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .security-notice {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-top: 30px;
              border-left: 4px solid #764ba2;
            }
            .footer {
              color: #999;
              font-size: 0.9em;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo">WEBeenThere</div>
            <h1>Welcome ${username}!</h1>
            <p>Thank you for signing up for WEBeenThere. To complete your registration and start building amazing websites, please verify your email address.</p>
            <a href="${verificationUrl}" class="verification-button">Verify Email Address</a>
            <p>This link will expire in 24 hours for security reasons.</p>
            
            <div class="security-notice">
              <strong>Security Notice:</strong> If you didn't create an account with WEBeenThere, you can safely ignore this email.
            </div>
            
            <div class="footer">
              <p>Need help? Contact our support team</p>
              <p>&copy; 2025 WEBeenThere. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email, username, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Reset Your WEBeenThere Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .email-container {
              background: white;
              border-radius: 15px;
              padding: 40px;
              max-width: 500px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }
            .logo {
              font-size: 2.5em;
              font-weight: bold;
              background: linear-gradient(45deg, #667eea, #764ba2);
              -webkit-background-clip: text;
              color: transparent;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 30px;
              font-size: 1.8em;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              margin: 25px 0;
              transition: all 0.3s ease;
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
              letter-spacing: 0.5px;
            }
            .reset-button:hover {
              transform: translateY(-3px);
              box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .security-notice {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-top: 30px;
              border-left: 4px solid #667eea;
            }
            .footer {
              color: #999;
              font-size: 0.9em;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo">WEBeenThere</div>
            <h1>Password Reset Request</h1>
            <p>Hi ${username},</p>
            <p>We received a request to reset your password for your WEBeenThere account. Click the button below to create a new password.</p>
            <a href="${resetUrl}" class="reset-button">Reset Password</a>
            <p>This link will expire in 1 hour for security reasons.</p>
            
            <div class="security-notice">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </div>
            
            <div class="footer">
              <p>Need help? Contact our support team</p>
              <p>&copy; 2025 WEBeenThere. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendVerificationCodeEmail(email, username, code) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Your WEBeenThere Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification Code</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .email-container {
              background: white;
              border-radius: 15px;
              padding: 40px;
              max-width: 500px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }
            .logo {
              font-size: 2.5em;
              font-weight: bold;
              background: linear-gradient(45deg, #667eea, #764ba2);
              -webkit-background-clip: text;
              color: transparent;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 30px;
              font-size: 1.8em;
            }
            .verification-code {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 3em;
              font-weight: bold;
              padding: 20px 40px;
              border-radius: 12px;
              letter-spacing: 8px;
              margin: 30px 0;
              display: inline-block;
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .expiry-notice {
              background: #fff3cd;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              border-left: 4px solid #ffc107;
              color: #856404;
            }
            .security-notice {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-top: 30px;
              border-left: 4px solid #764ba2;
            }
            .footer {
              color: #999;
              font-size: 0.9em;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo">WEBeenThere</div>
            <h1>Welcome ${username}!</h1>
            <p>Thank you for signing up for WEBeenThere. To complete your registration, please enter the verification code below:</p>
            <div class="verification-code">${code}</div>
            <p>This code will expire in 15 minutes for security reasons.</p>
            
            <div class="expiry-notice">
              <strong>⏰ Important:</strong> Please use this code within 15 minutes. If it expires, you can request a new code.
            </div>
            
            <div class="security-notice">
              <strong>Security Notice:</strong> If you didn't create an account with WEBeenThere, you can safely ignore this email.
            </div>
            
            <div class="footer">
              <p>Need help? Contact our support team</p>
              <p>&copy; 2025 WEBeenThere. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      // Add timeout to prevent hanging (10 seconds)
      const sendPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      );
      
      await Promise.race([sendPromise, timeoutPromise]);
      console.log(`Verification code email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending verification code email:', error);
      return false;
    }
  }

  async sendEmailChangeVerificationCode(newEmail, username, code) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: newEmail,
      subject: 'Verify Your New Email Address - WEBeenThere',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Change Verification</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .email-container {
              background: white;
              border-radius: 15px;
              padding: 40px;
              max-width: 500px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }
            .logo {
              font-size: 2.5em;
              font-weight: bold;
              background: linear-gradient(45deg, #667eea, #764ba2);
              -webkit-background-clip: text;
              color: transparent;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 30px;
              font-size: 1.8em;
            }
            .verification-code {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 3em;
              font-weight: bold;
              padding: 20px 40px;
              border-radius: 12px;
              letter-spacing: 8px;
              margin: 30px 0;
              display: inline-block;
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .expiry-notice {
              background: #fff3cd;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              border-left: 4px solid #ffc107;
              color: #856404;
            }
            .security-notice {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-top: 30px;
              border-left: 4px solid #764ba2;
            }
            .footer {
              color: #999;
              font-size: 0.9em;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo">WEBeenThere</div>
            <h1>Verify Your New Email Address</h1>
            <p>Hello ${username},</p>
            <p>You requested to change your email address to <strong>${newEmail}</strong>. To complete this change, please enter the verification code below:</p>
            <div class="verification-code">${code}</div>
            <p>This code will expire in 15 minutes for security reasons.</p>
            
            <div class="expiry-notice">
              <strong>⏰ Important:</strong> Please use this code within 15 minutes. If it expires, you can request a new code.
            </div>
            
            <div class="security-notice">
              <strong>Security Notice:</strong> If you didn't request this email change, please ignore this email and contact support immediately.
            </div>
            
            <div class="footer">
              <p>Need help? Contact our support team</p>
              <p>&copy; 2025 WEBeenThere. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email change verification code sent to ${newEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending email change verification code:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email, username) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to WEBeenThere! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to WEBeenThere</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .email-container {
              background: white;
              border-radius: 15px;
              padding: 40px;
              max-width: 600px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }
            .logo {
              font-size: 3em;
              font-weight: bold;
              background: linear-gradient(45deg, #667eea, #764ba2);
              -webkit-background-clip: text;
              color: transparent;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 20px;
              font-size: 2em;
            }
            .welcome-message {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              margin: 30px 0;
            }
            .welcome-message h2 {
              margin: 0 0 15px 0;
              font-size: 1.5em;
            }
            .features {
              text-align: left;
              margin: 30px 0;
            }
            .feature-item {
              display: flex;
              align-items: center;
              margin: 15px 0;
              color: #333;
            }
            .feature-icon {
              width: 30px;
              height: 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              color: white;
              font-weight: bold;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(45deg, #667eea, #764ba2);
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              transition: transform 0.3s ease;
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            }
            .cta-button:hover {
              transform: translateY(-2px);
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .footer {
              color: #999;
              font-size: 0.9em;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo">WEBeenThere</div>
            <h1>Welcome to the Family, ${username}! 🎉</h1>
            
            <div class="welcome-message">
              <h2>Thank You for Joining Us!</h2>
              <p style="margin: 0; color: white;">We're thrilled to have you on board. You're now part of a community of creators building amazing websites.</p>
            </div>
            
            <p>At WEBeenThere, we make it easy for freelancers, artists, and small business owners to create beautiful, professional websites without any coding knowledge.</p>
            
            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">✨</div>
                <div>
                  <strong>Drag & Drop Builder</strong><br>
                  <span style="color: #666; font-size: 0.9em;">Create stunning websites with our intuitive builder</span>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🎨</div>
                <div>
                  <strong>Beautiful Templates</strong><br>
                  <span style="color: #666; font-size: 0.9em;">Choose from professionally designed templates</span>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🚀</div>
                <div>
                  <strong>Publish Instantly</strong><br>
                  <span style="color: #666; font-size: 0.9em;">Get your website live in minutes</span>
                </div>
              </div>
            </div>
            
            <a href="${frontendUrl}/login" class="cta-button">Get Started Now</a>
            
            <p style="color: #999; font-size: 0.9em;">First, make sure to verify your email address using the code we sent you.</p>
            
            <div class="footer">
              <p>Need help? Our support team is here for you.</p>
              <p>&copy; 2024 WEBeenThere. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      // Add timeout to prevent hanging (10 seconds)
      const sendPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      );
      
      await Promise.race([sendPromise, timeoutPromise]);
      console.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  generateVerificationToken() {
    return uuidv4();
  }
}

module.exports = EmailService;
