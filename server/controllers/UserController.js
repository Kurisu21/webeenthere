// controllers/UserController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  // Register a new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, email, password } = req.body;
      const existing = await this.userModel.findByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      const userId = await this.userModel.create({ username, email, password });
      res.status(201).json({ message: 'User registered', userId });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Login a user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
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

  // ...other user-related methods
}

module.exports = UserController; 