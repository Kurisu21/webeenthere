#!/usr/bin/env node

/**
 * Test script for Hosting & Publication module
 * Tests the new admin website routes and functionality
 */

// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:5000';

// Test data
const testWebsite = {
  title: 'Test Website',
  slug: 'test-website-' + Date.now(),
  html_content: '<h1>Hello World</h1>',
  css_content: 'h1 { color: blue; }',
  is_published: false
};

async function testAdminRoutes() {
  console.log('🧪 Testing Hosting & Publication Module...\n');

  try {
    // Test 1: Get hosting stats
    console.log('1. Testing hosting stats endpoint...');
    const statsResponse = await fetch(`${API_BASE}/api/admin/websites/stats`, {
      headers: {
        'Authorization': 'Bearer test-admin-token', // This would be a real admin token
        'Content-Type': 'application/json'
      }
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Hosting stats endpoint working');
      console.log('   Stats:', stats.data);
    } else {
      console.log('❌ Hosting stats endpoint failed:', statsResponse.status);
    }

    // Test 2: Get all websites
    console.log('\n2. Testing get all websites endpoint...');
    const websitesResponse = await fetch(`${API_BASE}/api/admin/websites?limit=5`, {
      headers: {
        'Authorization': 'Bearer test-admin-token',
        'Content-Type': 'application/json'
      }
    });
    
    if (websitesResponse.ok) {
      const websites = await websitesResponse.json();
      console.log('✅ Get all websites endpoint working');
      console.log('   Found', websites.data.websites.length, 'websites');
    } else {
      console.log('❌ Get all websites endpoint failed:', websitesResponse.status);
    }

    // Test 3: Test website export
    console.log('\n3. Testing website export endpoint...');
    const exportResponse = await fetch(`${API_BASE}/api/websites/1/export?format=html`, {
      headers: {
        'Authorization': 'Bearer test-user-token', // This would be a real user token
        'Content-Type': 'application/json'
      }
    });
    
    if (exportResponse.ok) {
      console.log('✅ Website export endpoint working');
      console.log('   Content-Type:', exportResponse.headers.get('content-type'));
    } else {
      console.log('❌ Website export endpoint failed:', exportResponse.status);
    }

    console.log('\n🎉 Hosting & Publication module tests completed!');
    console.log('\nNote: Some tests may fail due to authentication requirements.');
    console.log('To fully test, you need valid admin and user tokens.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAdminRoutes();
}

module.exports = { testAdminRoutes };
