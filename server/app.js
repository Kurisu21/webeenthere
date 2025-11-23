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
  'https://webeenthere-server.onrender.com' // Production backend (for testing)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or server-side redirects)
    // This is important for Auth0 OAuth callbacks which may not have an origin header
    if (!origin) return callback(null, true);
    
    // Allow Auth0 domains for OAuth callbacks
    if (origin.includes('auth0.com') || origin.includes('auth0usercontent.com')) {
      return callback(null, true);
    }
    
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

// Graceful handling for payload too large
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload too large. Try using smaller images or compressing assets.'
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