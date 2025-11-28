'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import UserTable from '../../_components/admin/UserTable';
import UserDetailsModal from '../../_components/admin/UserDetailsModal';
import { adminApi, User, UsersResponse } from '../../../lib/adminApi';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    is_verified: true,
  });
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: UsersResponse = await adminApi.getAllUsers({
        page,
        limit: 15,
        search,
      });
      
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'verify' | 'unverify') => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`
    );

    if (!confirmed) return;

    try {
      const promises = selectedUsers.map(userId => {
        switch (action) {
          case 'activate':
            return adminApi.updateUserStatus(userId, { is_active: true });
          case 'deactivate':
            return adminApi.updateUserStatus(userId, { is_active: false });
          case 'verify':
            return adminApi.updateUserStatus(userId, { is_verified: true });
          case 'unverify':
            return adminApi.updateUserStatus(userId, { is_verified: false });
        }
      });

      await Promise.all(promises);
      setSelectedUsers([]);
      fetchUsers(currentPage, searchTerm);
      alert(`Successfully ${action}d ${selectedUsers.length} user(s)`);
    } catch (err) {
      console.error('Failed to perform bulk action:', err);
      alert('Failed to perform bulk action');
    }
  };

  const handleEditUser = (user: User) => {
    // Open user details modal
    setSelectedUserId(user.id);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, { is_active: isActive });
      fetchUsers(currentPage, searchTerm);
    } catch (err) {
      console.error('Failed to update user status:', err);
      alert('Failed to update user status');
    }
  };

  const handleToggleVerified = async (userId: number, isVerified: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, { is_verified: isVerified });
      fetchUsers(currentPage, searchTerm);
    } catch (err) {
      console.error('Failed to update user verification:', err);
      alert('Failed to update user verification');
    }
  };

  const handleViewDetails = (userId: number) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const handleUserUpdated = () => {
    // Refresh the users list when a user is updated
    fetchUsers(currentPage, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setShowBulkActions(selectedUsers.length > 0);
  }, [selectedUsers]);

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">User Management</h1>
                  <p className="text-secondary">Search and manage user profiles with bulk operations</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create User</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users by username or email..."
                        className="w-full px-4 py-3 pl-10 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <svg className="w-5 h-5 absolute left-3 top-3.5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="bg-surface-elevated border border-app rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-primary font-medium">
                      {selectedUsers.length} user(s) selected
                    </span>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="text-secondary hover:text-primary transition-colors text-sm"
                    >
                      Clear Selection
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleBulkAction('verify')}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleBulkAction('unverify')}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Unverify
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {pagination && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-secondary text-sm">
                  Showing {users.length} of {pagination.totalUsers} users
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
            )}

            {/* User Table with Selection */}
            <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface/50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-primary bg-surface border-app rounded focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                            className="w-4 h-4 text-primary bg-surface border-app rounded focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mr-3 border border-app">
                              <span className="text-primary dark:text-primary font-semibold text-xs">
                                {user.username.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-primary">{user.username}</div>
                              <div className="text-xs text-secondary">#{user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_active 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_verified 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {user.is_verified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(user.id)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Edit User"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === currentPage;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isCurrentPage
                            ? 'bg-blue-600 dark:bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-400">{error}</span>
                </div>
              </div>
            )}
          </div>
        </MainContentWrapper>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserUpdated={handleUserUpdated}
      />

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsCreateModalOpen(false)}>
          <div 
            className="bg-surface rounded-lg border border-app max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-app p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-primary">Create New User</h2>
                <p className="text-secondary text-sm mt-1">Create a new user account</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-secondary hover:text-primary transition-colors p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={createFormData.username}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Minimum 8 characters"
                  />
                  <p className="text-secondary text-xs mt-1">Password must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Role
                  </label>
                  <select
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                    className="w-full px-3 py-2 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createFormData.is_verified}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-surface border-app rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-primary">User is verified (no email verification required)</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateFormData({
                      username: '',
                      email: '',
                      password: '',
                      role: 'user',
                      is_verified: true,
                    });
                  }}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!createFormData.username || !createFormData.email || !createFormData.password) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    if (createFormData.password.length < 8) {
                      alert('Password must be at least 8 characters');
                      return;
                    }

                    try {
                      setIsCreating(true);
                      await adminApi.createUser({
                        username: createFormData.username,
                        email: createFormData.email,
                        password: createFormData.password,
                        role: createFormData.role,
                        is_verified: createFormData.is_verified,
                      });
                      
                      setIsCreateModalOpen(false);
                      setCreateFormData({
                        username: '',
                        email: '',
                        password: '',
                        role: 'user',
                        is_verified: true,
                      });
                      
                      // Refresh users list
                      fetchUsers(currentPage, searchTerm);
                      alert('User created successfully!');
                    } catch (err: any) {
                      console.error('Failed to create user:', err);
                      alert(err.message || 'Failed to create user');
                    } finally {
                      setIsCreating(false);
                    }
                  }}
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
