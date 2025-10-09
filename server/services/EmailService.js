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
              <p>&copy; 2024 WEBeenThere. All rights reserved.</p>
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
              background: linear-gradient(45deg, #e74c3c, #c0392b);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              transition: transform 0.3s ease;
            }
            .reset-button:hover {
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
              border-left: 4px solid #e74c3c;
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
              <p>&copy; 2024 WEBeenThere. All rights reserved.</p>
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

  generateVerificationToken() {
    return uuidv4();
  }
}

module.exports = EmailService;
