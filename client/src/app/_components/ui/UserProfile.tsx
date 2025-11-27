'use client';

import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS, apiPut, API_BASE_URL } from '../../../lib/apiConfig';

const UserProfile = memo(() => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profile_image: '',
    theme_mode: 'light' as 'light' | 'dark',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        profile_image: (user as any).profile_image || '',
        theme_mode: (user as any).theme_mode === 'dark' ? 'dark' : 'light',
      });
    }
  }, [user]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear preview if URL is changed
    if (field === 'profile_image') {
      setImagePreview(null);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.PROFILE_IMAGE_UPLOAD, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (data.success && data.profile_image) {
        // Update form data with the uploaded image URL
        setFormData(prev => ({
          ...prev,
          profile_image: data.profile_image
        }));
        setSuccess('Profile image uploaded successfully!');
        setImagePreview(null); // Clear preview since we have the URL now
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Failed to upload profile image:', err);
      setError(err.message || 'Failed to upload profile image');
      setImagePreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const handleSave = async () => {
    if (!user || !token) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const payload: any = {
        username: formData.username,
        email: formData.email,
        theme_mode: formData.theme_mode,
      };
      if (formData.profile_image && formData.profile_image.trim().length > 0) {
        payload.profile_image = formData.profile_image.trim();
      }

      const response = await apiPut(`${API_ENDPOINTS.USERS}/profile`, payload);

      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);

        // Persist updated theme and profile locally so UI reflects changes immediately
        const mergedUser = {
          ...user,
          username: formData.username,
          email: formData.email,
          ...(payload.profile_image !== undefined ? { profile_image: payload.profile_image } : {}),
          theme_mode: formData.theme_mode,
        } as any;
        try {
          localStorage.setItem('user', JSON.stringify(mergedUser));
        } catch {}
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        profile_image: '',
        theme_mode: 'light',
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-primary">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h1 className="text-2xl font-bold text-primary">Profile</h1>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-surface-elevated border border-app text-primary hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-500/30 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-300">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 h-32 rounded-lg mb-6 hover:scale-[1.02] transition-all duration-500"></div>

      {/* User Info Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer">
            <span className="text-white font-medium text-xl">
              {user.username.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">{user.username}</h2>
            <p className="text-secondary">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            User
          </span>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium text-secondary mb-2 transition-colors duration-300">
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-md text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors-fast"
              />
            ) : (
              <div className="px-3 py-2 bg-surface-elevated border border-app rounded-md text-primary">
                {user.username}
              </div>
            )}
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-secondary mb-2 transition-colors duration-300">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-md text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors-fast"
              />
            ) : (
              <div className="px-3 py-2 bg-surface-elevated border border-app rounded-md text-primary">
                {user.email}
              </div>
            )}
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-secondary mb-2 transition-colors duration-300">
              Profile Image
            </label>
            {isEditing ? (
              <div className="space-y-3">
                {/* Image Preview */}
                {(imagePreview || formData.profile_image) && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-app">
                    <img
                      src={imagePreview || (formData.profile_image?.startsWith('/') ? `${API_BASE_URL}${formData.profile_image}` : formData.profile_image) || ''}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* File Upload Button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="profile-image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isUploading
                        ? 'bg-surface text-secondary cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Image
                      </>
                    )}
                  </label>
                </div>

                {/* Or Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-app"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-surface text-secondary">OR</span>
                  </div>
                </div>

                {/* URL Input */}
                <input
                  type="text"
                  value={formData.profile_image || ''}
                  onChange={(e) => handleInputChange('profile_image', e.target.value)}
                  placeholder="Enter image URL (e.g., https://cdn.example.com/image.jpg)"
                  className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-md text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors-fast"
                />
                <p className="text-xs text-secondary">
                  Upload a local file or enter a URL from CDN/online source
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.profile_image ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-app">
                    <img
                      src={formData.profile_image.startsWith('/') ? `${API_BASE_URL}${formData.profile_image}` : formData.profile_image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-surface-elevated border border-app rounded-md text-secondary">
                    Not set
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium text-secondary mb-2 transition-colors duration-300">
              Account Status
            </label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 dark:text-green-400 text-sm">Account Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 dark:text-blue-400 text-sm">Email Verified</span>
              </div>
            </div>
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-secondary mb-2 transition-colors duration-300">
              User ID
            </label>
            <div className="px-3 py-2 bg-surface-elevated border border-app rounded-md text-secondary font-mono">
              #{user.id}
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="border-t border-app pt-6 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-primary">Account Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium text-secondary mb-2 transition-colors duration-300">
              Theme Mode
            </label>
            {isEditing ? (
              <select
                value={formData.theme_mode || 'light'}
                onChange={(e) => handleInputChange('theme_mode', e.target.value)}
                className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors-fast"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            ) : (
              <div className="px-3 py-2 bg-surface-elevated border border-app rounded-md text-primary capitalize">
                {formData.theme_mode}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Info Section */}
      <div className="border-t border-app pt-6">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <h3 className="text-lg font-semibold text-primary">Account Information</h3>
        </div>
        <p className="text-secondary">{user.email}</p>
        <p className="text-sm text-secondary">Member since {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile; 