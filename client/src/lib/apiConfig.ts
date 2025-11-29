/**
 * API Configuration for WEBeenThere
 * Handles both local development and production environments
 */

import { ENV_CONFIG } from './envConfig';

// Determine the API base URL based on environment
const getApiBaseUrl = (): string => {
  // Check for explicit environment variable override (highest priority)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check hostname-based detection (client-side)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production hostname
    if (hostname === 'webeenthere-1.onrender.com' || hostname.includes('onrender.com')) {
      return ENV_CONFIG.PRODUCTION_API_URL;
    }
    
    // Local hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return ENV_CONFIG.LOCAL_API_URL;
    }
  }
  
  // Server-side detection
  if (ENV_CONFIG.isProduction()) {
    return ENV_CONFIG.PRODUCTION_API_URL;
  }
  
  if (ENV_CONFIG.isLocal()) {
    return ENV_CONFIG.LOCAL_API_URL;
  }
  
  // Default to local development (safest fallback)
  return ENV_CONFIG.LOCAL_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper function to normalize image URLs
 * Converts relative paths to full URLs, handles both local uploads and external URLs
 */
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // If already a full URL (http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a data URL (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's a relative path starting with /api/media or /uploads, convert to full URL
  if (imageUrl.startsWith('/api/media') || imageUrl.startsWith('/uploads')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // If it starts with /, assume it's a relative path and prepend API_BASE_URL
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // Otherwise, return as is (might be a relative path without leading slash)
  return imageUrl;
};

/**
 * Helper function to get profile image URL
 * Returns the blob endpoint URL for a user's profile image
 * @param userId - The user ID
 * @param cacheBust - Optional timestamp to force refresh (use after upload)
 */
export const getProfileImageUrl = (userId: string | number | null | undefined, cacheBust?: number): string | null => {
  if (!userId) return null;
  const url = API_ENDPOINTS.PROFILE_IMAGE(userId);
  // Always add cache-busting parameter to prevent browser caching issues
  // Use provided cacheBust or current timestamp
  const timestamp = cacheBust || Date.now();
  return `${url}?t=${timestamp}`;
};

// API endpoints
export const API_ENDPOINTS = {
  // AI endpoints
  GENERATE_TEMPLATE: `${API_BASE_URL}/api/ai/generate-template`,
  GENERATE_SECTION: `${API_BASE_URL}/api/ai/generate-section`,
  IMPROVE_CANVAS: `${API_BASE_URL}/api/ai/improve-canvas`,
  AI_ASSISTANT: `${API_BASE_URL}/api/ai/assistant`,
  AI_ASSISTANT_HISTORY: `${API_BASE_URL}/api/ai/assistant/history`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  
  // Template endpoints
  TEMPLATES: `${API_BASE_URL}/api/templates`,
  
  // Website endpoints
  WEBSITES: `${API_BASE_URL}/api/websites`,
  
  // Admin website endpoints
  ADMIN_WEBSITES: `${API_BASE_URL}/api/admin/websites`,
  
  // Subscription endpoints
  SUBSCRIPTIONS: `${API_BASE_URL}/api/subscriptions`,
  SUBSCRIPTION_USAGE: `${API_BASE_URL}/api/subscriptions/usage`,
  ADMIN_SUBSCRIPTIONS: `${API_BASE_URL}/api/admin/subscriptions`,
  
  // Invoice endpoints
  INVOICES: `${API_BASE_URL}/api/invoices`,
  ADMIN_INVOICES: `${API_BASE_URL}/api/admin/invoices`,
  
  // Media endpoints
  MEDIA_UPLOAD: `${API_BASE_URL}/api/media/upload`,
  MEDIA_IMAGES: `${API_BASE_URL}/api/media/images`,
  
  // Profile image upload
  PROFILE_IMAGE_UPLOAD: `${API_BASE_URL}/api/users/profile/upload-image`,
  // Profile image get (blob endpoint)
  PROFILE_IMAGE: (userId: string | number) => `${API_BASE_URL}/api/users/profile/image/${userId}`,
  // Request email change
  REQUEST_EMAIL_CHANGE: `${API_BASE_URL}/api/users/profile/request-email-change`,
} as const;

