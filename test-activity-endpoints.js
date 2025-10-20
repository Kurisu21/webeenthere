const jwt = require('jsonwebtoken');

// Create a test admin token
const adminToken = jwt.sign(
  { 
    id: 3, 
    username: 'admin_user', 
    email: 'admin@webeenthere.com', 
    role: 'admin' 
  }, 
  process.env.JWT_SECRET || 'fallback_secret'
);

console.log('Admin Token:', adminToken);

// Test the endpoints
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5000';
  const headers = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test activity logs
    console.log('\n=== Testing Activity Logs ===');
    const logsResponse = await fetch(`${baseUrl}/api/admin/activity/logs?page=1&limit=50`, {
      method: 'GET',
      headers
    });
    const logsData = await logsResponse.json();
    console.log('Activity Logs Status:', logsResponse.status);
    console.log('Activity Logs Response:', JSON.stringify(logsData, null, 2));

    // Test activity stats
    console.log('\n=== Testing Activity Stats ===');
    const statsResponse = await fetch(`${baseUrl}/api/admin/activity/stats`, {
      method: 'GET',
      headers
    });
    const statsData = await statsResponse.json();
    console.log('Activity Stats Status:', statsResponse.status);
    console.log('Activity Stats Response:', JSON.stringify(statsData, null, 2));

    // Test activity trends
    console.log('\n=== Testing Activity Trends ===');
    const trendsResponse = await fetch(`${baseUrl}/api/admin/activity/trends?period=daily&days=30`, {
      method: 'GET',
      headers
    });
    const trendsData = await trendsResponse.json();
    console.log('Activity Trends Status:', trendsResponse.status);
    console.log('Activity Trends Response:', JSON.stringify(trendsData, null, 2));

  } catch (error) {
    console.error('Error testing endpoints:', error);
  }
};

testEndpoints();

