'use client';

import { Element } from '../elements';

export interface EditableNode {
  id: string;
  type: 'text' | 'image' | 'button' | 'link' | 'section';
  content: string;
  tagName: string;
  attributes: Record<string, string>;
  styles: Record<string, string>;
  parentId?: string;
  children?: EditableNode[];
  isEditable: boolean;
}

export class InlineEditor {
  private static nodeIdCounter = 0;

  // Parse HTML into editable nodes
  static parseHTMLToEditableNodes(htmlContent: string): EditableNode[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const editableNodes: EditableNode[] = [];

    // Find all editable elements
    const editableSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', // Headings
      'p', 'span', 'div', 'a', 'button', // Text elements
      'img', // Images
      '.hero-title', '.hero-subtitle', '.about-text', '.service-title', // Specific classes
      '.nav-brand', '.nav-links a', '.btn-primary', '.btn-secondary' // Navigation and buttons
    ];

    editableSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(element => {
        const node = this.createElementNode(element as HTMLElement);
        if (node) {
          editableNodes.push(node);
        }
      });
    });

    return editableNodes;
  }

  // Convert HTML element to editable node
  private static createElementNode(element: HTMLElement): EditableNode | null {
    const tagName = element.tagName.toLowerCase();
    const nodeId = `editable_${++this.nodeIdCounter}`;
    
    // Determine if element is editable
    const isEditable = this.isElementEditable(element);
    if (!isEditable) return null;

    // Extract attributes
    const attributes: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });

    // Extract styles
    const styles: Record<string, string> = {};
    const computedStyle = window.getComputedStyle(element);
    ['color', 'fontSize', 'fontWeight', 'backgroundColor', 'textAlign', 'margin', 'padding'].forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value) {
        styles[prop] = value;
      }
    });

    // Determine node type
    const nodeType = this.determineNodeType(element);

    return {
      id: nodeId,
      type: nodeType,
      content: element.textContent || element.getAttribute('src') || '',
      tagName,
      attributes,
      styles,
      isEditable: true
    };
  }

  // Check if element should be editable
  private static isElementEditable(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const classes = Array.from(element.classList);
    
    // Always editable elements
    const alwaysEditable = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'img'];
    if (alwaysEditable.includes(tagName)) return true;
    
    // Specific editable classes
    const editableClasses = [
      'hero-title', 'hero-subtitle', 'about-text', 'service-title', 'service-description',
      'nav-brand', 'btn-primary', 'btn-secondary', 'project-title', 'project-description',
      'stat-number', 'stat-label', 'footer-text', 'contact-info'
    ];
    
    return editableClasses.some(cls => classes.includes(cls));
  }

  // Determine node type
  private static determineNodeType(element: HTMLElement): 'text' | 'image' | 'button' | 'link' | 'section' {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'img') return 'image';
    if (tagName === 'button') return 'button';
    if (tagName === 'a') return 'link';
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'].includes(tagName)) return 'text';
    
    return 'section';
  }

  // Generate HTML from editable nodes
  static generateHTMLFromNodes(nodes: EditableNode[]): string {
    return nodes.map(node => {
      const attributesString = Object.entries(node.attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      
      const stylesString = Object.entries(node.styles)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
      
      if (node.type === 'image') {
        return `<img id="${node.id}" ${attributesString} style="${stylesString}" src="${node.content}" alt="${node.content}" />`;
      }
      
      return `<${node.tagName} id="${node.id}" ${attributesString} style="${stylesString}">${node.content}</${node.tagName}>`;
    }).join('\n');
  }

  // Update node content
  static updateNodeContent(nodes: EditableNode[], nodeId: string, newContent: string): EditableNode[] {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, content: newContent };
      }
      return node;
    });
  }

  // Update node styles
  static updateNodeStyles(nodes: EditableNode[], nodeId: string, newStyles: Record<string, string>): EditableNode[] {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, styles: { ...node.styles, ...newStyles } };
      }
      return node;
    });
  }
}
