'use client';

import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import TemplateSelector from './TemplateSelector';
import { Template } from '../../_data/templates';

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
    borderColor?: string;
    opacity?: string;
  };
  position: { x: number; y: number };
  size: { width: number; height: number };
  imageUrl?: string;
}

const WebsiteBuilder = memo(({ currentWebsite }: WebsiteBuilderProps) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('template-selection');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteSlug, setWebsiteSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleTemplateSelect = useCallback((template: Template) => {
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
    
    // Initialize with default elements if starting from scratch
    if (!selectedTemplate) {
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
      social: 'Social links placeholder'
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
        borderRadius: '0px'
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
        backgroundColor: '#007bff',
        padding: '15px 30px',
        textAlign: 'center' as const,
        borderRadius: '25px'
      },
      image: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center' as const,
        borderRadius: '8px'
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
      const websiteContext = elements.map(el => 
        `${el.type}: ${el.content}`
      ).join(', ');

      const response = await fetch('http://localhost:5000/api/ai/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          websiteContext,
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
          existingElements: [selectedElement],
          improvementPrompt: aiPrompt || 'Improve this element',
          userId: 1 // TODO: Get from auth context
        })
      });

      const data = await response.json();
      
      if (data.success && data.improvedElements.length > 0) {
        const improvedElement = data.improvedElements[0];
        updateElement(selectedElement.id, improvedElement);
        setAiSuggestions(data.improvements || []);
        setAiPrompt('');
      } else {
        alert('AI improvement failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI Improvement Error:', error);
      alert('Failed to improve content. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  }, [selectedElement, aiPrompt, updateElement]);

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
    return elements.map(element => `
      <div class="element-${element.id}" style="position: absolute; left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.size.width}px; height: ${element.size.height}px;">
        ${element.type === 'button' ? `<button style="width: 100%; height: 100%; border: none; cursor: pointer;">${element.content}</button>` : 
          element.type === 'image' ? `<img src="${element.imageUrl || 'https://via.placeholder.com/300x200'}" alt="${element.content}" style="width: 100%; height: 100%; object-fit: cover;" />` :
          `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${element.content}</div>`}
      </div>
    `).join('');
  };

  const generateCSS = () => {
    return elements.map(element => `
      .element-${element.id} {
        color: ${element.styles.color || '#333333'};
        font-size: ${element.styles.fontSize || '16px'};
        font-weight: ${element.styles.fontWeight || 'normal'};
        background: ${element.styles.backgroundColor || 'transparent'};
        padding: ${element.styles.padding || '0'};
        text-align: ${element.styles.textAlign || 'left'};
        border-radius: ${element.styles.borderRadius || '0'};
        border: ${element.styles.border || 'none'};
        border-color: ${element.styles.borderColor || 'transparent'};
        opacity: ${element.styles.opacity || '1'};
        box-sizing: border-box;
        overflow: hidden;
      }
    `).join('');
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

          {/* Left Sidebar - Elements */}
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold text-sm">Elements</h3>
              <p className="text-gray-400 text-xs mt-1">Click to add</p>
            </div>
            <div className="p-4 space-y-2">
              {[
                { id: 'hero', name: 'Hero Section', icon: '🎯' },
                { id: 'text', name: 'Text Block', icon: '📝' },
                { id: 'image', name: 'Image', icon: '🖼️' },
                { id: 'button', name: 'Button', icon: '🔘' },
                { id: 'about', name: 'About Section', icon: '👤' },
                { id: 'gallery', name: 'Gallery', icon: '🖼️' },
                { id: 'contact', name: 'Contact Form', icon: '📧' },
                { id: 'social', name: 'Social Links', icon: '🔗' }
              ].map((element) => (
                <div
                  key={element.id}
                  onClick={() => addElement(element.id)}
                  className="flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
                >
                  <span className="text-lg mr-3">{element.icon}</span>
                  <span className="text-gray-300 text-sm font-medium">{element.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
              <div 
                ref={canvasRef}
                className="bg-white rounded-lg shadow-lg overflow-hidden relative min-h-[600px]"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                style={{ position: 'relative' }}
              >
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
                      borderColor: element.styles.borderColor,
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

          {/* Right Sidebar - Properties */}
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold text-sm">Properties</h3>
            </div>
            
            {selectedElement ? (
              <div className="p-4 space-y-4">
                {/* Content */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={selectedElement.content}
                    onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

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
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Border width (e.g., 2px)"
                        value={selectedElement.styles.border || ''}
                        onChange={(e) => updateElement(selectedElement.id, { 
                          styles: { ...selectedElement.styles, border: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={selectedElement.styles.borderColor || '#000000'}
                        onChange={(e) => updateElement(selectedElement.id, { 
                          styles: { ...selectedElement.styles, borderColor: e.target.value }
                        })}
                        className="w-8 h-8 rounded border border-gray-600"
                      />
                      <span className="text-gray-400 text-xs">Border Color</span>
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
              <div className="p-4 text-center text-gray-400">
                <div className="text-4xl mb-4">⚙️</div>
                <p className="text-sm">Select an element to edit its properties</p>
              </div>
            )}

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