// models/User.js
const bcrypt = require('bcryptjs');

class User {
  constructor(db) {
    this.db = db;
  }

  // Create a new user
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

  // ...other user-related methods
}

module.exports = User; 