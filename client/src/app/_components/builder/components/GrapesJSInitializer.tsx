'use client';

import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import '../styles/grapesjs-custom.css';

// Core plugins (only available ones)
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

interface GrapesJSInitializerProps {
  onEditorReady: (editor: any) => void;
  onError: (error: string) => void;
  websiteId?: string;
  initialTemplate?: string;
}

const GrapesJSInitializer: React.FC<GrapesJSInitializerProps> = ({ 
  onEditorReady, 
  onError, 
  websiteId, 
  initialTemplate 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const grapesEditor = useRef<any>(null);
  const initializationAttempted = useRef<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🔍 GrapesJSInitializer useEffect triggered');
    
    const initializeWhenReady = () => {
      if (grapesEditor.current) {
        console.log('⚠️ GrapesJS already initialized, skipping...');
        return;
      }

      if (editorRef.current && !initializationAttempted.current) {
        console.log('✅ Ready to initialize GrapesJS');
        initializationAttempted.current = true;
        initializeGrapesJS();
      } else {
        console.log('⚠️ Not ready yet:', { 
          hasRef: !!editorRef.current, 
          attempted: initializationAttempted.current 
        });
        setTimeout(initializeWhenReady, 200);
      }
    };

    const timer = setTimeout(initializeWhenReady, 100);

    return () => {
      clearTimeout(timer);
      if (grapesEditor.current) {
        try {
          grapesEditor.current.destroy();
        } catch (error) {
          console.warn('Error during cleanup:', error);
        }
        grapesEditor.current = null;
        setIsInitialized(false);
        initializationAttempted.current = false;
      }
    };
    
    function initializeGrapesJS() {
      try {
        console.log('🚀 Starting GrapesJS initialization...');
        
        if (!editorRef.current || !editorRef.current.ownerDocument) {
          throw new Error('Container element not properly mounted');
        }

        if (!document.readyState || document.readyState !== 'complete') {
          console.log('⚠️ Document not ready, waiting...');
          setTimeout(() => initializeGrapesJS(), 100);
          return;
        }

        console.log('✅ Proceeding with GrapesJS initialization');
        
        const editor = grapesjs.init({
          container: editorRef.current,
          height: '100vh',
          width: '100%',
          storageManager: false,
          plugins: [
            'gjs-preset-webpage',
            'gjs-blocks-basic',
            'gjs-plugin-forms',
            'gjs-component-countdown',
            'gjs-plugin-export',
            'gjs-tabs',
            'gjs-custom-code',
            'gjs-tooltip',
            'gjs-touch',
            'gjs-parser-postcss'
          ],
          pluginsOpts: {
            'gjs-preset-webpage': {
              modalImportTitle: 'Import Template',
              modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
              modalImportContent: function(editor: any) {
                return editor.getHtml() + '<style>' + editor.getCss() + '</style>';
              },
            },
            'gjs-plugin-forms': {
              blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio']
            },
            'gjs-component-countdown': {
              blocks: ['countdown']
            },
            'gjs-plugin-export': {
              btnLabel: 'Export to ZIP',
              filename: 'webeenthere-website'
            },
            'gjs-tabs': {
              blocks: ['tabs']
            },
            'gjs-custom-code': {
              blocks: ['custom-code']
            }
          },
          canvas: {
            styles: [
              'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
            ],
            scripts: [
              'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'
            ]
          },
          panels: {
            defaults: [
              {
                id: 'panel-devices',
                el: '.panel__devices',
                buttons: [
                  {
                    id: 'device-desktop',
                    label: 'Desktop',
                    command: 'set-device-desktop',
                    active: true,
                    togglable: false,
                  },
                  {
                    id: 'device-tablet',
                    label: 'Tablet',
                    command: 'set-device-tablet',
                    togglable: false,
                  },
                  {
                    id: 'device-mobile',
                    label: 'Mobile',
                    command: 'set-device-mobile',
                    togglable: false,
                  }
                ],
              }
            ]
          },
          blockManager: {
            appendTo: '.blocks-container'
          },
          layerManager: {
            appendTo: '.layers-container'
          },
          selectorManager: {
            appendTo: '.styles-container'
          },
          styleManager: {
            sectors: [
              {
                name: 'Layout',
                open: false,
                buildProps: ['display', 'position', 'top', 'right', 'left', 'bottom', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'align-self', 'order', 'flex-basis', 'flex-grow', 'flex-shrink', 'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height']
              },
              {
                name: 'Size',
                open: false,
                buildProps: ['width', 'height', 'max-width', 'max-height', 'min-width', 'min-height']
              },
              {
                name: 'Space',
                open: false,
                buildProps: ['margin', 'padding']
              },
              {
                name: 'Position',
                open: false,
                buildProps: ['position', 'top', 'right', 'left', 'bottom', 'z-index']
              },
              {
                name: 'Typography',
                open: false,
                buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow']
              },
              {
                name: 'Background',
                open: false,
                buildProps: ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-attachment', 'background-size']
              },
              {
                name: 'Borders',
                open: false,
                buildProps: ['border-radius', 'border', 'border-width', 'border-style', 'border-color']
              },
              {
                name: 'Effects',
                open: false,
                buildProps: ['box-shadow', 'opacity', 'transition']
              }
            ]
          },
          traitManager: {
            appendTo: '.traits-container'
          },
          assetManager: {
            upload: false,
            assets: [
              'https://via.placeholder.com/350x250/78c5d6/fff/image1.jpg',
              'https://via.placeholder.com/350x250/459ba8/fff/image2.jpg',
              'https://via.placeholder.com/350x250/79c267/fff/image3.jpg',
              'https://via.placeholder.com/350x250/c5d647/fff/image4.jpg',
              'https://via.placeholder.com/350x250/f28c33/fff/image5.jpg',
              'https://via.placeholder.com/350x250/e868a2/fff/image6.jpg',
              'https://via.placeholder.com/350x250/cc4360/fff/image7.jpg',
            ]
          }
        });
        
        console.log('✅ GrapesJS editor initialized');
        
        // Add comprehensive blocks
        const blockManager = editor.BlockManager;
        
        // Layout Blocks
        blockManager.add('1-section', {
          label: '1 Section',
          content: '<section class="section py-5"><div class="container"><div class="row"><div class="col-12"><h2>Section Title</h2><p>Section content goes here...</p></div></div></div></section>',
          category: 'Layout',
          attributes: { class: 'gjs-block-section' }
        });
        
        blockManager.add('1-2-section', {
          label: '1/2 Section',
          content: '<section class="section py-5"><div class="container"><div class="row"><div class="col-md-6"><h3>Left Column</h3><p>Left column content...</p></div><div class="col-md-6"><h3>Right Column</h3><p>Right column content...</p></div></div></div></section>',
          category: 'Layout',
          attributes: { class: 'gjs-block-section' }
        });
        
        blockManager.add('1-3-section', {
          label: '1/3 Section',
          content: '<section class="section py-5"><div class="container"><div class="row"><div class="col-md-4"><h4>Column 1</h4><p>Content 1...</p></div><div class="col-md-4"><h4>Column 2</h4><p>Content 2...</p></div><div class="col-md-4"><h4>Column 3</h4><p>Content 3...</p></div></div></div></section>',
          category: 'Layout',
          attributes: { class: 'gjs-block-section' }
        });
        
        blockManager.add('3-7-section', {
          label: '3/7 Section',
          content: '<section class="section py-5"><div class="container"><div class="row"><div class="col-md-3"><h4>Sidebar</h4><p>Sidebar content...</p></div><div class="col-md-9"><h3>Main Content</h3><p>Main content area...</p></div></div></div></section>',
          category: 'Layout',
          attributes: { class: 'gjs-block-section' }
        });
        
        // Basic Elements
        blockManager.add('text', {
          label: 'Text',
          content: '<p>Insert your text here</p>',
          category: 'Basic',
          attributes: { class: 'gjs-block-text' }
        });
        
        blockManager.add('text-section', {
          label: 'Text Section',
          content: '<div class="text-section"><h2>Heading</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></div>',
          category: 'Basic',
          attributes: { class: 'gjs-block-text' }
        });
        
        blockManager.add('button', {
          label: 'Button',
          content: '<button class="btn btn-primary">Click me</button>',
          category: 'Basic',
          attributes: { class: 'gjs-block-button' }
        });
        
        blockManager.add('divider', {
          label: 'Divider',
          content: '<hr class="my-4">',
          category: 'Basic',
          attributes: { class: 'gjs-block-divider' }
        });
        
        // Hero Section
        blockManager.add('hero-section', {
          label: 'Hero Section',
          content: '<section class="hero-section py-5 text-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"><div class="container"><div class="row"><div class="col-12"><h1 class="display-4">Hero Title</h1><p class="lead">Hero subtitle goes here</p><button class="btn btn-light btn-lg">Call to Action</button></div></div></div></section>',
          category: 'Sections',
          attributes: { class: 'gjs-block-hero' }
        });
        
        // Media Elements
        blockManager.add('image', {
          label: 'Image',
          content: '<img src="https://via.placeholder.com/350x250" alt="Image" class="img-fluid"/>',
          category: 'Media',
          attributes: { class: 'gjs-block-image' }
        });
        
        blockManager.add('video', {
          label: 'Video',
          content: '<div class="video-container"><video controls class="w-100"><source src="video.mp4" type="video/mp4">Your browser does not support the video tag.</video></div>',
          category: 'Media',
          attributes: { class: 'gjs-block-video' }
        });
        
        blockManager.add('map', {
          label: 'Map',
          content: '<div class="map-container"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ3LjMiTiA3NMKwMDAnMTMuMyJX!5e0!3m2!1sen!2sus!4v1478480754845" width="100%" height="300" frameborder="0" style="border:0" allowfullscreen></iframe></div>',
          category: 'Media',
          attributes: { class: 'gjs-block-map' }
        });
        
        // Interactive Elements
        blockManager.add('link', {
          label: 'Link',
          content: '<a href="#" class="link">Link text</a>',
          category: 'Interactive',
          attributes: { class: 'gjs-block-link' }
        });
        
        blockManager.add('quote', {
          label: 'Quote',
          content: '<blockquote class="blockquote text-center py-4"><p class="mb-0">"This is a quote"</p><footer class="blockquote-footer">Someone famous</footer></blockquote>',
          category: 'Content',
          attributes: { class: 'gjs-block-quote' }
        });
        
        blockManager.add('list-items', {
          label: 'List Items',
          content: '<ul class="list-unstyled"><li>List item 1</li><li>List item 2</li><li>List item 3</li></ul>',
          category: 'Content',
          attributes: { class: 'gjs-block-list' }
        });
        
        blockManager.add('grid-items', {
          label: 'Grid Items',
          content: '<div class="row"><div class="col-md-4 mb-3"><div class="card"><div class="card-body"><h5 class="card-title">Card 1</h5><p class="card-text">Card content...</p></div></div></div><div class="col-md-4 mb-3"><div class="card"><div class="card-body"><h5 class="card-title">Card 2</h5><p class="card-text">Card content...</p></div></div></div><div class="col-md-4 mb-3"><div class="card"><div class="card-body"><h5 class="card-title">Card 3</h5><p class="card-text">Card content...</p></div></div></div></div>',
          category: 'Layout',
          attributes: { class: 'gjs-block-grid' }
        });
        
        // Add device commands
        editor.Commands.add('set-device-desktop', {
          run: (editor: any) => editor.setDevice('Desktop'),
        });
        editor.Commands.add('set-device-tablet', {
          run: (editor: any) => editor.setDevice('Tablet'),
        });
        editor.Commands.add('set-device-mobile', {
          run: (editor: any) => editor.setDevice('Mobile portrait'),
        });
        
        console.log('✅ All blocks and commands added');
        
        grapesEditor.current = editor;
        setIsInitialized(true);
        
        // Load default content
        const defaultHtml = `
          <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: bold;">Welcome to Builder Studio</h1>
            <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">Start building your website by dragging elements from the left panel</p>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
              <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px);">
                <h3 style="margin: 0 0 10px 0;">🎨 Design</h3>
                <p style="margin: 0; font-size: 0.9rem;">Drag elements from the Elements panel</p>
              </div>
              <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px);">
                <h3 style="margin: 0 0 10px 0;">⚙️ Customize</h3>
                <p style="margin: 0; font-size: 0.9rem;">Use the Properties panel to modify styles</p>
              </div>
              <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px);">
                <h3 style="margin: 0 0 10px 0;">💾 Save</h3>
                <p style="margin: 0; font-size: 0.9rem;">Click Save to store your changes</p>
              </div>
            </div>
          </div>
        `;
        
        const defaultCss = `
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 0; 
          }
          h1, h2, h3 { 
            font-weight: 600; 
          }
          * { 
            box-sizing: border-box; 
          }
        `;
        
        editor.setHtml(defaultHtml);
        editor.setCss(defaultCss);
        
        console.log('🎉 GrapesJS setup complete!');
        onEditorReady(editor);
        
      } catch (initError) {
        console.error('❌ CRITICAL: GrapesJS initialization failed:', initError);
        onError(initError instanceof Error ? initError.message : 'Failed to initialize GrapesJS editor');
      }
    }
  }, []);

  return (
    <div ref={editorRef} className="w-full h-full" />
  );
};

export default GrapesJSInitializer;
