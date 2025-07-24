// app.js
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Import user routes (OOP)
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// TODO: Import and use routes (OOP controllers)
// Example: app.use('/api/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Webeenthere backend is running!');
});

module.exports = app; 