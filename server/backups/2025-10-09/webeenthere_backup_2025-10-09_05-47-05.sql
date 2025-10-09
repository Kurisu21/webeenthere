-- Webeenthere Database Backup
-- Generated: 2025-10-09T05:47:05.720Z
-- Database: webeenthere

SET FOREIGN_KEY_CHECKS = 0;

-- Table: ai_prompts
DROP TABLE IF EXISTS `ai_prompts`;
CREATE TABLE `ai_prompts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `prompt_type` enum('title','hero','about','full') NOT NULL,
  `prompt_text` text NOT NULL,
  `response_html` longtext DEFAULT NULL,
  `used_on_site` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ai_prompts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: custom_blocks
DROP TABLE IF EXISTS `custom_blocks`;
CREATE TABLE `custom_blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `block_type` varchar(50) DEFAULT NULL,
  `html_content` longtext DEFAULT NULL,
  `css_content` longtext DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `custom_blocks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: media_assets
DROP TABLE IF EXISTS `media_assets`;
CREATE TABLE `media_assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `website_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_url` text NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `website_id` (`website_id`),
  CONSTRAINT `media_assets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `media_assets_ibfk_2` FOREIGN KEY (`website_id`) REFERENCES `websites` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: plans
DROP TABLE IF EXISTS `plans`;
CREATE TABLE `plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `features` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `plans` (`id`, `name`, `price`, `features`, `is_active`, `created_at`) VALUES
(1, 'Free', '0.00', '1 website, Basic templates, 100MB storage', 1, Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time)),
(2, 'Pro', '9.99', '5 websites, All templates, 1GB storage, Custom domain', 1, Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time)),
(3, 'Business', '19.99', 'Unlimited websites, Premium templates, 10GB storage, Custom domain, Analytics', 1, Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time));

-- Table: templates
DROP TABLE IF EXISTS `templates`;
CREATE TABLE `templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `html_base` longtext DEFAULT NULL,
  `css_base` longtext DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `templates` (`id`, `name`, `description`, `category`, `html_base`, `css_base`, `is_featured`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Modern Portfolio', 'Clean and modern portfolio template perfect for designers and developers', 'portfolio', '<div class="hero-section"><h1>Welcome to My Portfolio</h1><p>I create amazing digital experiences</p></div>', '.hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }', 1, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time)),
(2, 'Business Landing', 'Professional business landing page template', 'business', '<div class="business-hero"><h1>Your Business Solution</h1><p>We help businesses grow</p></div>', '.business-hero { background: #2c3e50; color: white; padding: 80px 0; text-align: center; }', 1, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time)),
(3, 'Creative Artist', 'Bold and creative template for artists and creatives', 'creative', '<div class="creative-showcase"><h1>My Creative World</h1><p>Explore my artistic journey</p></div>', '.creative-showcase { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 120px 0; text-align: center; }', 0, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time)),
(4, 'Minimal Blog', 'Simple and elegant blog template', 'blog', '<div class="blog-header"><h1>My Thoughts</h1><p>Sharing ideas and experiences</p></div>', '.blog-header { background: #f8f9fa; color: #333; padding: 60px 0; text-align: center; border-bottom: 1px solid #dee2e6; }', 0, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time)),
(5, 'Restaurant Menu', 'Appetizing template for restaurants and food businesses', 'restaurant', '<div class="restaurant-banner"><h1>Delicious Dining</h1><p>Experience our culinary excellence</p></div>', '.restaurant-banner { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("food-bg.jpg"); color: white; padding: 100px 0; text-align: center; }', 1, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time));

-- Table: user_plan
DROP TABLE IF EXISTS `user_plan`;
CREATE TABLE `user_plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `auto_renew` tinyint(1) DEFAULT 1,
  `payment_reference` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `user_plan_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_plan_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `theme_mode` enum('light','dark') DEFAULT 'light',
  `is_verified` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `profile_image`, `role`, `theme_mode`, `is_verified`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'john_doe', 'john@example.com', '$2a$10$/osE6wYfqRC6X9dPvWM0KekDl5GQmrmKkYOphhb6U5XBTMoEiiO3G', NULL, 'user', 'light', 1, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time)),
(2, 'jane_smith', 'jane@example.com', '$2a$10$/osE6wYfqRC6X9dPvWM0KekDl5GQmrmKkYOphhb6U5XBTMoEiiO3G', NULL, 'user', 'dark', 1, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time)),
(3, 'admin_user', 'admin@webeenthere.com', '$2a$10$/osE6wYfqRC6X9dPvWM0KekDl5GQmrmKkYOphhb6U5XBTMoEiiO3G', NULL, 'admin', 'light', 1, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time)),
(4, 'artist_creative', 'artist@example.com', '$2a$10$/osE6wYfqRC6X9dPvWM0KekDl5GQmrmKkYOphhb6U5XBTMoEiiO3G', NULL, 'user', 'dark', 1, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time)),
(5, 'business_owner', 'business@example.com', '$2a$10$/osE6wYfqRC6X9dPvWM0KekDl5GQmrmKkYOphhb6U5XBTMoEiiO3G', NULL, 'user', 'light', 0, 1, Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:03 GMT+0800 (Philippine Standard Time));

-- Table: website_analytics
DROP TABLE IF EXISTS `website_analytics`;
CREATE TABLE `website_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `website_id` int(11) NOT NULL,
  `visit_time` datetime DEFAULT current_timestamp(),
  `visitor_ip` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `referrer` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `website_id` (`website_id`),
  CONSTRAINT `website_analytics_ibfk_1` FOREIGN KEY (`website_id`) REFERENCES `websites` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: websites
DROP TABLE IF EXISTS `websites`;
CREATE TABLE `websites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `html_content` longtext DEFAULT NULL,
  `css_content` longtext DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `user_id` (`user_id`),
  KEY `template_id` (`template_id`),
  CONSTRAINT `websites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `websites_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `websites` (`id`, `user_id`, `title`, `slug`, `html_content`, `css_content`, `template_id`, `is_published`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'John''s Portfolio', 'john-portfolio', '
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
                      <p>I''m a passionate developer with 5+ years of experience building web applications that solve real-world problems.</p>
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
                  <h2>Let''s Work Together</h2>
                  <p>Ready to bring your ideas to life?</p>
                  <button class="btn-primary">Contact Me</button>
                </div>
              </footer>
            ', '
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
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
              .scroll-arrow::after { content: ''''; position: absolute; bottom: 0; left: -4px; width: 10px; height: 10px; border-right: 2px solid white; border-bottom: 2px solid white; transform: rotate(45deg); }
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
            ', 1, 1, 1, Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time)),
(2, 2, 'Jane''s Art Gallery', 'jane-art-gallery', '
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
            ', '
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: ''Playfair Display'', serif; line-height: 1.6; color: #333; }
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
            ', 3, 1, 1, Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time)),
(3, 3, 'Admin Dashboard', 'admin-dashboard', '
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
            ', '
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; background: #1a1a1a; color: #fff; }
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
            ', 2, 0, 1, Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time)),
(4, 4, 'Creative Studio', 'creative-studio', '
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
            ', '
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: ''Montserrat'', sans-serif; background: #0a0a0a; color: #fff; overflow-x: hidden; }
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
            ', 3, 1, 1, Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time)),
(5, 5, 'Business Solutions', 'business-solutions', '
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
            ', '
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: ''Roboto'', sans-serif; background: #f8f9fa; color: #333; }
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
            ', 2, 0, 1, Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:12:04 GMT+0800 (Philippine Standard Time));

SET FOREIGN_KEY_CHECKS = 1;
