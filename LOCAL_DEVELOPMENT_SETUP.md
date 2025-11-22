# Local Development Setup Guide

This guide helps you run the app locally on `localhost:3000` while also supporting Render deployment.

## Quick Fix for Local Development

If your app isn't running on localhost:3000 after deploying to Render, follow these steps:

### 1. Check Environment Variables

The app now automatically detects the environment based on hostname. However, you can override it:

**Create `.env.local` in the `client` directory:**
```bash
cd client
touch .env.local
```

**Add this to `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Verify Configuration

Open browser console and check the API configuration:
```javascript
// The app will log API configuration on startup
// Look for: "=== API Configuration ==="
```

## How Environment Detection Works

The app now uses **hostname-based detection** (most reliable):

### Local Development
- **Hostname**: `localhost` or `127.0.0.1`
- **API URL**: `http://localhost:5000`
- **Automatic**: No configuration needed!

### Render Production
- **Hostname**: `webeenthere-1.onrender.com` or any `*.onrender.com`
- **API URL**: `https://webeenthere.onrender.com`
- **Automatic**: No configuration needed!

### Manual Override
- Set `NEXT_PUBLIC_API_URL` environment variable to override automatic detection

## Troubleshooting

### Issue: App still using production API on localhost

**Solution 1**: Clear Next.js cache
```bash
cd client
rm -rf .next
npm run dev
```

**Solution 2**: Check for environment variables
```bash
# Check if NODE_ENV is set incorrectly
echo $NODE_ENV

# If it's set to 'production', unset it for local dev:
unset NODE_ENV
npm run dev
```

**Solution 3**: Explicitly set API URL
```bash
# In client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Issue: CORS errors

Make sure your backend server is running:
```bash
cd server
npm start
```

The backend should be accessible at `http://localhost:5000`

### Issue: API calls failing

1. **Check backend is running**: `http://localhost:5000/api/health` (if you have a health endpoint)
2. **Check browser console** for API configuration logs
3. **Verify API URL** matches your backend port (default: 5000)

## Development Workflow

### Starting Local Development

1. **Terminal 1 - Backend**:
   ```bash
   cd server
   npm start
   # Should start on http://localhost:5000
   ```

2. **Terminal 2 - Frontend**:
   ```bash
   cd client
   npm run dev
   # Should start on http://localhost:3000
   ```

3. **Open browser**: `http://localhost:3000`

### Verifying Configuration

The app logs API configuration to the console. Look for:
```
=== API Configuration ===
API Base URL: http://localhost:5000
Environment: development
Is Local: true
Is Production: false
Current hostname: localhost
Current origin: http://localhost:3000
========================
```

## Environment Variables Reference

| Variable | Purpose | Local | Production |
|----------|---------|-------|------------|
| `NEXT_PUBLIC_API_URL` | Override API base URL | `http://localhost:5000` | `https://webeenthere.onrender.com` |
| `NODE_ENV` | Node environment | `development` | `production` |

**Note**: `NEXT_PUBLIC_*` variables are exposed to the browser. Use them for client-side configuration.

## Files Modified

The following files were updated to support both local and Render deployment:

1. `client/src/lib/envConfig.ts` - Improved environment detection
2. `client/src/lib/apiConfig.ts` - Hostname-based API URL detection
3. `client/.env.local.example` - Example environment file (new)

## Testing Both Environments

### Test Local Development
```bash
# Make sure NODE_ENV is not set or is 'development'
cd client
npm run dev
# Open http://localhost:3000
# Check console for: API Base URL: http://localhost:5000
```

### Test Production Build Locally
```bash
cd client
NODE_ENV=production npm run build
NODE_ENV=production npm start
# Still uses localhost API because hostname is localhost
```

### Test Render Deployment
- Deploy to Render
- App automatically uses production API when hostname is `*.onrender.com`

## Summary

✅ **Local development**: Works automatically on `localhost:3000`  
✅ **Render deployment**: Works automatically on `*.onrender.com`  
✅ **Manual override**: Use `NEXT_PUBLIC_API_URL` if needed  
✅ **No breaking changes**: Existing deployments continue to work  

The app now prioritizes **hostname detection** over `NODE_ENV`, ensuring localhost always uses the local API URL.


