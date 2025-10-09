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

  // Get user by ID
  async findById(userId) {
    const [rows] = await this.db.execute(
      'SELECT id, username, email, profile_image, role, theme_mode, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );
    return rows[0];
  }

  // ...other user-related methods
}

module.exports = User; 