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
} as const;

// Helper function to make API calls with consistent error handling
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Helper function for POST requests
export const apiPost = async (
  endpoint: string,
  data: any
): Promise<any> => {
  const response = await apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Helper function for GET requests
export const apiGet = async (endpoint: string): Promise<any> => {
  const response = await apiCall(endpoint, {
    method: 'GET',
  });
  
  return response.json();
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
