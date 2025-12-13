'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  getAllTemplatesWithCreator, 
  toggleTemplateActive,
  toggleTemplateFeatured,
  deleteTemplate,
  importTemplateFromHTML,
  Template,
  TemplateImportData,
  TEMPLATE_CATEGORIES 
} from '../../../lib/templateApi';
import { TemplateCard } from '../shared/TemplateCard';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface TemplateManagementProps {
  onEditTemplate?: (template: Template) => void;
}

export default function TemplateManagement({ onEditTemplate }: TemplateManagementProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'official' | 'community'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'creator'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    template: Template | null;
  }>({ isOpen: false, template: null });

  // Import template state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Omit<TemplateImportData, 'is_featured'>>({
    name: '',
    description: '',
    category: 'portfolio'
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTemplatesWithCreator();
      setTemplates(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (template: Template) => {
    try {
      await toggleTemplateActive(template.id, !template.is_active);
      await loadTemplates(); // Refresh the list
    } catch (error: any) {
      setError(error.message || 'Failed to update template status');
    }
  };

  const handleToggleFeatured = async (template: Template) => {
    try {
      await toggleTemplateFeatured(template.id, !template.is_featured);
      await loadTemplates(); // Refresh the list
    } catch (error: any) {
      setError(error.message || 'Failed to update template featured status');
    }
  };

  const handleDeleteTemplate = (template: Template) => {
    setDeleteConfirm({ isOpen: true, template });
  };

  const confirmDeleteTemplate = async () => {
    if (!deleteConfirm.template) return;
    
    try {
      await deleteTemplate(deleteConfirm.template.id);
      await loadTemplates(); // Refresh the list
      setDeleteConfirm({ isOpen: false, template: null });
    } catch (error: any) {
      setError(error.message || 'Failed to delete template');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/html' && !file.name.toLowerCase().endsWith('.html')) {
        setError('Please select an HTML file');
        return;
      }
      setImportFile(file);
      // Auto-fill name from filename if name is empty
      if (!importData.name) {
        const nameWithoutExt = file.name.replace(/\.html$/i, '');
        setImportData(prev => ({ ...prev, name: nameWithoutExt }));
      }
    }
  };

  const handleImportTemplate = async () => {
    if (!importFile) {
      setError('Please select an HTML file');
      return;
    }

    if (!importData.name || !importData.description || !importData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      await importTemplateFromHTML(importFile, {
        ...importData,
        is_featured: isFeatured
      });
      
      // Reset form
      setImportFile(null);
      setImportData({ name: '', description: '', category: 'portfolio' });
      setIsFeatured(false);
      setShowImportModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh templates list
      await loadTemplates();
    } catch (error: any) {
      setError(error.message || 'Failed to import template');
    } finally {
      setImporting(false);
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportData({ name: '', description: '', category: 'portfolio' });
    setIsFeatured(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(template => 
        filterType === 'official' ? !template.is_community : template.is_community
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(template => 
        filterStatus === 'active' ? template.is_active : !template.is_active
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.creator_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort templates
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'creator':
          aValue = a.creator_username?.toLowerCase() || '';
          bValue = b.creator_username?.toLowerCase() || '';
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [templates, filterType, filterStatus, searchQuery, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = templates.length;
    const official = templates.filter(t => !t.is_community).length;
    const community = templates.filter(t => t.is_community).length;
    const active = templates.filter(t => t.is_active).length;
    const inactive = templates.filter(t => !t.is_active).length;

    return { total, official, community, active, inactive };
  }, [templates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-primary">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Template Management</h1>
          <p className="text-secondary">
            Manage official and community templates, control visibility, and moderate content
          </p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Import Template
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-surface-elevated border border-app rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary">Total Templates</p>
              <p className="text-2xl font-semibold text-primary">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated border border-app rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary">Official</p>
              <p className="text-2xl font-semibold text-primary">{stats.official}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated border border-app rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary">Community</p>
              <p className="text-2xl font-semibold text-primary">{stats.community}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated border border-app rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary">Active</p>
              <p className="text-2xl font-semibold text-primary">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated border border-app rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary">Inactive</p>
              <p className="text-2xl font-semibold text-primary">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-surface-elevated border border-app rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Search</label>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="official">Official</option>
              <option value="community">Community</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Sort By</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Date</option>
                <option value="name">Name</option>
                <option value="creator">Creator</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-surface-elevated border border-app rounded-lg text-primary hover:bg-surface transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-surface-elevated border border-app rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-app">
          <h2 className="text-lg font-semibold text-primary">
            Templates ({filteredTemplates.length})
          </h2>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-primary">No templates found</h3>
            <p className="mt-1 text-sm text-secondary">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your filters or search terms.' 
                : 'No templates have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                viewMode="admin"
                actions={{
                  onView: () => window.open(`/templates/${template.id}`, '_blank'),
                  onEdit: onEditTemplate ? () => onEditTemplate(template) : undefined,
                  onToggleActive: () => handleToggleActive(template),
                  onToggleFeatured: () => handleToggleFeatured(template),
                  onDelete: () => handleDeleteTemplate(template)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Template"
        message={`Are you sure you want to delete "${deleteConfirm.template?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTemplate}
        onCancel={() => setDeleteConfirm({ isOpen: false, template: null })}
        variant="danger"
      />

      {/* Import Template Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface-elevated border border-app rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">Import Template from HTML</h2>
              <button
                onClick={handleCloseImportModal}
                className="text-secondary hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  HTML File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-app rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,text/html"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="html-file-input"
                  />
                  <label
                    htmlFor="html-file-input"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-primary font-medium">
                      {importFile ? importFile.name : 'Click to select HTML file'}
                    </span>
                    <span className="text-sm text-secondary mt-1">
                      HTML files only (max 10MB)
                    </span>
                  </label>
                </div>
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={importData.name}
                  onChange={(e) => setImportData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                  className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={importData.description}
                  onChange={(e) => setImportData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter template description"
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={importData.category}
                  onChange={(e) => setImportData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-surface border-app rounded focus:ring-blue-500"
                />
                <label htmlFor="is-featured" className="ml-2 text-sm text-primary">
                  Mark as featured template
                </label>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The HTML file will be parsed to extract the body content and CSS from &lt;style&gt; tags. 
                  Make sure your HTML file contains valid HTML structure with CSS in style tags.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseImportModal}
                disabled={importing}
                className="px-4 py-2 bg-surface border border-app rounded-lg text-primary hover:bg-surface-elevated transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImportTemplate}
                disabled={importing || !importFile || !importData.name || !importData.description}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importing...
                  </>
                ) : (
                  'Import Template'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

