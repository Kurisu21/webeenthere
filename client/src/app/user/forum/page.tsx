'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import { forumApi, ForumCategory, ForumThread, ThreadListResponse } from '../../../lib/forumApi';
import ThreadViewer from '../../_components/forum/ThreadViewer';
import ForumSearch from '../../_components/forum/ForumSearch';
import { getProfileImageUrl } from '../../../lib/apiConfig';
import { useAuth } from '../../_components/auth/AuthContext';

export default function ForumPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ThreadListResponse | null>(null);
  const [pinnedThreads, setPinnedThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPinned, setIsLoadingPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
  const [editingThread, setEditingThread] = useState<ForumThread | null>(null);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    categoryId: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchPinnedThreads();
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [selectedCategory, currentPage, sortBy, viewMode]);

  const fetchCategories = async () => {
    try {
      const data = await forumApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchPinnedThreads = async () => {
    try {
      setIsLoadingPinned(true);
      const data = await forumApi.getThreads({ pinned: true, limit: 5 });
      setPinnedThreads(data.threads || []);
    } catch (error) {
      console.error('Failed to fetch pinned threads:', error);
    } finally {
      setIsLoadingPinned(false);
    }
  };

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const resp: any = await forumApi.getThreads({
        categoryId: viewMode === 'all' ? (selectedCategory || undefined) : undefined,
        authorId: viewMode === 'my' ? user?.id?.toString() : undefined,
        page: currentPage,
        limit: 10,
        sortBy
      } as any);

      if (Array.isArray(resp)) {
        setThreads({
          threads: resp as ForumThread[],
          total: (resp as ForumThread[]).length,
          page: currentPage,
          limit: 10,
          totalPages: 1
        });
      } else {
        setThreads(resp as ThreadListResponse);
      }
    } catch (error) {
      setError('Failed to fetch threads');
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThread.title || !newThread.content || !newThread.categoryId) return;

    try {
      if (editingThread) {
        await handleUpdateThread(e);
      } else {
        await forumApi.createThread(newThread);
        setNewThread({ title: '', content: '', categoryId: '' });
        setIsCreatingThread(false);
        fetchThreads();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };


  const handleThreadSelect = (thread: ForumThread) => {
    setSelectedThread(thread);
  };

  const handleBackToList = () => {
    setSelectedThread(null);
    fetchThreads();
  };

  const handleEditThread = (thread: ForumThread, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingThread(thread);
    // Handle both categoryId and category_id (from database)
    const categoryId = thread.categoryId || (thread as any).category_id || '';
    setNewThread({
      title: thread.title,
      content: thread.content,
      categoryId: categoryId.toString()
    });
    setIsCreatingThread(true);
  };

  const handleDeleteThread = async (thread: ForumThread, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${thread.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await forumApi.deleteThread(thread.id);
      fetchThreads();
    } catch (error: any) {
      alert(error?.message || 'Failed to delete thread');
      console.error('Error deleting thread:', error);
    }
  };

  const handleUpdateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingThread || !newThread.title || !newThread.content || !newThread.categoryId) return;

    try {
      await forumApi.updateThread(editingThread.id, {
        title: newThread.title,
        content: newThread.content,
        categoryId: newThread.categoryId
      });
      setEditingThread(null);
      setNewThread({ title: '', content: '', categoryId: '' });
      setIsCreatingThread(false);
      fetchThreads();
    } catch (error: any) {
      alert(error?.message || 'Failed to update thread');
      console.error('Error updating thread:', error);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getUserInitial = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  if (selectedThread) {
    return (
      <div className="min-h-screen bg-surface">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <DashboardSidebar />
          <MainContentWrapper>
            <ThreadViewer
              threadId={selectedThread.id}
              onBack={handleBackToList}
            />
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
          <h1 className="text-4xl font-bold text-primary mb-4">Community Forum</h1>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Join the conversation, ask questions, and share your experiences with the community.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <ForumSearch
            onThreadSelect={handleThreadSelect}
            placeholder="Search forum threads..."
          />
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => setSelectedCategory('')}
              className={`p-6 rounded-lg border transition-all duration-200 text-left ${
                selectedCategory === ''
                  ? 'bg-primary/10 dark:bg-primary/20 border-primary/50 dark:border-primary/50 text-primary dark:text-primary'
                  : 'bg-surface-elevated border-app hover:border-primary/30 dark:hover:border-primary/30 text-primary'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                selectedCategory === ''
                  ? 'bg-primary/20 dark:bg-primary/30'
                  : 'bg-primary/10 dark:bg-primary/20'
              }`}>
                <svg className="w-6 h-6 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">All Threads</h3>
              <p className="text-secondary text-sm">Browse all discussions</p>
            </button>
            
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-lg border transition-all duration-200 text-left ${
                  selectedCategory === category.id
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary/50 dark:border-primary/50 text-primary dark:text-primary'
                    : 'bg-surface-elevated border-app hover:border-primary/30 dark:hover:border-primary/30 text-primary'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  selectedCategory === category.id
                    ? 'bg-primary/20 dark:bg-primary/30'
                    : 'bg-primary/10 dark:bg-primary/20'
                }`}>
                  <svg className="w-6 h-6 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <p className="text-secondary text-sm">{category.description}</p>
                <p className="text-primary/70 dark:text-primary/70 text-sm mt-2">{category.threadCount} threads</p>
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Threads Section */}
        {viewMode === 'all' && !selectedCategory && pinnedThreads.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <h2 className="text-2xl font-semibold text-primary">Pinned Threads</h2>
            </div>
            <div className="space-y-4">
              {pinnedThreads.map(thread => {
                const isOwnThread = user && (thread.author_id?.toString() === user.id.toString() || thread.authorId?.toString() === user.id.toString());
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleThreadSelect(thread)}
                    className={`bg-surface rounded-lg border p-6 hover:border-app transition-all duration-200 cursor-pointer group ${
                      isOwnThread ? 'border-primary/50 bg-primary/5' : 'border-yellow-500/30 bg-yellow-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                          <h3 className="text-primary font-semibold group-hover:text-purple-400 transition-colors">
                            {thread.title}
                          </h3>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                            Pinned
                          </span>
                          {isOwnThread && (
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                              Your Thread
                            </span>
                          )}
                          {thread.isLocked && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                              Locked
                            </span>
                          )}
                        </div>
                        <p className="text-secondary text-sm mb-3 line-clamp-2">
                          {thread.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-secondary">
                          {thread.category_name && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                              {thread.category_name}
                            </span>
                          )}
                          <span>{thread.replies || thread.replies_count || 0} replies</span>
                          <span>{thread.views || 0} views</span>
                          <span>{thread.likes || 0} likes</span>
                          <span>{formatDate(thread.createdAt || thread.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Threads Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-primary">
                {viewMode === 'my' 
                  ? 'My Threads'
                  : selectedCategory 
                    ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} Threads`
                    : 'Recent Threads'
                }
              </h2>
              {user && (
                <div className="flex gap-2 border border-app rounded-lg p-1">
                  <button
                    onClick={() => {
                      setViewMode('all');
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1 rounded text-sm transition-colors ${
                      viewMode === 'all'
                        ? 'bg-primary/20 text-primary'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    All Threads
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('my');
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1 rounded text-sm transition-colors ${
                      viewMode === 'my'
                        ? 'bg-primary/20 text-primary'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    My Threads
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="updatedAt">Latest Activity</option>
                <option value="replies">Most Replies</option>
                <option value="views">Most Views</option>
                <option value="likes">Most Likes</option>
              </select>
              <button
                onClick={() => setIsCreatingThread(true)}
                className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface dark:hover:bg-surface-elevated text-primary dark:text-primary border border-app hover:border-primary/50 dark:hover:border-primary/50 rounded-lg transition-all duration-200 font-medium"
              >
                New Thread
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-primary">Loading threads...</p>
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
                <p className="text-primary text-lg font-medium mb-2">Error Loading Threads</p>
                <p className="text-secondary">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {threads?.threads
                  .filter(thread => viewMode === 'all' && !selectedCategory ? !thread.isPinned : true) // Filter out pinned threads from regular list when showing pinned section
                  .map(thread => {
                  const isOwnThread = user && (thread.author_id?.toString() === user.id.toString() || thread.authorId?.toString() === user.id.toString());
                  return (
                    <div
                      key={thread.id}
                      onClick={() => handleThreadSelect(thread)}
                      className={`bg-surface rounded-lg border p-6 hover:border-app transition-all duration-200 cursor-pointer group ${
                        isOwnThread ? 'border-primary/50 bg-primary/5' : 'border-app'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-primary font-semibold group-hover:text-purple-400 transition-colors">
                              {thread.title}
                            </h3>
                            {isOwnThread && (
                              <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                                Your Thread
                              </span>
                            )}
                          {thread.isPinned && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                              Pinned
                            </span>
                          )}
                          {thread.isLocked && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                              Locked
                            </span>
                          )}
                        </div>
                        
                        <p className="text-secondary text-sm mb-3 line-clamp-2">
                          {thread.content.substring(0, 200)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-secondary">
                          {thread.category_name && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                              {thread.category_name}
                            </span>
                          )}
                          <span>{thread.replies || thread.replies_count || 0} replies</span>
                          <span>{thread.views || 0} views</span>
                          <span>{thread.likes || 0} likes</span>
                          <span>{formatDate(thread.createdAt || thread.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex items-center gap-2">
                        {isOwnThread && (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleEditThread(thread, e)}
                              className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                              title="Edit thread"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => handleDeleteThread(thread, e)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              title="Delete thread"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {(thread.author_id || thread.authorId) && getProfileImageUrl(thread.author_id || thread.authorId) ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-app">
                            <img
                              src={getProfileImageUrl(thread.author_id || thread.authorId) || ''}
                              alt={thread.author_name || thread.authorName || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full bg-primary/10 dark:bg-primary/20 border border-app rounded-full flex items-center justify-center"><span class="text-primary dark:text-primary font-medium text-sm">${getUserInitial(thread.author_name || thread.authorName)}</span></div>`;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center border border-app">
                            <span className="text-primary dark:text-primary font-medium text-sm">
                              {getUserInitial(thread.author_name || thread.authorName)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              {threads?.threads.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <p className="text-secondary">No threads found</p>
                  <button
                    onClick={() => setIsCreatingThread(true)}
                    className="mt-4 px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface dark:hover:bg-surface-elevated text-primary dark:text-primary border border-app hover:border-primary/50 dark:hover:border-primary/50 rounded-lg transition-all duration-200 font-medium"
                  >
                    Create First Thread
                  </button>
                </div>
              )}

              {/* Pagination */}
              {threads && threads.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-surface-elevated hover:bg-surface disabled:bg-surface-elevated disabled:text-secondary text-primary rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-secondary">
                    Page {currentPage} of {threads.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(threads.totalPages, prev + 1))}
                    disabled={currentPage === threads.totalPages}
                    className="px-4 py-2 bg-surface-elevated hover:bg-surface disabled:bg-surface-elevated disabled:text-secondary text-primary rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Thread Modal */}
        {isCreatingThread && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-elevated rounded-xl border border-app w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-app">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-primary">
                    {editingThread ? 'Edit Thread' : 'Create New Thread'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsCreatingThread(false);
                      setEditingThread(null);
                      setNewThread({ title: '', content: '', categoryId: '' });
                    }}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateThread} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newThread.title}
                    onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter thread title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Category
                  </label>
                  <select
                    value={newThread.categoryId}
                    onChange={(e) => setNewThread(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id.toString()}>
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
                    value={newThread.content}
                    onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                    placeholder="Write your thread content..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-app">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingThread(false);
                      setEditingThread(null);
                      setNewThread({ title: '', content: '', categoryId: '' });
                    }}
                    className="px-6 py-2 text-secondary hover:text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface dark:hover:bg-surface-elevated text-primary dark:text-primary border border-app hover:border-primary/50 dark:hover:border-primary/50 rounded-lg transition-all duration-200 font-medium"
                  >
                    {editingThread ? 'Update Thread' : 'Create Thread'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
