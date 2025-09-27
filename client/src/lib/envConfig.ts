/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

export const ENV_CONFIG = {
  // API Base URLs
  LOCAL_API_URL: 'http://localhost:5000',
  PRODUCTION_API_URL: 'https://webeenthere.onrender.com',
  
  // Frontend URLs
  LOCAL_FRONTEND_URL: 'http://localhost:3000',
  PRODUCTION_FRONTEND_URL: 'https://webeenthere-1.onrender.com',
  
  // CORS Allowed Origins
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'https://webeenthere-1.onrender.com',
    'https://webeenthere.onrender.com'
  ],
  
  // Environment Detection
  isProduction: () => {
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'webeenthere-1.onrender.com';
    }
    return process.env.NODE_ENV === 'production';
  },
  
  isLocal: () => {
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }
    return process.env.NODE_ENV === 'development';
  }
} as const;

export default ENV_CONFIG;
