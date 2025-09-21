'use client';

import React, { useState, useCallback, memo } from 'react';

const UserProfile = memo(() => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profile_image: '',
    theme_mode: 'dark',
    is_verified: false,
    is_active: true,
  });

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome, Amanda</h1>
          <p className="text-gray-400">Tue, 07 June 2022</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 group-hover:border-blue-400"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Profile Picture */}
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 cursor-pointer">
            <span className="text-gray-300 font-medium">M</span>
          </div>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 h-32 rounded-lg mb-6 hover:scale-[1.02] transition-all duration-500"></div>

      {/* User Info Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 cursor-pointer">
            <span className="text-gray-300 font-medium text-xl">A</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">amanda_user</h2>
            <p className="text-gray-400">amanda@example.com</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
          Edit
        </button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 group-hover:border-blue-400"
            />
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 group-hover:border-blue-400"
            />
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">Profile Image URL</label>
            <input
              type="text"
              value={formData.profile_image}
              onChange={(e) => handleInputChange('profile_image', e.target.value)}
              placeholder="Enter profile image URL"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 group-hover:border-blue-400"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">Theme Mode</label>
            <div className="relative">
              <select
                value={formData.theme_mode}
                onChange={(e) => handleInputChange('theme_mode', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 group-hover:border-blue-400"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">Account Status</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center hover:scale-105 transition-transform duration-300">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 transition-all duration-300"
                />
                <span className="ml-2 text-gray-300">Verified</span>
              </label>
              <label className="flex items-center hover:scale-105 transition-transform duration-300">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 transition-all duration-300"
                />
                <span className="ml-2 text-gray-300">Active</span>
              </label>
            </div>
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">Role</label>
            <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-400 group-hover:border-blue-400 transition-all duration-300">
              User
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Section */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <h3 className="text-lg font-semibold text-white">Account Information</h3>
        </div>
        <p className="text-gray-400">amanda@example.com</p>
        <p className="text-sm text-gray-500">Member since June 2022</p>
      </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile; 