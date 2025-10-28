'use client';

import React, { useState, useEffect } from 'react';
import { forumApi, ForumThread, ForumReply, ReplyListResponse } from '../../../lib/forumApi';

interface ThreadViewerProps {
  threadId: string;
  onBack: () => void;
}

export default function ThreadViewer({ threadId, onBack }: ThreadViewerProps) {
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ReplyListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  useEffect(() => {
    if (thread) {
      fetchReplies();
    }
  }, [thread, currentPage]);

  const fetchThread = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await forumApi.getThread(threadId);
      setThread(data);
    } catch (error) {
      setError('Failed to load thread');
      console.error('Error fetching thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const data = await forumApi.getReplies(threadId, {
        page: currentPage,
        limit: 20
      });
      const normalized: ReplyListResponse = Array.isArray((data as any))
        ? {
            replies: data as unknown as ForumReply[],
            total: (data as unknown as ForumReply[]).length,
            page: currentPage,
            limit: 20,
            totalPages: 1,
          }
        : (data as ReplyListResponse);
      setReplies(normalized);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await forumApi.createReply(threadId, replyContent);
      setReplyContent('');
      setIsReplying(false);
      fetchReplies();
      fetchThread(); // Update reply count
    } catch (error) {
      console.error('Error creating reply:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-white text-lg font-medium mb-2">Error Loading Thread</p>
          <p className="text-gray-400">{error || 'Thread not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Forum
        </button>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            {thread.views} views
          </span>
          <span className="text-gray-400 text-sm">
            {thread.replies} replies
          </span>
        </div>
      </div>

      {/* Thread */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{thread.title}</h1>
              <p className="text-gray-400 text-sm">
                By User • {formatDate(thread.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 whitespace-pre-wrap">
            {thread.content}
          </div>
        </div>

        {Array.isArray(thread.tags) && thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {thread.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Replies ({thread.replies})
          </h2>
          {!thread.isLocked && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
            >
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && !thread.isLocked && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 p-6">
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                  placeholder="Write your reply..."
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
                >
                  Post Reply
                </button>
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Replies List */}
        {(replies?.replies ?? []).map((reply) => (
          <div key={reply.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-medium">User</span>
                  <span className="text-gray-400 text-sm">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <div className="text-gray-300 whitespace-pre-wrap">
                  {reply.content}
                </div>
              </div>
            </div>
          </div>
        ))}

        {(replies?.replies?.length ?? 0) === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400">No replies yet</p>
            {!thread.isLocked && (
              <p className="text-gray-500 text-sm mt-2">Be the first to reply!</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {replies && replies.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {replies.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(replies.totalPages, prev + 1))}
            disabled={currentPage === replies.totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
