'use client';

import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS, apiPut, apiPost, API_BASE_URL, getImageUrl, getProfileImageUrl } from '../../../lib/apiConfig';

const UserProfile = memo(() => {
  const { user, token, updateUser } = useAuth();
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
  const [imageCacheBust, setImageCacheBust] = useState<number | undefined>(undefined);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [isRequestingEmailCode, setIsRequestingEmailCode] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        profile_image: '', // No longer used, profile images are blobs
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

      if (data.success) {
        // Profile image is now stored as blob, no URL needed
        setSuccess('Profile image uploaded successfully!');
        setImagePreview(null);
        
        // Force image refresh by updating cache-bust timestamp
        // Use a unique timestamp to force browser to fetch new image
        const newCacheBust = Date.now();
        setImageCacheBust(newCacheBust);
        
        // Force React to re-render the image component by updating cache bust multiple times
        // This ensures the browser fetches the new image from the server
        setTimeout(() => {
          setImageCacheBust(Date.now() + 1);
        }, 100);
        setTimeout(() => {
          setImageCacheBust(Date.now() + 2);
        }, 300);
        
        // Also clear any potential browser cache by reloading the image
        // Force a re-fetch by updating the key
        setTimeout(() => {
          if (user?.id) {
            // Trigger a state update to force re-render
            setFormData(prev => ({ ...prev }));
          }
        }, 500);
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

  // Check if email is changing
  const isEmailChanging = user && formData.email.toLowerCase() !== user.email.toLowerCase();

  // Request email change verification code
  const handleRequestEmailCode = async () => {
    if (!user || !token || !formData.email) return;

    try {
      setIsRequestingEmailCode(true);
      setError(null);
      setSuccess(null);

      const response = await apiPost(API_ENDPOINTS.REQUEST_EMAIL_CHANGE, {
        new_email: formData.email,
      });

      if (response.success) {
        setEmailCodeSent(true);
        setSuccess('Verification code sent to your new email address. Please check your email and enter the code below.');
      } else {
        setError(response.error || 'Failed to send verification code');
      }
    } catch (err: any) {
      console.error('Failed to request email code:', err);
      // Handle different error formats from apiPost
      // apiPost returns rejected promises with error objects, not thrown errors
      let errorMessage = 'Failed to send verification code';
      
      if (err && typeof err === 'object') {
        // Check various error object formats
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        } else if (err.data?.error) {
          errorMessage = err.data.error;
        } else if (err.data?.message) {
          errorMessage = err.data.message;
        } else if (err.status && err.status === 400) {
          errorMessage = 'Invalid email address or email already in use';
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsRequestingEmailCode(false);
    }
  };

  const handleSave = async () => {
    if (!user || !token) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const payload: any = {
        username: formData.username,
        theme_mode: formData.theme_mode,
      };

      // Only include email if it's changing (and include verification code)
      if (isEmailChanging) {
        if (!emailVerificationCode) {
          setError('Please request and enter the verification code to change your email address.');
          setIsSaving(false);
          return;
        }
        payload.email = formData.email;
        payload.email_verification_code = emailVerificationCode;
      } else {
        // Email not changing, don't include it in payload
        // (backend will keep current email)
      }

      const response = await apiPut(`${API_ENDPOINTS.USERS}/profile`, payload);

      if (response.success) {
        // Update AuthContext state
        updateUser({
          username: formData.username,
          email: isEmailChanging ? formData.email : user.email,
          theme_mode: formData.theme_mode,
        });

        // Update theme attribute on document for immediate visual feedback
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', formData.theme_mode);
        }

        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setEmailCodeSent(false);
        setEmailVerificationCode('');
      } else {
        // Check if it requires verification
        if (response.requires_verification) {
          setError(response.error || 'Email verification required');
          if (!emailCodeSent) {
            // Auto-request code if not already sent
            await handleRequestEmailCode();
          }
        } else {
          setError(response.error || 'Failed to update profile');
        }
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      // Check if error indicates verification needed
      if (err.message && err.message.includes('verification code is required')) {
        setError(err.message);
        if (!emailCodeSent) {
          // Auto-request code if not already sent
          await handleRequestEmailCode();
        }
      } else {
        setError(err.message || 'Failed to update profile');
      }
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
        theme_mode: (user as any).theme_mode === 'dark' ? 'dark' : 'light',
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setEmailCodeSent(false);
    setEmailVerificationCode('');
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
              <div className="space-y-3">
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => {
                    handleInputChange('email', e.target.value);
                    // Reset verification state when email changes
                    if (emailCodeSent) {
                      setEmailCodeSent(false);
                      setEmailVerificationCode('');
                    }
                  }}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-md text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors-fast"
                />
                
                {/* Email Verification UI - Show when email is changing */}
                {isEmailChanging && (
                  <div className="space-y-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-md">
                    <p className="text-sm text-blue-300">
                      Email address is changing. Verification required.
                    </p>
                    
                    {!emailCodeSent ? (
                      <button
                        type="button"
                        onClick={handleRequestEmailCode}
                        disabled={isRequestingEmailCode || !formData.email}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
                      >
                        {isRequestingEmailCode ? 'Sending Code...' : 'Send Verification Code to New Email'}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-green-300">
                          ✓ Verification code sent! Check your new email address.
                        </p>
                        <input
                          type="text"
                          value={emailVerificationCode}
                          onChange={(e) => {
                            // Only allow 6 digits
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setEmailVerificationCode(value);
                          }}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-md text-primary placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors-fast text-center text-2xl tracking-widest font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleRequestEmailCode}
                          disabled={isRequestingEmailCode}
                          className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-app text-secondary hover:text-primary rounded-md transition-colors"
                        >
                          {isRequestingEmailCode ? 'Sending...' : 'Resend Code'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                {(imagePreview || (user?.id && getProfileImageUrl(user.id, imageCacheBust))) && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-app">
                    <img
                      key={`preview-${imageCacheBust || imagePreview || 'default'}`}
                      src={imagePreview || getProfileImageUrl(user?.id || '', imageCacheBust) || ''}
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
                <p className="text-xs text-secondary">
                  Upload a profile image (JPEG, PNG, GIF, WebP, or SVG)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {user?.id && getProfileImageUrl(user.id, imageCacheBust) ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-app">
                    <img
                      key={`profile-${user.id}-${imageCacheBust || 'default'}`}
                      src={getProfileImageUrl(user.id, imageCacheBust) || ''}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onLoad={() => {
                        // Image loaded successfully
                        console.log('Profile image loaded');
                      }}
                      onError={(e) => {
                        console.error('Profile image failed to load');
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