'use client';

import React from 'react';
import { WebsitePreviewImage } from './WebsitePreviewImage';
import { Template } from '../../../lib/templateApi';
import { TEMPLATE_CATEGORIES } from '../../../lib/templateApi';

interface TemplateCardProps {
  template: Template;
  actions?: {
    onEdit?: () => void;
    onToggleActive?: () => void;
    onToggleFeatured?: () => void;
    onDelete?: () => void;
  };
  viewMode?: 'user' | 'admin';
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  actions = {},
  viewMode = 'admin'
}) => {
  const {
    onEdit,
    onToggleActive,
    onToggleFeatured,
    onDelete
  } = actions;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryName = (categoryId: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  };

  const getTemplateBackground = (category: string): string => {
    const backgrounds: { [key: string]: string } = {
      portfolio: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      business: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      personal: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      creative: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)',
      landing: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
      blog: 'linear-gradient(135deg, #f8f9fa 0%, #dee2e6 100%)',
      ecommerce: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minimal: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
      modern: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      classic: 'linear-gradient(135deg, #d4a574 0%, #c19a6b 100%)'
    };
    return backgrounds[category] || 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
  };

  return (
    <div className="bg-surface border border-app rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-500/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-primary mb-1 line-clamp-2">
            {template.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {template.is_featured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              template.is_community 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            }`}>
              {template.is_community ? 'Community' : 'Official'}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              template.is_active 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                template.is_active ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {template.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {template.creator_username && (
            <p className="text-xs text-secondary">
              Creator: {template.creator_username}
            </p>
          )}
        </div>
      </div>

      {/* Template Preview - Browser-like frame */}
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
            Template Preview
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-app rounded-b-lg overflow-hidden shadow-inner" style={{ aspectRatio: '16/9', minHeight: '200px' }}>
          {template.source_website_id ? (
            <WebsitePreviewImage
              websiteId={template.source_website_id}
              alt={`${template.name} preview`}
              className="w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center text-white text-center p-4"
              style={{ background: getTemplateBackground(template.category) }}
            >
              <div className="text-2xl font-bold mb-2">
                {template.name}
              </div>
              <div className="text-sm opacity-90">
                {getCategoryName(template.category)}
              </div>
              {template.description && (
                <div className="text-xs opacity-75 mt-2 line-clamp-2">
                  {template.description}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-secondary mb-4 space-y-1">
        <p>Category: {getCategoryName(template.category)}</p>
        <p>Created: {formatDate(template.created_at)}</p>
        {template.description && (
          <p className="line-clamp-2 text-xs mt-2">{template.description}</p>
        )}
      </div>

      {/* Actions - Admin Mode */}
      {viewMode === 'admin' && (
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}

          {onToggleFeatured && (
            <button
              onClick={onToggleFeatured}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                template.is_featured
                  ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40'
                  : 'text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/40'
              }`}
              title={template.is_featured ? 'Remove from Featured' : 'Make Featured'}
            >
              <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          )}

          {onToggleActive && (
            <button
              onClick={onToggleActive}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                template.is_active 
                  ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40' 
                  : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
              }`}
              title={template.is_active ? 'Deactivate' : 'Activate'}
            >
              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {template.is_active ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-md transition-colors"
              title="Delete Template"
            >
              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

