'use client';

import { Element } from '../elements';

export interface WebsiteSection {
  id: string;
  type: string;
  title: string;
  content: string;
  styles: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export class WebsiteSectionParser {
  private static elementIdCounter = 0;

  // Parse HTML content into editable sections
  static parseWebsiteIntoSections(htmlContent: string, cssContent: string): Element[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const sections: Element[] = [];

    // Find major sections
    const majorSections = this.findMajorSections(doc);
    
    majorSections.forEach((section, index) => {
      const element = this.convertSectionToElement(section, cssContent, index);
      if (element) {
        sections.push(element);
      }
    });

    return sections;
  }

  // Find major sections in the HTML
  private static findMajorSections(doc: Document): HTMLElement[] {
    const sections: HTMLElement[] = [];
    
    // Look for common section patterns
    const sectionSelectors = [
      'header', 'nav', 'main', 'section', 'footer',
      '.hero', '.hero-section', '.gallery-hero', '.admin-hero', '.studio-hero', '.business-hero',
      '.about-section', '.art-gallery', '.dashboard-stats', '.work-showcase', '.services-section',
      '.projects-section', '.artist-about', '.gallery-footer', '.footer',
      '.navbar', '.navigation', '.menu'
    ];

    sectionSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.children.length > 0 || el.textContent?.trim()) {
          sections.push(el as HTMLElement);
        }
      });
    });

    // If no sections found, create sections from main containers
    if (sections.length === 0) {
      const containers = doc.querySelectorAll('div[class], section[class], article[class]');
      containers.forEach(el => {
        if (el.children.length > 0 || el.textContent?.trim()) {
          sections.push(el as HTMLElement);
        }
      });
    }

    return sections;
  }

  // Convert HTML section to builder element
  private static convertSectionToElement(section: HTMLElement, cssContent: string, index: number): Element | null {
    const elementId = `section_${++this.elementIdCounter}`;
    const tagName = section.tagName.toLowerCase();
    
    // Determine element type based on content and classes
    const elementType = this.determineElementType(section);
    
    // Extract content - preserve the full HTML structure
    const content = section.innerHTML;
    
    // Calculate position and size
    const position = { x: 0, y: index * 400 }; // Stack vertically
    const size = { width: 1200, height: this.estimateHeight(section) };
    
    // Extract styles
    const styles = this.extractStyles(section, cssContent);
    
    // Extract attributes
    const attributes: Record<string, string> = {};
    Array.from(section.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });

    return {
      id: elementId,
      type: elementType,
      content: content, // Store the full HTML structure
      position,
      size,
      styles,
      classes: Array.from(section.classList),
      attributes,
      animation: undefined,
      interaction: undefined
    };
  }

  // Determine element type based on content and classes
  private static determineElementType(section: HTMLElement): string {
    const classes = Array.from(section.classList);
    const tagName = section.tagName.toLowerCase();
    
    // Hero sections
    if (classes.some(c => c.includes('hero'))) return 'hero';
    
    // Navigation
    if (classes.some(c => c.includes('nav')) || tagName === 'nav' || tagName === 'header') return 'navigation';
    
    // About sections
    if (classes.some(c => c.includes('about'))) return 'about';
    
    // Gallery/Showcase
    if (classes.some(c => c.includes('gallery') || c.includes('showcase'))) return 'gallery';
    
    // Services
    if (classes.some(c => c.includes('service'))) return 'services';
    
    // Projects/Work
    if (classes.some(c => c.includes('project') || c.includes('work'))) return 'projects';
    
    // Footer
    if (classes.some(c => c.includes('footer')) || tagName === 'footer') return 'footer';
    
    // Stats/Dashboard
    if (classes.some(c => c.includes('stat') || c.includes('dashboard'))) return 'stats';
    
    // Default to section
    return 'section';
  }

  // Extract content from section
  private static extractContent(section: HTMLElement): string {
    // Get text content, prioritizing headings
    const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      return heading.textContent || '';
    }
    
    // Get first paragraph
    const paragraph = section.querySelector('p');
    if (paragraph) {
      return paragraph.textContent || '';
    }
    
    // Get any text content
    return section.textContent?.trim().substring(0, 100) || '';
  }

  // Estimate section height
  private static estimateHeight(section: HTMLElement): number {
    const classes = Array.from(section.classList);
    
    // Hero sections are typically tall
    if (classes.some(c => c.includes('hero'))) return 600;
    
    // Navigation is short
    if (classes.some(c => c.includes('nav'))) return 80;
    
    // Footer is medium
    if (classes.some(c => c.includes('footer'))) return 200;
    
    // Default height
    return 400;
  }

  // Convert CSS property names from kebab-case to camelCase for React
  private static convertCSSPropertyName(property: string): string {
    return property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  // Extract styles from CSS rules
  private static extractStyles(section: HTMLElement, cssContent: string): Record<string, any> {
    const styles: Record<string, any> = {};
    const classes = Array.from(section.classList);
    
    // Parse CSS and find matching rules
    const cssRules = this.parseCSS(cssContent);
    
    cssRules.forEach(rule => {
      if (this.matchesSelector(section, rule.selector, classes)) {
        // Convert CSS properties to React-compatible format
        Object.entries(rule.styles).forEach(([property, value]) => {
          const reactProperty = this.convertCSSPropertyName(property);
          styles[reactProperty] = value;
        });
      }
    });
    
    return styles;
  }

  // Parse CSS content into rules
  private static parseCSS(cssContent: string): any[] {
    const rules: any[] = [];
    const regex = /([^{}]+)\s*\{([^{}]*)\}/g;
    let match;
    
    while ((match = regex.exec(cssContent)) !== null) {
      const selector = match[1].trim();
      const stylesText = match[2].trim();
      const styles: Record<string, string> = {};
      
      // Parse individual style properties
      const styleRegex = /([^:]+):\s*([^;]+);?/g;
      let styleMatch;
      
      while ((styleMatch = styleRegex.exec(stylesText)) !== null) {
        const property = styleMatch[1].trim();
        const value = styleMatch[2].trim();
        styles[property] = value;
      }
      
      rules.push({ selector, styles });
    }
    
    return rules;
  }

  // Check if CSS selector matches element
  private static matchesSelector(element: HTMLElement, selector: string, classes: string[]): boolean {
    // Simple class matching
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      return classes.includes(className);
    }
    
    // Tag matching
    if (!selector.includes('.') && !selector.includes('#')) {
      return element.tagName.toLowerCase() === selector.toLowerCase();
    }
    
    return false;
  }

  // Convert sections back to HTML
  static sectionsToHTML(sections: Element[]): string {
    return sections.map(section => {
      // Get the original tag name and attributes from the section
      const tagName = this.getElementTag(section.type);
      const classes = section.classes?.join(' ') || '';
      const attributes = section.attributes || {};
      
      // Build attributes string
      const attributesString = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      
      // If the content is HTML, use it directly with proper wrapper
      if (section.content.includes('<') && section.content.includes('>')) {
        return `<${tagName} id="${section.id}" class="${classes}" ${attributesString}>${section.content}</${tagName}>`;
      }
      
      // Otherwise, wrap simple content
      return `<${tagName} id="${section.id}" class="${classes}" ${attributesString}>${section.content}</${tagName}>`;
    }).join('\n');
  }

  // Get HTML tag for element type
  private static getElementTag(type: string): string {
    const tagMap: Record<string, string> = {
      'hero': 'div',
      'navigation': 'nav',
      'about': 'section',
      'gallery': 'section',
      'services': 'section',
      'projects': 'section',
      'footer': 'footer',
      'stats': 'section',
      'section': 'section'
    };
    return tagMap[type] || 'div';
  }

  // Generate inline styles
  private static generateInlineStyles(styles: Record<string, any>): string {
    return Object.entries(styles)
      .map(([property, value]) => {
        // Convert camelCase back to kebab-case for CSS
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssProperty}: ${value};`;
      })
      .join(' ');
  }
}
