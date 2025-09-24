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
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Choose Your Template</h1>
        <p className="text-gray-400 text-sm md:text-base">Select a template to get started or build from scratch</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Templates
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="mr-1 md:mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Templates */}
      {selectedCategory === 'all' && !searchQuery && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4">⭐ Featured Templates</h2>
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
        <h2 className="text-lg md:text-xl font-semibold text-white mb-4">
          {selectedCategory === 'all' ? 'All Templates' : `${categories.find(c => c.id === selectedCategory)?.name} Templates`}
          <span className="text-gray-400 text-sm font-normal ml-2">({filteredTemplates.length} templates)</span>
        </h2>
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
      <div className="border-t border-gray-700 pt-6 md:pt-8">
        <div className="text-center">
          <h3 className="text-base md:text-lg font-semibold text-white mb-2">Don't see what you're looking for?</h3>
          <p className="text-gray-400 mb-4 text-sm md:text-base">Start with a blank canvas and build your website from scratch</p>
          <button
            onClick={onStartFromScratch}
            className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-white px-6 md:px-8 py-3 rounded-lg font-medium transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500 text-sm md:text-base"
          >
            <span className="mr-2">📝</span>
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
    <div className="group cursor-pointer bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
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
            className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gray-100 transform translate-y-2 group-hover:translate-y-0"
          >
            👁️ Preview
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">{template.name}</h3>
          <div className="flex items-center space-x-2">
            {isFeatured && (
              <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">
                ⭐ Featured
              </span>
            )}
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
              {categories.find(c => c.id === template.category)?.name}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 mb-2">{template.description}</p>
        
        {/* Template Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{template.elements.length} elements</span>
          <div className="flex space-x-1">
            {template.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-gray-700 px-2 py-1 rounded">
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
