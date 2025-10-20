#!/usr/bin/env node

const DatabaseORM = require('./databaseORM');

async function main() {
  console.log('🔧 Webeenthere Database Initializer');
  console.log('=====================================\n');

  const orm = new DatabaseORM();

  // Check current status
  console.log('📊 Checking current database status...');
  const status = await orm.getStatus();
  
  if (status) {
    console.log(`Database exists: ${status.database ? '✅ Yes' : '❌ No'}`);
    console.log('\nTable status:');
    for (const [tableName, tableStatus] of Object.entries(status.tables)) {
      const exists = tableStatus.exists ? '✅' : '❌';
      const hasData = tableStatus.hasData ? '📊' : '📭';
      console.log(`  ${tableName}: ${exists} exists, ${hasData} ${tableStatus.hasData ? 'has data' : 'empty'}`);
    }
    console.log('');
  }

  // Initialize database
  const success = await orm.initialize();
  
  if (success) {
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Database: webeenthere');
    console.log('- Tables: users, templates, websites, ai_prompts, media_assets, website_analytics, custom_blocks, plans, user_plan, feedback, feedback_responses, forum_categories, forum_threads, forum_replies, help_categories, help_articles, support_tickets, support_messages, activity_logs, system_settings');
    console.log('- Dummy data: 5 users, 5 templates, 5 websites, 3 plans, 5 feedback items, 3 forum categories, 5 forum threads, 10 forum replies, 3 help categories, 8 help articles, 3 support tickets, 5 support messages, 5 activity logs, 4 system settings');
    console.log('\n🔑 Default login credentials:');
    console.log('- Username: john_doe, Password: password123');
    console.log('- Username: admin_user, Password: password123');
    console.log('\n🚀 You can now start your server with: npm run dev');
  } else {
    console.log('\n❌ Database setup failed. Please check your MySQL connection and try again.');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Webeenthere Database Initializer');
  console.log('Usage: node initDatabase.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --status       Show database status only');
  console.log('');
  console.log('This script will:');
  console.log('1. Create the "webeenthere" database if it doesn\'t exist');
  console.log('2. Create all required tables');
  console.log('3. Seed dummy data (only if tables are empty)');
  console.log('');
  console.log('Make sure MySQL is running (XAMPP) before running this script.');
  process.exit(0);
}

if (args.includes('--status')) {
  const orm = new DatabaseORM();
  orm.getStatus().then(status => {
    if (status) {
      console.log('📊 Database Status:');
      console.log(`Database exists: ${status.database ? '✅ Yes' : '❌ No'}`);
      console.log('\nTable status:');
      for (const [tableName, tableStatus] of Object.entries(status.tables)) {
        const exists = tableStatus.exists ? '✅' : '❌';
        const hasData = tableStatus.hasData ? '📊' : '📭';
        console.log(`  ${tableName}: ${exists} exists, ${hasData} ${tableStatus.hasData ? 'has data' : 'empty'}`);
      }
    } else {
      console.log('❌ Could not connect to database');
    }
  });
} else {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}


