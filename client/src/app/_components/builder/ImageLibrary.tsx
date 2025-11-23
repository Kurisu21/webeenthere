'use client';

import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, apiGet, apiPost, apiDelete } from '../../../lib/apiConfig';
import { ENV_CONFIG } from '../../../lib/envConfig';

interface ImageAsset {
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

interface ImageLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  websiteId?: string;
  isDark?: boolean;
}

export default function ImageLibrary({ isOpen, onClose, onSelectImage, websiteId, isDark = false }: ImageLibraryProps) {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'current' | 'other'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false); // Track if we've attempted to load

  const bgPrimary = isDark ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    // Only load images when library is opened for the first time or websiteId changes
    if (isOpen && (!hasLoadedRef.current || websiteId)) {
      loadImages();
      hasLoadedRef.current = true;
    }
  }, [isOpen, websiteId]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const params = websiteId ? `?website_id=${websiteId}` : '';
      const response = await apiGet(`${API_ENDPOINTS.MEDIA_IMAGES}${params}`);
      if (response.success) {
        setImages(response.images || []);
      }
    } catch (error: any) {
      // Don't log errors that would cause logout - just silently fail
      // Only log if it's not an auth error
      if (error.message && !error.message.includes('Authentication')) {
        console.error('Failed to load images:', error);
      }
      // Set empty array on error so UI doesn't break
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (websiteId) {
        formData.append('website_id', websiteId);
      }

      // Use fetch directly for FormData
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const { API_BASE_URL } = await import('@/lib/apiConfig');
      const apiUrl = API_ENDPOINTS.MEDIA_UPLOAD.replace('/api/', '').startsWith('http') 
        ? API_ENDPOINTS.MEDIA_UPLOAD 
        : `${API_BASE_URL}/api/media/upload`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        await loadImages(); // Reload images
        // Auto-select the newly uploaded image
        if (data.media?.file_url) {
          onSelectImage(data.media.file_url);
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (imageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await apiDelete(`${API_ENDPOINTS.MEDIA_IMAGES}/${imageId}`);
      if (response.success) {
        setImages(images.filter(img => img.id !== imageId));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const getImageUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    
    // If already a full URL, return as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    // Get API base URL using ENV_CONFIG
    const apiUrl = ENV_CONFIG.isLocal() 
      ? ENV_CONFIG.LOCAL_API_URL 
      : ENV_CONFIG.PRODUCTION_API_URL;
    
    // If fileUrl already includes /api/media, use it as is
    if (fileUrl.startsWith('/api/media')) {
      return `${apiUrl}${fileUrl}`;
    }
    
    // If it's just /uploads/..., prepend /api/media
    if (fileUrl.startsWith('/uploads')) {
      return `${apiUrl}/api/media${fileUrl}`;
    }
    
    // If it starts with /, just prepend API URL
    if (fileUrl.startsWith('/')) {
      return `${apiUrl}${fileUrl}`;
    }
    
    return fileUrl;
  };

  const filteredImages = images.filter(img => {
    if (filter === 'all') return true;
    if (filter === 'current') return img.website_id?.toString() === websiteId;
    if (filter === 'other') return img.website_id?.toString() !== websiteId && img.website_id !== null;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgPrimary} rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          <div>
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Image Library</h2>
            <p className={`text-sm ${textSecondary} mt-1`}>Manage and select images for your website</p>
          </div>
          <button
            onClick={onClose}
            className={`${textSecondary} hover:${textPrimary} transition-colors`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className={`p-4 border-b ${borderColor} flex items-center justify-between gap-4`}>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  : `${bgSecondary} ${textSecondary} hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
            >
              All Images
            </button>
            <button
              onClick={() => setFilter('current')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'current'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  : `${bgSecondary} ${textSecondary} hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
            >
              This Website
            </button>
            <button
              onClick={() => setFilter('other')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'other'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  : `${bgSecondary} ${textSecondary} hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
            >
              Other Websites
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                uploading
                  ? `${bgSecondary} ${textSecondary} cursor-not-allowed`
                  : isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {uploading ? 'Uploading...' : '📁 Upload Image'}
            </label>
          </div>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className={`${textSecondary}`}>Loading images...</div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <svg className={`w-16 h-16 ${textSecondary} mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className={`${textSecondary} text-center`}>
                {filter === 'all' ? 'No images uploaded yet. Click "Upload Image" to get started.' : 'No images found in this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${borderColor} hover:border-blue-500 transition-all`}
                  onClick={() => {
                    onSelectImage(getImageUrl(image.file_url));
                    onClose();
                  }}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                    <img
                      src={getImageUrl(image.file_url)}
                      alt={image.file_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleDelete(image.id, e)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className={`p-2 ${bgSecondary}`}>
                    <p className={`text-xs ${textPrimary} truncate`} title={image.file_name}>
                      {image.file_name}
                    </p>
                    {image.website_title && (
                      <p className={`text-xs ${textSecondary} truncate`} title={image.website_title}>
                        From: {image.website_title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

