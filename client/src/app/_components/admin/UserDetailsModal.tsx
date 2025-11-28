'use client';

import React, { useState, useEffect } from 'react';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';
import { adminApi, User } from '../../../lib/adminApi';
import { getProfileImageUrl } from '../../../lib/apiConfig';

interface UserDetailsModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export default function UserDetailsModal({ userId, isOpen, onClose, onUserUpdated }: UserDetailsModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    theme_mode: 'dark' as 'light' | 'dark',
    role: 'user' as 'user' | 'admin',
    is_active: true,
    is_verified: true,
  });

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser();
    } else {
      setUser(null);
      setIsEditing(false);
      setError(null);
    }
  }, [isOpen, userId]);

  const fetchUser = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApi.getUserById(userId);
      setUser(response.user);
      setFormData({
        username: response.user.username,
        email: response.user.email,
        password: '', // Password is not returned for security
        theme_mode: response.user.theme_mode,
        role: response.user.role,
        is_active: response.user.is_active,
        is_verified: response.user.is_verified,
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!userId) return;
    
    try {
      setIsSaving(true);
      
      // Update profile data
      await adminApi.updateUserProfile(userId, {
        username: formData.username,
        email: formData.email,
        theme_mode: formData.theme_mode,
      });

      // Update password if provided
      if (formData.password && formData.password.length > 0) {
        if (formData.password.length < 8) {
          alert('Password must be at least 8 characters');
          setIsSaving(false);
          return;
        }
        await adminApi.updateUserPassword(userId, formData.password);
      }

      // Update role
      await adminApi.updateUserRole(userId, formData.role);

      // Update status
      await adminApi.updateUserStatus(userId, {
        is_active: formData.is_active,
        is_verified: formData.is_verified,
      });

      // Refresh user data
      await fetchUser();
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '' })); // Clear password field
      
      if (onUserUpdated) {
        onUserUpdated();
      }
      
      alert('User updated successfully!');
    } catch (err: any) {
      console.error('Failed to update user:', err);
      alert(err.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        theme_mode: user.theme_mode,
        role: user.role,
        is_active: user.is_active,
        is_verified: user.is_verified,
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-surface rounded-lg border border-app max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-app p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-primary">User Details</h2>
            <p className="text-secondary text-sm mt-1">View and edit user information</p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
              >
                Edit User
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary transition-colors p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-primary">Loading user details...</p>
              </div>
            </div>
          ) : error || !user ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-primary text-lg font-medium mb-2">Error Loading User</p>
                <p className="text-secondary">{error || 'User not found'}</p>
              </div>
            </div>
          ) : (
            <>
              {/* User Profile Card */}
              <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center border border-app">
                    <span className="text-primary dark:text-primary font-bold text-2xl">
                      {user.username.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-primary mb-2">{user.username}</h3>
                    <p className="text-secondary mb-3">{user.email}</p>
                    <div className="flex items-center space-x-4">
                      <RoleBadge role={user.role} size="md" />
                      <StatusBadge isActive={user.is_active} isVerified={user.is_verified} size="md" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-secondary text-sm">User ID</p>
                    <p className="text-primary font-mono text-lg">#{user.id}</p>
                    <p className="text-secondary text-sm mt-2">Joined</p>
                    <p className="text-primary text-sm">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* User Information Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-surface-elevated rounded-lg border border-app p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Username
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.username || ''}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      ) : (
                        <p className="text-primary">{user.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <p className="text-secondary text-xs mt-1">
                            User will need to verify their email if changed
                          </p>
                        </div>
                      ) : (
                        <p className="text-primary">{user.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Password
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="password"
                            value={formData.password || ''}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Leave blank to keep current password"
                            className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <p className="text-secondary text-xs mt-1">
                            Leave blank to keep current password. Minimum 8 characters.
                          </p>
                        </div>
                      ) : (
                        <p className="text-secondary text-sm">••••••••</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Profile Image
                      </label>
                      <div className="space-y-2">
                        {user?.id && getProfileImageUrl(user.id) ? (
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-app">
                            <img
                              src={getProfileImageUrl(user.id) || ''}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-secondary text-sm">Not set</p>
                        )}
                        <p className="text-secondary text-xs">
                          Profile images are managed through the user's profile page.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Settings & Role and Permissions */}
                <div className="space-y-6">
                  {/* Account Settings */}
                  <div className="bg-surface-elevated rounded-lg border border-app p-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Theme Mode
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.theme_mode || 'dark'}
                            onChange={(e) => handleInputChange('theme_mode', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        ) : (
                          <p className="text-primary capitalize">{user.theme_mode}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Created At
                        </label>
                        <p className="text-primary">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Role and Permissions */}
                  <div className="bg-surface-elevated rounded-lg border border-app p-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">Role and Permissions</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Role
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.role || 'user'}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <RoleBadge role={user.role} size="md" />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Verification Status
                        </label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.is_verified}
                                onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                                className="w-4 h-4 text-primary bg-surface border-app rounded focus:ring-primary"
                              />
                              <span className="ml-2 text-primary">Verified</span>
                            </label>
                          </div>
                        ) : (
                          <span className={`
                            inline-flex items-center font-medium rounded-full border px-3 py-1.5 text-sm
                            ${user.is_verified 
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }
                          `}>
                            {user.is_verified ? (
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            )}
                            {user.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Account Status
                        </label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                className="w-4 h-4 text-primary bg-surface border-app rounded focus:ring-primary"
                              />
                              <span className="ml-2 text-primary">Active</span>
                            </label>
                          </div>
                        ) : (
                          <span className={`
                            inline-flex items-center font-medium rounded-full border px-3 py-1.5 text-sm
                            ${user.is_active 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                          `}>
                            {user.is_active ? (
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-surface-elevated border border-app rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-primary text-sm font-medium">Security Notice</p>
                    <p className="text-secondary text-xs mt-1">
                      Changes to user roles and status will affect their ability to log in and access the system.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
