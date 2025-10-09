'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import TemplateSelector from '../../_components/builder-legacy/TemplateSelector';
import AIGenerationPanel from '../../_components/builder-legacy/AIGenerationPanel';
import GeneratedTemplateModal from '../../_components/builder-legacy/GeneratedTemplateModal';
import { API_ENDPOINTS, apiPost } from '../../../lib/apiConfig';

export default function CreateWebsitePage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState(null);
  const [showGeneratedTemplate, setShowGeneratedTemplate] = useState(false);
  const [templateReasoning, setTemplateReasoning] = useState('');
  const [templateSuggestions, setTemplateSuggestions] = useState([]);
  const [showTemplateSection, setShowTemplateSection] = useState(false);

  const handleTemplateSelect = async (template: any) => {
    setSelectedTemplate(template);
    
    try {
      // Check if user is authenticated before making API calls
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found, redirecting to login');
        window.location.href = '/login';
        return;
      }

      // Create website in database immediately
      const websiteData = {
        title: `${template.name} Website`,
        slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        template_id: template.id,
        html_content: '',
        css_content: '',
        is_published: false
      };

      const response = await apiPost(API_ENDPOINTS.WEBSITES, websiteData);
      
      if (response.success) {
        // Navigate to build page with the actual database ID
        router.push(`/user/build/${response.data.id}`);
      } else {
        throw new Error(response.message || 'Failed to create website');
      }
    } catch (error) {
      console.error('Error creating website:', error);
      if (error instanceof Error && error.message.includes('Authentication required')) {
        console.log('User needs to authenticate');
        return;
      }
      alert('Error creating website. Please try again.');
    }
  };

  const handleAIGenerate = async (description: string, options: { websiteType: string; style: string; colorScheme: string }) => {
    console.log('=== CREATE PAGE AI GENERATE CALLED ===');
    console.log('Description:', description);
    console.log('Options:', options);
    
    setIsGenerating(true);
    
    try {
      console.log('Making API call to backend...');
      const data = await apiPost(API_ENDPOINTS.GENERATE_TEMPLATE, {
        description: description.trim(),
        websiteType: options.websiteType,
        style: options.style,
        colorScheme: options.colorScheme,
        userId: 'current-user'
      });
      console.log('API response data:', data);

      if (data.success) {
        console.log('Template generated successfully, showing preview...');
        // Show the generated template in a preview modal instead of navigating
        setGeneratedTemplate(data.template);
        setTemplateReasoning(data.reasoning || '');
        setTemplateSuggestions(data.suggestions || []);
        setShowGeneratedTemplate(true);
      } else {
        console.error('Template generation failed:', data.error);
        alert('Template generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error generating template: ' + errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle using the generated template
  const handleUseGeneratedTemplate = async (template: any) => {
    setSelectedTemplate(template);
    
    try {
      // Check if user is authenticated before making API calls
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found, redirecting to login');
        window.location.href = '/login';
        return;
      }

      // Create website in database immediately with AI-generated template
      const websiteData = {
        title: `${template.name || 'AI Generated'} Website`,
        slug: `ai-generated-${Date.now()}`,
        template_id: 'ai_generated',
        html_content: '',
        css_content: '',
        is_published: false
      };

      const response = await apiPost(API_ENDPOINTS.WEBSITES, websiteData);
      
      if (response.success) {
        // Navigate to build page with the actual database ID
        router.push(`/user/build/${response.data.id}`);
      } else {
        throw new Error(response.message || 'Failed to create website');
      }
    } catch (error) {
      console.error('Error creating website:', error);
      if (error instanceof Error && error.message.includes('Authentication required')) {
        console.log('User needs to authenticate');
        return;
      }
      alert('Error creating website. Please try again.');
    }
  };

  const handleBuildFromScratch = async () => {
    try {
      // Check if user is authenticated before making API calls
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found, redirecting to login');
        window.location.href = '/login';
        return;
      }

      // Create blank website in database immediately
      const websiteData = {
        title: 'My Website',
        slug: `blank-website-${Date.now()}`,
        template_id: 'blank',
        html_content: '',
        css_content: '',
        is_published: false
      };

      const response = await apiPost(API_ENDPOINTS.WEBSITES, websiteData);
      
      if (response.success) {
        // Navigate to build page with the actual database ID
        router.push(`/user/build/${response.data.id}`);
      } else {
        throw new Error(response.message || 'Failed to create website');
      }
    } catch (error) {
      console.error('Error creating website:', error);
      if (error instanceof Error && error.message.includes('Authentication required')) {
        console.log('User needs to authenticate');
        return;
      }
      alert('Error creating website. Please try again.');
    }
  };

  return (
        <div className="min-h-screen bg-gray-900 relative overflow-hidden">
          {/* Moving Templates Background - Hidden on mobile for performance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
            {/* Template 1 - Moving from left to right */}
            <div className={`absolute top-20 left-[-200px] w-64 h-80 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm ${showTemplateSection ? 'animate-slideRightFast' : 'animate-slideRight'}`}>
              <div className="p-4">
                <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-20 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-2/3 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>

            {/* Template 2 - Moving from right to left */}
            <div className={`absolute top-40 right-[-200px] w-64 h-80 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30 backdrop-blur-sm ${showTemplateSection ? 'animate-slideLeftFast' : 'animate-slideLeft'}`}>
              <div className="p-4">
                <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-16 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>

            {/* Template 3 - Floating up and down */}
            <div className={`absolute bottom-20 left-1/6 w-56 h-72 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30 backdrop-blur-sm ${showTemplateSection ? 'animate-floatFast' : 'animate-float'}`}>
              <div className="p-4">
                <div className="w-full h-3 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-2/3 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-full h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-12 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>

            {/* Template 4 - Rotating slowly */}
            <div className={`absolute top-1/2 right-1/6 w-48 h-64 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/30 backdrop-blur-sm ${showTemplateSection ? 'animate-rotateFast' : 'animate-rotateSlow'}`}>
              <div className="p-4">
                <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-14 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-2/3 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>

            {/* Template 5 - Bouncing */}
            <div className={`absolute bottom-1/3 left-1/6 w-52 h-76 bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-lg border border-red-500/30 backdrop-blur-sm ${showTemplateSection ? 'animate-bounceFast' : 'animate-bounce'}`}>
              <div className="p-4">
                <div className="w-full h-3 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-2"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-4"></div>
                <div className="w-full h-16 bg-gray-300/30 rounded mb-3"></div>
                <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
              </div>
            </div>
          </div>

          <DashboardHeader />
          <div className="flex flex-col md:flex-row relative z-10">
            <DashboardSidebar />
            <MainContentWrapper>
              <div className="p-3 md:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-200px)] relative z-10">
            {/* AI Generation Section - Primary Focus */}
            <div className="w-full max-w-4xl mb-8">
            <AIGenerationPanel 
              onGenerate={handleAIGenerate}
              isGenerating={isGenerating}
            />
            </div>

            {/* Professional Navigation to Templates */}
            <div className="text-center mb-6 md:mb-8 w-full max-w-4xl">
              <div className="inline-flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-3 md:p-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300 text-xs sm:text-sm">Or browse our pre-built templates and community-made templates</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowTemplateSection(!showTemplateSection)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20 w-full sm:w-auto text-sm md:text-base"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {showTemplateSection ? 'Hide Templates' : 'Browse Templates'}
                  </button>
                  <button
                    onClick={handleBuildFromScratch}
                    className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/20 w-full sm:w-auto text-sm md:text-base"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Build from Scratch
                  </button>
                </div>
              </div>
            </div>

            {/* Template Selection - Collapsible */}
            {showTemplateSection && (
              <div className="animate-fadeIn w-full max-w-6xl">
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Choose Your Template</h2>
                    <button
                      onClick={() => setShowTemplateSection(false)}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm md:text-base">Select from our professional template collection</p>
                </div>
                <TemplateSelector 
                  onTemplateSelect={handleTemplateSelect}
                  onStartFromScratch={handleBuildFromScratch}
                />
              </div>
            )}
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
    </div>
  );
}