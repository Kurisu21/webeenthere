'use client';

import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import TemplateSelector from './TemplateSelector';
import AIContextDisplay from './AIContextDisplay';
import { EnhancedTemplate } from '../../_data/enhanced-templates';

interface WebsiteBuilderProps {
  currentWebsite: any;
}

type BuilderStep = 'template-selection' | 'website-details' | 'builder';

interface Element {
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
    opacity?: string;
    // Advanced styling
    boxShadow?: string;
    transform?: string;
    transition?: string;
    animation?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    zIndex?: string;
    overflow?: string;
    display?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: string;
    // Additional CSS properties
    position?: string;
    float?: string;
    minWidth?: string;
    minHeight?: string;
    maxWidth?: string;
    maxHeight?: string;
    fontFamily?: string;
    lineHeight?: string;
    letterSpacing?: string;
    verticalAlign?: string;
    backgroundRepeat?: string;
  };
  position: { x: number; y: number };
  size: { width: number; height: number };
  imageUrl?: string;
  // Dynamic features
  script?: string;
  animation?: {
    type: 'fadeIn' | 'slideIn' | 'bounce' | 'pulse' | 'rotate' | 'scale' | 'none';
    duration: number;
    delay: number;
    iteration: 'once' | 'infinite' | number;
  };
  interaction?: {
    hover?: {
      styles?: Partial<Element['styles']>;
      script?: string;
    };
    click?: {
      script?: string;
      action?: 'link' | 'modal' | 'scroll' | 'custom';
      target?: string;
    };
  };
  // Form elements
  formConfig?: {
    type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
    placeholder?: string;
    required?: boolean;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
    options?: string[];
  };
  // Dynamic content
  dynamicContent?: {
    source: 'api' | 'localStorage' | 'cookies' | 'static';
    endpoint?: string;
    refreshInterval?: number;
    fallback?: string;
  };
}

