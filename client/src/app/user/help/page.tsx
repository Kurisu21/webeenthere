'use client';

import React, { useState, useEffect } from 'react';
import { helpCenterApi, HelpArticle, HelpCategory, ArticleListResponse } from '../../../lib/helpCenterApi';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function HelpCenterPage() {
  const [articles, setArticles] = useState<ArticleListResponse | null>(null);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchTerm, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await helpCenterApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await helpCenterApi.getArticles({
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        limit: 12
      });
      setArticles(data);
    } catch (error) {
      setError('Failed to fetch articles');
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchArticles();
  };

  const handleArticleSelect = async (article: HelpArticle) => {
    setSelectedArticle(article);
    // Increment view count
    try {
      await helpCenterApi.getArticle(article.id);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  const handleRateArticle = async (isHelpful: boolean) => {
    if (!selectedArticle) return;
    
    try {
      await helpCenterApi.rateArticle(selectedArticle.id, isHelpful);
      // Refresh the article data
      const updatedArticle = await helpCenterApi.getArticle(selectedArticle.id);
      setSelectedArticle(updatedArticle);
    } catch (error) {
      console.error('Failed to rate article:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-surface">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <DashboardSidebar />
          <MainContentWrapper>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackToList}
              className="flex items-center text-secondary hover:text-primary transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Help Center
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                {categories.find(c => c.id === selectedArticle.category)?.name || selectedArticle.category}
              </span>
              <span className="text-secondary text-sm">
                {formatDate(selectedArticle.createdAt)}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-primary mb-4">
              {selectedArticle.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-secondary">
              <span>{selectedArticle.views} views</span>
              <span>{selectedArticle.helpful} helpful</span>
              <span>{selectedArticle.notHelpful} not helpful</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-surface rounded-lg border border-app p-8 mb-8">
            <div className="prose prose-invert max-w-none">
              <div className="text-secondary whitespace-pre-wrap leading-relaxed">
                {selectedArticle.content}
              </div>
            </div>
          </div>

          {/* Tags */}
          {selectedArticle.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="bg-surface rounded-lg border border-app p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Was this article helpful?</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleRateArticle(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                Yes, helpful
              </button>
              <button
                onClick={() => handleRateArticle(false)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
                No, not helpful
              </button>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-secondary mb-4">Still need help?</p>
            <a
              href="/support"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Support
            </a>
          </div>
        </div>
          </MainContentWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Help Center</h1>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Find answers to common questions and learn how to get the most out of our platform.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-4 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              placeholder="Search for help articles..."
            />
            <button
              onClick={handleSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <svg className="h-6 w-6 text-secondary hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => setSelectedCategory('')}
              className={`p-6 rounded-lg border transition-all duration-200 text-left ${
                selectedCategory === ''
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                  : 'bg-surface-elevated border-app hover:border-app text-primary'
              }`}
            >
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">All Articles</h3>
              <p className="text-secondary text-sm">Browse all help articles</p>
            </button>
            
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-lg border transition-all duration-200 text-left ${
                  selectedCategory === category.id
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                    : 'bg-surface-elevated border-app hover:border-app text-primary'
                }`}
              >
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <p className="text-secondary text-sm">{category.description}</p>
                <p className="text-purple-400 text-sm mt-2">{category.articleCount} articles</p>
              </button>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-primary">
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} Articles`
                : 'All Articles'
              }
            </h2>
              {articles && (
              <span className="text-secondary">
                {articles.total} articles
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-primary">Loading articles...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-primary text-lg font-medium mb-2">Error Loading Articles</p>
                <p className="text-secondary">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles?.articles.map(article => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleSelect(article)}
                      className="bg-surface rounded-lg border border-app p-6 hover:border-app transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                        {categories.find(c => c.id === article.category)?.name || article.category}
                      </span>
                    </div>
                    
                    <h3 className="text-primary font-semibold mb-3 group-hover:text-purple-400 transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-secondary text-sm mb-4 line-clamp-3">
                      {article.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-secondary">
                      <span>{formatDate(article.createdAt)}</span>
                      <div className="flex items-center gap-3">
                        <span>{article.views} views</span>
                        <span>{article.helpful} helpful</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {articles?.articles.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-secondary">No articles found</p>
                </div>
              )}

              {/* Pagination */}
              {articles && articles.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-surface-elevated hover:bg-surface disabled:bg-surface-elevated disabled:text-secondary text-primary rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-secondary">
                    Page {currentPage} of {articles.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(articles.totalPages, prev + 1))}
                    disabled={currentPage === articles.totalPages}
                    className="px-4 py-2 bg-surface-elevated hover:bg-surface disabled:bg-surface-elevated disabled:text-secondary text-primary rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <div className="bg-surface rounded-lg border border-app p-8">
            <h3 className="text-2xl font-semibold text-primary mb-4">Still need help?</h3>
            <p className="text-secondary mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/user/support"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Support
              </a>
              <a
                href="/user/forum"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-elevated hover:bg-surface text-primary rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                Visit Forum
              </a>
            </div>
          </div>
        </div>
      </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
