'use client';

import React from 'react';
import { WebsitePreviewImage } from './WebsitePreviewImage';

interface WebsiteCardProps {
  website: {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
  };
  actions?: {
    onView?: () => void;
    onEdit?: () => void;
    onPublish?: () => void;
    onUnpublish?: () => void;
    onEditUrl?: () => void;
    onExport?: (format: 'html' | 'css' | 'zip') => void;
    onDelete?: () => void;
    onShareAsTemplate?: () => void;
  };
  viewMode?: 'user' | 'admin';
  showOwner?: boolean;
  ownerName?: string;
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  actions = {},
  viewMode = 'user',
  showOwner = false,
  ownerName
}) => {
  const {
    onView,
    onEdit,
    onPublish,
    onUnpublish,
    onEditUrl,
    onExport,
    onDelete,
    onShareAsTemplate
  } = actions;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = () => {
    if (website.is_published) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
        Draft
      </span>
    );
  };

  return (
    <div className="bg-surface border border-app rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-500/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary mb-1 line-clamp-2">
            {website.title}
          </h3>
          <p className="text-sm text-secondary mb-2">
            localhost:3000/sites/{website.slug}
          </p>
          {showOwner && ownerName && (
            <p className="text-xs text-secondary">
              Owner: {ownerName}
            </p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      {/* Website Preview - Browser-like frame */}
      <div className="w-full mb-4">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-t-lg p-2 flex items-center gap-2 border border-b-0 border-app">
          {/* Browser dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          {/* Browser address bar */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded px-3 py-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            {website.slug}.webeenthere.com
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-app rounded-b-lg overflow-hidden shadow-inner" style={{ aspectRatio: '16/9', minHeight: '200px' }}>
          {website.id ? (
            <WebsitePreviewImage
              websiteId={website.id}
              alt={`${website.title} preview`}
              className="w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="preview-placeholder text-center flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-800">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Website Preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-secondary mb-4">
        <p>Created: {formatDate(website.created_at)}</p>
        <p>Updated: {formatDate(website.updated_at)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {onView && (
          <button
            onClick={onView}
            className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
        )}

        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        )}

        {/* Publish/Unpublish */}
        {website.is_published ? (
          onUnpublish && (
            <button
              onClick={onUnpublish}
              className="px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
              Unpublish
            </button>
          )
        ) : (
          onPublish && (
            <button
              onClick={onPublish}
              className="px-3 py-2 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Publish
            </button>
          )
        )}

        {/* Dropdown for additional actions */}
        <div className="relative">
          <button
            className="px-3 py-2 text-xs font-medium text-secondary bg-surface-elevated hover:bg-surface-elevated/80 border border-app rounded-md transition-colors"
            onClick={() => {
              const dropdown = document.getElementById(`dropdown-${website.id}`);
              if (dropdown) {
                dropdown.classList.toggle('hidden');
              }
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          <div
            id={`dropdown-${website.id}`}
            className="hidden absolute right-0 mt-2 w-48 bg-surface border border-app rounded-md shadow-lg z-10"
          >
            <div className="py-1">
              {onEditUrl && (
                <button
                  onClick={onEditUrl}
                  className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface-elevated transition-colors"
                >
                  Edit URL
                </button>
              )}
              
              {onExport && (
                <>
                  <button
                    onClick={() => onExport('html')}
                    className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface-elevated transition-colors"
                  >
                    Export HTML
                  </button>
                  <button
                    onClick={() => onExport('css')}
                    className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface-elevated transition-colors"
                  >
                    Export CSS
                  </button>
                  <button
                    onClick={() => onExport('zip')}
                    className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface-elevated transition-colors"
                  >
                    Export ZIP
                  </button>
                </>
              )}
              
              {onShareAsTemplate && !!website.is_published && (
                <button
                  onClick={onShareAsTemplate}
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share as Template
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
