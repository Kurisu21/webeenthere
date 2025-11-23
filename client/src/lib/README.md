# API Configuration Guide

This guide explains how the API configuration works for both local development and production deployment on Render.

## Configuration Files

- `lib/apiConfig.ts` - Main API configuration with environment detection
- `lib/envConfig.ts` - Environment-specific settings and utilities
- `lib/testApiConfig.ts` - Test script to verify configuration

## How It Works

### Environment Detection

The system automatically detects the environment based on the hostname:

- **Local Development**: `localhost` or `127.0.0.1` → `http://localhost:5000`
- **Production**: `webeenthere.onrender.com` → `https://webeenthere-1.onrender.com`

### CORS Configuration

The backend is configured to allow requests from:

- `http://localhost:3000` (local frontend)
- `https://webeenthere.onrender.com` (production frontend)
- `https://webeenthere-1.onrender.com` (production backend)

### Usage

```typescript
import { API_ENDPOINTS, apiPost, logApiConfig } from '@/lib/apiConfig';

// Log current configuration (useful for debugging)
logApiConfig();

// Make API calls
const data = await apiPost(API_ENDPOINTS.GENERATE_TEMPLATE, {
  description: 'My website',
  websiteType: 'portfolio',
  style: 'modern',
  colorScheme: 'blue'
});
```

## Testing

### Local Testing

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

3. Open browser console to see API configuration logs

### Production Testing

1. Deploy both frontend and backend to Render
2. Check browser console for API configuration logs
3. Verify API calls are going to the production backend

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the frontend URL is in the allowed origins list
2. **API Not Found**: Check that the backend is running and accessible
3. **Environment Detection**: Use `logApiConfig()` to debug environment detection

### Debug Commands

```typescript
// In browser console
import { logApiConfig } from '@/lib/apiConfig';
logApiConfig();
```

## Deployment Checklist

- [ ] Backend deployed to `https://webeenthere-1.onrender.com`
- [ ] Frontend deployed to `https://webeenthere.onrender.com`
- [ ] CORS configured for production domains
- [ ] API endpoints tested in production
- [ ] Environment detection working correctly
