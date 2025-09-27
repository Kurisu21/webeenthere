import { Element, ElementConfig, ElementFactory, ElementRendererProps } from './ElementInterface';

// Import all element renderers
import TextElement from '../basic/TextElement';
import ButtonElement from '../basic/ButtonElement';
import ImageElement from '../basic/ImageElement';
import HeroElement from '../basic/HeroElement';
import DividerElement from '../layout/DividerElement';
import SpacerElement from '../layout/SpacerElement';
import LinkElement from '../layout/LinkElement';
import LogoElement from '../layout/LogoElement';
import ModalElement from '../interactive/ModalElement';
import TabsElement from '../interactive/TabsElement';
import AccordionElement from '../interactive/AccordionElement';
import SliderElement from '../interactive/SliderElement';
import RatingElement from '../interactive/RatingElement';
import ContactElement from '../forms/ContactElement';
import AboutElement from '../sections/AboutElement';
import GalleryElement from '../sections/GalleryElement';
import SocialElement from '../sections/SocialElement';

// Element configurations
const elementConfigs: Record<string, ElementConfig> = {
  // Basic elements
  text: {
    type: 'text',
    name: 'Text',
    category: 'basic',
    defaultContent: 'Your text content goes here',
    defaultStyles: {
      color: '#333333',
      fontSize: '16px',
      fontWeight: 'normal',
      backgroundColor: 'transparent',
      padding: '20px',
      textAlign: 'left',
      borderRadius: '0px'
    },
    defaultSize: { width: 200, height: 40 },
    icon: 'T',
    description: 'Add text content to your page'
  },
  button: {
    type: 'button',
    name: 'Button',
    category: 'basic',
    defaultContent: 'Click Me',
    defaultStyles: {
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 'bold',
      backgroundColor: '#ff6b6b',
      padding: '15px 30px',
      textAlign: 'center',
      borderRadius: '25px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(255,107,107,0.3)'
    },
    defaultSize: { width: 200, height: 60 },
    icon: '🔘',
    description: 'Interactive button element'
  },
  image: {
    type: 'image',
    name: 'Image',
    category: 'basic',
    defaultContent: 'Image placeholder',
    defaultStyles: {
      backgroundColor: '#f0f0f0',
      border: '2px dashed #ccc',
      padding: '20px',
      textAlign: 'center',
      borderRadius: '8px'
    },
    defaultSize: { width: 300, height: 200 },
    icon: 'I',
    description: 'Display images on your page'
  },
  hero: {
    type: 'hero',
    name: 'Hero',
    category: 'basic',
    defaultContent: 'Your Heading',
    defaultStyles: {
      color: '#ffffff',
      fontSize: '48px',
      fontWeight: 'bold',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '80px 20px',
      textAlign: 'center',
      borderRadius: '0px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    defaultSize: { width: 800, height: 200 },
    icon: 'H',
    description: 'Hero section with large heading'
  },
  
  // Layout elements
  divider: {
    type: 'divider',
    name: 'Divider',
    category: 'layout',
    defaultContent: '',
    defaultStyles: {
      backgroundColor: '#e0e0e0',
      height: '2px',
      width: '100%',
      margin: '20px 0'
    },
    defaultSize: { width: 400, height: 2 },
    icon: '➖',
    description: 'Visual divider line'
  },
  spacer: {
    type: 'spacer',
    name: 'Spacer',
    category: 'layout',
    defaultContent: '',
    defaultStyles: {
      backgroundColor: 'transparent'
    },
    defaultSize: { width: 100, height: 50 },
    icon: '📏',
    description: 'Add spacing between elements'
  },
  link: {
    type: 'link',
    name: 'Link',
    category: 'layout',
    defaultContent: 'Link text',
    defaultStyles: {
      color: '#0066cc',
      fontSize: '16px',
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    defaultSize: { width: 100, height: 30 },
    icon: 'L',
    description: 'Clickable link element'
  },
  logo: {
    type: 'logo',
    name: 'Logo',
    category: 'layout',
    defaultContent: 'Your Logo',
    defaultStyles: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333333',
      textAlign: 'center'
    },
    defaultSize: { width: 150, height: 50 },
    icon: '🏷️',
    description: 'Logo or brand element'
  },
  
  // Interactive elements
  modal: {
    type: 'modal',
    name: 'Modal',
    category: 'interactive',
    defaultContent: 'Modal content',
    defaultStyles: {
      backgroundColor: '#ffffff',
      padding: '30px',
      textAlign: 'center',
      borderRadius: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      color: '#333333',
      fontSize: '16px'
    },
    defaultSize: { width: 400, height: 300 },
    icon: '🪟',
    description: 'Modal dialog element'
  },
  tabs: {
    type: 'tabs',
    name: 'Tabs',
    category: 'interactive',
    defaultContent: 'Tab content',
    defaultStyles: {
      backgroundColor: '#ffffff',
      padding: '20px',
      textAlign: 'left',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      color: '#333333',
      fontSize: '16px'
    },
    defaultSize: { width: 400, height: 200 },
    icon: '📑',
    description: 'Tabbed content interface'
  },
  accordion: {
    type: 'accordion',
    name: 'Accordion',
    category: 'interactive',
    defaultContent: 'Accordion item',
    defaultStyles: {
      backgroundColor: '#ffffff',
      padding: '15px',
      textAlign: 'left',
      borderRadius: '5px',
      border: '1px solid #e0e0e0',
      color: '#333333',
      fontSize: '16px'
    },
    defaultSize: { width: 400, height: 150 },
    icon: 'A',
    description: 'Collapsible content sections'
  },
  slider: {
    type: 'slider',
    name: 'Slider',
    category: 'interactive',
    defaultContent: 'Slider content',
    defaultStyles: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      textAlign: 'center',
      borderRadius: '8px',
      color: '#333333',
      fontSize: '16px'
    },
    defaultSize: { width: 400, height: 100 },
    icon: '🎚️',
    description: 'Image or content slider'
  },
  rating: {
    type: 'rating',
    name: 'Rating',
    category: 'interactive',
    defaultContent: '★★★★★',
    defaultStyles: {
      color: '#ffc107',
      fontSize: '20px',
      backgroundColor: 'transparent',
      padding: '10px',
      textAlign: 'center'
    },
    defaultSize: { width: 150, height: 40 },
    icon: 'R',
    description: 'Star rating display'
  },
  
  // Form elements
  contact: {
    type: 'contact',
    name: 'Contact',
    category: 'forms',
    defaultContent: 'Contact form placeholder',
    defaultStyles: {
      backgroundColor: '#f8f9fa',
      padding: '30px',
      textAlign: 'center',
      borderRadius: '8px'
    },
    defaultSize: { width: 400, height: 300 },
    icon: '📧',
    description: 'Contact form element'
  },
  
  // Section elements
  about: {
    type: 'about',
    name: 'About',
    category: 'sections',
    defaultContent: 'About section content',
    defaultStyles: {
      color: '#333333',
      fontSize: '18px',
      fontWeight: 'normal',
      backgroundColor: '#f8f9fa',
      padding: '40px 20px',
      textAlign: 'center',
      borderRadius: '0px'
    },
    defaultSize: { width: 600, height: 200 },
    icon: 'ℹ️',
    description: 'About section with content'
  },
  gallery: {
    type: 'gallery',
    name: 'Gallery',
    category: 'sections',
    defaultContent: 'Gallery placeholder',
    defaultStyles: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      textAlign: 'center',
      borderRadius: '8px'
    },
    defaultSize: { width: 500, height: 300 },
    icon: 'I',
    description: 'Image gallery section'
  },
  social: {
    type: 'social',
    name: 'Social',
    category: 'sections',
    defaultContent: 'Social links placeholder',
    defaultStyles: {
      backgroundColor: 'transparent',
      padding: '10px',
      textAlign: 'center'
    },
    defaultSize: { width: 200, height: 50 },
    icon: 'L',
    description: 'Social media links'
  }
};

