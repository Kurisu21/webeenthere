'use client';

import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS, apiPost } from '../../lib/apiConfig';
import GrapesJSEditor from '../_components/builder/GrapesJSEditor';
import { loadTemplateToGrapes } from '../_components/builder/utils/templateToGrapes';

export default function TestAIGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [rawResponse]);

  const handleEditorInit = (editorInstance: any) => {
    setEditor(editorInstance);
    console.log('Editor initialized:', editorInstance);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setRawResponse('');
    setParsedData(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call simplified AI endpoint
      const response = await apiPost(
        API_ENDPOINTS.GENERATE_TEMPLATE,
        {
          description: prompt.trim(),
          websiteType: undefined, // No type restriction
          simpleMode: true // Flag for simplified prompt
        },
        { token }
      );

      if (response.success && response.template) {
        // Show raw response
        setRawResponse(JSON.stringify(response, null, 2));
        
        // Parse and set data
        const template = response.template;
        const html = template.html_base || template.html || '';
        const css = template.css_base || template.css || '';
        
        setParsedData({
          html,
          css,
          htmlLength: html.length,
          cssLength: css.length,
          hasHtml: !!html,
          hasCss: !!css
        });

        // Auto-load into editor if available and has content
        if (editor && html && css) {
          setTimeout(() => {
            loadTemplateToGrapes(editor, {
              html_base: html,
              css_base: css
            });
          }, 500); // Small delay to ensure editor is ready
        }
      } else {
        throw new Error(response.error || 'Failed to generate template');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating template');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadToEditor = () => {
    if (editor && parsedData) {
      loadTemplateToGrapes(editor, {
        html_base: parsedData.html,
        css_base: parsedData.css
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Panel - Chat & Response */}
        <div className="w-full md:w-1/2 border-r border-app flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-app bg-surface-elevated">
            <h1 className="text-2xl font-bold text-primary">AI Template Generator (Test)</h1>
            <p className="text-secondary text-sm mt-1">Simplified prompt - no structure guidance</p>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-b border-app bg-surface-elevated">
            <div className="flex gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="Describe the website you want to create..."
                className="flex-1 min-h-[100px] px-3 py-2 bg-surface text-primary border border-app rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
            <p className="text-xs text-secondary mt-2">
              Press Ctrl/Cmd + Enter to generate
            </p>
          </div>

          {/* Response Display */}
          <div className="flex-1 overflow-auto p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                <strong>Error:</strong> {error}
              </div>
            )}

            {isGenerating && (
              <div className="flex items-center gap-2 text-secondary">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span>AI is generating your template...</span>
              </div>
            )}

            {rawResponse && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Raw Response:</h3>
                  <pre className="bg-surface-elevated p-4 rounded-lg overflow-auto text-xs text-secondary border border-app">
                    {rawResponse}
                  </pre>
                </div>

                {parsedData && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">Parsed Data:</h3>
                    <div className="bg-surface-elevated p-4 rounded-lg border border-app space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <strong className="text-primary">HTML:</strong>{' '}
                          <span className={`${parsedData.hasHtml ? 'text-green-400' : 'text-red-400'}`}>
                            {parsedData.htmlLength} chars
                          </span>
                        </div>
                        <div>
                          <strong className="text-primary">CSS:</strong>{' '}
                          <span className={`${parsedData.hasCss ? 'text-green-400' : 'text-red-400'}`}>
                            {parsedData.cssLength} chars
                          </span>
                        </div>
                      </div>
                      {parsedData.html && (
                        <div className="text-xs text-secondary">
                          <strong>HTML Preview:</strong>
                          <pre className="mt-1 p-2 bg-surface rounded overflow-auto max-h-32">
                            {parsedData.html.substring(0, 200)}...
                          </pre>
                        </div>
                      )}
                      {parsedData.css && (
                        <div className="text-xs text-secondary">
                          <strong>CSS Preview:</strong>
                          <pre className="mt-1 p-2 bg-surface rounded overflow-auto max-h-32">
                            {parsedData.css.substring(0, 200)}...
                          </pre>
                        </div>
                      )}
                      <button
                        onClick={handleLoadToEditor}
                        disabled={!parsedData.html || !parsedData.css}
                        className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {parsedData.html && parsedData.css ? 'Load to Editor' : 'Missing HTML or CSS'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right Panel - Editor Preview */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-app bg-surface-elevated">
            <h2 className="text-xl font-bold text-primary">Editor Canvas Preview</h2>
            <p className="text-secondary text-sm mt-1">GrapesJS Editor</p>
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            <div className="absolute inset-0">
              <GrapesJSEditor
                onEditorInit={handleEditorInit}
                options={{
                  height: '100%',
                  width: '100%'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}












