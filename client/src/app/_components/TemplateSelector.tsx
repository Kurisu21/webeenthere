'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { templates, categories, getTemplatesByCategory, getFeaturedTemplates, Template } from '../_data/templates-simple';
import TemplatePreview from './TemplatePreview';

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void;
  onStartFromScratch: () => void;
}

const TemplateSelector = memo(({ onTemplateSelect, onStartFromScratch }: TemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = getTemplatesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
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
    </div>
  );
});

interface TemplateCardProps {
  template: Template;
  onSelect: () => void;
  isFeatured: boolean;
}

const TemplateCard = memo(({ template, onSelect, isFeatured }: TemplateCardProps) => {
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
    >
      {/* Template Preview */}
      <div className="relative h-48 overflow-hidden">
        <TemplatePreview template={template} className="w-full h-full" />
        
        {isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold z-10">
            ⭐ Featured
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              Use Template
            </button>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">{template.name}</h3>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
            {categories.find(c => c.id === template.category)?.name}
          </span>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
      </div>
    </div>
  );
});

TemplateSelector.displayName = 'TemplateSelector';
TemplateCard.displayName = 'TemplateCard';

export default TemplateSelector;
