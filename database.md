I am building a web application named "Webeenthere". It is a lightweight, beginner-friendly website builder inspired by platforms like Carrd.co, but targeted for freelancers, artists, small business owners, and digital creators. The system lets users easily create and manage one-page websites or digital portfolios.

I want this app to be built using:
- **Frontend**: HTML5, TailwindCSS, JavaScript/typescript, REACT
- **Backend**: Node.js (Express.js)
- **Database**: MySQL (hosted locally via XAMPP, with plans to migrate to cloud services later)
- **File Storage**: Local `uploads/` folder for user-uploaded images
- **Authentication**: Simple login and signup system  (username, email, password)
- **Website Builder Interface**:
    - Users can select a template OR start from scratch
    - Drag-and-drop sections like: Hero, About, Gallery, Contact, Social Links
    - Save website layout, content, and style in MySQL
    - Users can preview and publish their site to a URL like `webeenthere.com/username/sitename`
    - Optionally allow exporting HTML/CSS

Future roadmap (optional for now):
- AI prompt assistant for generating content (bio, site structure, styling help)
- Context-aware AI for suggesting design adjustments
- Domain support like `sitename.webeenthere.com` but for free tier things lets use webeenthere.com/custom url
- Analytics for site visits

Make the system modular and beginner-developer-friendly. Include organized file structure, comments in code, and a clean UI using TailwindCSS (dark/light mode toggle if possible).

Please generate:
- File structure
- Basic working Express server
- MySQL schema (users table, websites table)
- Simple Tailwind HTML frontend with minimal design
- Template saving and rendering logic
- User authentication
- Ability for logged-in users to create and save a new website (select template + customize)

below is ther database

CREATE TABLE users (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

CREATE TABLE ai_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    prompt_type ENUM('title', 'hero', 'about', 'full') NOT NULL,
    prompt_text TEXT NOT NULL,
    response_html LONGTEXT,
    used_on_site BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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
    user_agent TEXT,
    referrer TEXT,
    FOREIGN KEY (website_id) REFERENCES websites(id)
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
    price DECIMAL(10,2) NOT NULL,
    features TEXT,
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