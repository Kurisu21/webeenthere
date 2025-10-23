# User Activity History - Testing Guide

## Quick Start

### 1. Start the Application

```bash
# Terminal 1 - Start Backend Server
cd server
npm start

# Terminal 2 - Start Frontend Client
cd client
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.

### 2. Access the User History Page

1. **Login as a User:**
   - Navigate to `http://localhost:3000/login`
   - Login with your user credentials (not admin)

2. **Navigate to History:**
   - Click on "History" in the sidebar (clock icon)
   - Or directly visit: `http://localhost:3000/user/history`

### 3. Generate Some Activity Data

To see the feature in action, perform some activities:

**Create a Website:**
1. Go to `/user/create`
2. Create a new website
3. Check History - you should see "Website Created" activity

**Update Your Profile:**
1. Go to `/user/profile`
2. Update your username or theme
3. Check History - you should see "Profile Updated" activity

**Publish a Website:**
1. Go to `/user/host`
2. Publish one of your websites
3. Check History - you should see "Website Published" activity

### 4. Test Filtering Features

**Search:**
- Type "website" in the search box
- Click "Search"
- Should show only website-related activities

**Action Filter:**
- Select "Website Created" from the Action Type dropdown
- Click "Search"
- Should show only website creation activities

**Date Range:**
- Set Start Date to yesterday
- Set End Date to today
- Click "Search"
- Should show activities from the last 2 days

**Quick Filters:**
- Click "Today" - Shows today's activities
- Click "Last 7 days" - Shows last week's activities
- Click "Last 30 days" - Shows last month's activities
- Click "Clear All" - Resets all filters

### 5. Test Export Features

**Export as CSV:**
1. Click "Export CSV" button
2. A CSV file should download: `my-activity-history-YYYY-MM-DD.csv`
3. Open in Excel or any spreadsheet app
4. Verify all activity data is present

**Export as JSON:**
1. Click "Export JSON" button
2. A JSON file should download: `my-activity-history-YYYY-MM-DD.json`
3. Open in a text editor
4. Verify JSON structure is correct

### 6. Test Pagination

If you have more than 50 activities:
1. Scroll to the bottom of the page
2. You should see pagination controls
3. Click "Next" to go to page 2
4. Click page numbers to jump to specific pages
5. Click "Previous" to go back

### 7. Test Theme Support

**Light Mode:**
1. Go to `/user/settings`
2. Switch to Light theme
3. Go back to `/user/history`
4. Verify colors, text, and cards look good in light mode

**Dark Mode:**
1. Switch back to Dark theme
2. Go to `/user/history`
3. Verify colors, text, and cards look good in dark mode

### 8. Test Mobile Responsiveness

**Desktop View (>768px):**
- Should show full table with all columns
- Sidebar should be visible on the left
- Stats cards should be in a row

**Tablet View (768px):**
- Table should still be visible
- Sidebar may collapse
- Stats cards should stack nicely

**Mobile View (<768px):**
- Table should switch to card-based layout
- Sidebar should be collapsible
- Filters should stack vertically
- Stats cards should be one per row

### 9. Test Admin View

**Login as Admin:**
1. Logout from user account
2. Login with admin credentials
3. Navigate to `/admin/activity-logs`

**View User Activities:**
1. You should see ALL activities from all users
2. Use the User ID filter to see specific user's activities
3. Search for activities
4. Export admin activity logs

### 10. Verify Activity Logging

Perform each action and verify it appears in History:

- ✅ Login (should log "User Login")
- ✅ Create website (should log "Website Created")
- ✅ Update website (should log "Website Updated")
- ✅ Publish website (should log "Website Published")
- ✅ Unpublish website (should log "Website Unpublished")
- ✅ Delete website (should log "Website Deleted")
- ✅ Update profile (should log "Profile Updated")
- ✅ Change password (should log "Password Changed")

## Expected Behavior

### Activity Stats Cards

**Total Activities Card (Purple-Blue):**
- Shows total number of all-time activities
- Updates when new activities are logged

**Last 7 Days Card (Green-Emerald):**
- Shows count of activities in last 7 days
- Updates dynamically

**Most Common Action Card (Orange-Red):**
- Shows the most frequently performed action
- Shows count of how many times

### Activity Table

