
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    session_token VARCHAR(255) NULL, -- NEW: Session Token Storage - Stores JWT tokens for active user sessions. Enables server-side session management and token revocation. NULL for users not currently logged in or using OAuth.
    profile_image VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    theme_mode ENUM('light', 'dark') DEFAULT 'light',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verification_code VARCHAR(6) NULL, -- NEW: Email Verification Code - Stores the 6-digit verification code sent to user's email during registration. Code expires after 15 minutes. NULL when no code is pending or after successful verification.
    email_verification_code_expires_at DATETIME NULL, -- NEW: Email Verification Code Expiration - Timestamp when the verification code expires (15 minutes from generation). Used to validate code expiration. NULL when no code is pending.
    email_verification_attempts INT DEFAULT 0, -- NEW: Email Verification Attempts - Tracks the number of failed verification attempts. Prevents brute force attacks by limiting attempts (max 5). Reset after successful verification or code regeneration.
    ai_chat_usage INT DEFAULT 0, -- (adjusted to module implementation) - Track AI usage per user for plan limits
    ai_chat_reset_date DATETIME DEFAULT CURRENT_TIMESTAMP, -- (adjusted to module implementation) - Reset AI usage counter periodically
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    html_base LONGTEXT,
    css_base LONGTEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    -- NEW: Community Template Fields (adjusted to module implementation) - Enable users to share their websites as templates
    is_community BOOLEAN DEFAULT FALSE, -- Distinguishes community vs official templates
    creator_user_id INT NULL, -- Links to user who created/shared the template
    source_website_id INT NULL, -- Reference to original website
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_user_id) REFERENCES users(id) ON DELETE SET NULL,
    -- Note: source_website_id foreign key is added after websites table creation to avoid circular dependency
    INDEX idx_is_community (is_community),
    INDEX idx_creator_user_id (creator_user_id),
    INDEX idx_is_active (is_active)
);

-- Foreign key constraint for source_website_id is added after websites table creation:
-- ALTER TABLE templates ADD CONSTRAINT fk_templates_source_website FOREIGN KEY (source_website_id) REFERENCES websites(id) ON DELETE SET NULL;

CREATE TABLE websites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100),
    slug VARCHAR(100) UNIQUE,
    html_content LONGTEXT,
    css_content LONGTEXT,
    template_id INT,
    is_published BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    preview_url LONGBLOB, -- NEW: Website Preview Feature - Stores screenshot/preview image of the website as binary data. Generated automatically using Puppeteer when website is saved or updated. Used to display website previews in user dashboard and website cards. Format: PNG image as binary blob.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

CREATE TABLE ai_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    prompt_type ENUM('title', 'hero', 'about', 'full', 'assistant_request') NOT NULL,
    prompt_text TEXT NOT NULL,
    response_html LONGTEXT,
    used_on_site BOOLEAN DEFAULT FALSE,
    website_id INT NULL, -- NEW: Links chat to specific website for AI Assistant conversations
    conversation_id VARCHAR(50) NULL, -- NEW: Groups messages in conversations for AI Assistant
    message_type ENUM('user', 'assistant') DEFAULT 'user', -- NEW: Distinguishes user prompts from AI responses
    execution_status ENUM('pending', 'success', 'failed') DEFAULT 'pending', -- NEW: Tracks if AI-generated code was executed successfully
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL
);

CREATE TABLE media_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    website_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_url TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (website_id) REFERENCES websites(id)
);

CREATE TABLE website_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    website_id INT NOT NULL,
    visit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    visitor_ip VARCHAR(45),
    visitor_id VARCHAR(50),  -- (adjusted to module implementation) - Unique visitor identifier for better tracking
    session_id VARCHAR(50), -- (adjusted to module implementation) - Session identifier for session-based analytics
    user_agent TEXT,
    referrer TEXT,
    FOREIGN KEY (website_id) REFERENCES websites(id),
    INDEX idx_visitor_id (visitor_id),    -- (adjusted to module implementation) - Index for visitor tracking queries
    INDEX idx_session_id (session_id),   -- (adjusted to module implementation) - Index for session tracking queries
    INDEX idx_visit_time (visit_time)    -- (adjusted to module implementation) - Index for time-based analytics queries
);

CREATE TABLE custom_blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100),
    block_type VARCHAR(50),
    html_content LONGTEXT,
    css_content LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type ENUM('free', 'monthly', 'yearly') NOT NULL, -- (adjusted to module implementation) - Support different billing cycles for subscription plans
    price DECIMAL(10,2) NOT NULL,
    features TEXT,
    website_limit INT DEFAULT NULL,  -- NULL means unlimited (adjusted to module implementation) - Control number of websites per plan
    ai_chat_limit INT DEFAULT NULL, -- NULL means unlimited (adjusted to module implementation) - Control AI usage per plan
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_plan (
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
);

-- NEW: Subscription Logs Table (adjusted to module implementation) - Track subscription changes for audit trail and billing history
CREATE TABLE subscription_logs (
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
);

