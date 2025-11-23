/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

export const ENV_CONFIG = {
  // API Base URLs
  LOCAL_API_URL: 'http://localhost:5000',
  PRODUCTION_API_URL: 'https://webeenthere-1.onrender.com',
  
  // Frontend URLs
  LOCAL_FRONTEND_URL: 'http://localhost:3000',
  PRODUCTION_FRONTEND_URL: 'https://webeenthere.onrender.com',
  
  // CORS Allowed Origins
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'https://webeenthere.onrender.com',
    'https://webeenthere-1.onrender.com'
  ],
  
  // Environment Detection
  isProduction: () => {
    // Always check hostname first (most reliable)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname === 'webeenthere.onrender.com' || hostname.includes('onrender.com');
    }
    
    // For server-side, check environment variable but allow override
    // If NEXT_PUBLIC_API_URL is set, use it to determine environment
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.includes('onrender.com');
    }
    
    // Default: only use NODE_ENV if explicitly set to production AND not localhost
    return process.env.NODE_ENV === 'production' && 
           !process.env.NEXT_PUBLIC_API_URL?.includes('localhost');
  },
  
  isLocal: () => {
    // Always check hostname first (most reliable)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || 
             hostname === '127.0.0.1' || 
             hostname === '0.0.0.0';
    }
    
    // For server-side, check if API URL points to localhost
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.includes('localhost') || 
             process.env.NEXT_PUBLIC_API_URL.includes('127.0.0.1');
    }
    
    // Default: use NODE_ENV but prioritize localhost detection
    return process.env.NODE_ENV !== 'production' || 
           process.env.NEXT_PUBLIC_API_URL?.includes('localhost');
  }
} as const;

export default ENV_CONFIG;
