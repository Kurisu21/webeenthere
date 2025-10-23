'use client';

import React, { useState, useEffect } from 'react';
import { WebsiteCard } from '../shared/WebsiteCard';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { UrlEditModal } from '../user/UrlEditModal';
import { AdminWebsite, HostingStats, getAllWebsites, getHostingStats, updateWebsiteSlug, publishWebsite, unpublishWebsite, deleteWebsite } from '../../../lib/adminWebsiteApi';

export default function AdminHosting() {
  const [websites, setWebsites] = useState<AdminWebsite[]>([]);
  const [stats, setStats] = useState<HostingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    status: '' as '' | 'published' | 'draft',
    search: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0
  });
  
  // Modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    website: AdminWebsite | null;
  }>({ isOpen: false, website: null });
  
  const [urlEditModal, setUrlEditModal] = useState<{
    isOpen: boolean;
    website: AdminWebsite | null;
  }>({ isOpen: false, website: null });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [websitesResponse, statsResponse] = await Promise.all([
        getAllWebsites(filters),
        getHostingStats()
      ]);
      
      setWebsites(websitesResponse.websites);
      setPagination({
        total: websitesResponse.pagination.total,
        pages: websitesResponse.pagination.pages
      });
      setStats(statsResponse);
    } catch (error: any) {
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset to page 1 when changing other filters
    }));
  };

  const handleViewWebsite = (website: AdminWebsite) => {
    if (website.is_published) {
      window.open(`/view/${website.slug}`, '_blank');
    } else {
      setError('Website must be published to view');
    }
  };

  const handlePublishWebsite = async (website: AdminWebsite) => {
    try {
      await publishWebsite(website.id);
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Failed to publish website');
    }
  };

  const handleUnpublishWebsite = async (website: AdminWebsite) => {
    try {
      await unpublishWebsite(website.id);
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Failed to unpublish website');
    }
  };

  const handleEditUrl = (website: AdminWebsite) => {
    setUrlEditModal({ isOpen: true, website });
  };

  const handleSaveUrl = async (newSlug: string) => {
    if (!urlEditModal.website) return;
    
    try {
      await updateWebsiteSlug(urlEditModal.website.id, newSlug);
      await loadData();
      setUrlEditModal({ isOpen: false, website: null });
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteWebsite = (website: AdminWebsite) => {
    setDeleteConfirm({ isOpen: true, website });
  };

  const confirmDeleteWebsite = async () => {
    if (!deleteConfirm.website) return;
    
    try {
      await deleteWebsite(deleteConfirm.website.id);
      await loadData();
      setDeleteConfirm({ isOpen: false, website: null });
    } catch (error: any) {
      setError(error.message || 'Failed to delete website');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-primary">Loading hosting data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Website Management</h1>
        <p className="text-secondary">
          Manage all websites across the platform
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface-elevated border border-app rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary truncate">Total Websites</dt>
                  <dd className="text-lg font-medium text-primary">{stats.totalWebsites}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated border border-app rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary truncate">Published</dt>
                  <dd className="text-lg font-medium text-primary">{stats.publishedWebsites}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated border border-app rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary truncate">Drafts</dt>
                  <dd className="text-lg font-medium text-primary">{stats.draftWebsites}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated border border-app rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-primary">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Filters */}
      <div className="bg-surface-elevated border border-app rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-app rounded-md bg-surface text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Search by title or slug..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-app rounded-md bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Per Page
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-app rounded-md bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={6}>6 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Websites Grid */}
      {websites.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-primary">No websites found</h3>
          <p className="mt-1 text-sm text-secondary">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {websites.map((website) => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  viewMode="admin"
                  showOwner={true}
                  ownerName={website.username}
                  actions={{
                    onView: () => handleViewWebsite(website),
                    onPublish: website.is_published ? undefined : () => handlePublishWebsite(website),
                    onUnpublish: website.is_published ? () => handleUnpublishWebsite(website) : undefined,
                    onEditUrl: () => handleEditUrl(website),
                    onDelete: () => handleDeleteWebsite(website)
                  }}
                />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary">
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="px-3 py-2 text-sm font-medium text-secondary bg-surface border border-app rounded-md hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-primary">
                  Page {filters.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={filters.page >= pagination.pages}
                  className="px-3 py-2 text-sm font-medium text-secondary bg-surface border border-app rounded-md hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
    </div>
  );
}