-- NEW: Payment Transactions Table (adjusted to module implementation) - Handle payment processing and transaction records for subscription billing
CREATE TABLE payment_transactions (
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
);

-- NEW: Community Features - Feedback System (adjusted to module implementation) - Enable users to submit feedback, bug reports, and feature requests
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,  -- 'bug', 'feature', 'improvement', 'general'
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
);

-- NEW: Community Features - Feedback Responses (adjusted to module implementation) - Allow admins to respond to user feedback and track communication
CREATE TABLE feedback_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id INT NOT NULL,
    admin_id INT NOT NULL,
    response TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_feedback_id (feedback_id)
);

-- NEW: Community Features - Forum Categories (adjusted to module implementation) - Organize forum discussions into categories for better user experience
CREATE TABLE forum_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),  -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    thread_count INT DEFAULT 0,
    last_activity DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active)
);

-- NEW: Community Features - Forum Threads (adjusted to module implementation) - Enable community discussions and knowledge sharing among users
CREATE TABLE forum_threads (
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
);

-- NEW: Community Features - Forum Replies (adjusted to module implementation) - Allow users to participate in forum discussions and provide answers
CREATE TABLE forum_replies (
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
);

-- NEW: Help Center Categories (adjusted to module implementation) - Organize help articles into categories for easy navigation and user support
CREATE TABLE help_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- NEW: Help Center Articles (adjusted to module implementation) - Store comprehensive help documentation and tutorials for users
CREATE TABLE help_articles (
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
);

-- NEW: Support Tickets (adjusted to module implementation) - Handle user support requests and technical issues systematically
CREATE TABLE support_tickets (
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
);

-- NEW: Community Features - Support Messages (adjusted to module implementation) - Enable communication between users and support staff for ticket resolution
CREATE TABLE support_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('user', 'admin') NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,  -- For admin-only notes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_sender_id (sender_id)
);

-- NEW: System - Activity Logs (adjusted to module implementation) - Track user actions and system events for security, analytics, and debugging
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),  -- 'website', 'template', 'user', etc.
    entity_id INT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,  -- Additional metadata
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp),
    INDEX idx_entity (entity_type, entity_id)
);

-- NEW: System - Settings (adjusted to module implementation) - Store application configuration and system-wide settings for dynamic configuration management
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_setting_key (setting_key)
);

-- ========================================
-- ANALYTICS TRACKING IMPROVEMENTS
-- ========================================
-- Date: 2025-10-24
-- Purpose: Enhanced unique visitor tracking to fix duplicate counting issues

-- PROBLEM IDENTIFIED:
-- The original analytics system was generating random IP addresses in development mode,
-- causing the same user to be counted as multiple unique visitors when visiting from
-- different browsers or sessions. This inflated unique visitor counts and provided
-- inaccurate analytics data.

-- CHANGES MADE TO website_analytics TABLE:
-- 1. Added visitor_id VARCHAR(50) - Unique identifier for each visitor (persistent across sessions)
--    REASON: Provides consistent visitor identification regardless of IP changes
-- 2. Added session_id VARCHAR(50) - Session identifier (resets when browser closes)
--    REASON: Enables session-based analytics and user journey tracking
-- 3. Added performance indexes for better query performance
--    REASON: Optimize analytics queries for large datasets

-- MIGRATION SCRIPT: server/scripts/migrate-analytics-table.js
-- - Automatically adds new columns to existing database
-- - Generates visitor_id for existing records using MD5 hash of user_agent + visitor_ip
-- - Adds necessary indexes for performance
-- REASON: Ensures backward compatibility and smooth transition from old to new system

-- CLIENT-SIDE IMPLEMENTATION:
-- - Uses localStorage for persistent visitor_id (survives browser restarts)
-- - Uses sessionStorage for session_id (resets when browser closes)
-- - Generates unique IDs using timestamp + random string
-- REASON: Provides reliable visitor identification across browser sessions

-- BACKEND IMPLEMENTATION:
-- - Updated analytics queries to use visitor_id instead of visitor_ip for unique visitor counting
-- - Added visitor fingerprinting using MD5 hash of user_agent + IP
-- - Implemented returning visitor detection (same visitor_id within 30 days)
-- - Removed random IP generation in development mode
-- REASON: Ensures accurate analytics data and proper visitor behavior tracking

-- BUSINESS JUSTIFICATION FOR PANELISTS:
-- 1. ACCURATE METRICS: Provides reliable analytics data for business decisions
-- 2. USER EXPERIENCE: Enables proper returning visitor detection and personalization
-- 3. PERFORMANCE: Optimized queries handle large-scale analytics efficiently
-- 4. SCALABILITY: System can handle growing user base without performance degradation
-- 5. COMPLIANCE: Better data accuracy for reporting and analytics requirements

-- BENEFITS:
-- - Accurate unique visitor counting (same user won't be counted multiple times)
-- - Proper returning visitor detection for user engagement metrics
-- - Session-based analytics tracking for user behavior analysis
-- - Backward compatibility with existing data (no data loss)
-- - Performance optimized with proper indexes for fast queries