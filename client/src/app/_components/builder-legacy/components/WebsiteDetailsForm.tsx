'use client';

import React from 'react';
import { EnhancedTemplate } from '../../../_data/enhanced-templates';

interface WebsiteDetailsFormProps {
  websiteTitle: string;
  websiteSlug: string;
  selectedTemplate: EnhancedTemplate | null;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const WebsiteDetailsForm: React.FC<WebsiteDetailsFormProps> = ({
  websiteTitle,
  websiteSlug,
  selectedTemplate,
  onTitleChange,
  onSlugChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Website Details</h1>
        <p className="text-gray-400">Enter your website information</p>
      </div>

      <div className="max-w-2xl">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Website Title *
          </label>
          <input
            type="text"
            value={websiteTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter your website title"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Website URL (optional)
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-700 bg-gray-700 text-gray-300 text-sm">
              webeenthere.com/
            </span>
            <input
              type="text"
              value={websiteSlug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="your-website-url"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to auto-generate from title
          </p>
        </div>

        {selectedTemplate && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-white font-medium mb-2">Selected Template</h3>
            <div className="flex items-center">
              <span className="text-2xl mr-3">{selectedTemplate.image}</span>
              <div>
                <p className="text-white font-medium">{selectedTemplate.name}</p>
                <p className="text-gray-400 text-sm">{selectedTemplate.description}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Continue to Builder
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Templates
          </button>
        </div>
      </div>
    </div>
  );
};








