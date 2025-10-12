'use client';

import React from 'react';
import { useAuth } from '../_components/auth/AuthContext';

export default function TestSidebarPage() {
  const { user, token, isAuthenticated, isAdmin, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    console.log('Logged out');
  };

  const handleClearStorage = () => {
    localStorage.clear();
    console.log('Local storage cleared');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Auth Debug Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auth State */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Auth State</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Loading:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${isLoading ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                  {isLoading ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Authenticated:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${isAuthenticated ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Is Admin:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isAdmin ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Token:</span>
                <span className="ml-2 text-sm text-gray-300">
                  {token ? `${token.substring(0, 20)}...` : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* User Data */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">User Data</h2>
            {user ? (
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">ID:</span>
                  <span className="ml-2 text-white">{user.id}</span>
                </div>
                <div>
                  <span className="text-gray-400">Username:</span>
                  <span className="ml-2 text-white">{user.username}</span>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="ml-2 text-white">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">Role:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    user.role === 'admin' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No user data</p>
            )}
          </div>

          {/* Local Storage */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Local Storage</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Token:</span>
                <span className="ml-2 text-sm text-gray-300">
                  {localStorage.getItem('token') ? `${localStorage.getItem('token')?.substring(0, 20)}...` : 'None'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">User:</span>
                <span className="ml-2 text-sm text-gray-300">
                  {localStorage.getItem('user') ? 'Present' : 'None'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Remember Me:</span>
                <span className="ml-2 text-sm text-gray-300">
                  {localStorage.getItem('rememberMe') || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
              <button
                onClick={handleClearStorage}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Local Storage
              </button>
              <a
                href="/admin/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-center"
              >
                Go to Admin Login
              </a>
              <a
                href="/admin/dashboard"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-center"
              >
                Go to Admin Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
          <div className="bg-gray-900 rounded p-4">
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify({
                user,
                token: token ? `${token.substring(0, 20)}...` : null,
                isAuthenticated,
                isAdmin,
                isLoading,
                localStorage: {
                  token: localStorage.getItem('token') ? `${localStorage.getItem('token')?.substring(0, 20)}...` : null,
                  user: localStorage.getItem('user'),
                  rememberMe: localStorage.getItem('rememberMe')
                }
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}