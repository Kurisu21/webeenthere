'use client';

import React, { useState, useEffect, useRef } from 'react';
import { forumApi, ForumThread, ForumReply, ReplyListResponse } from '../../../lib/forumApi';
import { getProfileImageUrl } from '../../../lib/apiConfig';
import { useAuth } from '../auth/AuthContext';

interface ThreadViewerProps {
  threadId: string;
  onBack: () => void;
}

export default function ThreadViewer({ threadId, onBack }: ThreadViewerProps) {
  const { user } = useAuth();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ReplyListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLikingThread, setIsLikingThread] = useState(false);
  const [likingReplyId, setLikingReplyId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState<string>('');
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const viewCountedRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset view counter when threadId changes
    viewCountedRef.current = false;
    fetchThread(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]); // Only depend on threadId, fetchThread is stable

  useEffect(() => {
    if (thread) {
      fetchReplies();
    }
  }, [thread, currentPage]);

  const fetchThread = async (shouldIncrementView: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      // Only increment view on initial load (first time viewing this thread)
      const incrementView = shouldIncrementView && !viewCountedRef.current;
      const data = await forumApi.getThread(threadId, incrementView);
      setThread(data);
      if (incrementView) {
        viewCountedRef.current = true;
      }
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

    // Check if thread is locked (handle both isLocked and is_locked from backend)
    if (thread?.isLocked || (thread as any)?.is_locked === 1 || (thread as any)?.is_locked === true) {
      setError('This thread is locked. You cannot add replies.');
      return;
    }

    try {
      await forumApi.createReply(threadId, replyContent);
      setReplyContent('');
      setIsReplying(false);
      setError(null);
      // Refresh both replies and thread to get updated counts (without incrementing view)
      await Promise.all([fetchReplies(), fetchThread(false)]);
    } catch (error: any) {
      console.error('Error creating reply:', error);
      if (error?.message?.includes('locked')) {
        setError('This thread is locked. You cannot add replies.');
      } else {
        setError(error?.message || 'Failed to create reply');
      }
    }
  };

  const handleLikeThread = async () => {
    if (!thread || isLikingThread) return;
    
    // Check if thread is locked (handle both isLocked and is_locked from backend)
    if (thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) {
      setError('This thread is locked. You cannot like or unlike it.');
      return;
    }
    
    setIsLikingThread(true);
    try {
      const updatedThread = await forumApi.toggleThreadLike(thread.id);
      setThread(updatedThread);
      setError(null);
    } catch (error: any) {
      console.error('Failed to like thread:', error);
      if (error?.message?.includes('logged in') || error?.message?.includes('Authentication')) {
        setError('Please log in to like threads.');
      } else if (error?.message?.includes('cannot like your own')) {
        setError('You cannot like your own thread.');
      } else if (error?.message?.includes('locked')) {
        setError('This thread is locked. You cannot like or unlike it.');
      } else {
        setError(error?.message || 'Failed to like thread.');
      }
    } finally {
      setIsLikingThread(false);
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (likingReplyId === replyId) return;
    
    // Check if thread is locked (handle both isLocked and is_locked from backend)
    if (thread?.isLocked || (thread as any)?.is_locked === 1 || (thread as any)?.is_locked === true) {
      setError('This thread is locked. You cannot like or unlike replies.');
      return;
    }
    
    setLikingReplyId(replyId);
    try {
      const updatedReply = await forumApi.toggleReplyLike(replyId);
      
      // Update the reply in the replies list
      if (replies) {
        const updatedReplies = replies.replies.map(reply => 
          reply.id === replyId ? updatedReply : reply
        );
        setReplies({
          ...replies,
          replies: updatedReplies
        });
      }
      setError(null);
    } catch (error: any) {
      console.error('Failed to like reply:', error);
      if (error?.message?.includes('cannot like your own')) {
        setError('You cannot like your own reply.');
      } else if (error?.message?.includes('locked')) {
        setError('This thread is locked. You cannot like or unlike replies.');
      } else {
        setError(error?.message || 'Failed to like reply.');
      }
    } finally {
      setLikingReplyId(null);
    }
  };

  const handleEditReply = (reply: ForumReply) => {
    setEditingReplyId(reply.id);
    setEditingReplyContent(reply.content);
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyContent('');
  };

  const handleSaveReply = async (replyId: string) => {
    if (!editingReplyContent.trim()) return;

    try {
      await forumApi.updateReply(replyId, { content: editingReplyContent });
      setEditingReplyId(null);
      setEditingReplyContent('');
      await Promise.all([fetchReplies(), fetchThread(false)]);
    } catch (error: any) {
      alert(error?.message || 'Failed to update reply');
      console.error('Error updating reply:', error);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return;
    }

    setDeletingReplyId(replyId);
    try {
      await forumApi.deleteReply(replyId);
      await Promise.all([fetchReplies(), fetchThread(false)]);
    } catch (error: any) {
      alert(error?.message || 'Failed to delete reply');
      console.error('Error deleting reply:', error);
    } finally {
      setDeletingReplyId(null);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading thread...</p>
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
          <p className="text-primary text-lg font-medium mb-2">Error Loading Thread</p>
          <p className="text-secondary">{error || 'Thread not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-secondary hover:text-primary transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Forum
        </button>
        
        <div className="flex items-center gap-2 mb-4">
          {thread.isPinned && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-app flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Pinned
            </span>
          )}
          {(thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs border border-app flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-primary mb-4">
          {thread.title}
        </h1>
        
        <div className="flex items-center gap-4 text-sm text-secondary">
          <span>{thread.views || 0} views</span>
          <span>{thread.replies || thread.replies_count || 0} replies</span>
          <span>{thread.likes || 0} likes</span>
          <span>{formatDate(thread.createdAt || thread.created_at)}</span>
        </div>
      </div>

      {/* Thread Content */}
      <div className="bg-surface-elevated dark:bg-surface rounded-lg border border-app p-8 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {thread.author_id && getProfileImageUrl(thread.author_id) ? (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-app">
                <img
                  src={getProfileImageUrl(thread.author_id) || ''}
                  alt={thread.author_name || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full bg-primary/10 dark:bg-primary/20 border border-app rounded-full flex items-center justify-center"><span class="text-primary dark:text-primary font-medium text-sm">${getUserInitial(thread.author_name)}</span></div>`;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center border border-app">
                <span className="text-primary dark:text-primary font-medium text-sm">
                  {getUserInitial(thread.author_name)}
                </span>
              </div>
            )}
            <div>
              <p className="text-secondary text-sm">
                By {thread.author_name || thread.authorName || 'User'} • {formatDate(thread.createdAt || thread.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="text-secondary whitespace-pre-wrap leading-relaxed">
            {thread.content}
          </div>
        </div>

        {Array.isArray(thread.tags) && thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {thread.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-full text-sm border border-app"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Like Button for Thread - Only show if thread is not locked */}
        {user && user.id.toString() !== (thread.author_id || thread.authorId)?.toString() && !(thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) && (
          <div className="mt-6 pt-6 border-t border-app">
            <button
              onClick={handleLikeThread}
              disabled={isLikingThread}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                thread.userLiked === true
                  ? 'bg-surface-elevated dark:bg-surface text-primary dark:text-primary border-primary/30 dark:border-primary/30'
                  : isLikingThread
                  ? 'bg-surface-elevated dark:bg-surface text-secondary/50 dark:text-secondary/50 border-app cursor-not-allowed'
                  : 'bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border-app hover:border-primary/30 dark:hover:border-primary/30'
              }`}
            >
              {isLikingThread ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Liking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill={thread.userLiked === true ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {thread.userLiked === true ? 'Liked' : 'Like'} ({thread.likes})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-primary">
              Replies ({replies?.total ?? thread.replies ?? thread.replies_count ?? 0})
            </h2>
            {(thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Thread is locked
              </span>
            )}
          </div>
          {!(thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="px-4 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface dark:hover:bg-surface-elevated text-primary dark:text-primary border border-app hover:border-primary/50 dark:hover:border-primary/50 rounded-lg transition-all duration-200 font-medium"
            >
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>

        {(thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="font-medium">This thread is locked. You cannot add, edit, or delete replies.</p>
            </div>
          </div>
        )}

        {/* Reply Form */}
        {isReplying && !(thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) && (
          <div className="bg-surface-elevated dark:bg-surface rounded-lg border border-app p-6">
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                  placeholder="Write your reply..."
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface dark:hover:bg-surface-elevated text-primary dark:text-primary border border-app hover:border-primary/50 dark:hover:border-primary/50 rounded-lg transition-all duration-200"
                >
                  Post Reply
                </button>
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-6 py-2 text-secondary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Replies List */}
        {(replies?.replies ?? []).map((reply) => {
          const isOwnReply = user && (reply.author_id?.toString() === user.id.toString() || reply.authorId?.toString() === user.id.toString());
          const isThreadOwner = user && thread && (thread.author_id?.toString() === user.id.toString() || thread.authorId?.toString() === user.id.toString());
          const canDelete = isOwnReply || isThreadOwner;
          const canEdit = isOwnReply;
          const isEditing = editingReplyId === reply.id;

          return (
            <div key={reply.id} className="bg-surface-elevated dark:bg-surface rounded-lg border border-app p-6">
              <div className="flex items-start gap-4">
                {reply.author_id && getProfileImageUrl(reply.author_id) ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-app flex-shrink-0">
                    <img
                      src={getProfileImageUrl(reply.author_id) || ''}
                      alt={reply.author_name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-primary/10 dark:bg-primary/20 border border-app rounded-full flex items-center justify-center"><span class="text-primary dark:text-primary font-medium text-xs">${getUserInitial(reply.author_name)}</span></div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 border border-app">
                    <span className="text-primary dark:text-primary font-medium text-xs">
                      {getUserInitial(reply.author_name)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-medium">{reply.author_name || reply.authorName || 'User'}</span>
                      <span className="text-secondary text-sm">
                        {formatDate(reply.createdAt || reply.created_at)}
                      </span>
                      {isOwnReply && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                          Your Reply
                        </span>
                      )}
                    </div>
                    {user && (canEdit || canDelete) && !isEditing && !(thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) && (
                      <div className="flex gap-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEditReply(reply)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Edit reply"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            disabled={deletingReplyId === reply.id}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                            title={isThreadOwner && !isOwnReply ? "Delete reply (thread owner)" : "Delete reply"}
                          >
                            {deletingReplyId === reply.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-3 mb-4">
                      <textarea
                        value={editingReplyContent}
                        onChange={(e) => setEditingReplyContent(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                        placeholder="Edit your reply..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveReply(reply.id)}
                          className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEditReply}
                          className="px-4 py-2 bg-surface border border-app text-secondary rounded-lg hover:bg-surface-elevated transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-secondary whitespace-pre-wrap mb-4">
                      {reply.content}
                    </div>
                  )}
                  {/* Like Button for Reply - Only show if thread is not locked */}
                  {user && user.id.toString() !== (reply.author_id || reply.authorId)?.toString() && !isEditing && !(thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) && (
                    <button
                      onClick={() => handleLikeReply(reply.id)}
                      disabled={likingReplyId === reply.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                        reply.userLiked === true
                          ? 'bg-surface-elevated dark:bg-surface text-primary dark:text-primary border-primary/30 dark:border-primary/30'
                          : likingReplyId === reply.id
                          ? 'bg-surface-elevated dark:bg-surface text-secondary/50 dark:text-secondary/50 border-app cursor-not-allowed'
                          : 'bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border-app hover:border-primary/30 dark:hover:border-primary/30'
                      }`}
                    >
                      {likingReplyId === reply.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          Liking...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill={reply.userLiked === true ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {reply.userLiked === true ? 'Liked' : 'Like'} ({reply.likes})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {(replies?.replies?.length ?? 0) === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-secondary">No replies yet</p>
            {!(thread.isLocked || (thread as any).is_locked === 1 || (thread as any).is_locked === true) && (
              <p className="text-secondary text-sm mt-2">Be the first to reply!</p>
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
            className="px-4 py-2 bg-surface-elevated hover:bg-surface disabled:bg-surface-elevated disabled:text-secondary text-primary rounded-lg transition-colors"
          >
            Previous
          </button>
          <span className="text-secondary">
            Page {currentPage} of {replies.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(replies.totalPages, prev + 1))}
            disabled={currentPage === replies.totalPages}
            className="px-4 py-2 bg-surface-elevated hover:bg-surface disabled:bg-surface-elevated disabled:text-secondary text-primary rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
