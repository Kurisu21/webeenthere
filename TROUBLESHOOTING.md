# Troubleshooting Guide - "Failed to fetch stats" Error

## Problem
You're seeing the error: `Error: Failed to fetch stats: {}` on the home page.

## Root Cause
This error occurs when the frontend (Next.js) cannot connect to the backend (Express) server. The most common reasons are:

1. **Backend server is not running**
2. **XAMPP MySQL is not running**
3. **Database connection issues**

## Solution Steps

### Step 1: Start XAMPP MySQL
1. Open **XAMPP Control Panel**
2. Make sure **MySQL** service is **running** (should show "Running" status)
3. If not running, click the **Start** button next to MySQL
4. Wait until MySQL shows as "Running"

### Step 2: Verify Database Connection
Your `.env` file in the `server` directory should have:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=webeenthere
DB_PORT=3306
```

These are the default XAMPP settings and should work if MySQL is running.

### Step 3: Start the Backend Server
1. Open a terminal/command prompt
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   
   Or if you don't have nodemon:
   ```bash
   npm start
   ```

4. You should see output like:
   ```
   🔌 Testing database connection...
   ✅ MySQL server connected successfully
   🔧 Auto-checking database initialization...
   ✅ Database already initialized
   🚀 Server running on http://localhost:5000
   ```

### Step 4: Verify Backend is Running
1. Open your browser
2. Go to: `http://localhost:5000`
3. You should see: `Webeenthere backend is running!`

### Step 5: Test the Stats Endpoint
1. In your browser, go to: `http://localhost:5000/api/websites/public/stats`
2. You should see JSON data with stats like:
   ```json
   {
     "success": true,
     "data": {
       "totalWebsites": 0,
       "publishedWebsites": 0,
       "totalUsers": 0,
       "totalTemplates": 0
     }
   }
   ```

### Step 6: Start the Frontend (if not already running)
1. Open a **new** terminal/command prompt
2. Navigate to the client directory:
   ```bash
   cd client
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. The frontend should now be able to connect to the backend

## Common Issues

### Issue: "MySQL connection failed"
**Solution:**
- Make sure XAMPP MySQL is running
- Check if port 3306 is available (not used by another service)
- Verify your `.env` file has correct credentials

### Issue: "Cannot start server without database connection"
**Solution:**
- Start XAMPP MySQL first
- Wait a few seconds for MySQL to fully start
- Then start the backend server

### Issue: "CORS blocked origin"
**Solution:**
- Make sure your frontend is running on `http://localhost:3000`
- Check `server/app.js` has CORS configured correctly (it should already be set up)

### Issue: Backend starts but frontend still can't connect
**Solution:**
- Check if backend is actually running on port 5000
- Verify `client/src/lib/envConfig.ts` has `LOCAL_API_URL: 'http://localhost:5000'`
- Check browser console for more detailed error messages

## Quick Checklist

Before running the application, make sure:

- [ ] XAMPP Control Panel is open
- [ ] MySQL service is **Running** (green/active)
- [ ] Backend server is running (`npm run dev` in `server` directory)
- [ ] Backend shows "Server running on http://localhost:5000"
- [ ] Frontend is running (`npm run dev` in `client` directory)
- [ ] Frontend shows "Ready on http://localhost:3000"

## Error: "Website not found"

If you're seeing `{"success":false,"message":"Website not found"}`, this means:

### Possible Causes:

1. **Website doesn't exist** - The slug/URL you're trying to access doesn't match any website in the database
2. **Website is not published** - The website exists but hasn't been published yet (only published websites can be viewed publicly)

### Solutions:

#### If the website doesn't exist:
1. **Create a new website:**
   - Login to your account
   - Go to `/user/create` or click "Create Website"
   - Select a template or start from scratch
   - Build your website
   - **Publish it** to make it publicly accessible

#### If the website exists but isn't published:
1. **Publish the website:**
   - Login to your account
   - Go to `/user/main` (your dashboard)
   - Find your website in the list
   - Click the "Publish" button
   - Once published, you can view it at `/sites/your-website-slug`

#### To check if websites exist in your database:
1. Open phpMyAdmin (from XAMPP Control Panel)
2. Select the `webeenthere` database
3. Check the `websites` table
4. Look for:
   - Websites with `is_published = 1` (these are viewable)
   - Websites with `is_published = 0` (these need to be published)

### Quick Test:
Try accessing these URLs to check what websites exist:

1. **All Published Websites:**
   ```
   http://localhost:5000/api/websites/public/all
   ```
   - Shows only published websites that are publicly viewable
   - If empty, you need to create and publish a website

2. **All Websites (Debug - includes unpublished):**
   ```
   http://localhost:5000/api/analytics/debug/websites
   ```
   - Shows ALL websites (published and unpublished)
   - Useful for debugging and checking what exists in your database

### Next Steps:
1. **If no websites exist:** Create one! See `QUICK_START.md` for detailed instructions
2. **If websites exist but aren't published:** Login and publish them from your dashboard
3. **If you need sample data:** Run `npm run init-db` in the server directory

## Still Having Issues?

1. **Check the browser console** (F12) for detailed error messages
2. **Check the backend terminal** for any error logs
3. **Verify ports are not in use:**
   - Port 5000 (backend)
   - Port 3000 (frontend)
   - Port 3306 (MySQL)
4. **Try restarting everything:**
   - Stop XAMPP MySQL, wait 5 seconds, start it again
   - Stop backend server (Ctrl+C), restart it
   - Refresh the browser

## Database Not Initialized?

If you see database-related errors, initialize the database:

```bash
cd server
npm run init-db
```

This will:
- Create the `webeenthere` database if it doesn't exist
- Create all necessary tables
- Add sample data (including sample websites that you can publish)

