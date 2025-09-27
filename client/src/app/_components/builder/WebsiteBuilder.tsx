'use client';

import React, { useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWebsiteBuilder } from './hooks/useWebsiteBuilder';
import { enhancedTemplates } from '../../_data/enhanced-templates';
import { convertTemplateElementsToElements } from './utils/templateConverter';
import { useElementManagement } from './hooks/useElementManagement';
import { useAIServices } from './hooks/useAIServices';
import { handlePreview, handleSaveWebsite } from './utils/websiteUtils';
import { BuilderToolbar } from './components/BuilderToolbar';
import { ElementsPanel } from './components/ElementsPanel';
import { EnhancedPropertiesPanel } from './components/EnhancedPropertiesPanel';
import { BuilderCanvas } from './components/BuilderCanvas';
import { WebsiteDetailsForm } from './components/WebsiteDetailsForm';
import TemplateSelector from './TemplateSelector';
import TemplatePreviewModal from './TemplatePreviewModal';
import StockAssetsLibrary from './StockAssetsLibrary';
import AIContextDisplay from './AIContextDisplay';
import AIGenerationPanel from './AIGenerationPanel';
import GeneratedTemplateModal from './GeneratedTemplateModal';

interface WebsiteBuilderProps {
  currentWebsite?: any;
  websiteId?: string;
}

