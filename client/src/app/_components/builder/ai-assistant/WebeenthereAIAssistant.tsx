'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Editor } from 'grapesjs';
import { useWebeenthereAI } from './hooks/useWebeenthereAI';
import { subscriptionApi } from '../../../../lib/subscriptionApi';
import { useRouter } from 'next/navigation';
import './WebeenthereAIAssistant.css';

// Helper function to simplify technical explanations for non-technical users
function simplifyExplanation(explanation: string): string {
  if (!explanation) return explanation;
  
  // Replace technical terms with simpler language
  let simplified = explanation
    // Technical terms
    .replace(/component\(s\)/gi, 'element(s)')
    .replace(/component's/gi, "element's")
    .replace(/component/gi, 'element')
    .replace(/property/gi, 'setting')
    .replace(/GrapesJS API/gi, 'the editor')
    .replace(/GrapesJS/gi, 'the editor')
    .replace(/selector/gi, 'element')
    .replace(/DOM/gi, 'page')
    .replace(/append/gi, 'add')
    .replace(/modify/gi, 'change')
    .replace(/modifies/gi, 'changes')
    .replace(/modifying/gi, 'changing')
    .replace(/modification/gi, 'change')
    .replace(/preserving the full structure/gi, 'keeping everything else the same')
    .replace(/without removing, replacing, or adding new components/gi, 'without changing anything else')
    .replace(/This modifies the existing/gi, 'This changes the existing')
    .replace(/Locate the/gi, 'I found the')
    .replace(/then append/gi, 'and added')
    .replace(/then/gi, 'and')
    .replace(/Chose/gi, 'I chose')
    .replace(/as a fitting symbol/gi, 'as a good symbol')
    .replace(/full-stack developer/gi, 'developer');
  
  // Remove overly technical phrases
  simplified = simplified
    .replace(/using component\.set\(\)/gi, '')
    .replace(/by calling component\.set\(\)/gi, '')
    .replace(/via component\.set\(\)/gi, '')
    .replace(/component\.set\('content',/gi, '')
    .replace(/\.get\('content'\)/gi, '')
    .replace(/\(navbar\)/gi, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
  
  // Clean up extra spaces
  simplified = simplified.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  if (simplified.length > 0) {
    simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1);
  }
  
  return simplified;
}

interface WebeenthereAIAssistantProps {
  editor: Editor | null;
  isDark?: boolean;
  websiteId?: string;
  onAutoSave?: () => Promise<void>;
  onPreview?: () => void;
  getHtml?: () => string;
  getCss?: () => string;
  onStoreOriginalContent?: (html: string, css: string) => void;
}

export default function WebeenthereAIAssistant({ editor, isDark = false, websiteId, onAutoSave, onPreview, getHtml, getCss, onStoreOriginalContent }: WebeenthereAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [aiChatLimits, setAiChatLimits] = useState<{ canUse: boolean; remaining: number; limit: number; used?: number; nextResetDate?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
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
    loadChatHistory
  } = useWebeenthereAI(editor, websiteId, onAutoSave, getHtml, getCss, onStoreOriginalContent);

  // Fetch AI chat limits when component opens and when limit is reached
  useEffect(() => {
    if (isOpen) {
      const fetchLimits = async () => {
        try {
          const response = await subscriptionApi.checkLimits();
          if (response.success && response.data) {
            setAiChatLimits(response.data.aiChat);
          }
        } catch (err) {
          console.error('Failed to fetch AI chat limits:', err);
        }
      };
      fetchLimits();
      
      // Listen for AI limit reached events to refresh limits
      const handleLimitReached = () => {
        fetchLimits();
      };
      window.addEventListener('aiLimitReached', handleLimitReached);
      
      return () => {
        window.removeEventListener('aiLimitReached', handleLimitReached);
      };
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!userInput.trim() || isLoading) return;
    
    // Check if AI chat limit is reached
    if (aiChatLimits && !aiChatLimits.canUse) {
      return; // Don't submit if limit is reached
    }

    const prompt = userInput.trim();
    
    // Add to history if not duplicate
    if (promptHistory.length === 0 || promptHistory[0] !== prompt) {
      setPromptHistory(prev => [prompt, ...prev].slice(0, 50));
    }
    setHistoryIndex(-1);
    
    requestUserPrompt(prompt);
    setUserInput('');
    
    // Refresh limits after request
    setTimeout(async () => {
      try {
        const response = await subscriptionApi.checkLimits();
        if (response.success && response.data) {
          setAiChatLimits(response.data.aiChat);
        }
      } catch (err) {
        console.error('Failed to refresh limits:', err);
      }
    }, 1000);
  }, [userInput, isLoading, promptHistory, requestUserPrompt, aiChatLimits]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      if (historyIndex < promptHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setUserInput(promptHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setUserInput(promptHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setUserInput('');
      }
    }
  }, [handleSubmit, historyIndex, promptHistory]);

  const handleRequestSuggestion = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Check if AI chat limit is reached
    if (aiChatLimits && !aiChatLimits.canUse) {
      return; // Don't request if limit is reached
    }
    requestSuggestion();
    
    // Refresh limits after request
    setTimeout(async () => {
      try {
        const response = await subscriptionApi.checkLimits();
        if (response.success && response.data) {
          setAiChatLimits(response.data.aiChat);
        }
      } catch (err) {
        console.error('Failed to refresh limits:', err);
      }
    }, 1000);
  }, [requestSuggestion, aiChatLimits]);

  const handleApply = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentSuggestion) {
      // Instead of directly applying, send the suggestion as a user prompt
      // This allows the AI to execute the suggestion through the normal prompt flow
      const suggestionPrompt = currentSuggestion.explanation || 'Apply the suggested changes';
      
      // Clear the current suggestion first
      clearSuggestion();
      
      // Automatically send the suggestion as a user prompt
      // This will trigger the AI to actually make the changes
      requestUserPrompt(suggestionPrompt);
    }
  }, [currentSuggestion, clearSuggestion, requestUserPrompt]);

  const handleDecline = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Simply dismiss/clear the suggestion without doing anything
    clearSuggestion();
  }, [clearSuggestion]);

  const handleRetry = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentSuggestion) {
      retryFailedRequest();
    }
  }, [currentSuggestion, retryFailedRequest]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Track selected component
  useEffect(() => {
    if (!editor) return;

    const handleComponentSelected = (component: any) => {
      setSelectedComponent(component);
    };

    // Get initial selection - safely handle if editor isn't fully initialized
    try {
      const initial = editor.getSelected();
      if (initial) {
        setSelectedComponent(initial);
      }
    } catch (e) {
      // Editor not fully initialized yet - ignore
      console.warn('[WebeenthereAIAssistant] Could not get initial selection:', e);
    }

    editor.on('component:selected', handleComponentSelected);

    return () => {
      editor.off('component:selected', handleComponentSelected);
    };
  }, [editor]);

  // Get selected component info for display
  const getSelectedComponentInfo = () => {
    if (!selectedComponent) return null;
    
    try {
      const tagName = selectedComponent.get('tagName') || 'element';
      const type = selectedComponent.get('type') || '';
      const id = selectedComponent.getId() || '';
      const classes = selectedComponent.getClasses() || [];
      const classNames = Array.isArray(classes) 
        ? classes.map((c: any) => typeof c === 'string' ? c : (c?.getName?.() || c?.get?.('name') || '')).filter(Boolean).join(', ')
        : '';
      
      return {
        tagName,
        type,
        id,
        classNames: classNames || 'no classes',
        displayName: id || classNames || tagName || 'Selected element'
      };
    } catch (e) {
      return null;
    }
  };

  const selectedInfo = getSelectedComponentInfo();

  if (!isOpen) {
    return (
      <button
        className={`webeenthere-ai-toggle ${isDark ? 'dark' : ''}`}
        onClick={() => setIsOpen(true)}
        title="Open AI Assistant"
        aria-label="Open AI Assistant"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span>AI Assistant</span>
      </button>
    );
  }

  return (
    <div className={`webeenthere-ai-panel ${isDark ? 'dark' : ''}`}>
      <div className="webeenthere-ai-header">
        <h3>AI Assistant</h3>
        <button
          className="webeenthere-ai-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close AI Assistant"
        >
          ×
        </button>
      </div>

      <div className="webeenthere-ai-content">
        {/* Show selected component info */}
        {selectedInfo && (
          <div className="webeenthere-ai-selected-component" style={{
            padding: '8px 12px',
            marginBottom: '12px',
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
            borderRadius: '6px',
            fontSize: '12px',
            color: isDark ? '#93c5fd' : '#1e40af'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎯</span>
              <strong>Editing:</strong>
              <span>{selectedInfo.displayName}</span>
              <span style={{ opacity: 0.7, fontSize: '11px' }}>({selectedInfo.tagName})</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
              AI will only modify this selected section
            </div>
          </div>
        )}

        {saveNotification && (
          <div className={`webeenthere-ai-notification ${saveNotification.type === 'success' ? 'success' : 'error'}`}>
            <span>{saveNotification.type === 'success' ? '✓' : '⚠'}</span>
            <p>{saveNotification.message}</p>
          </div>
        )}

        {error && (
          <div className="webeenthere-ai-error">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <p className="error-title">Unable to complete request</p>
              <p className="error-message">
                {error.includes('Component not found') || error.includes('No components found')
                  ? "I couldn't find that element. Try selecting it first or check the element name."
                  : error.includes('Code execution failed') || error.includes('No changes were made')
                  ? "I couldn't make that change. Please try rephrasing your request or selecting the element first."
                  : error.includes('Failed to process')
                  ? "Something went wrong. Let me try a different approach."
                  : error}
              </p>
              {error.includes('Component not found') && (
                <p className="error-suggestion">💡 Tip: Select the element you want to modify, then try again.</p>
              )}
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearError();
              }} 
              className="error-dismiss"
            >
              ×
            </button>
          </div>
        )}

        {isLoading && (
          <div className="webeenthere-ai-loading">
            <div className="loading-steps">
              <div className="spinner"></div>
              <div className="loading-text">
                <p className="loading-step active">Analyzing your website...</p>
                <p className="loading-step">Generating suggestions...</p>
                <p className="loading-step">Applying changes...</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                cancelRequest();
              }} 
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        )}

        {currentSuggestion && !isLoading && (
          <div className="webeenthere-ai-suggestion">
            <div className="suggestion-header">
              <div className="suggestion-title">
                <span className="suggestion-icon">
                  {currentSuggestion.isAutoExecuted ? '✓' : '💡'}
                </span>
                <h4>
                  {currentSuggestion.isAutoExecuted ? 'Applied Successfully' : 'AI Suggestion'}
                </h4>
              </div>
              {technicalMetrics && technicalMetrics.errorCount === 0 && (
                <div className="technical-metrics" title="Technical details">
                  <span className="metric-badge tokens">
                    {technicalMetrics.tokenCount} tokens
                  </span>
                </div>
              )}
            </div>
            
            <div className="suggestion-explanation">
              <p>{simplifyExplanation(currentSuggestion.explanation)}</p>
            </div>

            <div className="suggestion-actions">
              {!currentSuggestion.isAutoExecuted && (
                <>
                  <button 
                    type="button"
                    onClick={handleApply} 
                    className="btn-primary"
                  >
                    Apply
                  </button>
                  <button 
                    type="button"
                    onClick={handleDecline} 
                    className="btn-secondary"
                  >
                    Decline
                  </button>
                </>
              )}
              {currentSuggestion.isAutoExecuted && (
                <>
                  {onPreview && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onPreview) onPreview();
                      }} 
                      className="btn-primary"
                    >
                      View Preview
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={handleRetry} 
                    className="btn-secondary"
                  >
                    Try Different Approach
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* AI Chat Limit Reached Banner */}
        {aiChatLimits && !aiChatLimits.canUse && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-700 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">AI Message Limit Reached</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  You've used all {aiChatLimits.used || 0} of your {aiChatLimits.limit} AI messages for this month.
                  {aiChatLimits.nextResetDate && (
                    <span> Your limit will reset on {new Date(aiChatLimits.nextResetDate).toLocaleDateString()}.</span>
                  )}
                </p>
                <button
                  onClick={() => router.push('/user/subscription')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentSuggestion && !isLoading && (
          <div className="webeenthere-ai-welcome">
            <div className="welcome-header">
              <h4>AI Assistant</h4>
              <p>I can help you improve your website</p>
            </div>
            <div className="welcome-examples">
              <p className="examples-title">Try asking me to:</p>
              <ul>
                <li>Change colors or styles</li>
                <li>Fix typos or improve text</li>
                <li>Add or modify elements</li>
                <li>Improve layout and spacing</li>
              </ul>
            </div>
            <div className="welcome-actions">
              <button 
                type="button"
                onClick={handleRequestSuggestion} 
                className="btn-secondary"
                disabled={aiChatLimits && !aiChatLimits.canUse}
              >
                Get Suggestions
              </button>
            </div>
          </div>
        )}

        {/* Chat History Section */}
        {websiteId && (
          <div className="webeenthere-ai-chat-history">
            <button 
              type="button"
              className="chat-history-toggle"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowChatHistory(!showChatHistory);
                if (!showChatHistory && chatHistory.length === 0) {
                  loadChatHistory();
                }
              }}
            >
              <span>{showChatHistory ? '▼' : '▶'}</span>
              <span>Chat History</span>
              {chatHistory.length > 0 && (
                <span className="history-count">{chatHistory.length}</span>
              )}
            </button>
            
            {showChatHistory && (
              <div className="chat-history-content">
                {isLoadingHistory ? (
                  <div className="chat-history-loading">Loading history...</div>
                ) : chatHistory.length === 0 ? (
                  <div className="chat-history-empty">No chat history yet</div>
                ) : (
                  <div className="chat-history-list">
                    {chatHistory.map((conversation) => (
                      <div key={conversation.conversationId} className="conversation">
                        {conversation.messages.map((message, idx) => (
                          <div 
                            key={message.id} 
                            className={`chat-message ${message.messageType}`}
                          >
                            <div className="message-content">
                              {message.messageType === 'user' ? (
                                <p>{message.promptText}</p>
                              ) : (
                                <>
                                  {message.responseHtml && (() => {
                                    try {
                                      const parsed = JSON.parse(message.responseHtml);
                                      return <p>{simplifyExplanation(parsed.explanation || 'AI response')}</p>;
                                    } catch {
                                      return <p>AI response</p>;
                                    }
                                  })()}
                                  {message.executionStatus && (
                                    <span className={`execution-status ${message.executionStatus}`}>
                                      {message.executionStatus === 'success' ? '✓ Applied' : 
                                       message.executionStatus === 'failed' ? '✗ Failed' : 
                                       '⏳ Pending'}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="message-time">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form 
          className="webeenthere-ai-input-section"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(e);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => {
              e.stopPropagation();
              setUserInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            placeholder={aiChatLimits && !aiChatLimits.canUse ? "AI limit reached - Upgrade to continue" : "Ask AI to make changes... (e.g., 'make the header blue')"}
            disabled={isLoading || (aiChatLimits && !aiChatLimits.canUse)}
            className="webeenthere-ai-input"
            style={aiChatLimits && !aiChatLimits.canUse ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          />
          
          <div className="webeenthere-ai-buttons">
            <button
              type="submit"
              disabled={isLoading || !userInput.trim() || (aiChatLimits && !aiChatLimits.canUse)}
              className="btn-primary"
            >
              {isLoading ? 'Processing...' : 'Ask AI'}
            </button>
            <button
              type="button"
              onClick={handleRequestSuggestion}
              disabled={isLoading || (aiChatLimits && !aiChatLimits.canUse)}
              className="btn-secondary"
            >
              Suggest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

