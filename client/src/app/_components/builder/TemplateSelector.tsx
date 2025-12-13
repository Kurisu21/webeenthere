'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { 
  getCommunityTemplates, 
  getOfficialTemplates, 
  getActiveTemplatesWithCreator,
  Template,
  TEMPLATE_CATEGORIES 
} from '../../../lib/templateApi';
import TemplatePreview from './TemplatePreview';
import TemplatePreviewModal from './TemplatePreviewModal';
import { ActionButton } from '../shared/ActionButton';

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void;
  onStartFromScratch: () => void;
  isCreating?: boolean;
  canCreate?: boolean;
  usageLimit?: { used: number; limit: number; canCreate: boolean } | null;
}

const TemplateSelector = memo(({ onTemplateSelect, onStartFromScratch, isCreating = false, canCreate = true, usageLimit = null }: TemplateSelectorProps) => {
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

  const featuredTemplates = useMemo(() => {
    return getCurrentTemplates().filter(template => template.is_featured);
  }, [activeTab, officialTemplates, communityTemplates]);

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
    <div className="w-full">
      {/* Compact Header with Search and Tabs */}
      <div className="sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur-md border-b border-gray-800/50 mb-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Choose Your Template</h1>
            <p className="text-gray-400 text-sm">Select a template to get started or build from scratch</p>
          </div>
          
          {/* Search Bar - Compact */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2.5 pl-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all duration-300"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Compact */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('official')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'official'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50'
            }`}
          >
            Official Templates
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50'
            }`}
          >
            Community Templates
          </button>
        </div>

        {/* Category Filter - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm whitespace-nowrap flex-shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50'
            }`}
          >
            All Templates
          </button>
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm whitespace-nowrap flex-shrink-0 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Templates - Hero Section */}
      {selectedCategory === 'all' && !searchQuery && featuredTemplates.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h2 className="text-xl font-bold text-white">Featured Templates</h2>
              <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-xs font-medium text-yellow-400">
                Premium
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onTemplateSelect(template)}
                onPreview={() => handleTemplatePreview(template)}
                isFeatured={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates - Main Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {selectedCategory === 'all' ? 'All Templates' : `${TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory)?.name} Templates`}
          </h2>
          <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
            {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
          </span>
        </div>
        
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onTemplateSelect(template)}
                onPreview={() => handleTemplatePreview(template)}
                isFeatured={template.is_featured}
                disabled={isCreating}
                canCreate={canCreate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Start from Scratch Option */}
      <div className="border-t border-gray-800/50 pt-8 mt-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Start from Scratch</h3>
          <p className="text-gray-400 mb-6 text-sm">Build your website with complete creative freedom</p>
          <button
            onClick={onStartFromScratch}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Blank Website
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
  return (
    <div 
      className="group cursor-pointer bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-blue-500/60 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:scale-[1.02] hover:-translate-y-1"
      onClick={onSelect}
    >
      {/* Template Preview - Larger */}
      <div className="relative h-56 overflow-hidden bg-gray-900">
        <TemplatePreview template={template} onClick={onSelect} />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled && canCreate) onSelect();
            }}
            disabled={disabled || !canCreate}
            variant="primary"
            size="md"
            label="Use Template"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
            className="transform translate-y-4 group-hover:translate-y-0 shadow-xl hover:scale-105"
          />
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            variant="secondary"
            size="md"
            label="Preview"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            className="transform translate-y-4 group-hover:translate-y-0 shadow-xl bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20"
          />
        </div>

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-bold text-white">Featured</span>
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gray-900/80 backdrop-blur-sm text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30">
            {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.name || template.category}
          </span>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-5 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="mb-3">
          <h3 className="font-bold text-white text-lg mb-1.5 line-clamp-1">{template.name}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{template.description}</p>
        </div>
        
        {/* Template Details */}
        <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-700/50">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Category:</span>
              <span className="text-xs text-gray-400 font-medium capitalize">{template.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Type:</span>
              <span className="text-xs text-gray-400 font-medium">{template.is_community ? 'Community' : 'Official'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Featured:</span>
              <span className="text-xs text-gray-400 font-medium">{template.is_featured ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Status:</span>
              <span className="text-xs text-gray-400 font-medium">{template.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        {/* Content Info */}
        <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-700/50">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">HTML:</span>
            <span className="text-xs text-gray-400 font-medium">{template.html_base ? `${template.html_base.length} chars` : 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">CSS:</span>
            <span className="text-xs text-gray-400 font-medium">{template.css_base ? `${template.css_base.length} chars` : 'None'}</span>
          </div>
        </div>
        
        {/* Template Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${template.is_community ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <span className="text-xs text-gray-400 font-medium">
              {template.is_community ? 'Community' : 'Official'}
            </span>
          </div>
          {template.is_community && template.creator_username && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{template.creator_username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TemplateSelector.displayName = 'TemplateSelector';
TemplateCard.displayName = 'TemplateCard';

export default TemplateSelector;
