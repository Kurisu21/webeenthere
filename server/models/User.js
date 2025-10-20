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