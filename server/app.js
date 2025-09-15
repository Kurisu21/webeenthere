// app.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));

// Import routes
const userRoutes = require('./routes/userRoutes');
const templateRoutes = require('./routes/templateRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Database connection
const database = require('./database');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/ai', aiRoutes(database));

// Health check route
app.get('/', (req, res) => {
  res.send('Webeenthere backend is running!');
});

module.exports = app; 