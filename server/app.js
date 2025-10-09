// app.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());

// CORS configuration for both local development and production
const allowedOrigins = [
  'http://localhost:3000',           // Local development frontend
  'https://webeenthere-1.onrender.com', // Production frontend
  'https://webeenthere.onrender.com'     // Production backend (for testing)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import routes
const userRoutes = require('./routes/userRoutes');
const templateRoutes = require('./routes/templateRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Database connection
const { getDatabaseConnection } = require('./database/database');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes(getDatabaseConnection()));
app.use('/api/websites', websiteRoutes(getDatabaseConnection()));
app.use('/api/ai', aiRoutes(getDatabaseConnection()));

// Health check route
app.get('/', (req, res) => {
  res.send('Webeenthere backend is running!');
});

module.exports = app; 