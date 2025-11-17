// components/builder/TemplatePreviewModal.tsx
import React, { useState } from 'react';
import { Template } from '../../../lib/templateApi';
import { WebsitePreviewImage } from '../shared/WebsitePreviewImage';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onSelect
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'elements'>('preview');

  if (!isOpen || !template) return null;

  const getTemplateBackground = (category: string) => {
    switch (category) {
      case 'portfolio':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'business':
        return 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)';
      case 'landing':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'personal':
        return 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
      case 'creative':
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      default:
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{template.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{template.description}</p>
              {template.is_community && template.creator_username && (
                <p className="text-sm text-blue-600 dark:text-blue-400">by {template.creator_username}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'elements'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Details
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-white dark:bg-gray-900">
          {activeTab === 'preview' ? (
            <div className="space-y-6">
              {/* Template Preview - Use WebsitePreviewImage if source_website_id exists */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg mx-auto max-w-4xl overflow-hidden border border-app">
                  {/* Browser-like frame (same as user/main and user/page) */}
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-t-lg p-2 flex items-center gap-2 border-b border-app">
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
                  <div className="relative" style={{ height: '600px', width: '100%', minHeight: '600px' }}>
                    {template.source_website_id ? (
                      // Use WebsitePreviewImage if source_website_id exists (same as user/main and user/page)
                      <WebsitePreviewImage
                        websiteId={template.source_website_id}
                        alt={`${template.name} preview`}
                        className="w-full h-full"
                        style={{ objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                      />
                    ) : (
                      // Fallback to gradient background for templates without source_website_id
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          background: template.category === 'portfolio' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : template.category === 'business'
                            ? 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
                            : template.category === 'landing'
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : '#f8f9fa'
                        }}
                      >
                        <div className="text-center text-white">
                          <div className="text-6xl mb-4">📄</div>
                          <h3 className="text-2xl font-bold">{template.name}</h3>
                          <p className="text-lg opacity-90 mt-2">{template.description}</p>
                          {template.is_community && template.creator_username && (
                            <p className="text-sm opacity-75 mt-2">by {template.creator_username}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Template Information</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300">{template.description}</p>
              </div>
              
              {template.html_base && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">HTML Content</h4>
                  <pre className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-3 rounded border dark:border-gray-700 overflow-x-auto">
                    {template.html_base.substring(0, 500)}
                    {template.html_base.length > 500 && '...'}
                  </pre>
                </div>
              )}
              
              {template.css_base && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">CSS Content</h4>
                  <pre className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-3 rounded border dark:border-gray-700 overflow-x-auto">
                    {template.css_base.substring(0, 500)}
                    {template.css_base.length > 500 && '...'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {template.source_website_id ? 'Template preview from website' : 'Template preview'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(template)}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;


