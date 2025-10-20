'use client';

import React, { useState, useEffect, use } from 'react';
import DashboardHeader from '../../../_components/layout/DashboardHeader';
import AdminSidebar from '../../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../../_components/layout/MainContentWrapper';
import RoleBadge from '../../../_components/admin/RoleBadge';
import StatusBadge from '../../../_components/admin/StatusBadge';
import { adminApi, User } from '../../../../lib/adminApi';
import { useRouter } from 'next/navigation';

interface UserDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const resolvedParams = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profile_image: '',
    theme_mode: 'dark' as 'light' | 'dark',
    role: 'user' as 'user' | 'admin',
    is_active: true,
    is_verified: true,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await adminApi.getUserById(parseInt(resolvedParams.id));
        setUser(response.user);
        setFormData({
          username: response.user.username,
          email: response.user.email,
          profile_image: response.user.profile_image || '',
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

    fetchUser();
  }, [resolvedParams.id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Update profile data
      await adminApi.updateUserProfile(parseInt(resolvedParams.id), {
        username: formData.username,
        email: formData.email,
        profile_image: formData.profile_image,
        theme_mode: formData.theme_mode,
      });

      // Update status
      await adminApi.updateUserStatus(parseInt(resolvedParams.id), {
        is_active: formData.is_active,
        is_verified: formData.is_verified,
      });

      // Update role (only if changing to user)
      if (formData.role === 'user') {
        await adminApi.updateUserRole(parseInt(resolvedParams.id), formData.role);
      }

      // Refresh user data
      const response = await adminApi.getUserById(parseInt(resolvedParams.id));
      setUser(response.user);
      setIsEditing(false);
      
      alert('User updated successfully!');
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        profile_image: user.profile_image || '',
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <MainContentWrapper>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-white">Loading user details...</p>
              </div>
            </div>
          </MainContentWrapper>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <MainContentWrapper>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-white text-lg font-medium mb-2">Error Loading User</p>
                <p className="text-gray-400">{error || 'User not found'}</p>
                <button
                  onClick={() => router.push('/admin/users')}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Back to Users
                </button>
              </div>
            </div>
          </MainContentWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">User Details</h1>
                  <p className="text-gray-400">View and edit user information</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      Edit User
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {user.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{user.username}</h2>
                  <p className="text-gray-400 mb-3">{user.email}</p>
                  <div className="flex items-center space-x-4">
                    <RoleBadge role={user.role} size="md" />
                    <StatusBadge isActive={user.is_active} isVerified={user.is_verified} size="md" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">User ID</p>
                  <p className="text-white font-mono text-lg">#{user.id}</p>
                  <p className="text-gray-400 text-sm mt-2">Joined</p>
                  <p className="text-white text-sm">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>

            {/* User Information Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.username || ''}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-white">{user.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-white">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profile Image URL
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.profile_image || ''}
                        onChange={(e) => handleInputChange('profile_image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-white">{user.profile_image || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme Mode
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.theme_mode || 'dark'}
                        onChange={(e) => handleInputChange('theme_mode', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    ) : (
                      <p className="text-white capitalize">{user.theme_mode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.role || 'user'}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <RoleBadge role={user.role} size="md" />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Status
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-300">Active</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.is_verified}
                            onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-300">Verified</span>
                        </label>
                      </div>
                    ) : (
                      <StatusBadge isActive={user.is_active} isVerified={user.is_verified} size="md" showBoth />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Created At
                    </label>
                    <p className="text-white">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Security Notice</p>
                  <p className="text-yellow-200 text-xs mt-1">
                    Changes to user roles and status will affect their ability to log in and access the system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}

