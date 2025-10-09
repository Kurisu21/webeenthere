const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TokenStorage {
  constructor() {
    this.tokenFile = path.join(__dirname, '../data/tokens.json');
    this.tokenDir = path.dirname(this.tokenFile);
    this.data = { verification: {}, passwordReset: {} };
  }

  // Initialize token storage - create file if it doesn't exist
  async initialize() {
    try {
      // Ensure data directory exists
      await fs.mkdir(this.tokenDir, { recursive: true });
      
      // Try to read existing tokens or create empty file
      try {
        const fileContent = await fs.readFile(this.tokenFile, 'utf8');
        this.data = JSON.parse(fileContent);
      } catch (error) {
        // File doesn't exist or is corrupted, start fresh
        this.data = { verification: {}, passwordReset: {} };
        await this.save();
      }
    } catch (error) {
      console.error('Error initializing token storage:', error);
      throw error;
    }
  }

  // Save tokens to JSON file
  async save() {
    try {
      await fs.writeFile(this.tokenFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving token storage:', error);
      throw error;
    }
  }

  // Generate verification token
  async generateVerificationToken(userId, email, username) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    this.data.verification[token] = {
      userId,
      email,
      username,
      createdAt: new Date(),
      expiresAt,
      used: false
    };
    
    await this.save();
    return token;
  }

  // Generate password reset token
  async generatePasswordResetToken(userId, email) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    this.data.passwordReset[token] = {
      userId,
      email,
      createdAt: new Date(),
      expiresAt,
      used: false
    };
    
    await this.save();
    return token;
  }

  // Verify token and get data
  async verifyToken(token, tokenType = 'verification') {
    await this.cleanup(); // Clean expired tokens first
    
    const tokenData = this.data[tokenType][token];
    
    if (!tokenData) {
      return { valid: false, error: 'Token not found' };
    }
    
    if (tokenData.used) {
      return { valid: false, error: 'Token already used' };
    }
    
    if (new Date() > new Date(tokenData.expiresAt)) {
      return { valid: false, error: 'Token expired' };
    }
    
    return { valid: true, data: tokenData };
  }

  // Mark token as used
  async markTokenUsed(token, tokenType = 'verification') {
    if (this.data[tokenType][token]) {
      this.data[tokenType][token].used = true;
      this.data[tokenType][token].usedAt = new Date();
      await this.save();
    }
  }

  // Clean up expired tokens
  async cleanup() {
    const now = new Date();
    
    // Clean verification tokens
    for (const token in this.data.verification) {
      if (new Date(this.data.verification[token].expiresAt) <= now) {
        delete this.data.verification[token];
      }
    }
    
    // Clean password reset tokens
    for (const token in this.data.passwordReset) {
      if (new Date(this.data.passwordReset[token].expiresAt) <= now) {
        delete this.data.passwordReset[token];
      }
    }
    
    await this.save();
  }

  // Get stats for debugging
  getStats() {
    const verificationCount = Object.keys(this.data.verification).length;
    const passwordResetCount = Object.keys(this.data.passwordReset).length;
    
    return {
      verificationTokens: verificationCount,
      passwordResetTokens: passwordResetCount,
      totalTokens: verificationCount + passwordResetCount
    };
  }

  // Initialize and run cleanup - for server startup
  async initializeAndCleanup() {
    await this.initialize();
    await this.cleanup();
    console.log('🧹 Token storage initialized and cleaned up');
  }
}

module.exports = TokenStorage;
