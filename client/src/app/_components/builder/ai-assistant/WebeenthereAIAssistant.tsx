'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Editor } from 'grapesjs';
import { useWebeenthereAI } from './hooks/useWebeenthereAI';
import './WebeenthereAIAssistant.css';

interface WebeenthereAIAssistantProps {
  editor: Editor | null;
  isDark?: boolean;
  websiteId?: string;
  onAutoSave?: () => Promise<void>;
}

export default function WebeenthereAIAssistant({ editor, isDark = false, websiteId, onAutoSave }: WebeenthereAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    loadChatHistory
  } = useWebeenthereAI(editor, websiteId, onAutoSave);

  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || isLoading) return;

    const prompt = userInput.trim();
    
    // Add to history if not duplicate
    if (promptHistory.length === 0 || promptHistory[0] !== prompt) {
      setPromptHistory(prev => [prompt, ...prev].slice(0, 50));
    }
    setHistoryIndex(-1);
    
    requestUserPrompt(prompt);
    setUserInput('');
  }, [userInput, isLoading, promptHistory, requestUserPrompt]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < promptHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setUserInput(promptHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
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

  const handleRequestSuggestion = useCallback(() => {
    requestSuggestion();
  }, [requestSuggestion]);

  const handleApply = useCallback(() => {
    if (currentSuggestion) {
      applySuggestion(currentSuggestion);
    }
  }, [currentSuggestion, applySuggestion]);

  const handleRetry = useCallback(() => {
    if (currentSuggestion) {
      retryFailedRequest();
    }
  }, [currentSuggestion, retryFailedRequest]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
            <button onClick={clearError} className="error-dismiss">×</button>
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
            <button onClick={cancelRequest} className="cancel-btn">Cancel</button>
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
              <p>{currentSuggestion.explanation}</p>
            </div>

            <div className="suggestion-actions">
              {!currentSuggestion.isAutoExecuted && (
                <>
                  <button onClick={handleApply} className="btn-primary">
                    Apply
                  </button>
                  <button onClick={handleRetry} className="btn-secondary">
                    Decline
                  </button>
                </>
              )}
              {currentSuggestion.isAutoExecuted && (
                <button onClick={handleRetry} className="btn-secondary">
                  Try Different Approach
                </button>
              )}
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
              <button onClick={handleRequestSuggestion} className="btn-secondary">
                Get Suggestions
              </button>
            </div>
          </div>
        )}

        {/* Chat History Section */}
        {websiteId && (
          <div className="webeenthere-ai-chat-history">
            <button 
              className="chat-history-toggle"
              onClick={() => {
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
                                      return <p>{parsed.explanation || 'AI response'}</p>;
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

        <div className="webeenthere-ai-input-section">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to make changes... (e.g., 'make the header blue')"
            disabled={isLoading}
            className="webeenthere-ai-input"
          />
          
          <div className="webeenthere-ai-buttons">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !userInput.trim()}
              className="btn-primary"
            >
              {isLoading ? 'Processing...' : 'Ask AI'}
            </button>
            <button
              onClick={handleRequestSuggestion}
              disabled={isLoading}
              className="btn-secondary"
            >
              Suggest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

