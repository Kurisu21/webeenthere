'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_ENDPOINTS, apiPost, apiPut, apiGet } from '../../../lib/apiConfig';

// Import modular components
import BuilderSidebar from './components/BuilderSidebar';
import BuilderToolbar from './components/BuilderToolbar';
import BuilderCanvas from './components/BuilderCanvas';
import BuilderProperties from './components/BuilderProperties';
import GrapesJSInitializer from './components/GrapesJSInitializer';
import { WebsiteDetailsModal } from './components/WebsiteDetailsModal';

interface GrapesJSBuilderModularProps {
  websiteId?: string;
  initialTemplate?: string;
}

const GrapesJSBuilderModular: React.FC<GrapesJSBuilderModularProps> = ({ 
  websiteId, 
  initialTemplate 
}) => {
  const grapesEditor = useRef<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showWebsiteDetails, setShowWebsiteDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'blocks' | 'layers' | 'styles' | 'assets' | 'ai'>('blocks');
  const [isInitialized, setIsInitialized] = useState(false);
  const [websiteData, setWebsiteData] = useState({
    title: '',
    slug: '',
    description: ''
  });

  // Handle GrapesJS editor ready
  const handleEditorReady = (editor: any) => {
    console.log('✅ Editor ready callback received');
    grapesEditor.current = editor;
    setIsInitialized(true);
    setIsLoading(false);
    
    // Handle asset manager separately since it doesn't support appendTo
    setTimeout(() => {
      const assetsPanel = document.querySelector('.gjs-am');
      const assetsContainer = document.querySelector('.assets-container');
      if (assetsPanel && assetsContainer) {
        assetsContainer.appendChild(assetsPanel);
        console.log('✅ Assets panel moved to container');
      } else {
        console.log('⚠️ Assets panel or container not found:', { assetsPanel, assetsContainer });
      }
    }, 1500);
  };

  // Handle GrapesJS initialization error
  const handleEditorError = (error: string) => {
    console.error('❌ Editor initialization error:', error);
    setError(error);
    setIsLoading(false);
  };

  // Handle panel visibility based on activePanel state
  useEffect(() => {
    if (!isInitialized) return;

    // Wait a bit for panels to be fully rendered
    const timeoutId = setTimeout(() => {
      console.log('🔍 Managing panel visibility for activePanel:', activePanel);
      
      // Get all panel containers
      const blocksContainer = document.querySelector('.blocks-container') as HTMLElement;
      const layersContainer = document.querySelector('.layers-container') as HTMLElement;
      const stylesContainer = document.querySelector('.styles-container') as HTMLElement;
      const assetsContainer = document.querySelector('.assets-container') as HTMLElement;
      const traitsContainer = document.querySelector('.traits-container') as HTMLElement;

      console.log('🔍 Panel containers found:', {
        blocks: !!blocksContainer,
        layers: !!layersContainer,
        styles: !!stylesContainer,
        assets: !!assetsContainer,
        traits: !!traitsContainer
      });

      // Hide all panels first (only if they exist)
      [blocksContainer, layersContainer, stylesContainer, assetsContainer].forEach(container => {
        if (container) {
          container.style.display = 'none';
          console.log('👁️ Hidden panel:', container.className);
        }
      });

      // Show active panel
      switch (activePanel) {
        case 'blocks':
          if (blocksContainer) {
            blocksContainer.style.display = 'block';
            console.log('✅ Showing blocks panel');
          }
          break;
        case 'layers':
          if (layersContainer) {
            layersContainer.style.display = 'block';
            console.log('✅ Showing layers panel');
          }
          break;
        case 'styles':
          if (stylesContainer) {
            stylesContainer.style.display = 'block';
            console.log('✅ Showing styles panel');
          }
          break;
        case 'assets':
          if (assetsContainer) {
            assetsContainer.style.display = 'block';
            console.log('✅ Showing assets panel');
          }
          break;
      }

      // Always show traits container in right panel
      if (traitsContainer) {
        traitsContainer.style.display = 'block';
        console.log('✅ Showing traits panel');
      }
    }, 500); // Wait 500ms for panels to be ready

    return () => clearTimeout(timeoutId);
  }, [activePanel, isInitialized]);

  // Monitor panel visibility and fix if they disappear
  useEffect(() => {
    if (!isInitialized) return;

    const monitorInterval = setInterval(() => {
      const blocksContainer = document.querySelector('.blocks-container') as HTMLElement;
      const layersContainer = document.querySelector('.layers-container') as HTMLElement;
      const stylesContainer = document.querySelector('.styles-container') as HTMLElement;
      const assetsContainer = document.querySelector('.assets-container') as HTMLElement;
      const traitsContainer = document.querySelector('.traits-container') as HTMLElement;

      // Check if any panels are hidden when they shouldn't be
      const containers = [
        { container: blocksContainer, name: 'blocks', shouldShow: activePanel === 'blocks' },
        { container: layersContainer, name: 'layers', shouldShow: activePanel === 'layers' },
        { container: stylesContainer, name: 'styles', shouldShow: activePanel === 'styles' },
        { container: assetsContainer, name: 'assets', shouldShow: activePanel === 'assets' },
        { container: traitsContainer, name: 'traits', shouldShow: true }
      ];

      containers.forEach(({ container, name, shouldShow }) => {
        if (container && shouldShow && container.style.display === 'none') {
          console.log(`🔧 Panel ${name} disappeared, fixing visibility`);
          container.style.display = 'block';
        }
      });
    }, 1000); // Check every second

    return () => clearInterval(monitorInterval);
  }, [activePanel, isInitialized]);

  // Load website data from API
  const loadWebsiteData = async (id: string) => {
    try {
      console.log(`📡 Loading website data for ID: ${id}`);
      
      const data = await apiGet(`${API_ENDPOINTS.WEBSITES}/${id}`);
      console.log('📡 Website data response:', data);
      
      if (data.success) {
        const website = data.data;
        setWebsiteData({
          title: website.title || '',
          slug: website.slug || '',
          description: website.description || ''
        });

        // Load HTML and CSS into editor
        if (grapesEditor.current) {
          if (website.html_content) {
            console.log('📄 Loading HTML content into editor');
            grapesEditor.current.setComponents(website.html_content);
          }
          if (website.css_content) {
            console.log('🎨 Loading CSS content into editor');
            grapesEditor.current.setStyle(website.css_content);
          }
        }
        console.log('✅ Website data loaded successfully');
      } else {
        console.warn('⚠️ Failed to load website data:', data.message);
        setError(data.message || 'Failed to load website data');
      }
    } catch (error) {
      console.error('❌ Error fetching website data:', error);
      setError('Error fetching website data');
    }
  };

  // Handle saving website
  const handleSave = async () => {
    if (!grapesEditor.current) return;

    setIsSaving(true);
    try {
      const html_content = grapesEditor.current.getHtml();
      const css_content = grapesEditor.current.getCss();
      const data = {
        websiteId,
        title: websiteData.title,
        slug: websiteData.slug,
        html_content,
        css_content,
      };

      let response;
      if (websiteId) {
        response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, data);
      } else {
        response = await apiPost(API_ENDPOINTS.WEBSITES, data);
        if (response.success && response.data?.id) {
          // Update URL to reflect new website ID
          router.replace(`/builder?websiteId=${response.data.id}`);
        }
      }

      if (response.success) {
        alert('Website saved successfully!');
        console.log('✅ Website saved:', response.data);
      } else {
        alert(`Failed to save website: ${response.message}`);
        console.error('❌ Failed to save website:', response.message);
      }
    } catch (error) {
      console.error('❌ Error saving website:', error);
      alert('Error saving website. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Initialization Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <p className="text-sm text-gray-400">Please check the console for more details or try refreshing the page.</p>
          <div className="mt-6 flex justify-center space-x-4">
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }} 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reload Builder
            </button>
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }} 
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Left Panel - Sidebar */}
      <BuilderSidebar 
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col editor-row bg-gradient-to-br from-gray-800 to-gray-900 relative z-0">
        {/* Top Toolbar */}
        <BuilderToolbar 
          onWebsiteDetails={() => setShowWebsiteDetails(true)}
          onSave={handleSave}
          isSaving={isSaving}
        />

        {/* GrapesJS Editor */}
        <BuilderCanvas 
          grapesEditor={grapesEditor}
          isLoading={isLoading}
        />
      </div>

      {/* Right Panel - Properties */}
      <BuilderProperties />

      {/* GrapesJS Initializer - Rendered but positioned absolutely */}
      <div className="absolute inset-0 pointer-events-none">
        <GrapesJSInitializer
          onEditorReady={handleEditorReady}
          onError={handleEditorError}
          websiteId={websiteId}
          initialTemplate={initialTemplate}
        />
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

export default GrapesJSBuilderModular;
