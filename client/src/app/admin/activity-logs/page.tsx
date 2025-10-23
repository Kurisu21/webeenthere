'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import ActivityStats from '../../_components/admin/ActivityStats';
import { 
  activityApi, 
  ActivityLog, 
  ActivityFilters, 
  ActivityPagination,
  formatActivityDate,
  getActionIcon,
  getActionColor,
  downloadBlob,
  createDateFilter
} from '../../../lib/activityApi';
import { formatActivityDetails, getActionDescription, formatActivityTimestamp, getActivityPriority } from '../../../lib/activityFormatters';
import { adminApi } from '../../../lib/adminApi';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<ActivityPagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{id: number, username: string, email: string}>>([]);

  // Filters
  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    limit: 50,
    search: '',
    action: '',
    userId: undefined,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [filters.page, filters.limit]);

  // Fetch users for filter dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userStats = await adminApi.getUserStats();
        if (userStats.users) {
          setUsers(userStats.users.map((user: any) => ({
            id: user.id,
            username: user.username,
            email: user.email
          })));
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }
      
      if (event.key === 'ArrowLeft' && pagination.page > 1) {
        handlePageChange(pagination.page - 1);
      } else if (event.key === 'ArrowRight' && pagination.page < pagination.totalPages) {
        handlePageChange(pagination.page + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pagination.page, pagination.totalPages]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await activityApi.getActivityLogs(filters);
      setLogs(result.logs);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ActivityFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = () => {
    fetchLogs();
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      const blob = await activityApi.exportActivityLogs(filters, format);
      const filename = `activity-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Failed to export logs:', err);
      setError('Failed to export activity logs');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      search: '',
      action: '',
      userId: undefined,
      startDate: '',
      endDate: ''
    });
  };

  const applyQuickFilter = (days: number) => {
    const dateFilter = createDateFilter(days);
    setFilters(prev => ({
      ...prev,
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
      page: 1
    }));
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
              <h1 className="text-3xl font-bold text-primary mb-2">Activity Logs</h1>
              <p className="text-secondary">Monitor and track system activities</p>
            </div>

            {/* Activity Stats */}
            <ActivityStats className="mb-8" />

            {/* Filters */}
            <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-8">
              <h2 className="text-lg font-semibold text-primary mb-4">Filters</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Search by username or action..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Action Type
                  </label>
                  <select
                    value={filters.action || ''}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">All Actions</option>
                    <option value="website_created">Website Created</option>
                    <option value="website_updated">Website Updated</option>
                    <option value="website_published">Website Published</option>
                    <option value="website_unpublished">Website Unpublished</option>
                    <option value="website_deleted">Website Deleted</option>
                    <option value="profile_updated">Profile Updated</option>
                    <option value="password_changed">Password Changed</option>
                    <option value="user_login">User Login</option>
                    <option value="user_logout">User Logout</option>
                    <option value="admin_login">Admin Login</option>
                    <option value="failed_login_attempt">Failed Login</option>
                    <option value="template_selected">Template Selected</option>
                    <option value="template_customized">Template Customized</option>
                    <option value="block_added">Block Added</option>
                    <option value="block_updated">Block Updated</option>
                    <option value="block_deleted">Block Deleted</option>
                    <option value="user_management">User Management</option>
                    <option value="settings_update">Settings Update</option>
                    <option value="role_change">Role Change</option>
                    <option value="status_change">Status Change</option>
                    <option value="data_export">Data Export</option>
                    <option value="system_maintenance">System Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    User
                  </label>
                  <select
                    value={filters.userId || ''}
                    onChange={(e) => handleFilterChange('userId', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-input border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">All Users</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Quick Filters
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => applyQuickFilter(1)}
                    className="px-3 py-1 text-sm bg-surface-elevated text-secondary rounded-lg hover:bg-accent hover:text-white transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => applyQuickFilter(7)}
                    className="px-3 py-1 text-sm bg-surface-elevated text-secondary rounded-lg hover:bg-accent hover:text-white transition-colors"
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => applyQuickFilter(30)}
                    className="px-3 py-1 text-sm bg-surface-elevated text-secondary rounded-lg hover:bg-accent hover:text-white transition-colors"
                  >
                    Last 30 days
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-sm bg-surface-elevated text-secondary rounded-lg hover:bg-accent hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    Search
                  </button>
                  
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                  </button>
                  
                  <button
                    onClick={() => handleExport('json')}
                    disabled={isExporting}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-400 disabled:to-cyan-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    {isExporting ? 'Exporting...' : 'Export JSON'}
                  </button>
                </div>
                
                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-secondary">Items per page:</label>
                  <select
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    className="px-2 py-1 text-sm bg-input border border-app rounded text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Activity Logs Table */}
            <div className="bg-surface-elevated rounded-lg border border-app">
              <div className="p-6 border-b border-app">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-primary">Activity Logs</h2>
                  <div className="text-sm text-secondary">
                    {pagination.total} total activities
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : logs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-elevated/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {logs.map((log) => {
                        const priority = getActivityPriority(log.action || '');
                        const timestamp = formatActivityTimestamp(log.timestamp || '');
                        const formattedDetails = formatActivityDetails(log.action || '', log.details);
                        const actionDescription = getActionDescription(log.action || '');
                        
                        return (
                          <tr key={log.id || Math.random()} className="hover:bg-surface-elevated/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-lg mr-2">{getActionIcon(log.action || '')}</span>
                                <div>
                                  <span className={`text-sm font-medium ${getActionColor(log.action || '')}`}>
                                    {actionDescription}
                                  </span>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {priority === 'critical' && '🔴 Critical'}
                                    {priority === 'high' && '🟡 High Priority'}
                                    {priority === 'medium' && '🔵 Medium'}
                                    {priority === 'low' && '⚪ Low'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-primary">{log.username || 'Unknown User'}</div>
                              <div className="text-xs text-secondary">ID: {log.userId || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-primary max-w-md">
                                {formattedDetails}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                              {log.ipAddress || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-secondary">
                                <div>{timestamp.date}</div>
                                <div className="text-xs">{timestamp.time}</div>
                                <div className="text-xs">{timestamp.relative}</div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <p className="text-secondary">No activity logs found</p>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-app">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-secondary">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Go to page input */}
                      {pagination.totalPages > 10 && (
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-secondary">Go to page:</label>
                          <input
                            type="number"
                            min="1"
                            max={pagination.totalPages}
                            value={pagination.page}
                            onChange={(e) => {
                              const page = parseInt(e.target.value);
                              if (page >= 1 && page <= pagination.totalPages) {
                                handlePageChange(page);
                              }
                            }}
                            className="w-16 px-2 py-1 text-sm bg-input border border-app rounded text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="px-3 py-1 text-sm bg-surface-elevated text-secondary rounded-lg hover:bg-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        
                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else {
                            // Show pages around current page
                            const startPage = Math.max(1, pagination.page - 2);
                            const endPage = Math.min(pagination.totalPages, startPage + 4);
                            pageNum = startPage + i;
                            if (pageNum > endPage) return null;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                pagination.page === pageNum
                                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                  : 'bg-surface-elevated text-secondary hover:bg-accent hover:text-white'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }).filter(Boolean)}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="px-3 py-1 text-sm bg-surface-elevated text-secondary rounded-lg hover:bg-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