const WebsiteBuilder = memo(({ currentWebsite }: WebsiteBuilderProps) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('template-selection');
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedTemplate | null>(null);
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteSlug, setWebsiteSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  
  // Debug effect to log elements changes
  useEffect(() => {
    console.log('Elements updated:', elements.length, elements);
  }, [elements]);

  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle backspace for element deletion if not editing text
      if (event.key === 'Backspace' && selectedElement) {
        // Check if the user is currently editing text in an input field
        const activeElement = document.activeElement;
        const isEditingText = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).contentEditable === 'true' ||
          activeElement.getAttribute('contenteditable') === 'true'
        );
        
        // Only delete element if not editing text
        if (!isEditingText) {
        event.preventDefault();
        deleteElement(selectedElement.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiContext, setAiContext] = useState<any>(null);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'elements' | 'properties' | 'scripts' | 'animations' | 'style' | 'switch' | 'animation' | 'script' | 'interaction'>('elements');
  const [globalScripts, setGlobalScripts] = useState<string[]>([]);
  const [globalCSS, setGlobalCSS] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleTemplateSelect = useCallback((template: EnhancedTemplate) => {
    console.log('Template selected:', template.name);
    console.log('Template elements count:', template.elements.length);
    setSelectedTemplate(template);
    setCurrentStep('website-details');
  }, []);

  const handleStartFromScratch = useCallback(() => {
    setSelectedTemplate(null);
    setCurrentStep('website-details');
  }, []);

  const handleWebsiteDetailsSubmit = useCallback(() => {
    if (!websiteTitle.trim()) {
      alert('Please enter a website title');
      return;
    }
    setCurrentStep('builder');
    
    // Load template elements if a template is selected
    if (selectedTemplate) {
      console.log('Loading template:', selectedTemplate.name);
      console.log('Template elements:', selectedTemplate.elements);
      
      // Force a fresh elements array
      const templateElements = [...selectedTemplate.elements];
      console.log('Setting elements:', templateElements);
      setElements(templateElements);
      
      // Force re-render
      setTimeout(() => {
        console.log('Elements after timeout:', elements);
      }, 100);
    } else {
      // Initialize with default elements if starting from scratch
      setElements([
        {
          id: 'hero-1',
          type: 'hero',
          content: 'Your Website Title',
          styles: {
            color: '#ffffff',
            fontSize: '48px',
            fontWeight: 'bold',
            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '80px 20px',
            textAlign: 'center'
          },
          position: { x: 0, y: 0 },
          size: { width: 800, height: 200 }
        },
        {
          id: 'text-1',
          type: 'text',
          content: 'Your amazing subtitle goes here',
          styles: {
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 'normal',
            padding: '20px',
            textAlign: 'center'
          },
          position: { x: 0, y: 200 },
          size: { width: 800, height: 100 }
        },
        {
          id: 'button-1',
          type: 'button',
          content: 'Get Started',
          styles: {
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#ff6b6b',
            padding: '15px 30px',
            borderRadius: '25px',
            textAlign: 'center'
          },
          position: { x: 0, y: 300 },
          size: { width: 200, height: 60 }
        }
      ]);
    }
  }, [websiteTitle, selectedTemplate]);

  const addElement = useCallback((type: string) => {
    const newElement: Element = {
      id: `${type}-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: { x: 50, y: elements.length * 100 + 50 },
      size: { width: 200, height: 40 }
    };
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  }, [elements.length]);

  const getDefaultContent = (type: string): string => {
    const contents = {
      hero: 'Your Heading',
      text: 'Your text content goes here',
      button: 'Click Me',
      image: 'Image placeholder',
      about: 'About section content',
      gallery: 'Gallery placeholder',
      contact: 'Contact form placeholder',
      social: 'Social links placeholder',
      // New dynamic elements
      counter: '0',
      timer: '00:00:00',
      testimonial: 'Great service!',
      pricing: '$99/month',
      newsletter: 'Subscribe to our newsletter',
      video: 'Video placeholder',
      map: 'Map placeholder',
      chart: 'Chart placeholder',
      slider: 'Slider content',
      accordion: 'Accordion item',
      tabs: 'Tab content',
      modal: 'Modal content',
      tooltip: 'Tooltip text',
      progress: 'Progress bar',
      rating: '★★★★★',
      countdown: '00:00:00',
      weather: 'Weather widget',
      calendar: 'Calendar widget',
      search: 'Search...',
      filter: 'Filter options',
      sort: 'Sort options',
      pagination: '1 2 3 ...',
      breadcrumb: 'Home > Page',
      sidebar: 'Sidebar content',
      footer: 'Footer content',
      header: 'Header content',
      navigation: 'Navigation menu',
      logo: 'Your Logo',
      tagline: 'Your tagline',
      cta: 'Call to Action',
      feature: 'Feature description',
      benefit: 'Benefit description',
      faq: 'Frequently Asked Question',
      step: 'Step description',
      process: 'Process step',
      timeline: 'Timeline item',
      card: 'Card content',
      badge: 'Badge text',
      alert: 'Alert message',
      notification: 'Notification',
      popup: 'Popup content',
      dropdown: 'Dropdown menu',
      menu: 'Menu item',
      link: 'Link text',
      divider: '',
      spacer: '',
      container: 'Container content',
      row: 'Row content',
      column: 'Column content',
      grid: 'Grid content',
      flex: 'Flex content',
      section: 'Section content',
      article: 'Article content',
      aside: 'Aside content',
      main: 'Main content',
      header_section: 'Header section',
      footer_section: 'Footer section',
      sidebar_section: 'Sidebar section',
      content_section: 'Content section',
      hero_section: 'Hero section',
      about_section: 'About section',
      services_section: 'Services section',
      portfolio_section: 'Portfolio section',
      contact_section: 'Contact section',
      team_section: 'Team section',
      pricing_section: 'Pricing section',
      testimonials_section: 'Testimonials section',
      features_section: 'Features section',
      benefits_section: 'Benefits section',
      faq_section: 'FAQ section',
      blog_section: 'Blog section',
      news_section: 'News section',
      events_section: 'Events section',
      gallery_section: 'Gallery section',
      video_section: 'Video section',
      audio_section: 'Audio section',
      download_section: 'Download section',
      signup_section: 'Signup section',
      login_section: 'Login section',
      checkout_section: 'Checkout section',
      cart_section: 'Cart section',
      product_section: 'Product section',
      category_section: 'Category section',
      search_section: 'Search section',
      filter_section: 'Filter section',
      sort_section: 'Sort section',
      pagination_section: 'Pagination section',
      breadcrumb_section: 'Breadcrumb section',
      navigation_section: 'Navigation section',
      logo_section: 'Logo section',
      tagline_section: 'Tagline section',
      cta_section: 'CTA section',
      feature_section: 'Feature section',
      benefit_section: 'Benefit section',
      step_section: 'Step section',
      process_section: 'Process section',
      timeline_section: 'Timeline section',
      card_section: 'Card section',
      badge_section: 'Badge section',
      alert_section: 'Alert section',
      notification_section: 'Notification section',
      popup_section: 'Popup section',
      dropdown_section: 'Dropdown section',
      menu_section: 'Menu section',
      link_section: 'Link section',
      divider_section: 'Divider section',
      spacer_section: 'Spacer section',
      container_section: 'Container section',
      row_section: 'Row section',
      column_section: 'Column section',
      grid_section: 'Grid section',
      flex_section: 'Flex section'
    };
    return contents[type as keyof typeof contents] || 'New element';
  };

  const getDefaultStyles = (type: string) => {
    const defaultStyles = {
      hero: {
        color: '#ffffff',
        fontSize: '48px',
        fontWeight: 'bold',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center' as const,
        borderRadius: '0px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      },
      text: {
        color: '#333333',
        fontSize: '16px',
        fontWeight: 'normal',
        backgroundColor: 'transparent',
        padding: '20px',
        textAlign: 'left' as const,
        borderRadius: '0px'
      },
      button: {
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: '#ff6b6b',
        padding: '15px 30px',
        textAlign: 'center' as const,
        borderRadius: '25px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(255,107,107,0.3)'
      },
      image: {
        backgroundColor: '#f0f0f0',
        border: '2px dashed #ccc',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px'
      },
      about: {
        color: '#333333',
        fontSize: '18px',
        fontWeight: 'normal',
        backgroundColor: '#f8f9fa',
        padding: '40px 20px',
        textAlign: 'center' as const,
        borderRadius: '0px'
      },
      gallery: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px'
      },
      contact: {
        backgroundColor: '#f8f9fa',
        padding: '30px',
        textAlign: 'center' as const,
        borderRadius: '8px'
      },
      social: {
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'center' as const
      },
      // Dynamic elements with enhanced styles
      counter: {
        color: '#667eea',
        fontSize: '36px',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(102,126,234,0.2)'
      },
      timer: {
        color: '#ff6b6b',
        fontSize: '24px',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,107,107,0.1)',
        padding: '15px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        border: '2px solid #ff6b6b'
      },
      testimonial: {
        color: '#333333',
        fontSize: '18px',
        fontWeight: 'normal',
        backgroundColor: '#ffffff',
        padding: '30px',
        textAlign: 'center' as const,
        borderRadius: '10px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      },
      pricing: {
        color: '#ffffff',
        fontSize: '32px',
        fontWeight: 'bold',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        textAlign: 'center' as const,
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(102,126,234,0.3)'
      },
      newsletter: {
        color: '#333333',
        fontSize: '16px',
        fontWeight: 'normal',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      },
      video: {
        backgroundColor: '#000000',
        padding: '0px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '14px'
      },
      map: {
        backgroundColor: '#e0e0e0',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        color: '#666666',
        fontSize: '14px'
      },
      chart: {
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        color: '#333333',
        fontSize: '14px'
      },
      slider: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        color: '#333333',
        fontSize: '16px'
      },
      accordion: {
        backgroundColor: '#ffffff',
        padding: '15px',
        textAlign: 'left' as const,
        borderRadius: '5px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '16px'
      },
      tabs: {
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'left' as const,
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '16px'
      },
      modal: {
        backgroundColor: '#ffffff',
        padding: '30px',
        textAlign: 'center' as const,
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        color: '#333333',
        fontSize: '16px'
      },
      tooltip: {
        backgroundColor: '#333333',
        color: '#ffffff',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        textAlign: 'center' as const
      },
      progress: {
        backgroundColor: '#e0e0e0',
        padding: '10px',
        textAlign: 'center' as const,
        borderRadius: '5px',
        color: '#333333',
        fontSize: '14px'
      },
      rating: {
        color: '#ffc107',
        fontSize: '20px',
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'center' as const
      },
      countdown: {
        color: '#ff6b6b',
        fontSize: '28px',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,107,107,0.1)',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '10px',
        border: '2px solid #ff6b6b'
      },
      weather: {
        backgroundColor: '#87ceeb',
        color: '#ffffff',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '10px',
        fontSize: '16px'
      },
      calendar: {
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '14px'
      },
      search: {
        backgroundColor: '#ffffff',
        padding: '10px',
        textAlign: 'left' as const,
        borderRadius: '5px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '14px'
      },
      filter: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        textAlign: 'left' as const,
        borderRadius: '5px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '14px'
      },
      sort: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        textAlign: 'left' as const,
        borderRadius: '5px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '14px'
      },
      pagination: {
        backgroundColor: '#ffffff',
        padding: '10px',
        textAlign: 'center' as const,
        borderRadius: '5px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '14px'
      },
      breadcrumb: {
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'left' as const,
        color: '#666666',
        fontSize: '14px'
      },
      sidebar: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'left' as const,
        borderRadius: '0px',
        color: '#333333',
        fontSize: '14px'
      },
      footer: {
        backgroundColor: '#333333',
        color: '#ffffff',
        padding: '30px',
        textAlign: 'center' as const,
        fontSize: '14px'
      },
      header: {
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'center' as const,
        borderBottom: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '16px'
      },
      navigation: {
        backgroundColor: '#ffffff',
        padding: '15px',
        textAlign: 'center' as const,
        borderBottom: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '16px'
      },
      logo: {
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'center' as const,
        color: '#333333',
        fontSize: '24px',
        fontWeight: 'bold'
      },
      tagline: {
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'center' as const,
        color: '#666666',
        fontSize: '16px',
        fontStyle: 'italic'
      },
      cta: {
        color: '#ffffff',
        fontSize: '20px',
        fontWeight: 'bold',
        backgroundColor: '#ff6b6b',
        padding: '20px 40px',
        textAlign: 'center' as const,
        borderRadius: '30px',
        boxShadow: '0 5px 20px rgba(255,107,107,0.3)'
      },
      feature: {
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '16px'
      },
      benefit: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        color: '#333333',
        fontSize: '16px'
      },
      faq: {
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'left' as const,
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '16px'
      },
      step: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        color: '#333333',
        fontSize: '16px'
      },
      process: {
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '16px'
      },
      timeline: {
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'left' as const,
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '16px'
      },
      card: {
        backgroundColor: '#ffffff',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        color: '#333333',
        fontSize: '16px'
      },
      badge: {
        backgroundColor: '#ff6b6b',
        color: '#ffffff',
        padding: '5px 10px',
        textAlign: 'center' as const,
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: 'bold'
      },
      alert: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '15px',
        textAlign: 'left' as const,
        borderRadius: '5px',
        border: '1px solid #ffeaa7',
        fontSize: '14px'
      },
      notification: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '15px',
        textAlign: 'left' as const,
        borderRadius: '5px',
        border: '1px solid #c3e6cb',
        fontSize: '14px'
      },
      popup: {
        backgroundColor: '#ffffff',
        padding: '30px',
        textAlign: 'center' as const,
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        color: '#333333',
        fontSize: '16px'
      },
      dropdown: {
        backgroundColor: '#ffffff',
        padding: '10px',
        textAlign: 'left' as const,
        borderRadius: '5px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '14px'
      },
      menu: {
        backgroundColor: '#ffffff',
        padding: '10px',
        textAlign: 'left' as const,
        borderRadius: '5px',
        border: '1px solid #e0e0e0',
        color: '#333333',
        fontSize: '14px'
      },
      link: {
        backgroundColor: 'transparent',
        padding: '5px',
        textAlign: 'left' as const,
        color: '#667eea',
        fontSize: '16px',
        textDecoration: 'underline'
      },
      divider: {
        backgroundColor: '#e0e0e0',
        padding: '0px',
        textAlign: 'center' as const,
        height: '2px',
        color: 'transparent'
      },
      spacer: {
        backgroundColor: 'transparent',
        padding: '0px',
        textAlign: 'center' as const,
        color: 'transparent'
      },
      container: {
        backgroundColor: 'transparent',
        padding: '20px',
        textAlign: 'left' as const,
        color: '#333333',
        fontSize: '16px'
      },
      row: {
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'left' as const,
        color: '#333333',
        fontSize: '16px',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px'
      },
      column: {
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'left' as const,
        color: '#333333',
        fontSize: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      },
      grid: {
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'left' as const,
        color: '#333333',
        fontSize: '16px',
        display: 'grid',
        gap: '10px'
      },
      flex: {
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'left' as const,
        color: '#333333',
        fontSize: '16px',
        display: 'flex',
        gap: '10px'
      },
      section: {
        backgroundColor: '#f8f9fa',
        padding: '40px 20px',
        textAlign: 'center' as const,
        color: '#333333',
        fontSize: '16px'
      }
    };
    return defaultStyles[type as keyof typeof defaultStyles] || {
      color: '#333333',
      fontSize: '16px',
      fontWeight: 'normal',
      backgroundColor: 'transparent',
      padding: '20px',
      textAlign: 'left' as const,
      borderRadius: '0px'
    };
  };

  const updateElement = useCallback((id: string, updates: Partial<Element>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
    if (selectedElement?.id === id) {
      setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedElement]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedElement) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateElement(selectedElement.id, { 
          imageUrl,
          content: file.name,
          size: { width: 300, height: 200 }
        });
      };
      reader.readAsDataURL(file);
    }
  }, [selectedElement, updateElement]);

  const handleMouseDown = useCallback((e: React.MouseEvent, element: Element) => {
    if (isResizing) return;
    
    e.stopPropagation();
    setSelectedElement(element);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - element.position.x,
        y: e.clientY - rect.top - element.position.y
      });
    }
  }, [isResizing]);

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement) return;
    
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: selectedElement.size.width,
      height: selectedElement.size.height
    });
  }, [selectedElement]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          elements: elements, // Send full elements array for context analysis
          userId: 1 // TODO: Get from auth context
        })
      });

      const data = await response.json();
      
      if (data.success && data.elements.length > 0) {
        // Add AI-generated elements to the canvas
        const newElements = data.elements.map((element: any) => ({
          ...element,
          id: `${element.id}-${Date.now()}`,
          position: { 
            x: element.position.x + (elements.length * 50), 
            y: element.position.y + (elements.length * 50) 
          }
        }));
        
        setElements(prev => [...prev, ...newElements]);
        setAiSuggestions(data.suggestions || []);
        setAiPrompt('');
        
        // Store AI context and reasoning for display
        if (data.context) {
          setAiContext(data.context);
        }
        if (data.reasoning) {
          setAiReasoning(data.reasoning);
        }
      } else {
        alert('AI generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('Failed to generate AI content. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  }, [aiPrompt, elements]);

  const handleAiImprove = useCallback(async () => {
    if (!selectedElement) {
      alert('Please select an element to improve');
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/improve-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          existingElements: elements, // Send all elements for better context
          improvementPrompt: aiPrompt || 'Improve this element',
          userId: 1 // TODO: Get from auth context
        })
      });

      const data = await response.json();
      
      if (data.success && data.improvedElements.length > 0) {
        // Find the improved version of the selected element
        const improvedElement = data.improvedElements.find((el: any) => 
          el.id === selectedElement.id || el.type === selectedElement.type
        ) || data.improvedElements[0];
        
        updateElement(selectedElement.id, improvedElement);
        setAiSuggestions(data.improvements || []);
        setAiPrompt('');
        
        // Store AI context and reasoning for display
        if (data.context) {
          setAiContext(data.context);
        }
        if (data.reasoning) {
          setAiReasoning(data.reasoning);
        }
      } else {
        alert('AI improvement failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI Improvement Error:', error);
      alert('Failed to improve content. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  }, [selectedElement, aiPrompt, elements, updateElement]);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const handleElementClick = useCallback((element: Element, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(element);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isResizing && selectedElement && resizeHandle) {
      const deltaX = event.clientX - resizeStart.x;
      const deltaY = event.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      if (resizeHandle.includes('e')) newWidth += deltaX;
      if (resizeHandle.includes('w')) newWidth -= deltaX;
      if (resizeHandle.includes('s')) newHeight += deltaY;
      if (resizeHandle.includes('n')) newHeight -= deltaY;
      
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(30, newHeight);
      
      updateElement(selectedElement.id, {
        size: { width: newWidth, height: newHeight }
      });
    } else if (isDragging && selectedElement && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = event.clientX - rect.left - dragOffset.x;
      const newY = event.clientY - rect.top - dragOffset.y;
      
      updateElement(selectedElement.id, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) }
      });
    }
  }, [isDragging, isResizing, selectedElement, dragOffset, resizeHandle, resizeStart, updateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleSaveWebsite = useCallback(async () => {
    setIsCreating(true);
    try {
      const html = generateHTML();
      const css = generateCSS();
      
      const websiteData = {
        title: websiteTitle,
        slug: websiteSlug || websiteTitle.toLowerCase().replace(/\s+/g, '-'),
        html_content: html,
        css_content: css,
        template_id: selectedTemplate?.id || null,
        is_published: false
      };

      console.log('Saving website:', websiteData);
      alert('Website saved successfully! (Demo mode)');
      
      // Reset form
      setCurrentStep('template-selection');
      setSelectedTemplate(null);
      setWebsiteTitle('');
      setWebsiteSlug('');
      setElements([]);
      setSelectedElement(null);
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Error saving website. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [websiteTitle, websiteSlug, selectedTemplate, elements]);

  const generateHTML = () => {
    return elements.map(element => {
      const buttonHtml = `<button style="width: 100%; height: 100%; border: none; cursor: pointer;">${element.content}</button>`;
      const imageHtml = `<img src="${element.imageUrl || 'https://via.placeholder.com/300x200'}" alt="${element.content}" style="width: 100%; height: 100%; object-fit: cover;" />`;
      const defaultHtml = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${element.content}</div>`;
      
      const contentHtml = element.type === 'button' ? buttonHtml : 
                        element.type === 'image' ? imageHtml : defaultHtml;
      
      return `
        <div class="element-${element.id}" style="position: absolute; left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.size.width}px; height: ${element.size.height}px;">
          ${contentHtml}
        </div>
      `;
    }).join('');
  };

  const generateCSS = () => {
    const templateCSS = selectedTemplate?.css_base ? selectedTemplate.css_base : '';
    const elementsCSS = elements.map(element => `
      .element-${element.id} {
        color: ${element.styles.color || '#333333'};
        font-size: ${element.styles.fontSize || '16px'};
        font-weight: ${element.styles.fontWeight || 'normal'};
        background: ${element.styles.backgroundColor || 'transparent'};
        background-image: ${element.styles.backgroundImage || 'none'};
        background-size: ${element.styles.backgroundSize || 'cover'};
        background-position: ${element.styles.backgroundPosition || 'center'};
        padding: ${element.styles.padding || '0'};
        margin: ${element.styles.margin || '0'};
        text-align: ${element.styles.textAlign || 'left'};
        border-radius: ${element.styles.borderRadius || '0'};
        border: ${element.styles.border || 'none'};
        opacity: ${element.styles.opacity || '1'};
        box-shadow: ${element.styles.boxShadow || 'none'};
        transform: ${element.styles.transform || 'none'};
        transition: ${element.styles.transition || 'all 0.3s ease'};
        animation: ${element.styles.animation || 'none'};
        z-index: ${element.styles.zIndex || 'auto'};
        overflow: ${element.styles.overflow || 'hidden'};
        display: ${element.styles.display || 'block'};
        flex-direction: ${element.styles.flexDirection || 'row'};
        justify-content: ${element.styles.justifyContent || 'flex-start'};
        align-items: ${element.styles.alignItems || 'stretch'};
        gap: ${element.styles.gap || '0'};
        box-sizing: border-box;
      }
      ${element.animation ? `
        @keyframes ${element.animation.type} {
          ${element.animation.type === 'fadeIn' ? 'from { opacity: 0; } to { opacity: 1; }' : ''}
          ${element.animation.type === 'slideIn' ? 'from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; }' : ''}
          ${element.animation.type === 'bounce' ? '0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); }' : ''}
          ${element.animation.type === 'pulse' ? '0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); }' : ''}
          ${element.animation.type === 'rotate' ? 'from { transform: rotate(0deg); } to { transform: rotate(360deg); }' : ''}
          ${element.animation.type === 'scale' ? 'from { transform: scale(0); } to { transform: scale(1); }' : ''}
        }
        .element-${element.id} {
          animation: ${element.animation.type} ${element.animation.duration}s ${element.animation.delay}s ${element.animation.iteration};
        }
      ` : ''}
      ${element.interaction?.hover ? `
        .element-${element.id}:hover {
          ${element.interaction.hover.styles ? Object.entries(element.interaction.hover.styles).map(([key, value]) => `${key}: ${value};`).join(' ') : ''}
        }
      ` : ''}
    `).join('');
    
    return templateCSS + '\n' + elementsCSS;
  };

  const handlePreview = () => {
    const html = generateHTML();
    const css = generateCSS();
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${websiteTitle} - Preview</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              ${css}
            </style>
          </head>
          <body>
            <div style="position: relative; min-height: 100vh;">
              ${html}
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  const handleCancel = useCallback(() => {
    setCurrentStep('template-selection');
    setSelectedTemplate(null);
    setWebsiteTitle('');
    setWebsiteSlug('');
    setElements([]);
    setSelectedElement(null);
  }, []);

  const renderBuilder = () => {
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Debug Info */}
        <div className="bg-yellow-900/20 border-b border-yellow-500/30 px-4 py-2">
          <div className="text-yellow-200 text-sm">
            <strong>Debug:</strong> Elements loaded: {elements.length} | 
            Selected Template: {selectedTemplate?.name || 'None'} | 
            Template Elements: {selectedTemplate?.elements.length || 0}
          </div>
        </div>
        
        {/* Top Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <span className="text-white font-semibold">Webeenthere</span>
            </div>
            <div className="text-sm text-gray-400">Building: {websiteTitle}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreview}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              👁️ Preview
            </button>
            <button
              onClick={handleSaveWebsite}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Saving...' : '💾 Save'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Sidebar - AI Assistant */}
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold text-sm">🤖 AI Assistant</h3>
              <p className="text-gray-400 text-xs mt-1">Powered by DeepSeek</p>
            </div>
            
            <div className="p-4 space-y-4">
              {/* AI Prompt Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Describe what you want to create
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Add a professional hero section for a tech startup"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* AI Context Display */}
              <AIContextDisplay context={aiContext} reasoning={aiReasoning} />

              {/* AI Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleAiGenerate}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isAiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      ✨ Generate Section
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleAiImprove}
                  disabled={isAiLoading || !selectedElement}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  🔧 Improve Selected
                </button>
              </div>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div>
                  <h4 className="text-gray-300 text-sm font-medium mb-2">💡 Suggestions</h4>
                  <div className="space-y-1">
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="text-gray-400 text-xs p-2 bg-gray-700 rounded"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Prompts */}
              <div>
                <h4 className="text-gray-300 text-sm font-medium mb-2">⚡ Quick Prompts</h4>
                <div className="space-y-1">
                  {[
                    'Add a contact form',
                    'Create a testimonials section',
                    'Add a pricing table',
                    'Include social media links'
                  ].map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setAiPrompt(prompt)}
                      className="w-full text-left text-gray-400 text-xs p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

           {/* Left Sidebar - Elements and Layers Panel */}
           <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
             {/* Tabs */}
             <div className="flex border-b border-gray-700">
               <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gray-700 border-b-2 border-blue-500">
                 Elements
               </button>
               <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                 Layers
               </button>
             </div>
             
             <div className="p-4 border-b border-gray-700">
               <h3 className="text-white font-semibold text-sm">Elements</h3>
               <p className="text-gray-400 text-xs mt-1">Click to add</p>
             </div>
             
             {/* Essential Elements */}
             <div className="p-4">
               <div className="grid grid-cols-2 gap-2">
                 {[
                   { id: 'hero', name: 'Hero' },
                   { id: 'text', name: 'Text' },
                   { id: 'image', name: 'Image' },
                   { id: 'button', name: 'Button' },
                   { id: 'about', name: 'About' },
                   { id: 'contact', name: 'Contact' },
                   { id: 'gallery', name: 'Gallery' },
                   { id: 'social', name: 'Social' }
                 ].map(element => (
                   <button
                     key={element.id}
                     onClick={() => addElement(element.id)}
                     className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
                   >
                     <div className="text-white text-sm font-medium">{element.name}</div>
                   </button>
                 ))}
               </div>
             </div>

             {/* Interactive Elements */}
             <div className="p-4 border-t border-gray-700">
               <h4 className="text-gray-300 font-medium text-xs uppercase tracking-wide mb-3">Interactive</h4>
               <div className="grid grid-cols-2 gap-2">
                 {[
                   { id: 'counter', name: 'Counter' },
                   { id: 'timer', name: 'Timer' },
                   { id: 'progress', name: 'Progress' },
                   { id: 'rating', name: 'Rating' },
                   { id: 'slider', name: 'Slider' },
                   { id: 'modal', name: 'Modal' },
                   { id: 'tabs', name: 'Tabs' },
                   { id: 'accordion', name: 'Accordion' }
                 ].map(element => (
                   <button
                     key={element.id}
                     onClick={() => addElement(element.id)}
                     className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
                   >
                     <div className="text-white text-sm font-medium">{element.name}</div>
                   </button>
                 ))}
               </div>
             </div>

             {/* Business Elements */}
             <div className="p-4 border-t border-gray-700">
               <h4 className="text-gray-300 font-medium text-xs uppercase tracking-wide mb-3">Business</h4>
               <div className="grid grid-cols-2 gap-2">
                 {[
                   { id: 'testimonial', name: 'Testimonial' },
                   { id: 'pricing', name: 'Pricing' },
                   { id: 'newsletter', name: 'Newsletter' },
                   { id: 'cta', name: 'CTA' },
                   { id: 'feature', name: 'Feature' },
                   { id: 'benefit', name: 'Benefit' },
                   { id: 'faq', name: 'FAQ' },
                   { id: 'timeline', name: 'Timeline' }
                 ].map(element => (
                   <button
                     key={element.id}
                     onClick={() => addElement(element.id)}
                     className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
                   >
                     <div className="text-white text-sm font-medium">{element.name}</div>
                   </button>
                 ))}
               </div>
             </div>

             {/* Utility Elements */}
             <div className="p-4 border-t border-gray-700">
               <h4 className="text-gray-300 font-medium text-xs uppercase tracking-wide mb-3">Utility</h4>
               <div className="grid grid-cols-2 gap-2">
                 {[
                   { id: 'divider', name: 'Divider' },
                   { id: 'spacer', name: 'Spacer' },
                   { id: 'link', name: 'Link' },
                   { id: 'logo', name: 'Logo' }
                 ].map(element => (
                   <button
                     key={element.id}
                     onClick={() => addElement(element.id)}
                     className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
                   >
                     <div className="text-white text-sm font-medium">{element.name}</div>
                   </button>
                 ))}
               </div>
             </div>
             
             {/* Layers Panel */}
             <div className="p-4">
               <h3 className="text-white font-semibold text-sm mb-3">Layers</h3>
               <div className="space-y-1">
                 {/* Body */}
                 <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                   <div className="flex items-center space-x-2">
                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                     <span className="text-gray-300 text-sm">Body</span>
                   </div>
                 </div>
                 
                 {/* Header */}
                 <div className="flex items-center justify-between p-2 bg-gray-700 rounded ml-4">
                   <div className="flex items-center space-x-2">
                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                     <span className="text-gray-300 text-sm">Header</span>
                   </div>
                 </div>
                 
                 {/* Elements */}
                 {elements.map((element) => (
                   <div 
                     key={element.id}
                     onClick={() => setSelectedElement(element)}
                     className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                       selectedElement?.id === element.id 
                         ? 'bg-blue-600 text-white' 
                         : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                     }`}
                   >
                     <div className="flex items-center space-x-2">
                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                       </svg>
                       <span className="text-sm">{element.type}</span>
                     </div>
                     <div className="flex items-center space-x-1">
                       <button className="p-1 hover:bg-gray-500 rounded">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                         </svg>
                       </button>
                       <button className="p-1 hover:bg-gray-500 rounded">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>

          {/* Main Canvas */}
          <div className="flex-1 bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
              <div 
                ref={canvasRef}
                className="rounded-lg shadow-lg overflow-hidden relative min-h-[600px]"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                style={{ 
                  position: 'relative',
                  background: selectedTemplate?.css_base ? 'none' : '#ffffff',
                  width: '100%',
                  height: '600px'
                }}
              >
                {/* Inject Template CSS - Modified to prevent UI interference */}
                {selectedTemplate?.css_base && (
                  <style dangerouslySetInnerHTML={{ 
                    __html: selectedTemplate.css_base
                      .replace(/\* {/g, '.canvas-content * {')
                      .replace(/body {/g, '.canvas-content {')
                      .replace(/\.container {/g, '.canvas-content .container {')
                      .replace(/\.hero-section {/g, '.canvas-content .hero-section {')
                      .replace(/\.about-section {/g, '.canvas-content .about-section {')
                      .replace(/\.portfolio-section {/g, '.canvas-content .portfolio-section {')
                      .replace(/\.contact-section {/g, '.canvas-content .contact-section {')
                  }} />
                )}
                
                {/* Template Content Container - Isolates template CSS */}
                <div className="canvas-content" style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden'
                }}>
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute select-none ${
                      selectedElement?.id === element.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    }`}
                    style={{
                      left: element.position.x,
                      top: element.position.y,
                      width: element.size.width,
                      height: element.size.height,
                      color: element.styles.color,
                      fontSize: element.styles.fontSize,
                      fontWeight: element.styles.fontWeight,
                      background: element.styles.backgroundColor,
                      padding: element.styles.padding,
                      textAlign: element.styles.textAlign,
                      borderRadius: element.styles.borderRadius,
                      border: element.styles.border,
                      opacity: element.styles.opacity || '1'
                    }}
                    onClick={(e) => handleElementClick(element, e)}
                    onMouseDown={(e) => handleMouseDown(e, element)}
                  >
                    {element.type === 'button' ? (
                      <button className="w-full h-full border-none cursor-pointer">
                        {element.content}
                      </button>
                    ) : element.type === 'image' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded overflow-hidden">
                        {element.imageUrl ? (
                          <img 
                            src={element.imageUrl} 
                            alt={element.content}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500">🖼️ {element.content}</span>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {element.content}
                      </div>
                    )}
                    
                    {/* Resize Handles */}
                    {selectedElement?.id === element.id && (
                      <>
                        {/* Corner handles */}
                        <div
                          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
                          style={{ top: -6, left: -6 }}
                          onMouseDown={(e) => handleResizeStart(e, 'nw')}
                        />
                        <div
                          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
                          style={{ top: -6, right: -6 }}
                          onMouseDown={(e) => handleResizeStart(e, 'ne')}
                        />
                        <div
                          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
                          style={{ bottom: -6, left: -6 }}
                          onMouseDown={(e) => handleResizeStart(e, 'sw')}
                        />
                        <div
                          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
                          style={{ bottom: -6, right: -6 }}
                          onMouseDown={(e) => handleResizeStart(e, 'se')}
                        />
                        
                        {/* Edge handles */}
                        <div
                          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-n-resize"
                          style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
                          onMouseDown={(e) => handleResizeStart(e, 'n')}
                        />
                        <div
                          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-s-resize"
                          style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
                          onMouseDown={(e) => handleResizeStart(e, 's')}
                        />
                        <div
                          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-w-resize"
                          style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
                          onMouseDown={(e) => handleResizeStart(e, 'w')}
                        />
                        <div
                          className="absolute w-3 h-3 bg-blue-500 border border-white cursor-e-resize"
                          style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
                          onMouseDown={(e) => handleResizeStart(e, 'e')}
                        />
                      </>
                    )}
                  </div>
                ))}
                </div> {/* End canvas content wrapper */}
                
                {elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎨</div>
                      <p className="text-lg">Start building your website</p>
                      <p className="text-sm">Add elements from the sidebar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - GrapesJS Style Properties */}
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            {/* Header with Tabs */}
            <div className="border-b border-gray-700">
              <div className="flex">
                <button className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'style' 
                    ? 'text-purple-400 border-purple-400' 
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}>
                  Styles
                  </button>
                <button className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'switch' 
                    ? 'text-purple-400 border-purple-400' 
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}>
                  Switch
                </button>
                <button className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'properties' 
                    ? 'text-purple-400 border-purple-400' 
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}>
                  Properties
                </button>
              </div>
              
              {/* State Dropdown */}
              <div className="px-4 py-2 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs">State</span>
                  <select className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600">
                    <option>hover</option>
                    <option>normal</option>
                    <option>active</option>
                    <option>focus</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
            {selectedElement ? (
                <div className="p-4">
                  {/* Selection Section - Exact GrapesJS Style */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-gray-300 text-xs font-medium">Selection</span>
                    </div>
                    
                    {/* Class/Component Row */}
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <button className="w-6 h-6 bg-purple-600 text-white rounded text-xs flex items-center justify-center hover:bg-purple-700">
                        +
                      </button>
                      <div className="bg-pink-500 text-white px-2 py-1 rounded text-xs flex items-center">
                        card
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Add class..."
                        className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                      />
                    </div>
                    
                    {/* Element Type Row */}
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        {selectedElement.type}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Add class..."
                        className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                      />
                    </div>
                    
                    {/* Action Icons */}
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Categories - Exact GrapesJS Style */}
                  <div className="space-y-1">
                    {/* Layout */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Layout</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        {/* Display */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Display</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <select
                            value={selectedElement.styles.display || 'block'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, display: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="block">Block</option>
                            <option value="inline">Inline</option>
                            <option value="inline-block">Inline Block</option>
                            <option value="flex">Flex</option>
                            <option value="grid">Grid</option>
                            <option value="none">None</option>
                          </select>
                        </div>

                        {/* Position */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Position</span>
                          </div>
                          <select
                            value={selectedElement.styles.position || 'static'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, position: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="static">Static</option>
                            <option value="relative">Relative</option>
                            <option value="absolute">Absolute</option>
                            <option value="fixed">Fixed</option>
                            <option value="sticky">Sticky</option>
                          </select>
                        </div>

                        {/* Float */}
                <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Float</span>
                          </div>
                          <select
                            value={selectedElement.styles.float || 'none'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, float: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="none">None</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Size */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Size</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {expandedSections.has('dimensions') && (
                        <div className="p-3 bg-gray-800 border-t border-gray-600">
                        {/* Width */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Width</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.width || 'auto'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, width: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="auto"
                            />
                            <button className="p-1 hover:bg-gray-600 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Height */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Height</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.height || 'auto'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, height: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="auto"
                            />
                            <button className="p-1 hover:bg-gray-600 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Min Width */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Min Width</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.minWidth || 'auto'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, minWidth: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="auto"
                            />
                            <button className="p-1 hover:bg-gray-600 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Min Height */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Min Height</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.minHeight || 'auto'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, minHeight: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="auto"
                            />
                            <button className="p-1 hover:bg-gray-600 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Max Width */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Max Width</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.maxWidth || 'auto'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, maxWidth: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="auto"
                            />
                            <button className="p-1 hover:bg-gray-600 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Max Height */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Max Height</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.maxHeight || 'auto'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, maxHeight: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="auto"
                            />
                            <button className="p-1 hover:bg-gray-600 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        </div>
                      )}
                    </div>

                    {/* Space - Enhanced */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Space</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        {/* Padding */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Padding</span>
                            <div className="flex items-center space-x-1">
                              <button className="p-1 hover:bg-gray-700 rounded">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <div className="w-4 h-4 border border-purple-400 rounded"></div>
                              <div className="w-4 h-4 border border-dashed border-gray-500 rounded"></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.padding || '0'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, padding: e.target.value }
                              })}
                              className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="0"
                            />
                            <span className="text-gray-400 text-xs">px</span>
                          </div>
                        </div>
                        
                        {/* Margin */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Margin</span>
                            <div className="flex items-center space-x-1">
                              <button className="p-1 hover:bg-gray-700 rounded">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <div className="w-4 h-4 border border-purple-400 rounded"></div>
                              <div className="w-4 h-4 border border-dashed border-gray-500 rounded"></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.margin || '0'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, margin: e.target.value }
                              })}
                              className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="0"
                            />
                            <span className="text-gray-400 text-xs">px</span>
                          </div>
                        </div>

                        {/* Gap (for flex/grid) */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Gap</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.gap || '0'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, gap: e.target.value }
                              })}
                              className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="0"
                            />
                            <span className="text-gray-400 text-xs">px</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Position */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Position</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Typography</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        {/* Font Family */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Font</span>
                          </div>
                          <select
                            value={selectedElement.styles.fontFamily || 'Arial'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, fontFamily: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Impact">Impact</option>
                            <option value="Comic Sans MS">Comic Sans MS</option>
                          </select>
                        </div>

                        {/* Font Size */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Size</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.fontSize || 'medium'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, fontSize: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="medium"
                            />
                            <button className="p-1 hover:bg-gray-600 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Font Weight */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Weight</span>
                          </div>
                          <select
                            value={selectedElement.styles.fontWeight || 'normal'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, fontWeight: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="lighter">Lighter</option>
                            <option value="bolder">Bolder</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                            <option value="300">300</option>
                            <option value="400">400</option>
                            <option value="500">500</option>
                            <option value="600">600</option>
                            <option value="700">700</option>
                            <option value="800">800</option>
                            <option value="900">900</option>
                          </select>
                        </div>

                        {/* Line Height */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Line Height</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.lineHeight || 'normal'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, lineHeight: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="normal"
                            />
                            <button className="p-1 hover:bg-gray-600 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Letter Spacing */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Spacing</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedElement.styles.letterSpacing || 'normal'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, letterSpacing: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="normal"
                            />
                            <button className="p-1 hover:bg-gray-600 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Text Align */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Align</span>
                          </div>
                          <select
                            value={selectedElement.styles.textAlign || 'left'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, textAlign: e.target.value as 'left' | 'center' | 'right' }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                          </select>
                        </div>

                        {/* Vertical Align */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Vertical Align</span>
                          </div>
                          <select
                            value={selectedElement.styles.verticalAlign || 'baseline'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, verticalAlign: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="baseline">Baseline</option>
                            <option value="top">Top</option>
                            <option value="middle">Middle</option>
                            <option value="bottom">Bottom</option>
                            <option value="text-top">Text Top</option>
                            <option value="text-bottom">Text Bottom</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Background */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Background</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        {/* Background Color */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Background Color</span>
                            <button className="p-1 hover:bg-gray-700 rounded">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={selectedElement.styles.backgroundColor || '#ffffff'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                              })}
                              className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={selectedElement.styles.backgroundColor || '#ffffff'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                              })}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        {/* Background Image */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Background Image</span>
                          </div>
                          <input
                            type="text"
                            value={selectedElement.styles.backgroundImage || ''}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, backgroundImage: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            placeholder="url('image.jpg')"
                          />
                        </div>

                        {/* Background Size */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Background Size</span>
                          </div>
                          <select
                            value={selectedElement.styles.backgroundSize || 'auto'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, backgroundSize: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="auto">Auto</option>
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="100% 100%">100% 100%</option>
                            <option value="100% auto">100% Auto</option>
                            <option value="auto 100%">Auto 100%</option>
                          </select>
                        </div>

                        {/* Background Position */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Background Position</span>
                          </div>
                          <select
                            value={selectedElement.styles.backgroundPosition || 'center'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, backgroundPosition: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top left">Top Left</option>
                            <option value="top right">Top Right</option>
                            <option value="bottom left">Bottom Left</option>
                            <option value="bottom right">Bottom Right</option>
                          </select>
                        </div>

                        {/* Background Repeat */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Background Repeat</span>
                          </div>
                          <select
                            value={selectedElement.styles.backgroundRepeat || 'no-repeat'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, backgroundRepeat: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="no-repeat">No Repeat</option>
                            <option value="repeat">Repeat</option>
                            <option value="repeat-x">Repeat X</option>
                            <option value="repeat-y">Repeat Y</option>
                            <option value="space">Space</option>
                            <option value="round">Round</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Borders */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Borders</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        {/* Border Width */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Width</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="0"
                              value={(() => {
                                const border = selectedElement.styles.border || '';
                                const match = border.match(/^(\d+(?:\.\d+)?)/);
                                return match ? match[1] : '';
                              })()}
                              onChange={(e) => {
                                const width = e.target.value;
                                const currentBorder = selectedElement.styles.border || '';
                                const style = currentBorder.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/) || ['solid'];
                                const color = currentBorder.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+/) || ['#000000'];
                                
                                if (width === '' || width === '0') {
                                  updateElement(selectedElement.id, { 
                                    styles: { ...selectedElement.styles, border: 'none' }
                                  });
                                } else {
                                  updateElement(selectedElement.id, { 
                                    styles: { ...selectedElement.styles, border: `${width}px ${style[0]} ${color[0]}` }
                                  });
                                }
                              }}
                              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-400 text-xs">px</span>
                          </div>
                        </div>

                        {/* Border Style */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Style</span>
                          </div>
                          <select
                            value={(() => {
                              const border = selectedElement.styles.border || '';
                              const match = border.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/);
                              return match ? match[0] : 'solid';
                            })()}
                            onChange={(e) => {
                              const style = e.target.value;
                              const currentBorder = selectedElement.styles.border || '';
                              const width = currentBorder.match(/^(\d+(?:\.\d+)?)/) || ['1'];
                              const color = currentBorder.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+/) || ['#000000'];
                              
                              if (style === 'none') {
                                updateElement(selectedElement.id, { 
                                  styles: { ...selectedElement.styles, border: 'none' }
                                });
                              } else {
                                updateElement(selectedElement.id, { 
                                  styles: { ...selectedElement.styles, border: `${width[0]}px ${style} ${color[0]}` }
                                });
                              }
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                            <option value="groove">Groove</option>
                            <option value="ridge">Ridge</option>
                            <option value="inset">Inset</option>
                            <option value="outset">Outset</option>
                            <option value="none">None</option>
                          </select>
                        </div>

                        {/* Border Color */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Color</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={(() => {
                                const border = selectedElement.styles.border || '';
                                const match = border.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
                                return match ? match[0] : '#000000';
                              })()}
                              onChange={(e) => {
                                const color = e.target.value;
                                const currentBorder = selectedElement.styles.border || '';
                                const width = currentBorder.match(/^(\d+(?:\.\d+)?)/) || ['1'];
                                const style = currentBorder.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/) || ['solid'];
                                
                                updateElement(selectedElement.id, { 
                                  styles: { ...selectedElement.styles, border: `${width[0]}px ${style[0]} ${color}` }
                                });
                              }}
                              className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="#000000"
                              value={(() => {
                                const border = selectedElement.styles.border || '';
                                const match = border.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
                                return match ? match[0] : '';
                              })()}
                              onChange={(e) => {
                                const color = e.target.value;
                                const currentBorder = selectedElement.styles.border || '';
                                const width = currentBorder.match(/^(\d+(?:\.\d+)?)/) || ['1'];
                                const style = currentBorder.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/) || ['solid'];
                                
                                updateElement(selectedElement.id, { 
                                  styles: { ...selectedElement.styles, border: `${width[0]}px ${style[0]} ${color}` }
                                });
                              }}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Border Radius */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Corner Radius</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="0"
                              value={(() => {
                                const borderRadius = selectedElement.styles.borderRadius || '';
                                const match = borderRadius.match(/^(\d+(?:\.\d+)?)/);
                                return match ? match[1] : '';
                              })()}
                              onChange={(e) => {
                                const radius = e.target.value;
                                updateElement(selectedElement.id, { 
                                  styles: { ...selectedElement.styles, borderRadius: radius === '' ? '0' : `${radius}px` }
                                });
                              }}
                              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-400 text-xs">px</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Effects */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Effects</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        {/* Box Shadow */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Box Shadow</span>
                          </div>
                          <input
                            type="text"
                            value={selectedElement.styles.boxShadow || ''}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, boxShadow: e.target.value }
                            })}
                            placeholder="0 4px 15px rgba(0,0,0,0.2)"
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Opacity */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Opacity</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={selectedElement.styles.opacity || '1'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, opacity: e.target.value }
                              })}
                              className="flex-1"
                            />
                            <span className="text-gray-400 text-xs w-8">
                              {Math.round(parseFloat(selectedElement.styles.opacity || '1') * 100)}%
                            </span>
                          </div>
                        </div>

                        {/* Transform */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Transform</span>
                          </div>
                          <input
                            type="text"
                            value={selectedElement.styles.transform || ''}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, transform: e.target.value }
                            })}
                            placeholder="rotate(45deg) scale(1.2)"
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Transition */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-xs">Transition</span>
                          </div>
                          <input
                            type="text"
                            value={selectedElement.styles.transition || ''}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, transition: e.target.value }
                            })}
                            placeholder="all 0.3s ease"
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'style' && (
                  <div className="space-y-4">
                    {/* Legacy Styling - Hidden by default */}
                    <div className="border-t border-gray-700 pt-4">
                      <details className="group">
                        <summary className="text-gray-300 text-sm font-medium mb-3 cursor-pointer hover:text-white">
                          Legacy Styling (Click to expand)
                        </summary>
                        <div className="mt-3 space-y-3">
                      {/* Text Color */}
                      <div className="mb-3">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Text Color</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={selectedElement.styles.color || '#333333'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, color: e.target.value }
                            })}
                            className="w-8 h-8 rounded border border-gray-600"
                          />
                          <input
                            type="text"
                            value={selectedElement.styles.color || '#333333'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, color: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Background Color */}
                      <div className="mb-3">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Background</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={selectedElement.styles.backgroundColor || '#ffffff'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                            })}
                            className="w-8 h-8 rounded border border-gray-600"
                          />
                          <input
                            type="text"
                            value={selectedElement.styles.backgroundColor || '#ffffff'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Font Size */}
                      <div className="mb-3">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Font Size</label>
                        <select
                          value={selectedElement.styles.fontSize || '16px'}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            styles: { ...selectedElement.styles, fontSize: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="12px">12px</option>
                          <option value="14px">14px</option>
                          <option value="16px">16px</option>
                          <option value="18px">18px</option>
                          <option value="20px">20px</option>
                          <option value="24px">24px</option>
                          <option value="32px">32px</option>
                          <option value="48px">48px</option>
                        </select>
                      </div>
                        
                        {/* Box Shadow */}
                        <div className="mb-3">
                          <label className="block text-gray-300 text-sm font-medium mb-2">Box Shadow</label>
                          <input
                            type="text"
                            value={selectedElement.styles.boxShadow || ''}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, boxShadow: e.target.value }
                            })}
                            placeholder="e.g., 0 4px 15px rgba(0,0,0,0.2)"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Transform */}
                        <div className="mb-3">
                          <label className="block text-gray-300 text-sm font-medium mb-2">Transform</label>
                          <input
                            type="text"
                            value={selectedElement.styles.transform || ''}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, transform: e.target.value }
                            })}
                            placeholder="e.g., rotate(45deg) scale(1.1)"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Transition */}
                        <div className="mb-3">
                          <label className="block text-gray-300 text-sm font-medium mb-2">Transition</label>
                          <input
                            type="text"
                            value={selectedElement.styles.transition || ''}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, transition: e.target.value }
                            })}
                            placeholder="e.g., all 0.3s ease"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      </details>
                    </div>
                  </div>
                )}

                {/* Switch Tab - Separated Properties */}
                {activeTab === 'switch' && (
                  <div className="space-y-4">
                    {/* Dimensions Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Dimensions</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        {/* Width */}
                        <div className="mb-3">
                          <label className="block text-gray-300 text-xs mb-2">Width</label>
                          <input
                            type="text"
                            value={selectedElement.styles.width || '400'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, width: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            placeholder="400"
                          />
                        </div>
                        {/* Height */}
                        <div>
                          <label className="block text-gray-300 text-xs mb-2">Height</label>
                          <input
                            type="text"
                            value={selectedElement.styles.height || '100'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, height: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Text Color Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Text Color</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={selectedElement.styles.color || '#ffffff'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, color: e.target.value }
                            })}
                            className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={selectedElement.styles.color || '#ffffff'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, color: e.target.value }
                            })}
                            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Font Size Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Font Size</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={selectedElement.styles.fontSize || '32px'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, fontSize: e.target.value }
                            })}
                            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            placeholder="32px"
                          />
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Font Weight Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Font Weight</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        <select
                          value={selectedElement.styles.fontWeight || 'bold'}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            styles: { ...selectedElement.styles, fontWeight: e.target.value }
                          })}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="lighter">Lighter</option>
                          <option value="bolder">Bolder</option>
                          <option value="100">100</option>
                          <option value="200">200</option>
                          <option value="300">300</option>
                          <option value="400">400</option>
                          <option value="500">500</option>
                          <option value="600">600</option>
                          <option value="700">700</option>
                          <option value="800">800</option>
                          <option value="900">900</option>
                        </select>
                      </div>
                    </div>

                    {/* Background Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Background</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={selectedElement.styles.backgroundColor || '#667eea'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                            })}
                            className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={selectedElement.styles.backgroundColor || '#667eea'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                            })}
                            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            placeholder="#667eea"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Text Alignment Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Text Alignment</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, textAlign: 'left' }
                            })}
                            className={`px-3 py-1 text-xs rounded ${
                              selectedElement.styles.textAlign === 'left' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            Left
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, textAlign: 'center' }
                            })}
                            className={`px-3 py-1 text-xs rounded ${
                              selectedElement.styles.textAlign === 'center' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            Center
                          </button>
                          <button
                            onClick={() => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, textAlign: 'right' }
                            })}
                            className={`px-3 py-1 text-xs rounded ${
                              selectedElement.styles.textAlign === 'right' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            Right
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Border Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Border</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        {/* Border Width */}
                        <div className="mb-3">
                          <label className="block text-gray-300 text-xs mb-2">Width</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={(() => {
                                const border = selectedElement.styles.border || '';
                                const match = border.match(/^(\d+(?:\.\d+)?)/);
                                return match ? match[1] : '0';
                              })()}
                              onChange={(e) => {
                                const width = e.target.value;
                                const currentBorder = selectedElement.styles.border || '';
                                const style = currentBorder.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/) || ['solid'];
                                const color = currentBorder.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+/) || ['#000000'];
                                
                                if (width === '' || width === '0') {
                                  updateElement(selectedElement.id, { 
                                    styles: { ...selectedElement.styles, border: 'none' }
                                  });
                                } else {
                                  updateElement(selectedElement.id, { 
                                    styles: { ...selectedElement.styles, border: `${width}px ${style[0]} ${color[0]}` }
                                  });
                                }
                              }}
                              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            />
                            <span className="text-gray-400 text-xs">px</span>
                          </div>
                        </div>
                        {/* Border Style */}
                        <div className="mb-3">
                          <label className="block text-gray-300 text-xs mb-2">Style</label>
                          <select
                            value={(() => {
                              const border = selectedElement.styles.border || '';
                              const match = border.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/);
                              return match ? match[0] : 'solid';
                            })()}
                            onChange={(e) => {
                              const style = e.target.value;
                              const currentBorder = selectedElement.styles.border || '';
                              const width = currentBorder.match(/^(\d+(?:\.\d+)?)/) || ['1'];
                              const color = currentBorder.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+/) || ['#000000'];
                              
                              if (style === 'none') {
                                updateElement(selectedElement.id, { 
                                  styles: { ...selectedElement.styles, border: 'none' }
                                });
                              } else {
                                updateElement(selectedElement.id, { 
                                  styles: { ...selectedElement.styles, border: `${width[0]}px ${style} ${color[0]}` }
                                });
                              }
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                            <option value="groove">Groove</option>
                            <option value="ridge">Ridge</option>
                            <option value="inset">Inset</option>
                            <option value="outset">Outset</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                        {/* Border Color */}
                        <div>
                          <label className="block text-gray-300 text-xs mb-2">Color</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={(() => {
                                const border = selectedElement.styles.border || '';
                                const match = border.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
                                return match ? match[0] : '#000000';
                              })()}
                              onChange={(e) => {
                                const color = e.target.value;
                                const currentBorder = selectedElement.styles.border || '';
                                const width = currentBorder.match(/^(\d+(?:\.\d+)?)/) || ['1'];
                                const style = currentBorder.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/) || ['solid'];
                                
                                updateElement(selectedElement.id, { 
                                  styles: { ...selectedElement.styles, border: `${width[0]}px ${style[0]} ${color}` }
                                });
                              }}
                              className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="#000000"
                              value={(() => {
                                const border = selectedElement.styles.border || '';
                                const match = border.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
                                return match ? match[0] : '';
                              })()}
                              onChange={(e) => {
                                const color = e.target.value;
                                const currentBorder = selectedElement.styles.border || '';
                                const width = currentBorder.match(/^(\d+(?:\.\d+)?)/) || ['1'];
                                const style = currentBorder.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/) || ['solid'];
                                
                                updateElement(selectedElement.id, { 
                                  styles: { ...selectedElement.styles, border: `${width[0]}px ${style[0]} ${color}` }
                                });
                              }}
                              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Corner Radius Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Corner Radius</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={(() => {
                              const borderRadius = selectedElement.styles.borderRadius || '';
                              const match = borderRadius.match(/^(\d+(?:\.\d+)?)/);
                              return match ? match[1] : '0';
                            })()}
                            onChange={(e) => {
                              const radius = e.target.value;
                              updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, borderRadius: radius === '' ? '0' : `${radius}px` }
                              });
                            }}
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          />
                          <span className="text-gray-400 text-xs">px</span>
                        </div>
                      </div>
                    </div>

                    {/* Padding Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Padding</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        <input
                          type="text"
                          value={selectedElement.styles.padding || '20px'}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            styles: { ...selectedElement.styles, padding: e.target.value }
                          })}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          placeholder="20px"
                        />
                      </div>
                    </div>

                    {/* Opacity Section */}
                    <div className="border border-gray-600 rounded">
                      <div className="flex items-center justify-between p-3 bg-gray-700 cursor-pointer hover:bg-gray-600">
                        <span className="text-white text-sm font-medium">Opacity</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="p-3 bg-gray-800 border-t border-gray-600">
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={selectedElement.styles.opacity || '1'}
                            onChange={(e) => updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, opacity: e.target.value }
                            })}
                            className="flex-1"
                          />
                          <span className="text-gray-400 text-xs w-12">
                            {Math.round(parseFloat(selectedElement.styles.opacity || '1') * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'animation' && (
                  <div className="space-y-4">
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">Animation Settings</h4>
                      
                      {/* Animation Type */}
                      <div className="mb-3">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Animation Type</label>
                        <select
                          value={selectedElement.animation?.type || 'none'}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            animation: { 
                              ...selectedElement.animation, 
                              type: e.target.value as any,
                              duration: selectedElement.animation?.duration || 1,
                              delay: selectedElement.animation?.delay || 0,
                              iteration: selectedElement.animation?.iteration || 'once'
                            }
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="none">None</option>
                          <option value="fadeIn">Fade In</option>
                          <option value="slideIn">Slide In</option>
                          <option value="bounce">Bounce</option>
                          <option value="pulse">Pulse</option>
                          <option value="rotate">Rotate</option>
                          <option value="scale">Scale</option>
                        </select>
                      </div>

                      {/* Duration */}
                      <div className="mb-3">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Duration (seconds)</label>
                        <input
                          type="number"
                          value={selectedElement.animation?.duration || 1}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            animation: { 
                              ...selectedElement.animation, 
                              duration: parseFloat(e.target.value) || 1,
                              type: selectedElement.animation?.type || 'fadeIn',
                              delay: selectedElement.animation?.delay || 0,
                              iteration: selectedElement.animation?.iteration || 'once'
                            }
                          })}
                          min="0.1"
                          max="10"
                          step="0.1"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Delay */}
                      <div className="mb-3">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Delay (seconds)</label>
                        <input
                          type="number"
                          value={selectedElement.animation?.delay || 0}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            animation: { 
                              ...selectedElement.animation, 
                              delay: parseFloat(e.target.value) || 0,
                              type: selectedElement.animation?.type || 'fadeIn',
                              duration: selectedElement.animation?.duration || 1,
                              iteration: selectedElement.animation?.iteration || 'once'
                            }
                          })}
                          min="0"
                          max="10"
                          step="0.1"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Iteration */}
                      <div className="mb-3">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Iteration</label>
                        <select
                          value={selectedElement.animation?.iteration || 'once'}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            animation: { 
                              ...selectedElement.animation, 
                              iteration: e.target.value as any,
                              type: selectedElement.animation?.type || 'fadeIn',
                              duration: selectedElement.animation?.duration || 1,
                              delay: selectedElement.animation?.delay || 0
                            }
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="once">Once</option>
                          <option value="infinite">Infinite</option>
                          <option value="2">2 times</option>
                          <option value="3">3 times</option>
                          <option value="5">5 times</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'script' && (
                  <div className="space-y-4">
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">Custom Script</h4>
                      
                      <div className="mb-3">
                        <label className="block text-gray-300 text-sm font-medium mb-2">JavaScript Code</label>
                        <textarea
                          value={selectedElement.script || ''}
                          onChange={(e) => updateElement(selectedElement.id, { script: e.target.value })}
                          placeholder="// Custom JavaScript for this element&#10;console.log('Element clicked!');"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                          rows={6}
                        />
                      </div>

                      <div className="text-xs text-gray-400">
                        <p>💡 Tips:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          <li>Use <code>this</code> to reference the element</li>
                          <li>Access element data with <code>this.dataset</code></li>
                          <li>Modify styles with <code>this.style</code></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'interaction' && (
                  <div className="space-y-4">
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">Interaction Settings</h4>
                      
                      {/* Hover Effects */}
                      <div className="mb-4">
                        <h5 className="text-gray-300 text-sm font-medium mb-2">Hover Effects</h5>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-gray-300 text-xs font-medium mb-1">Hover Background</label>
                            <input
                              type="color"
                              value={selectedElement.interaction?.hover?.styles?.backgroundColor || '#f0f0f0'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                interaction: { 
                                  ...selectedElement.interaction,
                                  hover: {
                                    ...selectedElement.interaction?.hover,
                                    styles: {
                                      ...selectedElement.interaction?.hover?.styles,
                                      backgroundColor: e.target.value
                                    }
                                  }
                                }
                              })}
                              className="w-full h-8 rounded border border-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs font-medium mb-1">Hover Transform</label>
                            <input
                              type="text"
                              value={selectedElement.interaction?.hover?.styles?.transform || ''}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                interaction: { 
                                  ...selectedElement.interaction,
                                  hover: {
                                    ...selectedElement.interaction?.hover,
                                    styles: {
                                      ...selectedElement.interaction?.hover?.styles,
                                      transform: e.target.value
                                    }
                                  }
                                }
                              })}
                              placeholder="e.g., scale(1.1)"
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Click Actions */}
                      <div className="mb-4">
                        <h5 className="text-gray-300 text-sm font-medium mb-2">Click Actions</h5>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-gray-300 text-xs font-medium mb-1">Action Type</label>
                            <select
                              value={selectedElement.interaction?.click?.action || 'custom'}
                              onChange={(e) => updateElement(selectedElement.id, { 
                                interaction: { 
                                  ...selectedElement.interaction,
                                  click: {
                                    ...selectedElement.interaction?.click,
                                    action: e.target.value as any
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="custom">Custom Script</option>
                              <option value="link">Link</option>
                              <option value="modal">Open Modal</option>
                              <option value="scroll">Scroll to Element</option>
                            </select>
                          </div>
                          {selectedElement.interaction?.click?.action === 'link' && (
                            <div>
                              <label className="block text-gray-300 text-xs font-medium mb-1">Target URL</label>
                              <input
                                type="text"
                                value={selectedElement.interaction?.click?.target || ''}
                                onChange={(e) => updateElement(selectedElement.id, { 
                                  interaction: { 
                                    ...selectedElement.interaction,
                                    click: {
                                      ...selectedElement.interaction?.click,
                                      target: e.target.value
                                    }
                                  }
                                })}
                                placeholder="https://example.com"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Upload (only for image elements) */}
                {selectedElement.type === 'image' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Image Upload</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {selectedElement.imageUrl && (
                        <div className="text-xs text-green-400">
                          ✓ Image uploaded successfully
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Size Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Width</label>
                    <input
                      type="number"
                      value={selectedElement.size.width}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        size: { ...selectedElement.size, width: parseInt(e.target.value) || 200 }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Height</label>
                    <input
                      type="number"
                      value={selectedElement.size.height}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        size: { ...selectedElement.size, height: parseInt(e.target.value) || 40 }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="30"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Text Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedElement.styles.color || '#333333'}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        styles: { ...selectedElement.styles, color: e.target.value }
                      })}
                      className="w-8 h-8 rounded border border-gray-600"
                    />
                    <input
                      type="text"
                      value={selectedElement.styles.color || '#333333'}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        styles: { ...selectedElement.styles, color: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Font Size</label>
                  <select
                    value={selectedElement.styles.fontSize || '16px'}
                    onChange={(e) => updateElement(selectedElement.id, { 
                      styles: { ...selectedElement.styles, fontSize: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                    <option value="32px">32px</option>
                    <option value="48px">48px</option>
                  </select>
                </div>

                {/* Font Weight */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Font Weight</label>
                  <select
                    value={selectedElement.styles.fontWeight || 'normal'}
                    onChange={(e) => updateElement(selectedElement.id, { 
                      styles: { ...selectedElement.styles, fontWeight: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Light</option>
                  </select>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Background</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedElement.styles.backgroundColor?.includes('#') ? selectedElement.styles.backgroundColor : '#ffffff'}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                      })}
                      className="w-8 h-8 rounded border border-gray-600"
                    />
                    <input
                      type="text"
                      value={selectedElement.styles.backgroundColor || '#ffffff'}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Text Align */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Text Alignment</label>
                  <div className="flex space-x-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateElement(selectedElement.id, { 
                          styles: { ...selectedElement.styles, textAlign: align as 'left' | 'center' | 'right' }
                        })}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          selectedElement.styles.textAlign === align
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Controls */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Border</label>
                  <div className="space-y-3">
                    {/* Border Width */}
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Width</label>
                    <div className="flex items-center space-x-2">
                      <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          value={(() => {
                            const border = selectedElement.styles.border || '';
                            const match = border.match(/^(\d+(?:\.\d+)?)/);
                            return match ? match[1] : '';
                          })()}
                          onChange={(e) => {
                            const width = e.target.value;
                            const currentBorder = selectedElement.styles.border || '';
                            const style = currentBorder.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/) || ['solid'];
                            const color = currentBorder.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+/) || ['#000000'];
                            
                            if (width === '' || width === '0') {
                              updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, border: 'none' }
                              });
                            } else {
                              updateElement(selectedElement.id, { 
                                styles: { ...selectedElement.styles, border: `${width}px ${style[0]} ${color[0]}` }
                              });
                            }
                          }}
                          className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-400 text-xs">px</span>
                    </div>
                    </div>

                    {/* Border Style */}
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Style</label>
                      <select
                        value={(() => {
                          const border = selectedElement.styles.border || '';
                          const match = border.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/);
                          return match ? match[0] : 'solid';
                        })()}
                        onChange={(e) => {
                          const style = e.target.value;
                          const currentBorder = selectedElement.styles.border || '';
                          const width = currentBorder.match(/^(\d+(?:\.\d+)?)/) || ['1'];
                          const color = currentBorder.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+/) || ['#000000'];
                          
                          if (style === 'none') {
                            updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, border: 'none' }
                            });
                          } else {
                            updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, border: `${width[0]}px ${style} ${color[0]}` }
                            });
                          }
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                        <option value="double">Double</option>
                        <option value="groove">Groove</option>
                        <option value="ridge">Ridge</option>
                        <option value="inset">Inset</option>
                        <option value="outset">Outset</option>
                        <option value="none">None</option>
                      </select>
                    </div>

                    {/* Border Color */}
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                          value={(() => {
                            const border = selectedElement.styles.border || '';
                            const match = border.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
                            return match ? match[0] : '#000000';
                          })()}
                          onChange={(e) => {
                            const color = e.target.value;
                            const currentBorder = selectedElement.styles.border || '';
                            const width = currentBorder.match(/^(\d+(?:\.\d+)?)/) || ['1'];
                            const style = currentBorder.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/) || ['solid'];
                            
                            updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, border: `${width[0]}px ${style[0]} ${color}` }
                            });
                          }}
                          className="w-12 h-8 rounded border border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="#000000"
                          value={(() => {
                            const border = selectedElement.styles.border || '';
                            const match = border.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
                            return match ? match[0] : '';
                          })()}
                          onChange={(e) => {
                            const color = e.target.value;
                            const currentBorder = selectedElement.styles.border || '';
                            const width = currentBorder.match(/^(\d+(?:\.\d+)?)/) || ['1'];
                            const style = currentBorder.match(/solid|dashed|dotted|double|groove|ridge|inset|outset/) || ['solid'];
                            
                            updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, border: `${width[0]}px ${style[0]} ${color}` }
                            });
                          }}
                          className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Border Radius */}
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Corner Radius</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          value={(() => {
                            const borderRadius = selectedElement.styles.borderRadius || '';
                            const match = borderRadius.match(/^(\d+(?:\.\d+)?)/);
                            return match ? match[1] : '';
                          })()}
                          onChange={(e) => {
                            const radius = e.target.value;
                            updateElement(selectedElement.id, { 
                              styles: { ...selectedElement.styles, borderRadius: radius === '' ? '0' : `${radius}px` }
                            });
                          }}
                          className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-400 text-xs">px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Padding Controls */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Padding</label>
                  <input
                    type="text"
                    placeholder="Padding (e.g., 10px 20px)"
                    value={selectedElement.styles.padding || ''}
                    onChange={(e) => updateElement(selectedElement.id, { 
                      styles: { ...selectedElement.styles, padding: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Opacity Control */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Opacity</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedElement.styles.opacity || '1'}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        styles: { ...selectedElement.styles, opacity: e.target.value }
                      })}
                      className="flex-1"
                    />
                    <span className="text-gray-400 text-xs w-8">
                      {Math.round((parseFloat(selectedElement.styles.opacity || '1') * 100))}%
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🗑️ Delete Element
                </button>
              </div>
            ) : (
              <div className="p-4 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-white font-medium text-sm mb-1">No Element Selected</h3>
                <p className="text-gray-400 text-xs">Click on an element to edit its properties</p>
              </div>
            )}
            </div>

            {/* Website Settings */}
            <div className="border-t border-gray-700 p-4">
              <h4 className="text-white font-medium text-sm mb-3">Website Settings</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={websiteTitle}
                    onChange={(e) => setWebsiteTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">URL Slug</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2 rounded-l border border-r-0 border-gray-600 bg-gray-700 text-gray-300 text-xs">
                      webeenthere.com/
                    </span>
                    <input
                      type="text"
                      value={websiteSlug}
                      onChange={(e) => setWebsiteSlug(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'template-selection':
        return (
          <TemplateSelector
            onTemplateSelect={handleTemplateSelect}
            onStartFromScratch={handleStartFromScratch}
          />
        );

      case 'website-details':
        return (
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Website Details</h1>
              <p className="text-gray-400">Enter your website information</p>
            </div>

            <div className="max-w-2xl">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website Title *
                </label>
                <input
                  type="text"
                  value={websiteTitle}
                  onChange={(e) => setWebsiteTitle(e.target.value)}
                  placeholder="Enter your website title"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Debug: Show selected template */}
              {selectedTemplate && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <h3 className="text-blue-300 font-medium mb-2">Selected Template:</h3>
                  <p className="text-blue-200 text-sm">
                    <strong>{selectedTemplate.name}</strong> - {selectedTemplate.elements.length} elements
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    Category: {selectedTemplate.category} | Tags: {selectedTemplate.tags.join(', ')}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website URL (optional)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-700 bg-gray-700 text-gray-300 text-sm">
                    webeenthere.com/
                  </span>
                  <input
                    type="text"
                    value={websiteSlug}
                    onChange={(e) => setWebsiteSlug(e.target.value)}
                    placeholder="your-website-url"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate from title
                </p>
              </div>

              {selectedTemplate && (
                <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-white font-medium mb-2">Selected Template</h3>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{selectedTemplate.image}</span>
                    <div>
                      <p className="text-white font-medium">{selectedTemplate.name}</p>
                      <p className="text-gray-400 text-sm">{selectedTemplate.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={handleWebsiteDetailsSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Continue to Builder
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Back to Templates
                </button>
              </div>
            </div>
          </div>
        );

      case 'builder':
        return renderBuilder();

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {renderCurrentStep()}
    </div>
  );
});

WebsiteBuilder.displayName = 'WebsiteBuilder';

export default WebsiteBuilder;