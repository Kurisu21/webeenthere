/**
 * Test script to verify API configuration
 * Run this to test both local and production API endpoints
 */

import { API_BASE_URL, API_ENDPOINTS, logApiConfig } from './apiConfig';

console.log('=== API Configuration Test ===');
logApiConfig();

console.log('\n=== Testing API Endpoints ===');
console.log('Generate Template Endpoint:', API_ENDPOINTS.GENERATE_TEMPLATE);
console.log('Generate Section Endpoint:', API_ENDPOINTS.GENERATE_SECTION);

console.log('\n=== Testing CORS Configuration ===');
console.log('Expected Origins:');
console.log('- http://localhost:3000 (local development)');
console.log('- https://webeenthere.onrender.com (production frontend)');
console.log('- https://webeenthere-1.onrender.com (production backend)');

console.log('\n=== Environment Detection ===');
if (typeof window !== 'undefined') {
  console.log('Running in browser');
  console.log('Current hostname:', window.location.hostname);
  console.log('Current origin:', window.location.origin);
} else {
  console.log('Running in Node.js environment');
}

console.log('\n=== Test Complete ===');
