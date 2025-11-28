'use client';

import React, { useState, useEffect } from 'react';
import { helpCenterApi, HelpCategory } from '../../../lib/helpCenterApi';

interface CategoryManagerProps {
  onCategoryChange?: () => void;
}

export default function CategoryManager({ onCategoryChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<HelpCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'document-text'
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await helpCenterApi.getCategories();
      setCategories(data);
    } catch (error) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingCategory) {
        await helpCenterApi.updateCategory(editingCategory.id, formData);
      } else {
        await helpCenterApi.createCategory(formData);
      }
      
      setFormData({ name: '', description: '', icon: 'document-text' });
      setEditingCategory(null);
      setIsCreating(false);
      fetchCategories();
      onCategoryChange?.();
    } catch (error) {
      setError('Failed to save category');
      console.error('Error saving category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: HelpCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon
    });
    setIsCreating(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await helpCenterApi.deleteCategory(categoryId);
        fetchCategories();
        onCategoryChange?.();
      } catch (error) {
        setError('Failed to delete category');
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', icon: 'document-text' });
    setEditingCategory(null);
    setIsCreating(false);
  };

  const iconOptions = [
    { value: 'document-text', label: 'Document' },
    { value: 'question-mark-circle', label: 'Question' },
    { value: 'wrench-screwdriver', label: 'Tools' },
    { value: 'credit-card', label: 'Billing' },
    { value: 'user-circle', label: 'User' },
    { value: 'play-circle', label: 'Getting Started' },
    { value: 'shield-check', label: 'Security' },
    { value: 'cog-6-tooth', label: 'Settings' }
  ];

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading categories...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-primary">Categories</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface dark:hover:bg-surface-elevated text-primary dark:text-primary border border-app hover:border-primary/50 dark:hover:border-primary/50 rounded-lg transition-all duration-200 font-medium"
        >
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-surface-elevated dark:bg-surface border border-app text-secondary dark:text-secondary rounded-lg p-4">
          <p className="text-secondary dark:text-secondary">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-surface-elevated rounded-lg border border-app p-6">
          <h4 className="text-lg font-medium text-primary mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Category name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                placeholder="Category description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Icon
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface dark:hover:bg-surface-elevated text-primary dark:text-primary border border-app hover:border-primary/50 dark:hover:border-primary/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
              >
                {isLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-secondary hover:text-primary transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-app">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-primary font-medium">{category.name}</div>
                      <div className="text-secondary text-sm mt-1">
                        {category.description || 'No description'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary">
                    {category.articleCount || 0}
                  </td>
                  <td className="px-6 py-4 text-secondary text-sm">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit category"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete category"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-secondary">No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
}
