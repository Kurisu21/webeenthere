// Enhanced template structure with real elements
export interface TemplateElement {
  id: string;
  type: string;
  content: string;
  styles: {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    textAlign?: 'left' | 'center' | 'right';
    borderRadius?: string;
    width?: string;
    height?: string;
    border?: string;
    borderColor?: string;
    opacity?: string;
  };
  position: { x: number; y: number };
  size: { width: number; height: number };
  imageUrl?: string;
}

export interface EnhancedTemplate {
  id: string;
  name: string;
  description: string;
  category: 'portfolio' | 'business' | 'personal' | 'creative' | 'landing';
  image: string;
  previewImage?: string; // For modal preview
  elements: TemplateElement[];
  css_base: string;
  is_featured: boolean;
  tags: string[];
}

export const enhancedTemplates: EnhancedTemplate[] = [
  // Test Template (for debugging)
  {
    id: 'test-template',
    name: 'Test Template',
    description: 'Simple test template for debugging',
    category: 'portfolio',
    image: '',
    previewImage: '/test.jpg',
    is_featured: true,
    tags: ['test', 'simple', 'debug'],
    elements: [
      {
        id: 'test-hero',
        type: 'hero',
        content: 'Test Hero Title',
        styles: {
          color: '#ffffff',
          fontSize: '32px',
          fontWeight: 'bold',
          backgroundColor: '#667eea',
          padding: '20px',
          textAlign: 'center'
        },
        position: { x: 100, y: 100 },
        size: { width: 400, height: 100 }
      },
      {
        id: 'test-text',
        type: 'text',
        content: 'This is test content',
        styles: {
          color: '#333333',
          fontSize: '16px',
          fontWeight: 'normal',
          backgroundColor: 'transparent',
          padding: '10px',
          textAlign: 'left'
        },
        position: { x: 100, y: 250 },
        size: { width: 300, height: 50 }
      }
    ],
    css_base: `body { font-family: Arial, sans-serif; }`
  },

  // Portfolio Templates
  {
    id: 'portfolio-modern',
    name: 'Modern Portfolio',
    description: 'Clean and minimal design perfect for showcasing creative work',
    category: 'portfolio',
    image: '',
    previewImage: '/templates/portfolio-modern-preview.jpg',
    is_featured: true,
    tags: ['modern', 'minimal', 'creative', 'responsive'],
    elements: [
      {
        id: 'nav-1',
        type: 'navigation',
        content: 'Your Name',
        styles: {
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '20px 0',
          textAlign: 'left'
        },
        position: { x: 50, y: 20 },
        size: { width: 200, height: 60 }
      },
      {
        id: 'nav-links-1',
        type: 'navigation',
        content: 'Work | About | Contact',
        styles: {
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          backgroundColor: 'transparent',
          padding: '20px 0',
          textAlign: 'right'
        },
        position: { x: 800, y: 20 },
        size: { width: 300, height: 60 }
      },
      {
        id: 'hero-title-1',
        type: 'hero',
        content: 'Creative Designer & Developer',
        styles: {
          color: '#ffffff',
          fontSize: '56px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 200, y: 200 },
        size: { width: 800, height: 80 }
      },
      {
        id: 'hero-subtitle-1',
        type: 'text',
        content: 'I craft beautiful digital experiences that tell your story',
        styles: {
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: '400',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '0.9'
        },
        position: { x: 300, y: 300 },
        size: { width: 600, height: 40 }
      },
      {
        id: 'cta-button-1',
        type: 'button',
        content: 'View My Work',
        styles: {
          color: '#667eea',
          fontSize: '18px',
          fontWeight: '600',
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: '15px 40px',
          textAlign: 'center',
          borderRadius: '50px',
          border: '2px solid #ffffff',
          opacity: '1'
        },
        position: { x: 450, y: 380 },
        size: { width: 200, height: 60 }
      },
      {
        id: 'about-title-1',
        type: 'text',
        content: 'About Me',
        styles: {
          color: '#333333',
          fontSize: '40px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 500, y: 600 },
        size: { width: 200, height: 50 }
      },
      {
        id: 'about-text-1',
        type: 'text',
        content: 'I\'m a passionate designer and developer with 5+ years of experience creating digital experiences that matter. I specialize in user-centered design and modern web development.',
        styles: {
          color: '#666666',
          fontSize: '18px',
          fontWeight: '400',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 200, y: 680 },
        size: { width: 800, height: 80 }
      },
      {
        id: 'portfolio-title-1',
        type: 'text',
        content: 'Featured Work',
        styles: {
          color: '#333333',
          fontSize: '40px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 500, y: 850 },
        size: { width: 200, height: 50 }
      },
      {
        id: 'project-1',
        type: 'gallery',
        content: 'E-commerce Platform',
        styles: {
          color: '#333333',
          fontSize: '20px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '15px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 100, y: 950 },
        size: { width: 300, height: 300 }
      },
      {
        id: 'project-2',
        type: 'gallery',
        content: 'Mobile App Design',
        styles: {
          color: '#333333',
          fontSize: '20px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '15px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 450, y: 950 },
        size: { width: 300, height: 300 }
      },
      {
        id: 'project-3',
        type: 'gallery',
        content: 'Brand Identity',
        styles: {
          color: '#333333',
          fontSize: '20px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '15px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 800, y: 950 },
        size: { width: 300, height: 300 }
      },
      {
        id: 'contact-title-1',
        type: 'text',
        content: 'Let\'s Work Together',
        styles: {
          color: '#ffffff',
          fontSize: '40px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 500, y: 1350 },
        size: { width: 200, height: 50 }
      },
      {
        id: 'contact-text-1',
        type: 'text',
        content: 'Ready to bring your ideas to life? Let\'s discuss your project.',
        styles: {
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '400',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '0.9'
        },
        position: { x: 300, y: 1420 },
        size: { width: 600, height: 40 }
      },
      {
        id: 'contact-button-1',
        type: 'button',
        content: 'Get In Touch',
        styles: {
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '600',
          backgroundColor: '#e74c3c',
          padding: '15px 40px',
          textAlign: 'center',
          borderRadius: '50px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 500, y: 1480 },
        size: { width: 200, height: 60 }
      }
    ],
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

/* Template-specific styles */
.hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; display: flex; flex-direction: column; }
.about-section { background: #f8f9fa; padding: 100px 0; }
.portfolio-section { padding: 100px 0; background: white; }
.contact-section { background: #2c3e50; color: white; text-align: center; padding: 100px 0; }`
  },

  // Business Template
  {
    id: 'business-corporate',
    name: 'Corporate Business',
    description: 'Professional design for corporate websites',
    category: 'business',
    image: '',
    previewImage: '/templates/business-corporate-preview.jpg',
    is_featured: true,
    tags: ['corporate', 'professional', 'business', 'clean'],
    elements: [
      {
        id: 'nav-2',
        type: 'navigation',
        content: 'Company Name',
        styles: {
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '20px 0',
          textAlign: 'left'
        },
        position: { x: 50, y: 20 },
        size: { width: 250, height: 60 }
      },
      {
        id: 'nav-links-2',
        type: 'navigation',
        content: 'Services | About | Contact',
        styles: {
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          backgroundColor: 'transparent',
          padding: '20px 0',
          textAlign: 'right'
        },
        position: { x: 800, y: 20 },
        size: { width: 300, height: 60 }
      },
      {
        id: 'hero-title-2',
        type: 'hero',
        content: 'Leading Industry Solutions',
        styles: {
          color: '#ffffff',
          fontSize: '56px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 200, y: 200 },
        size: { width: 800, height: 80 }
      },
      {
        id: 'hero-subtitle-2',
        type: 'text',
        content: 'We provide innovative solutions that drive business growth and success',
        styles: {
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: '400',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '0.9'
        },
        position: { x: 250, y: 300 },
        size: { width: 700, height: 40 }
      },
      {
        id: 'cta-button-2',
        type: 'button',
        content: 'Learn More',
        styles: {
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '600',
          backgroundColor: '#e74c3c',
          padding: '15px 40px',
          textAlign: 'center',
          borderRadius: '5px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 500, y: 380 },
        size: { width: 200, height: 60 }
      },
      {
        id: 'services-title-2',
        type: 'text',
        content: 'Our Services',
        styles: {
          color: '#333333',
          fontSize: '40px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 500, y: 600 },
        size: { width: 200, height: 50 }
      },
      {
        id: 'service-1',
        type: 'feature',
        content: 'Business Consulting',
        styles: {
          color: '#333333',
          fontSize: '24px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '40px 20px',
          textAlign: 'center',
          borderRadius: '10px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 100, y: 700 },
        size: { width: 300, height: 200 }
      },
      {
        id: 'service-2',
        type: 'feature',
        content: 'Project Management',
        styles: {
          color: '#333333',
          fontSize: '24px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '40px 20px',
          textAlign: 'center',
          borderRadius: '10px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 450, y: 700 },
        size: { width: 300, height: 200 }
      },
      {
        id: 'service-3',
        type: 'feature',
        content: 'Growth Strategy',
        styles: {
          color: '#333333',
          fontSize: '24px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '40px 20px',
          textAlign: 'center',
          borderRadius: '10px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 800, y: 700 },
        size: { width: 300, height: 200 }
      },
      {
        id: 'stats-title-2',
        type: 'text',
        content: 'Our Achievements',
        styles: {
          color: '#333333',
          fontSize: '40px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 500, y: 1000 },
        size: { width: 200, height: 50 }
      },
      {
        id: 'stat-1',
        type: 'testimonial',
        content: '500+ Projects Completed',
        styles: {
          color: '#2c3e50',
          fontSize: '48px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 200, y: 1100 },
        size: { width: 200, height: 60 }
      },
      {
        id: 'stat-2',
        type: 'testimonial',
        content: '98% Client Satisfaction',
        styles: {
          color: '#2c3e50',
          fontSize: '48px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 500, y: 1100 },
        size: { width: 200, height: 60 }
      },
      {
        id: 'stat-3',
        type: 'testimonial',
        content: '10+ Years Experience',
        styles: {
          color: '#2c3e50',
          fontSize: '48px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 800, y: 1100 },
        size: { width: 200, height: 60 }
      }
    ],
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Roboto', sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.corporate-hero { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 100px 0; }
.services-section { padding: 100px 0; background: white; }
.stats-section { background: #f8f9fa; padding: 80px 0; }`
  },

  // Landing Page Template
  {
    id: 'landing-saas',
    name: 'SaaS Landing',
    description: 'Modern landing page for SaaS products',
    category: 'landing',
    image: '',
    previewImage: '/templates/saas-landing-preview.jpg',
    is_featured: true,
    tags: ['saas', 'modern', 'conversion', 'tech'],
    elements: [
      {
        id: 'nav-3',
        type: 'navigation',
        content: 'ProductName',
        styles: {
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '20px 0',
          textAlign: 'left'
        },
        position: { x: 50, y: 20 },
        size: { width: 200, height: 60 }
      },
      {
        id: 'nav-links-3',
        type: 'navigation',
        content: 'Features | Pricing | Contact',
        styles: {
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          backgroundColor: 'transparent',
          padding: '20px 0',
          textAlign: 'right'
        },
        position: { x: 800, y: 20 },
        size: { width: 300, height: 60 }
      },
      {
        id: 'hero-title-3',
        type: 'hero',
        content: 'Revolutionary Solution',
        styles: {
          color: '#ffffff',
          fontSize: '56px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 200, y: 200 },
        size: { width: 800, height: 80 }
      },
      {
        id: 'hero-subtitle-3',
        type: 'text',
        content: 'Transform your workflow with our cutting-edge platform',
        styles: {
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: '400',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '0.9'
        },
        position: { x: 250, y: 300 },
        size: { width: 700, height: 40 }
      },
      {
        id: 'cta-button-3',
        type: 'button',
        content: 'Start Free Trial',
        styles: {
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '600',
          backgroundColor: '#ff6b6b',
          padding: '15px 30px',
          textAlign: 'center',
          borderRadius: '30px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 400, y: 380 },
        size: { width: 200, height: 60 }
      },
      {
        id: 'demo-button-3',
        type: 'button',
        content: 'Watch Demo',
        styles: {
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '600',
          backgroundColor: 'transparent',
          padding: '15px 30px',
          textAlign: 'center',
          borderRadius: '30px',
          border: '2px solid #ffffff',
          opacity: '1'
        },
        position: { x: 650, y: 380 },
        size: { width: 200, height: 60 }
      },
      {
        id: 'features-title-3',
        type: 'text',
        content: 'Powerful Features',
        styles: {
          color: '#333333',
          fontSize: '40px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 500, y: 600 },
        size: { width: 200, height: 50 }
      },
      {
        id: 'feature-1',
        type: 'feature',
        content: 'Lightning Fast',
        styles: {
          color: '#333333',
          fontSize: '24px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '40px 20px',
          textAlign: 'center',
          borderRadius: '10px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 100, y: 700 },
        size: { width: 300, height: 200 }
      },
      {
        id: 'feature-2',
        type: 'feature',
        content: 'Secure & Reliable',
        styles: {
          color: '#333333',
          fontSize: '24px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '40px 20px',
          textAlign: 'center',
          borderRadius: '10px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 450, y: 700 },
        size: { width: 300, height: 200 }
      },
      {
        id: 'feature-3',
        type: 'feature',
        content: 'Real-time Analytics',
        styles: {
          color: '#333333',
          fontSize: '24px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '40px 20px',
          textAlign: 'center',
          borderRadius: '10px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 800, y: 700 },
        size: { width: 300, height: 200 }
      },
      {
        id: 'pricing-title-3',
        type: 'text',
        content: 'Simple Pricing',
        styles: {
          color: '#333333',
          fontSize: '40px',
          fontWeight: '700',
          backgroundColor: 'transparent',
          padding: '0',
          textAlign: 'center',
          opacity: '1'
        },
        position: { x: 500, y: 1000 },
        size: { width: 200, height: 50 }
      },
      {
        id: 'pricing-starter',
        type: 'contact',
        content: 'Starter - $29/month',
        styles: {
          color: '#333333',
          fontSize: '20px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '40px',
          textAlign: 'center',
          borderRadius: '15px',
          border: 'none',
          opacity: '1'
        },
        position: { x: 200, y: 1100 },
        size: { width: 300, height: 300 }
      },
      {
        id: 'pricing-pro',
        type: 'contact',
        content: 'Professional - $79/month',
        styles: {
          color: '#667eea',
          fontSize: '20px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          padding: '40px',
          textAlign: 'center',
          borderRadius: '15px',
          border: '3px solid #667eea',
          opacity: '1'
        },
        position: { x: 600, y: 1100 },
        size: { width: 300, height: 300 }
      }
    ],
    css_base: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.saas-hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; }
.features-section { padding: 100px 0; background: white; }
.pricing-section { background: #f8f9fa; padding: 100px 0; }`
  }
];

export const categories = [
  { id: 'portfolio', name: 'Portfolio', icon: '' },
  { id: 'business', name: 'Business', icon: '' },
  { id: 'personal', name: 'Personal', icon: '' },
  { id: 'creative', name: 'Creative', icon: '' },
  { id: 'landing', name: 'Landing Page', icon: '' }
];

export const getTemplatesByCategory = (category: string) => {
  return enhancedTemplates.filter(template => template.category === category);
};

export const getFeaturedTemplates = () => {
  return enhancedTemplates.filter(template => template.is_featured);
};

export const getTemplateById = (id: string) => {
  return enhancedTemplates.find(template => template.id === id);
};
