// Simple test to verify templates are working
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
</div>`,
    css_base: `.hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 100px 0; text-align: center; color: white; }
.hero-title { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
.hero-subtitle { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
.cta-button { background: #ff6b6b; color: white; padding: 12px 30px; border: none; border-radius: 25px; font-size: 1rem; cursor: pointer; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }`
  },
  {
    id: 'business-corporate',
    name: 'Corporate Business',
    description: 'Professional design for corporate websites',
    category: 'business',
    image: '💼',
    is_featured: true,
    html_base: `<div class="corporate-hero">
  <div class="container">
    <h1>Company Name</h1>
    <p>Leading Industry Solutions</p>
    <button class="btn-primary">Learn More</button>
  </div>
</div>`,
    css_base: `.corporate-hero { background: #2c3e50; color: white; padding: 100px 0; text-align: center; }
.corporate-hero h1 { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
.btn-primary { background: #3498db; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 1rem; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }`
  },
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
</div>`,
    css_base: `.blog-hero { background: #f8f9fa; padding: 100px 0; text-align: center; }
.blog-hero h1 { font-size: 3rem; font-weight: 300; color: #333; }`
  },
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
</div>`,
    css_base: `.artist-hero { background: #e17055; color: white; padding: 100px 0; text-align: center; }
.artist-hero h1 { font-size: 3.5rem; font-weight: bold; }`
  },
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
</div>`,
    css_base: `.saas-hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 120px 0; text-align: center; }
.saas-hero h1 { font-size: 3.5rem; font-weight: bold; margin-bottom: 1rem; }
.cta-button { background: #ff6b6b; color: white; padding: 15px 40px; border: none; border-radius: 30px; font-size: 1.1rem; }`
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







