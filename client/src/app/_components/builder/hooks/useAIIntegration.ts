import { useState, useCallback } from 'react';
import { API_ENDPOINTS, apiPost } from '../../../../lib/apiConfig';

interface AIContentRequest {
  prompt: string;
  html?: string;
  css?: string;
  selectedComponent?: string;
  context?: any;
}

interface AIContentResponse {
  success: boolean;
  content?: string;
  suggestions?: string[];
  reasoning?: string;
  error?: string;
}

export const useAIIntegration = () => {
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiReasoning, setAiReasoning] = useState<string>('');

  const generateContent = useCallback(async (
    prompt: string, 
    context: { html?: string; css?: string; selectedComponent?: string }
  ): Promise<AIContentResponse> => {
    setIsAILoading(true);
    setAiSuggestions([]);
    setAiReasoning('');

    try {
      const requestData: AIContentRequest = {
        prompt,
        html: context.html,
        css: context.css,
        selectedComponent: context.selectedComponent,
        context: {
          type: 'content_generation',
          timestamp: new Date().toISOString()
        }
      };

      const response = await apiPost(API_ENDPOINTS.GENERATE_SECTION, requestData);
      
      if (response.success) {
        setAiSuggestions(response.suggestions || []);
        setAiReasoning(response.reasoning || '');
        
        return {
          success: true,
          content: response.content,
          suggestions: response.suggestions,
          reasoning: response.reasoning
        };
      } else {
        return {
          success: false,
          error: response.message || 'AI generation failed'
        };
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      return {
        success: false,
        error: 'Failed to generate AI content. Please try again.'
      };
    } finally {
      setIsAILoading(false);
    }
  }, []);

  const improveContent = useCallback(async (
    prompt: string,
    context: { html?: string; css?: string; selectedComponent?: string }
  ): Promise<AIContentResponse> => {
    setIsAILoading(true);
    setAiSuggestions([]);
    setAiReasoning('');

    try {
      const requestData: AIContentRequest = {
        prompt: `Improve this content: ${prompt}`,
        html: context.html,
        css: context.css,
        selectedComponent: context.selectedComponent,
        context: {
          type: 'content_improvement',
          timestamp: new Date().toISOString()
        }
      };

      const response = await apiPost(API_ENDPOINTS.GENERATE_SECTION, requestData);
      
      if (response.success) {
        setAiSuggestions(response.improvements || []);
        setAiReasoning(response.reasoning || '');
        
        return {
          success: true,
          content: response.improvedContent,
          suggestions: response.improvements,
          reasoning: response.reasoning
        };
      } else {
        return {
          success: false,
          error: response.message || 'AI improvement failed'
        };
      }
    } catch (error) {
      console.error('AI Improvement Error:', error);
      return {
        success: false,
        error: 'Failed to improve content. Please try again.'
      };
    } finally {
      setIsAILoading(false);
    }
  }, []);

  const generateTemplate = useCallback(async (
    prompt: string,
    context: { category?: string; style?: string; sections?: string[] }
  ): Promise<AIContentResponse> => {
    setIsAILoading(true);
    setAiSuggestions([]);
    setAiReasoning('');

    try {
      const requestData = {
        prompt: `Generate a complete website template: ${prompt}`,
        context: {
          type: 'template_generation',
          category: context.category || 'general',
          style: context.style || 'modern',
          sections: context.sections || ['hero', 'about', 'contact'],
          timestamp: new Date().toISOString()
        }
      };

      const response = await apiPost(API_ENDPOINTS.GENERATE_TEMPLATE, requestData);
      
      if (response.success) {
        setAiSuggestions(response.suggestions || []);
        setAiReasoning(response.reasoning || '');
        
        return {
          success: true,
          content: response.template,
          suggestions: response.suggestions,
          reasoning: response.reasoning
        };
      } else {
        return {
          success: false,
          error: response.message || 'AI template generation failed'
        };
      }
    } catch (error) {
      console.error('AI Template Generation Error:', error);
      return {
        success: false,
        error: 'Failed to generate AI template. Please try again.'
      };
    } finally {
      setIsAILoading(false);
    }
  }, []);

  const generateSection = useCallback(async (
    sectionType: string,
    prompt: string,
    context: { html?: string; css?: string }
  ): Promise<AIContentResponse> => {
    setIsAILoading(true);
    setAiSuggestions([]);
    setAiReasoning('');

    try {
      const requestData = {
        prompt: `Generate a ${sectionType} section: ${prompt}`,
        html: context.html,
        css: context.css,
        context: {
          type: 'section_generation',
          sectionType,
          timestamp: new Date().toISOString()
        }
      };

      const response = await apiPost(API_ENDPOINTS.GENERATE_SECTION, requestData);
      
      if (response.success) {
        setAiSuggestions(response.suggestions || []);
        setAiReasoning(response.reasoning || '');
        
        return {
          success: true,
          content: response.content,
          suggestions: response.suggestions,
          reasoning: response.reasoning
        };
      } else {
        return {
          success: false,
          error: response.message || 'AI section generation failed'
        };
      }
    } catch (error) {
      console.error('AI Section Generation Error:', error);
      return {
        success: false,
        error: 'Failed to generate AI section. Please try again.'
      };
    } finally {
      setIsAILoading(false);
    }
  }, []);

  const optimizeSEO = useCallback(async (
    html: string,
    context: { title?: string; description?: string; keywords?: string[] }
  ): Promise<AIContentResponse> => {
    setIsAILoading(true);
    setAiSuggestions([]);
    setAiReasoning('');

    try {
      const requestData = {
        prompt: 'Optimize this website for SEO',
        html,
        context: {
          type: 'seo_optimization',
          title: context.title,
          description: context.description,
          keywords: context.keywords,
          timestamp: new Date().toISOString()
        }
      };

      const response = await apiPost(API_ENDPOINTS.GENERATE_SECTION, requestData);
      
      if (response.success) {
        setAiSuggestions(response.seoSuggestions || []);
        setAiReasoning(response.reasoning || '');
        
        return {
          success: true,
          content: response.optimizedHTML,
          suggestions: response.seoSuggestions,
          reasoning: response.reasoning
        };
      } else {
        return {
          success: false,
          error: response.message || 'AI SEO optimization failed'
        };
      }
    } catch (error) {
      console.error('AI SEO Optimization Error:', error);
      return {
        success: false,
        error: 'Failed to optimize SEO. Please try again.'
      };
    } finally {
      setIsAILoading(false);
    }
  }, []);

  return {
    generateContent,
    improveContent,
    generateTemplate,
    generateSection,
    optimizeSEO,
    isAILoading,
    aiSuggestions,
    aiReasoning
  };
};