// Helper function to get authentication token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try to get token from localStorage
  let token = localStorage.getItem('token');
  if (token) {
    // Clean token - handle case where it might be stored as stringified array
    try {
      const parsed = JSON.parse(token);
      if (Array.isArray(parsed)) {
        // If it's an array, join it (JWT tokens are sometimes split)
        token = parsed.join('.');
      } else if (typeof parsed === 'string') {
        token = parsed;
      }
    } catch {
      // Not JSON, use as-is
    }
    // Ensure it's a valid string and not empty
    if (token && typeof token === 'string' && token.trim().length > 0) {
      return token.trim();
    }
  }
  
  // Try to get token from sessionStorage
  let sessionToken = sessionStorage.getItem('token');
  if (sessionToken) {
    // Clean token - handle case where it might be stored as stringified array
    try {
      const parsed = JSON.parse(sessionToken);
      if (Array.isArray(parsed)) {
        // If it's an array, join it (JWT tokens are sometimes split)
        sessionToken = parsed.join('.');
      } else if (typeof parsed === 'string') {
        sessionToken = parsed;
      }
    } catch {
      // Not JSON, use as-is
    }
    // Ensure it's a valid string and not empty
    if (sessionToken && typeof sessionToken === 'string' && sessionToken.trim().length > 0) {
      return sessionToken.trim();
    }
  }
  
  return null;
};

// Helper function to make API calls with consistent error handling
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  // Build headers object - merge custom headers with defaults, ensuring Authorization is always included if token exists
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  // Always include Authorization header if token exists (don't let custom headers override it)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Debug: log when no token is found
    if (endpoint.includes('/admin/')) {
      console.warn('[API] Admin endpoint called without token:', endpoint);
    }
  }
  
  // Spread options first, then override with our headers to ensure Authorization is never lost
  const defaultOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    // Debug logging for admin endpoints
    if (endpoint.includes('/admin/analytics/reports')) {
      console.log('[API] Making request to:', fullUrl);
      console.log('[API] Has token:', !!token);
      console.log('[API] Token length:', token?.length || 0);
      console.log('[API] Token preview:', token ? `${token.substring(0, 20)}...` : 'none');
      console.log('[API] Request headers:', headers);
      console.log('[API] Authorization header:', headers['Authorization'] ? 'Present' : 'Missing');
    }
    
    const response = await fetch(fullUrl, defaultOptions);
    
    if (!response.ok) {
      // Handle 401 specifically - but be more careful about when to log out
      if (response.status === 401) {
        // Try to read the actual error message from the server
        let errorMessage = 'Authentication required';
        let shouldLogout = false;
        
        try {
          const responseData = await response.clone().json();
          errorMessage = responseData.error || responseData.message || errorMessage;
          
          // Debug logging for admin endpoints
          if (endpoint.includes('/admin/')) {
            console.error('[API] 401 Error from server:', responseData);
            console.error('[API] Error message:', errorMessage);
            console.error('[API] Had token:', !!token);
          }
          
          // Only log out if the server explicitly says the token is invalid/expired
          // Don't log out for "No token provided" if we have a token (might be a different issue)
          if (responseData.error && (
            responseData.error.includes('Invalid token') || 
            responseData.error.includes('token expired') ||
            responseData.error.includes('Token expired') ||
            responseData.error.includes('jwt expired')
          )) {
            shouldLogout = true;
          }
        } catch (e) {
          // If JSON parsing fails, try text
          try {
            const responseText = await response.clone().text();
            if (endpoint.includes('/admin/')) {
              console.error('[API] 401 Response text:', responseText);
            }
            if (responseText.includes('Invalid token') || responseText.includes('token expired') || responseText.includes('jwt expired')) {
              shouldLogout = true;
            }
          } catch (textError) {
            // Can't read response, don't log out
            if (endpoint.includes('/admin/')) {
              console.error('[API] Could not read 401 response');
            }
          }
        }
        
        // Only log out if we're sure the token is invalid
        // For admin endpoints, be extra careful - don't log out unless token is explicitly invalid
        if (shouldLogout && token && !endpoint.includes('/admin/')) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            window.location.href = '/login';
          }
        } else if (shouldLogout && token && endpoint.includes('/admin/')) {
          // For admin endpoints, only log out if token is definitely invalid
          console.error('[API] Admin token appears invalid, but not logging out automatically. Please check your session.');
        }
        
        // Throw error with the actual message from server
        throw new Error(errorMessage);
      }
      
      // Handle 403 specifically (Access denied)
      if (response.status === 403) {
        if (typeof window !== 'undefined') {
          window.location.href = '/user/main';
        }
        throw new Error('Access denied');
      }
      
      // For other errors, create error with response for parsing later
      const error: any = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }
    
    return response;
  } catch (error: any) {
    // Handle network errors (server not running, CORS, etc.)
    if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      const networkError: any = new Error('Network error: Unable to connect to server. Please ensure the backend server is running.');
      networkError.isNetworkError = true;
      networkError.originalError = error;
      throw networkError;
    }
    
    // Re-throw other errors
    throw error;
  }
};

