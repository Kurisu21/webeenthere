// scripts/populateTemplates.js
const mysql = require('mysql2/promise');
const { templates } = require('../client/src/app/_data/templates');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'webeenthere'
};

async function populateTemplates() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    
    // Add error handler to prevent unhandled errors
    connection.on('error', (err) => {
      console.error('❌ Database connection error:', err.message);
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('🔄 Database connection lost.');
      } else if (err.fatal) {
        console.error('💥 Fatal database connection error:', err);
      }
    });
    
    console.log('Connected to database');

    // Clear existing templates
    await connection.execute('DELETE FROM templates');
    console.log('Cleared existing templates');

    // Insert templates
    for (const template of templates) {
      const { id, name, description, category, image, html_base, css_base, is_featured } = template;
      
      await connection.execute(
        'INSERT INTO templates (name, description, category, html_base, css_base, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, category, html_base, css_base, is_featured, true]
      );
      
      console.log(`Inserted template: ${name}`);
    }

    console.log('Successfully populated templates!');
    
  } catch (error) {
    console.error('Error populating templates:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the script
populateTemplates();







