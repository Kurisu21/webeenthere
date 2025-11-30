'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import { useAuth } from '../../_components/auth/AuthContext';
import { apiGet, apiPut, API_BASE_URL } from '../../../lib/apiConfig';

interface AiConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  updatedAt?: string;
  updatedBy?: string;
}

interface AiPrompt {
  id: number;
  user_id: number | null;
  prompt_type: string;
  prompt_text: string;
  response_html: string | null;
  used_on_site: boolean;
  website_id: number | null;
  conversation_id: string | null;
  message_type: string;
  execution_status: string;
  created_at: string;
  username: string | null;
  email: string | null;
  website_title: string | null;
  website_slug: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Popular OpenRouter models (Free only)
const AVAILABLE_MODELS = [
  { value: 'x-ai/grok-4.1-fast:free', label: 'Grok 4.1 Fast (Free)' },
  { value: 'deepseek/deepseek-chat-v3.1:free', label: 'DeepSeek Chat v3.1 (Free)' },
  { value: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash (Free)' },
  { value: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (Free)' },
];

export default function AiConfigurationPage() {
  const { token } = useAuth();
  const [config, setConfig] = useState<AiConfig>({
    model: 'x-ai/grok-4.1-fast:free',
    maxTokens: 4000,
    temperature: 0.7
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Prompts section
  const [prompts, setPrompts] = useState<AiPrompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromptType, setSelectedPromptType] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<AiPrompt | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchPrompts();
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [pagination.page, searchTerm, selectedPromptType]);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet(`${API_BASE_URL}/api/admin/settings/ai`, { token });
      if (response.success && response.config) {
        setConfig(response.config);
      }
    } catch (err) {
      console.error('Failed to fetch AI config:', err);
      setError('Failed to load AI configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      setPromptsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (selectedPromptType) params.append('promptType', selectedPromptType);
      
      const response = await apiGet(`${API_BASE_URL}/api/admin/settings/ai/prompts?${params}`, { token });
      if (response.success) {
        setPrompts(response.prompts || []);
        setPagination(response.pagination || pagination);
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    } finally {
      setPromptsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await apiPut(
        `${API_BASE_URL}/api/admin/settings/ai`,
        config,
        { token }
      );
      
      if (response.success) {
        setSuccess('AI configuration updated successfully');
        setConfig(response.config || config);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update configuration');
      }
    } catch (err: any) {
      console.error('Failed to save config:', err);
      setError(err.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPrompts();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <MainContentWrapper>
            <div className="p-6">
              <div className="text-center py-12">
                <p className="text-secondary">Loading AI configuration...</p>
              </div>
            </div>
          </MainContentWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-primary mb-4">AI Configuration</h1>
              <p className="text-secondary text-lg max-w-2xl mx-auto">
                Configure AI model settings and view all user inputs and AI responses.
              </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="max-w-4xl mx-auto mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-800 dark:text-green-200 rounded-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Configuration Section */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-surface-elevated border border-app rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-primary mb-6">Model Settings</h2>
                
                <div className="space-y-6">
                  {/* Model Selection */}
                  <div>
                    <label className="block text-primary font-medium mb-2">
                      AI Model
                    </label>
                    <select
                      value={config.model}
                      onChange={(e) => setConfig({ ...config, model: e.target.value })}
                      className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {AVAILABLE_MODELS.map(model => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-secondary">
                      Select the AI model to use for all AI features (template generation, assistant, etc.)
                    </p>
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="block text-primary font-medium mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="16000"
                      value={config.maxTokens}
                      onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) || 4000 })}
                      className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="mt-2 text-sm text-secondary">
                      Maximum number of tokens in the AI response (1-16000)
                    </p>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-primary font-medium mb-2">
                      Temperature
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) || 0.7 })}
                      className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="mt-2 text-sm text-secondary">
                      Controls randomness in AI responses (0 = deterministic, 2 = very creative)
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full px-6 py-3 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>

                  {/* Last Updated Info */}
                  {config.updatedAt && (
                    <div className="pt-4 border-t border-app">
                      <p className="text-sm text-secondary">
                        Last updated: {formatDate(config.updatedAt)}
                        {config.updatedBy && ` by ${config.updatedBy}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prompts Viewer Section */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-surface-elevated border border-app rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-primary mb-6">AI Prompts & Responses</h2>
                
                {/* Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search prompts and responses..."
                        className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="sm:w-48">
                      <select
                        value={selectedPromptType}
                        onChange={(e) => {
                          setSelectedPromptType(e.target.value);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">All Types</option>
                        <option value="assistant_request">Assistant Request</option>
                        <option value="full">Full Template</option>
                        <option value="title">Title</option>
                        <option value="hero">Hero</option>
                        <option value="about">About</option>
                      </select>
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-6 py-3 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black rounded-lg transition-all duration-200 font-medium"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Prompts List */}
                {promptsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-secondary">Loading prompts...</p>
                  </div>
                ) : prompts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-secondary">No prompts found</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {prompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          onClick={() => setSelectedPrompt(prompt)}
                          className="p-4 bg-surface border border-app rounded-lg hover:border-primary/30 dark:hover:border-primary/30 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  prompt.message_type === 'user' 
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                }`}>
                                  {prompt.message_type === 'user' ? 'User' : 'AI'}
                                </span>
                                <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                  {prompt.prompt_type}
                                </span>
                                {prompt.execution_status && (
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    prompt.execution_status === 'success'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                      : prompt.execution_status === 'failed'
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                  }`}>
                                    {prompt.execution_status}
                                  </span>
                                )}
                              </div>
                              <p className="text-primary mb-1">
                                {truncateText(prompt.prompt_text, 150)}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-secondary mt-2">
                                {prompt.username && (
                                  <span>User: {prompt.username}</span>
                                )}
                                {prompt.website_title && (
                                  <span>Website: {prompt.website_title}</span>
                                )}
                                <span>{formatDate(prompt.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-app">
                        <p className="text-sm text-secondary">
                          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Prompt Detail Modal */}
            {selectedPrompt && (
              <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPrompt(null)}>
                <div className="bg-surface-elevated border border-app rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-primary">Prompt Details</h3>
                      <button
                        onClick={() => setSelectedPrompt(null)}
                        className="text-secondary hover:text-primary"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-primary font-medium mb-2">User Input</h4>
                        <div className="p-4 bg-surface border border-app rounded-lg">
                          <p className="text-primary whitespace-pre-wrap">{selectedPrompt.prompt_text}</p>
                        </div>
                      </div>
                      
                      {selectedPrompt.response_html && (
                        <div>
                          <h4 className="text-primary font-medium mb-2">AI Response</h4>
                          <div className="p-4 bg-surface border border-app rounded-lg">
                            <pre className="text-primary whitespace-pre-wrap text-sm overflow-x-auto">
                              {selectedPrompt.response_html}
                            </pre>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-secondary">Type:</span>
                          <span className="text-primary ml-2">{selectedPrompt.prompt_type}</span>
                        </div>
                        <div>
                          <span className="text-secondary">Status:</span>
                          <span className="text-primary ml-2">{selectedPrompt.execution_status}</span>
                        </div>
                        <div>
                          <span className="text-secondary">User:</span>
                          <span className="text-primary ml-2">{selectedPrompt.username || 'Anonymous'}</span>
                        </div>
                        <div>
                          <span className="text-secondary">Created:</span>
                          <span className="text-primary ml-2">{formatDate(selectedPrompt.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}


