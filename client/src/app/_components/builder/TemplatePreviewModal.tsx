// components/builder/TemplatePreviewModal.tsx
import React, { useState } from 'react';
import { EnhancedTemplate } from '../../_data/enhanced-templates';

interface TemplatePreviewModalProps {
  template: EnhancedTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: EnhancedTemplate) => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onSelect
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'elements'>('preview');

  if (!isOpen || !template) return null;

  const renderElementPreview = (element: any) => {
    const elementStyle = {
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.size.width}px`,
      height: `${element.size.height}px`,
      ...element.styles,
      transform: 'scale(0.3)', // Scale down for preview
      transformOrigin: 'top left'
    };

    return (
      <div
        key={element.id}
        style={elementStyle}
        className="template-element-preview"
      >
        {element.content}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{template.image}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
              <p className="text-gray-600">{template.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'preview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'elements'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Elements ({template.elements.length})
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'preview' ? (
            <div className="space-y-6">
              {/* Template Preview */}
              <div className="bg-gray-100 rounded-lg p-8">
                <div className="bg-white rounded-lg shadow-lg mx-auto max-w-4xl overflow-hidden">
                  <div className="relative" style={{ height: '600px', width: '100%' }}>
                    {/* Background based on template category */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: template.category === 'portfolio' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : template.category === 'business'
                          ? 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
                          : template.category === 'landing'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#f8f9fa'
                      }}
                    />
                    
                    {/* Render elements */}
                    {template.elements.map(renderElementPreview)}
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Template Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{template.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Elements:</span>
                      <span className="font-medium">{template.elements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Featured:</span>
                      <span className="font-medium">{template.is_featured ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Template Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {template.elements.map((element, index) => (
                  <div
                    key={element.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-700">
                        {element.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {element.content.length > 50 
                        ? `${element.content.substring(0, 50)}...` 
                        : element.content
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      Position: ({element.position.x}, {element.position.y}) | 
                      Size: {element.size.width}×{element.size.height}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            This template includes {template.elements.length} pre-designed elements
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(template)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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


