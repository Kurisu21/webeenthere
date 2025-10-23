'use client';

import React, { useState, useEffect } from 'react';

interface UrlEditModalProps {
  isOpen: boolean;
  currentSlug: string;
  websiteTitle: string;
  onSave: (newSlug: string) => Promise<void>;
  onCancel: () => void;
}

export const UrlEditModal: React.FC<UrlEditModalProps> = ({
  isOpen,
  currentSlug,
  websiteTitle,
  onSave,
  onCancel
}) => {
  const [slug, setSlug] = useState(currentSlug);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug log to help identify if modal is rendering
  console.log('UrlEditModal rendering:', { isOpen, currentSlug, websiteTitle });

  useEffect(() => {
    if (isOpen) {
      setSlug(currentSlug);
      setError(null);
    }
  }, [isOpen, currentSlug]);

  const validateSlug = (value: string): string | null => {
    if (!value.trim()) {
      return 'URL slug is required';
    }
    
    if (!/^[a-z0-9-]+$/.test(value)) {
      return 'URL slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    if (value.startsWith('-') || value.endsWith('-')) {
      return 'URL slug cannot start or end with a hyphen';
    }
    
    if (value.includes('--')) {
      return 'URL slug cannot contain consecutive hyphens';
    }
    
    return null;
  };

  const handleSlugChange = (value: string) => {
    const normalizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(normalizedValue);
    
    const validationError = validateSlug(normalizedValue);
    setError(validationError);
  };

  const handleSave = async () => {
    const validationError = validateSlug(slug);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (slug === currentSlug) {
      onCancel();
      return;
    }

    setIsLoading(true);
    try {
      await onSave(slug);
    } catch (error: any) {
      setError(error.message || 'Failed to update URL');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999,
        overflowY: 'auto'
      }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={onCancel}
        ></div>

        {/* Modal */}
        <div 
          className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          style={{
            position: 'relative',
            backgroundColor: 'var(--surface)',
            borderRadius: '0.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '32rem',
            width: '100%'
          }}
        >
          <div className="bg-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-primary">
                  Edit Website URL
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-secondary mb-4">
                    Change the URL for "{websiteTitle}"
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Website URL Slug
                      </label>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-app bg-surface-elevated text-sm text-secondary">
                          localhost:3000/sites/
                        </span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-app bg-surface text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="my-website"
                        />
                      </div>
                      {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                      )}
                    </div>
                    
                    <div className="bg-surface-elevated border border-app rounded-md p-3">
                      <p className="text-xs text-secondary mb-1">Preview URL:</p>
                      <p className="text-sm text-primary font-mono">
                        localhost:3000/sites/{slug || 'my-website'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isLoading || !!error || slug === currentSlug}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-app shadow-sm px-4 py-2 bg-surface text-base font-medium text-secondary hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
