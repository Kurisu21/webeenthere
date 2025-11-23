// app.js
const express = require('express');
const cors = require('cors');
const app = express();

// Trust proxy - important for getting real client IP addresses behind proxies/load balancers
app.set('trust proxy', true);

// Middleware
// Increase body size limits to support saving HTML/CSS with embedded images (base64)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// CORS configuration for both local development and production
const allowedOrigins = [
  'http://localhost:3000',              // Local development frontend
  'https://webeenthere.onrender.com',    // Production frontend
  'https://webeenthere-1.onrender.com' // Production backend (for testing)
];

// Helper function to check if origin is allowed
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow requests with no origin
  
  // Allow Auth0 domains
  if (origin.includes('auth0.com') || origin.includes('auth0usercontent.com')) {
    return true;
  }
  
  // Check exact match
  if (allowedOrigins.indexOf(origin) !== -1) {
    return true;
  }
  
  // Allow any Render.com subdomain
  if (origin.includes('.onrender.com')) {
    console.log('✅ CORS allowed Render origin:', origin);
    return true;
  }
  
  // Allow localhost for development
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return true;
  }
  
  return false;
};

// CORS middleware with explicit preflight handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    if (isOriginAllowed(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400'); // 24 hours
      return res.status(204).send();
    } else {
      console.log('❌ CORS blocked OPTIONS request from:', origin);
      return res.status(403).json({ error: 'CORS policy violation' });
    }
  }
  
  // Handle regular requests
  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

// Also use cors middleware as backup
app.use(cors({
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Graceful handling for payload too large and CORS errors
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload too large. Try using smaller images or compressing assets.'
    });
  }
  
  // Handle CORS errors
  if (err && err.message && err.message.includes('CORS')) {
    console.error('CORS Error:', err.message);
    console.error('Request Origin:', req.headers.origin);
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      message: 'Access denied by CORS policy',
      origin: req.headers.origin
    });
  }
  
  return next(err);
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const templateRoutes = require('./routes/templateRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const adminWebsiteRoutes = require('./routes/adminWebsiteRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const backupRoutes = require('./routes/backupRoutes');
const helpCenterRoutes = require('./routes/helpCenterRoutes');
const forumRoutes = require('./routes/forumRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const supportRoutes = require('./routes/supportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userActivityRoutes = require('./routes/userActivityRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const adminSubscriptionRoutes = require('./routes/adminSubscriptionRoutes');
const userAnalyticsRoutes = require('./routes/userAnalyticsRoutes');
const testAnalyticsRoutes = require('./routes/testAnalyticsRoutes');
const analyticsTrackingRoutes = require('./routes/analyticsTrackingRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

// Database connection
const { getDatabaseConnection } = require('./database/database');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes(getDatabaseConnection()));
app.use('/api/websites', websiteRoutes(getDatabaseConnection()));
app.use('/api/admin/websites', adminWebsiteRoutes(getDatabaseConnection()));
app.use('/api/ai', aiRoutes(getDatabaseConnection()));
app.use('/api/admin', adminRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/activity', activityRoutes);
app.use('/api/admin/backup', backupRoutes);
app.use('/api/help', helpCenterRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/performance', performanceRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/user/activity', userActivityRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionRoutes);
app.use('/api/user/analytics', userAnalyticsRoutes);
app.use('/api/user/analytics/test', testAnalyticsRoutes);
app.use('/api/analytics', analyticsTrackingRoutes);
app.use('/api/media', mediaRoutes(getDatabaseConnection()));

// Health check route
app.get('/', (req, res) => {
  res.send('Webeenthere backend is running!');
});

module.exports = app; 