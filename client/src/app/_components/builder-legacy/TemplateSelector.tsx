'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { 
  getCommunityTemplates, 
  getOfficialTemplates, 
  getActiveTemplatesWithCreator,
  Template,
  TEMPLATE_CATEGORIES 
} from '../../../lib/templateApi';
import TemplatePreviewModal from './TemplatePreviewModal';
import { WebsitePreviewImage } from '../shared/WebsitePreviewImage';

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void;
  onStartFromScratch: () => void;
}

const TemplateSelector = memo(({ onTemplateSelect, onStartFromScratch }: TemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official');
  
  // Template data
  const [officialTemplates, setOfficialTemplates] = useState<Template[]>([]);
  const [communityTemplates, setCommunityTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [official, community] = await Promise.all([
        getOfficialTemplates(),
        getCommunityTemplates()
      ]);
      
      setOfficialTemplates(official);
      setCommunityTemplates(community);
    } catch (error: any) {
      setError(error.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleTemplatePreview = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  }, []);

  const handleTemplateSelect = useCallback((template: Template) => {
    setIsModalOpen(false);
    onTemplateSelect(template);
  }, [onTemplateSelect]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  }, []);

  const getCurrentTemplates = () => {
    return activeTab === 'official' ? officialTemplates : communityTemplates;
  };

  const filteredTemplates = useMemo(() => {
    let filtered = getCurrentTemplates();

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, selectedCategory, searchQuery, officialTemplates, communityTemplates]);


  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-primary">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={loadTemplates}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Choose Your Template</h1>
        <p className="text-secondary text-sm md:text-base">Select a template to get started or build from scratch</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-surface-elevated p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('official')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'official'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                : 'text-secondary hover:text-primary hover:bg-surface-elevated'
            }`}
          >
            Official Templates
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                : 'text-secondary hover:text-primary hover:bg-surface-elevated'
            }`}
          >
            Community Templates
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 pl-10 bg-surface-elevated/50 backdrop-blur-sm border border-app rounded-lg text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent text-sm md:text-base transition-all duration-300 hover:shadow-md hover:shadow-blue-500/20 focus:shadow-lg focus:shadow-blue-500/30"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 md:h-5 md:w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm md:text-base ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-700/50 backdrop-blur-sm text-gray-300 hover:bg-gray-600/50 border border-gray-600/30'
            }`}
          >
            All Templates
          </button>
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm md:text-base ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gray-700/50 backdrop-blur-sm text-gray-300 hover:bg-gray-600/50 border border-gray-600/30'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* All Templates - Same grid layout as user/page */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-primary">
            {selectedCategory === 'all' ? 'All Templates' : `${TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory)?.name} Templates`}
          </h2>
          <span className="text-secondary text-sm font-medium bg-surface-elevated px-3 py-1 rounded-full">
            {filteredTemplates.length} templates
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => onTemplateSelect(template)}
              onPreview={() => handleTemplatePreview(template)}
              isFeatured={template.is_featured}
            />
          ))}
        </div>
      </div>

      {/* Start from Scratch Option */}
      <div className="border-t border-blue-500/30 pt-6 md:pt-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">Don't see what you're looking for?</h3>
            <p className="text-secondary mb-6 text-sm md:text-base">Start with a blank canvas and build your website from scratch</p>
          </div>
          <button
            onClick={onStartFromScratch}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20 text-sm md:text-base"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Start from Scratch
          </button>
        </div>
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
});

interface TemplateCardProps {
  template: Template;
  onSelect: () => void;
  onPreview: () => void;
  isFeatured: boolean;
}

const TemplateCard = memo(({ template, onSelect, onPreview, isFeatured }: TemplateCardProps) => {
  // Use the same card structure as WebsiteCard from user/main and user/page
  return (
    <div 
      className="bg-surface border border-app rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-500/50 cursor-pointer"
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary mb-1 line-clamp-2">
            {template.name}
          </h3>
          <p className="text-sm text-secondary mb-2">
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)} Template
          </p>
          {template.is_community && template.creator_username && (
            <p className="text-xs text-secondary">
              by {template.creator_username}
            </p>
          )}
        </div>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {template.is_community ? 'Community' : 'Official'}
        </span>
      </div>

      {/* Template Preview - Browser-like frame (same as WebsiteCard) */}
      <div className="w-full mb-4">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-t-lg p-2 flex items-center gap-2 border border-b-0 border-app">
          {/* Browser dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          {/* Browser address bar */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded px-3 py-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            {template.name.toLowerCase().replace(/\s+/g, '-')}.webeenthere.com
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-app rounded-b-lg overflow-hidden shadow-inner relative" style={{ aspectRatio: '16/9', height: 'auto', minHeight: '180px' }}>
          {template.source_website_id ? (
            <div className="w-full h-full relative flex items-center justify-center" style={{ minHeight: '180px' }}>
              <WebsitePreviewImage
                websiteId={template.source_website_id}
                alt={`${template.name} preview`}
                className="w-full h-full"
                style={{ objectFit: 'contain', width: '100%', height: '100%', maxHeight: '100%' }}
              />
            </div>
          ) : (
            <div className="preview-placeholder text-center flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-800" style={{ minHeight: '180px' }}>
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Template Preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-secondary mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="flex-1 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 rounded-md transition-colors"
        >
          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Use Template
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-md transition-colors"
        >
          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
      </div>
    </div>
  );
});

TemplateSelector.displayName = 'TemplateSelector';
TemplateCard.displayName = 'TemplateCard';

export default TemplateSelector;
