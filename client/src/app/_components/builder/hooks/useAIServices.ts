import { useState, useCallback } from 'react';
import type Editor from 'grapesjs';
import { API_ENDPOINTS, apiPost, logApiConfig } from '../../../../lib/apiConfig';

export const useAIServices = () => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiContext, setAiContext] = useState<any>(null);
  const [aiReasoning, setAiReasoning] = useState<string>('');

  const handleAiGenerate = useCallback(async (editor: Editor | null) => {
    if (!aiPrompt.trim() || !editor) return;
    
    setIsAiLoading(true);
    try {
      // Log API configuration for debugging
      logApiConfig();
      
      // Get current HTML for context
      const currentHtml = editor.getHtml();
      const currentCss = editor.getCss();
      
      const data = await apiPost(API_ENDPOINTS.GENERATE_SECTION, {
        prompt: aiPrompt,
        currentContent: currentHtml,
        cssContent: currentCss,
        userId: 1 // TODO: Get from auth context
      });
      
      if (data.success && data.generatedHtml) {
        // Add AI-generated HTML to the canvas
        const htmlContent = data.generatedHtml;
        const components = editor.addComponents(htmlContent);
        
        setAiSuggestions(data.suggestions || []);
        setAiPrompt('');
        
        // Store AI context and reasoning for display
        if (data.context) {
          setAiContext(data.context);
        }
        if (data.reasoning) {
          setAiReasoning(data.reasoning);
        }
        
        return components;
      } else {
        alert('AI generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('Failed to generate AI content. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  }, [aiPrompt]);

  const handleAiImprove = useCallback(async (editor: Editor | null) => {
    if (!editor) {
      alert('Please select an element to improve');
      return;
    }

    const selected = editor.getSelected();
    if (!selected) {
      alert('Please select an element to improve');
      return;
    }

    setIsAiLoading(true);
    try {
      // Log API configuration for debugging
      logApiConfig();
      
      const selectedHtml = selected.toHTML();
      const currentHtml = editor.getHtml();
      
      const data = await apiPost(API_ENDPOINTS.GENERATE_SECTION, {
        prompt: `Improve this element: ${aiPrompt || 'Improve this element'}`,
        selectedContent: selectedHtml,
        currentContent: currentHtml,
        userId: 1 // TODO: Get from auth context
      });
      
      if (data.success && data.generatedHtml) {
        // Replace the selected element with improved version
        selected.replaceWith(data.generatedHtml);
        
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
  }, [aiPrompt]);

  return {
    // State
    aiPrompt,
    isAiLoading,
    aiSuggestions,
    aiContext,
    aiReasoning,
    
    // Setters
    setAiPrompt,
    setAiSuggestions,
    setAiContext,
    setAiReasoning,
    
    // Actions
    handleAiGenerate,
    handleAiImprove
  };
};
