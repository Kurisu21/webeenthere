'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import AIGenerationPanel from '../../_components/builder-legacy/AIGenerationPanel';
import GeneratedTemplateModal from '../../_components/builder-legacy/GeneratedTemplateModal';
import { API_ENDPOINTS, apiPost, apiGet } from '../../../lib/apiConfig';
import { useAuth } from '../../_components/auth/AuthContext';

export default function CreateWebsitePage() {
  const router = useRouter();
  const { token: authToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState(null);
  const [showGeneratedTemplate, setShowGeneratedTemplate] = useState(false);
  const [templateReasoning, setTemplateReasoning] = useState('');
  const [templateSuggestions, setTemplateSuggestions] = useState([]);
  const [usage, setUsage] = useState<{ used: number; limit: number; canCreate: boolean } | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [aiPromptId, setAiPromptId] = useState<string | number | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [isCreatingWebsite, setIsCreatingWebsite] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importTitle, setImportTitle] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch subscription usage to gate UI
  React.useEffect(() => {
    let mounted = true;
    const fetchUsage = async () => {
      try {
        setLoadingUsage(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        const data = await apiGet(API_ENDPOINTS.SUBSCRIPTION_USAGE);
        if (mounted && data?.success !== false) {
          setUsage({ used: data.used ?? 0, limit: data.limit ?? 0, canCreate: !!data.canCreate });
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingUsage(false);
      }
    };
    fetchUsage();
    return () => { mounted = false; };
  }, []);

  const ensureCanCreate = () => {
    if (usage && !usage.canCreate) {
      const msg = `You have reached your website limit (${usage.used}/${usage.limit}). Please upgrade to create more.`;
      setLimitNotice(msg);
      // Auto-hide after a short delay
      setTimeout(() => setLimitNotice(null), 5000);
      return false;
    }
    return true;
  };

  const guardWhileGenerating = () => {
    if (isGenerating) {
      alert('AI is currently generating a template. Please wait for it to finish or close the preview before continuing.');
      return true;
    }
    return false;
  };


  const handleAIGenerate = async (description: string, websiteType?: string) => {
    // Check if user is authenticated before making API calls
    const token = authToken || localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !isAuthenticated) {
      console.log('No authentication token found or user not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }
    console.log('=== CREATE PAGE AI GENERATE CALLED ===');
    console.log('Description:', description);
    console.log('Website Type:', websiteType);
    console.log('Using simplified prompt (simpleMode: true)');
    
    setIsGenerating(true);
    
    try {
      console.log('Making API call to backend...');
      const data = await apiPost(API_ENDPOINTS.GENERATE_TEMPLATE, {
        description: description.trim(),
        websiteType: websiteType || undefined,
        simpleMode: true, // Use simplified prompt without structure guidance
      }, { token });
      console.log('API response data:', data);

      if (data.success && data.template) {
        console.log('Template generated successfully, showing preview...');
        console.log('Template data:', data.template);
        // Show the generated template in a preview modal instead of navigating
        setGeneratedTemplate(data.template);
        setTemplateReasoning(data.reasoning || '');
        setTemplateSuggestions(data.suggestions || []);
        setShowGeneratedTemplate(true);
        if (data.aiPromptId) setAiPromptId(data.aiPromptId);
      } else {
        console.error('Template generation failed:', data.error || 'No template in response', data);
        // Check if it's an AI limit error
        if (data.errorCode === 'AI_CHAT_LIMIT_REACHED' || data.error?.includes('AI chat limit reached')) {
          // The AIGenerationPanel will handle showing the banner
          // Just refresh limits to update the UI
          try {
            const limitsResponse = await apiGet(API_ENDPOINTS.SUBSCRIPTION_LIMITS);
            if (limitsResponse?.success && limitsResponse?.data) {
              // Trigger a refresh in the AIGenerationPanel by dispatching an event
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('aiLimitReached'));
              }
            }
          } catch (e) {
            console.error('Failed to refresh limits:', e);
          }
        }
        alert('Template generation failed: ' + (data.error || 'No template received'));
      }
    } catch (error: any) {
      console.error('Error generating template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Check if it's an AI limit error
      if (error.errorCode === 'AI_CHAT_LIMIT_REACHED' || errorMessage?.includes('AI chat limit reached')) {
        // The AIGenerationPanel will handle showing the banner
        // Just refresh limits to update the UI
        try {
          const limitsResponse = await apiGet(API_ENDPOINTS.SUBSCRIPTION_LIMITS);
          if (limitsResponse?.success && limitsResponse?.data) {
            // Trigger a refresh in the AIGenerationPanel by dispatching an event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('aiLimitReached'));
            }
          }
        } catch (e) {
          console.error('Failed to refresh limits:', e);
        }
      }
      alert('Error generating template: ' + errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle using the generated template
  const handleUseGeneratedTemplate = async (template: any) => {
    // Prevent multiple concurrent requests
    if (isCreatingWebsite) {
      console.log('Website creation already in progress, please wait...');
      return;
    }
    
    setIsCreatingWebsite(true);
    
    try {
      // Check if user is authenticated before making API calls
      // Use token from AuthContext first, then fallback to storage
      const token = authToken || localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token || !isAuthenticated) {
        console.log('No authentication token found or user not authenticated, redirecting to login');
        setIsCreatingWebsite(false);
        window.location.href = '/login';
        return;
      }

      if (!ensureCanCreate()) {
        setIsCreatingWebsite(false);
        return;
      }

      // Create website in database immediately with AI-generated template (store normalized html/css JSON)
      // Slug will be auto-generated by backend in format: username-random_number
      const normalizedHtmlCss = JSON.stringify({ html: (template.html || ''), css: (template.css || template.css_base || '') });
      const websiteData = {
        title: `${template.name || 'AI Generated'} Website`,
        template_id: 'ai_generated',
        html_content: normalizedHtmlCss,
        css_content: (template.css || template.css_base || ''),
        is_published: false,
        ai_prompt_id: aiPromptId ?? undefined
      };

      const response = await apiPost(API_ENDPOINTS.WEBSITES, websiteData, { token });
      
      if (response.success) {
        // Navigate to build page with the actual database ID
        router.push(`/user/build/${response.data.id}`);
      } else {
        throw new Error(response.message || 'Failed to create website');
      }
    } catch (error: any) {
      console.error('Error creating website:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        data: error?.data
      });
      
      // Check for authentication errors - handle both Error objects and rejected promises
      const errorMessage = error?.message || error?.error || String(error);
      const isAuthError = errorMessage.includes('Authentication') || 
                         errorMessage.includes('token') || 
                         errorMessage.includes('Access denied') ||
                         errorMessage.includes('Invalid token') ||
                         error?.status === 401;
      
      if (isAuthError) {
        console.log('User needs to authenticate - redirecting to login');
        console.log('Current auth state:', {
          authToken: authToken ? 'exists' : 'missing',
          isAuthenticated,
          localStorageToken: localStorage.getItem('token') ? 'exists' : 'missing',
          sessionStorageToken: sessionStorage.getItem('token') ? 'exists' : 'missing'
        });
        // Clear tokens and redirect to login only when explicitly needed
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      alert('Error creating website: ' + (errorMessage || 'Please try again.'));
    } finally {
      setIsCreatingWebsite(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/html' && !file.name.toLowerCase().endsWith('.html')) {
        alert('Please select an HTML file');
        return;
      }
      setImportFile(file);
      // Auto-fill title from filename if title is empty
      if (!importTitle) {
        const nameWithoutExt = file.name.replace(/\.html$/i, '');
        setImportTitle(nameWithoutExt);
      }
    }
  };

  const handleImportWebsite = async () => {
    if (!importFile) {
      alert('Please select an HTML file');
      return;
    }

    if (!importTitle.trim()) {
      alert('Please enter a website title');
      return;
    }

    if (guardWhileGenerating() || !ensureCanCreate()) {
      return;
    }

    if (isCreatingWebsite) {
      console.log('Website creation already in progress, please wait...');
      return;
    }

    setImporting(true);
    setIsCreatingWebsite(true);

    try {
      const token = authToken || localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token || !isAuthenticated) {
        window.location.href = '/login';
        return;
      }

      const formData = new FormData();
      formData.append('htmlFile', importFile);
      formData.append('title', importTitle.trim());

      const response = await fetch(`${API_ENDPOINTS.WEBSITES}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to import website');
      }

      const result = await response.json();
      
      if (result.success) {
        // Reset form
        setImportFile(null);
        setImportTitle('');
        setShowImportModal(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Navigate to builder
        router.push(`/user/build/${result.data.id}`);
      } else {
        throw new Error(result.message || 'Failed to import website');
      }
    } catch (error: any) {
      console.error('Error importing website:', error);
      alert('Error importing website: ' + (error.message || 'Please try again.'));
    } finally {
      setImporting(false);
      setIsCreatingWebsite(false);
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBuildFromScratch = async () => {
    if (guardWhileGenerating()) return;
    
    // Prevent multiple concurrent requests
    if (isCreatingWebsite) {
      console.log('Website creation already in progress, please wait...');
      return;
    }
    
    setIsCreatingWebsite(true);
    
    try {
      // Check if user is authenticated before making API calls
      // Use token from AuthContext first, then fallback to storage
      const token = authToken || localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token || !isAuthenticated) {
        console.log('No authentication token found or user not authenticated, redirecting to login');
        window.location.href = '/login';
        return;
      }

      // Enforce plan limit before attempting creation
      if (!ensureCanCreate()) return;

      // Create blank website in database immediately
      // Slug will be auto-generated by backend in format: username-random_number
      const websiteData = {
        title: 'My Website',
        template_id: 'blank',
        html_content: '',
        css_content: '',
        is_published: false
      };

      const response = await apiPost(API_ENDPOINTS.WEBSITES, websiteData, { token });
      
      if (response.success) {
        // Navigate to build page with the actual database ID
        router.push(`/user/build/${response.data.id}`);
      } else {
        throw new Error(response.message || 'Failed to create website');
      }
    } catch (error: any) {
      console.error('Error creating website:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        data: error?.data
      });
      
      // Check for authentication errors - handle both Error objects and rejected promises
      const errorMessage = error?.message || error?.error || String(error);
      const isAuthError = errorMessage.includes('Authentication') || 
                         errorMessage.includes('token') || 
                         errorMessage.includes('Access denied') ||
                         errorMessage.includes('Invalid token') ||
                         error?.status === 401;
      
      if (isAuthError) {
        console.log('User needs to authenticate - redirecting to login');
        console.log('Current auth state:', {
          authToken: authToken ? 'exists' : 'missing',
          isAuthenticated,
          localStorageToken: localStorage.getItem('token') ? 'exists' : 'missing',
          sessionStorageToken: sessionStorage.getItem('token') ? 'exists' : 'missing'
        });
        // Clear tokens and redirect to login only when explicitly needed
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      alert('Error creating website: ' + (errorMessage || 'Please try again.'));
    }
  };

  return (
        <div className="min-h-screen bg-surface relative overflow-hidden">
          {/* Limit toast - shown only after an action is blocked */}
          {limitNotice && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-100 rounded-lg px-4 py-3 shadow-lg">
                {limitNotice}
              </div>
            </div>
          )}

          <DashboardHeader />
          <div className="flex flex-col md:flex-row relative z-10">
            <DashboardSidebar />
            <MainContentWrapper>
              {/* Moving Templates Background - Behind AI chat box (like home page) */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block z-0">
                {/* Template 1 - Moving from left to right */}
                <div className="absolute top-20 left-[-200px] w-64 h-80 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm animate-slideRight">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                    </div>
                    <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
                    <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-4"></div>
                    <div className="w-full h-20 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="w-2/3 h-3 bg-gray-300/30 rounded"></div>
                  </div>
                </div>

                {/* Template 2 - Moving from right to left */}
                <div className="absolute top-40 right-[-200px] w-64 h-80 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30 backdrop-blur-sm animate-slideLeft">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
                    <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-2"></div>
                    <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-4"></div>
                    <div className="w-full h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
                  </div>
                </div>

                {/* Template 3 - Floating up and down */}
                <div className="absolute bottom-20 left-1/4 w-56 h-72 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30 backdrop-blur-sm animate-float">
                  <div className="p-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400/50 to-blue-400/50 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="w-full h-3 bg-gray-300/30 rounded mb-3"></div>
                    <div className="w-2/3 h-3 bg-gray-300/30 rounded mb-2"></div>
                    <div className="w-full h-3 bg-gray-300/30 rounded mb-4"></div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="h-12 bg-gradient-to-br from-green-500/30 to-blue-500/30 rounded"></div>
                      <div className="h-12 bg-gradient-to-br from-blue-500/30 to-green-500/30 rounded"></div>
                    </div>
                    <div className="w-1/2 h-3 bg-gray-300/30 rounded mx-auto"></div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 md:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-200px)] relative z-10">
            {/* AI Generation Section - Primary Focus */}
            <div className="w-full max-w-4xl mb-8">
            <AIGenerationPanel 
              onGenerate={handleAIGenerate}
              isGenerating={isGenerating}
              canCreate={usage?.canCreate ?? true}
            />
            </div>

            {/* Professional Navigation to Templates */}
            <div className="text-center mb-6 md:mb-8 w-full max-w-4xl">
              <div className="inline-flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-surface-elevated/50 backdrop-blur-sm border border-app rounded-xl p-3 md:p-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-secondary text-xs sm:text-sm font-medium">Or browse our pre-built templates and community-made templates</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (guardWhileGenerating()) return;
                      router.push('/user/templates');
                    }}
                    disabled={isGenerating}
                    className={`group relative bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 text-white px-5 md:px-7 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 w-full sm:w-auto text-sm md:text-base flex items-center justify-center gap-2 ${isGenerating ? 'opacity-60 cursor-not-allowed hover:scale-100 hover:translate-y-0' : 'active:scale-[0.98]'}`}
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Browse Templates</span>
                  </button>
                  <button
                    onClick={() => {
                      if (guardWhileGenerating()) return;
                      setShowImportModal(true);
                    }}
                    disabled={isGenerating}
                    className={`group relative bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white px-5 md:px-7 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 w-full sm:w-auto text-sm md:text-base flex items-center justify-center gap-2 ${isGenerating ? 'opacity-60 cursor-not-allowed hover:scale-100 hover:translate-y-0' : 'active:scale-[0.98]'}`}
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Import HTML</span>
                  </button>
                  <button
                    onClick={handleBuildFromScratch}
                    disabled={isGenerating}
                    className={`group relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white px-5 md:px-7 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 w-full sm:w-auto text-sm md:text-base flex items-center justify-center gap-2 ${isGenerating ? 'opacity-60 cursor-not-allowed hover:scale-100 hover:translate-y-0' : 'active:scale-[0.98]'}`}
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Build from Scratch</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </MainContentWrapper>
      </div>

      {/* Generated Template Modal */}
      <GeneratedTemplateModal
        isOpen={showGeneratedTemplate}
        template={generatedTemplate}
        reasoning={templateReasoning}
        suggestions={templateSuggestions}
        onUseTemplate={handleUseGeneratedTemplate}
        onClose={() => {
          setShowGeneratedTemplate(false);
          setGeneratedTemplate(null);
          setTemplateReasoning('');
          setTemplateSuggestions([]);
        }}
      />

      {/* Import HTML Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface-elevated border border-app rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">Import Website from HTML</h2>
              <button
                onClick={handleCloseImportModal}
                className="text-secondary hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  HTML File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-app rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,text/html"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="html-file-input"
                  />
                  <label
                    htmlFor="html-file-input"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-primary font-medium">
                      {importFile ? importFile.name : 'Click to select HTML file'}
                    </span>
                    <span className="text-sm text-secondary mt-1">
                      HTML files only (max 10MB)
                    </span>
                  </label>
                </div>
              </div>

              {/* Website Title */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Website Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  placeholder="Enter website title"
                  className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Your HTML file will be parsed to extract the body content and CSS from &lt;style&gt; tags. 
                  The website will be created immediately and you'll be taken to the builder to customize it.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseImportModal}
                disabled={importing}
                className="group px-5 py-2.5 bg-surface border border-app rounded-xl text-primary hover:bg-surface-elevated hover:border-app/80 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleImportWebsite}
                disabled={importing || !importFile || !importTitle.trim()}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center gap-2 active:scale-[0.98]"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Import & Create Website</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}