**Desktop Table Columns:**
1. Action - Icon + colored action name
2. Details - JSON details truncated to 100 chars
3. IP Address - User's IP
4. User Agent - Browser/device info truncated
5. Timestamp - Formatted date and time

**Mobile Card View:**
- Action with icon at top
- Details below
- IP and timestamp in small text

### Activity Details

Each activity should show:
- **Action**: Human-readable action name (e.g., "Website Created")
- **Icon**: Emoji representing the action
- **Color**: Color-coded by action type
  - Green: Login, success actions
  - Red: Failed, delete actions
  - Yellow: Status changes, role changes
  - Blue: Settings, system actions
  - Purple: Export, maintenance
- **Details**: JSON object with specifics
  - Website: title, slug, template_id
  - Profile: fields_changed, username, email
  - etc.
- **IP Address**: Full IP address
- **User Agent**: Full user agent string
- **Timestamp**: Formatted as "Mon, Jan 1, 2025, 12:00:00 PM"

## Common Issues & Solutions

### Issue: No activities showing
**Solution:**
- Make sure you're logged in
- Perform some actions (create website, update profile)
- Refresh the page
- Check browser console for errors

### Issue: Export not working
**Solution:**
- Check if popup blocker is enabled
- Make sure you're logged in
- Check network tab in browser DevTools
- Verify backend server is running

### Issue: Filters not working
**Solution:**
- Click "Search" button after changing filters
- Check that dates are valid
- Try "Clear All" and reapply filters

### Issue: Theme colors look wrong
**Solution:**
- Verify theme is set in user settings
- Check that CSS variables are loaded
- Hard refresh the page (Ctrl+F5)

### Issue: Page not loading
**Solution:**
- Verify both frontend and backend are running
- Check for console errors
- Verify user is authenticated
- Check that routes are registered in server/app.js

## Testing Checklist

Use this checklist to verify everything works:

- [ ] Can access /user/history page
- [ ] Activity stats cards display correctly
- [ ] Can see activity history table
- [ ] Search filter works
- [ ] Action type filter works
- [ ] Date range filters work
- [ ] Quick filters work (Today, Last 7 days, Last 30 days)
- [ ] Clear All button works
- [ ] Export CSV works
- [ ] Export JSON works
- [ ] Pagination works (if applicable)
- [ ] Light mode looks good
- [ ] Dark mode looks good
- [ ] Desktop view works
- [ ] Tablet view works
- [ ] Mobile view works
- [ ] Activities are logged for website actions
- [ ] Activities are logged for profile actions
- [ ] Activities are logged for login
- [ ] Admin can see user activities
- [ ] No console errors
- [ ] No linter errors

## Performance Testing

### Load Test
1. Create 100+ activities (script or manually)
2. Navigate to history page
3. Page should load in < 2 seconds
4. Scrolling should be smooth
5. Filtering should be fast

### Pagination Test
1. With 100+ activities
2. Verify pagination shows correct pages
3. Test navigating through all pages
4. Verify correct items per page

### Export Test
1. With 100+ activities
2. Export CSV - should complete in < 5 seconds
3. Export JSON - should complete in < 5 seconds
4. Files should be properly formatted

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium-based)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## API Testing (Optional)

You can test the API endpoints directly using tools like Postman or curl:

```bash
# Get activity logs (replace TOKEN with your JWT token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/user/activity/logs

# Get activity stats
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/user/activity/stats

# Export as CSV
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/user/activity/export?format=csv \
  -o my-activities.csv

# With filters
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/user/activity/logs?page=1&limit=10&action=website_created"
```

## Success Criteria

The feature is working correctly if:
1. ✅ Users can view their own activity history
2. ✅ Activity data includes full details (IP, user agent, etc.)
3. ✅ Filtering and search work correctly
4. ✅ Export to CSV/JSON works
5. ✅ Pagination works for large datasets
6. ✅ UI looks good in both light and dark modes
7. ✅ Responsive design works on all devices
8. ✅ Admin can see all user activities
9. ✅ No errors in console or linter
10. ✅ Performance is acceptable

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check server logs for backend errors
3. Verify all files are saved
4. Restart both frontend and backend servers
5. Clear browser cache
6. Review the implementation document: `USER_ACTIVITY_HISTORY_IMPLEMENTATION.md`

Happy Testing! 🎉



