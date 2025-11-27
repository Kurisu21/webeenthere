// models/User.js
const bcrypt = require('bcryptjs');

class User {
  constructor(db) {
    this.db = db;
  }

  // Create a new user (no token parameters - tokens stored separately)
  async create({ username, email, password }) {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await this.db.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );
    return result.insertId;
  }

  // Create a user from OAuth profile (password is placeholder for OAuth users)
  async createFromOAuth({ username, email, password }) {
    // OAuth users don't need real passwords, but database requires password_hash
    // This method is a wrapper for clarity
    return await this.create({ username, email, password });
  }

  // Find user by email
  async findByEmail(email) {
    const [rows] = await this.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Note: Token-related methods removed - tokens are now handled by TokenStorage class

  // Find user by username
  async findByUsername(username) {
    const [rows] = await this.db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // Verify user email (no token cleanup needed - tokens handled by TokenStorage)
  async verifyUser(userId) {
    const [result] = await this.db.execute(
      'UPDATE users SET is_verified = TRUE WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // Store email verification code
  async storeVerificationCode(userId, code, expiresAt) {
    const [result] = await this.db.execute(
      'UPDATE users SET email_verification_code = ?, email_verification_code_expires_at = ?, email_verification_attempts = 0 WHERE id = ?',
      [code, expiresAt, userId]
    );
    return result.affectedRows > 0;
  }

  // Verify email code
  async verifyEmailCode(userId, code) {
    const [rows] = await this.db.execute(
      'SELECT email_verification_code, email_verification_code_expires_at, email_verification_attempts FROM users WHERE id = ?',
      [userId]
    );
    
    if (!rows[0]) {
      return { valid: false, error: 'User not found' };
    }

    const user = rows[0];

    // Check if code exists
    if (!user.email_verification_code) {
      return { valid: false, error: 'No verification code found' };
    }

    // Check if code has expired
    if (new Date() > new Date(user.email_verification_code_expires_at)) {
      return { valid: false, error: 'Verification code has expired' };
    }

    // Check if max attempts exceeded
    if (user.email_verification_attempts >= 5) {
      return { valid: false, error: 'Maximum verification attempts exceeded. Please request a new code.' };
    }

    // Check if code matches
    if (user.email_verification_code !== code) {
      // Increment attempts
      await this.incrementVerificationAttempts(userId);
      return { valid: false, error: 'Invalid verification code' };
    }

    // Code is valid
    return { valid: true };
  }

  // Increment verification attempts
  async incrementVerificationAttempts(userId) {
    const [result] = await this.db.execute(
      'UPDATE users SET email_verification_attempts = email_verification_attempts + 1 WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // Clear verification code after successful verification
  async clearVerificationCode(userId) {
    const [result] = await this.db.execute(
      'UPDATE users SET email_verification_code = NULL, email_verification_code_expires_at = NULL, email_verification_attempts = 0 WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // Update user password (no token cleanup needed - tokens handled by TokenStorage)
  async updatePassword(userId, passwordHash) {
    const [result] = await this.db.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );
    return result.affectedRows > 0;
  }

  // Note: Reset password token methods removed - tokens now handled by TokenStorage class

  // Update user profile (removed token parameters - tokens handled by TokenStorage)
  async updateProfile(userId, { username, email, theme_mode, profile_image }) {
    const fields = [];
    const values = [];
    
    if (username !== undefined) {
      fields.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    if (theme_mode !== undefined) {
      fields.push('theme_mode = ?');
      values.push(theme_mode);
    }
    if (profile_image !== undefined) {
      fields.push('profile_image = ?');
      values.push(profile_image);
    }
    
    if (fields.length === 0) return true;
    
    values.push(userId);
    const [result] = await this.db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // Update profile image as blob
  async updateProfileImage(userId, imageBuffer, mimeType) {
    try {
      // Ensure we have a Buffer
      const buffer = Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer);
      
      console.log(`[User Model] Updating profile image for user ${userId}:`, {
        bufferSize: buffer.length,
        mimeType: mimeType || 'image/jpeg'
      });

      // Try to update with mime_type column if it exists
      const [result] = await this.db.execute(
        'UPDATE users SET profile_image = ?, profile_image_mime_type = ? WHERE id = ?',
        [buffer, mimeType || 'image/jpeg', userId]
      );
      
      console.log(`[User Model] Profile image update result:`, {
        affectedRows: result.affectedRows,
        userId
      });
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`[User Model] Error updating profile image:`, error.message);
      // If mime_type column doesn't exist, just update the blob
      if (error.message && error.message.includes('profile_image_mime_type')) {
        const buffer = Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer);
        const [result] = await this.db.execute(
          'UPDATE users SET profile_image = ? WHERE id = ?',
          [buffer, userId]
        );
        console.log(`[User Model] Profile image update (no mime_type column):`, {
          affectedRows: result.affectedRows,
          userId
        });
        return result.affectedRows > 0;
      }
      throw error;
    }
  }

  // Get profile image blob
  async getProfileImage(userId) {
    try {
      // Try to get with mime_type column if it exists
      const [rows] = await this.db.execute(
        'SELECT profile_image, profile_image_mime_type FROM users WHERE id = ?',
        [userId]
      );
      
      if (!rows[0] || !rows[0].profile_image) {
        console.log(`[User Model] No profile image found for user ${userId}`);
        return null;
      }
      
      const blobData = rows[0].profile_image;
      const isBuffer = Buffer.isBuffer(blobData);
      const dataSize = isBuffer ? blobData.length : (blobData ? blobData.length : 0);
      
      console.log(`[User Model] Retrieved profile image for user ${userId}:`, {
        isBuffer,
        dataSize,
        mimeType: rows[0].profile_image_mime_type || 'image/jpeg'
      });
      
      // Ensure we return a Buffer
      const buffer = Buffer.isBuffer(blobData) ? blobData : Buffer.from(blobData);
      
      return {
        data: buffer,
        mimeType: rows[0].profile_image_mime_type || 'image/jpeg'
      };
    } catch (error) {
      console.error(`[User Model] Error getting profile image:`, error.message);
      // If mime_type column doesn't exist, just get the blob
      if (error.message && error.message.includes('profile_image_mime_type')) {
        const [rows] = await this.db.execute(
          'SELECT profile_image FROM users WHERE id = ?',
          [userId]
        );
        if (!rows[0] || !rows[0].profile_image) {
          return null;
        }
        const blobData = rows[0].profile_image;
        const buffer = Buffer.isBuffer(blobData) ? blobData : Buffer.from(blobData);
        return {
          data: buffer,
          mimeType: 'image/jpeg' // Default mime type
        };
      }
      throw error;
    }
  }

  // Get user by ID
  async findById(userId) {
    const [rows] = await this.db.execute(
      'SELECT id, username, email, profile_image, role, theme_mode, is_verified, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );
    return rows[0];
  }

  // Find all users with pagination and filters
  async findAll({ page, limit, offset, search, role, status }) {
    let query = 'SELECT id, username, email, profile_image, role, theme_mode, is_verified, is_active, created_at FROM users';
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(username LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }

    if (status === 'active') {
      conditions.push('is_active = TRUE');
    } else if (status === 'inactive') {
      conditions.push('is_active = FALSE');
    } else if (status === 'verified') {
      conditions.push('is_verified = TRUE');
    } else if (status === 'unverified') {
      conditions.push('is_verified = FALSE');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await this.db.execute(query, params);
    return rows;
  }

  // Count all users with filters
  async countAll({ search, role, status }) {
    let query = 'SELECT COUNT(*) as count FROM users';
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(username LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }

    if (status === 'active') {
      conditions.push('is_active = TRUE');
    } else if (status === 'inactive') {
      conditions.push('is_active = FALSE');
    } else if (status === 'verified') {
      conditions.push('is_verified = TRUE');
    } else if (status === 'unverified') {
      conditions.push('is_verified = FALSE');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await this.db.execute(query, params);
    return rows[0].count;
  }

  // Update user role
  async updateRole(userId, role) {
    const [result] = await this.db.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
    return result.affectedRows > 0;
  }

  // Update user status
  async updateStatus(userId, { is_active, is_verified }) {
    const fields = [];
    const values = [];

    if (is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(is_active);
    }

    if (is_verified !== undefined) {
      fields.push('is_verified = ?');
      values.push(is_verified);
    }

    if (fields.length === 0) return true;

    values.push(userId);
    const [result] = await this.db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // Get dashboard statistics
  async getStats() {
    const [totalUsers] = await this.db.execute('SELECT COUNT(*) as count FROM users');
    const [activeUsers] = await this.db.execute('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');
    const [verifiedUsers] = await this.db.execute('SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE');
    const [adminUsers] = await this.db.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    const [recentUsers] = await this.db.execute(`
      SELECT id, username, email, role, theme_mode, is_verified, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    return {
      totalUsers: totalUsers[0].count,
      activeUsers: activeUsers[0].count,
      verifiedUsers: verifiedUsers[0].count,
      adminUsers: adminUsers[0].count,
      recentUsers
    };
  }

  // ...other user-related methods
}

module.exports = User; 