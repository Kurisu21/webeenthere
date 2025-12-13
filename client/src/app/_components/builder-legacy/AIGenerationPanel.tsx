'use client';

import React, { useState, useEffect } from 'react';

interface AIGenerationPanelProps {
  onGenerate: (description: string, websiteType?: string) => void;
  isGenerating: boolean;
  onTemplateGenerated?: (template: any) => void;
  canCreate?: boolean;
}

type ContentType = 'landing-page' | 'portfolio' | 'e-commerce' | 'business' | 'content-creator' | null;

interface ContentTypeConfig {
  id: ContentType;
  label: string;
  icon: string;
  defaultPrompt: string;
  structureGuidance: string;
  contentGuidance: string;
}

const AIGenerationPanel: React.FC<AIGenerationPanelProps> = ({ 
  onGenerate, 
  isGenerating, 
  onTemplateGenerated,
  canCreate = true
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<ContentType>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [currentTagline, setCurrentTagline] = useState(0);

  // Content type configurations with default prompts focused on structure and content
  const contentTypes: ContentTypeConfig[] = [
    {
      id: 'landing-page',
      label: 'Landing Page',
      icon: '📄',
      defaultPrompt: 'Create a compelling landing page with hero section, features, testimonials, and call-to-action',
      structureGuidance: 'Include: hero section with headline and CTA, features/benefits section, social proof/testimonials, pricing (if applicable), and footer. Use clear hierarchy and conversion-focused layout.',
      contentGuidance: 'Generate persuasive copy that highlights value proposition, benefits, and clear calls-to-action. Include realistic testimonials and feature descriptions.'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: '🎨',
      defaultPrompt: 'Create a professional portfolio showcasing work, skills, and experience',
      structureGuidance: 'Include: hero/intro section, about section, projects/work gallery, skills section, and contact. Use grid layouts for projects and organized sections for easy navigation.',
      contentGuidance: 'Generate professional portfolio content including project descriptions, skill lists, about text, and contact information. Use realistic project names and descriptions.'
    },
    {
      id: 'e-commerce',
      label: 'E-commerce',
      icon: '🛒',
      defaultPrompt: 'Create an e-commerce website with product showcase, categories, and shopping features',
      structureGuidance: 'Include: header with navigation, hero/banner section, product categories, featured products grid, product detail sections, and checkout/contact. Use card-based layouts for products.',
      contentGuidance: 'Generate product listings with names, descriptions, prices, and categories. Include realistic product information and shopping-related content.'
    },
    {
      id: 'business',
      label: 'Business',
      icon: '🏢',
      defaultPrompt: 'Create a professional business website with services, about, and contact information',
      structureGuidance: 'Include: header with navigation, hero section, services/offerings section, about/company section, testimonials, and contact form. Use professional, corporate layout structure.',
      contentGuidance: 'Generate business-focused content including service descriptions, company information, team details, and professional contact information.'
    },
    {
      id: 'content-creator',
      label: 'Content Creator Portfolio',
      icon: '📹',
      defaultPrompt: 'Create a content creator portfolio showcasing videos, social media, and brand collaborations',
      structureGuidance: 'Include: hero section with intro, featured content/videos section, social media links, collaboration highlights, about section, and contact. Use media-rich layouts with video/image placeholders.',
      contentGuidance: 'Generate content creator-focused sections including video descriptions, social media stats, collaboration examples, and personal branding content.'
    }
  ];

  const placeholders = [
    "Create a template for business that is premium look",
    "Design a modern portfolio template for creative professionals",
    "Build a corporate website template with clean layout",
    "Generate an e-commerce template with product showcase",
    "Create a restaurant template with menu and booking system",
    "Design a tech startup template with hero section",
    "Build a healthcare template with appointment booking",
    "Generate a real estate template with property listings"
  ];

  const taglines = [
    "Professional templates in minutes, not hours",
    "From concept to completion in seconds",
    "Enterprise-grade designs, startup speed",
    "No coding required, maximum impact",
    "Custom templates tailored to your brand",
    "Launch faster with AI-powered design",
    "Transform your vision into reality"
  ];

  // Professional theme configuration - now theme-aware with enhanced visuals
  const professionalTheme = {
    name: 'Professional',
    primary: 'from-blue-600 to-indigo-700',
    secondary: 'from-blue-500 to-purple-600',
    accent: 'blue-500',
    text: 'text-primary',
    bg: 'bg-gradient-to-br from-surface via-surface-elevated/50 to-surface',
    border: 'border-app',
    shadow: 'shadow-2xl shadow-blue-500/20',
    glow: 'shadow-blue-500/30'
  };

  useEffect(() => {
    const placeholderInterval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 6000); // Change every 6 seconds

    const taglineInterval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 5000); // Change every 5 seconds

    return () => {
      clearInterval(placeholderInterval);
      clearInterval(taglineInterval);
    };
  }, []);

  const handleContentTypeSelect = (contentType: ContentType) => {
    // Only allow one selection at a time
    if (selectedContentType === contentType) {
      // Deselect if clicking the same type
      setSelectedContentType(null);
      setPrompt('');
    } else {
      setSelectedContentType(contentType);
      const config = contentTypes.find(ct => ct.id === contentType);
      if (config) {
        setPrompt(config.defaultPrompt);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt, selectedContentType || undefined);
    }
  };

  return (
    <div className={`${professionalTheme.bg} border ${professionalTheme.border} rounded-xl p-8 mb-8 ${professionalTheme.shadow} backdrop-blur-sm relative z-10 overflow-hidden`}>
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 animate-pulse"></div>
      
      <div className="relative z-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold ${professionalTheme.text} mb-3`}>
          Transform Ideas Into Stunning Templates
        </h2>
        <p className="text-secondary text-lg mb-2">AI-powered design with instant customization</p>
        <p className={`${professionalTheme.text} font-medium`}>
          {taglines[currentTagline]}
        </p>
      </div>
      
      {/* Main input area */}
      <div className="max-w-5xl md:max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type Selection */}
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleContentTypeSelect(type.id)}
                disabled={isGenerating}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
                  ${selectedContentType === type.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-500 shadow-lg scale-105'
                    : 'bg-surface/80 text-primary border-app hover:bg-surface-elevated hover:border-blue-400/50'
                  }
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="text-lg">{type.icon}</span>
                <span className="font-medium text-sm md:text-base">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Large input container */}
          <div className={`bg-surface/80 backdrop-blur-sm border ${professionalTheme.border} rounded-xl p-4 md:p-6 shadow-lg ${professionalTheme.glow} hover:shadow-xl hover:${professionalTheme.glow} transition-all duration-300`}>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Main input */}
              <div className="flex-1 w-full">
                  <textarea
                    id="ai-prompt"
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        if (prompt.trim() && !isGenerating) {
                          onGenerate(prompt);
                        }
                      }
                    }}
                    placeholder={placeholders[currentPlaceholder]}
                    className={`w-full min-h-[48px] max-h-[200px] px-3 md:px-4 py-3 bg-transparent text-primary placeholder-[color:var(--muted)] focus:outline-none resize-none text-base md:text-lg focus:ring-2 focus:ring-[var(--ring)] overflow-hidden`}
                    rows={1}
                  />
              </div>

              {/* Send button */}
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim() || !canCreate}
                className={`p-3 bg-gradient-to-r ${professionalTheme.primary} hover:opacity-90 disabled:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg ${professionalTheme.shadow} flex-shrink-0 hover:shadow-xl hover:shadow-blue-500/30`}
                title={!canCreate ? 'You have reached your website limit. Please upgrade to create more.' : ''}
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Loading state */}
        {isGenerating && (
          <div className={`mt-6 p-4 bg-surface/80 backdrop-blur-sm border ${professionalTheme.border} rounded-xl text-center shadow-lg ${professionalTheme.glow} animate-pulse`}>
            <div className="flex items-center justify-center">
              <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-${professionalTheme.accent} mr-3`}></div>
              <p className={`${professionalTheme.text} text-sm font-medium`}>
                AI is analyzing your requirements and generating a custom website template...
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AIGenerationPanel;