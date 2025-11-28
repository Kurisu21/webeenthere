'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import { API_ENDPOINTS, apiGet, apiDelete, API_BASE_URL } from '../../../lib/apiConfig';

interface MediaAsset {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  uploaded_at: string;
  website_id?: number;
  website_title?: string;
  website_slug?: string;
}

type MediaType = 'image' | 'video' | 'audio';

export default function ImagesPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'with-website' | 'without-website'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  // Helper function to determine media type
  const getMediaType = (fileType: string, fileName: string): MediaType => {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return 'image';
    }
    if (fileType.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(ext)) {
      return 'video';
    }
    if (fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'].includes(ext)) {
      return 'audio';
    }
    return 'image'; // Default
  };

  const loadMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(API_ENDPOINTS.MEDIA_IMAGES);
      if (response.success) {
        setMedia(response.images || []);
      } else {
        setError('Failed to load media');
      }
    } catch (err: any) {
      console.error('Failed to load media:', err);
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska'];
    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp4', 'audio/flac', 'audio/x-ms-wma'];
    const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedAudioTypes];
    
    if (!allAllowedTypes.includes(file.type)) {
      setError('Please select a valid media file. Images: JPEG, PNG, GIF, WebP, SVG. Videos: MP4, WebM, OGG, MOV, AVI, WMV, FLV, MKV. Audio: MP3, WAV, OGG, AAC, M4A, FLAC, WMA');
      return;
    }

    // Validate file size (100MB for videos/audio, 10MB for images)
    const isImage = allowedImageTypes.includes(file.type);
    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${isImage ? '10MB' : '100MB'}`);
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('image', file); // Backend expects 'image' field name
      // Don't associate with a specific website - allow user to use later

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Media file uploaded successfully!');
        await loadMedia();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Failed to upload media:', err);
      setError(err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(imageId);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiDelete(`${API_BASE_URL}/api/media/images/${imageId}`);
      if (response.success) {
        setSuccess('Media file deleted successfully!');
        await loadMedia();
        if (selectedMedia?.id === imageId) {
          setSelectedMedia(null);
        }
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    } catch (err: any) {
      console.error('Failed to delete media:', err);
      setError(err.message || 'Failed to delete media');
    } finally {
      setDeleting(null);
    }
  };

  const handleMediaClick = (media: MediaAsset) => {
    setSelectedMedia(media);
  };

  const copyMediaUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setSuccess('Media URL copied to clipboard!');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Filter media
  const filteredMedia = media.filter(item => {
    // Filter by website association
    if (filter === 'with-website' && !item.website_id) return false;
    if (filter === 'without-website' && item.website_id) return false;

    // Filter by media type
    if (typeFilter !== 'all') {
      const mediaType = getMediaType(item.file_type, item.file_name);
      if (mediaType !== typeFilter) return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.file_name.toLowerCase().includes(query) ||
        item.website_title?.toLowerCase().includes(query) ||
        item.website_slug?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">Media Library</h1>
                <p className="text-secondary">
                  Manage your images, videos, and audio files and use them across all your websites
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="media-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                    uploading
                      ? 'bg-surface text-secondary cursor-not-allowed opacity-50'
                      : 'btn-primary'
                  }`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Upload Media
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="p-4 bg-green-900/50 dark:bg-green-900/30 border border-green-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-300">{success}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-900/50 dark:bg-red-900/30 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-300">{error}</span>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search media by name or website..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-app rounded-lg text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors-fast"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-surface-elevated border border-app text-primary hover:bg-surface'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('with-website')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === 'with-website'
                        ? 'bg-blue-600 text-white'
                        : 'bg-surface-elevated border border-app text-primary hover:bg-surface'
                    }`}
                  >
                    Used
                  </button>
                  <button
                    onClick={() => setFilter('without-website')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === 'without-website'
                        ? 'bg-blue-600 text-white'
                        : 'bg-surface-elevated border border-app text-primary hover:bg-surface'
                    }`}
                  >
                    Available
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      typeFilter === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-surface-elevated border border-app text-primary hover:bg-surface'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setTypeFilter('image')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      typeFilter === 'image'
                        ? 'bg-purple-600 text-white'
                        : 'bg-surface-elevated border border-app text-primary hover:bg-surface'
                    }`}
                  >
                    Images
                  </button>
                  <button
                    onClick={() => setTypeFilter('video')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      typeFilter === 'video'
                        ? 'bg-purple-600 text-white'
                        : 'bg-surface-elevated border border-app text-primary hover:bg-surface'
                    }`}
                  >
                    Videos
                  </button>
                  <button
                    onClick={() => setTypeFilter('audio')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      typeFilter === 'audio'
                        ? 'bg-purple-600 text-white'
                        : 'bg-surface-elevated border border-app text-primary hover:bg-surface'
                    }`}
                  >
                    Audio
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-surface-elevated border border-app rounded-lg p-4">
                <div className="text-sm text-secondary mb-1">Total Media</div>
                <div className="text-2xl font-bold text-primary">{media.length}</div>
              </div>
              <div className="bg-surface-elevated border border-app rounded-lg p-4">
                <div className="text-sm text-secondary mb-1">Images</div>
                <div className="text-2xl font-bold text-primary">
                  {media.filter(m => getMediaType(m.file_type, m.file_name) === 'image').length}
                </div>
              </div>
              <div className="bg-surface-elevated border border-app rounded-lg p-4">
                <div className="text-sm text-secondary mb-1">Videos</div>
                <div className="text-2xl font-bold text-primary">
                  {media.filter(m => getMediaType(m.file_type, m.file_name) === 'video').length}
                </div>
              </div>
              <div className="bg-surface-elevated border border-app rounded-lg p-4">
                <div className="text-sm text-secondary mb-1">Audio</div>
                <div className="text-2xl font-bold text-primary">
                  {media.filter(m => getMediaType(m.file_type, m.file_name) === 'audio').length}
                </div>
              </div>
              <div className="bg-surface-elevated border border-app rounded-lg p-4">
                <div className="text-sm text-secondary mb-1">Used</div>
                <div className="text-2xl font-bold text-primary">
                  {media.filter(m => m.website_id).length}
                </div>
              </div>
              <div className="bg-surface-elevated border border-app rounded-lg p-4">
                <div className="text-sm text-secondary mb-1">Available</div>
                <div className="text-2xl font-bold text-primary">
                  {media.filter(m => !m.website_id).length}
                </div>
              </div>
            </div>

            {/* Media Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-secondary">Loading media...</p>
                </div>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="bg-surface-elevated border border-app rounded-lg p-12 text-center">
                <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-primary mb-2">No media found</h3>
                <p className="text-secondary mb-4">
                  {searchQuery || filter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Upload your first media file to get started'}
                </p>
                {!searchQuery && filter === 'all' && typeFilter === 'all' && (
                  <label
                    htmlFor="media-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 btn-primary rounded-lg font-medium cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Your First Media File
                  </label>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredMedia.map((item) => {
                  const mediaUrl = item.file_url.startsWith('http') 
                    ? item.file_url 
                    : `${API_BASE_URL}${item.file_url}`;
                  const mediaType = getMediaType(item.file_type, item.file_name);
                  
                  return (
                    <div
                      key={item.id}
                      className="group relative bg-surface-elevated border border-app rounded-lg overflow-hidden hover:border-blue-500 transition-all duration-300 cursor-pointer"
                      onClick={() => handleMediaClick(item)}
                    >
                      {/* Media Preview */}
                      <div className="aspect-square relative overflow-hidden bg-surface">
                        {mediaType === 'image' ? (
                          <img
                            src={mediaUrl}
                            alt={item.file_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.parentElement?.querySelector('.media-placeholder') as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : mediaType === 'video' ? (
                          <div className="relative w-full h-full">
                            <video
                              src={mediaUrl}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              onMouseEnter={(e) => {
                                const video = e.currentTarget;
                                video.play().catch(() => {});
                              }}
                              onMouseLeave={(e) => {
                                const video = e.currentTarget;
                                video.pause();
                                video.currentTime = 0;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <svg className="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
                            <svg className="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                          </div>
                        )}
                        <div className="media-placeholder absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyMediaUrl(item.file_url);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            title="Copy URL"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id, item.file_name);
                            }}
                            disabled={deleting === item.id}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                            title="Delete"
                          >
                            {deleting === item.id ? (
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* Type badge */}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded">
                          {mediaType === 'image' ? '📷' : mediaType === 'video' ? '🎥' : '🎵'}
                        </div>

                        {/* Website badge */}
                        {item.website_id && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-medium rounded">
                            Used
                          </div>
                        )}
                      </div>

                      {/* Media Info */}
                      <div className="p-3">
                        <div className="text-sm font-medium text-primary truncate" title={item.file_name}>
                          {item.file_name}
                        </div>
                        {item.website_title && (
                          <div className="text-xs text-secondary truncate mt-1" title={item.website_title}>
                            {item.website_title}
                          </div>
                        )}
                        <div className="text-xs text-secondary mt-1">
                          {formatFileSize(item.file_size)} • {formatDate(item.uploaded_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Media Detail Modal */}
            {selectedMedia && (
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedMedia(null)}
              >
                <div
                  className="bg-surface-elevated border border-app rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-primary">{selectedMedia.file_name}</h2>
                      <button
                        onClick={() => setSelectedMedia(null)}
                        className="text-secondary hover:text-primary transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Media Preview */}
                    <div className="mb-4 rounded-lg overflow-hidden bg-surface">
                      {(() => {
                        const mediaType = getMediaType(selectedMedia.file_type, selectedMedia.file_name);
                        const mediaUrl = selectedMedia.file_url.startsWith('http') 
                          ? selectedMedia.file_url 
                          : `${API_BASE_URL}${selectedMedia.file_url}`;
                        
                        if (mediaType === 'image') {
                          return (
                            <img
                              src={mediaUrl}
                              alt={selectedMedia.file_name}
                              className="w-full h-auto"
                            />
                          );
                        } else if (mediaType === 'video') {
                          return (
                            <video
                              src={mediaUrl}
                              controls
                              className="w-full h-auto"
                            >
                              Your browser does not support the video tag.
                            </video>
                          );
                        } else {
                          return (
                            <div className="p-8 bg-gradient-to-br from-purple-500 to-pink-600 flex flex-col items-center justify-center">
                              <svg className="w-24 h-24 text-white mb-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                              </svg>
                              <audio
                                src={mediaUrl}
                                controls
                                className="w-full max-w-md"
                              >
                                Your browser does not support the audio tag.
                              </audio>
                            </div>
                          );
                        }
                      })()}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-surface border border-app rounded-lg p-4">
                        <div className="text-sm text-secondary mb-1">File Name</div>
                        <div className="text-primary font-medium">{selectedMedia.file_name}</div>
                      </div>
                      <div className="bg-surface border border-app rounded-lg p-4">
                        <div className="text-sm text-secondary mb-1">Media Type</div>
                        <div className="text-primary font-medium capitalize">
                          {getMediaType(selectedMedia.file_type, selectedMedia.file_name)}
                        </div>
                      </div>
                      <div className="bg-surface border border-app rounded-lg p-4">
                        <div className="text-sm text-secondary mb-1">File Size</div>
                        <div className="text-primary font-medium">{formatFileSize(selectedMedia.file_size)}</div>
                      </div>
                      <div className="bg-surface border border-app rounded-lg p-4">
                        <div className="text-sm text-secondary mb-1">File Type</div>
                        <div className="text-primary font-medium">{selectedMedia.file_type}</div>
                      </div>
                      <div className="bg-surface border border-app rounded-lg p-4">
                        <div className="text-sm text-secondary mb-1">Uploaded</div>
                        <div className="text-primary font-medium">{formatDate(selectedMedia.uploaded_at)}</div>
                      </div>
                      {selectedMedia.website_title && (
                        <div className="bg-surface border border-app rounded-lg p-4 md:col-span-2">
                          <div className="text-sm text-secondary mb-1">Used in Website</div>
                          <div className="text-primary font-medium">{selectedMedia.website_title}</div>
                          {selectedMedia.website_slug && (
                            <a
                              href={`/sites/${selectedMedia.website_slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-400 text-sm mt-1 inline-block"
                            >
                              View Website →
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => copyMediaUrl(selectedMedia.file_url)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Copy Media URL
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(selectedMedia.id, selectedMedia.file_name);
                          setSelectedMedia(null);
                        }}
                        disabled={deleting === selectedMedia.id}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                      >
                        {deleting === selectedMedia.id ? 'Deleting...' : 'Delete Media'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
