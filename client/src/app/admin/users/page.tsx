'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import UserTable from '../../_components/admin/UserTable';
import { adminApi, User, UsersResponse } from '../../../lib/adminApi';
import { useRouter } from 'next/navigation';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const fetchUsers = async (page = 1, search = '', role = '', status = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: UsersResponse = await adminApi.getAllUsers({
        page,
        limit: 10,
        search,
        role,
        status,
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
    fetchUsers(currentPage, searchTerm, roleFilter, statusFilter);
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm, roleFilter, statusFilter);
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, { is_active: isActive });
      // Refresh the users list
      fetchUsers(currentPage, searchTerm, roleFilter, statusFilter);
    } catch (err) {
      console.error('Failed to update user status:', err);
      alert('Failed to update user status');
    }
  };

  const handleToggleVerified = async (userId: number, isVerified: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, { is_verified: isVerified });
      // Refresh the users list
      fetchUsers(currentPage, searchTerm, roleFilter, statusFilter);
    } catch (err) {
      console.error('Failed to update user verification:', err);
      alert('Failed to update user verification');
    }
  };

  const handleEditUser = (user: User) => {
    router.push(`/admin/users/${user.id}`);
  };

  const handleViewDetails = (userId: number) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all related data.')) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      // Refresh the users list
      fetchUsers(currentPage, searchTerm, roleFilter, statusFilter);
      alert('User deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err.message || 'Failed to delete user');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
                <h1 className="text-3xl font-bold text-primary">User Management</h1>
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {users.length} Users
                  </span>
                  <div className="flex space-x-1">
                    <button className="bg-surface-elevated hover:bg-surface text-secondary px-3 py-1 rounded text-sm transition-colors">
                      Active
                    </button>
                    <button className="bg-surface-elevated hover:bg-surface text-secondary px-3 py-1 rounded text-sm transition-colors">
                      Verified
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-primary mb-2">
                      Search Users
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by username or email..."
                        className="w-full px-4 py-2 pl-10 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <svg className="w-5 h-5 absolute left-3 top-2.5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Role Filter */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-primary mb-2">
                      Role
                    </label>
                    <select
                      id="role"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-primary mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Search
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('');
                      setStatusFilter('');
                      setCurrentPage(1);
                    }}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </form>
            </div>

            {/* Results Summary */}
            {pagination && (
              <div className="mb-4">
                <p className="text-secondary text-sm">
                  Showing {users.length} of {pagination.totalUsers} users
                  {searchTerm && ` matching "${searchTerm}"`}
                  {roleFilter && ` with role "${roleFilter}"`}
                  {statusFilter && ` with status "${statusFilter}"`}
                </p>
              </div>
            )}

            {/* User Table */}
            <UserTable
              users={users}
              onEditUser={handleEditUser}
              onToggleActive={handleToggleActive}
              onToggleVerified={handleToggleVerified}
              onViewDetails={handleViewDetails}
              onDeleteUser={handleDeleteUser}
              isLoading={isLoading}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 text-sm font-medium text-secondary bg-surface-elevated border border-app rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'text-secondary bg-surface-elevated border border-app hover:bg-surface'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 text-sm font-medium text-secondary bg-surface-elevated border border-app rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
}

