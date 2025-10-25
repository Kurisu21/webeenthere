/**
 * API Configuration for WEBeenThere
 * Handles both local development and production environments
 */

import { ENV_CONFIG } from './envConfig';

// Determine the API base URL based on environment
const getApiBaseUrl = (): string => {
  if (ENV_CONFIG.isProduction()) {
    return ENV_CONFIG.PRODUCTION_API_URL;
  }
  
  if (ENV_CONFIG.isLocal()) {
    return ENV_CONFIG.LOCAL_API_URL;
  }
  
  // Default to local development
  return ENV_CONFIG.LOCAL_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // AI endpoints
  GENERATE_TEMPLATE: `${API_BASE_URL}/api/ai/generate-template`,
  GENERATE_SECTION: `${API_BASE_URL}/api/ai/generate-section`,
  
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
  ADMIN_SUBSCRIPTIONS: `${API_BASE_URL}/api/admin/subscriptions`,
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
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(fullUrl, defaultOptions);
    
    if (!response.ok) {
      // Handle 401 specifically
      if (response.status === 401) {
        // Clear stored tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          window.location.href = '/login';
        }
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
  } catch (error) {
    // Don't log to console.error to avoid Next.js error overlay
    // The error will be caught and displayed in the UI
    throw error;
  }
};

// Helper function for POST requests
export const apiPost = async (
  endpoint: string,
  data: any
): Promise<any> => {
  try {
    const response = await apiCall(endpoint, {
      method: 'POST',
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

// Helper function for GET requests
export const apiGet = async (endpoint: string): Promise<any> => {
  try {
    const response = await apiCall(endpoint, {
      method: 'GET',
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
