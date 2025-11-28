'use client';

import React, { useState, useEffect } from 'react';
import { forumApi, ForumThread, ThreadListResponse } from '../../../lib/forumApi';

interface ThreadListProps {
  onModerate: (threadId: string, action: string) => void;
  refreshTrigger?: number;
}

export default function ThreadList({ onModerate, refreshTrigger }: ThreadListProps) {
  const [threads, setThreads] = useState<ThreadListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [categories, setCategories] = useState<any[]>([]);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch all threads without pagination
      const data = await forumApi.getThreads({
        categoryId: selectedCategory || undefined,
        page: 1,
        limit: 1000, // Large limit to get all threads
        sortBy: sortBy
      });
      setThreads(data);
    } catch (error) {
      setError('Failed to fetch threads');
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await forumApi.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [sortBy, selectedCategory, refreshTrigger]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleModerate = async (threadId: string, action: string) => {
    try {
      await forumApi.moderateThread(threadId, action);
      onModerate(threadId, action);
      fetchThreads();
    } catch (error) {
      setError('Failed to moderate thread');
      console.error('Error moderating thread:', error);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
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

  if (isLoading && !threads) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading threads...</p>
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
          <p className="text-primary text-lg font-medium mb-2">Error Loading Threads</p>
          <p className="text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="updatedAt">Latest Activity</option>
            <option value="replies">Most Replies</option>
            <option value="views">Most Views</option>
            <option value="likes">Most Likes</option>
          </select>
        </div>
      </div>

      {/* Threads Table */}
      <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-app">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Thread
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {threads?.threads.map((thread) => {
                // Map database fields to component fields
                const isPinned = thread.isPinned || thread.is_pinned || false;
                const isLocked = thread.isLocked || thread.is_locked || false;
                const createdAt = thread.createdAt || thread.created_at || thread.updatedAt || thread.updated_at;
                
                return (
                  <tr key={thread.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-primary font-medium">{thread.title}</div>
                          {isPinned && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                              Pinned
                            </span>
                          )}
                          {isLocked && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                              Locked
                            </span>
                          )}
                        </div>
                        <div className="text-secondary text-sm mt-1">
                          {thread.content?.substring(0, 100)}...
                        </div>
                        <div className="text-secondary text-xs mt-2">
                          {formatDate(createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary">
                      {categories.find(c => c.id === thread.categoryId || c.id === thread.category_id)?.name || thread.categoryId || thread.category_id}
                    </td>
                    <td className="px-6 py-4 text-secondary text-sm">
                      <div className="space-y-1">
                        <div>{thread.replies || thread.replies_count || 0} replies</div>
                        <div>{thread.views || 0} views</div>
                        <div>{thread.likes || 0} likes</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleModerate(thread.id, isPinned ? 'unpin' : 'pin')}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isPinned 
                              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                              : 'bg-surface text-secondary hover:bg-yellow-500/20 hover:text-yellow-400'
                          }`}
                          title={isPinned ? 'Unpin thread' : 'Pin thread'}
                        >
                          {isPinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                          onClick={() => handleModerate(thread.id, isLocked ? 'unlock' : 'lock')}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isLocked 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-surface text-secondary hover:bg-red-500/20 hover:text-red-400'
                          }`}
                          title={isLocked ? 'Unlock thread' : 'Lock thread'}
                        >
                          {isLocked ? 'Unlock' : 'Lock'}
                        </button>
                        <button
                          onClick={() => handleModerate(thread.id, 'delete')}
                          className="text-xs px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                          title="Delete thread"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {threads?.threads.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-secondary">No threads found</p>
          </div>
        )}
      </div>
    </div>
  );
}
