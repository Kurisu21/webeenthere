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
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
          user_agent TEXT,
          referrer TEXT,
          FOREIGN KEY (website_id) REFERENCES websites(id)
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
          price DECIMAL(10,2) NOT NULL,
          features TEXT,
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
    } finally {
      connection.end();
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
            price: 0.00,
            features: '1 website, Basic templates, 100MB storage'
          },
          {
            name: 'Pro',
            price: 9.99,
            features: '5 websites, All templates, 1GB storage, Custom domain'
          },
          {
            name: 'Business',
            price: 19.99,
            features: 'Unlimited websites, Premium templates, 10GB storage, Custom domain, Analytics'
          }
        ];

        for (const plan of plans) {
          await connection.promise().execute(
            `INSERT INTO plans (name, price, features) VALUES (?, ?, ?)`,
            [plan.name, plan.price, plan.features]
          );
        }
        console.log(`✅ Seeded ${plans.length} plans`);
      } else {
        console.log(`ℹ️  Plans table already has data, skipping`);
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
            plans: { exists: false, hasData: false }
          }
        };
      }

      // Database exists, now check tables
      const connection = await this.createConnectionWithDB();
      
      const tables = ['users', 'templates', 'websites', 'plans'];
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


