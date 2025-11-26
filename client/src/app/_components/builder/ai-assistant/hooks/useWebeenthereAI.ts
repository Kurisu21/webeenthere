import { useState, useCallback, useRef, useEffect } from 'react';
import type { Editor } from 'grapesjs';
import { API_ENDPOINTS, apiPost, apiGet, apiPut } from '../../../../../lib/apiConfig';
import { buildEditorContextPrompt } from '../utils/promptBuilder';
import { executeAICode } from '../utils/codeExecutor';

interface AISuggestion {
  explanation: string;
  code: string;
  isAutoExecuted?: boolean;
}

interface TechnicalMetrics {
  tokenCount: number;
  retryCount: number;
  errorCount: number;
}

interface ChatMessage {
  id: number;
  messageType: 'user' | 'assistant';
  promptText: string;
  responseHtml: string | null;
  executionStatus: 'pending' | 'success' | 'failed';
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  messages: ChatMessage[];
  lastMessageAt: string;
}

export function useWebeenthereAI(editor: Editor | null, websiteId?: string, onAutoSave?: () => Promise<void>) {
  const [currentSuggestion, setCurrentSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Conversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [technicalMetrics, setTechnicalMetrics] = useState<TechnicalMetrics>({
    tokenCount: 0,
    retryCount: 0,
    errorCount: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const changeCountRef = useRef(0);
  const lastSnapshotRef = useRef<string>('');
  const autoSuggestEnabledRef = useRef(true);

  // Create content snapshot function (defined before useEffect that uses it)
  const createContentSnapshot = useCallback((): string => {
    if (!editor) return '';
    
    const html = editor.getHtml() || '';
    const css = editor.getCss() || '';
    const components = editor.getComponents();
    
    // Create a simple hash for comparison
    return `${html.length}-${css.length}-${components.length}`;
  }, [editor]);

  // Track editor changes for automatic suggestions (vibe coding)
  useEffect(() => {
    if (!editor) return;

    let debounceTimer: NodeJS.Timeout | null = null;
    const DEBOUNCE_DELAY = 3000; // Wait 3 seconds after last change

    const handleChange = async () => {
      changeCountRef.current += 1;
      
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Only auto-suggest if there are significant changes (5+ changes) and auto-suggest is enabled
      // AND if we're not currently processing a user request or showing a suggestion
      if (changeCountRef.current >= 5 && autoSuggestEnabledRef.current && !isLoading && !currentSuggestion) {
        // Debounce: wait for user to finish editing
        debounceTimer = setTimeout(async () => {
          // Double-check: if loading or auto-suggest disabled, cancel
          // Note: We can't check currentSuggestion here due to closure, but we check it before setting timer
          if (isLoading || !autoSuggestEnabledRef.current) {
            return;
          }
          
          const snapshot = createContentSnapshot();
          // Only suggest if content actually changed
          if (snapshot !== lastSnapshotRef.current) {
            console.log('[WebeenthereAI] Auto-suggesting after user edits...');
            autoSuggestEnabledRef.current = false; // Prevent multiple simultaneous requests
            
            try {
              const context = gatherEditorContext(editor);
              const prompt = buildEditorContextPrompt(context, null);
              const response = await callAIService(prompt, abortControllerRef, false);

              if (response.success && response.suggestion) {
                setCurrentSuggestion({
                  explanation: response.suggestion.explanation,
                  code: response.suggestion.code,
                  isAutoExecuted: false
                });
                setTechnicalMetrics(prev => ({
                  ...prev,
                  tokenCount: response.tokenCount || 0
                }));
                lastSnapshotRef.current = snapshot;
                changeCountRef.current = 0;
              }
            } catch (err: any) {
              // Silently handle errors for auto-suggestions (don't spam console)
              if (err.name !== 'AbortError' && err.message !== 'Request cancelled') {
                // Only log non-abort errors, but don't show to user
                console.log('[WebeenthereAI] Auto-suggestion failed (silent):', err.message);
              }
            } finally {
              // Only re-enable if we're still not loading (user might have made a request)
              if (!isLoading) {
                autoSuggestEnabledRef.current = true;
              }
            }
          }
        }, DEBOUNCE_DELAY);
      }
    };

    // Listen to all editor changes
    editor.on('component:add component:remove component:update component:styleUpdate style:change', handleChange);

    return () => {
      editor.off('component:add component:remove component:update component:styleUpdate style:change', handleChange);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [editor, isLoading, createContentSnapshot]);

  const requestSuggestion = useCallback(async () => {
    if (!editor || isLoading) return;

    const snapshot = createContentSnapshot();
    if (snapshot === lastSnapshotRef.current && changeCountRef.current < 3) {
      console.log('[WebeenthereAI] Skipping suggestion - no significant changes');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTechnicalMetrics(prev => ({ ...prev, retryCount: 0, errorCount: 0 }));

    try {
      const context = gatherEditorContext(editor);
      const prompt = buildEditorContextPrompt(context, null);

      const response = await callAIService(prompt, abortControllerRef);

      if (response.success && response.suggestion) {
        setCurrentSuggestion({
          explanation: response.suggestion.explanation,
          code: response.suggestion.code,
          isAutoExecuted: false
        });
        setTechnicalMetrics(prev => ({
          ...prev,
          tokenCount: response.tokenCount || 0
        }));
        lastSnapshotRef.current = snapshot;
        changeCountRef.current = 0;
      } else {
        throw new Error(response.error || 'Failed to get AI suggestion');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Request cancelled') {
        console.log('[WebeenthereAI] Request cancelled');
        return;
      }
      setError(err.message || 'Failed to get AI suggestion');
      setTechnicalMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    } finally {
      setIsLoading(false);
    }
  }, [editor, isLoading, createContentSnapshot]);

  const requestUserPrompt = useCallback(async (userPrompt: string) => {
    if (!editor || isLoading) return;

    // Cancel any ongoing auto-suggestions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Disable auto-suggestions while processing user prompt
    autoSuggestEnabledRef.current = false;
    
    setIsLoading(true);
    setError(null);
    setCurrentSuggestion(null); // Clear any existing suggestion
    setTechnicalMetrics(prev => ({ ...prev, retryCount: 0, errorCount: 0 }));

    try {
      const context = gatherEditorContext(editor);
      const prompt = buildEditorContextPrompt(context, userPrompt);

      // Pass userPrompt separately so backend can store it in chat history
      const response = await callAIService(prompt, abortControllerRef, true, websiteId, currentConversationId, userPrompt);

      if (response.success && response.suggestion) {
        // Update conversation ID if provided
        if (response.conversationId) {
          setCurrentConversationId(response.conversationId);
        }

        const suggestion: AISuggestion = {
          explanation: response.suggestion.explanation,
          code: response.suggestion.code,
          isAutoExecuted: false // Will be set to true only if execution succeeds
        };
        
        setCurrentSuggestion(suggestion);
        setTechnicalMetrics(prev => ({
          ...prev,
          tokenCount: response.tokenCount || 0
        }));

        // Auto-execute user prompt results
        try {
          await executeAICode(editor, suggestion.code);
          // Only mark as auto-executed if execution succeeds
          setCurrentSuggestion(prev => prev ? { ...prev, isAutoExecuted: true } : null);
          
          // Auto-save after successful execution
          if (onAutoSave) {
            try {
              await onAutoSave();
              setSaveNotification({ type: 'success', message: 'Changes saved automatically' });
              setTimeout(() => setSaveNotification(null), 3000);
            } catch (saveError: any) {
              console.error('[WebeenthereAI] Auto-save failed:', saveError);
              setSaveNotification({ type: 'error', message: 'Changes applied but save failed. Please save manually.' });
              setTimeout(() => setSaveNotification(null), 5000);
            }
          }
        } catch (execError: any) {
          console.error('[WebeenthereAI] Code execution failed:', execError);
          setError(`Code execution failed: ${execError.message}`);
          // Keep isAutoExecuted as false so user can try to apply manually
          setCurrentSuggestion(prev => prev ? { ...prev, isAutoExecuted: false } : null);
          setTechnicalMetrics(prev => ({
            ...prev,
            errorCount: prev.errorCount + 1
          }));
        }
      } else {
        throw new Error(response.error || 'Failed to process your request');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Request cancelled') {
        console.log('[WebeenthereAI] Request cancelled');
        return;
      }
      setError(err.message || 'Failed to process your request');
      setTechnicalMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    } finally {
      setIsLoading(false);
      // Re-enable auto-suggestions after a delay
      setTimeout(() => {
        autoSuggestEnabledRef.current = true;
      }, 5000);
    }
  }, [editor, isLoading, websiteId, currentConversationId, onAutoSave]);

  const applySuggestion = useCallback(async (suggestion: AISuggestion) => {
    if (!editor || isLoading) return;

    // Disable auto-suggestions while applying
    autoSuggestEnabledRef.current = false;

    try {
      await executeAICode(editor, suggestion.code);
      setCurrentSuggestion(prev => prev ? { ...prev, isAutoExecuted: true } : null);
      
      // Auto-save after successful execution
      if (onAutoSave) {
        try {
          await onAutoSave();
          setSaveNotification({ type: 'success', message: 'Changes saved automatically' });
          setTimeout(() => setSaveNotification(null), 3000);
        } catch (saveError: any) {
          console.error('[WebeenthereAI] Auto-save failed:', saveError);
          setSaveNotification({ type: 'error', message: 'Changes applied but save failed. Please save manually.' });
          setTimeout(() => setSaveNotification(null), 5000);
        }
      }
    } catch (err: any) {
      setError(`Failed to apply suggestion: ${err.message}`);
      setTechnicalMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    } finally {
      // Re-enable auto-suggestions after a delay
      setTimeout(() => {
        autoSuggestEnabledRef.current = true;
      }, 3000);
    }
  }, [editor, onAutoSave, isLoading]);

  const retryFailedRequest = useCallback(async () => {
    if (!currentSuggestion || !editor) return;

    setIsLoading(true);
    setError(null);
    setTechnicalMetrics(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));

    try {
      const context = gatherEditorContext(editor);
      const prompt = buildEditorContextPrompt(context, 'The previous attempt failed. Please try a different approach.');

      const response = await callAIService(prompt, abortControllerRef, true, websiteId, currentConversationId);

      if (response.success && response.suggestion) {
        // Update conversation ID if provided
        if (response.conversationId) {
          setCurrentConversationId(response.conversationId);
        }

        const suggestion: AISuggestion = {
          explanation: response.suggestion.explanation,
          code: response.suggestion.code,
          isAutoExecuted: false // Will be set to true only if execution succeeds
        };
        
        setCurrentSuggestion(suggestion);
        
        try {
          await executeAICode(editor, suggestion.code);
          // Only mark as auto-executed if execution succeeds
          setCurrentSuggestion(prev => prev ? { ...prev, isAutoExecuted: true } : null);
          
          // Auto-save after successful execution
          if (onAutoSave) {
            try {
              await onAutoSave();
              setSaveNotification({ type: 'success', message: 'Changes saved automatically' });
              setTimeout(() => setSaveNotification(null), 3000);
            } catch (saveError: any) {
              console.error('[WebeenthereAI] Auto-save failed:', saveError);
              setSaveNotification({ type: 'error', message: 'Changes applied but save failed. Please save manually.' });
              setTimeout(() => setSaveNotification(null), 5000);
            }
          }
        } catch (execError: any) {
          setError(`Retry failed: ${execError.message}`);
          // Keep isAutoExecuted as false so user can try to apply manually
          setCurrentSuggestion(prev => prev ? { ...prev, isAutoExecuted: false } : null);
        }
      } else {
        throw new Error(response.error || 'Retry failed');
      }
    } catch (err: any) {
      setError(err.message || 'Retry failed');
    } finally {
      setIsLoading(false);
    }
  }, [currentSuggestion, editor, websiteId, currentConversationId, onAutoSave]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadChatHistory = useCallback(async (siteId?: string) => {
    const id = siteId || websiteId;
    if (!id) return;

    setIsLoadingHistory(true);
    try {
      const response = await apiGet(`${API_ENDPOINTS.AI_ASSISTANT_HISTORY}/${id}`);
      if (response.success && response.conversations) {
        setChatHistory(response.conversations);
      }
    } catch (err: any) {
      console.error('[WebeenthereAI] Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [websiteId]);

  const addMessageToHistory = useCallback((message: ChatMessage, conversationId: string) => {
    setChatHistory(prev => {
      const updated = [...prev];
      const convIndex = updated.findIndex(c => c.conversationId === conversationId);
      
      if (convIndex >= 0) {
        updated[convIndex] = {
          ...updated[convIndex],
          messages: [...updated[convIndex].messages, message],
          lastMessageAt: message.createdAt
        };
      } else {
        updated.push({
          conversationId,
          messages: [message],
          lastMessageAt: message.createdAt
        });
      }
      
      return updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    });
  }, []);

  // Load chat history on mount if websiteId is available
  // Only load if explicitly needed - don't auto-load on mount to avoid auth issues
  // useEffect(() => {
  //   if (websiteId) {
  //     loadChatHistory();
  //   }
  // }, [websiteId, loadChatHistory]);

  return {
    currentSuggestion,
    isLoading,
    error,
    chatHistory,
    isLoadingHistory,
    saveNotification,
    technicalMetrics,
    requestSuggestion,
    requestUserPrompt,
    applySuggestion,
    retryFailedRequest,
    cancelRequest,
    clearError,
    loadChatHistory,
    addMessageToHistory
  };
}


// Call AI service with retry logic
async function callAIService(
  prompt: string,
  abortControllerRef: React.MutableRefObject<AbortController | null>,
  isUserPrompt = false,
  websiteId?: string,
  conversationId?: string | null,
  userInput?: string,
  maxRetries = 3
): Promise<{ success: boolean; suggestion?: any; error?: string; tokenCount?: number; conversationId?: string }> {
  abortControllerRef.current = new AbortController();
  const signal = abortControllerRef.current.signal;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (signal.aborted) {
        throw new Error('Request cancelled');
      }

      // Call our backend AI service
      const response = await apiPost(API_ENDPOINTS.AI_ASSISTANT || '/api/ai/assistant', {
        prompt,
        userInput: userInput || undefined, // Send user's actual input separately for chat history
        isUserPrompt,
        website_id: websiteId,
        conversation_id: conversationId
      }, { signal });

      if (response.success) {
        return {
          success: true,
          suggestion: response.suggestion,
          tokenCount: response.tokenCount || 0,
          conversationId: response.conversationId
        };
      } else {
        throw new Error(response.error || 'AI service returned an error');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Request cancelled') {
        throw err;
      }

      if (attempt === maxRetries) {
        return {
          success: false,
          error: err.message || 'Failed after multiple attempts'
        };
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

// Gather context from the editor
function gatherEditorContext(editor: Editor) {
  const html = editor.getHtml() || '';
  const css = editor.getCss() || '';
  const selected = editor.getSelected();
  
  const selectedInfo = selected ? {
    id: selected.getId(),
    type: selected.get('type'),
    tagName: selected.get('tagName'),
    classes: (() => {
      try {
        const classes = selected.getClasses();
        if (Array.isArray(classes)) {
          // Handle both string arrays and class object arrays
          return classes.map((c: any) => {
            if (typeof c === 'string') return c;
            if (c && typeof c.getName === 'function') return c.getName();
            if (c && typeof c.get === 'function') return c.get('name') || '';
            return String(c);
          }).filter(Boolean).join(', ') || 'none';
        }
        return 'none';
      } catch (e) {
        return 'none';
      }
    })()
  } : null;

  const device = editor.getDevice() || 'Desktop';
  const devices = editor.Devices.getAll().map((d: any) => {
    const name = d.get('name');
    return typeof name === 'string' ? name : String(name || 'Desktop');
  }) as string[];

  return {
    html,
    css,
    selectedComponent: selectedInfo,
    currentDevice: device,
    availableDevices: devices,
    componentCount: editor.getComponents().length
  };
}

