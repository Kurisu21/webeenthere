import { useState, useCallback } from 'react';
import { Element } from '../elements';

export const useAIServices = () => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiContext, setAiContext] = useState<any>(null);
  const [aiReasoning, setAiReasoning] = useState<string>('');

  const handleAiGenerate = useCallback(async (elements: Element[], setElements: (elements: Element[]) => void) => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          elements: elements, // Send full elements array for context analysis
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
        
        setElements([...elements, ...newElements]);
        setAiSuggestions(data.suggestions || []);
        setAiPrompt('');
        
        // Store AI context and reasoning for display
        if (data.context) {
          setAiContext(data.context);
        }
        if (data.reasoning) {
          setAiReasoning(data.reasoning);
        }
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

  const handleAiImprove = useCallback(async (selectedElement: Element | null, elements: Element[], updateElement: (id: string, updates: Partial<Element>) => void) => {
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
          existingElements: elements, // Send all elements for better context
          improvementPrompt: aiPrompt || 'Improve this element',
          userId: 1 // TODO: Get from auth context
        })
      });

      const data = await response.json();
      
      if (data.success && data.improvedElements.length > 0) {
        // Find the improved version of the selected element
        const improvedElement = data.improvedElements.find((el: any) => 
          el.id === selectedElement.id || el.type === selectedElement.type
        ) || data.improvedElements[0];
        
        updateElement(selectedElement.id, improvedElement);
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
