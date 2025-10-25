'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WebsiteCard } from '../shared/WebsiteCard';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { UrlEditModal } from './UrlEditModal';
import ShareTemplateModal from './ShareTemplateModal';
import UserWebsitePerformance from './UserWebsitePerformance';
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '../../../lib/apiConfig';
import { exportWebsite } from '../../../lib/websiteExportApi';

interface Website {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function UserPages() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    website: Website | null;
  }>({ isOpen: false, website: null });
  
  const [urlEditModal, setUrlEditModal] = useState<{
    isOpen: boolean;
    website: Website | null;
  }>({ isOpen: false, website: null });

  const [shareTemplateModal, setShareTemplateModal] = useState<{
    isOpen: boolean;
    website: Website | null;
  }>({ isOpen: false, website: null });

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const response = await apiGet(API_ENDPOINTS.WEBSITES);
      if (response.success) {
        setWebsites(response.data);
      } else {
        setError(response.message || 'Failed to load websites');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWebsite = (website: Website) => {
    if (website.is_published) {
      window.open(`/sites/${website.slug}`, '_blank');
    } else {
      setError('Website must be published to view');
    }
  };

  const handleEditWebsite = (website: Website) => {
    router.push(`/user/build/${website.id}`);
  };

  const handlePublishWebsite = async (website: Website) => {
    try {
      const response = await apiPost(`${API_ENDPOINTS.WEBSITES}/${website.id}/publish`, {});
      if (response.success) {
        await loadWebsites();
      } else {
        setError(response.message || 'Failed to publish website');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to publish website');
    }
  };

  const handleUnpublishWebsite = async (website: Website) => {
    try {
      const response = await apiPost(`${API_ENDPOINTS.WEBSITES}/${website.id}/unpublish`, {});
      if (response.success) {
        await loadWebsites();
      } else {
        setError(response.message || 'Failed to unpublish website');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to unpublish website');
    }
  };

  const handleEditUrl = (website: Website) => {
    setUrlEditModal({ isOpen: true, website });
  };

  const handleSaveUrl = async (newSlug: string) => {
    if (!urlEditModal.website) return;
    
    try {
      const response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${urlEditModal.website.id}/slug`, {
        slug: newSlug
      });
      
      if (response.success) {
        await loadWebsites();
        setUrlEditModal({ isOpen: false, website: null });
      } else {
        throw new Error(response.message || 'Failed to update URL');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleExportWebsite = async (website: Website, format: 'html' | 'css' | 'zip') => {
    try {
      await exportWebsite(website.id, format);
    } catch (error: any) {
      setError(error.message || 'Failed to export website');
    }
  };

  const handleDeleteWebsite = (website: Website) => {
    setDeleteConfirm({ isOpen: true, website });
  };

  const handleShareAsTemplate = (website: Website) => {
    setShareTemplateModal({ isOpen: true, website });
  };

  const confirmDeleteWebsite = async () => {
    if (!deleteConfirm.website) return;
    
    try {
      const response = await apiDelete(`${API_ENDPOINTS.WEBSITES}/${deleteConfirm.website.id}`);
      if (response.success) {
        await loadWebsites();
        setDeleteConfirm({ isOpen: false, website: null });
      } else {
        setError(response.message || 'Failed to delete website');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete website');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-primary">Loading your websites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">My Pages</h1>
        <p className="text-secondary">
          Manage your websites, publish them, and customize their URLs
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Website Button */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/user/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Website
        </button>
      </div>

      {/* Websites Grid */}
      {websites.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-primary">No websites yet</h3>
          <p className="mt-1 text-sm text-secondary">Get started by creating your first website.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/user/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Website
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              viewMode="user"
              actions={{
                onView: () => handleViewWebsite(website),
                onEdit: () => handleEditWebsite(website),
                onPublish: website.is_published ? undefined : () => handlePublishWebsite(website),
                onUnpublish: website.is_published ? () => handleUnpublishWebsite(website) : undefined,
                onEditUrl: () => handleEditUrl(website),
                onExport: (format) => handleExportWebsite(website, format),
                onDelete: () => handleDeleteWebsite(website),
                onShareAsTemplate: () => handleShareAsTemplate(website)
              }}
            />
          ))}
        </div>
      )}

      {/* Website Performance Section */}
      <div className="mt-8">
        <UserWebsitePerformance />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Website"
        message={`Are you sure you want to delete "${deleteConfirm.website?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteWebsite}
        onCancel={() => setDeleteConfirm({ isOpen: false, website: null })}
        variant="danger"
      />

      {/* URL Edit Modal */}
      {urlEditModal.website && (
        <UrlEditModal
          isOpen={urlEditModal.isOpen}
          currentSlug={urlEditModal.website.slug}
          websiteTitle={urlEditModal.website.title}
          onSave={handleSaveUrl}
          onCancel={() => setUrlEditModal({ isOpen: false, website: null })}
        />
      )}

      {/* Share Template Modal */}
      {shareTemplateModal.website && (
        <ShareTemplateModal
          isOpen={shareTemplateModal.isOpen}
          website={shareTemplateModal.website}
          onClose={() => setShareTemplateModal({ isOpen: false, website: null })}
          onSuccess={() => {
            // Optionally refresh data or show success message
            console.log('Template shared successfully');
          }}
        />
      )}
    </div>
  );
}
