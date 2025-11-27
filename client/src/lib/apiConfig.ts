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
  const token = localStorage.getItem('token');
  if (token) return token;
  
  // Try to get token from sessionStorage
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) return sessionToken;
  
  return null;
};

// Helper function to make API calls with consistent error handling
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  // Build headers object - ensure Authorization is included if token exists
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Always include Authorization header if token exists (don't let custom headers override it)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const defaultOptions: RequestInit = {
    headers,
    ...options,
  };

  try {
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(fullUrl, defaultOptions);
    
    if (!response.ok) {
      // Handle 401 specifically - but be more careful about when to log out
      if (response.status === 401) {
        // Only log out if:
        // 1. We have a token (meaning we tried to authenticate)
        // 2. The endpoint is not a new/optional feature endpoint
        const isOptionalEndpoint = endpoint.includes('/media/') || endpoint.includes('/ai/assistant');
        
        if (token && !isOptionalEndpoint) {
          // Try to read response to see if it's a real auth error
          try {
            const responseText = await response.clone().text();
            // Only log out on clear auth errors, not on missing endpoints
            if (responseText.includes('Authentication') || responseText.includes('token') || responseText.includes('unauthorized') || responseText.includes('Not authenticated')) {
              // Clear stored tokens and redirect to login
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                window.location.href = '/login';
              }
              throw new Error('Authentication required');
            }
          } catch (e) {
            // If we can't read response, don't log out - just throw error
          }
        }
        
        // For optional endpoints or when no token, just throw error without logging out
        throw new Error('Authentication required');
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
