'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './styles/grapesjs-custom.css';
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

import { useGrapesJS } from './hooks/useGrapesJS';
import { useAIIntegration } from './hooks/useAIIntegration';
import { useTemplateIntegration } from './hooks/useTemplateIntegration';
import { GrapesJSToolbar } from './components/GrapesJSToolbar';
import { AIPanel } from './components/AIPanel';
import { TemplatePanel } from './components/TemplatePanel';
import { AssetPanel } from './components/AssetPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { LayersPanel } from './components/LayersPanel';
import { WebsiteDetailsModal } from './components/WebsiteDetailsModal';
import { API_ENDPOINTS, apiPost, apiPut } from '../../../lib/apiConfig';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showWebsiteDetails, setShowWebsiteDetails] = useState(false);
  const [websiteData, setWebsiteData] = useState({
    title: '',
    slug: '',
    description: ''
  });

  // Custom hooks
  const {
    editor,
    initializeEditor,
    destroyEditor,
    saveWebsite,
    loadWebsite,
    exportWebsite
  } = useGrapesJS();

  const {
    generateContent,
    improveContent,
    generateTemplate,
    isAILoading,
    aiSuggestions
  } = useAIIntegration();

  const {
    loadTemplate,
    saveAsTemplate,
    availableTemplates,
    isTemplateLoading
  } = useTemplateIntegration();

  // Initialize GrapesJS editor
  useEffect(() => {
    if (editorRef.current && !grapesEditor.current) {
      const editor = grapesjs.init({
        container: editorRef.current,
        height: '100vh',
        width: '100%',
        storageManager: false, // We'll handle saving manually
        assetManager: {
          upload: false,
          uploadText: 'Drop files here or click to upload',
          addBtnText: 'Add image',
          uploadFile: async (e: any) => {
            const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
            // Handle file upload
            console.log('Files to upload:', files);
            return Promise.resolve();
          }
        },
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
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste your HTML/CSS code here and click Import</div>',
            modalImportContent: function(editor: any) {
              return editor.getHtml() + '<style>' + editor.getCss() + '</style>';
            }
          },
          'gjs-blocks-basic': {
            blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video'],
            flexGrid: 1
          },
          'gjs-plugin-forms': {
            blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio']
          },
          'gjs-component-countdown': {
            blocks: ['countdown']
          },
          'gjs-plugin-export': {
            btnLabel: 'Export',
            filename: 'website'
          }
        },
        canvas: {
          styles: [
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
          ],
          scripts: [
            'https://code.jquery.com/jquery-3.3.1.slim.min.js',
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js'
          ]
        },
        panels: {
          defaults: [
            {
              id: 'layers',
              el: '.panel__right',
              resizable: {
                maxDim: 350,
                minDim: 200,
                tc: false,
                cl: true,
                cr: false,
                bc: false,
                keyWidth: 'flex-basis'
              }
            },
            {
              id: 'panel-switcher',
              el: '.panel__switcher',
              buttons: [
                {
                  id: 'show-layers',
                  active: true,
                  label: 'Layers',
                  command: 'show-layers',
                  togglable: false
                },
                {
                  id: 'show-style',
                  active: true,
                  label: 'Styles',
                  command: 'show-styles',
                  togglable: false
                },
                {
                  id: 'show-traits',
                  active: true,
                  label: 'Settings',
                  command: 'show-traits',
                  togglable: false
                }
              ]
            }
          ]
        },
        blockManager: {
          appendTo: '.blocks-container'
        },
        layerManager: {
          appendTo: '.layers-container'
        },
        traitManager: {
          appendTo: '.traits-container'
        },
        selectorManager: {
          appendTo: '.styles-container'
        }
      });

      grapesEditor.current = editor;
      initializeEditor(editor);

      // Load initial content
      if (websiteId) {
        loadWebsiteData(websiteId);
      } else if (initialTemplate) {
        loadTemplate(initialTemplate);
      } else {
        // Load default template or start blank
        loadDefaultContent();
      }

      setIsLoading(false);
    }

    return () => {
      if (grapesEditor.current) {
        destroyEditor();
        grapesEditor.current = null;
      }
    };
  }, []);

  // Load website data from API
  const loadWebsiteData = async (id: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.WEBSITES}/${id}`);
      const data = await response.json();
      
      if (data.success) {
        const website = data.data;
        setWebsiteData({
          title: website.title || '',
          slug: website.slug || '',
          description: website.description || ''
        });

        // Load HTML and CSS into editor
        if (website.html_content) {
          grapesEditor.current.setComponents(website.html_content);
        }
        if (website.css_content) {
          grapesEditor.current.setStyle(website.css_content);
        }
      }
    } catch (error) {
      console.error('Error loading website:', error);
    }
  };

  // Load default content
  const loadDefaultContent = () => {
    const defaultHTML = `
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <h1>Welcome to Your Website</h1>
            <p>Start building your amazing website with GrapesJS!</p>
          </div>
        </div>
      </div>
    `;
    
    grapesEditor.current.setComponents(defaultHTML);
  };

  // Handle save
  const handleSave = async () => {
    if (!grapesEditor.current) return;

    setIsSaving(true);
    try {
      const html = grapesEditor.current.getHtml();
      const css = grapesEditor.current.getCss();
      
      const saveData = {
        title: websiteData.title,
        slug: websiteData.slug,
        html_content: html,
        css_content: css,
        is_published: false
      };

      let response;
      if (websiteId) {
        response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, saveData);
      } else {
        response = await apiPost(API_ENDPOINTS.WEBSITES, saveData);
      }

      if (response.success) {
        alert('Website saved successfully!');
        if (!websiteId) {
          router.push(`/user/build/${response.data.id}`);
        }
      } else {
        alert('Error saving website: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Error saving website. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle AI content generation
  const handleAIGenerate = async (prompt: string) => {
    if (!grapesEditor.current) return;

    try {
      const selectedComponent = grapesEditor.current.getSelected();
      const html = grapesEditor.current.getHtml();
      const css = grapesEditor.current.getCss();

      const result = await generateContent(prompt, {
        html,
        css,
        selectedComponent: selectedComponent ? selectedComponent.toHTML() : null
      });

      if (result.success && result.content) {
        // Add generated content to editor
        const newComponent = grapesEditor.current.addComponents(result.content);
        grapesEditor.current.select(newComponent);
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('Error generating content. Please try again.');
    }
  };

  // Handle template loading
  const handleTemplateLoad = async (templateId: string) => {
    try {
      const template = await loadTemplate(templateId);
      if (template) {
        grapesEditor.current.setComponents(template.html);
        grapesEditor.current.setStyle(template.css);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Error loading template. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading GrapesJS Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Toolbar */}
        <GrapesJSToolbar
          onSave={handleSave}
          onExport={() => exportWebsite()}
          isSaving={isSaving}
          onShowDetails={() => setShowWebsiteDetails(true)}
        />

        {/* AI Panel */}
        <AIPanel
          onGenerate={handleAIGenerate}
          isLoading={isAILoading}
          suggestions={aiSuggestions}
        />

        {/* Template Panel */}
        <TemplatePanel
          templates={availableTemplates}
          onLoadTemplate={handleTemplateLoad}
          isLoading={isTemplateLoading}
        />

        {/* Asset Panel */}
        <AssetPanel />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Panel */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <span className="text-white font-medium">
              {websiteData.title || 'Untitled Website'}
            </span>
          </div>
        </div>

        {/* GrapesJS Editor */}
        <div className="flex-1 relative">
          <div ref={editorRef} className="w-full h-full" />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Properties Panel */}
        <PropertiesPanel editor={grapesEditor.current} />

        {/* Layers Panel */}
        <LayersPanel editor={grapesEditor.current} />
      </div>

      {/* Website Details Modal */}
      {showWebsiteDetails && (
        <WebsiteDetailsModal
          websiteData={websiteData}
          onUpdate={setWebsiteData}
          onClose={() => setShowWebsiteDetails(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default GrapesJSBuilderClient;
