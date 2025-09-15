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
    <h1 class="hero-title">Your Name</h1>
    <p class="hero-subtitle">Creative Professional</p>
    <button class="cta-button">View My Work</button>
  </div>
</div>
<div class="about-section">
  <div class="container">
    <h2>About Me</h2>
    <p>Tell your story and showcase your expertise...</p>
  </div>
</div>
<div class="portfolio-section">
  <div class="container">
    <h2>My Work</h2>
    <div class="portfolio-grid">
      <div class="portfolio-item">Project 1</div>
      <div class="portfolio-item">Project 2</div>
      <div class="portfolio-item">Project 3</div>
    </div>
  </div>
</div>
<div class="contact-section">
  <div class="container">
    <h2>Get In Touch</h2>
    <p>Let's work together!</p>
  </div>
</div>`,
    css_base: `.hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 100px 0; text-align: center; color: white; }
.hero-title { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
.hero-subtitle { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
.cta-button { background: #ff6b6b; color: white; padding: 12px 30px; border: none; border-radius: 25px; font-size: 1rem; cursor: pointer; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.about-section, .portfolio-section, .contact-section { padding: 80px 0; }
.portfolio-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
.portfolio-item { background: #f8f9fa; padding: 40px; border-radius: 10px; text-align: center; }`
  },
  {
    id: 'portfolio-minimal',
    name: 'Minimal Portfolio',
    description: 'Ultra-clean design focusing on your work',
    category: 'portfolio',
    image: '✨',
    is_featured: false,
    html_base: `<div class="minimal-hero">
  <h1>Your Name</h1>
  <p>Designer & Developer</p>
</div>
<div class="work-section">
  <h2>Selected Works</h2>
  <div class="work-grid">
    <div class="work-item">Work 1</div>
    <div class="work-item">Work 2</div>
  </div>
</div>`,
    css_base: `.minimal-hero { padding: 120px 0; text-align: center; background: white; }
.minimal-hero h1 { font-size: 2.5rem; font-weight: 300; margin-bottom: 0.5rem; }
.minimal-hero p { color: #666; font-size: 1.1rem; }
.work-section { padding: 80px 0; background: #fafafa; }
.work-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; max-width: 1000px; margin: 0 auto; }
.work-item { background: white; padding: 60px; text-align: center; }`
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
  </div>
</div>
<div class="gallery-section">
  <h2>Gallery</h2>
  <div class="gallery-grid">
    <div class="gallery-item">Art 1</div>
    <div class="gallery-item">Art 2</div>
    <div class="gallery-item">Art 3</div>
    <div class="gallery-item">Art 4</div>
  </div>
</div>`,
    css_base: `.creative-hero { background: #ff6b6b; padding: 100px 0; color: white; }
.hero-content { text-align: center; }
.creative-hero h1 { font-size: 4rem; font-weight: bold; margin-bottom: 1rem; }
.gallery-section { padding: 80px 0; background: #2c3e50; color: white; }
.gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.gallery-item { background: #34495e; padding: 40px; text-align: center; }`
  },
  {
    id: 'portfolio-photography',
    name: 'Photography Portfolio',
    description: 'Perfect for photographers to showcase their work',
    category: 'portfolio',
    image: '📸',
    is_featured: false,
    html_base: `<div class="photo-hero">
  <h1>Photographer Name</h1>
  <p>Capturing Life's Moments</p>
</div>
<div class="photo-gallery">
  <div class="photo-item">Photo 1</div>
  <div class="photo-item">Photo 2</div>
  <div class="photo-item">Photo 3</div>
</div>`,
    css_base: `.photo-hero { background: #000; color: white; padding: 100px 0; text-align: center; }
.photo-hero h1 { font-size: 3rem; font-weight: 300; }
.photo-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.photo-item { aspect-ratio: 1; background: #333; display: flex; align-items: center; justify-content: center; color: white; }`
  },
  {
    id: 'portfolio-developer',
    name: 'Developer Portfolio',
    description: 'Clean design for developers and programmers',
    category: 'portfolio',
    image: '💻',
    is_featured: false,
    html_base: `<div class="dev-hero">
  <h1>Developer Name</h1>
  <p>Full Stack Developer</p>
</div>
<div class="skills-section">
  <h2>Skills</h2>
  <div class="skills-grid">
    <div class="skill">JavaScript</div>
    <div class="skill">React</div>
    <div class="skill">Node.js</div>
  </div>
</div>`,
    css_base: `.dev-hero { background: #1a1a1a; color: #00ff00; padding: 100px 0; text-align: center; font-family: monospace; }
.dev-hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
.skills-section { padding: 80px 0; background: #f0f0f0; }
.skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.skill { background: white; padding: 20px; text-align: center; border-radius: 5px; }`
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
    <h1>Company Name</h1>
    <p>Leading Industry Solutions</p>
    <button class="btn-primary">Learn More</button>
  </div>
</div>
<div class="services-section">
  <div class="container">
    <h2>Our Services</h2>
    <div class="services-grid">
      <div class="service">Service 1</div>
      <div class="service">Service 2</div>
      <div class="service">Service 3</div>
    </div>
  </div>
</div>`,
    css_base: `.corporate-hero { background: #2c3e50; color: white; padding: 100px 0; text-align: center; }
.corporate-hero h1 { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
.btn-primary { background: #3498db; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 1rem; }
.services-section { padding: 80px 0; background: white; }
.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.service { background: #f8f9fa; padding: 40px; text-align: center; border-radius: 10px; }`
  },
  {
    id: 'business-startup',
    name: 'Startup Business',
    description: 'Modern and energetic design for startups',
    category: 'business',
    image: '🚀',
    is_featured: false,
    html_base: `<div class="startup-hero">
  <h1>Startup Name</h1>
  <p>Innovation Starts Here</p>
  <button class="cta-btn">Get Started</button>
</div>
<div class="features-section">
  <h2>Why Choose Us</h2>
  <div class="features-grid">
    <div class="feature">Feature 1</div>
    <div class="feature">Feature 2</div>
    <div class="feature">Feature 3</div>
  </div>
</div>`,
    css_base: `.startup-hero { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 120px 0; text-align: center; }
.startup-hero h1 { font-size: 3.5rem; font-weight: bold; margin-bottom: 1rem; }
.cta-btn { background: white; color: #ff6b6b; padding: 15px 40px; border: none; border-radius: 30px; font-weight: bold; }
.features-section { padding: 100px 0; background: white; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.feature { text-align: center; padding: 30px; }`
  },
  {
    id: 'business-agency',
    name: 'Agency Business',
    description: 'Creative agency website template',
    category: 'business',
    image: '🎯',
    is_featured: false,
    html_base: `<div class="agency-hero">
  <h1>Agency Name</h1>
  <p>Creative Solutions</p>
</div>
<div class="portfolio-section">
  <h2>Our Work</h2>
  <div class="work-grid">
    <div class="work-item">Project 1</div>
    <div class="work-item">Project 2</div>
  </div>
</div>`,
    css_base: `.agency-hero { background: #1a1a1a; color: white; padding: 100px 0; text-align: center; }
.agency-hero h1 { font-size: 3rem; font-weight: 300; }
.portfolio-section { padding: 80px 0; background: #f8f9fa; }
.work-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.work-item { background: white; padding: 50px; text-align: center; }`
  },
  {
    id: 'business-restaurant',
    name: 'Restaurant Business',
    description: 'Perfect for restaurants and food businesses',
    category: 'business',
    image: '🍽️',
    is_featured: false,
    html_base: `<div class="restaurant-hero">
  <h1>Restaurant Name</h1>
  <p>Fine Dining Experience</p>
</div>
<div class="menu-section">
  <h2>Our Menu</h2>
  <div class="menu-items">
    <div class="menu-item">Dish 1</div>
    <div class="menu-item">Dish 2</div>
  </div>
</div>`,
    css_base: `.restaurant-hero { background: #8b4513; color: white; padding: 100px 0; text-align: center; }
.restaurant-hero h1 { font-size: 3rem; font-family: serif; }
.menu-section { padding: 80px 0; background: #f5f5dc; }
.menu-items { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.menu-item { background: white; padding: 30px; text-align: center; }`
  },
  {
    id: 'business-healthcare',
    name: 'Healthcare Business',
    description: 'Professional healthcare website template',
    category: 'business',
    image: '🏥',
    is_featured: false,
    html_base: `<div class="healthcare-hero">
  <h1>Healthcare Center</h1>
  <p>Your Health, Our Priority</p>
</div>
<div class="services-section">
  <h2>Our Services</h2>
  <div class="services-grid">
    <div class="service">Service 1</div>
    <div class="service">Service 2</div>
  </div>
</div>`,
    css_base: `.healthcare-hero { background: #2c5aa0; color: white; padding: 100px 0; text-align: center; }
.healthcare-hero h1 { font-size: 3rem; font-weight: 300; }
.services-section { padding: 80px 0; background: white; }
.services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.service { background: #f0f8ff; padding: 40px; text-align: center; }`
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
  <h1>Your Blog Name</h1>
  <p>Thoughts and Stories</p>
</div>
<div class="posts-section">
  <h2>Latest Posts</h2>
  <div class="posts-grid">
    <div class="post">Post 1</div>
    <div class="post">Post 2</div>
    <div class="post">Post 3</div>
  </div>
</div>`,
    css_base: `.blog-hero { background: #f8f9fa; padding: 100px 0; text-align: center; }
.blog-hero h1 { font-size: 3rem; font-weight: 300; color: #333; }
.posts-section { padding: 80px 0; background: white; }
.posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.post { background: #f8f9fa; padding: 30px; border-radius: 10px; }`
  },
  {
    id: 'personal-resume',
    name: 'Personal Resume',
    description: 'Professional resume website template',
    category: 'personal',
    image: '📄',
    is_featured: false,
    html_base: `<div class="resume-hero">
  <h1>Your Name</h1>
  <p>Professional Title</p>
</div>
<div class="experience-section">
  <h2>Experience</h2>
  <div class="experience-item">Job 1</div>
  <div class="experience-item">Job 2</div>
</div>`,
    css_base: `.resume-hero { background: #2c3e50; color: white; padding: 100px 0; text-align: center; }
.resume-hero h1 { font-size: 2.5rem; font-weight: bold; }
.experience-section { padding: 80px 0; background: white; }
.experience-item { background: #f8f9fa; padding: 30px; margin-bottom: 20px; }`
  },
  {
    id: 'personal-wedding',
    name: 'Wedding Personal',
    description: 'Beautiful template for wedding websites',
    category: 'personal',
    image: '💒',
    is_featured: false,
    html_base: `<div class="wedding-hero">
  <h1>John & Jane</h1>
  <p>June 15, 2024</p>
</div>
<div class="story-section">
  <h2>Our Story</h2>
  <p>Tell your love story...</p>
</div>`,
    css_base: `.wedding-hero { background: linear-gradient(45deg, #ff9a9e, #fecfef); color: white; padding: 120px 0; text-align: center; }
.wedding-hero h1 { font-size: 3rem; font-family: serif; }
.story-section { padding: 80px 0; background: white; text-align: center; }`
  },
  {
    id: 'personal-family',
    name: 'Family Personal',
    description: 'Warm template for family websites',
    category: 'personal',
    image: '👨‍👩‍👧‍👦',
    is_featured: false,
    html_base: `<div class="family-hero">
  <h1>The Smith Family</h1>
  <p>Our Journey Together</p>
</div>
<div class="gallery-section">
  <h2>Family Photos</h2>
  <div class="photo-grid">
    <div class="photo">Photo 1</div>
    <div class="photo">Photo 2</div>
  </div>
</div>`,
    css_base: `.family-hero { background: #ffb6c1; color: white; padding: 100px 0; text-align: center; }
.family-hero h1 { font-size: 3rem; font-weight: bold; }
.gallery-section { padding: 80px 0; background: white; }
.photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.photo { background: #f0f0f0; padding: 40px; text-align: center; }`
  },
  {
    id: 'personal-travel',
    name: 'Travel Personal',
    description: 'Adventure-focused template for travel blogs',
    category: 'personal',
    image: '✈️',
    is_featured: false,
    html_base: `<div class="travel-hero">
  <h1>Adventure Awaits</h1>
  <p>Exploring the World</p>
</div>
<div class="destinations-section">
  <h2>Destinations</h2>
  <div class="destinations-grid">
    <div class="destination">Place 1</div>
    <div class="destination">Place 2</div>
  </div>
</div>`,
    css_base: `.travel-hero { background: linear-gradient(45deg, #74b9ff, #0984e3); color: white; padding: 100px 0; text-align: center; }
.travel-hero h1 { font-size: 3rem; font-weight: bold; }
.destinations-section { padding: 80px 0; background: white; }
.destinations-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.destination { background: #f8f9fa; padding: 40px; text-align: center; }`
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
  <h1>Artist Name</h1>
  <p>Visual Storyteller</p>
</div>
<div class="artwork-section">
  <h2>My Artwork</h2>
  <div class="artwork-grid">
    <div class="artwork">Art 1</div>
    <div class="artwork">Art 2</div>
    <div class="artwork">Art 3</div>
  </div>
</div>`,
    css_base: `.artist-hero { background: #e17055; color: white; padding: 100px 0; text-align: center; }
.artist-hero h1 { font-size: 3.5rem; font-weight: bold; }
.artwork-section { padding: 80px 0; background: #2d3436; color: white; }
.artwork-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.artwork { background: #636e72; padding: 40px; text-align: center; }`
  },
  {
    id: 'creative-music',
    name: 'Music Creative',
    description: 'Dynamic template for musicians and bands',
    category: 'creative',
    image: '🎵',
    is_featured: false,
    html_base: `<div class="music-hero">
  <h1>Band Name</h1>
  <p>Rock & Roll</p>
</div>
<div class="albums-section">
  <h2>Discography</h2>
  <div class="albums-grid">
    <div class="album">Album 1</div>
    <div class="album">Album 2</div>
  </div>
</div>`,
    css_base: `.music-hero { background: #000; color: white; padding: 100px 0; text-align: center; }
.music-hero h1 { font-size: 4rem; font-weight: bold; }
.albums-section { padding: 80px 0; background: #1a1a1a; color: white; }
.albums-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.album { background: #333; padding: 40px; text-align: center; }`
  },
  {
    id: 'creative-fashion',
    name: 'Fashion Creative',
    description: 'Stylish template for fashion designers',
    category: 'creative',
    image: '👗',
    is_featured: false,
    html_base: `<div class="fashion-hero">
  <h1>Fashion Brand</h1>
  <p>Style & Elegance</p>
</div>
<div class="collection-section">
  <h2>Collections</h2>
  <div class="collection-grid">
    <div class="collection">Collection 1</div>
    <div class="collection">Collection 2</div>
  </div>
</div>`,
    css_base: `.fashion-hero { background: #f8f9fa; color: #333; padding: 100px 0; text-align: center; }
.fashion-hero h1 { font-size: 3rem; font-weight: 300; }
.collection-section { padding: 80px 0; background: white; }
.collection-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.collection { background: #f8f9fa; padding: 40px; text-align: center; }`
  },
  {
    id: 'creative-writer',
    name: 'Writer Creative',
    description: 'Elegant template for writers and authors',
    category: 'creative',
    image: '✍️',
    is_featured: false,
    html_base: `<div class="writer-hero">
  <h1>Author Name</h1>
  <p>Words That Matter</p>
</div>
<div class="books-section">
  <h2>Published Works</h2>
  <div class="books-grid">
    <div class="book">Book 1</div>
    <div class="book">Book 2</div>
  </div>
</div>`,
    css_base: `.writer-hero { background: #2c3e50; color: white; padding: 100px 0; text-align: center; }
.writer-hero h1 { font-size: 3rem; font-family: serif; }
.books-section { padding: 80px 0; background: #f8f9fa; }
.books-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.book { background: white; padding: 40px; text-align: center; }`
  },
  {
    id: 'creative-photographer',
    name: 'Photographer Creative',
    description: 'Visual-focused template for photographers',
    category: 'creative',
    image: '📷',
    is_featured: false,
    html_base: `<div class="photographer-hero">
  <h1>Photographer Name</h1>
  <p>Capturing Moments</p>
</div>
<div class="portfolio-section">
  <h2>Portfolio</h2>
  <div class="portfolio-grid">
    <div class="portfolio-item">Photo 1</div>
    <div class="portfolio-item">Photo 2</div>
    <div class="portfolio-item">Photo 3</div>
    <div class="portfolio-item">Photo 4</div>
  </div>
</div>`,
    css_base: `.photographer-hero { background: #000; color: white; padding: 100px 0; text-align: center; }
.photographer-hero h1 { font-size: 3rem; font-weight: 300; }
.portfolio-section { padding: 80px 0; background: #1a1a1a; color: white; }
.portfolio-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; }
.portfolio-item { aspect-ratio: 1; background: #333; display: flex; align-items: center; justify-content: center; }`
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
  <h1>Product Name</h1>
  <p>Revolutionary Solution</p>
  <button class="cta-button">Start Free Trial</button>
</div>
<div class="features-section">
  <h2>Features</h2>
  <div class="features-grid">
    <div class="feature">Feature 1</div>
    <div class="feature">Feature 2</div>
    <div class="feature">Feature 3</div>
  </div>
</div>`,
    css_base: `.saas-hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 120px 0; text-align: center; }
.saas-hero h1 { font-size: 3.5rem; font-weight: bold; margin-bottom: 1rem; }
.cta-button { background: #ff6b6b; color: white; padding: 15px 40px; border: none; border-radius: 30px; font-size: 1.1rem; }
.features-section { padding: 100px 0; background: white; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.feature { text-align: center; padding: 30px; }`
  },
  {
    id: 'landing-app',
    name: 'App Landing',
    description: 'Mobile app landing page template',
    category: 'landing',
    image: '📱',
    is_featured: false,
    html_base: `<div class="app-hero">
  <h1>App Name</h1>
  <p>Download Now</p>
  <div class="download-buttons">
    <button class="download-btn">App Store</button>
    <button class="download-btn">Google Play</button>
  </div>
</div>
<div class="screenshots-section">
  <h2>Screenshots</h2>
  <div class="screenshots-grid">
    <div class="screenshot">Screenshot 1</div>
    <div class="screenshot">Screenshot 2</div>
  </div>
</div>`,
    css_base: `.app-hero { background: #4ecdc4; color: white; padding: 100px 0; text-align: center; }
.app-hero h1 { font-size: 3rem; font-weight: bold; }
.download-buttons { display: flex; gap: 20px; justify-content: center; margin-top: 30px; }
.download-btn { background: white; color: #4ecdc4; padding: 15px 30px; border: none; border-radius: 25px; }
.screenshots-section { padding: 80px 0; background: white; }
.screenshots-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.screenshot { background: #f0f0f0; padding: 40px; text-align: center; }`
  },
  {
    id: 'landing-course',
    name: 'Course Landing',
    description: 'Educational course landing page',
    category: 'landing',
    image: '🎓',
    is_featured: false,
    html_base: `<div class="course-hero">
  <h1>Course Name</h1>
  <p>Learn Something New</p>
  <button class="enroll-btn">Enroll Now</button>
</div>
<div class="curriculum-section">
  <h2>Curriculum</h2>
  <div class="lessons-grid">
    <div class="lesson">Lesson 1</div>
    <div class="lesson">Lesson 2</div>
    <div class="lesson">Lesson 3</div>
  </div>
</div>`,
    css_base: `.course-hero { background: #ff9ff3; color: white; padding: 100px 0; text-align: center; }
.course-hero h1 { font-size: 3rem; font-weight: bold; }
.enroll-btn { background: white; color: #ff9ff3; padding: 15px 40px; border: none; border-radius: 30px; font-weight: bold; }
.curriculum-section { padding: 80px 0; background: white; }
.lessons-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.lesson { background: #f8f9fa; padding: 30px; text-align: center; }`
  },
  {
    id: 'landing-event',
    name: 'Event Landing',
    description: 'Event and conference landing page',
    category: 'landing',
    image: '🎪',
    is_featured: false,
    html_base: `<div class="event-hero">
  <h1>Event Name</h1>
  <p>Date & Location</p>
  <button class="register-btn">Register Now</button>
</div>
<div class="speakers-section">
  <h2>Speakers</h2>
  <div class="speakers-grid">
    <div class="speaker">Speaker 1</div>
    <div class="speaker">Speaker 2</div>
  </div>
</div>`,
    css_base: `.event-hero { background: #6c5ce7; color: white; padding: 100px 0; text-align: center; }
.event-hero h1 { font-size: 3rem; font-weight: bold; }
.register-btn { background: #ff6b6b; color: white; padding: 15px 40px; border: none; border-radius: 30px; }
.speakers-section { padding: 80px 0; background: white; }
.speakers-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.speaker { background: #f8f9fa; padding: 40px; text-align: center; }`
  },
  {
    id: 'landing-product',
    name: 'Product Landing',
    description: 'E-commerce product landing page',
    category: 'landing',
    image: '🛍️',
    is_featured: false,
    html_base: `<div class="product-hero">
  <h1>Product Name</h1>
  <p>Amazing Product Description</p>
  <button class="buy-btn">Buy Now</button>
</div>
<div class="benefits-section">
  <h2>Why Choose Us</h2>
  <div class="benefits-grid">
    <div class="benefit">Benefit 1</div>
    <div class="benefit">Benefit 2</div>
    <div class="benefit">Benefit 3</div>
  </div>
</div>`,
    css_base: `.product-hero { background: #fd79a8; color: white; padding: 100px 0; text-align: center; }
.product-hero h1 { font-size: 3rem; font-weight: bold; }
.buy-btn { background: white; color: #fd79a8; padding: 15px 40px; border: none; border-radius: 30px; font-weight: bold; }
.benefits-section { padding: 80px 0; background: white; }
.benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.benefit { text-align: center; padding: 30px; }`
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




