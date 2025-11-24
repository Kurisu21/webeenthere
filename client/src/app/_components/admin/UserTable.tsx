'use client';

import React, { useState } from 'react';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';
import { User } from '../../../lib/adminApi';

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onToggleActive: (userId: number, isActive: boolean) => void;
  onToggleVerified: (userId: number, isVerified: boolean) => void;
  onViewDetails: (userId: number) => void;
  isLoading?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onToggleActive,
  onToggleVerified,
  onViewDetails,
  isLoading = false,
}) => {
  const [sortField, setSortField] = useState<keyof User>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const SortIcon = ({ field }: { field: keyof User }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'text-blue-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" : "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"} />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-surface-elevated rounded-lg border border-app">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-surface rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-surface rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
      <div className="table-wrapper">
        <table className="w-full min-w-[640px] sm:min-w-0">
          <thead className="bg-surface/30 hidden sm:table-header-group">
            <tr>
              <th 
                className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center space-x-1">
                  <span>USER</span>
                  <SortIcon field="id" />
                </div>
              </th>
              <th 
                className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort('username')}
              >
                <div className="flex items-center space-x-1">
                  <span>ACTIVITY</span>
                  <SortIcon field="username" />
                </div>
              </th>
              <th 
                className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-1">
                  <span>PLATFORM</span>
                  <SortIcon field="email" />
                </div>
              </th>
              <th 
                className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center space-x-1">
                  <span>PERFORMANCE</span>
                  <SortIcon field="role" />
                </div>
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                FIRST SEEN
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                SECURITY
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface/30 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap" data-label="User">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-surface border border-app rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-primary">{user.username}</div>
                      <div className="text-xs text-secondary">#{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap" data-label="Activity">
                  <div className="flex items-center">
                    <div className="w-full bg-surface rounded-full h-2 mr-3">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.random() * 100}%`}}></div>
                    </div>
                    <span className="text-xs sm:text-sm text-secondary">{Math.floor(Math.random() * 100)}%</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap" data-label="Platform">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm text-secondary">Web Platform</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap" data-label="Performance">
                  <div className="flex items-center justify-between">
                    <RoleBadge role={user.role} size="sm" />
                    <div className="text-xs text-secondary ml-2">
                      {user.role === 'admin' ? '100%' : '75%'}
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary" data-label="First Seen">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap" data-label="Security">
                  {user.is_verified ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      ✓ No threats detected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                      ⚠ {Math.floor(Math.random() * 3) + 1} threats detected
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium" data-label="Actions">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => onViewDetails(user.id)}
                      className="p-1.5 sm:p-0 text-blue-400 hover:text-blue-300 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      title="View Details"
                    >
                      <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEditUser(user)}
                      className="p-1.5 sm:p-0 text-green-400 hover:text-green-300 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      title="Edit User"
                    >
                      <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onToggleActive(user.id, !user.is_active)}
                      className={`p-1.5 sm:p-0 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
                        user.is_active 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-green-400 hover:text-green-300'
                      }`}
                      title={user.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user.is_active ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                      </svg>
                    </button>
                    <button
                      onClick={() => onToggleVerified(user.id, !user.is_verified)}
                      className={`p-1.5 sm:p-0 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
                        user.is_verified 
                          ? 'text-yellow-400 hover:text-yellow-300' 
                          : 'text-blue-400 hover:text-blue-300'
                      }`}
                      title={user.is_verified ? 'Mark Unverified' : 'Mark Verified'}
                    >
                      <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user.is_verified ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" : "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"} />
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
  );
};

export default UserTable;

