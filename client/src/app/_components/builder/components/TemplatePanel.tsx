'use client';

import React, { useState, useMemo } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  html: string;
  css: string;
  image?: string;
  is_featured?: boolean;
  tags?: string[];
}

interface TemplatePanelProps {
  templates: Template[];
  onLoadTemplate: (templateId: string) => void;
  isLoading: boolean;
}

export const TemplatePanel: React.FC<TemplatePanelProps> = ({
  templates,
  onLoadTemplate,
  isLoading
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(templates.map(t => t.category))];
    return cats;
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery]);

  const featuredTemplates = useMemo(() => {
    return templates.filter(template => template.is_featured);
  }, [templates]);

  if (isLoading) {
    return (
      <div className="p-4 border-b border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-700">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Templates
      </h3>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
        />
      </div>

      {/* Categories */}
      <div className="mb-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Templates */}
      {selectedCategory === 'all' && featuredTemplates.length > 0 && (
        <div className="mb-4">
          <h4 className="text-gray-300 text-sm font-medium mb-2">Featured</h4>
          <div className="space-y-2">
            {featuredTemplates.slice(0, 2).map(template => (
              <button
                key={template.id}
                onClick={() => onLoadTemplate(template.id)}
                className="w-full text-left p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
              >
                <div className="text-white text-sm font-medium">{template.name}</div>
                <div className="text-gray-400 text-xs">{template.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div>
        <h4 className="text-gray-300 text-sm font-medium mb-2">
          {selectedCategory === 'all' ? 'All Templates' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Templates`}
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => onLoadTemplate(template.id)}
              className="w-full text-left p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              <div className="text-white text-sm font-medium">{template.name}</div>
              <div className="text-gray-400 text-xs">{template.description}</div>
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-700 text-gray-300 px-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm">No templates found</div>
        </div>
      )}
    </div>
  );
};


