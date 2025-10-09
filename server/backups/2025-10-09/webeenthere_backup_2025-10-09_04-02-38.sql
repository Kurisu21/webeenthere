-- Webeenthere Database Backup
-- Generated: 2025-10-09T04:02:38.056Z
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
(1, 'Free', '0.00', '1 website, Basic templates, 100MB storage', 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(2, 'Pro', '9.99', '5 websites, All templates, 1GB storage, Custom domain', 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(3, 'Business', '19.99', 'Unlimited websites, Premium templates, 10GB storage, Custom domain, Analytics', 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time));

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
(1, 'Modern Portfolio', 'Clean and modern portfolio template perfect for designers and developers', 'portfolio', '<div class="hero-section"><h1>Welcome to My Portfolio</h1><p>I create amazing digital experiences</p></div>', '.hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }', 1, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(2, 'Business Landing', 'Professional business landing page template', 'business', '<div class="business-hero"><h1>Your Business Solution</h1><p>We help businesses grow</p></div>', '.business-hero { background: #2c3e50; color: white; padding: 80px 0; text-align: center; }', 1, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(3, 'Creative Artist', 'Bold and creative template for artists and creatives', 'creative', '<div class="creative-showcase"><h1>My Creative World</h1><p>Explore my artistic journey</p></div>', '.creative-showcase { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 120px 0; text-align: center; }', 0, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(4, 'Minimal Blog', 'Simple and elegant blog template', 'blog', '<div class="blog-header"><h1>My Thoughts</h1><p>Sharing ideas and experiences</p></div>', '.blog-header { background: #f8f9fa; color: #333; padding: 60px 0; text-align: center; border-bottom: 1px solid #dee2e6; }', 0, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(5, 'Restaurant Menu', 'Appetizing template for restaurants and food businesses', 'restaurant', '<div class="restaurant-banner"><h1>Delicious Dining</h1><p>Experience our culinary excellence</p></div>', '.restaurant-banner { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("food-bg.jpg"); color: white; padding: 100px 0; text-align: center; }', 1, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time));

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
(1, 'john_doe', 'john@example.com', '$2a$10$NJr4OZw6z/1giZD6nX1QL.nO0Z8WkGkIxUIpBYH61gzkX62guzy1.', NULL, 'user', 'light', 1, 1, Thu Oct 09 2025 12:02:36 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:36 GMT+0800 (Philippine Standard Time)),
(2, 'jane_smith', 'jane@example.com', '$2a$10$NJr4OZw6z/1giZD6nX1QL.nO0Z8WkGkIxUIpBYH61gzkX62guzy1.', NULL, 'user', 'dark', 1, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(3, 'admin_user', 'admin@webeenthere.com', '$2a$10$NJr4OZw6z/1giZD6nX1QL.nO0Z8WkGkIxUIpBYH61gzkX62guzy1.', NULL, 'admin', 'light', 1, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(4, 'artist_creative', 'artist@example.com', '$2a$10$NJr4OZw6z/1giZD6nX1QL.nO0Z8WkGkIxUIpBYH61gzkX62guzy1.', NULL, 'user', 'dark', 1, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(5, 'business_owner', 'business@example.com', '$2a$10$NJr4OZw6z/1giZD6nX1QL.nO0Z8WkGkIxUIpBYH61gzkX62guzy1.', NULL, 'user', 'light', 0, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time));

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `websites` (`id`, `user_id`, `title`, `slug`, `html_content`, `css_content`, `template_id`, `is_published`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'John Doe - Full-Stack Developer Portfolio', 'john-portfolio', '{"sections":[{"id":"hero-section","type":"hero","title":"Hero Section","elements":[{"id":"nav-brand","type":"text","content":"John Doe","styles":{"fontSize":"28px","fontWeight":"700","color":"#ffffff","textAlign":"left","fontFamily":"Inter, sans-serif"},"position":{"x":50,"y":30},"size":{"width":200,"height":40}},{"id":"nav-links","type":"text","content":"About Skills Projects Testimonials Contact","styles":{"fontSize":"16px","fontWeight":"500","color":"#ffffff","textAlign":"right","fontFamily":"Inter, sans-serif"},"position":{"x":800,"y":35},"size":{"width":400,"height":30}},{"id":"hero-badge","type":"text","content":"Available for Work","styles":{"fontSize":"14px","fontWeight":"600","color":"#ffffff","backgroundColor":"rgba(255,255,255,0.2)","padding":"8px 16px","borderRadius":"20px","textAlign":"center","fontFamily":"Inter, sans-serif"},"position":{"x":500,"y":200},"size":{"width":200,"height":40}},{"id":"hero-title","type":"text","content":"Full-Stack Developer","styles":{"fontSize":"64px","fontWeight":"700","color":"#ffffff","textAlign":"center","fontFamily":"Inter, sans-serif","lineHeight":"1.2"},"position":{"x":200,"y":280},"size":{"width":800,"height":80}},{"id":"hero-subtitle","type":"text","content":"Crafting exceptional digital experiences with modern technologies","styles":{"fontSize":"20px","fontWeight":"400","color":"#ffffff","textAlign":"center","fontFamily":"Inter, sans-serif","opacity":"0.9"},"position":{"x":300,"y":380},"size":{"width":600,"height":30}},{"id":"stat-1","type":"text","content":"5+ Years Experience","styles":{"fontSize":"16px","fontWeight":"500","color":"#ffffff","textAlign":"center","fontFamily":"Inter, sans-serif"},"position":{"x":200,"y":450},"size":{"width":200,"height":40}},{"id":"stat-2","type":"text","content":"50+ Projects Completed","styles":{"fontSize":"16px","fontWeight":"500","color":"#ffffff","textAlign":"center","fontFamily":"Inter, sans-serif"},"position":{"x":450,"y":450},"size":{"width":200,"height":40}},{"id":"stat-3","type":"text","content":"100% Client Satisfaction","styles":{"fontSize":"16px","fontWeight":"500","color":"#ffffff","textAlign":"center","fontFamily":"Inter, sans-serif"},"position":{"x":700,"y":450},"size":{"width":200,"height":40}},{"id":"btn-primary","type":"button","content":"View My Work","styles":{"fontSize":"16px","fontWeight":"600","color":"#667eea","backgroundColor":"#ffffff","padding":"15px 30px","borderRadius":"50px","textAlign":"center","fontFamily":"Inter, sans-serif","cursor":"pointer","border":"none"},"position":{"x":400,"y":520},"size":{"width":180,"height":50}},{"id":"btn-secondary","type":"button","content":"Download CV","styles":{"fontSize":"16px","fontWeight":"600","color":"#ffffff","backgroundColor":"transparent","padding":"15px 30px","borderRadius":"50px","textAlign":"center","fontFamily":"Inter, sans-serif","cursor":"pointer","border":"2px solid #ffffff"},"position":{"x":620,"y":520},"size":{"width":180,"height":50}}],"styles":{"background":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","textColor":"#ffffff","padding":"0","textAlign":"center","position":"relative","overflow":"hidden","minHeight":"100vh"},"settings":{"isVisible":true,"isFullWidth":true,"animation":{"type":"fadeIn","duration":1000,"delay":0}},"order":0},{"id":"about-section","type":"about","title":"About Section","elements":[{"id":"about-title","type":"text","content":"About Me","styles":{"fontSize":"48px","fontWeight":"700","color":"#333333","textAlign":"center","fontFamily":"Inter, sans-serif","lineHeight":"1.2"},"position":{"x":400,"y":100},"size":{"width":400,"height":60}},{"id":"about-text-1","type":"text","content":"I''m a passionate developer with 5+ years of experience building web applications that solve real-world problems.","styles":{"fontSize":"18px","fontWeight":"400","color":"#666666","textAlign":"center","fontFamily":"Inter, sans-serif","lineHeight":"1.6"},"position":{"x":200,"y":200},"size":{"width":800,"height":60}},{"id":"about-text-2","type":"text","content":"Specializing in React, Node.js, and modern web technologies.","styles":{"fontSize":"18px","fontWeight":"400","color":"#666666","textAlign":"center","fontFamily":"Inter, sans-serif","lineHeight":"1.6"},"position":{"x":200,"y":280},"size":{"width":800,"height":60}},{"id":"skill-react","type":"text","content":"React","styles":{"fontSize":"16px","fontWeight":"600","color":"#667eea","backgroundColor":"rgba(102, 126, 234, 0.1)","padding":"12px 24px","borderRadius":"25px","textAlign":"center","fontFamily":"Inter, sans-serif"},"position":{"x":300,"y":380},"size":{"width":120,"height":50}},{"id":"skill-node","type":"text","content":"Node.js","styles":{"fontSize":"16px","fontWeight":"600","color":"#667eea","backgroundColor":"rgba(102, 126, 234, 0.1)","padding":"12px 24px","borderRadius":"25px","textAlign":"center","fontFamily":"Inter, sans-serif"},"position":{"x":450,"y":380},"size":{"width":120,"height":50}},{"id":"skill-typescript","type":"text","content":"TypeScript","styles":{"fontSize":"16px","fontWeight":"600","color":"#667eea","backgroundColor":"rgba(102, 126, 234, 0.1)","padding":"12px 24px","borderRadius":"25px","textAlign":"center","fontFamily":"Inter, sans-serif"},"position":{"x":600,"y":380},"size":{"width":120,"height":50}},{"id":"skill-mongodb","type":"text","content":"MongoDB","styles":{"fontSize":"16px","fontWeight":"600","color":"#667eea","backgroundColor":"rgba(102, 126, 234, 0.1)","padding":"12px 24px","borderRadius":"25px","textAlign":"center","fontFamily":"Inter, sans-serif"},"position":{"x":750,"y":380},"size":{"width":120,"height":50}}],"styles":{"backgroundColor":"#f8f9fa","textColor":"#333333","padding":"80px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1200px"},"order":1},{"id":"projects-section","type":"portfolio","title":"Projects Section","content":"\n                    <div class=\"container\">\n                      <h2>Featured Projects</h2>\n                      <div class=\"projects-grid\">\n                        <div class=\"project-card\">\n                          <div class=\"project-image\"></div>\n                          <h3>E-Commerce Platform</h3>\n                          <p>Modern e-commerce solution with React and Node.js</p>\n                        </div>\n                        <div class=\"project-card\">\n                          <div class=\"project-image\"></div>\n                          <h3>Task Management App</h3>\n                          <p>Collaborative task management with real-time updates</p>\n                        </div>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#ffffff","textColor":"#333333","padding":"80px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1200px"},"order":2},{"id":"contact-section","type":"contact","title":"Contact Section","content":"\n                    <div class=\"container\">\n                      <h2>Let''s Work Together</h2>\n                      <p>Ready to bring your ideas to life?</p>\n                      <button class=\"btn-primary\">Contact Me</button>\n                    </div>\n                  ","styles":{"backgroundColor":"#2c3e50","textColor":"#ffffff","padding":"60px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":true},"order":3}],"globalStyles":{"fontFamily":"Inter, sans-serif","primaryColor":"#667eea","secondaryColor":"#764ba2","accentColor":"#e74c3c","backgroundColor":"#ffffff","textColor":"#333333","linkColor":"#667eea","borderRadius":"8px","spacing":"20px","breakpoints":{"mobile":"768px","tablet":"1024px","desktop":"1200px"}},"settings":{"theme":"light","layout":"full-width","headerStyle":"static","footerStyle":"minimal","navigationStyle":"horizontal","animations":true,"parallax":false,"lazyLoading":true},"seo":{"title":"John Doe - Full-Stack Developer Portfolio","description":"Experienced full-stack developer specializing in React, Node.js, and modern web technologies. Available for freelance projects and consulting.","keywords":["full-stack developer","react developer","node.js","web development","portfolio","freelance"],"robots":"index"},"description":"Professional portfolio showcasing full-stack development expertise and project experience"}', '
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
            ', 1, 1, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(2, 2, 'Jane''s Art Gallery', 'jane-art-gallery', '{"sections":[{"id":"gallery-hero","type":"hero","title":"Gallery Hero","content":"\n                    <nav class=\"gallery-nav\">\n                      <div class=\"logo\">Jane Smith</div>\n                      <div class=\"nav-menu\">\n                        <a href=\"#gallery\">Gallery</a>\n                        <a href=\"#about\">About</a>\n                        <a href=\"#contact\">Contact</a>\n                      </div>\n                    </nav>\n                    <div class=\"hero-text\">\n                      <h1>Digital Art Gallery</h1>\n                      <p>Where creativity meets technology</p>\n                      <button class=\"explore-btn\">Explore Collection</button>\n                    </div>\n                  ","styles":{"background":"linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)","backgroundSize":"400% 400%","textColor":"#ffffff","padding":"100px 20px","textAlign":"center","animation":"gradientShift 8s ease infinite"},"settings":{"isVisible":true,"isFullWidth":true,"animation":{"type":"fadeIn","duration":1500,"delay":0}},"order":0},{"id":"art-gallery","type":"gallery","title":"Featured Artworks","content":"\n                    <div class=\"gallery-container\">\n                      <h2>Featured Works</h2>\n                      <div class=\"art-grid\">\n                        <div class=\"art-piece\">\n                          <div class=\"art-image art-1\"></div>\n                          <h3>Digital Dreams</h3>\n                          <p>Mixed media digital art</p>\n                          <span class=\"price\">$2,500</span>\n                        </div>\n                        <div class=\"art-piece\">\n                          <div class=\"art-image art-2\"></div>\n                          <h3>Abstract Reality</h3>\n                          <p>Abstract digital painting</p>\n                          <span class=\"price\">$1,800</span>\n                        </div>\n                        <div class=\"art-piece\">\n                          <div class=\"art-image art-3\"></div>\n                          <h3>Color Symphony</h3>\n                          <p>Vibrant color exploration</p>\n                          <span class=\"price\">$3,200</span>\n                        </div>\n                        <div class=\"art-piece\">\n                          <div class=\"art-image art-4\"></div>\n                          <h3>Neon Dreams</h3>\n                          <p>Cyberpunk digital art</p>\n                          <span class=\"price\">$2,100</span>\n                        </div>\n                        <div class=\"art-piece\">\n                          <div class=\"art-image art-5\"></div>\n                          <h3>Cosmic Journey</h3>\n                          <p>Space-themed digital painting</p>\n                          <span class=\"price\">$2,800</span>\n                        </div>\n                        <div class=\"art-piece\">\n                          <div class=\"art-image art-6\"></div>\n                          <h3>Urban Poetry</h3>\n                          <p>Cityscape digital art</p>\n                          <span class=\"price\">$1,950</span>\n                        </div>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#f8f9fa","textColor":"#333333","padding":"120px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1400px"},"order":1},{"id":"artist-about","type":"about","title":"About the Artist","content":"\n                    <div class=\"about-container\">\n                      <div class=\"about-image\"></div>\n                      <div class=\"about-text\">\n                        <h2>About the Artist</h2>\n                        <p>Jane Smith is a digital artist passionate about exploring the intersection of technology and creativity. Her work combines traditional artistic principles with modern digital techniques.</p>\n                        <p>With over 8 years of experience in digital art, Jane has exhibited her work in galleries worldwide and has been featured in numerous art publications.</p>\n                        <div class=\"artist-stats\">\n                          <div class=\"stat\">\n                            <h3>50+</h3>\n                            <p>Exhibitions</p>\n                          </div>\n                          <div class=\"stat\">\n                            <h3>200+</h3>\n                            <p>Artworks Sold</p>\n                          </div>\n                          <div class=\"stat\">\n                            <h3>8+</h3>\n                            <p>Years Experience</p>\n                          </div>\n                        </div>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#ffffff","textColor":"#333333","padding":"120px 20px","textAlign":"left"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1200px"},"order":2},{"id":"gallery-footer","type":"contact","title":"Commission Work","content":"\n                    <div class=\"footer-content\">\n                      <h2>Commission Work</h2>\n                      <p>Available for custom digital art commissions and collaborations</p>\n                      <div class=\"contact-info\">\n                        <div class=\"contact-item\">\n                          <h3>📧 Email</h3>\n                          <p>jane@digitalartgallery.com</p>\n                        </div>\n                        <div class=\"contact-item\">\n                          <h3>📱 Phone</h3>\n                          <p>+1 (555) 987-6543</p>\n                        </div>\n                        <div class=\"contact-item\">\n                          <h3>📍 Studio</h3>\n                          <p>123 Art Street, Creative City</p>\n                        </div>\n                      </div>\n                      <button class=\"commission-btn\">Get Quote</button>\n                      <div class=\"social-links\">\n                        <a href=\"#\">Instagram</a>\n                        <a href=\"#\">Behance</a>\n                        <a href=\"#\">Dribbble</a>\n                        <a href=\"#\">Twitter</a>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#2c3e50","textColor":"#ffffff","padding":"100px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":true},"order":3}],"globalStyles":{"fontFamily":"Playfair Display, serif","primaryColor":"#ff6b6b","secondaryColor":"#4ecdc4","accentColor":"#45b7d1","backgroundColor":"#ffffff","textColor":"#333333","linkColor":"#ff6b6b","borderRadius":"20px","spacing":"30px","breakpoints":{"mobile":"768px","tablet":"1024px","desktop":"1400px"}},"settings":{"theme":"light","layout":"full-width","headerStyle":"static","footerStyle":"detailed","navigationStyle":"horizontal","animations":true,"parallax":true,"lazyLoading":true},"seo":{"title":"Jane''s Digital Art Gallery","description":"Contemporary digital art gallery featuring extraordinary artworks from emerging and established artists","keywords":["digital art","gallery","contemporary","artwork","artist","commission"],"robots":"index"},"description":"A premium digital art gallery showcasing contemporary artworks"}', '
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
            ', 3, 1, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
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
            ', 2, 0, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(4, 4, 'Creative Studio', 'creative-studio', '{"sections":[{"id":"studio-hero","type":"hero","title":"Creative Studio Hero","content":"\n                    <nav class=\"studio-nav\">\n                      <div class=\"studio-logo\">Creative Studio</div>\n                      <div class=\"studio-menu\">\n                        <a href=\"#work\">Work</a>\n                        <a href=\"#team\">Team</a>\n                        <a href=\"#services\">Services</a>\n                        <a href=\"#contact\">Contact</a>\n                      </div>\n                    </nav>\n                    <div class=\"hero-visual\">\n                      <div class=\"floating-shapes\">\n                        <div class=\"shape shape-1\"></div>\n                        <div class=\"shape shape-2\"></div>\n                        <div class=\"shape shape-3\"></div>\n                        <div class=\"shape shape-4\"></div>\n                        <div class=\"shape shape-5\"></div>\n                      </div>\n                      <h1>Where Art Meets Technology</h1>\n                      <p>We create digital experiences that inspire and transform businesses</p>\n                      <div class=\"hero-buttons\">\n                        <button class=\"btn-primary\">View Our Work</button>\n                        <button class=\"btn-secondary\">Start a Project</button>\n                      </div>\n                    </div>\n                  ","styles":{"background":"linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)","backgroundSize":"400% 400%","textColor":"#ffffff","padding":"100px 20px","textAlign":"center","position":"relative","overflow":"hidden","animation":"gradientShift 10s ease infinite"},"settings":{"isVisible":true,"isFullWidth":true,"animation":{"type":"fadeIn","duration":2000,"delay":0}},"order":0},{"id":"work-showcase","type":"portfolio","title":"Our Creative Work","content":"\n                    <div class=\"showcase-container\">\n                      <h2>Our Creative Work</h2>\n                      <p class=\"showcase-subtitle\">Crafting exceptional digital experiences that drive results</p>\n                      <div class=\"work-grid\">\n                        <div class=\"work-item\">\n                          <div class=\"work-image work-1\"></div>\n                          <div class=\"work-overlay\">\n                            <h3>Brand Identity</h3>\n                            <p>Complete visual identity design</p>\n                            <span class=\"work-category\">Branding</span>\n                          </div>\n                        </div>\n                        <div class=\"work-item\">\n                          <div class=\"work-image work-2\"></div>\n                          <div class=\"work-overlay\">\n                            <h3>Web Development</h3>\n                            <p>Modern responsive websites</p>\n                            <span class=\"work-category\">Development</span>\n                          </div>\n                        </div>\n                        <div class=\"work-item\">\n                          <div class=\"work-image work-3\"></div>\n                          <div class=\"work-overlay\">\n                            <h3>Mobile Apps</h3>\n                            <p>iOS and Android applications</p>\n                            <span class=\"work-category\">Mobile</span>\n                          </div>\n                        </div>\n                        <div class=\"work-item\">\n                          <div class=\"work-image work-4\"></div>\n                          <div class=\"work-overlay\">\n                            <h3>UI/UX Design</h3>\n                            <p>User-centered design solutions</p>\n                            <span class=\"work-category\">Design</span>\n                          </div>\n                        </div>\n                        <div class=\"work-item\">\n                          <div class=\"work-image work-5\"></div>\n                          <div class=\"work-overlay\">\n                            <h3>Digital Marketing</h3>\n                            <p>Strategic marketing campaigns</p>\n                            <span class=\"work-category\">Marketing</span>\n                          </div>\n                        </div>\n                        <div class=\"work-item\">\n                          <div class=\"work-image work-6\"></div>\n                          <div class=\"work-overlay\">\n                            <h3>E-commerce</h3>\n                            <p>Online store solutions</p>\n                            <span class=\"work-category\">E-commerce</span>\n                          </div>\n                        </div>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#1a1a1a","textColor":"#ffffff","padding":"120px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1400px"},"order":1},{"id":"services-section","type":"services","title":"Our Services","content":"\n                    <div class=\"services-container\">\n                      <h2>What We Do</h2>\n                      <p class=\"services-subtitle\">Comprehensive digital solutions for modern businesses</p>\n                      <div class=\"services-grid\">\n                        <div class=\"service-card\">\n                          <div class=\"service-icon\">🎨</div>\n                          <h3>Creative Design</h3>\n                          <p>Innovative visual design that captures your brand essence and engages your audience</p>\n                          <ul>\n                            <li>Brand Identity Design</li>\n                            <li>Logo & Visual Assets</li>\n                            <li>Print Design</li>\n                            <li>Digital Graphics</li>\n                          </ul>\n                        </div>\n                        <div class=\"service-card\">\n                          <div class=\"service-icon\">💻</div>\n                          <h3>Web Development</h3>\n                          <p>Custom websites and web applications built with cutting-edge technology</p>\n                          <ul>\n                            <li>Responsive Websites</li>\n                            <li>E-commerce Platforms</li>\n                            <li>Web Applications</li>\n                            <li>API Development</li>\n                          </ul>\n                        </div>\n                        <div class=\"service-card\">\n                          <div class=\"service-icon\">📱</div>\n                          <h3>Mobile Development</h3>\n                          <p>Native and cross-platform mobile applications for iOS and Android</p>\n                          <ul>\n                            <li>iOS Applications</li>\n                            <li>Android Applications</li>\n                            <li>Cross-platform Apps</li>\n                            <li>App Store Optimization</li>\n                          </ul>\n                        </div>\n                        <div class=\"service-card\">\n                          <div class=\"service-icon\">🚀</div>\n                          <h3>Digital Marketing</h3>\n                          <p>Strategic marketing campaigns that drive growth and engagement</p>\n                          <ul>\n                            <li>Social Media Marketing</li>\n                            <li>SEO Optimization</li>\n                            <li>Content Marketing</li>\n                            <li>Paid Advertising</li>\n                          </ul>\n                        </div>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#2a2a2a","textColor":"#ffffff","padding":"120px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1200px"},"order":2},{"id":"team-section","type":"team","title":"Our Team","content":"\n                    <div class=\"team-container\">\n                      <h2>Meet Our Creative Team</h2>\n                      <p class=\"team-subtitle\">Talented professionals passionate about creating exceptional digital experiences</p>\n                      <div class=\"team-grid\">\n                        <div class=\"team-member\">\n                          <div class=\"member-photo member-1\"></div>\n                          <h3>Sarah Johnson</h3>\n                          <p class=\"member-role\">Creative Director</p>\n                          <p class=\"member-bio\">Visionary leader with 10+ years in digital design and brand strategy</p>\n                          <div class=\"member-social\">\n                            <a href=\"#\">LinkedIn</a>\n                            <a href=\"#\">Dribbble</a>\n                            <a href=\"#\">Twitter</a>\n                          </div>\n                        </div>\n                        <div class=\"team-member\">\n                          <div class=\"member-photo member-2\"></div>\n                          <h3>Michael Chen</h3>\n                          <p class=\"member-role\">Lead Developer</p>\n                          <p class=\"member-bio\">Full-stack developer specializing in modern web technologies</p>\n                          <div class=\"member-social\">\n                            <a href=\"#\">GitHub</a>\n                            <a href=\"#\">LinkedIn</a>\n                            <a href=\"#\">Twitter</a>\n                          </div>\n                        </div>\n                        <div class=\"team-member\">\n                          <div class=\"member-photo member-3\"></div>\n                          <h3>Emily Rodriguez</h3>\n                          <p class=\"member-role\">UI/UX Designer</p>\n                          <p class=\"member-bio\">User experience expert focused on creating intuitive digital interfaces</p>\n                          <div class=\"member-social\">\n                            <a href=\"#\">Behance</a>\n                            <a href=\"#\">LinkedIn</a>\n                            <a href=\"#\">Instagram</a>\n                          </div>\n                        </div>\n                        <div class=\"team-member\">\n                          <div class=\"member-photo member-4\"></div>\n                          <h3>David Kim</h3>\n                          <p class=\"member-role\">Marketing Strategist</p>\n                          <p class=\"member-bio\">Digital marketing expert driving growth through data-driven strategies</p>\n                          <div class=\"member-social\">\n                            <a href=\"#\">LinkedIn</a>\n                            <a href=\"#\">Twitter</a>\n                            <a href=\"#\">Medium</a>\n                          </div>\n                        </div>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#1a1a1a","textColor":"#ffffff","padding":"120px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1200px"},"order":3},{"id":"studio-footer","type":"contact","title":"Let''s Work Together","content":"\n                    <div class=\"footer-content\">\n                      <h2>Ready to Start Your Project?</h2>\n                      <p>Let''s collaborate to bring your vision to life with our creative expertise</p>\n                      <div class=\"contact-info\">\n                        <div class=\"contact-item\">\n                          <h3>📧 Email</h3>\n                          <p>hello@creativestudio.com</p>\n                        </div>\n                        <div class=\"contact-item\">\n                          <h3>📱 Phone</h3>\n                          <p>+1 (555) 123-4567</p>\n                        </div>\n                        <div class=\"contact-item\">\n                          <h3>📍 Office</h3>\n                          <p>456 Creative Street, Design City</p>\n                        </div>\n                        <div class=\"contact-item\">\n                          <h3>🕒 Hours</h3>\n                          <p>Mon-Fri: 9AM-6PM</p>\n                        </div>\n                      </div>\n                      <button class=\"contact-btn\">Start Your Project</button>\n                      <div class=\"social-links\">\n                        <a href=\"#\">Instagram</a>\n                        <a href=\"#\">Behance</a>\n                        <a href=\"#\">Dribbble</a>\n                        <a href=\"#\">LinkedIn</a>\n                        <a href=\"#\">Twitter</a>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#0a0a0a","textColor":"#ffffff","padding":"100px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":true},"order":4}],"globalStyles":{"fontFamily":"Montserrat, sans-serif","primaryColor":"#ff6b6b","secondaryColor":"#4ecdc4","accentColor":"#45b7d1","backgroundColor":"#0a0a0a","textColor":"#ffffff","linkColor":"#ff6b6b","borderRadius":"20px","spacing":"30px","breakpoints":{"mobile":"768px","tablet":"1024px","desktop":"1400px"}},"settings":{"theme":"dark","layout":"full-width","headerStyle":"static","footerStyle":"detailed","navigationStyle":"horizontal","animations":true,"parallax":true,"lazyLoading":true},"seo":{"title":"Creative Studio - Digital Design & Development","description":"Premium creative studio specializing in digital design, web development, and brand strategy","keywords":["creative studio","digital design","web development","branding","UI/UX design"],"robots":"index"},"description":"A premium creative studio offering comprehensive digital solutions"}', '
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
            ', 3, 1, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time)),
(5, 5, 'Business Solutions', 'business-solutions', '{"sections":[{"id":"business-hero","type":"hero","title":"Business Solutions Hero","content":"\n                    <nav class=\"business-nav\">\n                      <div class=\"business-logo\">Business Solutions Inc.</div>\n                      <div class=\"business-menu\">\n                        <a href=\"#services\">Services</a>\n                        <a href=\"#about\">About</a>\n                        <a href=\"#solutions\">Solutions</a>\n                        <a href=\"#contact\">Contact</a>\n                      </div>\n                    </nav>\n                    <div class=\"hero-content\">\n                      <h1>Your Trusted Business Partner</h1>\n                      <p>Empowering businesses with innovative solutions and strategic consulting</p>\n                      <div class=\"cta-buttons\">\n                        <button class=\"btn-primary\">Get Started</button>\n                        <button class=\"btn-secondary\">Learn More</button>\n                      </div>\n                    </div>\n                    <div class=\"hero-stats\">\n                      <div class=\"stat\">\n                        <div class=\"stat-number\">500+</div>\n                        <div class=\"stat-label\">Clients Served</div>\n                      </div>\n                      <div class=\"stat\">\n                        <div class=\"stat-number\">15</div>\n                        <div class=\"stat-label\">Years Experience</div>\n                      </div>\n                      <div class=\"stat\">\n                        <div class=\"stat-number\">99%</div>\n                        <div class=\"stat-label\">Success Rate</div>\n                      </div>\n                      <div class=\"stat\">\n                        <div class=\"stat-number\">24/7</div>\n                        <div class=\"stat-label\">Support</div>\n                      </div>\n                    </div>\n                  ","styles":{"background":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","textColor":"#ffffff","padding":"100px 20px","textAlign":"center","position":"relative"},"settings":{"isVisible":true,"isFullWidth":true,"animation":{"type":"fadeIn","duration":1500,"delay":0}},"order":0},{"id":"services-section","type":"services","title":"Our Services","content":"\n                    <div class=\"services-container\">\n                      <h2>Our Services</h2>\n                      <p class=\"services-subtitle\">Comprehensive business solutions tailored to your needs</p>\n                      <div class=\"services-grid\">\n                        <div class=\"service-card\">\n                          <div class=\"service-icon\">📊</div>\n                          <h3>Business Consulting</h3>\n                          <p>Strategic guidance to optimize your business operations and drive growth</p>\n                          <ul>\n                            <li>Strategic Planning</li>\n                            <li>Process Optimization</li>\n                            <li>Performance Analysis</li>\n                            <li>Change Management</li>\n                          </ul>\n                          <div class=\"service-price\">Starting at $2,500/month</div>\n                        </div>\n                        <div class=\"service-card\">\n                          <div class=\"service-icon\">💼</div>\n                          <h3>Digital Transformation</h3>\n                          <p>Modernize your business with cutting-edge technology solutions</p>\n                          <ul>\n                            <li>Cloud Migration</li>\n                            <li>Automation Solutions</li>\n                            <li>Data Analytics</li>\n                            <li>System Integration</li>\n                          </ul>\n                          <div class=\"service-price\">Starting at $5,000/month</div>\n                        </div>\n                        <div class=\"service-card\">\n                          <div class=\"service-icon\">🎯</div>\n                          <h3>Marketing Strategy</h3>\n                          <p>Data-driven marketing strategies to increase your market presence</p>\n                          <ul>\n                            <li>Digital Marketing</li>\n                            <li>Brand Development</li>\n                            <li>Lead Generation</li>\n                            <li>Customer Acquisition</li>\n                          </ul>\n                          <div class=\"service-price\">Starting at $3,500/month</div>\n                        </div>\n                        <div class=\"service-card\">\n                          <div class=\"service-icon\">⚡</div>\n                          <h3>Technology Solutions</h3>\n                          <p>Custom software and technology solutions for your business needs</p>\n                          <ul>\n                            <li>Custom Software</li>\n                            <li>Mobile Applications</li>\n                            <li>Web Development</li>\n                            <li>API Integration</li>\n                          </ul>\n                          <div class=\"service-price\">Starting at $4,000/month</div>\n                        </div>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#f8f9fa","textColor":"#333333","padding":"120px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1200px"},"order":1},{"id":"solutions-section","type":"portfolio","title":"Our Solutions","content":"\n                    <div class=\"solutions-container\">\n                      <h2>Proven Solutions</h2>\n                      <p class=\"solutions-subtitle\">Real results for real businesses</p>\n                      <div class=\"solutions-grid\">\n                        <div class=\"solution-item\">\n                          <div class=\"solution-image solution-1\"></div>\n                          <div class=\"solution-content\">\n                            <h3>E-commerce Platform</h3>\n                            <p>Complete online store solution with advanced features</p>\n                            <div class=\"solution-stats\">\n                              <span>+300% Revenue</span>\n                              <span>50+ Stores</span>\n                            </div>\n                          </div>\n                        </div>\n                        <div class=\"solution-item\">\n                          <div class=\"solution-image solution-2\"></div>\n                          <div class=\"solution-content\">\n                            <h3>CRM System</h3>\n                            <p>Customer relationship management for better sales</p>\n                            <div class=\"solution-stats\">\n                              <span>+250% Leads</span>\n                              <span>100+ Companies</span>\n                            </div>\n                          </div>\n                        </div>\n                        <div class=\"solution-item\">\n                          <div class=\"solution-image solution-3\"></div>\n                          <div class=\"solution-content\">\n                            <h3>Analytics Dashboard</h3>\n                            <p>Real-time business intelligence and reporting</p>\n                            <div class=\"solution-stats\">\n                              <span>+400% Insights</span>\n                              <span>75+ Dashboards</span>\n                            </div>\n                          </div>\n                        </div>\n                        <div class=\"solution-item\">\n                          <div class=\"solution-image solution-4\"></div>\n                          <div class=\"solution-content\">\n                            <h3>Mobile App</h3>\n                            <p>Native mobile applications for iOS and Android</p>\n                            <div class=\"solution-stats\">\n                              <span>+500% Engagement</span>\n                              <span>25+ Apps</span>\n                            </div>\n                          </div>\n                        </div>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#ffffff","textColor":"#333333","padding":"120px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1200px"},"order":2},{"id":"about-section","type":"about","title":"About Us","content":"\n                    <div class=\"about-container\">\n                      <div class=\"about-content\">\n                        <h2>About Business Solutions Inc.</h2>\n                        <p>We are a leading business consulting firm specializing in digital transformation and strategic growth. With over 15 years of experience, we''ve helped hundreds of businesses achieve their goals through innovative solutions and expert guidance.</p>\n                        <p>Our team of certified consultants, developers, and strategists work together to deliver comprehensive solutions that drive real results for your business.</p>\n                        <div class=\"about-features\">\n                          <div class=\"feature\">\n                            <h3>🏆 Industry Leaders</h3>\n                            <p>Recognized experts in business transformation</p>\n                          </div>\n                          <div class=\"feature\">\n                            <h3>🔒 Secure & Reliable</h3>\n                            <p>Enterprise-grade security and reliability</p>\n                          </div>\n                          <div class=\"feature\">\n                            <h3>📈 Proven Results</h3>\n                            <p>Track record of successful implementations</p>\n                          </div>\n                          <div class=\"feature\">\n                            <h3>🤝 Client-Focused</h3>\n                            <p>Dedicated support and personalized service</p>\n                          </div>\n                        </div>\n                      </div>\n                      <div class=\"about-image\"></div>\n                    </div>\n                  ","styles":{"backgroundColor":"#f8f9fa","textColor":"#333333","padding":"120px 20px","textAlign":"left"},"settings":{"isVisible":true,"isFullWidth":false,"containerMaxWidth":"1200px"},"order":3},{"id":"business-footer","type":"contact","title":"Get Started Today","content":"\n                    <div class=\"footer-content\">\n                      <h2>Ready to Transform Your Business?</h2>\n                      <p>Contact us today to discuss how we can help your business grow and succeed</p>\n                      <div class=\"contact-info\">\n                        <div class=\"contact-item\">\n                          <h3>📧 Email</h3>\n                          <p>info@businesssolutions.com</p>\n                        </div>\n                        <div class=\"contact-item\">\n                          <h3>📱 Phone</h3>\n                          <p>+1 (555) 456-7890</p>\n                        </div>\n                        <div class=\"contact-item\">\n                          <h3>📍 Office</h3>\n                          <p>789 Business Avenue, Corporate City</p>\n                        </div>\n                        <div class=\"contact-item\">\n                          <h3>🕒 Hours</h3>\n                          <p>Mon-Fri: 8AM-6PM</p>\n                        </div>\n                      </div>\n                      <div class=\"cta-section\">\n                        <button class=\"cta-primary\">Schedule Consultation</button>\n                        <button class=\"cta-secondary\">Download Brochure</button>\n                      </div>\n                      <div class=\"social-links\">\n                        <a href=\"#\">LinkedIn</a>\n                        <a href=\"#\">Twitter</a>\n                        <a href=\"#\">Facebook</a>\n                        <a href=\"#\">YouTube</a>\n                      </div>\n                    </div>\n                  ","styles":{"backgroundColor":"#2c3e50","textColor":"#ffffff","padding":"100px 20px","textAlign":"center"},"settings":{"isVisible":true,"isFullWidth":true},"order":4}],"globalStyles":{"fontFamily":"Inter, sans-serif","primaryColor":"#667eea","secondaryColor":"#764ba2","accentColor":"#e74c3c","backgroundColor":"#ffffff","textColor":"#333333","linkColor":"#667eea","borderRadius":"12px","spacing":"25px","breakpoints":{"mobile":"768px","tablet":"1024px","desktop":"1200px"}},"settings":{"theme":"light","layout":"full-width","headerStyle":"static","footerStyle":"detailed","navigationStyle":"horizontal","animations":true,"parallax":false,"lazyLoading":true},"seo":{"title":"Business Solutions Inc. - Strategic Business Consulting","description":"Leading business consulting firm specializing in digital transformation and strategic growth solutions","keywords":["business consulting","digital transformation","strategic planning","business solutions"],"robots":"index"},"description":"Premium business consulting and digital transformation services"}', '
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
            ', 2, 0, 1, Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time), Thu Oct 09 2025 12:02:37 GMT+0800 (Philippine Standard Time));

SET FOREIGN_KEY_CHECKS = 1;
