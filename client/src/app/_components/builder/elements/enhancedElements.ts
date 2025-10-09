// elements/enhancedElements.ts
import { Element } from './base/ElementInterface';

export interface HeroElement extends Element {
  type: 'hero';
  heroContent: {
    title: string;
    subtitle: string;
    buttons: Array<{
      text: string;
      type: 'primary' | 'secondary';
      link?: string;
    }>;
  };
  background: {
    type: 'gradient' | 'image' | 'solid';
    value: string;
    animation?: string;
  };
}

export interface NavigationElement extends Element {
  type: 'navigation';
  navContent: {
    logo: string;
    links: Array<{
      text: string;
      href: string;
    }>;
  };
  style: 'transparent' | 'solid' | 'glass';
}

export interface GalleryElement extends Element {
  type: 'gallery';
  galleryContent: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      image?: string;
      gradient?: string;
    }>;
  };
  layout: 'grid' | 'masonry' | 'carousel';
}

export interface ServicesElement extends Element {
  type: 'services';
  servicesContent: {
    title: string;
    services: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  layout: 'grid' | 'list' | 'cards';
}

export interface StatsElement extends Element {
  type: 'stats';
  statsContent: {
    title: string;
    stats: Array<{
      number: string;
      label: string;
    }>;
  };
  layout: 'horizontal' | 'vertical' | 'grid';
}

export interface FooterElement extends Element {
  type: 'footer';
  footerContent: {
    title: string;
    description: string;
    ctaButton?: {
      text: string;
      link: string;
    };
  };
  style: 'minimal' | 'detailed' | 'dark';
}

// Enhanced element factory
export class EnhancedElementFactory {
  static createHeroElement(id: string, content: any): HeroElement {
    return {
      id,
      type: 'hero',
      content: content.title || 'Hero Section',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 600 },
      styles: {
        backgroundColor: content.background?.value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '100px 0'
      },
      animation: undefined,
      interaction: undefined,
      heroContent: {
        title: content.title || 'Welcome to Our Website',
        subtitle: content.subtitle || 'Creating amazing digital experiences',
        buttons: content.buttons || [
          { text: 'Get Started', type: 'primary' },
          { text: 'Learn More', type: 'secondary' }
        ]
      },
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }
    };
  }

  static createNavigationElement(id: string, content: any): NavigationElement {
    return {
      id,
      type: 'navigation',
      content: content.logo || 'Logo',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 80 },
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        position: 'absolute',
        top: '0px',
        left: '0px',
        right: '0px',
        zIndex: '100'
      },
      animation: undefined,
      interaction: undefined,
      navContent: {
        logo: content.logo || 'Brand Name',
        links: content.links || [
          { text: 'Home', href: '#home' },
          { text: 'About', href: '#about' },
          { text: 'Contact', href: '#contact' }
        ]
      },
      style: 'transparent'
    };
  }

  static createGalleryElement(id: string, content: any): GalleryElement {
    return {
      id,
      type: 'gallery',
      content: content.title || 'Gallery',
      position: { x: 0, y: 400 },
      size: { width: 1200, height: 500 },
      styles: {
        padding: '80px 0',
        backgroundColor: '#f8f9fa'
      },
      animation: undefined,
      interaction: undefined,
      galleryContent: {
        title: content.title || 'Our Work',
        items: content.items || [
          { title: 'Project 1', description: 'Description of project 1', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
          { title: 'Project 2', description: 'Description of project 2', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
          { title: 'Project 3', description: 'Description of project 3', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' }
        ]
      },
      layout: 'grid'
    };
  }

  static createServicesElement(id: string, content: any): ServicesElement {
    return {
      id,
      type: 'services',
      content: content.title || 'Services',
      position: { x: 0, y: 900 },
      size: { width: 1200, height: 400 },
      styles: {
        padding: '80px 0',
        backgroundColor: 'white'
      },
      animation: undefined,
      interaction: undefined,
      servicesContent: {
        title: content.title || 'Our Services',
        services: content.services || [
          { icon: '📊', title: 'Service 1', description: 'Description of service 1' },
          { icon: '💼', title: 'Service 2', description: 'Description of service 2' },
          { icon: '📈', title: 'Service 3', description: 'Description of service 3' }
        ]
      },
      layout: 'grid'
    };
  }

  static createStatsElement(id: string, content: any): StatsElement {
    return {
      id,
      type: 'stats',
      content: content.title || 'Statistics',
      position: { x: 0, y: 1300 },
      size: { width: 1200, height: 200 },
      styles: {
        padding: '60px 0',
        backgroundColor: '#2c3e50',
        color: 'white',
        textAlign: 'center'
      },
      animation: undefined,
      interaction: undefined,
      statsContent: {
        title: content.title || 'Our Impact',
        stats: content.stats || [
          { number: '500+', label: 'Clients Served' },
          { number: '15', label: 'Years Experience' },
          { number: '99%', label: 'Success Rate' }
        ]
      },
      layout: 'horizontal'
    };
  }

  static createFooterElement(id: string, content: any): FooterElement {
    return {
      id,
      type: 'footer',
      content: content.title || 'Footer',
      position: { x: 0, y: 1500 },
      size: { width: 1200, height: 200 },
      styles: {
        padding: '60px 0',
        backgroundColor: '#2c3e50',
        color: 'white',
        textAlign: 'center'
      },
      animation: undefined,
      interaction: undefined,
      footerContent: {
        title: content.title || 'Get In Touch',
        description: content.description || 'Ready to work together?',
        ctaButton: content.ctaButton || { text: 'Contact Us', link: '#contact' }
      },
      style: 'dark'
    };
  }
}
