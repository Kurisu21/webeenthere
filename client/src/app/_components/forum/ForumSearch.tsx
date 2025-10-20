'use client';

import React, { useState, useEffect } from 'react';
import { forumApi, ForumThread } from '../../../lib/forumApi';

interface ForumSearchProps {
  onThreadSelect: (thread: ForumThread) => void;
  placeholder?: string;
}

export default function ForumSearch({ onThreadSelect, placeholder = "Search threads..." }: ForumSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ForumThread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchThreads = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await forumApi.searchThreads(query, 10);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        setError('Failed to search threads');
        console.error('Error searching threads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchThreads, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleThreadSelect = (thread: ForumThread) => {
    onThreadSelect(thread);
    setQuery('');
    setShowResults(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={placeholder}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {error && (
            <div className="p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {results.length === 0 && query.trim().length >= 2 && !isLoading && (
            <div className="p-4 text-gray-400 text-center">
              No threads found for "{query}"
            </div>
          )}

          {results.map((thread) => (
            <button
              key={thread.id}
              onClick={() => handleThreadSelect(thread)}
              className="w-full p-4 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">
                    {thread.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {thread.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{thread.replies} replies</span>
                    <span>{thread.views} views</span>
                    <span>{formatDate(thread.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
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
            </button>
          ))}

          {results.length > 0 && (
            <div className="p-3 border-t border-gray-700 text-center">
              <button
                onClick={() => {
                  setQuery('');
                  setShowResults(false);
                }}
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
