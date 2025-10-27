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

  const handleAiImprove = useCallback(async (editor: Editor | null, intent: 'content' | 'layout' | 'style' | 'all' = 'all') => {
    if (!editor) {
      alert('Editor not ready');
      return;
    }

    setIsAiLoading(true);
    try {
      logApiConfig();
      const currentHtml = editor.getHtml();
      const currentCss = editor.getCss();

      const data = await apiPost(API_ENDPOINTS.IMPROVE_CANVAS, {
        html: currentHtml,
        css: currentCss,
        intent,
      });

      if (data.success && (data.html || data.css)) {
        if (data.html) {
          editor.setComponents(data.html);
        }
        if (typeof data.css === 'string') {
          editor.setStyle(data.css);
        }
        setAiSuggestions(data.suggestions || []);
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
