// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const Auth0Service = require('../services/Auth0Service');
const databaseActivityLogger = require('../services/DatabaseActivityLogger');

const auth0Service = new Auth0Service();

// Check if Auth0 is configured before setting up middleware
const auth0Config = auth0Service.getAuth0Config();
const isAuth0Configured = !!(auth0Config.clientID && auth0Config.issuerBaseURL && auth0Config.clientSecret);

if (isAuth0Configured) {
  // Only configure Auth0 middleware if Auth0 is properly configured
  const { auth } = require('express-openid-connect');
  router.use(auth(auth0Config));
} else {
  console.warn('⚠️  Auth0 is not configured. OAuth routes will be disabled.');
  console.warn('   To enable Auth0, set: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET');
}

// Auth0 login route - redirects to Auth0
router.get('/login', (req, res) => {
  if (!isAuth0Configured) {
    return res.status(503).json({ error: 'Auth0 is not configured. OAuth login is disabled.' });
  }
  // Don't set returnTo - afterCallback and our callback route will handle the redirect
  res.oidc.login({
    authorizationParams: {
      connection: req.query.connection || undefined // 'google-oauth2' or 'github'
    }
  });
});

// Google login route
router.get('/login/google', (req, res) => {
  if (!isAuth0Configured) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  try {
    // Don't set returnTo - afterCallback and our callback route will handle the redirect
    res.oidc.login({
      authorizationParams: {
        connection: 'google-oauth2'
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_not_enabled`);
  }
});

// GitHub login route
router.get('/login/github', (req, res) => {
  if (!isAuth0Configured) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  try {
    // GitHub connection identifier - matches Auth0 standard naming (same pattern as 'google-oauth2')
    // Default to 'github-oauth2' to match Auth0's standard naming convention
    // Can be overridden via AUTH0_GITHUB_CONNECTION environment variable
    // Common names: 'github-oauth2' (standard), 'github', 'github-oauth'
    const githubConnection = process.env.AUTH0_GITHUB_CONNECTION || 'github-oauth2';
    
    console.log('🔐 Attempting GitHub login with connection:', githubConnection);
    console.log('📋 Make sure GitHub is enabled in:');
    console.log('  1. Authentication → Social → GitHub (enabled)');
    console.log('  2. Applications → Your App → Connections → GitHub (enabled) ← MOST IMPORTANT');
    console.log('  3. Verify connection name matches:', githubConnection);
    
    // Don't set returnTo - afterCallback and our callback route will handle the redirect
    res.oidc.login({
      authorizationParams: {
        connection: githubConnection
      }
    });
  } catch (error) {
    const githubConnection = process.env.AUTH0_GITHUB_CONNECTION || 'github-oauth2';
    console.error('❌ GitHub login error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      attemptedConnection: githubConnection,
      stack: error.stack
    });
    console.error('\n⚠️  TROUBLESHOOTING:');
    console.error('  1. Go to Auth0 Dashboard → Applications → Your App → Connections tab');
    console.error('  2. Under "Social", make sure GitHub is toggled ON');
    console.error(`  3. Verify the connection name is "${githubConnection}" (or set AUTH0_GITHUB_CONNECTION in .env)`);
    console.error('  4. Common connection names: github-oauth2 (standard), github, github-oauth');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=github_not_enabled`);
  }
});

// Note: The callback is handled by the afterCallback hook in Auth0Service
// No custom callback route needed - afterCallback processes user and redirects to frontend

// Auth0 logout route
router.get('/logout', async (req, res) => {
  if (!isAuth0Configured) {
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
  try {
    // Clear session token from database if user is logged in
    if (req.oidc && req.oidc.user) {
      const user = await auth0Service.userModel.findByEmail(req.oidc.user.email);
      if (user) {
        try {
          await auth0Service.db.execute(
            'UPDATE users SET session_token = NULL WHERE id = ?',
            [user.id]
          );
          
          // Log logout activity
          const { extractClientIP } = require('../utils/ipExtractor');
          const ipAddress = extractClientIP(req);
          const userAgent = req.headers['user-agent'] || 'unknown';
          
          await databaseActivityLogger.logActivity({
            userId: user.id,
            action: 'oauth_logout',
            entityType: 'user',
            entityId: user.id,
            ipAddress: ipAddress,
            userAgent: userAgent,
            details: { 
              timestamp: new Date().toISOString()
            }
          });
        } catch (error) {
          console.error('Failed to clear session token on logout:', error);
        }
      }
    }
    
    // Logout from Auth0
    res.oidc.logout({
      returnTo: process.env.FRONTEND_URL || 'http://localhost:3000'
    });
  } catch (error) {
    console.error('Auth0 logout error:', error);
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
});

// Get current user (if authenticated via Auth0)
router.get('/user', (req, res) => {
  if (!isAuth0Configured) {
    return res.status(503).json({ error: 'Auth0 is not configured' });
  }
  if (req.oidc && req.oidc.user) {
    res.json({ user: req.oidc.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Test endpoint to check Auth0 configuration
router.get('/test-config', (req, res) => {
  const config = auth0Service.getAuth0Config();
  const callbackURL = `${config.baseURL}${config.routes.callback}`;
  res.json({
    configured: !!(config.clientID && config.issuerBaseURL && config.clientSecret),
    hasClientID: !!config.clientID,
    hasDomain: !!config.issuerBaseURL,
    hasClientSecret: !!config.clientSecret,
    baseURL: config.baseURL,
    callbackURL: callbackURL,
    callbackRoute: config.routes.callback,
    // Don't expose secrets in response
    domain: config.issuerBaseURL ? 'configured' : 'missing',
    message: `Add this exact URL to Auth0 Allowed Callback URLs: ${callbackURL}`
  });
});

module.exports = router;