// Helper function for POST requests
export const apiPost = async (
  endpoint: string,
  data: any,
  options?: { signal?: AbortSignal; headers?: Record<string, string>; isFormData?: boolean }
): Promise<any> => {
  try {
    const isFormData = data instanceof FormData || options?.isFormData;
    
    // Get token first to ensure it's included
    const token = getAuthToken();
    const headers: Record<string, string> = { ...options?.headers };
    
    // Always include Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Log for debugging AI assistant requests
    if (endpoint.includes('/ai/assistant')) {
      console.log('[API] AI Assistant request:', {
        endpoint,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        websiteId: data?.website_id || 'none'
      });
    }
    
    const response = await apiCall(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      headers,
      signal: options?.signal,
    });
    
    return response.json();
  } catch (error: any) {
    // If error has a response, parse the error message
    if (error.response) {
      try {
        const errorData = await error.response.json();
        
        // Handle express-validator errors array
        let errorMessage = error.message;
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].msg || errorData.errors[0].message || error.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Return a rejected promise instead of throwing an Error to avoid Next.js overlay
        return Promise.reject({
          message: errorMessage,
          status: error.status,
          data: errorData
        });
      } catch (e: any) {
        // If e is the error we just threw, rethrow it
        if (e.status && e.data) {
          throw e;
        }
        // If JSON parsing failed, throw original error
        throw error;
      }
    }
    throw error;
  }
};

// Helper function for GET requests
export const apiGet = async (endpoint: string): Promise<any> => {
  try {
    const response = await apiCall(endpoint, {
      method: 'GET',
    });
    
    return response.json();
  } catch (error: any) {
    // Handle network errors gracefully
    if (error.isNetworkError) {
      // Return a rejected promise with network error info
      return Promise.reject({
        message: error.message,
        isNetworkError: true,
        originalError: error.originalError
      });
    }
    
    // If error has a response, parse the error message
    if (error.response) {
      try {
        const errorData = await error.response.json();
        
        // Handle express-validator errors array
        let errorMessage = error.message;
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].msg || errorData.errors[0].message || error.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Return a rejected promise instead of throwing an Error to avoid Next.js overlay
        return Promise.reject({
          message: errorMessage,
          status: error.status,
          data: errorData
        });
      } catch (e: any) {
        // If e is the error we just threw, rethrow it
        if (e.status && e.data) {
          throw e;
        }
        // If JSON parsing failed, throw original error
        throw error;
      }
    }
    throw error;
  }
};

// Helper function for PUT requests
export const apiPut = async (
  endpoint: string,
  data: any
): Promise<any> => {
  try {
    const response = await apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return response.json();
  } catch (error: any) {
    // If error has a response, parse the error message
    if (error.response) {
      try {
        const errorData = await error.response.json();
        
        // Handle express-validator errors array
        let errorMessage = error.message;
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].msg || errorData.errors[0].message || error.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Return a rejected promise instead of throwing an Error to avoid Next.js overlay
        return Promise.reject({
          message: errorMessage,
          status: error.status,
          data: errorData
        });
      } catch (e: any) {
        // If e is the error we just threw, rethrow it
        if (e.status && e.data) {
          throw e;
        }
        // If JSON parsing failed, throw original error
        throw error;
      }
    }
    throw error;
  }
};

// Helper function for DELETE requests
export const apiDelete = async (endpoint: string): Promise<any> => {
  try {
    const response = await apiCall(endpoint, {
      method: 'DELETE',
    });
    
    return response.json();
  } catch (error: any) {
    // If error has a response, parse the error message
    if (error.response) {
      try {
        const errorData = await error.response.json();
        
        // Handle express-validator errors array
        let errorMessage = error.message;
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].msg || errorData.errors[0].message || error.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Return a rejected promise instead of throwing an Error to avoid Next.js overlay
        return Promise.reject({
          message: errorMessage,
          status: error.status,
          data: errorData
        });
      } catch (e: any) {
        // If e is the error we just threw, rethrow it
        if (e.status && e.data) {
          throw e;
        }
        // If JSON parsing failed, throw original error
        throw error;
      }
    }
    throw error;
  }
};

// Debug function to log current API configuration
export const logApiConfig = () => {
  console.log('=== API Configuration ===');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Environment:', ENV_CONFIG.isProduction() ? 'production' : 'development');
  console.log('Is Local:', ENV_CONFIG.isLocal());
  console.log('Is Production:', ENV_CONFIG.isProduction());
  
  if (typeof window !== 'undefined') {
    console.log('Current hostname:', window.location.hostname);
    console.log('Current origin:', window.location.origin);
  }
  console.log('========================');
};
