export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'portfolio' | 'business' | 'personal' | 'creative' | 'landing';
  image: string;
  html_base: string;
  css_base: string;
  is_featured: boolean;
}

export const templates: Template[] = [
  // Portfolio Templates
  {
    id: 'portfolio-modern',
    name: 'Modern Portfolio',
    description: 'Clean and minimal design perfect for showcasing creative work',
    category: 'portfolio',
    image: '🎨',
    is_featured: true,
    html_base: `<div class="hero-section">
  <div class="container">
    <nav class="navbar">
      <div class="logo">Your Name</div>
      <div class="nav-links">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
    <div class="hero-content">
      <h1 class="hero-title">Creative Designer & Developer</h1>
      <p class="hero-subtitle">I craft beautiful digital experiences that tell your story</p>
    <button class="cta-button">View My Work</button>
    </div>
  </div>
</div>
<div class="about-section">
  <div class="container">
    <h2>About Me</h2>
    <p>I'm a passionate designer and developer with 5+ years of experience creating digital experiences that matter. I specialize in user-centered design and modern web development.</p>
  </div>
</div>
<div class="portfolio-section">
  <div class="container">
    <h2>Featured Work</h2>
    <div class="portfolio-grid">
      <div class="portfolio-item">
        <div class="portfolio-image"></div>
        <h3>E-commerce Platform</h3>
        <p>Modern shopping experience</p>
      </div>
      <div class="portfolio-item">
        <div class="portfolio-image"></div>
        <h3>Mobile App Design</h3>
        <p>User-friendly interface</p>
      </div>
      <div class="portfolio-item">
        <div class="portfolio-image"></div>
        <h3>Brand Identity</h3>
        <p>Complete visual system</p>
      </div>
    </div>
  </div>
</div>
<div class="contact-section">
  <div class="container">
    <h2>Let's Work Together</h2>
    <p>Ready to bring your ideas to life? Let's discuss your project.</p>
    <button class="contact-button">Get In Touch</button>
  </div>
</div>`,
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* Mobile-first responsive design */
@media (max-width: 768px) {
  .container { padding: 0 15px; }
  .hero-title { font-size: 2.5rem !important; }
  .hero-subtitle { font-size: 1.1rem !important; }
  .navbar { flex-direction: column; gap: 20px; }
  .nav-links { flex-wrap: wrap; justify-content: center; }
  .portfolio-grid { grid-template-columns: 1fr; }
  .services-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .hero-title { font-size: 2rem !important; }
  .hero-subtitle { font-size: 1rem !important; }
  .cta-button { padding: 12px 24px; font-size: 0.9rem; }
}
.hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; display: flex; flex-direction: column; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; }
.logo { font-size: 24px; font-weight: 700; }
.nav-links { display: flex; gap: 30px; }
.nav-links a { color: white; text-decoration: none; font-weight: 500; transition: opacity 0.3s; }
.nav-links a:hover { opacity: 0.8; }
.hero-content { flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; }
.hero-title { font-size: 3.5rem; font-weight: 700; margin-bottom: 20px; line-height: 1.2; }
.hero-subtitle { font-size: 1.3rem; margin-bottom: 40px; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto; }
.cta-button { background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 15px 40px; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.cta-button:hover { background: white; color: #667eea; transform: translateY(-2px); }
.about-section, .portfolio-section, .contact-section { padding: 100px 0; }
.about-section { background: #f8f9fa; }
.about-section h2 { font-size: 2.5rem; margin-bottom: 30px; text-align: center; }
.about-section p { font-size: 1.2rem; max-width: 800px; margin: 0 auto; text-align: center; color: #666; }
.portfolio-section h2 { font-size: 2.5rem; margin-bottom: 60px; text-align: center; }
.portfolio-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 40px; }
.portfolio-item { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; }
.portfolio-item:hover { transform: translateY(-10px); }
.portfolio-image { height: 250px; background: linear-gradient(45deg, #f0f0f0, #e0e0e0); }
.portfolio-item h3 { font-size: 1.3rem; margin: 20px 20px 10px; }
.portfolio-item p { color: #666; margin: 0 20px 20px; }
.contact-section { background: #2c3e50; color: white; text-align: center; }
.contact-section h2 { font-size: 2.5rem; margin-bottom: 20px; }
.contact-section p { font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9; }
.contact-button { background: #e74c3c; color: white; border: none; padding: 15px 40px; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.contact-button:hover { background: #c0392b; transform: translateY(-2px); }`
  },
  {
    id: 'portfolio-minimal',
    name: 'Minimal Portfolio',
    description: 'Ultra-clean design focusing on your work',
    category: 'portfolio',
    image: '✨',
    is_featured: false,
    html_base: `<div class="minimal-hero">
  <div class="container">
    <nav class="minimal-nav">
      <div class="logo">Portfolio</div>
      <div class="nav-links">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
    <div class="hero-content">
  <h1>Your Name</h1>
  <p>Designer & Developer</p>
    </div>
  </div>
</div>
<div class="work-section">
  <div class="container">
  <h2>Selected Works</h2>
  <div class="work-grid">
      <div class="work-item">
        <div class="work-image"></div>
        <h3>Project One</h3>
        <p>Brand Identity Design</p>
      </div>
      <div class="work-item">
        <div class="work-image"></div>
        <h3>Project Two</h3>
        <p>Web Application</p>
      </div>
      <div class="work-item">
        <div class="work-image"></div>
        <h3>Project Three</h3>
        <p>Mobile App Design</p>
      </div>
    </div>
  </div>
</div>`,
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
.minimal-hero { padding: 120px 0; background: white; }
.minimal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 80px; }
.logo { font-size: 20px; font-weight: 300; letter-spacing: 2px; }
.nav-links { display: flex; gap: 40px; }
.nav-links a { color: #333; text-decoration: none; font-weight: 300; letter-spacing: 1px; transition: opacity 0.3s; }
.nav-links a:hover { opacity: 0.6; }
.hero-content { text-align: center; }
.minimal-hero h1 { font-size: 3rem; font-weight: 300; margin-bottom: 10px; letter-spacing: 3px; }
.minimal-hero p { font-size: 1.1rem; color: #666; font-weight: 300; }
.work-section { padding: 120px 0; background: #fafafa; }
.work-section h2 { font-size: 2rem; font-weight: 300; margin-bottom: 60px; text-align: center; letter-spacing: 2px; }
.work-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 60px; }
.work-item { text-align: center; }
.work-image { height: 300px; background: #e0e0e0; margin-bottom: 30px; }
.work-item h3 { font-size: 1.2rem; font-weight: 300; margin-bottom: 10px; letter-spacing: 1px; }
.work-item p { color: #666; font-weight: 300; }`
  },
  {
    id: 'portfolio-creative',
    name: 'Creative Portfolio',
    description: 'Bold and artistic design for creative professionals',
    category: 'portfolio',
    image: '🎭',
    is_featured: false,
    html_base: `<div class="creative-hero">
  <div class="hero-content">
    <h1>Creative Name</h1>
    <p>Artist & Visionary</p>
    <div class="hero-buttons">
      <button class="primary-btn">View Gallery</button>
      <button class="secondary-btn">Contact Me</button>
    </div>
  </div>
</div>
<div class="gallery-section">
  <div class="container">
    <h2>My Artwork</h2>
  <div class="gallery-grid">
      <div class="gallery-item large">
        <div class="gallery-image"></div>
        <h3>Digital Art Series</h3>
      </div>
      <div class="gallery-item">
        <div class="gallery-image"></div>
        <h3>Photography</h3>
      </div>
      <div class="gallery-item">
        <div class="gallery-image"></div>
        <h3>Illustrations</h3>
  </div>
      <div class="gallery-item">
        <div class="gallery-image"></div>
        <h3>Mixed Media</h3>
</div>
</div>
  </div>
</div>`,
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Montserrat', sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.creative-hero { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 100px 0; text-align: center; }
.hero-content h1 { font-size: 4rem; font-weight: 700; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
.hero-content p { font-size: 1.5rem; margin-bottom: 40px; opacity: 0.9; }
.hero-buttons { display: flex; gap: 20px; justify-content: center; }
.primary-btn, .secondary-btn { padding: 15px 30px; border: none; border-radius: 30px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.primary-btn { background: white; color: #ff6b6b; }
.secondary-btn { background: transparent; color: white; border: 2px solid white; }
.primary-btn:hover, .secondary-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
.gallery-section { padding: 100px 0; background: #2d3436; color: white; }
.gallery-section h2 { font-size: 2.5rem; margin-bottom: 60px; text-align: center; }
.gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.gallery-item.large { grid-column: span 2; grid-row: span 2; }
.gallery-image { height: 200px; background: linear-gradient(45deg, #636e72, #74b9ff); margin-bottom: 15px; }
.gallery-item.large .gallery-image { height: 300px; }
.gallery-item h3 { font-size: 1.1rem; font-weight: 600; }`
  },

  // Business Templates
  {
    id: 'business-corporate',
    name: 'Corporate Business',
    description: 'Professional design for corporate websites',
    category: 'business',
    image: '🏢',
    is_featured: true,
    html_base: `<div class="corporate-hero">
  <div class="container">
    <nav class="corporate-nav">
      <div class="logo">Company Name</div>
      <div class="nav-links">
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
    <div class="hero-content">
      <h1>Leading Industry Solutions</h1>
      <p>We provide innovative solutions that drive business growth and success</p>
    <button class="btn-primary">Learn More</button>
    </div>
  </div>
</div>
<div class="services-section">
  <div class="container">
    <h2>Our Services</h2>
    <div class="services-grid">
      <div class="service">
        <div class="service-icon">📊</div>
        <h3>Business Consulting</h3>
        <p>Strategic guidance to optimize your business operations</p>
      </div>
      <div class="service">
        <div class="service-icon">💼</div>
        <h3>Project Management</h3>
        <p>Efficient project delivery with proven methodologies</p>
      </div>
      <div class="service">
        <div class="service-icon">📈</div>
        <h3>Growth Strategy</h3>
        <p>Data-driven strategies for sustainable business growth</p>
      </div>
    </div>
  </div>
</div>
<div class="stats-section">
  <div class="container">
    <div class="stats-grid">
      <div class="stat">
        <h3>500+</h3>
        <p>Projects Completed</p>
      </div>
      <div class="stat">
        <h3>98%</h3>
        <p>Client Satisfaction</p>
      </div>
      <div class="stat">
        <h3>10+</h3>
        <p>Years Experience</p>
      </div>
    </div>
  </div>
</div>`,
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Roboto', sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.corporate-hero { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 100px 0; }
.corporate-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
.logo { font-size: 28px; font-weight: 700; }
.nav-links { display: flex; gap: 30px; }
.nav-links a { color: white; text-decoration: none; font-weight: 500; transition: opacity 0.3s; }
.nav-links a:hover { opacity: 0.8; }
.hero-content { text-align: center; }
.hero-content h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 20px; }
.hero-content p { font-size: 1.3rem; margin-bottom: 40px; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto; }
.btn-primary { background: #e74c3c; color: white; padding: 15px 40px; border: none; border-radius: 5px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.btn-primary:hover { background: #c0392b; transform: translateY(-2px); }
.services-section { padding: 100px 0; background: white; }
.services-section h2 { font-size: 2.5rem; margin-bottom: 60px; text-align: center; }
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
.service { text-align: center; padding: 40px 20px; }
.service-icon { font-size: 3rem; margin-bottom: 20px; }
.service h3 { font-size: 1.5rem; margin-bottom: 15px; }
.service p { color: #666; line-height: 1.6; }
.stats-section { background: #f8f9fa; padding: 80px 0; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; text-align: center; }
.stat h3 { font-size: 3rem; font-weight: 700; color: #2c3e50; margin-bottom: 10px; }
.stat p { font-size: 1.1rem; color: #666; }`
  },
  {
    id: 'business-startup',
    name: 'Startup Business',
    description: 'Modern and energetic design for startups',
    category: 'business',
    image: '🚀',
    is_featured: false,
    html_base: `<div class="startup-hero">
  <div class="container">
    <nav class="startup-nav">
      <div class="logo">StartupName</div>
      <button class="cta-nav">Get Started</button>
    </nav>
    <div class="hero-content">
      <h1>Innovation Starts Here</h1>
      <p>We're building the future, one breakthrough at a time</p>
      <div class="hero-buttons">
  <button class="cta-btn">Get Started</button>
        <button class="demo-btn">Watch Demo</button>
      </div>
    </div>
  </div>
</div>
<div class="features-section">
  <div class="container">
  <h2>Why Choose Us</h2>
  <div class="features-grid">
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>Lightning Fast</h3>
        <p>10x faster than traditional solutions</p>
  </div>
      <div class="feature">
        <div class="feature-icon">🔒</div>
        <h3>Secure & Reliable</h3>
        <p>Enterprise-grade security</p>
</div>
      <div class="feature">
        <div class="feature-icon">📱</div>
        <h3>Mobile First</h3>
        <p>Optimized for all devices</p>
  </div>
</div>
  </div>
</div>`,
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.startup-hero { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 100px 0; }
.startup-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 80px; }
.logo { font-size: 24px; font-weight: 700; }
.cta-nav { background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 10px 20px; border-radius: 25px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.cta-nav:hover { background: white; color: #ff6b6b; }
.hero-content { text-align: center; }
.hero-content h1 { font-size: 4rem; font-weight: 700; margin-bottom: 20px; }
.hero-content p { font-size: 1.3rem; margin-bottom: 40px; opacity: 0.9; }
.hero-buttons { display: flex; gap: 20px; justify-content: center; }
.cta-btn, .demo-btn { padding: 15px 30px; border: none; border-radius: 30px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.cta-btn { background: white; color: #ff6b6b; }
.demo-btn { background: transparent; color: white; border: 2px solid white; }
.cta-btn:hover, .demo-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
.features-section { padding: 100px 0; background: white; }
.features-section h2 { font-size: 2.5rem; margin-bottom: 60px; text-align: center; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
.feature { text-align: center; padding: 40px 20px; }
.feature-icon { font-size: 3rem; margin-bottom: 20px; }
.feature h3 { font-size: 1.5rem; margin-bottom: 15px; }
.feature p { color: #666; }`
  },

  // Personal Templates
  {
    id: 'personal-blog',
    name: 'Personal Blog',
    description: 'Clean design for personal blogging',
    category: 'personal',
    image: '📝',
    is_featured: true,
    html_base: `<div class="blog-hero">
  <div class="container">
    <nav class="blog-nav">
      <div class="logo">Your Blog</div>
      <div class="nav-links">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#posts">Posts</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
    <div class="hero-content">
      <h1>Thoughts and Stories</h1>
      <p>Sharing insights, experiences, and ideas from my journey</p>
    </div>
  </div>
</div>
<div class="posts-section">
  <div class="container">
  <h2>Latest Posts</h2>
  <div class="posts-grid">
      <article class="post">
        <div class="post-image"></div>
        <div class="post-content">
          <h3>The Future of Web Development</h3>
          <p>Exploring the latest trends and technologies shaping the web...</p>
          <span class="post-date">March 15, 2024</span>
  </div>
      </article>
      <article class="post">
        <div class="post-image"></div>
        <div class="post-content">
          <h3>Building Better User Experiences</h3>
          <p>Tips and strategies for creating more engaging interfaces...</p>
          <span class="post-date">March 10, 2024</span>
</div>
      </article>
      <article class="post">
        <div class="post-image"></div>
        <div class="post-content">
          <h3>My Journey as a Developer</h3>
          <p>Reflections on the challenges and rewards of coding...</p>
          <span class="post-date">March 5, 2024</span>
</div>
      </article>
</div>
  </div>
</div>`,
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
.blog-hero { background: #f8f9fa; padding: 100px 0; }
.blog-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
.logo { font-size: 24px; font-weight: 700; color: #2c3e50; }
.nav-links { display: flex; gap: 30px; }
.nav-links a { color: #666; text-decoration: none; font-weight: 500; transition: color 0.3s; }
.nav-links a:hover { color: #2c3e50; }
.hero-content { text-align: center; }
.hero-content h1 { font-size: 3rem; font-weight: 300; margin-bottom: 20px; color: #2c3e50; }
.hero-content p { font-size: 1.2rem; color: #666; }
.posts-section { padding: 100px 0; background: white; }
.posts-section h2 { font-size: 2.5rem; margin-bottom: 60px; text-align: center; color: #2c3e50; }
.posts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
.post { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s; }
.post:hover { transform: translateY(-5px); }
.post-image { height: 200px; background: linear-gradient(45deg, #e0e0e0, #f0f0f0); }
.post-content { padding: 30px; }
.post-content h3 { font-size: 1.3rem; margin-bottom: 15px; color: #2c3e50; }
.post-content p { color: #666; margin-bottom: 20px; line-height: 1.6; }
.post-date { color: #999; font-size: 0.9rem; }`
  },

  // Creative Templates
  {
    id: 'creative-artist',
    name: 'Artist Creative',
    description: 'Bold and expressive design for artists',
    category: 'creative',
    image: '🎨',
    is_featured: true,
    html_base: `<div class="artist-hero">
  <div class="hero-content">
  <h1>Artist Name</h1>
  <p>Visual Storyteller</p>
    <div class="hero-nav">
      <a href="#gallery">Gallery</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </div>
  </div>
</div>
<div class="artwork-section">
  <div class="container">
  <h2>My Artwork</h2>
  <div class="artwork-grid">
      <div class="artwork-item">
        <div class="artwork-image"></div>
        <h3>Abstract Series</h3>
        <p>Mixed media on canvas</p>
  </div>
      <div class="artwork-item">
        <div class="artwork-image"></div>
        <h3>Digital Portraits</h3>
        <p>Digital art collection</p>
</div>
      <div class="artwork-item">
        <div class="artwork-image"></div>
        <h3>Street Art</h3>
        <p>Urban murals</p>
  </div>
</div>
  </div>
</div>`,
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Montserrat', sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.artist-hero { background: linear-gradient(45deg, #e17055, #fdcb6e); color: white; padding: 100px 0; text-align: center; }
.hero-content h1 { font-size: 4rem; font-weight: 700; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
.hero-content p { font-size: 1.5rem; margin-bottom: 40px; opacity: 0.9; }
.hero-nav { display: flex; gap: 30px; justify-content: center; }
.hero-nav a { color: white; text-decoration: none; font-weight: 600; padding: 10px 20px; border: 2px solid white; border-radius: 25px; transition: all 0.3s; }
.hero-nav a:hover { background: white; color: #e17055; }
.artwork-section { padding: 100px 0; background: #2d3436; color: white; }
.artwork-section h2 { font-size: 2.5rem; margin-bottom: 60px; text-align: center; }
.artwork-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 40px; }
.artwork-item { text-align: center; }
.artwork-image { height: 300px; background: linear-gradient(45deg, #636e72, #74b9ff); margin-bottom: 20px; border-radius: 10px; }
.artwork-item h3 { font-size: 1.3rem; margin-bottom: 10px; }
.artwork-item p { color: #b2bec3; }`
  },

  // Landing Page Templates
  {
    id: 'landing-saas',
    name: 'SaaS Landing',
    description: 'Modern landing page for SaaS products',
    category: 'landing',
    image: '💻',
    is_featured: true,
    html_base: `<div class="saas-hero">
  <div class="container">
    <nav class="saas-nav">
      <div class="logo">ProductName</div>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
    <div class="hero-content">
      <h1>Revolutionary Solution</h1>
      <p>Transform your workflow with our cutting-edge platform</p>
      <div class="hero-buttons">
  <button class="cta-button">Start Free Trial</button>
        <button class="demo-button">Watch Demo</button>
      </div>
    </div>
  </div>
</div>
<div class="features-section">
  <div class="container">
    <h2>Powerful Features</h2>
  <div class="features-grid">
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>Lightning Fast</h3>
        <p>Process data 10x faster than competitors</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔒</div>
        <h3>Secure</h3>
        <p>Enterprise-grade security and compliance</p>
  </div>
      <div class="feature">
        <div class="feature-icon">📊</div>
        <h3>Analytics</h3>
        <p>Real-time insights and reporting</p>
  </div>
</div>
  </div>
</div>
<div class="pricing-section">
  <div class="container">
    <h2>Simple Pricing</h2>
    <div class="pricing-grid">
      <div class="pricing-card">
        <h3>Starter</h3>
        <div class="price">$29<span>/month</span></div>
        <ul>
          <li>Up to 5 projects</li>
          <li>Basic analytics</li>
          <li>Email support</li>
        </ul>
        <button class="pricing-btn">Get Started</button>
  </div>
      <div class="pricing-card featured">
        <h3>Professional</h3>
        <div class="price">$79<span>/month</span></div>
        <ul>
          <li>Unlimited projects</li>
          <li>Advanced analytics</li>
          <li>Priority support</li>
        </ul>
        <button class="pricing-btn">Get Started</button>
  </div>
</div>
  </div>
</div>`,
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.saas-hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; }
.saas-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 80px; }
.logo { font-size: 24px; font-weight: 700; }
.nav-links { display: flex; gap: 30px; }
.nav-links a { color: white; text-decoration: none; font-weight: 500; transition: opacity 0.3s; }
.nav-links a:hover { opacity: 0.8; }
.hero-content { text-align: center; }
.hero-content h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 20px; }
.hero-content p { font-size: 1.3rem; margin-bottom: 40px; opacity: 0.9; }
.hero-buttons { display: flex; gap: 20px; justify-content: center; }
.cta-button, .demo-button { padding: 15px 30px; border: none; border-radius: 30px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.cta-button { background: #ff6b6b; color: white; }
.demo-button { background: transparent; color: white; border: 2px solid white; }
.cta-button:hover, .demo-button:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
.features-section { padding: 100px 0; background: white; }
.features-section h2 { font-size: 2.5rem; margin-bottom: 60px; text-align: center; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
.feature { text-align: center; padding: 40px 20px; }
.feature-icon { font-size: 3rem; margin-bottom: 20px; }
.feature h3 { font-size: 1.5rem; margin-bottom: 15px; }
.feature p { color: #666; }
.pricing-section { background: #f8f9fa; padding: 100px 0; }
.pricing-section h2 { font-size: 2.5rem; margin-bottom: 60px; text-align: center; }
.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; max-width: 800px; margin: 0 auto; }
.pricing-card { background: white; padding: 40px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.pricing-card.featured { border: 3px solid #667eea; transform: scale(1.05); }
.pricing-card h3 { font-size: 1.5rem; margin-bottom: 20px; }
.price { font-size: 3rem; font-weight: 700; color: #667eea; margin-bottom: 30px; }
.price span { font-size: 1rem; color: #666; }
.pricing-card ul { list-style: none; margin-bottom: 30px; }
.pricing-card li { padding: 10px 0; color: #666; }
.pricing-btn { background: #667eea; color: white; border: none; padding: 15px 30px; border-radius: 30px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.pricing-btn:hover { background: #5a6fd8; transform: translateY(-2px); }`
  }
];

export const categories = [
  { id: 'portfolio', name: 'Portfolio', icon: '🎨' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'personal', name: 'Personal', icon: '👤' },
  { id: 'creative', name: 'Creative', icon: '✨' },
  { id: 'landing', name: 'Landing Page', icon: '🚀' }
];

export const getTemplatesByCategory = (category: string) => {
  return templates.filter(template => template.category === category);
};

export const getFeaturedTemplates = () => {
  return templates.filter(template => template.is_featured);
};