const WebsiteBuilder: React.FC<WebsiteBuilderProps> = ({ currentWebsite, websiteId }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  
  // Custom hooks for state management
  const {
    currentStep,
    selectedTemplate,
    websiteTitle,
    websiteSlug,
    isCreating,
    elements,
    selectedElement,
    showPreview,
    showAssets,
    showStockAssets,
    pageBackground,
    viewMode,
    showLayers,
    setCurrentStep,
    setSelectedTemplate,
    setWebsiteTitle,
    setWebsiteSlug,
    setIsCreating,
    setElements,
    setSelectedElement,
    setShowPreview,
    setShowAssets,
    setShowStockAssets,
    setPageBackground,
    setViewMode,
    setShowLayers,
    handleTemplateSelect,
    handleStartFromScratch,
    handleWebsiteDetailsSubmit,
    handleCancel
  } = useWebsiteBuilder();

  const {
    isDragging,
    isResizing,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    handleMouseDown,
    handleResizeStart,
    handleMouseMove,
    handleMouseUp,
    handleElementClick,
    handleCanvasClick
  } = useElementManagement();

  const {
    aiPrompt,
    isAiLoading,
    aiSuggestions,
    aiContext,
    aiReasoning,
    setAiPrompt,
    setAiSuggestions,
    setAiContext,
    setAiReasoning,
    handleAiGenerate,
    handleAiImprove
  } = useAIServices();

  // Template generation state
  const [isGeneratingTemplate, setIsGeneratingTemplate] = React.useState(false);
  const [generatedTemplate, setGeneratedTemplate] = React.useState<any>(null);
  const [showGeneratedTemplate, setShowGeneratedTemplate] = React.useState(false);
  const [templateReasoning, setTemplateReasoning] = React.useState<string>('');
  const [templateSuggestions, setTemplateSuggestions] = React.useState<string[]>([]);
  
  // Track if AI generation has been initiated to prevent URL-based navigation
  const aiGenerationInitiated = React.useRef(false);

  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        deleteElement(selectedElement.id, elements, setElements, selectedElement, setSelectedElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, elements, setElements, setSelectedElement, deleteElement]);

  // Event handlers
  const handleAddElement = (type: string) => {
    addElement(type, setElements, setSelectedElement);
  };

  const handleUpdateElement = (id: string, updates: any) => {
    updateElement(id, updates, elements, setElements, selectedElement, setSelectedElement);
  };

  const handleDeleteElement = (id: string) => {
    deleteElement(id, elements, setElements, selectedElement, setSelectedElement);
  };

  const handleDuplicateElement = (id: string) => {
    duplicateElement(id, elements, setElements, setSelectedElement);
  };

  const handleElementMouseDown = (e: React.MouseEvent, element: any) => {
    if (canvasRef.current) {
      handleMouseDown(e, element, canvasRef, setSelectedElement);
    }
  };

  const handleElementResizeStart = (e: React.MouseEvent, handle: string) => {
    handleResizeStart(e, handle, selectedElement);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      handleMouseMove(e, selectedElement, canvasRef, (id: string, updates: any) => {
        updateElement(id, updates, elements, setElements, selectedElement, setSelectedElement);
      });
    }
  };

  const handleElementClickEvent = (element: any, event: React.MouseEvent) => {
    handleElementClick(element, event, setSelectedElement);
  };

  const handleCanvasClickEvent = () => {
    handleCanvasClick(setSelectedElement);
  };

  const handlePreviewWebsite = () => {
    handlePreview(websiteTitle, elements, selectedTemplate);
  };

  const handleSave = () => {
    handleSaveWebsite(
      websiteTitle,
      websiteSlug,
      elements,
      selectedTemplate,
      setIsCreating,
      setCurrentStep,
      setSelectedTemplate,
      setWebsiteTitle,
      setWebsiteSlug,
      setElements,
      setSelectedElement
    );
  };

  const handleAiGenerateEvent = () => {
    handleAiGenerate(elements, setElements);
  };

  const handleAiImproveEvent = () => {
    handleAiImprove(selectedElement, elements, handleUpdateElement);
  };

  // Handle AI template generation
  const handleGenerateTemplate = async (description: string, options: { websiteType: string; style: string; colorScheme: string }) => {
    console.log('=== HANDLE GENERATE TEMPLATE CALLED ===');
    console.log('Received description:', description);
    console.log('Description type:', typeof description);
    console.log('Description length:', description?.length);
    console.log('Received options:', options);
    console.log('Starting template generation with:', { description, options });
    console.log('Current isGeneratingTemplate state:', isGeneratingTemplate);
    console.log('Current aiGenerationInitiated ref:', aiGenerationInitiated.current);
    
    // Validate input
    if (!description || !description.trim()) {
      console.log('ERROR: No description provided');
      alert('Please enter a description for your website');
      return;
    }

    console.log('Input validation passed, proceeding with API call...');

    console.log('Setting AI generation initiated flag');
    aiGenerationInitiated.current = true;
    
    console.log('Setting isGeneratingTemplate to true');
    setIsGeneratingTemplate(true);
    setTemplateReasoning('');
    setTemplateSuggestions([]);
    setGeneratedTemplate(null);
    setShowGeneratedTemplate(false);
    
    // Force a small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('After delay - isGeneratingTemplate:', isGeneratingTemplate);
    console.log('After delay - aiGenerationInitiated:', aiGenerationInitiated.current);

    try {
      console.log('=== PREPARING API REQUEST ===');
      console.log('Sending request to backend...');
      const requestBody = {
        description: description.trim(),
        websiteType: options.websiteType,
        style: options.style,
        colorScheme: options.colorScheme,
        userId: 'current-user' // You might want to get this from auth context
      };
      
      console.log('Request body:', requestBody);
      console.log('Request body JSON:', JSON.stringify(requestBody));

      console.log('=== SENDING FETCH REQUEST ===');
      console.log('URL: http://localhost:5000/api/ai/generate-template');
      console.log('Method: POST');
      console.log('Headers: Content-Type: application/json');
      
      const response = await fetch('http://localhost:5000/api/ai/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('=== FETCH RESPONSE RECEIVED ===');
      console.log('API response status:', response.status);
      console.log('API response statusText:', response.statusText);
      console.log('API response headers:', response.headers);
      console.log('API response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('=== PARSING RESPONSE JSON ===');
      const data = await response.json();
      console.log('API response data:', data);
      console.log('API response data type:', typeof data);
      console.log('API response data success:', data.success);

      if (data.success) {
        console.log('Template generated successfully:', data.template);
        setGeneratedTemplate(data.template);
        setTemplateReasoning(data.reasoning || '');
        setTemplateSuggestions(data.suggestions || []);
        setShowGeneratedTemplate(true);
        console.log('Modal should be showing now');
      } else {
        console.error('Template generation failed:', data.error);
        alert('Template generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error generating template: ' + errorMessage);
    } finally {
      setIsGeneratingTemplate(false);
      // Reset the flag after generation completes (success or failure)
      aiGenerationInitiated.current = false;
    }
  };

  // Handle using the generated template
  const handleUseGeneratedTemplate = (template: any) => {
    setSelectedTemplate(template);
    setElements(template.elements || []);
    setCurrentStep('builder');
  };

  // Load template from URL params if available
  useEffect(() => {
    const templateId = searchParams.get('template');
    console.log('Template ID from URL:', templateId);
    console.log('isGeneratingTemplate:', isGeneratingTemplate);
    console.log('selectedTemplate:', selectedTemplate);
    console.log('aiGenerationInitiated:', aiGenerationInitiated.current);
    
    // Prevent navigation during AI generation
    if (isGeneratingTemplate) {
      console.log('AI generation in progress, preventing navigation');
      return;
    }
    
    // Don't load template if AI generation has been initiated
    if (aiGenerationInitiated.current) {
      console.log('AI generation initiated, preventing URL-based navigation');
      return;
    }
    
    // Handle ai_generated template ID - check for generated template data
    if (templateId === 'ai_generated') {
      console.log('AI generated template detected, checking for generated data...');
      const generatedData = searchParams.get('generated');
      
      if (generatedData) {
        try {
          const generatedTemplate = JSON.parse(decodeURIComponent(generatedData));
          console.log('Found generated template data:', generatedTemplate);
          setSelectedTemplate(generatedTemplate);
          setGeneratedTemplate(generatedTemplate);
          setElements(generatedTemplate.elements || []);
          setCurrentStep('builder');
          return;
        } catch (error) {
          console.error('Error parsing generated template data:', error);
        }
      }
      
      console.log('No generated template data found, staying on template selection');
      setCurrentStep('template-selection');
      return;
    }
    
    if (templateId && !selectedTemplate) {
      // Find template in enhanced templates
      const foundTemplate = enhancedTemplates.find(t => t.id === templateId);
      console.log('Found template:', foundTemplate);
      
      if (foundTemplate) {
        setSelectedTemplate(foundTemplate);
        // Convert and load template elements
        const convertedElements = convertTemplateElementsToElements(foundTemplate.elements || []);
        setElements(convertedElements);
        setCurrentStep('builder'); // Navigate to builder
        console.log('Loaded template elements:', convertedElements);
        console.log('Template elements count:', convertedElements.length);
      } else if (templateId === 'blank') {
        // Start with blank template
        setSelectedTemplate({
          id: 'blank',
          name: 'Blank Template',
          description: 'Start from scratch',
          category: 'business',
          image: '/api/placeholder/400/300',
          elements: [],
          css_base: '',
          is_featured: false,
          tags: ['blank']
        });
        setElements([]);
        setCurrentStep('builder'); // Navigate to builder
      } else {
        // Unknown template ID - stay on template selection
        console.log('Unknown template ID, staying on template selection');
        setCurrentStep('template-selection');
      }
    }
  }, [searchParams, setCurrentStep, setElements, isGeneratingTemplate]);

  const renderBuilder = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-900 z-50">
        {/* Toolbar */}
        <BuilderToolbar
          websiteTitle={websiteTitle}
          showStockAssets={showStockAssets}
          showLayers={showLayers}
          showPreview={showPreview}
          isCreating={isCreating}
          onShowStockAssets={() => setShowStockAssets(!showStockAssets)}
          onToggleLayers={() => setShowLayers(!showLayers)}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onSaveWebsite={handleSave}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Elements */}
          <ElementsPanel onAddElement={handleAddElement} />

          {/* Center - Canvas */}
          <BuilderCanvas
            ref={canvasRef}
            elements={elements}
            selectedElement={selectedElement}
            viewMode={viewMode}
            pageBackground={pageBackground}
            isDragging={isDragging}
            onElementClick={handleElementClickEvent}
            onCanvasClick={handleCanvasClickEvent}
            onMouseDown={handleElementMouseDown}
            onResizeStart={handleElementResizeStart}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleMouseUp}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
          />

          {/* Right Sidebar - Properties */}
          <EnhancedPropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
                          />
                  </div>

        {/* AI Context Display */}
        {aiContext && (
          <AIContextDisplay
            context={aiContext}
            reasoning={aiReasoning}
          />
        )}

        {/* Stock Assets Library */}
        {showStockAssets && (
          <StockAssetsLibrary
            isOpen={showStockAssets}
            onClose={() => setShowStockAssets(false)}
            onSelectAsset={(asset) => {
              console.log('Asset selected:', asset);
              setShowStockAssets(false);
            }}
          />
        )}

        {/* Preview Modal */}
        {showPreview && (
          <TemplatePreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            onSelect={() => {
              setShowPreview(false);
              // Handle template usage
            }}
            template={{
              id: 'preview',
              name: websiteTitle || 'Website Preview',
              description: 'Live preview of your website',
              image: '🌐',
              category: 'portfolio',
              elements: elements as any,
              css_base: '',
              is_featured: false,
              tags: ['preview']
            }}
          />
        )}

        {/* Generated Template Modal */}
        {showGeneratedTemplate && (
          <GeneratedTemplateModal
            isOpen={showGeneratedTemplate}
            onClose={() => setShowGeneratedTemplate(false)}
            template={generatedTemplate}
            onUseTemplate={handleUseGeneratedTemplate}
            reasoning={templateReasoning}
            suggestions={templateSuggestions}
          />
        )}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'template-selection':
    return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Choose a template or generate one with AI
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Select from our collection or create a custom template with AI
                </p>
              </div>

              {/* AI Generation Panel */}
              <AIGenerationPanel
                onGenerate={handleGenerateTemplate}
                isGenerating={isGeneratingTemplate}
              />

              {/* Template Selector - Disabled during AI generation */}
              <div className={isGeneratingTemplate ? 'opacity-50 pointer-events-none' : ''}>
                <TemplateSelector
                  onTemplateSelect={handleTemplateSelect}
                  onStartFromScratch={handleStartFromScratch}
                />
              </div>

              {/* AI Generation Overlay */}
              {isGeneratingTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Generating Your Template
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        AI is creating a custom website template based on your description. Please wait...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
    );

      case 'website-details':
    return (
          <WebsiteDetailsForm
            websiteTitle={websiteTitle}
            websiteSlug={websiteSlug}
            selectedTemplate={selectedTemplate}
            onTitleChange={setWebsiteTitle}
            onSlugChange={setWebsiteSlug}
            onSubmit={handleWebsiteDetailsSubmit}
            onCancel={handleCancel}
          />
        );

      case 'builder':
        return renderBuilder();

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {renderCurrentStep()}
      </div>
    );
};

export default WebsiteBuilder;