// Element renderers mapping
const elementRenderers: Record<string, React.ComponentType<ElementRendererProps>> = {
  text: TextElement,
  button: ButtonElement,
  image: ImageElement,
  hero: HeroElement,
  divider: DividerElement,
  spacer: SpacerElement,
  link: LinkElement,
  logo: LogoElement,
  modal: ModalElement,
  tabs: TabsElement,
  accordion: AccordionElement,
  slider: SliderElement,
  rating: RatingElement,
  contact: ContactElement,
  about: AboutElement,
  gallery: GalleryElement,
  social: SocialElement
};

// Element factory implementation
export const elementFactory: ElementFactory = {
  create: (type: string, id?: string): Element => {
    const config = elementConfigs[type];
    if (!config) {
      throw new Error(`Unknown element type: ${type}`);
    }

    return {
      id: id || `${type}-${Date.now()}`,
      type,
      content: config.defaultContent,
      styles: { ...config.defaultStyles },
      position: { x: 50, y: 50 },
      size: { ...config.defaultSize }
    };
  },

  getConfig: (type: string): ElementConfig | undefined => {
    return elementConfigs[type];
  },

  getRenderer: (type: string): React.ComponentType<ElementRendererProps> | undefined => {
    return elementRenderers[type];
  },

  getAllTypes: (): string[] => {
    return Object.keys(elementConfigs);
  },

  getTypesByCategory: (category: string): string[] => {
    return Object.values(elementConfigs)
      .filter(config => config.category === category)
      .map(config => config.type);
  }
};

export default elementFactory;
