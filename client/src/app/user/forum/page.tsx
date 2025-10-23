'use client';

import React, { useState, useEffect } from 'react';
// import { forumApi, ForumCategory, ForumThread, ThreadListResponse } from '../../lib/forumApi';
// import ThreadViewer from '../_components/forum/ThreadViewer';
// import ForumSearch from '../_components/forum/ForumSearch';

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ThreadListResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [selectedCategory, currentPage, sortBy]);

  const fetchCategories = async () => {
    try {
      const data = await forumApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await forumApi.getThreads(
        selectedCategory || undefined,
        currentPage,
        10,
        sortBy
      );
      setThreads(data);
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
      await forumApi.createThread(newThread);
      setNewThread({ title: '', content: '', categoryId: '', tags: [] });
      setIsCreatingThread(false);
      fetchThreads();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newThread.tags.includes(tagInput.trim())) {
      setNewThread(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewThread(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleThreadSelect = (thread: ForumThread) => {
    setSelectedThread(thread);
  };

  const handleBackToList = () => {
    setSelectedThread(null);
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

  if (selectedThread) {
    return (
      <ThreadViewer
        threadId={selectedThread.id}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface">
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
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                  : 'bg-surface-elevated border-app hover:border-app text-primary'
              }`}
            >
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                    : 'bg-surface-elevated border-app hover:border-app text-primary'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  category.color === 'blue' ? 'bg-blue-600/20' :
                  category.color === 'purple' ? 'bg-purple-600/20' :
                  category.color === 'green' ? 'bg-green-600/20' :
                  category.color === 'red' ? 'bg-red-600/20' :
                  category.color === 'yellow' ? 'bg-yellow-600/20' :
                  'bg-indigo-600/20'
                }`}>
                  <svg className={`w-6 h-6 ${
                    category.color === 'blue' ? 'text-blue-400' :
                    category.color === 'purple' ? 'text-purple-400' :
                    category.color === 'green' ? 'text-green-400' :
                    category.color === 'red' ? 'text-red-400' :
                    category.color === 'yellow' ? 'text-yellow-400' :
                    'text-indigo-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <p className="text-secondary text-sm">{category.description}</p>
                <p className="text-purple-400 text-sm mt-2">{category.threadCount} threads</p>
              </button>
            ))}
          </div>
        </div>

        {/* Threads Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-primary">
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} Threads`
                : 'Recent Threads'
              }
            </h2>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="updatedAt">Latest Activity</option>
                <option value="replies">Most Replies</option>
                <option value="views">Most Views</option>
                <option value="likes">Most Likes</option>
              </select>
              <button
                onClick={() => setIsCreatingThread(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary rounded-lg transition-all duration-200"
              >
                New Thread
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
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
                {threads?.threads.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => handleThreadSelect(thread)}
                    className="bg-surface rounded-lg border border-app p-6 hover:border-gray-600 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-primary font-semibold group-hover:text-purple-400 transition-colors">
                            {thread.title}
                          </h3>
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
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{thread.replies} replies</span>
                          <span>{thread.views} views</span>
                          <span>{thread.likes} likes</span>
                          <span>{formatDate(thread.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {threads?.threads.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <p className="text-secondary">No threads found</p>
                  <button
                    onClick={() => setIsCreatingThread(true)}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary rounded-lg transition-all duration-200"
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
                    className="px-4 py-2 bg-gray-700 hover:bg-surface disabled:bg-surface-elevated disabled:text-secondary text-primary rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300">
                    Page {currentPage} of {threads.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(threads.totalPages, prev + 1))}
                    disabled={currentPage === threads.totalPages}
                    className="px-4 py-2 bg-gray-700 hover:bg-surface disabled:bg-surface-elevated disabled:text-secondary text-primary rounded-lg transition-colors"
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
            <div className="bg-gray-800 rounded-xl border border-app w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-app">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-primary">Create New Thread</h2>
                  <button
                    onClick={() => {
                      setIsCreatingThread(false);
                      setNewThread({ title: '', content: '', categoryId: '', tags: [] });
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newThread.content}
                    onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                    placeholder="Write your thread content..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-primary rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newThread.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-purple-400 hover:text-purple-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-app">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingThread(false);
                      setNewThread({ title: '', content: '', categoryId: '', tags: [] });
                    }}
                    className="px-6 py-2 text-secondary hover:text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary rounded-lg transition-all duration-200"
                  >
                    Create Thread
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
