'use client';

import React, { useState, useEffect } from 'react';
import { 
  getTemplateById, 
  updateTemplate, 
  Template, 
  TEMPLATE_CATEGORIES 
} from '../../../lib/templateApi';

interface TemplateCustomizationProps {
  templateId: number | null;
  onClose: () => void;
  onSave: () => void;
}

export default function TemplateCustomization({ templateId, onClose, onSave }: TemplateCustomizationProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'personal',
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTemplateById(templateId);
      setTemplate(data);
      setFormData({
        name: data.name,
        description: data.description,
        category: data.category,
        is_featured: data.is_featured,
        is_active: data.is_active
      });
    } catch (error: any) {
      setError(error.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setError(null);
  };

  const handleSave = async () => {
    if (!templateId) return;

    try {
      setSaving(true);
      setError(null);
      
      await updateTemplate(templateId, formData);
      setSuccess(true);
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSave();
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!templateId) {
    return null;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="bg-surface border border-app rounded-xl shadow-2xl w-full max-w-2xl p-8">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-primary">Loading template...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-surface border border-app rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-app">
            <div>
              <h2 className="text-xl font-bold text-primary">Template Customization</h2>
              <p className="text-sm text-secondary mt-1">
                {template ? `Editing "${template.name}"` : 'Template Details'}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 hover:bg-surface-elevated rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">Template Updated Successfully!</h3>
                <p className="text-secondary">
                  The template has been updated and saved.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Template Info */}
                {template && (
                  <div className="bg-surface-elevated border border-app rounded-lg p-4">
                    <h3 className="text-sm font-medium text-primary mb-3">Template Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-secondary">Type:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          template.is_community 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {template.is_community ? 'Community' : 'Official'}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary">Creator:</span>
                        <span className="ml-2 text-primary">
                          {template.creator_username || 'System'}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary">Created:</span>
                        <span className="ml-2 text-primary">
                          {formatDate(template.created_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary">Last Updated:</span>
                        <span className="ml-2 text-primary">
                          {formatDate(template.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-6">
                  {/* Template Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={saving}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-primary mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                      disabled={saving}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-primary mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={saving}
                    >
                      {TEMPLATE_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-primary">Template Settings</h3>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="is_featured"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-surface-elevated border-app rounded focus:ring-blue-500 focus:ring-2"
                        disabled={saving}
                      />
                      <label htmlFor="is_featured" className="text-sm text-primary">
                        Mark as Featured Template
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-surface-elevated border-app rounded focus:ring-blue-500 focus:ring-2"
                        disabled={saving}
                      />
                      <label htmlFor="is_active" className="text-sm text-primary">
                        Template is Active (visible to users)
                      </label>
                    </div>
                  </div>

                  {/* Template Preview */}
                  {template && (
                    <div>
                      <h3 className="text-sm font-medium text-primary mb-3">Template Preview</h3>
                      <div className="bg-surface-elevated border border-app rounded-lg p-4">
                        <div className="w-full h-32 bg-surface border border-app rounded-lg flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-sm text-secondary">
                          <p><strong>HTML Content:</strong> {template.html_base ? `${template.html_base.length} characters` : 'No content'}</p>
                          <p><strong>CSS Content:</strong> {template.css_base ? `${template.css_base.length} characters` : 'No content'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex">
                        <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-app">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={saving}
                      className="px-4 py-2 text-secondary hover:text-primary transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:transform-none"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

