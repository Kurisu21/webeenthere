import { useState, useCallback } from 'react';
import { EnhancedTemplate } from '../../../_data/enhanced-templates';
import { Element } from '../elements';

export type BuilderStep = 'template-selection' | 'website-details' | 'builder';

export const useWebsiteBuilder = () => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('template-selection');
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedTemplate | null>(null);
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteSlug, setWebsiteSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [showStockAssets, setShowStockAssets] = useState(false);
  const [pageBackground, setPageBackground] = useState({
    type: 'color',
    value: '#ffffff',
    gradient: {
      direction: 'to right',
      colors: ['#ffffff', '#f0f0f0']
    }
  });
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showLayers, setShowLayers] = useState(false);

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
  }, [websiteTitle, selectedTemplate, elements]);

  const handleCancel = useCallback(() => {
    setCurrentStep('template-selection');
    setSelectedTemplate(null);
    setWebsiteTitle('');
    setWebsiteSlug('');
    setElements([]);
    setSelectedElement(null);
  }, []);

  return {
    // State
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
    
    // Setters
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
    
    // Handlers
    handleTemplateSelect,
    handleStartFromScratch,
    handleWebsiteDetailsSubmit,
    handleCancel
  };
};

