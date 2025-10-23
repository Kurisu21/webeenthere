'use client';

import React, { useState, useEffect } from 'react';

interface AIGenerationPanelProps {
  onGenerate: (description: string, options: { websiteType: string; style: string; colorScheme: string }) => void;
  isGenerating: boolean;
  onTemplateGenerated?: (template: any) => void;
}

const AIGenerationPanel: React.FC<AIGenerationPanelProps> = ({ 
  onGenerate, 
  isGenerating, 
  onTemplateGenerated 
}) => {
  const [prompt, setPrompt] = useState('');
  const [websiteType, setWebsiteType] = useState('general');
  const [style, setStyle] = useState('modern');
  const [colorScheme, setColorScheme] = useState('blue');
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [currentTagline, setCurrentTagline] = useState(0);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt, { websiteType, style, colorScheme });
    }
  };

  return (
    <div className={`${professionalTheme.bg} border ${professionalTheme.border} rounded-xl p-8 mb-8 ${professionalTheme.shadow} backdrop-blur-sm relative overflow-hidden`}>
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
                          onGenerate(prompt, { websiteType, style, colorScheme });
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
                disabled={isGenerating || !prompt.trim()}
                className={`p-3 bg-gradient-to-r ${professionalTheme.primary} hover:opacity-90 disabled:bg-surface-elevated rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg ${professionalTheme.shadow} flex-shrink-0 hover:shadow-xl hover:shadow-blue-500/30`}
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

          {/* Options row */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-8">
            <div className="flex items-center space-x-2 md:space-x-3">
              <label className={`${professionalTheme.text} text-xs md:text-sm font-semibold`}>Type:</label>
              <div className="relative">
                <select
                  value={websiteType}
                  onChange={(e) => setWebsiteType(e.target.value)}
                  className={`px-3 md:px-4 py-2 bg-surface-elevated/80 backdrop-blur-sm border ${professionalTheme.border} rounded-xl text-primary text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] transition-all duration-300 hover:bg-surface cursor-pointer appearance-none pr-6 md:pr-8 hover:shadow-md hover:shadow-blue-500/20`}
                >
                  <option value="general" className="bg-surface text-primary">General</option>
                  <option value="portfolio" className="bg-surface text-primary">Portfolio</option>
                  <option value="business" className="bg-surface text-primary">Business</option>
                  <option value="ecommerce" className="bg-surface text-primary">E-commerce</option>
                  <option value="blog" className="bg-surface text-primary">Blog</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <label className={`${professionalTheme.text} text-xs md:text-sm font-semibold`}>Style:</label>
              <div className="relative">
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className={`px-3 md:px-4 py-2 bg-surface-elevated/80 backdrop-blur-sm border ${professionalTheme.border} rounded-xl text-primary text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] transition-all duration-300 hover:bg-surface cursor-pointer appearance-none pr-6 md:pr-8 hover:shadow-md hover:shadow-blue-500/20`}
                >
                  <option value="modern" className="bg-surface text-primary">Modern</option>
                  <option value="minimal" className="bg-surface text-primary">Minimal</option>
                  <option value="classic" className="bg-surface text-primary">Classic</option>
                  <option value="creative" className="bg-surface text-primary">Creative</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <label className={`${professionalTheme.text} text-xs md:text-sm font-semibold`}>Colors:</label>
              <div className="relative">
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  className={`px-3 md:px-4 py-2 bg-surface-elevated/80 backdrop-blur-sm border ${professionalTheme.border} rounded-xl text-primary text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] transition-all duration-300 hover:bg-surface cursor-pointer appearance-none pr-6 md:pr-8 hover:shadow-md hover:shadow-blue-500/20`}
                >
                  <option value="blue" className="bg-surface text-primary">Blue</option>
                  <option value="purple" className="bg-surface text-primary">Purple</option>
                  <option value="green" className="bg-surface text-primary">Green</option>
                  <option value="red" className="bg-surface text-primary">Red</option>
                  <option value="dark" className="bg-surface text-primary">Dark</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-3 pointer-events-none">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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