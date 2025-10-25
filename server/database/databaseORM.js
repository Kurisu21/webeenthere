const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

class DatabaseORM {
  constructor() {
    this.connection = null;
    this.dbName = 'webeenthere';
  }

  // Create connection without specifying database first
  async createConnection() {
    return mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });
  }

  // Create connection with database
  async createConnectionWithDB() {
    return mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: this.dbName,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });
  }

  // Check if database exists
  async databaseExists() {
    const connection = await this.createConnection();
    try {
      const [rows] = await connection.promise().execute(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [this.dbName]
      );
      return rows.length > 0;
    } finally {
      connection.end();
    }
  }

  // Create database if it doesn't exist
  async createDatabase() {
    const connection = await this.createConnection();
    try {
      await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS \`${this.dbName}\``);
      console.log(`✅ Database '${this.dbName}' created or already exists`);
    } finally {
      connection.end();
    }
  }

  // Check if table exists
  async tableExists(tableName) {
    const connection = await this.createConnectionWithDB();
    try {
      const [rows] = await connection.promise().execute(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [this.dbName, tableName]
      );
      return rows.length > 0;
    } finally {
      connection.end();
    }
  }

  // Check if table has data
  async tableHasData(tableName) {
    const connection = await this.createConnectionWithDB();
    try {
      const [rows] = await connection.promise().execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      return rows[0].count > 0;
    } finally {
      connection.end();
    }
  }

  // Create all tables
  async createTables() {
    const connection = await this.createConnectionWithDB();
    
    const tables = {
      users: `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          profile_image VARCHAR(255),
          role ENUM('user', 'admin') DEFAULT 'user',
          theme_mode ENUM('light', 'dark') DEFAULT 'light',
          is_verified BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          ai_chat_usage INT DEFAULT 0,
          ai_chat_reset_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `,
      templates: `
        CREATE TABLE IF NOT EXISTS templates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          category VARCHAR(50),
          html_base LONGTEXT,
          css_base LONGTEXT,
          is_featured BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          -- NEW: Community Template Fields - Enable users to share their websites as templates
          is_community BOOLEAN DEFAULT FALSE,
          creator_user_id INT NULL,
          source_website_id INT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (creator_user_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_is_community (is_community),
          INDEX idx_creator_user_id (creator_user_id),
          INDEX idx_is_active (is_active)
        )
      `,
      websites: `
        CREATE TABLE IF NOT EXISTS websites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(100),
          slug VARCHAR(100) UNIQUE,
          html_content LONGTEXT,
          css_content LONGTEXT,
          template_id INT,
          is_published BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (template_id) REFERENCES templates(id)
        )
      `,
      ai_prompts: `
        CREATE TABLE IF NOT EXISTS ai_prompts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          prompt_type ENUM('title', 'hero', 'about', 'full') NOT NULL,
          prompt_text TEXT NOT NULL,
          response_html LONGTEXT,
          used_on_site BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `,
      media_assets: `
        CREATE TABLE IF NOT EXISTS media_assets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          website_id INT,
          file_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(50),
          file_url TEXT NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (website_id) REFERENCES websites(id)
        )
      `,
      website_analytics: `
        CREATE TABLE IF NOT EXISTS website_analytics (
          id INT AUTO_INCREMENT PRIMARY KEY,
          website_id INT NOT NULL,
          visit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          visitor_ip VARCHAR(45),
          visitor_id VARCHAR(50),
          session_id VARCHAR(50),
          user_agent TEXT,
          referrer TEXT,
          FOREIGN KEY (website_id) REFERENCES websites(id),
          INDEX idx_visitor_id (visitor_id),
          INDEX idx_session_id (session_id),
          INDEX idx_visit_time (visit_time)
        )
      `,
      custom_blocks: `
        CREATE TABLE IF NOT EXISTS custom_blocks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(100),
          block_type VARCHAR(50),
          html_content LONGTEXT,
          css_content LONGTEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `,
      plans: `
        CREATE TABLE IF NOT EXISTS plans (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          type ENUM('free', 'monthly', 'yearly') NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          features TEXT,
          website_limit INT DEFAULT NULL,
          ai_chat_limit INT DEFAULT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
      user_plan: `
        CREATE TABLE IF NOT EXISTS user_plan (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          plan_id INT NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE,
          auto_renew BOOLEAN DEFAULT TRUE,
          payment_reference VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (plan_id) REFERENCES plans(id)
        )
      `,
      subscription_logs: `
        CREATE TABLE IF NOT EXISTS subscription_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          plan_id INT NOT NULL,
          action ENUM('created', 'upgraded', 'downgraded', 'cancelled', 'renewed') NOT NULL,
          payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
          amount DECIMAL(10,2) DEFAULT 0,
          payment_reference VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (plan_id) REFERENCES plans(id),
          INDEX idx_user_id (user_id),
          INDEX idx_action (action),
          INDEX idx_created_at (created_at)
        )
      `,
      payment_transactions: `
        CREATE TABLE IF NOT EXISTS payment_transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          plan_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
          transaction_reference VARCHAR(100) UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (plan_id) REFERENCES plans(id),
          INDEX idx_user_id (user_id),
          INDEX idx_status (status),
          INDEX idx_transaction_reference (transaction_reference)
        )
      `,
      feedback: `
        CREATE TABLE IF NOT EXISTS feedback (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
          status ENUM('open', 'assigned', 'responded', 'closed') DEFAULT 'open',
          assigned_to INT NULL,
          response TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_user_id (user_id),
          INDEX idx_status (status),
          INDEX idx_priority (priority)
        )
      `,
      feedback_responses: `
        CREATE TABLE IF NOT EXISTS feedback_responses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          feedback_id INT NOT NULL,
          admin_id INT NOT NULL,
          response TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE,
          FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_feedback_id (feedback_id)
        )
      `,
      forum_categories: `
        CREATE TABLE IF NOT EXISTS forum_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          icon VARCHAR(50),
          color VARCHAR(7),
          is_active BOOLEAN DEFAULT TRUE,
          thread_count INT DEFAULT 0,
          last_activity DATETIME NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_is_active (is_active)
        )
      `,
      forum_threads: `
        CREATE TABLE IF NOT EXISTS forum_threads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category_id INT NOT NULL,
          author_id INT NOT NULL,
          title VARCHAR(200) NOT NULL,
          content TEXT NOT NULL,
          views INT DEFAULT 0,
          replies_count INT DEFAULT 0,
          likes INT DEFAULT 0,
          is_pinned BOOLEAN DEFAULT FALSE,
          is_locked BOOLEAN DEFAULT FALSE,
          is_deleted BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_category_id (category_id),
          INDEX idx_author_id (author_id),
          INDEX idx_is_deleted (is_deleted),
          INDEX idx_created_at (created_at)
        )
      `,
      forum_replies: `
        CREATE TABLE IF NOT EXISTS forum_replies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          thread_id INT NOT NULL,
          author_id INT NOT NULL,
          content TEXT NOT NULL,
          likes INT DEFAULT 0,
          is_deleted BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_thread_id (thread_id),
          INDEX idx_author_id (author_id),
          INDEX idx_is_deleted (is_deleted)
        )
      `,
      help_categories: `
        CREATE TABLE IF NOT EXISTS help_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          icon VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `,
      help_articles: `
        CREATE TABLE IF NOT EXISTS help_articles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category_id INT NOT NULL,
          title VARCHAR(200) NOT NULL,
          content LONGTEXT NOT NULL,
          author_id INT NOT NULL,
          views INT DEFAULT 0,
          helpful_count INT DEFAULT 0,
          not_helpful_count INT DEFAULT 0,
          is_published BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES help_categories(id) ON DELETE CASCADE,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_category_id (category_id),
          INDEX idx_is_published (is_published)
        )
      `,
      support_tickets: `
        CREATE TABLE IF NOT EXISTS support_tickets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ticket_number VARCHAR(20) UNIQUE NOT NULL,
          user_id INT NOT NULL,
          subject VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
          status ENUM('open', 'assigned', 'in_progress', 'closed') DEFAULT 'open',
          assigned_to INT NULL,
          resolution TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          closed_at DATETIME NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_user_id (user_id),
          INDEX idx_status (status),
          INDEX idx_assigned_to (assigned_to),
          INDEX idx_ticket_number (ticket_number)
        )
      `,
      support_messages: `
        CREATE TABLE IF NOT EXISTS support_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ticket_id INT NOT NULL,
          sender_id INT NOT NULL,
          sender_type ENUM('user', 'admin') NOT NULL,
          message TEXT NOT NULL,
          is_internal BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_ticket_id (ticket_id),
          INDEX idx_sender_id (sender_id)
        )
      `,
      activity_logs: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          action VARCHAR(100) NOT NULL,
          entity_type VARCHAR(50),
          entity_id INT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          details JSON,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_user_id (user_id),
          INDEX idx_action (action),
          INDEX idx_timestamp (timestamp),
          INDEX idx_entity (entity_type, entity_id)
        )
      `,
      system_settings: `
        CREATE TABLE IF NOT EXISTS system_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value JSON NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          updated_by INT NULL,
          FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_setting_key (setting_key)
        )
      `
    };

    try {
      for (const [tableName, sql] of Object.entries(tables)) {
        const exists = await this.tableExists(tableName);
        if (!exists) {
          await connection.promise().execute(sql);
          console.log(`✅ Table '${tableName}' created`);
        } else {
          console.log(`ℹ️  Table '${tableName}' already exists`);
        }
      }
      
      // Add foreign key constraint for templates.source_website_id after websites table is created
      await this.addTemplateWebsiteForeignKey(connection);
    } finally {
      connection.end();
    }
  }

  // Add foreign key constraint for templates.source_website_id
  async addTemplateWebsiteForeignKey(connection) {
    try {
      // Check if the foreign key constraint already exists
      const [constraints] = await connection.promise().execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'templates' 
        AND COLUMN_NAME = 'source_website_id' 
        AND REFERENCED_TABLE_NAME = 'websites'
      `);

      if (constraints.length === 0) {
        // Add the foreign key constraint
        await connection.promise().execute(`
          ALTER TABLE templates 
          ADD CONSTRAINT fk_templates_source_website 
          FOREIGN KEY (source_website_id) REFERENCES websites(id) ON DELETE SET NULL
        `);
        console.log(`✅ Foreign key constraint added for templates.source_website_id`);
      } else {
        console.log(`ℹ️  Foreign key constraint for templates.source_website_id already exists`);
      }
    } catch (error) {
      console.log(`⚠️  Could not add foreign key constraint for templates.source_website_id: ${error.message}`);
    }
  }

  // Seed dummy data
  async seedDummyData() {
    const connection = await this.createConnectionWithDB();

    try {
      // Seed users
      if (!(await this.tableHasData('users'))) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = [
          {
            username: 'john_doe',
            email: 'john@example.com',
            password_hash: hashedPassword,
            role: 'user',
            theme_mode: 'light',
            is_verified: true
          },
          {
            username: 'jane_smith',
            email: 'jane@example.com',
            password_hash: hashedPassword,
            role: 'user',
            theme_mode: 'dark',
            is_verified: true
          },
          {
            username: 'admin_user',
            email: 'admin@webeenthere.com',
            password_hash: hashedPassword,
            role: 'admin',
            theme_mode: 'light',
            is_verified: true
          },
          {
            username: 'artist_creative',
            email: 'artist@example.com',
            password_hash: hashedPassword,
            role: 'user',
            theme_mode: 'dark',
            is_verified: true
          },
          {
            username: 'business_owner',
            email: 'business@example.com',
            password_hash: hashedPassword,
            role: 'user',
            theme_mode: 'light',
            is_verified: false
          }
        ];

        for (const user of users) {
          await connection.promise().execute(
            `INSERT INTO users (username, email, password_hash, role, theme_mode, is_verified) VALUES (?, ?, ?, ?, ?, ?)`,
            [user.username, user.email, user.password_hash, user.role, user.theme_mode, user.is_verified]
          );
        }
        console.log(`✅ Seeded ${users.length} users`);
      } else {
        console.log(`ℹ️  Users table already has data, skipping`);
      }

      // Seed templates
      if (!(await this.tableHasData('templates'))) {
        const templates = [
          {
            name: 'Modern Portfolio',
            description: 'Clean and modern portfolio template perfect for designers and developers',
            category: 'portfolio',
            html_base: '<div class="hero-section"><h1>Welcome to My Portfolio</h1><p>I create amazing digital experiences</p></div>',
            css_base: '.hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }',
            is_featured: true
          },
          {
            name: 'Business Landing',
            description: 'Professional business landing page template',
            category: 'business',
            html_base: '<div class="business-hero"><h1>Your Business Solution</h1><p>We help businesses grow</p></div>',
            css_base: '.business-hero { background: #2c3e50; color: white; padding: 80px 0; text-align: center; }',
            is_featured: true
          },
          {
            name: 'Creative Artist',
            description: 'Bold and creative template for artists and creatives',
            category: 'creative',
            html_base: '<div class="creative-showcase"><h1>My Creative World</h1><p>Explore my artistic journey</p></div>',
            css_base: '.creative-showcase { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 120px 0; text-align: center; }',
            is_featured: false
          },
          {
            name: 'Minimal Blog',
            description: 'Simple and elegant blog template',
            category: 'blog',
            html_base: '<div class="blog-header"><h1>My Thoughts</h1><p>Sharing ideas and experiences</p></div>',
            css_base: '.blog-header { background: #f8f9fa; color: #333; padding: 60px 0; text-align: center; border-bottom: 1px solid #dee2e6; }',
            is_featured: false
          },
          {
            name: 'Restaurant Menu',
            description: 'Appetizing template for restaurants and food businesses',
            category: 'restaurant',
            html_base: '<div class="restaurant-banner"><h1>Delicious Dining</h1><p>Experience our culinary excellence</p></div>',
            css_base: '.restaurant-banner { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("food-bg.jpg"); color: white; padding: 100px 0; text-align: center; }',
            is_featured: true
          }
        ];

        for (const template of templates) {
          await connection.promise().execute(
            `INSERT INTO templates (name, description, category, html_base, css_base, is_featured) VALUES (?, ?, ?, ?, ?, ?)`,
            [template.name, template.description, template.category, template.html_base, template.css_base, template.is_featured]
          );
        }
        console.log(`✅ Seeded ${templates.length} templates`);
      } else {
        console.log(`ℹ️  Templates table already has data, skipping`);
      }

      // Seed websites
      if (!(await this.tableHasData('websites'))) {
        const websites = [
          {
            user_id: 1,
            title: 'John\'s Portfolio',
            slug: 'john-portfolio',
            html_content: `
              <div class="hero-section">
                <nav class="navbar">
                  <div class="nav-brand">John Doe</div>
                  <div class="nav-links">
                    <a href="#about">About</a>
                    <a href="#projects">Projects</a>
                    <a href="#contact">Contact</a>
                  </div>
                </nav>
                <div class="hero-content">
                  <h1 class="hero-title">Full-Stack Developer</h1>
                  <p class="hero-subtitle">Creating digital experiences that matter</p>
                  <div class="hero-buttons">
                    <button class="btn-primary">View My Work</button>
                    <button class="btn-secondary">Get In Touch</button>
                  </div>
                </div>
                <div class="scroll-indicator">
                  <div class="scroll-arrow"></div>
                </div>
              </div>
              <section id="about" class="about-section">
                <div class="container">
                  <h2>About Me</h2>
                  <div class="about-content">
                    <div class="about-text">
                      <p>I'm a passionate developer with 5+ years of experience building web applications that solve real-world problems.</p>
                      <p>Specializing in React, Node.js, and modern web technologies.</p>
                    </div>
                    <div class="skills">
                      <span class="skill-tag">React</span>
                      <span class="skill-tag">Node.js</span>
                      <span class="skill-tag">TypeScript</span>
                      <span class="skill-tag">MongoDB</span>
                    </div>
                  </div>
                </div>
              </section>
              <section id="projects" class="projects-section">
                <div class="container">
                  <h2>Featured Projects</h2>
                  <div class="projects-grid">
                    <div class="project-card">
                      <div class="project-image"></div>
                      <h3>E-Commerce Platform</h3>
                      <p>Modern e-commerce solution with React and Node.js</p>
                    </div>
                    <div class="project-card">
                      <div class="project-image"></div>
                      <h3>Task Management App</h3>
                      <p>Collaborative task management with real-time updates</p>
                    </div>
                  </div>
                </div>
              </section>
              <footer id="contact" class="footer">
                <div class="container">
                  <h2>Let's Work Together</h2>
                  <p>Ready to bring your ideas to life?</p>
                  <button class="btn-primary">Contact Me</button>
                </div>
              </footer>
            `,
            css_content: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
              .hero-section { height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; overflow: hidden; }
              .navbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; position: absolute; top: 0; left: 0; right: 0; z-index: 100; }
              .nav-brand { font-size: 24px; font-weight: 700; color: white; }
              .nav-links { display: flex; gap: 30px; }
              .nav-links a { color: white; text-decoration: none; font-weight: 500; transition: opacity 0.3s; }
              .nav-links a:hover { opacity: 0.8; }
              .hero-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; }
              .hero-title { font-size: 4rem; font-weight: 700; margin-bottom: 20px; }
              .hero-subtitle { font-size: 1.5rem; margin-bottom: 40px; opacity: 0.9; }
              .hero-buttons { display: flex; gap: 20px; justify-content: center; }
              .btn-primary, .btn-secondary { padding: 15px 30px; border: none; border-radius: 50px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
              .btn-primary { background: white; color: #667eea; }
              .btn-secondary { background: transparent; color: white; border: 2px solid white; }
              .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
              .btn-secondary:hover { background: white; color: #667eea; }
              .scroll-indicator { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); }
              .scroll-arrow { width: 2px; height: 30px; background: white; margin: 0 auto; position: relative; }
              .scroll-arrow::after { content: ''; position: absolute; bottom: 0; left: -4px; width: 10px; height: 10px; border-right: 2px solid white; border-bottom: 2px solid white; transform: rotate(45deg); }
              .about-section { padding: 100px 0; background: #f8f9fa; }
              .about-section h2 { text-align: center; font-size: 3rem; margin-bottom: 60px; color: #2c3e50; }
              .about-content { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
              .about-text p { font-size: 1.2rem; margin-bottom: 20px; color: #666; }
              .skills { display: flex; flex-wrap: wrap; gap: 15px; }
              .skill-tag { background: #667eea; color: white; padding: 10px 20px; border-radius: 25px; font-weight: 500; }
              .projects-section { padding: 100px 0; }
              .projects-section h2 { text-align: center; font-size: 3rem; margin-bottom: 60px; color: #2c3e50; }
              .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
              .project-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; }
              .project-card:hover { transform: translateY(-10px); }
              .project-image { height: 200px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); }
              .project-card h3 { padding: 20px 20px 10px; font-size: 1.5rem; color: #2c3e50; }
              .project-card p { padding: 0 20px 20px; color: #666; }
              .footer { background: #2c3e50; color: white; padding: 80px 0; text-align: center; }
              .footer h2 { font-size: 2.5rem; margin-bottom: 20px; }
              .footer p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
              @media (max-width: 768px) { .hero-title { font-size: 2.5rem; } .about-content { grid-template-columns: 1fr; } .hero-buttons { flex-direction: column; align-items: center; } }
            `,
            template_id: 1,
            is_published: true
          },
          {
            user_id: 2,
            title: 'Jane\'s Art Gallery',
            slug: 'jane-art-gallery',
            html_content: `
              <div class="gallery-hero">
                <nav class="gallery-nav">
                  <div class="logo">Jane Smith</div>
                  <div class="nav-menu">
                    <a href="#gallery">Gallery</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                  </div>
                </nav>
                <div class="hero-text">
                  <h1>Digital Art Gallery</h1>
                  <p>Where creativity meets technology</p>
                </div>
              </div>
              <section id="gallery" class="art-gallery">
                <div class="gallery-container">
                  <h2>Featured Works</h2>
                  <div class="art-grid">
                    <div class="art-piece">
                      <div class="art-image art-1"></div>
                      <h3>Digital Dreams</h3>
                      <p>Mixed media digital art</p>
                    </div>
                    <div class="art-piece">
                      <div class="art-image art-2"></div>
                      <h3>Abstract Reality</h3>
                      <p>Abstract digital painting</p>
                    </div>
                    <div class="art-piece">
                      <div class="art-image art-3"></div>
                      <h3>Color Symphony</h3>
                      <p>Vibrant color exploration</p>
                    </div>
                  </div>
                </div>
              </section>
              <section id="about" class="artist-about">
                <div class="about-container">
                  <div class="about-image"></div>
                  <div class="about-text">
                    <h2>About the Artist</h2>
                    <p>Jane Smith is a digital artist passionate about exploring the intersection of technology and creativity.</p>
                    <p>Her work combines traditional artistic principles with modern digital techniques.</p>
                  </div>
                </div>
              </section>
              <footer id="contact" class="gallery-footer">
                <div class="footer-content">
                  <h2>Commission Work</h2>
                  <p>Available for custom digital art commissions</p>
                  <button class="commission-btn">Get Quote</button>
                </div>
              </footer>
            `,
            css_content: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Playfair Display', serif; line-height: 1.6; color: #333; }
              .gallery-hero { height: 100vh; background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4); background-size: 400% 400%; animation: gradientShift 8s ease infinite; position: relative; }
              @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
              .gallery-nav { display: flex; justify-content: space-between; align-items: center; padding: 30px 50px; position: absolute; top: 0; left: 0; right: 0; z-index: 100; }
              .logo { font-size: 28px; font-weight: 700; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
              .nav-menu { display: flex; gap: 40px; }
              .nav-menu a { color: white; text-decoration: none; font-weight: 500; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); transition: all 0.3s; }
              .nav-menu a:hover { transform: translateY(-2px); }
              .hero-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; }
              .hero-text h1 { font-size: 5rem; font-weight: 300; margin-bottom: 20px; text-shadow: 3px 3px 6px rgba(0,0,0,0.3); }
              .hero-text p { font-size: 1.8rem; opacity: 0.9; }
              .art-gallery { padding: 120px 0; background: #f8f9fa; }
              .gallery-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
              .gallery-container h2 { text-align: center; font-size: 3.5rem; margin-bottom: 80px; color: #2c3e50; font-weight: 300; }
              .art-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 50px; }
              .art-piece { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.1); transition: all 0.4s; }
              .art-piece:hover { transform: translateY(-15px) scale(1.02); box-shadow: 0 25px 50px rgba(0,0,0,0.2); }
              .art-image { height: 300px; position: relative; }
              .art-1 { background: linear-gradient(135deg, #667eea, #764ba2); }
              .art-2 { background: linear-gradient(135deg, #f093fb, #f5576c); }
              .art-3 { background: linear-gradient(135deg, #4facfe, #00f2fe); }
              .art-piece h3 { padding: 25px 25px 10px; font-size: 1.8rem; color: #2c3e50; font-weight: 400; }
              .art-piece p { padding: 0 25px 25px; color: #666; font-size: 1.1rem; }
              .artist-about { padding: 120px 0; background: white; }
              .about-container { max-width: 1200px; margin: 0 auto; padding: 0 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
              .about-image { height: 500px; background: linear-gradient(45deg, #ff9a9e, #fecfef, #fecfef); border-radius: 20px; }
              .about-text h2 { font-size: 3rem; margin-bottom: 30px; color: #2c3e50; font-weight: 300; }
              .about-text p { font-size: 1.3rem; margin-bottom: 25px; color: #666; line-height: 1.8; }
              .gallery-footer { background: #2c3e50; color: white; padding: 100px 0; text-align: center; }
              .footer-content h2 { font-size: 3rem; margin-bottom: 25px; font-weight: 300; }
              .footer-content p { font-size: 1.4rem; margin-bottom: 40px; opacity: 0.9; }
              .commission-btn { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; border: none; padding: 20px 40px; border-radius: 50px; font-size: 1.2rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
              .commission-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.3); }
              @media (max-width: 768px) { .hero-text h1 { font-size: 3rem; } .about-container { grid-template-columns: 1fr; } .art-grid { grid-template-columns: 1fr; } }
            `,
            template_id: 3,
            is_published: true
          },
          {
            user_id: 3,
            title: 'Admin Dashboard',
            slug: 'admin-dashboard',
            html_content: `
              <div class="admin-hero">
                <nav class="admin-nav">
                  <div class="admin-logo">Webeenthere Admin</div>
                  <div class="admin-menu">
                    <a href="#dashboard">Dashboard</a>
                    <a href="#users">Users</a>
                    <a href="#analytics">Analytics</a>
                  </div>
                </nav>
                <div class="hero-content">
                  <h1>System Administration</h1>
                  <p>Manage and monitor your platform</p>
                </div>
              </div>
              <section class="dashboard-stats">
                <div class="stats-container">
                  <div class="stat-card">
                    <h3>Total Users</h3>
                    <div class="stat-number">1,247</div>
                  </div>
                  <div class="stat-card">
                    <h3>Active Websites</h3>
                    <div class="stat-number">892</div>
                  </div>
                  <div class="stat-card">
                    <h3>Monthly Revenue</h3>
                    <div class="stat-number">$12,450</div>
                  </div>
                </div>
              </section>
            `,
            css_content: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1a1a1a; color: #fff; }
              .admin-hero { height: 100vh; background: linear-gradient(135deg, #2c3e50, #34495e); position: relative; }
              .admin-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; }
              .admin-logo { font-size: 24px; font-weight: 700; color: #ecf0f1; }
              .admin-menu { display: flex; gap: 30px; }
              .admin-menu a { color: #bdc3c7; text-decoration: none; font-weight: 500; transition: color 0.3s; }
              .admin-menu a:hover { color: #3498db; }
              .hero-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
              .hero-content h1 { font-size: 4rem; margin-bottom: 20px; color: #ecf0f1; }
              .hero-content p { font-size: 1.5rem; color: #bdc3c7; }
              .dashboard-stats { padding: 100px 0; background: #2c3e50; }
              .stats-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; padding: 0 40px; }
              .stat-card { background: #34495e; padding: 40px; border-radius: 15px; text-align: center; border: 1px solid #4a5f7a; }
              .stat-card h3 { color: #bdc3c7; margin-bottom: 20px; font-size: 1.2rem; }
              .stat-number { font-size: 3rem; font-weight: 700; color: #3498db; }
            `,
            template_id: 2,
            is_published: false
          },
          {
            user_id: 4,
            title: 'Creative Studio',
            slug: 'creative-studio',
            html_content: `
              <div class="studio-hero">
                <nav class="studio-nav">
                  <div class="studio-logo">Creative Studio</div>
                  <div class="studio-menu">
                    <a href="#work">Work</a>
                    <a href="#team">Team</a>
                    <a href="#contact">Contact</a>
                  </div>
                </nav>
                <div class="hero-visual">
                  <div class="floating-shapes">
                    <div class="shape shape-1"></div>
                    <div class="shape shape-2"></div>
                    <div class="shape shape-3"></div>
                  </div>
                  <h1>Where Art Meets Technology</h1>
                  <p>We create digital experiences that inspire</p>
                </div>
              </div>
              <section class="work-showcase">
                <div class="showcase-container">
                  <h2>Our Creative Work</h2>
                  <div class="work-grid">
                    <div class="work-item">
                      <div class="work-image work-1"></div>
                      <h3>Brand Identity</h3>
                      <p>Complete visual identity design</p>
                    </div>
                    <div class="work-item">
                      <div class="work-image work-2"></div>
                      <h3>Web Design</h3>
                      <p>Modern responsive websites</p>
                    </div>
                    <div class="work-item">
                      <div class="work-image work-3"></div>
                      <h3>Digital Art</h3>
                      <p>Creative digital illustrations</p>
                    </div>
                  </div>
                </div>
              </section>
            `,
            css_content: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Montserrat', sans-serif; background: #0a0a0a; color: #fff; overflow-x: hidden; }
              .studio-hero { height: 100vh; background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4); background-size: 400% 400%; animation: gradientShift 10s ease infinite; position: relative; }
              @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
              .studio-nav { display: flex; justify-content: space-between; align-items: center; padding: 30px 50px; position: absolute; top: 0; left: 0; right: 0; z-index: 100; }
              .studio-logo { font-size: 28px; font-weight: 700; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
              .studio-menu { display: flex; gap: 40px; }
              .studio-menu a { color: white; text-decoration: none; font-weight: 500; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); transition: all 0.3s; }
              .studio-menu a:hover { transform: translateY(-2px); }
              .hero-visual { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
              .floating-shapes { position: absolute; top: -100px; left: -100px; right: -100px; bottom: -100px; }
              .shape { position: absolute; border-radius: 50%; opacity: 0.1; animation: float 6s ease-in-out infinite; }
              .shape-1 { width: 200px; height: 200px; background: white; top: 20%; left: 10%; animation-delay: 0s; }
              .shape-2 { width: 150px; height: 150px; background: white; top: 60%; right: 20%; animation-delay: 2s; }
              .shape-3 { width: 100px; height: 100px; background: white; bottom: 30%; left: 30%; animation-delay: 4s; }
              @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(180deg); } }
              .hero-visual h1 { font-size: 5rem; font-weight: 300; margin-bottom: 20px; text-shadow: 3px 3px 6px rgba(0,0,0,0.3); }
              .hero-visual p { font-size: 1.8rem; opacity: 0.9; }
              .work-showcase { padding: 120px 0; background: #1a1a1a; }
              .showcase-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
              .showcase-container h2 { text-align: center; font-size: 3.5rem; margin-bottom: 80px; color: #fff; font-weight: 300; }
              .work-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 50px; }
              .work-item { background: #2a2a2a; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.3); transition: all 0.4s; }
              .work-item:hover { transform: translateY(-15px) scale(1.02); box-shadow: 0 25px 50px rgba(0,0,0,0.4); }
              .work-image { height: 300px; position: relative; }
              .work-1 { background: linear-gradient(135deg, #667eea, #764ba2); }
              .work-2 { background: linear-gradient(135deg, #f093fb, #f5576c); }
              .work-3 { background: linear-gradient(135deg, #4facfe, #00f2fe); }
              .work-item h3 { padding: 25px 25px 10px; font-size: 1.8rem; color: #fff; font-weight: 400; }
              .work-item p { padding: 0 25px 25px; color: #ccc; font-size: 1.1rem; }
            `,
            template_id: 3,
            is_published: true
          },
          {
            user_id: 5,
            title: 'Business Solutions',
            slug: 'business-solutions',
            html_content: `
              <div class="business-hero">
                <nav class="business-nav">
                  <div class="business-logo">Business Solutions Inc.</div>
                  <div class="business-menu">
                    <a href="#services">Services</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                  </div>
                </nav>
                <div class="hero-content">
                  <h1>Your Trusted Business Partner</h1>
                  <p>Empowering businesses with innovative solutions</p>
                  <div class="cta-buttons">
                    <button class="btn-primary">Get Started</button>
                    <button class="btn-secondary">Learn More</button>
                  </div>
                </div>
                <div class="hero-stats">
                  <div class="stat">
                    <div class="stat-number">500+</div>
                    <div class="stat-label">Clients Served</div>
                  </div>
                  <div class="stat">
                    <div class="stat-number">15</div>
                    <div class="stat-label">Years Experience</div>
                  </div>
                  <div class="stat">
                    <div class="stat-number">99%</div>
                    <div class="stat-label">Success Rate</div>
                  </div>
                </div>
              </div>
              <section class="services-section">
                <div class="services-container">
                  <h2>Our Services</h2>
                  <div class="services-grid">
                    <div class="service-card">
                      <div class="service-icon">📊</div>
                      <h3>Business Consulting</h3>
                      <p>Strategic guidance to grow your business</p>
                    </div>
                    <div class="service-card">
                      <div class="service-icon">💼</div>
                      <h3>Project Management</h3>
                      <p>Efficient project delivery and management</p>
                    </div>
                    <div class="service-card">
                      <div class="service-icon">📈</div>
                      <h3>Growth Strategy</h3>
                      <p>Data-driven strategies for business growth</p>
                    </div>
                  </div>
                </div>
              </section>
            `,
            css_content: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Roboto', sans-serif; background: #f8f9fa; color: #333; }
              .business-hero { height: 100vh; background: linear-gradient(135deg, #34495e, #2c3e50); position: relative; overflow: hidden; }
              .business-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; position: absolute; top: 0; left: 0; right: 0; z-index: 100; }
              .business-logo { font-size: 24px; font-weight: 700; color: #ecf0f1; }
              .business-menu { display: flex; gap: 30px; }
              .business-menu a { color: #bdc3c7; text-decoration: none; font-weight: 500; transition: color 0.3s; }
              .business-menu a:hover { color: #3498db; }
              .hero-content { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; }
              .hero-content h1 { font-size: 4rem; font-weight: 700; margin-bottom: 20px; }
              .hero-content p { font-size: 1.5rem; margin-bottom: 40px; opacity: 0.9; }
              .cta-buttons { display: flex; gap: 20px; justify-content: center; margin-bottom: 60px; }
              .btn-primary, .btn-secondary { padding: 15px 30px; border: none; border-radius: 50px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
              .btn-primary { background: #3498db; color: white; }
              .btn-secondary { background: transparent; color: white; border: 2px solid white; }
              .btn-primary:hover { background: #2980b9; transform: translateY(-2px); }
              .btn-secondary:hover { background: white; color: #34495e; }
              .hero-stats { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); display: flex; gap: 60px; }
              .stat { text-align: center; color: white; }
              .stat-number { font-size: 2.5rem; font-weight: 700; color: #3498db; }
              .stat-label { font-size: 1rem; opacity: 0.8; }
              .services-section { padding: 100px 0; background: white; }
              .services-container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
              .services-container h2 { text-align: center; font-size: 3rem; margin-bottom: 60px; color: #2c3e50; }
              .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
              .service-card { background: #f8f9fa; padding: 40px; border-radius: 15px; text-align: center; border: 1px solid #e9ecef; transition: all 0.3s; }
              .service-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
              .service-icon { font-size: 3rem; margin-bottom: 20px; }
              .service-card h3 { font-size: 1.5rem; margin-bottom: 15px; color: #2c3e50; }
              .service-card p { color: #666; line-height: 1.6; }
            `,
            template_id: 2,
            is_published: false
          }
        ];

        for (const website of websites) {
          await connection.promise().execute(
            `INSERT INTO websites (user_id, title, slug, html_content, css_content, template_id, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [website.user_id, website.title, website.slug, website.html_content, website.css_content, website.template_id, website.is_published]
          );
        }
        console.log(`✅ Seeded ${websites.length} websites`);
      } else {
        console.log(`ℹ️  Websites table already has data, skipping`);
      }

      // Seed plans
      if (!(await this.tableHasData('plans'))) {
        const plans = [
          {
            name: 'Free',
            type: 'free',
            price: 0.00,
            features: '3 websites max, 200 AI chat messages',
            website_limit: 3,
            ai_chat_limit: 200
          },
          {
            name: 'Monthly',
            type: 'monthly',
            price: 9.99,
            features: 'Unlimited websites, Unlimited AI chat',
            website_limit: null,
            ai_chat_limit: null
          },
          {
            name: 'Yearly',
            type: 'yearly',
            price: 99.00,
            features: 'Unlimited websites, Unlimited AI chat, Premium features',
            website_limit: null,
            ai_chat_limit: null
          }
        ];

        for (const plan of plans) {
          await connection.promise().execute(
            `INSERT INTO plans (name, type, price, features, website_limit, ai_chat_limit) VALUES (?, ?, ?, ?, ?, ?)`,
            [plan.name, plan.type, plan.price, plan.features, plan.website_limit, plan.ai_chat_limit]
          );
        }
        console.log(`✅ Seeded ${plans.length} plans`);
      } else {
        console.log(`ℹ️  Plans table already has data, skipping`);
      }

      // Seed subscription logs
      if (!(await this.tableHasData('subscription_logs'))) {
        const subscriptionLogs = [
          {
            user_id: 1,
            plan_id: 1,
            action: 'created',
            payment_status: 'completed',
            amount: 0.00,
            payment_reference: 'FREE_PLAN_ASSIGNED'
          },
          {
            user_id: 2,
            plan_id: 2,
            action: 'created',
            payment_status: 'completed',
            amount: 9.99,
            payment_reference: 'TXN_MONTHLY_001'
          }
        ];

        for (const log of subscriptionLogs) {
          await connection.promise().execute(
            `INSERT INTO subscription_logs (user_id, plan_id, action, payment_status, amount, payment_reference) VALUES (?, ?, ?, ?, ?, ?)`,
            [log.user_id, log.plan_id, log.action, log.payment_status, log.amount, log.payment_reference]
          );
        }
        console.log(`✅ Seeded ${subscriptionLogs.length} subscription logs`);
      } else {
        console.log(`ℹ️  Subscription logs table already has data, skipping`);
      }

      // Seed payment transactions
      if (!(await this.tableHasData('payment_transactions'))) {
        const transactions = [
          {
            user_id: 2,
            plan_id: 2,
            amount: 9.99,
            status: 'completed',
            transaction_reference: 'TXN_MONTHLY_001'
          }
        ];

        for (const transaction of transactions) {
          await connection.promise().execute(
            `INSERT INTO payment_transactions (user_id, plan_id, amount, status, transaction_reference) VALUES (?, ?, ?, ?, ?)`,
            [transaction.user_id, transaction.plan_id, transaction.amount, transaction.status, transaction.transaction_reference]
          );
        }
        console.log(`✅ Seeded ${transactions.length} payment transactions`);
      } else {
        console.log(`ℹ️  Payment transactions table already has data, skipping`);
      }

      // Seed feedback
      if (!(await this.tableHasData('feedback'))) {
        const feedback = [
          {
            user_id: 1,
            type: 'bug',
            message: 'The drag and drop feature is not working properly on mobile devices.',
            priority: 'high',
            status: 'open'
          },
          {
            user_id: 2,
            type: 'feature',
            message: 'It would be great to have more color themes for the templates.',
            priority: 'medium',
            status: 'assigned',
            assigned_to: 3
          },
          {
            user_id: 4,
            type: 'improvement',
            message: 'The preview mode could be faster when switching between desktop and mobile views.',
            priority: 'low',
            status: 'responded',
            response: 'Thank you for the feedback. We are working on optimizing the preview performance.'
          },
          {
            user_id: 5,
            type: 'general',
            message: 'Love the platform! Great job on the recent updates.',
            priority: 'low',
            status: 'closed',
            response: 'Thank you for your kind words!'
          },
          {
            user_id: 1,
            type: 'bug',
            message: 'Images are not uploading correctly in the gallery section.',
            priority: 'high',
            status: 'open'
          }
        ];

        for (const item of feedback) {
          await connection.promise().execute(
            `INSERT INTO feedback (user_id, type, message, priority, status, assigned_to, response) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [item.user_id, item.type, item.message, item.priority, item.status, item.assigned_to || null, item.response || null]
          );
        }
        console.log(`✅ Seeded ${feedback.length} feedback items`);
      } else {
        console.log(`ℹ️  Feedback table already has data, skipping`);
      }

      // Seed forum categories
      if (!(await this.tableHasData('forum_categories'))) {
        const categories = [
          {
            name: 'General Discussion',
            description: 'General discussions about the platform',
            icon: '💬',
            color: '#3498db',
            thread_count: 0
          },
          {
            name: 'Feature Requests',
            description: 'Suggest new features and improvements',
            icon: '💡',
            color: '#e74c3c',
            thread_count: 0
          },
          {
            name: 'Bug Reports',
            description: 'Report bugs and issues',
            icon: '🐛',
            color: '#f39c12',
            thread_count: 0
          }
        ];

        for (const category of categories) {
          await connection.promise().execute(
            `INSERT INTO forum_categories (name, description, icon, color, thread_count) VALUES (?, ?, ?, ?, ?)`,
            [category.name, category.description, category.icon, category.color, category.thread_count]
          );
        }
        console.log(`✅ Seeded ${categories.length} forum categories`);
      } else {
        console.log(`ℹ️  Forum categories table already has data, skipping`);
      }

      // Seed forum threads
      if (!(await this.tableHasData('forum_threads'))) {
        const threads = [
          {
            category_id: 1,
            author_id: 1,
            title: 'Welcome to the community!',
            content: 'Hello everyone! Excited to be part of this community. Looking forward to sharing ideas and learning from others.',
            views: 25,
            replies_count: 3,
            likes: 5,
            is_pinned: true
          },
          {
            category_id: 2,
            author_id: 2,
            title: 'Dark mode theme request',
            content: 'Would love to see a dark mode theme option for the website builder interface. It would be easier on the eyes during long editing sessions.',
            views: 18,
            replies_count: 2,
            likes: 8,
            is_pinned: false
          },
          {
            category_id: 3,
            author_id: 4,
            title: 'Mobile responsiveness issue',
            content: 'I noticed that some templates don\'t display correctly on mobile devices. The layout seems to break on smaller screens.',
            views: 12,
            replies_count: 1,
            likes: 2,
            is_pinned: false
          },
          {
            category_id: 1,
            author_id: 5,
            title: 'Best practices for SEO',
            content: 'What are some best practices for optimizing websites built with this platform for search engines?',
            views: 31,
            replies_count: 4,
            likes: 6,
            is_pinned: false
          },
          {
            category_id: 2,
            author_id: 1,
            title: 'Custom CSS editor feature',
            content: 'It would be amazing to have a custom CSS editor where users can add their own styles without affecting the template structure.',
            views: 22,
            replies_count: 3,
            likes: 9,
            is_pinned: false
          }
        ];

        for (const thread of threads) {
          await connection.promise().execute(
            `INSERT INTO forum_threads (category_id, author_id, title, content, views, replies_count, likes, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [thread.category_id, thread.author_id, thread.title, thread.content, thread.views, thread.replies_count, thread.likes, thread.is_pinned]
          );
        }
        console.log(`✅ Seeded ${threads.length} forum threads`);
      } else {
        console.log(`ℹ️  Forum threads table already has data, skipping`);
      }

      // Seed forum replies
      if (!(await this.tableHasData('forum_replies'))) {
        // Get the actual thread IDs that were created
        const [threadRows] = await connection.promise().execute('SELECT id FROM forum_threads ORDER BY id ASC');
        const threadIds = threadRows.map(row => row.id);
        
        const replies = [
          {
            thread_id: threadIds[0], // Welcome thread
            author_id: 2,
            content: 'Welcome! Great to have you here. Looking forward to seeing your projects!',
            likes: 2
          },
          {
            thread_id: threadIds[0], // Welcome thread
            author_id: 3,
            content: 'Welcome to the community! Feel free to ask any questions.',
            likes: 1
          },
          {
            thread_id: threadIds[0], // Welcome thread
            author_id: 4,
            content: 'Thanks for the warm welcome everyone!',
            likes: 0
          },
          {
            thread_id: threadIds[1], // Dark mode thread
            author_id: 3,
            content: 'Great suggestion! Dark mode is definitely on our roadmap. We\'ll prioritize this feature.',
            likes: 5
          },
          {
            thread_id: threadIds[1], // Dark mode thread
            author_id: 1,
            content: 'I second this request! Dark mode would be perfect for late-night editing sessions.',
            likes: 3
          },
          {
            thread_id: threadIds[2], // Mobile responsiveness thread
            author_id: 3,
            content: 'Thanks for reporting this. We\'re investigating the mobile responsiveness issues and will fix them in the next update.',
            likes: 2
          },
          {
            thread_id: threadIds[3], // SEO thread
            author_id: 3,
            content: 'For SEO optimization, make sure to use descriptive titles, meta descriptions, and alt text for images.',
            likes: 4
          },
          {
            thread_id: threadIds[3], // SEO thread
            author_id: 2,
            content: 'Also consider using semantic HTML structure and optimizing your content for relevant keywords.',
            likes: 2
          },
          {
            thread_id: threadIds[3], // SEO thread
            author_id: 1,
            content: 'Don\'t forget about page loading speed - compress images and minimize CSS/JS files.',
            likes: 3
          },
          {
            thread_id: threadIds[3], // SEO thread
            author_id: 5,
            content: 'Thanks for all the great tips! This is really helpful.',
            likes: 1
          }
        ];

        for (const reply of replies) {
          await connection.promise().execute(
            `INSERT INTO forum_replies (thread_id, author_id, content, likes) VALUES (?, ?, ?, ?)`,
            [reply.thread_id, reply.author_id, reply.content, reply.likes]
          );
        }
        console.log(`✅ Seeded ${replies.length} forum replies`);
      } else {
        console.log(`ℹ️  Forum replies table already has data, skipping`);
      }

      // Seed help categories
      if (!(await this.tableHasData('help_categories'))) {
        const helpCategories = [
          {
            name: 'Getting Started',
            description: 'Basic guides for new users',
            icon: '🚀'
          },
          {
            name: 'Website Builder',
            description: 'How to use the website builder',
            icon: '🛠️'
          },
          {
            name: 'Templates',
            description: 'Working with templates',
            icon: '📄'
          }
        ];

        for (const category of helpCategories) {
          await connection.promise().execute(
            `INSERT INTO help_categories (name, description, icon) VALUES (?, ?, ?)`,
            [category.name, category.description, category.icon]
          );
        }
        console.log(`✅ Seeded ${helpCategories.length} help categories`);
      } else {
        console.log(`ℹ️  Help categories table already has data, skipping`);
      }

      // Seed help articles
      if (!(await this.tableHasData('help_articles'))) {
        const articles = [
          {
            category_id: 1,
            title: 'How to create your first website',
            content: 'This guide will walk you through creating your first website using our platform. Start by selecting a template that matches your needs, then customize it with your content.',
            author_id: 3,
            views: 45,
            helpful_count: 12,
            not_helpful_count: 1,
            is_published: true
          },
          {
            category_id: 1,
            title: 'Account setup and verification',
            content: 'Learn how to set up your account and verify your email address to unlock all platform features.',
            author_id: 3,
            views: 32,
            helpful_count: 8,
            not_helpful_count: 0,
            is_published: true
          },
          {
            category_id: 2,
            title: 'Using the drag and drop editor',
            content: 'Master the drag and drop editor to easily customize your website layout and content.',
            author_id: 3,
            views: 67,
            helpful_count: 15,
            not_helpful_count: 2,
            is_published: true
          },
          {
            category_id: 2,
            title: 'Adding and managing images',
            content: 'Learn how to upload, organize, and optimize images for your website.',
            author_id: 3,
            views: 38,
            helpful_count: 10,
            not_helpful_count: 1,
            is_published: true
          },
          {
            category_id: 2,
            title: 'Customizing colors and fonts',
            content: 'Personalize your website by changing colors, fonts, and styling options.',
            author_id: 3,
            views: 29,
            helpful_count: 7,
            not_helpful_count: 0,
            is_published: true
          },
          {
            category_id: 3,
            title: 'Choosing the right template',
            content: 'Tips for selecting a template that best fits your business or personal needs.',
            author_id: 3,
            views: 41,
            helpful_count: 11,
            not_helpful_count: 1,
            is_published: true
          },
          {
            category_id: 3,
            title: 'Template customization best practices',
            content: 'Best practices for customizing templates while maintaining professional appearance.',
            author_id: 3,
            views: 23,
            helpful_count: 6,
            not_helpful_count: 0,
            is_published: true
          },
          {
            category_id: 1,
            title: 'Publishing your website',
            content: 'Step-by-step guide to publishing your website and making it live on the internet.',
            author_id: 3,
            views: 52,
            helpful_count: 14,
            not_helpful_count: 1,
            is_published: true
          }
        ];

        for (const article of articles) {
          await connection.promise().execute(
            `INSERT INTO help_articles (category_id, title, content, author_id, views, helpful_count, not_helpful_count, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [article.category_id, article.title, article.content, article.author_id, article.views, article.helpful_count, article.not_helpful_count, article.is_published]
          );
        }
        console.log(`✅ Seeded ${articles.length} help articles`);
      } else {
        console.log(`ℹ️  Help articles table already has data, skipping`);
      }

      // Seed support tickets
      if (!(await this.tableHasData('support_tickets'))) {
        const tickets = [
          {
            ticket_number: 'TICKET-001',
            user_id: 1,
            subject: 'Website not loading properly',
            description: 'My website is not loading correctly. The layout appears broken and some images are missing.',
            priority: 'high',
            status: 'open'
          },
          {
            ticket_number: 'TICKET-002',
            user_id: 2,
            subject: 'Account billing question',
            description: 'I have a question about my monthly billing. Can you help me understand the charges?',
            priority: 'medium',
            status: 'assigned',
            assigned_to: 3
          },
          {
            ticket_number: 'TICKET-003',
            user_id: 4,
            subject: 'Feature request: Export functionality',
            description: 'Would it be possible to add an export feature to download the website as HTML/CSS files?',
            priority: 'low',
            status: 'closed',
            resolution: 'Thank you for the suggestion. We have added this feature to our roadmap and will implement it in a future update.'
          }
        ];

        for (const ticket of tickets) {
          await connection.promise().execute(
            `INSERT INTO support_tickets (ticket_number, user_id, subject, description, priority, status, assigned_to, resolution) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [ticket.ticket_number, ticket.user_id, ticket.subject, ticket.description, ticket.priority, ticket.status, ticket.assigned_to || null, ticket.resolution || null]
          );
        }
        console.log(`✅ Seeded ${tickets.length} support tickets`);
      } else {
        console.log(`ℹ️  Support tickets table already has data, skipping`);
      }

      // Seed support messages
      if (!(await this.tableHasData('support_messages'))) {
        const messages = [
          {
            ticket_id: 1,
            sender_id: 1,
            sender_type: 'user',
            message: 'The website was working fine yesterday, but today it\'s completely broken. Can you please help?',
            is_internal: false
          },
          {
            ticket_id: 1,
            sender_id: 3,
            sender_type: 'admin',
            message: 'I\'m looking into this issue. Can you provide the URL of your website so I can investigate?',
            is_internal: false
          },
          {
            ticket_id: 2,
            sender_id: 2,
            sender_type: 'user',
            message: 'I was charged $19.99 this month but I only have the Pro plan which should be $9.99.',
            is_internal: false
          },
          {
            ticket_id: 2,
            sender_id: 3,
            sender_type: 'admin',
            message: 'I can see the issue in your account. It looks like you were upgraded to Business plan. Let me check the billing history.',
            is_internal: false
          },
          {
            ticket_id: 3,
            sender_id: 4,
            sender_type: 'user',
            message: 'This would be really useful for backing up my work and using it elsewhere.',
            is_internal: false
          }
        ];

        for (const message of messages) {
          await connection.promise().execute(
            `INSERT INTO support_messages (ticket_id, sender_id, sender_type, message, is_internal) VALUES (?, ?, ?, ?, ?)`,
            [message.ticket_id, message.sender_id, message.sender_type, message.message, message.is_internal]
          );
        }
        console.log(`✅ Seeded ${messages.length} support messages`);
      } else {
        console.log(`ℹ️  Support messages table already has data, skipping`);
      }

      // Seed activity logs
      if (!(await this.tableHasData('activity_logs'))) {
        const activities = [
          {
            user_id: 1,
            action: 'website_created',
            entity_type: 'website',
            entity_id: 1,
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            details: JSON.stringify({ template_id: 1, title: 'John\'s Portfolio' })
          },
          {
            user_id: 2,
            action: 'website_published',
            entity_type: 'website',
            entity_id: 2,
            ip_address: '192.168.1.101',
            user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            details: JSON.stringify({ slug: 'jane-art-gallery' })
          },
          {
            user_id: 3,
            action: 'admin_login',
            entity_type: 'user',
            entity_id: 3,
            ip_address: '192.168.1.102',
            user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            details: JSON.stringify({ login_method: 'password' })
          },
          {
            user_id: 4,
            action: 'feedback_submitted',
            entity_type: 'feedback',
            entity_id: 1,
            ip_address: '192.168.1.103',
            user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
            details: JSON.stringify({ type: 'bug', priority: 'high' })
          },
          {
            user_id: 5,
            action: 'forum_thread_created',
            entity_type: 'forum_thread',
            entity_id: 1,
            ip_address: '192.168.1.104',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            details: JSON.stringify({ category_id: 1, title: 'Welcome to the community!' })
          }
        ];

        for (const activity of activities) {
          await connection.promise().execute(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [activity.user_id, activity.action, activity.entity_type, activity.entity_id, activity.ip_address, activity.user_agent, activity.details]
          );
        }
        console.log(`✅ Seeded ${activities.length} activity logs`);
      } else {
        console.log(`ℹ️  Activity logs table already has data, skipping`);
      }

      // Seed system settings
      if (!(await this.tableHasData('system_settings'))) {
        const settings = [
          {
            setting_key: 'email_config',
            setting_value: JSON.stringify({
              smtp_host: 'smtp.gmail.com',
              smtp_port: 587,
              smtp_user: 'noreply@webeenthere.com',
              smtp_secure: false
            }),
            updated_by: 3
          },
          {
            setting_key: 'feature_flags',
            setting_value: JSON.stringify({
              dark_mode: true,
              custom_css: false,
              analytics: true,
              export_feature: false
            }),
            updated_by: 3
          },
          {
            setting_key: 'site_settings',
            setting_value: JSON.stringify({
              site_name: 'Webeenthere',
              site_description: 'Build beautiful websites easily',
              maintenance_mode: false,
              registration_enabled: true
            }),
            updated_by: 3
          },
          {
            setting_key: 'notification_settings',
            setting_value: JSON.stringify({
              email_notifications: true,
              push_notifications: false,
              weekly_digest: true,
              marketing_emails: false
            }),
            updated_by: 3
          }
        ];

        for (const setting of settings) {
          await connection.promise().execute(
            `INSERT INTO system_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)`,
            [setting.setting_key, setting.setting_value, setting.updated_by]
          );
        }
        console.log(`✅ Seeded ${settings.length} system settings`);
      } else {
        console.log(`ℹ️  System settings table already has data, skipping`);
      }

    } finally {
      connection.end();
    }
  }

  // Initialize database - main method
  async initialize() {
    try {
      console.log('🚀 Starting database initialization...');
      
      // Check if database exists
      const dbExists = await this.databaseExists();
      if (!dbExists) {
        console.log(`📦 Creating database '${this.dbName}'...`);
        await this.createDatabase();
      } else {
        console.log(`ℹ️  Database '${this.dbName}' already exists`);
      }

      // Create tables
      console.log('📋 Creating tables...');
      await this.createTables();

      // Seed dummy data
      console.log('🌱 Seeding dummy data...');
      await this.seedDummyData();

      console.log('✅ Database initialization completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return false;
    }
  }

  // Check database status
  async getStatus() {
    try {
      const dbExists = await this.databaseExists();
      
      if (!dbExists) {
        // If database doesn't exist, return status without checking tables
        return {
          database: false,
          tables: {
            users: { exists: false, hasData: false },
            templates: { exists: false, hasData: false },
            websites: { exists: false, hasData: false },
            plans: { exists: false, hasData: false },
            feedback: { exists: false, hasData: false },
            feedback_responses: { exists: false, hasData: false },
            forum_categories: { exists: false, hasData: false },
            forum_threads: { exists: false, hasData: false },
            forum_replies: { exists: false, hasData: false },
            help_categories: { exists: false, hasData: false },
            help_articles: { exists: false, hasData: false },
            support_tickets: { exists: false, hasData: false },
            support_messages: { exists: false, hasData: false },
            activity_logs: { exists: false, hasData: false },
            system_settings: { exists: false, hasData: false }
          }
        };
      }

      // Database exists, now check tables
      const connection = await this.createConnectionWithDB();
      
      const tables = ['users', 'templates', 'websites', 'plans', 'feedback', 'feedback_responses', 'forum_categories', 'forum_threads', 'forum_replies', 'help_categories', 'help_articles', 'support_tickets', 'support_messages', 'activity_logs', 'system_settings'];
      const status = {
        database: dbExists,
        tables: {}
      };

      for (const table of tables) {
        const exists = await this.tableExists(table);
        let hasData = false;
        if (exists) {
          hasData = await this.tableHasData(table);
        }
        status.tables[table] = { exists, hasData };
      }

      connection.end();
      return status;
    } catch (error) {
      console.error('Error getting database status:', error);
      return null;
    }
  }
}

module.exports = DatabaseORM;


