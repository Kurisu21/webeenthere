'use client';

import React, { useState, useEffect } from 'react';
import { convertTemplateElementsToElements } from './utils/templateConverter';

interface GeneratedTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  onUseTemplate: (template: any) => void;
  reasoning?: string;
  suggestions?: string[];
}

const GeneratedTemplateModal: React.FC<GeneratedTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onUseTemplate,
  reasoning,
  suggestions = []
}) => {
  const [previewHtml, setPreviewHtml] = useState('');
  
  console.log('GeneratedTemplateModal render:', { isOpen, template: !!template, templateData: template });
  
  useEffect(() => {
    if (isOpen && template) {
      const html = template.html || '';
      const css = template.css || template.css_base || '';
      
      // Combine HTML and CSS for preview in iframe
      const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
      setPreviewHtml(fullHtml);
    }
  }, [isOpen, template]);
  
  // More lenient check - allow template to be an object even if some properties are missing
  const hasValidTemplate = template && (typeof template === 'object');
  
  if (!isOpen || !hasValidTemplate) {
    console.log('Modal not showing because:', { isOpen, hasTemplate: hasValidTemplate, templateType: typeof template });
    return null;
  }

  const handleUseTemplate = () => {
    // Convert template elements to builder format
    const convertedElements = convertTemplateElementsToElements(template.elements || []);
    const templateWithConvertedElements = {
      ...template,
      elements: convertedElements
    };
    
    onUseTemplate(templateWithConvertedElements);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {template.name || 'Generated Template'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
              {template.description || 'AI-generated website template'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Preview */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Template Preview
              </h3>
              
              <div className="rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden bg-white dark:bg-gray-900" style={{ height: '500px' }}>
                  {/* Real HTML preview with CSS in iframe */}
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-full border-0"
                      title="Template Preview"
                      sandbox="allow-same-origin allow-scripts"
                      style={{ minHeight: '500px' }}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8 flex items-center justify-center h-full">
                      <div>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Loading preview...</p>
                        </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Elements:</span>
                  <span className="text-gray-900 dark:text-white">
                    {template.elements?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Category:</span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {template.category || 'ai-generated'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {template.tags?.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded text-xs bg-blue-100/80 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Reasoning & Suggestions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                AI Analysis
              </h3>

              {reasoning && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Design Reasoning
                  </h4>
                  <div className="rounded-lg p-4 border bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
                    <p className="text-sm whitespace-pre-wrap">
                      {reasoning}
                    </p>
                  </div>
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Suggestions
                  </h4>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="rounded-lg p-3 border bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200"
                      >
                        <p className="text-sm">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleUseTemplate}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 flex items-center justify-center shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Use This Template
                </button>

                <button
                  onClick={onClose}
                  className="w-full font-medium py-3 px-4 rounded-md transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                >
                  Generate Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedTemplateModal;
