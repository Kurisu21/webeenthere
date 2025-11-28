'use client';

import React, { useState, useEffect } from 'react';
import { helpCenterApi, HelpArticle, HelpCategory } from '../../../lib/helpCenterApi';

interface ArticleEditorProps {
  article?: HelpArticle;
  onSave: (article: HelpArticle) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function ArticleEditor({ article, onSave, onCancel, isOpen }: ArticleEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (article) {
        setFormData({
          title: article.title,
          content: article.content,
          category: article.category
        });
      } else {
        setFormData({
          title: '',
          content: '',
          category: ''
        });
      }
    }
  }, [article, isOpen]);

  const fetchCategories = async () => {
    try {
      const cats = await helpCenterApi.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (article) {
        const updatedArticle = await helpCenterApi.updateArticle(article.id, formData);
        onSave(updatedArticle);
      } else {
        const newArticle = await helpCenterApi.createArticle({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          isPublished: true // Always publish for admin
        });
        onSave(newArticle);
      }
    } catch (error) {
      setError('Failed to save article');
      console.error('Error saving article:', error);
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-elevated rounded-xl border border-app w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-app">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">
              {article ? 'Edit Article' : 'Create New Article'}
            </h2>
            <button
              onClick={onCancel}
              className="text-secondary hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter article title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={12}
              className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
              placeholder="Enter article content (Markdown supported)"
              required
            />
          </div>


          <div className="flex justify-end gap-4 pt-4 border-t border-app">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-secondary hover:text-primary transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface dark:hover:bg-surface-elevated text-primary dark:text-primary border border-app hover:border-primary/50 dark:hover:border-primary/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
            >
              {isLoading ? 'Saving...' : (article ? 'Update Article' : 'Create Article')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
