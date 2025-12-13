import { useState, useCallback, useRef, useEffect } from 'react';
import type { Editor } from 'grapesjs';
import { API_ENDPOINTS, apiPost, apiGet, apiPut } from '../../../../../lib/apiConfig';
import { buildEditorContextPrompt } from '../utils/promptBuilder';
import { executeAICode, bruteForceUpdateHTML } from '../utils/codeExecutor';

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

export function useWebeenthereAI(
  editor: Editor | null, 
  websiteId?: string, 
  onAutoSave?: () => Promise<void>,
  getHtml?: () => string,
  getCss?: () => string,
  onStoreOriginalContent?: (html: string, css: string) => void
) {
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
  const autoSuggestEnabledRef = useRef(false); // Disabled by default - only suggest when user explicitly requests

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
              // Keep auto-suggest disabled - only suggest when user explicitly requests
              // Don't re-enable auto-suggestions
              // autoSuggestEnabledRef.current = true;
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
      
      // Get HTML and CSS to send to AI
      const currentHtml = getHtml ? getHtml() : editor.getHtml();
      const currentCss = getCss ? getCss() : editor.getCss();
      
      const prompt = buildEditorContextPrompt(context, null);

      const response = await callAIService(prompt, abortControllerRef, false, websiteId, currentConversationId, undefined, currentHtml, currentCss);

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
      
      // Get HTML and CSS to send to AI
      const currentHtml = getHtml ? getHtml() : editor.getHtml();
      const currentCss = getCss ? getCss() : editor.getCss();
      
      console.log('[WebeenthereAI] Sending HTML/CSS to AI:', {
        htmlLength: currentHtml.length,
        cssLength: (currentCss || '').length
      });
      
      const prompt = buildEditorContextPrompt(context, userPrompt);

      // Pass userPrompt separately so backend can store it in chat history
      // Also pass HTML/CSS content
      const response = await callAIService(
        prompt, 
        abortControllerRef, 
        true, 
        websiteId, 
        currentConversationId, 
        userPrompt,
        currentHtml,
        currentCss
      );

      if (response.success && response.suggestion) {
        // Update conversation ID if provided
        if (response.conversationId) {
          setCurrentConversationId(response.conversationId);
        }

        // Check if AI returned HTML/CSS directly (new format) or code (legacy format)
        const hasHtmlContent = !!response.suggestion.html_content;
        const hasCssContent = !!response.suggestion.css_content;
        
        console.log('[WebeenthereAI] AI Response:', {
          hasHtmlContent,
          hasCssContent,
          hasCode: !!response.suggestion.code,
          explanation: response.suggestion.explanation
        });

        if (hasHtmlContent || hasCssContent) {
          // NEW FORMAT: AI returned modified HTML/CSS directly
          console.log('[WebeenthereAI] Using new format - AI returned HTML/CSS directly');
          
          try {
            // Get the modified HTML and CSS from AI response
            const modifiedHtml = response.suggestion.html_content || (getHtml ? getHtml() : editor.getHtml());
            const modifiedCss = response.suggestion.css_content || (getCss ? getCss() : editor.getCss());
            
            console.log('[WebeenthereAI] Modified HTML length:', modifiedHtml.length);
            console.log('[WebeenthereAI] Modified CSS length:', modifiedCss.length);
            
            // CRITICAL: Store original AI-generated HTML/CSS before setting in editor
            // This preserves the exact structure before GrapesJS normalization
            if (onStoreOriginalContent) {
              onStoreOriginalContent(modifiedHtml, modifiedCss);
              console.log('[WebeenthereAI] Stored original AI-generated content for structure preservation');
            }
            
            // Update the editor with the modified HTML/CSS
            editor.setComponents(modifiedHtml);
            editor.setStyle(modifiedCss);
            
            // Force canvas updates
            editor.trigger('component:update');
            editor.trigger('update');
            editor.trigger('canvas:update');
            
            // Auto-save to database
            if (websiteId) {
              try {
                const layout = JSON.stringify({ html: modifiedHtml, css: modifiedCss });
                const saveResponse = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, {
                  html_content: layout,
                  css_content: modifiedCss,
                });
                
                if (saveResponse.success) {
                  console.log('[WebeenthereAI] ✅ Saved modified HTML/CSS to database');
                  setSaveNotification({ type: 'success', message: 'Changes applied and saved automatically' });
                  setTimeout(() => setSaveNotification(null), 3000);
                } else {
                  throw new Error(saveResponse.message || 'Failed to save');
                }
              } catch (saveError: any) {
                console.error('[WebeenthereAI] Auto-save failed:', saveError);
                setSaveNotification({ type: 'error', message: 'Changes applied but save failed. Please save manually.' });
                setTimeout(() => setSaveNotification(null), 5000);
              }
            } else if (onAutoSave) {
              // Fallback to onAutoSave if available
              await onAutoSave();
              setSaveNotification({ type: 'success', message: 'Changes applied and saved automatically' });
              setTimeout(() => setSaveNotification(null), 3000);
            }
            
            // Set suggestion for display
            setCurrentSuggestion({
              explanation: response.suggestion.explanation,
              code: '', // No code in new format (empty string instead of null)
              isAutoExecuted: true
            });
            
            setTechnicalMetrics(prev => ({
              ...prev,
              tokenCount: response.tokenCount || 0
            }));
            
          } catch (error: any) {
            console.error('[WebeenthereAI] Failed to apply HTML/CSS changes:', error);
            setError(`Failed to apply changes: ${error.message}`);
            setCurrentSuggestion({
              explanation: response.suggestion.explanation,
              code: '', // No code in new format
              isAutoExecuted: false
            });
          }
        } else {
          // LEGACY FORMAT: AI returned code (backward compatibility)
          console.log('[WebeenthereAI] Using legacy format - AI returned code');
          
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

          // Auto-execute user prompt results (legacy code execution)
          try {
            // Get selected component to scope edits
            const selectedComponent = editor.getSelected();
            
            // Try normal execution first
            let executionSuccess = false;
          try {
            await executeAICode(editor, suggestion.code, selectedComponent, undefined, getHtml, getCss);
            executionSuccess = true;
          } catch (execError: any) {
            console.warn('[WebeenthereAI] Normal execution failed, trying brute force approach...', execError);
            
            // BRUTE FORCE FALLBACK: Try to extract what the AI wants to do and do it directly
            // Parse the AI's explanation to understand what it wants to change
            const explanation = suggestion.explanation.toLowerCase();
            const code = suggestion.code;
            
            // Try to extract text changes from explanation
            if (explanation.includes('change') || explanation.includes('update') || explanation.includes('modify') || explanation.includes('farm name')) {
              try {
                // Extract the target text and new text from explanation
                // Use the ORIGINAL explanation (not lowercased) for better pattern matching
                const originalExplanation = suggestion.explanation;
                console.log('[WebeenthereAI] Brute force: Original explanation:', originalExplanation);
                
                let newText = null;
                let oldText = null;
                
                // Try multiple patterns to extract the new text (use original case for better matching)
                const patterns = [
                  // "changed the farm name to 'X'"
                  /changed?\s+(?:the\s+)?farm\s+name\s+(?:in\s+the\s+header\s+)?to\s+['"]([^'"]+)['"]/i,
                  // "change the farm name to 'X'"
                  /change\s+(?:the\s+)?farm\s+name\s+(?:in\s+the\s+header\s+)?to\s+['"]([^'"]+)['"]/i,
                  // "changed to 'X'"
                  /changed?\s+to\s+['"]([^'"]+)['"]/i,
                  // "change to 'X'"
                  /change\s+to\s+['"]([^'"]+)['"]/i,
                  // "from 'X' to 'Y'"
                  /from\s+['"]([^'"]+)['"]\s+to\s+['"]([^'"]+)['"]/i,
                  // "to 'X'" (last resort - just get what comes after "to")
                  /to\s+['"]([^'"]+)['"]/i,
                ];
                
                for (const pattern of patterns) {
                  const match = originalExplanation.match(pattern);
                  if (match) {
                    if (match.length > 2) {
                      // Pattern with "from X to Y"
                      oldText = match[1];
                      newText = match[2];
                      console.log('[WebeenthereAI] Brute force: Matched pattern with from/to:', { oldText, newText });
                    } else {
                      // Pattern with just "to Y"
                      newText = match[1];
                      console.log('[WebeenthereAI] Brute force: Matched pattern with to:', { newText });
                    }
                    break;
                  }
                }
                
                // If we found new text, apply the change
                if (newText) {
                  console.log('[WebeenthereAI] Brute force: Attempting to change text', { oldText, newText });
                  
                  // Get current HTML using the custom getHtml if available
                  const currentHtml = getHtml ? getHtml() : editor.getHtml();
                  console.log('[WebeenthereAI] Brute force: Current HTML length:', currentHtml.length);
                  console.log('[WebeenthereAI] Brute force: Current HTML preview:', currentHtml.substring(0, 200));
                  
                  // Check if slot-farm-name exists in HTML
                  const farmNameCheck = currentHtml.match(/id=["']slot-farm-name["'][^>]*>([^<]+)</i);
                  if (farmNameCheck) {
                    console.log('[WebeenthereAI] Brute force: Found current farm name in HTML:', farmNameCheck[1]);
                  } else {
                    console.warn('[WebeenthereAI] Brute force: Could not find slot-farm-name in HTML');
                    // Try to find "Oink Acres" anywhere in the HTML
                    const oinkCheck = currentHtml.match(/(Oink\s+Acres[^<]*)/i);
                    if (oinkCheck) {
                      console.log('[WebeenthereAI] Brute force: Found "Oink Acres" in HTML:', oinkCheck[1]);
                    }
                  }
                  
                  // Try to find and replace in HTML
                  const htmlModifier = (html: string) => {
                    console.log('[WebeenthereAI] Brute force: Modifying HTML, length:', html.length);
                    
                    // First, try to find the slot-farm-name element specifically
                    // This pattern matches the opening tag, any content (including nested elements), and closing tag
                    const farmNamePattern = /(<[^>]*id=["']slot-farm-name["'][^>]*>)([\s\S]*?)(<\/[^>]+>)/i;
                    const farmNameMatch = html.match(farmNamePattern);
                    
                    if (farmNameMatch) {
                      // Replace content inside the slot-farm-name element
                      const beforeTag = farmNameMatch[1];
                      const currentContent = farmNameMatch[2];
                      const afterTag = farmNameMatch[3];
                      
                      // Extract just the text content (remove any nested HTML tags)
                      const textContent = currentContent.replace(/<[^>]+>/g, '').trim();
                      
                      console.log('[WebeenthereAI] Brute force: Found slot-farm-name', { 
                        beforeTag: beforeTag.substring(0, 50),
                        currentContent: textContent,
                        newText 
                      });
                      
                      // Replace the entire content with just the new text
                      const newHtml = html.replace(farmNamePattern, `${beforeTag}${newText}${afterTag}`);
                      console.log('[WebeenthereAI] Brute force: Replaced farm name', { 
                        old: textContent, 
                        new: newText,
                        htmlChanged: html !== newHtml,
                        newHtmlPreview: newHtml.substring(0, 200)
                      });
                      return newHtml;
                    }
                    
                    // Fallback: try to find and replace old text if we have it
                    if (oldText && html.includes(oldText)) {
                      const escapedOldText = oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      const replaced = html.replace(new RegExp(escapedOldText, 'gi'), newText);
                      console.log('[WebeenthereAI] Brute force: Replaced using oldText pattern', {
                        oldText,
                        newText,
                        htmlChanged: html !== replaced
                      });
                      return replaced;
                    }
                    
                    // Last resort: find any element containing "Oink" and replace the text after it
                    // Look for text nodes containing "Oink Acres" and replace the rest
                    const oinkPattern = /(>)([^<]*Oink\s+Acres[^<]*)(<)/gi;
                    const replaced = html.replace(oinkPattern, (match, before, content, after) => {
                      // Replace everything after "Oink Acres" with the new text
                      const newContent = content.replace(/Oink\s+Acres[^<]*/i, newText);
                      console.log('[WebeenthereAI] Brute force: Replaced using Oink pattern', {
                        oldContent: content,
                        newContent
                      });
                      return before + newContent + after;
                    });
                    
                    if (replaced !== html) {
                      console.log('[WebeenthereAI] Brute force: Replaced using Oink/Acres pattern');
                      return replaced;
                    }
                    
                    console.warn('[WebeenthereAI] Brute force: Could not find target in HTML');
                    console.warn('[WebeenthereAI] Brute force: HTML preview:', html.substring(0, 500));
                    return html; // No change if we can't find the target
                  };
                  
                  // Create a save callback that uses the modified HTML directly
                  // We need to save the modified HTML, not re-read from editor
                  const saveCallback = async (modifiedHtml: string, modifiedCss: string) => {
                    console.log('[WebeenthereAI] Brute force: Save callback called with modified HTML');
                    console.log('[WebeenthereAI] Brute force: Modified HTML length:', modifiedHtml.length);
                    console.log('[WebeenthereAI] Brute force: Checking if farm name was replaced...');
                    
                    // Check if the replacement actually happened
                    const farmNameCheck = modifiedHtml.match(/id=["']slot-farm-name["'][^>]*>([^<]+)</i);
                    if (farmNameCheck) {
                      console.log('[WebeenthereAI] Brute force: Farm name in modified HTML:', farmNameCheck[1]);
                      if (farmNameCheck[1].includes(newText)) {
                        console.log('[WebeenthereAI] ✅ Brute force: Replacement confirmed in HTML!');
                      } else {
                        console.warn('[WebeenthereAI] ⚠️ Brute force: Replacement NOT found in modified HTML!');
                      }
                    }
                    
                    // Save using the modified HTML directly
                    // We need to call the save function that accepts HTML/CSS parameters
                    // Since onAutoSave doesn't accept parameters, we'll need to save directly
                    if (websiteId) {
                      try {
                        const layout = JSON.stringify({ html: modifiedHtml, css: modifiedCss });
                        
                        const response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, {
                          html_content: layout,
                          css_content: modifiedCss,
                        });
                        
                        if (response.success) {
                          console.log('[WebeenthereAI] ✅ Brute force: Saved modified HTML to database');
                        } else {
                          throw new Error(response.message || 'Failed to save');
                        }
                      } catch (saveError: any) {
                        console.error('[WebeenthereAI] ❌ Brute force: Save failed:', saveError);
                        throw saveError;
                      }
                    } else if (onAutoSave) {
                      // Fallback: try onAutoSave if no websiteId
                      console.warn('[WebeenthereAI] No websiteId, using onAutoSave (may get old HTML)');
                      await onAutoSave();
                    }
                  };
                  
                  const bruteForceSuccess = await bruteForceUpdateHTML(editor, htmlModifier, saveCallback);
                  
                  if (bruteForceSuccess) {
                    executionSuccess = true;
                    console.log('[WebeenthereAI] ✅ Brute force update succeeded');
                  } else {
                    console.warn('[WebeenthereAI] ⚠️ Brute force update returned false');
                  }
                } else {
                  console.warn('[WebeenthereAI] Could not extract new text from explanation:', originalExplanation);
                }
              } catch (bruteError: any) {
                console.error('[WebeenthereAI] Brute force also failed:', bruteError);
              }
            }
          }
          
          if (executionSuccess) {
            // Wait a bit more to ensure editor state is fully updated and visible
            await new Promise(resolve => {
              requestAnimationFrame(() => {
                setTimeout(resolve, 200);
              });
            });
            
            // Force one more update to ensure changes are visible in canvas
            editor.trigger('component:update');
            editor.trigger('update');
            editor.trigger('canvas:update');
            
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
          } else {
            throw new Error('Both normal execution and brute force failed');
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
        }
      } else {
        throw new Error(response.error || 'Failed to process your request');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Request cancelled') {
        console.log('[WebeenthereAI] Request cancelled');
        return;
      }
      
      // Handle AI chat limit reached error
      if (err.errorCode === 'AI_CHAT_LIMIT_REACHED' || err.message?.includes('AI chat limit reached')) {
        setError('AI message limit reached. Please upgrade your plan to continue using AI features.');
        // Trigger a custom event to notify parent component to refresh limits
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aiLimitReached'));
        }
      } else {
        setError(err.message || 'Failed to process your request');
      }
      
      setTechnicalMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    } finally {
      setIsLoading(false);
      // Keep auto-suggestions disabled - only suggest when user explicitly requests
      // Don't re-enable auto-suggestions
      // setTimeout(() => {
      //   autoSuggestEnabledRef.current = true;
      // }, 5000);
    }
  }, [editor, isLoading, websiteId, currentConversationId, onAutoSave, getHtml, getCss]);

  const applySuggestion = useCallback(async (suggestion: AISuggestion) => {
    if (!editor || isLoading) return;

    // Disable auto-suggestions while applying
    autoSuggestEnabledRef.current = false;

    try {
      // Get selected component to scope edits
      const selectedComponent = editor.getSelected();
      // executeAICode will automatically save if changes are detected
      await executeAICode(editor, suggestion.code, selectedComponent, onAutoSave, getHtml, getCss);
      
      // Wait a bit more to ensure editor state is fully updated and visible
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 200);
        });
      });
      
      // Force one more update to ensure changes are visible in canvas
      editor.trigger('component:update');
      editor.trigger('update');
      editor.trigger('canvas:update');
      
      setCurrentSuggestion(prev => prev ? { ...prev, isAutoExecuted: true } : null);
      
      // Show success notification (save is handled by executeAICode)
      setSaveNotification({ type: 'success', message: 'Changes applied and saved automatically' });
      setTimeout(() => setSaveNotification(null), 3000);
    } catch (err: any) {
      setError(`Failed to apply suggestion: ${err.message}`);
      setTechnicalMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    } finally {
      // Keep auto-suggestions disabled - only suggest when user explicitly requests
      // Don't re-enable auto-suggestions
      // setTimeout(() => {
      //   autoSuggestEnabledRef.current = true;
      // }, 3000);
    }
  }, [editor, onAutoSave, isLoading, getHtml, getCss]);

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
          const selectedComponent = editor.getSelected();
          await executeAICode(editor, suggestion.code, selectedComponent, onAutoSave, getHtml, getCss);
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

  const clearSuggestion = useCallback(() => {
    setCurrentSuggestion(null);
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
    clearSuggestion,
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
  htmlContent?: string,
  cssContent?: string,
  maxRetries = 3
): Promise<{ success: boolean; suggestion?: any; error?: string; tokenCount?: number; conversationId?: string }> {
  abortControllerRef.current = new AbortController();
  const signal = abortControllerRef.current.signal;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (signal.aborted) {
        throw new Error('Request cancelled');
      }

      // Get current HTML and CSS to send to AI
      let currentHtml = '';
      let currentCss = '';
      
      // Try to get HTML/CSS from custom functions if available (passed from parent)
      // We'll need to get these from the editor context
      // For now, we'll get them from the prompt context or pass them separately
      
      // Call our backend AI service with HTML/CSS content
      const response = await apiPost(API_ENDPOINTS.AI_ASSISTANT || '/api/ai/assistant', {
        prompt,
        userInput: userInput || undefined, // Send user's actual input separately for chat history
        isUserPrompt,
        website_id: websiteId,
        conversation_id: conversationId,
        html_content: htmlContent || undefined,
        css_content: cssContent || undefined
      }, { signal });

      if (response.success) {
        return {
          success: true,
          suggestion: response.suggestion,
          tokenCount: response.tokenCount || 0,
          conversationId: response.conversationId
        };
      } else {
        // Check if it's an AI limit error
        if (response.errorCode === 'AI_CHAT_LIMIT_REACHED' || response.error?.includes('AI chat limit reached')) {
          const limitError: any = new Error(response.error || 'AI chat limit reached');
          limitError.errorCode = 'AI_CHAT_LIMIT_REACHED';
          limitError.currentUsage = response.currentUsage;
          limitError.upgradeRequired = response.upgradeRequired;
          throw limitError;
        }
        throw new Error(response.error || 'AI service returned an error');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Request cancelled') {
        throw err;
      }
      
      // If it's an AI limit error, don't retry - throw immediately
      if (err.errorCode === 'AI_CHAT_LIMIT_REACHED') {
        throw err;
      }

      if (attempt === maxRetries) {
        return {
          success: false,
          error: err.message || 'Failed after multiple attempts',
          errorCode: err.errorCode
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

