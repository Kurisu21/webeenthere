'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/AuthContext';
import GrapesJSEditor from './GrapesJSEditor';
import { useAIServices } from './hooks/useAIServices';
import { useGrapesJS } from './hooks/useGrapesJS';
import { API_ENDPOINTS, apiPut } from '../../../lib/apiConfig';
import { convertGrapesToPublishableHTML, loadTemplateToGrapes } from './utils/templateToGrapes';
import './BuilderLayout.css';
import type { Editor } from 'grapesjs';

interface BuilderLayoutProps {
  websiteId: string;
  currentWebsite?: any;
}

export default function BuilderLayout({ websiteId, currentWebsite }: BuilderLayoutProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [editor, setEditor] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [customCss, setCustomCss] = useState('');
  const editorRef = useRef<any>(null);
  
  // Get theme mode
  const themeMode = user?.theme_mode || 'light';
  const isDark = themeMode === 'dark';

  // AI Services
  const {
    aiPrompt,
    isAiLoading,
    aiSuggestions,
    aiContext,
    aiReasoning,
    setAiPrompt,
    handleAiGenerate,
    handleAiImprove,
  } = useAIServices();

  // GrapesJS utilities
  const { save, getHtml, getCss, getJson, exportAsHtml } = useGrapesJS(editor);

  // Initialize editor and load content
  useEffect(() => {
    if (editor) {
      editorRef.current = editor;

      // Load initial content if available
      if (currentWebsite?.html_content) {
        try {
          const layout = JSON.parse(currentWebsite.html_content);
          if (layout.html) {
            editor.setComponents(layout.html);
          }
          if (layout.css) {
            editor.setStyle(layout.css);
          }
        } catch (e) {
          // If not JSON, try as plain HTML
          if (currentWebsite.html_content) {
            editor.setComponents(currentWebsite.html_content);
          }
        }
      }
      
      // CRITICAL: Load CSS from css_content field (for seeded/manually coded sites)
      if (currentWebsite?.css_content) {
        editor.setStyle(currentWebsite.css_content);
      }
    }
  }, [editor, currentWebsite]);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      const html = getHtml();
      const css = getCss();
      const layout = JSON.stringify({ html, css });
      
      // Save both as separate strings for compatibility with view page
      const response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, {
        html_content: layout,
        css_content: css, // Save CSS separately for view page
      });
      
      if (response.success) {
        console.log('Website saved successfully');
        alert('Website saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save website');
      }
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Failed to save website. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [editor, websiteId, getHtml, getCss]);

  const handlePublish = useCallback(async () => {
    if (!editor) return;
    
    try {
      // Get separate HTML and CSS for proper display on view page
      const html = getHtml();
      const css = getCss();
      
      const response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, {
        html_content: html, // Plain HTML for view page
        css_content: css,   // Plain CSS for view page  
        is_published: true,
      });
      
      if (response.success) {
        alert('Website published successfully!');
        // Open published site in new tab
        window.open(`/sites/${currentWebsite?.slug}`, '_blank');
      } else {
        throw new Error(response.message || 'Failed to publish website');
      }
    } catch (error) {
      console.error('Error publishing website:', error);
      alert('Failed to publish website. Please try again.');
    }
  }, [editor, websiteId, currentWebsite, getHtml, getCss]);

  const handleExit = useCallback(() => {
    router.push('/user/main');
  }, [router]);

  const handleEditorInit = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  const handleAiGenerateClick = useCallback(async () => {
    await handleAiGenerate(editor);
  }, [handleAiGenerate, editor]);

  const handleAiImproveClick = useCallback(async () => {
    await handleAiImprove(editor, 'all');
  }, [handleAiImprove, editor]);

  const handleDeviceChange = useCallback((device: string) => {
    if (editor) {
      editor.setDevice(device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Mobile portrait');
      setActiveDevice(device);
    }
  }, [editor]);

  const handleUndo = useCallback(() => {
    editor?.runCommand('core:undo');
  }, [editor]);

  const handleRedo = useCallback(() => {
    editor?.runCommand('core:redo');
  }, [editor]);

  const handlePreview = useCallback(() => {
    editor?.runCommand('preview');
  }, [editor]);

  const handleCodeView = useCallback(() => {
    editor?.runCommand('export-template');
  }, [editor]);

  const handleFullscreen = useCallback(() => {
    editor?.runCommand('fullscreen');
  }, [editor]);

  const handleOutline = useCallback(() => {
    editor?.runCommand('sw-visibility');
  }, [editor]);

  // Dynamic theme classes based on mode
  const bgPrimary = isDark ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const bgTertiary = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-800' : 'bg-white';
  const toolbarBtnClass = isDark
    ? 'px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition'
    : 'px-2 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition';
  const deviceBtnIdleClass = isDark
    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200';

  return (
    <div data-theme={isDark ? 'dark' : 'light'} className={`flex flex-col h-screen ${bgPrimary}`}>
      {/* Header Toolbar */}
      <div className={`flex items-center justify-between p-4 ${bgSecondary} border-b ${borderColor}`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExit}
            className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Exit
          </button>
          <h2 className={`${textPrimary} font-semibold flex items-center gap-2`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {currentWebsite?.title || 'Building Website'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Toolbar Controls */}
          <div className={`flex items-center space-x-1 mr-2 px-2 border-r ${borderColor}`}>
            <button
              onClick={handleUndo}
              className={toolbarBtnClass}
              title="Undo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={handleRedo}
              className={toolbarBtnClass}
              title="Redo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m12-2l-6-6m6 6l-6 6" />
              </svg>
            </button>
          </div>

          {/* Device Preview Buttons */}
          <div className={`flex items-center space-x-1 mr-2 px-2 border-r ${borderColor}`}>
            <button
              onClick={() => handleDeviceChange('desktop')}
              className={`px-3 py-2 rounded transition ${activeDevice === 'desktop' ? 'bg-blue-600 text-white' : deviceBtnIdleClass}`}
              title="Desktop"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => handleDeviceChange('tablet')}
              className={`px-3 py-2 rounded transition ${activeDevice === 'tablet' ? 'bg-blue-600 text-white' : deviceBtnIdleClass}`}
              title="Tablet"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => handleDeviceChange('mobile')}
              className={`px-3 py-2 rounded transition ${activeDevice === 'mobile' ? 'bg-blue-600 text-white' : deviceBtnIdleClass}`}
              title="Mobile"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* View Buttons */}
          <div className={`flex items-center space-x-1 mr-2 px-2 border-r ${borderColor}`}>
            <button
              onClick={handlePreview}
              className={toolbarBtnClass}
              title="Preview"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={handleCodeView}
              className={toolbarBtnClass}
              title="View Code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
            <button
              onClick={handleFullscreen}
              className={toolbarBtnClass}
              title="Fullscreen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={handleOutline}
              className={toolbarBtnClass}
              title="Toggle Outlines"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save
              </>
            )}
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Publish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Blocks */}
        <div className={`w-64 ${bgSecondary} border-r ${borderColor} overflow-y-auto`}>
          <div className="p-4">
            <h3 className={`${textPrimary} font-semibold mb-4 flex items-center gap-2`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
              Blocks
            </h3>
            <div className="blocks-container" />
          </div>
        </div>

        {/* Center - GrapesJS Editor */}
        <div className={`flex-1 ${bgPrimary}`}>
          <div className="h-full w-full gjs-editor-parent">
            <GrapesJSEditor onEditorInit={handleEditorInit} />
          </div>
        </div>

        {/* Right Sidebar - Layers, Properties, Traits, and AI */}
        <div className={`w-80 ${bgSecondary} border-l ${borderColor} overflow-y-auto`}>
          <div className="p-4 space-y-4">
            {/* Layers Panel */}
            <div className={`${bgTertiary} rounded border ${borderColor}`}>
              <button
                onClick={() => setShowLayers(!showLayers)}
                className={`w-full flex items-center justify-between p-3 ${textPrimary} hover:${bgSecondary} transition`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="font-semibold">Layers</span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${showLayers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`px-3 pb-3 ${showLayers ? 'block' : 'hidden'}`}>
                <div className="layers-container" />
              </div>
            </div>

            {/* Properties Panel */}
            <div className={`${bgTertiary} rounded border ${borderColor}`}>
              <div className="p-3">
                <h3 className={`${textPrimary} font-semibold mb-3 flex items-center gap-2`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Styles
                </h3>
                <div className="styles-container" />
              </div>
            </div>

            {/* Traits Panel */}
            <div className={`${bgTertiary} rounded border ${borderColor}`}>
              <div className="p-3">
                <h3 className={`${textPrimary} font-semibold mb-3 flex items-center gap-2`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Settings
                </h3>
                <div className="traits-container" />
              </div>
            </div>
            
            {/* AI Panel */}
            <div className={`mt-8 p-4 ${bgTertiary} rounded border ${borderColor}`}>
              <h4 className={`${textPrimary} font-semibold mb-2 flex items-center gap-2`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Assistant
              </h4>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} rounded mb-2 border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                rows={3}
              />
              <button
                onClick={handleAiGenerateClick}
                disabled={isAiLoading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
              <button
                onClick={handleAiImproveClick}
                disabled={isAiLoading}
                className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Improve Selected
              </button>
              </div>
            
            {/* Custom CSS Panel (removed per request) */}
            
            {/* AI Context Display */}
            {aiContext && (
              <div className={`mt-4 p-4 ${bgTertiary} rounded border ${borderColor}`}>
                <h4 className={`${textPrimary} font-semibold mb-2`}>AI Context</h4>
                <p className={`${textSecondary} text-sm`}>{JSON.stringify(aiContext, null, 2)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
