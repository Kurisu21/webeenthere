// utils/htmlParser.ts
import { Element as BuilderElement } from '../elements';

export interface ParsedElement {
  id: string;
  type: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  styles: Record<string, any>;
  classes: string[];
  attributes: Record<string, string>;
  children?: ParsedElement[];
  parent?: string;
}

export class HTMLParser {
  private static elementIdCounter = 0;

  // Parse HTML content into editable elements
  static parseHTML(htmlContent: string, cssContent: string): Element[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const elements: Element[] = [];

    // Parse CSS to extract styles
    const cssRules = this.parseCSS(cssContent);

    // Find all major sections
    const sections = this.findMajorSections(doc);
    
    sections.forEach((section, index) => {
      const element = this.convertSectionToElement(section, cssRules, index);
      if (element) {
        elements.push(element);
      }
    });

    return elements;
  }

  // Find major sections in the HTML
  private static findMajorSections(doc: Document): HTMLElement[] {
    const sections: HTMLElement[] = [];
    
    // Look for common section patterns
    const sectionSelectors = [
      '.hero-section', '.gallery-hero', '.admin-hero', '.studio-hero', '.business-hero',
      '.about-section', '.art-gallery', '.dashboard-stats', '.work-showcase', '.services-section',
      '.projects-section', '.artist-about', '.gallery-footer', '.footer'
    ];

    sectionSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => {
        sections.push(el as HTMLElement);
      });
    });

    // If no sections found, create sections from main containers
    if (sections.length === 0) {
      const containers = doc.querySelectorAll('div, section, header, footer');
      containers.forEach(el => {
        if (el.children.length > 0 || el.textContent?.trim()) {
          sections.push(el as HTMLElement);
        }
      });
    }

    return sections;
  }

  // Convert HTML section to builder element
  private static convertSectionToElement(section: HTMLElement, cssRules: any[], index: number): BuilderElement | null {
    const elementId = `element_${++this.elementIdCounter}`;
    const tagName = section.tagName.toLowerCase();
    
    // Determine element type based on content and classes
    const elementType = this.determineElementType(section);
    
    // Extract content
    const content = this.extractContent(section);
    
    // Calculate position and size
    const rect = section.getBoundingClientRect();
    const position = { x: 0, y: index * 400 }; // Stack vertically
    const size = { width: 1200, height: Math.max(300, rect.height || 400) };
    
    // Extract styles
    const styles = this.extractStyles(section, cssRules);
    
    // Extract classes
    const classes = Array.from(section.classList);
    
    // Extract attributes
    const attributes: Record<string, string> = {};
    Array.from(section.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });

    return {
      id: elementId,
      type: elementType,
      content,
      position,
      size,
      styles,
      classes,
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
    if (classes.some(c => c.includes('nav')) || tagName === 'nav') return 'navigation';
    
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

  // Extract styles from CSS rules
  private static extractStyles(section: HTMLElement, cssRules: any[]): Record<string, any> {
    const styles: Record<string, any> = {};
    const classes = Array.from(section.classList);
    
    cssRules.forEach(rule => {
      if (this.matchesSelector(section, rule.selector, classes)) {
        Object.assign(styles, rule.styles);
      }
    });
    
    return styles;
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

  // Parse CSS content into rules
  private static parseCSS(cssContent: string): any[] {
    const rules: any[] = [];
    
    // Simple CSS parser (basic implementation)
    const cssText = cssContent.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove comments
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(cssText)) !== null) {
      const selector = match[1].trim();
      const stylesText = match[2].trim();
      
      const styles: Record<string, any> = {};
      const styleRegex = /([^:]+):([^;]+);?/g;
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

  // Convert elements back to HTML
  static elementsToHTML(elements: BuilderElement[]): string {
    return elements.map(element => {
      const tag = this.getElementTag(element.type);
      const classes = element.classes.length > 0 ? ` class="${element.classes.join(' ')}"` : '';
      const styles = this.generateInlineStyles(element.styles);
      
      return `
        <div id="${element.id}"${classes} style="${styles}">
          ${element.content}
        </div>
      `;
    }).join('\n');
  }

  // Convert elements back to CSS
  static elementsToCSS(elements: BuilderElement[]): string {
    return elements.map(element => {
      const selector = `#${element.id}`;
      const styles = Object.entries(element.styles)
        .map(([property, value]) => `${property}: ${value};`)
        .join(' ');
      
      return `${selector} { ${styles} }`;
    }).join('\n');
  }

  // Get HTML tag for element type
  private static getElementTag(type: string): string {
    const tagMap: Record<string, string> = {
      'hero': 'section',
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
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
  }
}
