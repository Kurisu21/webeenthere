'use client';

import React, { useState, useEffect } from 'react';
import { helpCenterApi, HelpArticle, ArticleListResponse } from '../../../lib/helpCenterApi';

interface ArticleListProps {
  onEdit: (article: HelpArticle) => void;
  onDelete: (articleId: string) => void;
  refreshTrigger?: number;
}

export default function ArticleList({ onEdit, onDelete, refreshTrigger }: ArticleListProps) {
  const [articles, setArticles] = useState<ArticleListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await helpCenterApi.getArticles({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        page: currentPage,
        limit: 10
      });
      // Ensure we have a valid response structure
      if (data && typeof data === 'object') {
        setArticles({
          articles: data.articles || [],
          total: data.total || 0,
          page: data.page || currentPage,
          limit: data.limit || 10,
          totalPages: data.totalPages || 0
        });
      } else {
        setArticles({
          articles: [],
          total: 0,
          page: currentPage,
          limit: 10,
          totalPages: 0
        });
      }
    } catch (error) {
      setError('Failed to fetch articles');
      console.error('Error fetching articles:', error);
      // Set empty state on error
      setArticles({
        articles: [],
        total: 0,
        page: currentPage,
        limit: 10,
        totalPages: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await helpCenterApi.getCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [currentPage, refreshTrigger]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchArticles();
  };

  const handleDelete = async (articleId: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await helpCenterApi.deleteArticle(articleId);
        onDelete(articleId);
        fetchArticles();
      } catch (error) {
        setError('Failed to delete article');
        console.error('Error deleting article:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !articles) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-white text-lg font-medium mb-2">Error Loading Articles</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Search articles..."
          />
        </div>
        <div className="md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
        >
          Search
        </button>
      </div>

      {/* Articles Table */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {articles?.articles?.map((article) => (
                <tr key={article.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{article.title}</div>
                      <div className="text-gray-400 text-sm mt-1">
                        {article.content.substring(0, 100)}...
                      </div>
                      {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-gray-500 text-xs">+{article.tags.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {categories.find(c => c.id === article.category)?.name || article.category}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {article.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-green-400 text-sm">
                        {article.helpful}
                      </span>
                      <span className="text-gray-500 mx-1">/</span>
                      <span className="text-red-400 text-sm">
                        {article.notHelpful}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {formatDate(article.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(article)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit article"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete article"
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

        {articles?.articles?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400">No articles found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {articles && articles.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, articles.total)} of {articles.total} articles
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {articles.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(articles.totalPages, prev + 1))}
              disabled={currentPage === articles.totalPages}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
