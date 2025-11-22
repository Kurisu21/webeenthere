# Quick Start Guide - Creating Your First Website

## Current Issue
You're seeing: `{"success":false,"message":"Website not found","details":"No website exists with this slug..."}`

This means **no website exists** with the slug you're trying to access. You need to create a website first!

## Step 1: Check What Websites Exist

### Option A: Check via API (Easiest)
Open these URLs in your browser:

1. **All Published Websites:**
   ```
   http://localhost:5000/api/websites/public/all
   ```
   This shows only published websites that are publicly viewable.

2. **All Websites (Debug - includes unpublished):**
   ```
   http://localhost:5000/api/analytics/debug/websites
   ```
   This shows ALL websites (published and unpublished) for debugging.

### Option B: Check via phpMyAdmin
1. Open **XAMPP Control Panel**
2. Click **Admin** next to MySQL (opens phpMyAdmin)
3. Select `webeenthere` database
4. Click on `websites` table
5. Browse the data to see:
   - `id` - Website ID
   - `title` - Website title
   - `slug` - URL slug (what you use in `/sites/slug`)
   - `is_published` - 1 = published, 0 = not published
   - `user_id` - Owner of the website

## Step 2: Create Your First Website

### Method 1: Via Web Interface (Recommended)

1. **Start the Frontend:**
   ```bash
   cd client
   npm run dev
   ```

2. **Login or Register:**
   - Go to `http://localhost:3000/register` to create an account
   - Or `http://localhost:3000/login` if you already have one

3. **Create a Website:**
   - After logging in, go to `/user/create`
   - Or click "Create Website" in the dashboard
   - Select a template or start from scratch
   - Build your website using the drag-and-drop editor
   - **Save** your website
   - **Publish** it to make it publicly accessible

4. **View Your Website:**
   - Once published, visit: `http://localhost:3000/sites/your-website-slug`
   - The slug is shown in your dashboard

### Method 2: Initialize Database with Sample Data

If you want sample websites to test with:

```bash
cd server
npm run init-db
```

This will:
- Create sample users (you can login with these)
- Create sample templates
- Create sample websites (but they won't be published by default)

**To publish sample websites:**
1. Login as one of the sample users (e.g., `john_doe` / `password123`)
2. Go to `/user/main` (dashboard)
3. Find the sample websites
4. Click "Publish" on each one you want to view

## Step 3: Understanding the Workflow

### Website States:
- **Draft** (`is_published = 0`) - Only you can see it, not publicly accessible
- **Published** (`is_published = 1`) - Publicly accessible at `/sites/your-slug`

### URL Structure:
- **View Published Website:** `/sites/your-website-slug`
- **Edit Website:** `/user/build/website-id`
- **Dashboard:** `/user/main`

### Example Workflow:
1. Create website → Gets a unique slug (e.g., `my-portfolio-1234567890`)
2. Build/Edit website → Add content, customize design
3. Save website → Saves as draft
4. Publish website → Makes it publicly viewable
5. View website → Visit `/sites/my-portfolio-1234567890`

## Step 4: Quick Test

After creating and publishing a website:

1. **Get the slug** from your dashboard
2. **Test the URL:**
   ```
   http://localhost:3000/sites/your-slug-here
   ```
3. **Or test via API:**
   ```
   http://localhost:5000/api/websites/public/your-slug-here
   ```

## Common Questions

### Q: How do I know what slug to use?
**A:** The slug is auto-generated when you create a website. You can:
- See it in your dashboard (`/user/main`)
- Change it in the website settings
- Check it in the database

### Q: Can I use a custom slug?
**A:** Yes! When creating or editing a website, you can set a custom slug. Make sure it's:
- Unique (not already taken)
- URL-friendly (lowercase, no spaces, use hyphens)
- Example: `my-awesome-portfolio`

### Q: Why can't I see my website even after creating it?
**A:** You need to **publish** it! Draft websites are not publicly viewable.

### Q: How do I publish a website?
**A:** 
1. Go to `/user/main` (your dashboard)
2. Find your website in the list
3. Click the "Publish" button
4. Once published, you can view it at `/sites/your-slug`

## Need Help?

1. **Check the browser console** (F12) for errors
2. **Check the backend terminal** for server logs
3. **Verify your database** has websites in the `websites` table
4. **Make sure the website is published** (`is_published = 1`)

## Sample Users (if you ran init-db)

You can login with these accounts:
- `john_doe` / `password123`
- `jane_smith` / `password123`
- `admin_user` / `password123` (admin account)

These accounts have sample websites you can publish and test with!






