'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './styles/grapesjs-custom.css';

// Core plugins
import 'grapesjs-preset-webpage';
import 'grapesjs-blocks-basic';
import 'grapesjs-plugin-forms';
import 'grapesjs-component-countdown';
import 'grapesjs-plugin-export';
import 'grapesjs-tabs';
import 'grapesjs-custom-code';
import 'grapesjs-tooltip';
import 'grapesjs-touch';
import 'grapesjs-parser-postcss';

import { WebsiteDetailsModal } from './components/WebsiteDetailsModal';
import { API_ENDPOINTS, apiPost, apiPut, apiGet } from '../../../lib/apiConfig';

interface GrapesJSBuilderClientProps {
  websiteId?: string;
  initialTemplate?: string;
}

const GrapesJSBuilderClient: React.FC<GrapesJSBuilderClientProps> = ({ 
  websiteId, 
  initialTemplate 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const grapesEditor = useRef<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWebsiteDetails, setShowWebsiteDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState('blocks');
  const [activePropertiesTab, setActivePropertiesTab] = useState('styles');
  const [expandedSections, setExpandedSections] = useState({
    layout: true,
    size: true,
    space: true,
    position: false,
    typography: false,
    background: false,
    borders: false,
    effects: false
  });
  const [isInitialized, setIsInitialized] = useState(true);
  const [websiteData, setWebsiteData] = useState<any>(null);
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get website ID from URL or props
  const id = websiteId || searchParams.get('id');

  // Load website data
  useEffect(() => {
    if (id) {
      loadWebsiteData();
    }
  }, [id]);

  const loadWebsiteData = async () => {
    try {
      console.log('📡 Loading website data for ID:', id);
      const data = await apiGet(`${API_ENDPOINTS.WEBSITES}/${id}`);
      console.log('📡 Website data response:', data);
      setWebsiteData(data);
      console.log('✅ Website data loaded successfully');
        } catch (error) {
      console.error('❌ Error loading website data:', error);
      setError('Failed to load website data');
    }
  };

  // Enhanced GrapesJS initialization
  useEffect(() => {
    if (!editorRef.current || isInitialized) return;

    const initGrapesJS = async () => {
      try {
        console.log('🚀 Starting enhanced GrapesJS initialization...');
        
        const editor = grapesjs.init({
          container: editorRef.current!,
          height: '100%',
          width: '100%',
          storageManager: false,
          noticeOnUnload: false,
          showOffsets: true,
          showOffsetsSelected: true,
          plugins: [
            'gjs-preset-webpage',
            'gjs-blocks-basic',
            'gjs-plugin-forms',
            'gjs-plugin-export'
          ],
          pluginsOpts: {
            'gjs-preset-webpage': {
              modalImportTitle: 'Import Template',
              modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
              modalImportContent: function(editor: any) {
                return editor.getHtml() + '<style>' + editor.getCss() + '</style>';
              },
            },
            'gjs-blocks-basic': {
              blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map'],
              category: 'Basic',
              flexGrid: true,
              stylePrefix: 'gjs-',
              addBasicStyle: true,
              labelColumn1: '1 Column',
              labelColumn2: '2 Columns',
              labelColumn3: '3 Columns',
              labelColumn37: '2 Columns 3/7',
              labelText: 'Text',
              labelLink: 'Link',
              labelImage: 'Image',
              labelVideo: 'Video',
              labelMap: 'Map',
              rowHeight: 75
            },
            'gjs-plugin-forms': {
              blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio'],
            },
            'gjs-plugin-export': {
              btnLabel: 'Export to ZIP',
            }
          },
          canvas: {
            styles: [
              'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css'
            ]
          },
          assetManager: {
            upload: false,
            assets: [
              'https://via.placeholder.com/400x300/667eea/fff/image1.jpg',
              'https://via.placeholder.com/400x300/764ba2/fff/image2.jpg',
              'https://via.placeholder.com/400x300/f093fb/fff/image3.jpg',
              'https://via.placeholder.com/400x300/f5576c/fff/image4.jpg',
              'https://via.placeholder.com/400x300/4facfe/fff/image5.jpg',
              'https://via.placeholder.com/400x300/00f2fe/fff/image6.jpg',
              'https://via.placeholder.com/400x300/43e97b/fff/image7.jpg',
            ]
          }
        });

        console.log('✅ GrapesJS editor initialized');

        // Store editor reference
        grapesEditor.current = editor;

        // Add additional custom blocks alongside the built-in ones
        const blockManager = editor.BlockManager;
        
        // Add custom blocks to complement the built-in blocks-basic plugin
        // The built-in blocks (column1, column2, column3, column3-7, text, link, image, video, map) are already available
        
        // ADDITIONAL CUSTOM BLOCKS
        blockManager.add('heading-1', {
          label: 'Heading 1',
          content: '<h1 class="text-4xl font-bold text-gray-900 mb-4">Main Heading</h1>',
          category: 'Typography',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('heading-2', {
          label: 'Heading 2',
          content: '<h2 class="text-3xl font-semibold text-gray-800 mb-3">Section Heading</h2>',
          category: 'Typography',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('heading-3', {
          label: 'Heading 3',
          content: '<h3 class="text-2xl font-medium text-gray-700 mb-2">Sub Heading</h3>',
          category: 'Typography',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('paragraph', {
          label: 'Paragraph',
          content: '<p class="text-gray-600 leading-relaxed mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
          category: 'Typography',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('button-primary', {
          label: 'Primary Button',
          content: '<div class="text-center py-4"><a href="#" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">Click Me</a></div>',
          category: 'Components',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('button-secondary', {
          label: 'Secondary Button',
          content: '<div class="text-center py-4"><a href="#" class="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">Secondary</a></div>',
          category: 'Components',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('card', {
          label: 'Card',
          content: '<div class="max-w-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden"><img src="https://via.placeholder.com/400x200/667eea/fff?text=Card+Image" alt="Card" class="w-full h-48 object-cover"><div class="p-6"><h3 class="text-xl font-semibold mb-2">Card Title</h3><p class="text-gray-600 mb-4">This is a card component perfect for displaying products, services, or any content that needs to be highlighted.</p><a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Read More →</a></div></div>',
          category: 'Components',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('hero-section', {
          label: 'Hero Section',
          content: '<section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20"><div class="max-w-6xl mx-auto px-4 text-center"><h1 class="text-5xl font-bold mb-6">Welcome to Our Platform</h1><p class="text-xl mb-8 max-w-3xl mx-auto">Create amazing websites with our powerful drag-and-drop builder. No coding required, just drag, drop, and customize.</p><div class="space-x-4"><a href="#" class="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">Get Started</a><a href="#" class="inline-block border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">Learn More</a></div></div></section>',
          category: 'Layout',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('section', {
          label: 'Section',
          content: '<section class="py-16 px-4 bg-gray-50"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-8">Section Title</h2><p class="text-lg text-gray-600 text-center max-w-3xl mx-auto">Add your content here. This section provides a clean container for your content with proper spacing and responsive design.</p></div></section>',
          category: 'Layout',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('container', {
          label: 'Container',
          content: '<div class="max-w-6xl mx-auto px-4 py-8"><div class="bg-white rounded-lg shadow-md p-6"><h3 class="text-xl font-semibold mb-4">Container Content</h3><p class="text-gray-600">This is a container block with a clean white background and shadow. Perfect for grouping related content.</p></div></div>',
          category: 'Layout',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('testimonial', {
          label: 'Testimonial',
          content: '<div class="max-w-4xl mx-auto text-center py-12"><div class="bg-white rounded-lg shadow-lg p-8"><div class="mb-6"><div class="flex justify-center mb-4"><img src="https://via.placeholder.com/80x80/667eea/fff?text=JD" alt="Customer" class="w-20 h-20 rounded-full"></div><h3 class="text-xl font-semibold text-gray-900">John Doe</h3><p class="text-gray-600">CEO, Company Name</p></div><blockquote class="text-lg text-gray-700 italic">"This platform has completely transformed how we build websites. The drag-and-drop interface is intuitive and the results are professional. Highly recommended!"</blockquote><div class="flex justify-center mt-4"><div class="flex text-yellow-400">★★★★★</div></div></div></div>',
          category: 'Components',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('navigation', {
          label: 'Navigation',
          content: '<nav class="bg-white shadow-lg"><div class="max-w-6xl mx-auto px-4"><div class="flex justify-between items-center py-4"><div class="text-2xl font-bold text-gray-800">Logo</div><div class="hidden md:flex space-x-8"><a href="#" class="text-gray-600 hover:text-gray-900 font-medium">Home</a><a href="#" class="text-gray-600 hover:text-gray-900 font-medium">About</a><a href="#" class="text-gray-600 hover:text-gray-900 font-medium">Services</a><a href="#" class="text-gray-600 hover:text-gray-900 font-medium">Contact</a></div><div class="md:hidden"><button class="text-gray-600 hover:text-gray-900">☰</button></div></div></div></nav>',
          category: 'Components',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('footer', {
          label: 'Footer',
          content: '<footer class="bg-gray-800 text-white py-12"><div class="max-w-6xl mx-auto px-4"><div class="grid grid-cols-1 md:grid-cols-4 gap-8"><div><h3 class="text-xl font-semibold mb-4">Company</h3><ul class="space-y-2"><li><a href="#" class="text-gray-300 hover:text-white">About Us</a></li><li><a href="#" class="text-gray-300 hover:text-white">Contact</a></li><li><a href="#" class="text-gray-300 hover:text-white">Careers</a></li></ul></div><div><h3 class="text-xl font-semibold mb-4">Services</h3><ul class="space-y-2"><li><a href="#" class="text-gray-300 hover:text-white">Web Design</a></li><li><a href="#" class="text-gray-300 hover:text-white">Development</a></li><li><a href="#" class="text-gray-300 hover:text-white">Consulting</a></li></ul></div><div><h3 class="text-xl font-semibold mb-4">Support</h3><ul class="space-y-2"><li><a href="#" class="text-gray-300 hover:text-white">Help Center</a></li><li><a href="#" class="text-gray-300 hover:text-white">Documentation</a></li><li><a href="#" class="text-gray-300 hover:text-white">Community</a></li></ul></div><div><h3 class="text-xl font-semibold mb-4">Follow Us</h3><div class="flex space-x-4"><a href="#" class="text-gray-300 hover:text-white">Facebook</a><a href="#" class="text-gray-300 hover:text-white">Twitter</a><a href="#" class="text-gray-300 hover:text-white">LinkedIn</a></div></div></div><div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">© 2024 Your Company. All rights reserved.</div></div></footer>',
          category: 'Components',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('contact-form', {
          label: 'Contact Form',
          content: '<div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8"><h2 class="text-3xl font-bold text-center mb-8">Contact Us</h2><form class="space-y-6"><div><label class="block text-sm font-medium text-gray-700 mb-2">Name</label><input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your Name"></div><div><label class="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your@email.com"></div><div><label class="block text-sm font-medium text-gray-700 mb-2">Subject</label><input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Subject"></div><div><label class="block text-sm font-medium text-gray-700 mb-2">Message</label><textarea rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your message..."></textarea></div><button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">Send Message</button></form></div>',
          category: 'Forms',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('spacer', {
          label: 'Spacer',
          content: '<div class="py-8"></div>',
          category: 'Layout',
          attributes: { class: 'gjs-block' }
        });

        blockManager.add('divider', {
          label: 'Divider',
          content: '<div class="py-8"><div class="border-t border-gray-300"></div></div>',
          category: 'Layout',
          attributes: { class: 'gjs-block' }
        });

        // Load initial content
        if (websiteData) {
          if (websiteData.html_content) {
            editor.setComponents(websiteData.html_content);
          }
          if (websiteData.css_content) {
            editor.setStyle(websiteData.css_content);
          }
        } else {
          // Load default content
          editor.setComponents(`
            <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
              <div class="max-w-6xl mx-auto px-4 text-center">
                <h1 class="text-5xl font-bold mb-6">Welcome to WeBeenthere</h1>
                <p class="text-xl mb-8 max-w-3xl mx-auto">Create amazing websites with our powerful drag-and-drop builder. No coding required, just drag, drop, and customize.</p>
                <div class="space-x-4">
                  <a href="#" class="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">Get Started</a>
                  <a href="#" class="inline-block border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">Learn More</a>
                </div>
              </div>
            </section>
            <section class="py-16 px-4 bg-gray-50">
              <div class="max-w-6xl mx-auto">
                <h2 class="text-3xl font-bold text-center mb-8">Why Choose Us?</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div class="text-center space-y-4">
                    <div class="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                      <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold">Fast & Easy</h3>
                    <p class="text-gray-600">Build professional websites in minutes with our intuitive drag-and-drop interface.</p>
                  </div>
                  <div class="text-center space-y-4">
                    <div class="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                      <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold">Professional</h3>
                    <p class="text-gray-600">Create stunning, responsive websites that look great on all devices.</p>
                  </div>
                  <div class="text-center space-y-4">
                    <div class="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center">
                      <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold">Support</h3>
                    <p class="text-gray-600">Get help when you need it with our dedicated support team.</p>
                  </div>
                </div>
              </div>
            </section>
          `);
        }

        setIsInitialized(true);
        setIsLoading(false);
        console.log('✅ Enhanced GrapesJS setup complete!');

      } catch (initError) {
        console.error('❌ GrapesJS initialization failed:', initError);
        setError('Failed to initialize the editor');
        setIsLoading(false);
      }
    };

    initGrapesJS();
  }, [websiteData, isInitialized]);

  // Drag and drop functionality
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData('text/plain', elementType);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('text/plain');
    setIsDragging(false);
    
    // Add element to canvas
    const newElement = {
      id: Date.now(),
      type: elementType,
      content: getElementContent(elementType),
      x: e.clientX - e.currentTarget.getBoundingClientRect().left,
      y: e.clientY - e.currentTarget.getBoundingClientRect().top,
    };
    
    setCanvasElements(prev => [...prev, newElement]);
    console.log('✅ Element added to canvas:', newElement);
  };

  const getElementContent = (type: string) => {
    switch (type) {
      case 'section':
        return '<div class="p-8 bg-gray-50 border border-gray-200 rounded-lg"><h2 class="text-2xl font-bold mb-4">Section Title</h2><p class="text-gray-600">Section content goes here...</p></div>';
      case 'columns':
        return '<div class="grid grid-cols-2 gap-4 p-4"><div class="bg-white p-4 rounded border"><h3 class="font-semibold mb-2">Column 1</h3><p class="text-sm text-gray-600">Content for column 1</p></div><div class="bg-white p-4 rounded border"><h3 class="font-semibold mb-2">Column 2</h3><p class="text-sm text-gray-600">Content for column 2</p></div></div>';
      case 'text':
        return '<div class="p-4"><h2 class="text-xl font-semibold mb-2">Text Block</h2><p class="text-gray-600">This is a text block. Click to edit the content.</p></div>';
      case 'button':
        return '<div class="p-4"><button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">Click Me</button></div>';
      case 'image':
        return '<div class="p-4"><img src="https://via.placeholder.com/400x200/cccccc/969696?text=Your+Image" alt="Your Image" class="w-full h-48 object-cover rounded-lg border"></div>';
      case 'hero':
        return '<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-16 px-8 rounded-lg"><h1 class="text-4xl font-bold mb-4">Hero Title</h1><p class="text-xl mb-8">Hero subtitle goes here</p><button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Get Started</button></div>';
      default:
        return '<div class="p-4 bg-gray-100 rounded border">Unknown element</div>';
    }
  };

  const handleElementClick = (element: any) => {
    setSelectedElement(element);
    console.log('🎯 Element selected:', element);
  };

  const handleElementDelete = (elementId: number) => {
    setCanvasElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
    console.log('🗑️ Element deleted:', elementId);
  };

  // Save website
  const saveWebsite = async () => {
    if (!grapesEditor.current || !id) return;

    try {
      setIsSaving(true);
      const html = grapesEditor.current.getHtml();
      const css = grapesEditor.current.getCss();
      
      await apiPut(`${API_ENDPOINTS.WEBSITES}/${id}`, {
        html_content: html,
        css_content: css,
        is_published: false
      });

      console.log('✅ Website saved successfully');
    } catch (error) {
      console.error('❌ Error saving website:', error);
      setError('Failed to save website');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish website
  const publishWebsite = async () => {
    if (!grapesEditor.current || !id) return;

    try {
      setIsSaving(true);
      const html = grapesEditor.current.getHtml();
      const css = grapesEditor.current.getCss();
      
      await apiPut(`${API_ENDPOINTS.WEBSITES}/${id}`, {
        html_content: html,
        css_content: css,
        is_published: true
      });

      console.log('✅ Website published successfully');
    } catch (error) {
      console.error('❌ Error publishing website:', error);
      setError('Failed to publish website');
    } finally {
      setIsSaving(false);
    }
  };

  // Export website as HTML/CSS
  const handleExport = () => {
    if (!grapesEditor.current) return;
    
    try {
      const html = grapesEditor.current.getHtml();
      const css = grapesEditor.current.getCss();
      
      // Create complete HTML document
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${websiteData?.title || 'My Website'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${css}
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
      
      // Create blob and download
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${websiteData?.title || 'website'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Website exported successfully');
    } catch (error) {
      console.error('❌ Error exporting website:', error);
      alert('Failed to export website. Please try again.');
    }
  };

  // Preview website
  const handlePreview = () => {
    if (!grapesEditor.current) return;
    
    try {
      const html = grapesEditor.current.getHtml();
      const css = grapesEditor.current.getCss();
      
      // Create complete HTML document
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${websiteData?.title || 'My Website'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${css}
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
      
      // Open in new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(fullHtml);
        newWindow.document.close();
      }
      
      console.log('✅ Website preview opened');
    } catch (error) {
      console.error('❌ Error previewing website:', error);
      alert('Failed to preview website. Please try again.');
    }
  };

  // AI Generate content
  const handleAIGenerate = () => {
    alert('AI Generation feature coming soon! This will help you generate content automatically.');
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Style property handlers
  const handleStyleChange = (property: string, value: string) => {
    if (!grapesEditor.current) return;
    
    const selected = grapesEditor.current.getSelected();
    if (selected) {
      selected.addStyle({ [property]: value });
      console.log(`✅ Style updated: ${property} = ${value}`);
    }
  };

  // Get current style value
  const getCurrentStyle = (property: string) => {
    if (!grapesEditor.current) return '';
    
    const selected = grapesEditor.current.getSelected();
    if (selected) {
      return selected.getStyle()[property] || '';
    }
    return '';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Builder</h2>
          <p className="text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Reload Page
            </button>
        </div>
      </div>
    );
  }

  // No loading state - builder loads immediately

      return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold text-white">Website Builder</h1>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                Desktop
              </button>
              <button className="px-3 py-1 text-sm text-gray-400 hover:text-white rounded transition-colors">
                Tablet
              </button>
              <button className="px-3 py-1 text-sm text-gray-400 hover:text-white rounded transition-colors">
                Mobile
              </button>
              </div>
            </div>

          <div className="flex items-center space-x-3">
            {/* Preview Button */}
            <button
              onClick={handlePreview}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              title="Preview Website"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview</span>
            </button>

            {/* AI Generate Button */}
            <button
              onClick={handleAIGenerate}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="AI Generate Content"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI Generate</span>
            </button>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              title="Export Website"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export</span>
            </button>

            {/* Save Button */}
            <button
              onClick={saveWebsite}
              disabled={isSaving}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              title="Save Website"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            {/* Publish Button */}
            <button
              onClick={publishWebsite}
              disabled={isSaving}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              title="Publish Website"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>{isSaving ? 'Publishing...' : 'Publish'}</span>
            </button>

            {/* Website Details Button */}
            <button
              onClick={() => setShowWebsiteDetails(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              title="Website Details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Details</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-gray-700/50">
            {[
              { id: 'blocks', label: 'Elements', icon: '🧩' },
              { id: 'layers', label: 'Layers', icon: '📚' },
              { id: 'styles', label: 'Styles', icon: '🎨' },
              { id: 'assets', label: 'Assets', icon: '🖼️' },
              { id: 'ai', label: 'AI Assistant', icon: '🤖' }
            ].map((panel) => (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activePanel === panel.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span className="mr-2">{panel.icon}</span>
                {panel.label}
              </button>
            ))}
          </div>

            {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
              {activePanel === 'blocks' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-sm">Layout Blocks</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-grab transition-colors border border-gray-600"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'section')}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="text-xs text-gray-300 mb-1">Section</div>
                    <div className="w-full h-8 bg-gray-600 rounded"></div>
                  </div>
                  <div 
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-grab transition-colors border border-gray-600"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'columns')}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="text-xs text-gray-300 mb-1">Columns</div>
                    <div className="flex gap-1">
                      <div className="w-1/2 h-8 bg-gray-600 rounded"></div>
                      <div className="w-1/2 h-8 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-white font-semibold text-sm mt-6">Content Blocks</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-grab transition-colors border border-gray-600"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'text')}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="text-xs text-gray-300 mb-1">Text</div>
                    <div className="w-full h-6 bg-gray-600 rounded"></div>
                  </div>
                  <div 
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-grab transition-colors border border-gray-600"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'button')}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="text-xs text-gray-300 mb-1">Button</div>
                    <div className="w-16 h-6 bg-blue-600 rounded"></div>
                  </div>
                  <div 
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-grab transition-colors border border-gray-600"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'image')}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="text-xs text-gray-300 mb-1">Image</div>
                    <div className="w-full h-8 bg-gray-600 rounded"></div>
                  </div>
                  <div 
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-grab transition-colors border border-gray-600"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'hero')}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="text-xs text-gray-300 mb-1">Hero</div>
                    <div className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-600">
                  <div className="text-xs text-gray-400 text-center">
                    Drag blocks to canvas to start building
                  </div>
                </div>
                </div>
              )}
              
              {activePanel === 'layers' && (
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm mb-4">Page Layers</h3>
                <div className="space-y-2">
                  <div className="bg-gray-700 p-3 rounded border border-gray-600">
                    <div className="text-sm text-white">Section</div>
                    <div className="text-xs text-gray-400">Hero Section</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded border border-gray-600">
                    <div className="text-sm text-white">Container</div>
                    <div className="text-xs text-gray-400">Main Container</div>
                  </div>
                </div>
                </div>
              )}
              
              {activePanel === 'styles' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-sm">Typography</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-300 text-xs block mb-1">Font Size</label>
                    <input 
                      type="text" 
                      placeholder="16px" 
                      className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1">Color</label>
                    <input 
                      type="color" 
                      defaultValue="#000000"
                      className="w-full h-8 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                </div>
                
                <h3 className="text-white font-semibold text-sm mt-6">Background</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-300 text-xs block mb-1">Background Color</label>
                    <input 
                      type="color" 
                      defaultValue="#ffffff"
                      className="w-full h-8 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                </div>
                </div>
              )}
              
              {activePanel === 'assets' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-sm">Media Library</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-700 p-3 rounded border border-gray-600">
                    <div className="w-full h-20 bg-gray-600 rounded mb-2"></div>
                    <div className="text-xs text-gray-300">Image 1</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded border border-gray-600">
                    <div className="w-full h-20 bg-gray-600 rounded mb-2"></div>
                    <div className="text-xs text-gray-300">Image 2</div>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors">
                  Upload New Asset
                </button>
                </div>
              )}
              
              {activePanel === 'ai' && (
                  <div className="text-center text-gray-400">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Assistant</h3>
                <p className="text-sm mb-4">Coming Soon</p>
                <p className="text-xs">AI-powered content generation and design suggestions</p>
                </div>
              )}
            </div>
          </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-gray-100 relative">
          <div 
            ref={editorRef} 
            className="w-full h-full"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Canvas content */}
            <div className="w-full h-full bg-white border-2 border-dashed border-gray-300 relative overflow-auto">
              {canvasElements.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8 max-w-4xl">
                    <div className="text-gray-500 text-6xl mb-4">🎨</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Website Builder</h1>
                    <p className="text-xl text-gray-600 mb-8">Drag elements from the left panel to start building</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                        <div className="text-3xl mb-3">🎨</div>
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Design</h3>
                        <p className="text-sm text-blue-600">Drag elements from the Elements panel to create your layout</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                        <div className="text-3xl mb-3">⚙️</div>
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">Customize</h3>
                        <p className="text-sm text-purple-600">Use the Properties panel to modify styles and settings</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                        <div className="text-3xl mb-3">💾</div>
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Save</h3>
                        <p className="text-sm text-green-600">Click Save to store your changes and Publish when ready</p>
                      </div>
          </div>
          
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Getting Started</h3>
                      <div className="text-left space-y-2 text-sm text-gray-600">
                        <p>1. Click on "Elements" in the left sidebar to see available blocks</p>
                        <p>2. Drag and drop elements onto this canvas area</p>
                        <p>3. Select elements to customize them in the Properties panel</p>
                        <p>4. Use the Save button to store your progress</p>
                      </div>
            </div>
            
                    <div className="mt-6 text-xs text-gray-500">
                      <p>Builder Status: Ready | Website ID: {id || 'N/A'}</p>
            </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {canvasElements.map((element) => (
                    <div
                      key={element.id}
                      className={`relative group cursor-pointer transition-all ${
                        selectedElement?.id === element.id 
                          ? 'ring-2 ring-blue-500 ring-offset-2' 
                          : 'hover:ring-1 hover:ring-gray-300'
                      }`}
                      onClick={() => handleElementClick(element)}
                    >
                      <div dangerouslySetInnerHTML={{ __html: element.content }} />
                      
                      {/* Element controls */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleElementDelete(element.id);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs"
                        >
                          ×
              </button>
            </div>
                      
                      {/* Element label */}
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {element.type}
          </div>
        </div>
                  ))}
                </div>
              )}
              
              {/* Drop zone indicator */}
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 flex items-center justify-center">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    Drop element here
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Properties Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Properties</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => setActivePropertiesTab('styles')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    activePropertiesTab === 'styles' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Styles
                </button>
                <button
                  onClick={() => setActivePropertiesTab('properties')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    activePropertiesTab === 'properties' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Properties
                </button>
              </div>
            </div>
            
            {/* Control Icons */}
            <div className="flex space-x-2 mb-4">
              <button className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-gray-300 hover:bg-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-gray-300 hover:bg-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Properties Content */}
          <div className="flex-1 overflow-y-auto">
            {activePropertiesTab === 'styles' ? (
              <div className="p-4 space-y-2">
                {/* Layout Section */}
                <div className="bg-gray-700 rounded">
                  <button
                    onClick={() => toggleSection('layout')}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-200 hover:bg-gray-600 rounded-t"
                  >
                    <span className="text-sm font-medium">Layout</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.layout ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandedSections.layout && (
                    <div className="p-3 border-t border-gray-600 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Display</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          value={getCurrentStyle('display')}
                          onChange={(e) => handleStyleChange('display', e.target.value)}
                        >
                          <option value="">Block</option>
                          <option value="flex">Flex</option>
                          <option value="grid">Grid</option>
                          <option value="inline-block">Inline Block</option>
                          <option value="inline">Inline</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Size Section */}
                <div className="bg-gray-700 rounded">
                  <button
                    onClick={() => toggleSection('size')}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-200 hover:bg-gray-600 rounded-t"
                  >
                    <span className="text-sm font-medium">Size</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.size ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandedSections.size && (
                    <div className="p-3 border-t border-gray-600 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Width</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="auto"
                            value={getCurrentStyle('width')}
                            onChange={(e) => handleStyleChange('width', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Height</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="auto"
                            value={getCurrentStyle('height')}
                            onChange={(e) => handleStyleChange('height', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Min Width</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="0"
                            value={getCurrentStyle('min-width')}
                            onChange={(e) => handleStyleChange('min-width', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Min Height</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="0"
                            value={getCurrentStyle('min-height')}
                            onChange={(e) => handleStyleChange('min-height', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Max Width</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="none"
                            value={getCurrentStyle('max-width')}
                            onChange={(e) => handleStyleChange('max-width', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Max Height</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="none"
                            value={getCurrentStyle('max-height')}
                            onChange={(e) => handleStyleChange('max-height', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Space Section */}
                <div className="bg-gray-700 rounded">
                  <button
                    onClick={() => toggleSection('space')}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-200 hover:bg-gray-600 rounded-t"
                  >
                    <span className="text-sm font-medium">Space</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.space ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandedSections.space && (
                    <div className="p-3 border-t border-gray-600 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Padding</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="0"
                            value={getCurrentStyle('padding')}
                            onChange={(e) => handleStyleChange('padding', e.target.value)}
                          />
                          <button className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white text-xs">
                            ▢
                          </button>
                          <button className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-gray-300 text-xs">
                            ⊞
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Margin</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="0"
                            value={getCurrentStyle('margin')}
                            onChange={(e) => handleStyleChange('margin', e.target.value)}
                          />
                          <button className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white text-xs">
                            ▢
                          </button>
                          <button className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-gray-300 text-xs">
                            ⊞
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Position Section */}
                <div className="bg-gray-700 rounded">
                  <button
                    onClick={() => toggleSection('position')}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-200 hover:bg-gray-600 rounded-t"
                  >
                    <span className="text-sm font-medium">Position</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.position ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandedSections.position && (
                    <div className="p-3 border-t border-gray-600 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Position</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          value={getCurrentStyle('position')}
                          onChange={(e) => handleStyleChange('position', e.target.value)}
                        >
                          <option value="">Static</option>
                          <option value="relative">Relative</option>
                          <option value="absolute">Absolute</option>
                          <option value="fixed">Fixed</option>
                          <option value="sticky">Sticky</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Top</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="auto"
                            value={getCurrentStyle('top')}
                            onChange={(e) => handleStyleChange('top', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Right</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="auto"
                            value={getCurrentStyle('right')}
                            onChange={(e) => handleStyleChange('right', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Bottom</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="auto"
                            value={getCurrentStyle('bottom')}
                            onChange={(e) => handleStyleChange('bottom', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Left</label>
                          <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="auto"
                            value={getCurrentStyle('left')}
                            onChange={(e) => handleStyleChange('left', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Z-Index</label>
                        <input
                          type="number"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="auto"
                          value={getCurrentStyle('z-index')}
                          onChange={(e) => handleStyleChange('z-index', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Typography Section */}
                <div className="bg-gray-700 rounded">
                  <button
                    onClick={() => toggleSection('typography')}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-200 hover:bg-gray-600 rounded-t"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Typography</span>
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.typography ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandedSections.typography && (
                    <div className="p-3 border-t border-gray-600 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Font Family</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          value={getCurrentStyle('font-family')}
                          onChange={(e) => handleStyleChange('font-family', e.target.value)}
                        >
                          <option value="">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Courier New">Courier New</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Font Size</label>
                        <input
                          type="text"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="16px"
                          value={getCurrentStyle('font-size')}
                          onChange={(e) => handleStyleChange('font-size', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Font Weight</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          value={getCurrentStyle('font-weight')}
                          onChange={(e) => handleStyleChange('font-weight', e.target.value)}
                        >
                          <option value="">Normal</option>
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
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Line Height</label>
                        <input
                          type="text"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="1.5"
                          value={getCurrentStyle('line-height')}
                          onChange={(e) => handleStyleChange('line-height', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Text Align</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          value={getCurrentStyle('text-align')}
                          onChange={(e) => handleStyleChange('text-align', e.target.value)}
                        >
                          <option value="">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                          <option value="justify">Justify</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Color</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            className="w-8 h-8 bg-gray-800 border border-gray-600 rounded"
                            value={getCurrentStyle('color') || '#ffffff'}
                            onChange={(e) => handleStyleChange('color', e.target.value)}
                          />
                          <input
                            type="text"
                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="#ffffff"
                            value={getCurrentStyle('color')}
                            onChange={(e) => handleStyleChange('color', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Background Section */}
                <div className="bg-gray-700 rounded">
                  <button
                    onClick={() => toggleSection('background')}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-200 hover:bg-gray-600 rounded-t"
                  >
                    <span className="text-sm font-medium">Background</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.background ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandedSections.background && (
                    <div className="p-3 border-t border-gray-600 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Background Color</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            className="w-8 h-8 bg-gray-800 border border-gray-600 rounded"
                            value={getCurrentStyle('background-color') || '#ffffff'}
                            onChange={(e) => handleStyleChange('background-color', e.target.value)}
                          />
                          <input
                            type="text"
                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="#ffffff"
                            value={getCurrentStyle('background-color')}
                            onChange={(e) => handleStyleChange('background-color', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Background Image</label>
                        <input
                          type="url"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="https://example.com/image.jpg"
                          value={getCurrentStyle('background-image')}
                          onChange={(e) => handleStyleChange('background-image', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Background Size</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          value={getCurrentStyle('background-size')}
                          onChange={(e) => handleStyleChange('background-size', e.target.value)}
                        >
                          <option value="">Auto</option>
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="100% 100%">100% 100%</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Background Position</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          value={getCurrentStyle('background-position')}
                          onChange={(e) => handleStyleChange('background-position', e.target.value)}
                        >
                          <option value="">Center</option>
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
                    </div>
                  )}
                </div>

                {/* Borders Section */}
                <div className="bg-gray-700 rounded">
                  <button
                    onClick={() => toggleSection('borders')}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-200 hover:bg-gray-600 rounded-t"
                  >
                    <span className="text-sm font-medium">Borders</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.borders ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandedSections.borders && (
                    <div className="p-3 border-t border-gray-600 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Border Width</label>
                        <input
                          type="text"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="0"
                          value={getCurrentStyle('border-width')}
                          onChange={(e) => handleStyleChange('border-width', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Border Style</label>
                        <select
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          value={getCurrentStyle('border-style')}
                          onChange={(e) => handleStyleChange('border-style', e.target.value)}
                        >
                          <option value="">None</option>
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                          <option value="double">Double</option>
                          <option value="groove">Groove</option>
                          <option value="ridge">Ridge</option>
                          <option value="inset">Inset</option>
                          <option value="outset">Outset</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Border Color</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            className="w-8 h-8 bg-gray-800 border border-gray-600 rounded"
                            value={getCurrentStyle('border-color') || '#000000'}
                            onChange={(e) => handleStyleChange('border-color', e.target.value)}
                          />
                          <input
                            type="text"
                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            placeholder="#000000"
                            value={getCurrentStyle('border-color')}
                            onChange={(e) => handleStyleChange('border-color', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Border Radius</label>
                        <input
                          type="text"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="0"
                          value={getCurrentStyle('border-radius')}
                          onChange={(e) => handleStyleChange('border-radius', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Effects Section */}
                <div className="bg-gray-700 rounded">
                  <button
                    onClick={() => toggleSection('effects')}
                    className="w-full flex items-center justify-between p-3 text-left text-gray-200 hover:bg-gray-600 rounded-t"
                  >
                    <span className="text-sm font-medium">Effects</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.effects ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandedSections.effects && (
                    <div className="p-3 border-t border-gray-600 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Box Shadow</label>
                        <input
                          type="text"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="0 2px 4px rgba(0,0,0,0.1)"
                          value={getCurrentStyle('box-shadow')}
                          onChange={(e) => handleStyleChange('box-shadow', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Opacity</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          className="w-full"
                          value={getCurrentStyle('opacity') || '1'}
                          onChange={(e) => handleStyleChange('opacity', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Transform</label>
                        <input
                          type="text"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="none"
                          value={getCurrentStyle('transform')}
                          onChange={(e) => handleStyleChange('transform', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Transition</label>
                        <input
                          type="text"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="all 0.3s ease"
                          value={getCurrentStyle('transition')}
                          onChange={(e) => handleStyleChange('transition', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Animation</label>
                        <input
                          type="text"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          placeholder="fadeIn 1s ease-in-out"
                          value={getCurrentStyle('animation')}
                          onChange={(e) => handleStyleChange('animation', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">Properties panel coming soon</div>
                </div>
              </div>
            )}
          </div>
        </div>
          </div>

      {/* Website Details Modal */}
      {showWebsiteDetails && websiteData && (
        <WebsiteDetailsModal
          websiteData={{
            title: websiteData.title || 'Untitled Website',
            slug: websiteData.slug || 'untitled-website',
            description: websiteData.description || ''
          }}
          onUpdate={(data) => {
            setWebsiteData({ ...websiteData, ...data });
          }}
          onClose={() => setShowWebsiteDetails(false)}
          onSave={loadWebsiteData}
        />
      )}
    </div>
  );
};

export default GrapesJSBuilderClient;