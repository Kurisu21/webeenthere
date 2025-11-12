// services/Auth0Service.js
const { getDatabaseConnection } = require('../database/database');
const User = require('../models/User');
const SubscriptionService = require('./SubscriptionService');
const jwt = require('jsonwebtoken');
const databaseActivityLogger = require('./DatabaseActivityLogger');

class Auth0Service {
  constructor() {
    this.db = getDatabaseConnection();
    this.userModel = new User(this.db);
    this.subscriptionService = new SubscriptionService(this.db);
  }

  /**
   * Find or create user from Auth0 profile
   * @param {Object} profile - Auth0 user profile
   * @returns {Object} User object with token
   */
  async findOrCreateUser(profile) {
    try {
      // Auth0 profile structure:
      // - sub: unique identifier (e.g., "google-oauth2|123456789")
      // - email: user email
      // - name: display name
      // - picture: profile picture URL
      // - email_verified: boolean
      
      const { sub, email, name, picture, email_verified } = profile;
      
      if (!email) {
        throw new Error('Email is required from OAuth provider');
      }

      // Try to find user by email first
      let user = await this.userModel.findByEmail(email);
      
      if (!user) {
        // Create new user from OAuth profile
        // Generate username from email or name
        const baseUsername = name 
          ? name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20)
          : email.split('@')[0].substring(0, 20);
        
        // Ensure username is unique
        let username = baseUsername;
        let counter = 1;
        while (await this.userModel.findByUsername(username)) {
          username = `${baseUsername}_${counter}`;
          counter++;
        }

        // Create user without password (OAuth users don't need passwords)
        // We'll use a random hash as placeholder since password_hash is NOT NULL
        const bcrypt = require('bcryptjs');
        const placeholderPassword = await bcrypt.hash(`oauth_${sub}_${Date.now()}`, 10);
        
        const userId = await this.userModel.create({
          username,
          email,
          password: placeholderPassword // Placeholder, user will use OAuth to login
        });

        // Update profile image if available
        if (picture) {
          await this.userModel.updateProfile(userId, { profile_image: picture });
        }

        // Mark as verified if email is verified by OAuth provider
        if (email_verified) {
          await this.userModel.verifyUser(userId);
        }

        // Automatically assign free plan to new OAuth user
        try {
          const freePlanId = 1; // Free plan is always plan_id 1
          await this.subscriptionService.createSubscription(userId, freePlanId, 'OAUTH_REGISTRATION_FREE_PLAN');
          console.log(`✅ Assigned free plan to new OAuth user ${userId}`);
        } catch (subscriptionError) {
          console.error('Failed to assign free plan to new OAuth user:', subscriptionError);
        }

        // Get the created user
        user = await this.userModel.findById(userId);
      } else {
        // Update profile image if available and different
        if (picture && user.profile_image !== picture) {
          await this.userModel.updateProfile(user.id, { profile_image: picture });
        }
      }

      // Generate JWT token for the user
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );

      // Store session token in database
      try {
        await this.db.execute(
          'UPDATE users SET session_token = ? WHERE id = ?',
          [token, user.id]
        );
      } catch (tokenError) {
        console.error('Failed to store session token:', tokenError);
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          profile_image: user.profile_image
        },
        token
      };
    } catch (error) {
      console.error('Auth0Service findOrCreateUser error:', error);
      throw error;
    }
  }

  /**
   * Get Auth0 configuration
   * @returns {Object} Auth0 config object
   */
  getAuth0Config() {
    // baseURL must include the full path where the auth routes are mounted
    const serverURL = process.env.AUTH0_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const baseURL = `${serverURL}/api/auth`; // Routes are mounted at /api/auth
    const domain = process.env.AUTH0_DOMAIN;
    const clientID = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    
    // Validate required Auth0 environment variables
    if (!domain || !clientID || !clientSecret) {
      console.warn('⚠️  Auth0 configuration incomplete. Required: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET');
      console.warn('Current values:', { 
        domain: domain ? '✓' : '✗', 
        clientID: clientID ? '✓' : '✗', 
        clientSecret: clientSecret ? '✓' : '✗' 
      });
    }
    
    // Store reference to this for use in afterCallback
    const auth0Service = this;
    
    const config = {
      authRequired: false,
      auth0Logout: true,
      baseURL: baseURL,
      clientID: clientID,
      issuerBaseURL: domain ? `https://${domain}` : undefined,
      secret: clientSecret || process.env.JWT_SECRET || 'secret',
      clientSecret: clientSecret,
      authorizationParams: {
        response_type: 'code',
        scope: 'openid profile email'
      },
      routes: {
        login: '/login',
        logout: '/logout',
        callback: '/callback',
        postLogoutRedirect: '/'
      },
      // Disable automatic silent login attempts to prevent header errors
      attemptSilentLogin: false,
      // Hook to intercept after callback is processed by middleware
      // Process user and redirect to frontend with token
      afterCallback: async (req, res, session) => {
        // Check if response has already been sent
        if (res.headersSent) {
          return session;
        }
        
        // Check for Auth0 errors in query params
        if (req.query?.error) {
          console.error('❌ Auth0 callback error:', req.query.error);
          console.error('Error description:', req.query.error_description);
          
          let errorType = 'oauth_failed';
          let errorMessage = req.query.error_description || req.query.error;
          
          if (req.query.error === 'invalid_request') {
            if (errorMessage?.includes('connection is not enabled')) {
              errorType = 'connection_not_enabled';
              errorMessage = 'GitHub connection is not enabled for this application. Please enable it in Auth0 Dashboard → Applications → Your App → Connections → GitHub';
            } else if (errorMessage?.includes('access_denied')) {
              errorType = 'access_denied';
              errorMessage = 'Access was denied. Please try again.';
            }
          } else if (req.query.error === 'access_denied') {
            errorType = 'access_denied';
            errorMessage = 'You denied access to your account.';
          }
          
          if (!res.headersSent) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=${errorType}&details=${encodeURIComponent(errorMessage)}`);
          }
          return null;
        }
        
        try {
          // Get user profile from session
          const profile = session?.user || req.oidc?.user;
          
          if (profile) {
            // Find or create user from Auth0 profile
            const { user, token } = await auth0Service.findOrCreateUser(profile);
            
            // Log successful OAuth login
            const ipAddress = req.ip || 
              req.connection.remoteAddress || 
              req.socket.remoteAddress ||
              (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
              req.headers['x-forwarded-for']?.split(',')[0] ||
              'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            
            await databaseActivityLogger.logActivity({
              userId: user.id,
              action: 'oauth_login',
              entityType: 'user',
              entityId: user.id,
              ipAddress: ipAddress,
              userAgent: userAgent,
              details: { 
                email: user.email,
                username: user.username,
                provider: profile.sub?.split('|')[0] || 'unknown',
                timestamp: new Date().toISOString()
              }
            });
            
            // Redirect to frontend with token
            const redirectURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user))}`;
            res.redirect(redirectURL);
            // Return null to prevent middleware from doing additional redirects
            return null;
          } else {
            // No profile available
            console.error('OAuth authentication failed - no user profile available');
            if (!res.headersSent) {
              res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed&reason=no_user_profile`);
            }
            return null;
          }
        } catch (error) {
          console.error('afterCallback error:', error);
          if (!res.headersSent) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_error&details=${encodeURIComponent(error.message)}`);
          }
          return null;
        }
      }
    };
    
    // Only add audience if it's set (optional)
    if (process.env.AUTH0_AUDIENCE) {
      config.authorizationParams.audience = process.env.AUTH0_AUDIENCE;
    }
    
    return config;
  }
}

module.exports = Auth0Service;

