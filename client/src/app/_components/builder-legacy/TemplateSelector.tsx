'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { enhancedTemplates, categories, getTemplatesByCategory, getFeaturedTemplates, EnhancedTemplate } from '../../_data/enhanced-templates';
import TemplatePreview from './TemplatePreview';
import TemplatePreviewModal from './TemplatePreviewModal';

interface TemplateSelectorProps {
  onTemplateSelect: (template: EnhancedTemplate) => void;
  onStartFromScratch: () => void;
}

const TemplateSelector = memo(({ onTemplateSelect, onStartFromScratch }: TemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleTemplatePreview = useCallback((template: EnhancedTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  }, []);

  const handleTemplateSelect = useCallback((template: EnhancedTemplate) => {
    setIsModalOpen(false);
    onTemplateSelect(template);
  }, [onTemplateSelect]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  }, []);

  const filteredTemplates = useMemo(() => {
    let filtered = enhancedTemplates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = getTemplatesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const featuredTemplates = useMemo(() => getFeaturedTemplates(), []);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Choose Your Template</h1>
        <p className="text-secondary text-sm md:text-base">Select a template to get started or build from scratch</p>
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
          {categories.map((category) => (
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

      {/* Featured Templates */}
      {selectedCategory === 'all' && !searchQuery && (
        <div className="mb-6 md:mb-8">
          <div className="flex items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-white">Featured Templates</h2>
            <div className="ml-3 px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full">
              <span className="text-xs font-medium text-white">Premium</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {/* All Templates */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            {selectedCategory === 'all' ? 'All Templates' : `${categories.find(c => c.id === selectedCategory)?.name} Templates`}
          </h2>
          <span className="text-blue-400 text-sm font-medium bg-blue-500/10 px-3 py-1 rounded-full">
            {filteredTemplates.length} templates
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
  template: EnhancedTemplate;
  onSelect: () => void;
  onPreview: () => void;
  isFeatured: boolean;
}

const TemplateCard = memo(({ template, onSelect, onPreview, isFeatured }: TemplateCardProps) => {
  return (
    <div className="group cursor-pointer bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl overflow-hidden hover:border-blue-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105">
      {/* Template Preview */}
      <div className="relative h-48 overflow-hidden">
        <TemplatePreview template={template} onClick={onSelect} />
        
        {/* Preview Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:from-blue-700 hover:to-indigo-800 transform translate-y-2 group-hover:translate-y-0 shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-lg">{template.name}</h3>
          <div className="flex items-center space-x-2">
            {isFeatured && (
              <span className="text-xs text-yellow-400 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 px-3 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
            <span className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full font-medium">
              {categories.find(c => c.id === template.category)?.name}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-300 line-clamp-2 mb-3 leading-relaxed">{template.description}</p>
        
        {/* Template Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-blue-400 font-medium">{template.elements.length} elements</span>
          </div>
          <div className="flex space-x-1">
            {template.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-gray-700/50 backdrop-blur-sm text-gray-300 px-2 py-1 rounded text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

TemplateSelector.displayName = 'TemplateSelector';
TemplateCard.displayName = 'TemplateCard';

export default TemplateSelector;
