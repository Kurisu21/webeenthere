'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import StatsCard from '../../_components/admin/StatsCard';
import ArticleList from '../../_components/admin/ArticleList';
import ArticleEditor from '../../_components/admin/ArticleEditor';
import CategoryManager from '../../_components/admin/CategoryManager';
import { helpCenterApi, HelpArticle, HelpStats } from '../../../lib/helpCenterApi';

export default function AdminHelpCenterPage() {
  const [stats, setStats] = useState<HelpStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await helpCenterApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch help center stats:', error);
      setError('Failed to load help center statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setIsEditorOpen(true);
  };

  const handleEditArticle = (article: HelpArticle) => {
    setEditingArticle(article);
    setIsEditorOpen(true);
  };

  const handleSaveArticle = (article: HelpArticle) => {
    setIsEditorOpen(false);
    setEditingArticle(null);
    setRefreshTrigger(prev => prev + 1);
    fetchStats();
  };

  const handleCancelEdit = () => {
    setIsEditorOpen(false);
    setEditingArticle(null);
  };

  const handleDeleteArticle = (articleId: string) => {
    setRefreshTrigger(prev => prev + 1);
    fetchStats();
  };

  const handleCategoryChange = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-primary">Loading help center...</p>
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
                <p className="text-primary text-lg font-medium mb-2">Error Loading Help Center</p>
                <p className="text-secondary">{error}</p>
              </div>
            </div>
          ) : (
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">Help Center Management</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleCreateArticle}
                    className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface dark:hover:bg-surface-elevated text-primary dark:text-primary border border-app hover:border-primary/50 dark:hover:border-primary/50 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow"
                  >
                    Create Article
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Articles"
                value={stats?.totalArticles || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                color="blue"
                subtitle="Published articles"
              />
              
              <StatsCard
                title="Categories"
                value={stats?.totalCategories || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
                color="purple"
                subtitle="Help categories"
              />
              
              <StatsCard
                title="Total Views"
                value={stats?.totalViews || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
                color="green"
                subtitle="Article views"
              />
              
              <StatsCard
                title="Helpful Rating"
                value={`${stats?.averageRating || '0.0'}%`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                }
                color="yellow"
                subtitle={`${stats?.totalHelpful || 0} helpful out of ${(stats?.totalHelpful || 0) + (stats?.totalNotHelpful || 0)} total votes`}
              />
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-app">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('articles')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'articles'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-secondary hover:text-primary hover:border-app'
                    }`}
                  >
                    Articles
                  </button>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'categories'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-secondary hover:text-primary hover:border-app'
                    }`}
                  >
                    Categories
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'articles' && (
              <ArticleList
                onEdit={handleEditArticle}
                onDelete={handleDeleteArticle}
                refreshTrigger={refreshTrigger}
              />
            )}

            {activeTab === 'categories' && (
              <CategoryManager onCategoryChange={handleCategoryChange} />
            )}
          </div>
          )}
        </MainContentWrapper>
      </div>

      {/* Article Editor Modal */}
      <ArticleEditor
        article={editingArticle}
        onSave={handleSaveArticle}
        onCancel={handleCancelEdit}
        isOpen={isEditorOpen}
      />
    </div>
  );
}
