-- Webeenthere Database Backup
-- Generated: 2025-10-03T04:05:16.718Z
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
(1, 'Free', '0.00', '1 website, Basic templates, 100MB storage', 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(2, 'Pro', '9.99', '5 websites, All templates, 1GB storage, Custom domain', 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(3, 'Business', '19.99', 'Unlimited websites, Premium templates, 10GB storage, Custom domain, Analytics', 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time));

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
(1, 'Modern Portfolio', 'Clean and modern portfolio template perfect for designers and developers', 'portfolio', '<div class="hero-section"><h1>Welcome to My Portfolio</h1><p>I create amazing digital experiences</p></div>', '.hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }', 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(2, 'Business Landing', 'Professional business landing page template', 'business', '<div class="business-hero"><h1>Your Business Solution</h1><p>We help businesses grow</p></div>', '.business-hero { background: #2c3e50; color: white; padding: 80px 0; text-align: center; }', 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(3, 'Creative Artist', 'Bold and creative template for artists and creatives', 'creative', '<div class="creative-showcase"><h1>My Creative World</h1><p>Explore my artistic journey</p></div>', '.creative-showcase { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 120px 0; text-align: center; }', 0, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(4, 'Minimal Blog', 'Simple and elegant blog template', 'blog', '<div class="blog-header"><h1>My Thoughts</h1><p>Sharing ideas and experiences</p></div>', '.blog-header { background: #f8f9fa; color: #333; padding: 60px 0; text-align: center; border-bottom: 1px solid #dee2e6; }', 0, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(5, 'Restaurant Menu', 'Appetizing template for restaurants and food businesses', 'restaurant', '<div class="restaurant-banner"><h1>Delicious Dining</h1><p>Experience our culinary excellence</p></div>', '.restaurant-banner { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("food-bg.jpg"); color: white; padding: 100px 0; text-align: center; }', 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time));

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
(1, 'john_doe', 'john@example.com', '$2a$10$M8baszqUCECn.qrrvvGkt.AWerqYVtY3DnHS5TocluevCl4Wu1RzW', NULL, 'user', 'light', 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(2, 'jane_smith', 'jane@example.com', '$2a$10$M8baszqUCECn.qrrvvGkt.AWerqYVtY3DnHS5TocluevCl4Wu1RzW', NULL, 'user', 'dark', 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(3, 'admin_user', 'admin@webeenthere.com', '$2a$10$M8baszqUCECn.qrrvvGkt.AWerqYVtY3DnHS5TocluevCl4Wu1RzW', NULL, 'admin', 'light', 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(4, 'artist_creative', 'artist@example.com', '$2a$10$M8baszqUCECn.qrrvvGkt.AWerqYVtY3DnHS5TocluevCl4Wu1RzW', NULL, 'user', 'dark', 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(5, 'business_owner', 'business@example.com', '$2a$10$M8baszqUCECn.qrrvvGkt.AWerqYVtY3DnHS5TocluevCl4Wu1RzW', NULL, 'user', 'light', 0, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time));

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
(1, 1, 'John''s Portfolio', 'john-portfolio', '<div class="portfolio"><h1>John Doe - Web Developer</h1><p>Creating amazing web experiences</p></div>', '.portfolio { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }', 1, 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(2, 2, 'Jane''s Art Gallery', 'jane-art-gallery', '<div class="gallery"><h1>Jane Smith - Digital Artist</h1><p>Exploring creativity through digital art</p></div>', '.gallery { background: #f0f0f0; padding: 40px; text-align: center; }', 3, 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(3, 3, 'Admin Dashboard', 'admin-dashboard', '<div class="admin"><h1>Webeenthere Admin</h1><p>System administration panel</p></div>', '.admin { background: #2c3e50; color: white; padding: 30px; }', 2, 0, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(4, 4, 'Creative Studio', 'creative-studio', '<div class="studio"><h1>Creative Studio</h1><p>Where art meets technology</p></div>', '.studio { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 50px; }', 3, 1, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time)),
(5, 5, 'Business Solutions', 'business-solutions', '<div class="business"><h1>Business Solutions Inc.</h1><p>Your trusted business partner</p></div>', '.business { background: #34495e; color: white; padding: 40px; text-align: center; }', 2, 0, 1, Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time), Wed Oct 01 2025 11:02:31 GMT+0800 (Philippine Standard Time));

SET FOREIGN_KEY_CHECKS = 1;
