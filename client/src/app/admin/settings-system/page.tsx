'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import { settingsApi, SystemSettings, FeatureFlags, EmailConfig, validateSystemSettings, validateEmailConfig } from '../../../lib/settingsApi';
import { useAuth } from '../../_components/auth/AuthContext';

export default function AdminSystemSettingsPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'system' | 'features' | 'email'>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    appName: '',
    maintenanceMode: false,
    registrationEnabled: true,
    maxUploadSizeMB: 10,
    siteDescription: '',
    contactEmail: '',
    maxUsersPerDay: 100,
    sessionTimeout: 24,
    updatedAt: '',
    updatedBy: ''
  });

  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    aiFeatures: true,
    templates: true,
    analytics: true,
    forum: true,
    supportTickets: true,
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    socialLogin: false,
    twoFactorAuth: false,
    updatedAt: '',
    updatedBy: ''
  });

  // Email Config State
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'WEBeenThere',
    updatedAt: '',
    updatedBy: ''
  });

  useEffect(() => {
    // Only fetch settings when authentication is complete and user is admin
    if (!authLoading && isAuthenticated && isAdmin) {
      fetchAllSettings();
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  const fetchAllSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [system, features, email] = await Promise.all([
        settingsApi.getSystemSettings(),
        settingsApi.getFeatureFlags(),
        settingsApi.getEmailConfig()
      ]);

      setSystemSettings(system);
      setFeatureFlags(features);
      setEmailConfig(email);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemSettingsSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const errors = validateSystemSettings(systemSettings);
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }

      await settingsApi.updateSystemSettings(systemSettings);
      setSuccess('System settings updated successfully');
    } catch (err) {
      console.error('Failed to update system settings:', err);
      setError('Failed to update system settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeatureFlagsSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await settingsApi.updateFeatureFlags(featureFlags);
      setSuccess('Feature flags updated successfully');
    } catch (err) {
      console.error('Failed to update feature flags:', err);
      setError('Failed to update feature flags');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailConfigSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const errors = validateEmailConfig(emailConfig);
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }

      await settingsApi.updateEmailConfig(emailConfig);
      setSuccess('Email configuration updated successfully');
    } catch (err) {
      console.error('Failed to update email config:', err);
      setError('Failed to update email configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailConfig = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const result = await settingsApi.testEmailConfig();
      setSuccess(result.message);
    } catch (err) {
      console.error('Failed to test email config:', err);
      setError('Failed to test email configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <MainContentWrapper>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-white">Loading settings...</p>
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
              <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
              <p className="text-gray-400">Configure system-wide settings and features</p>
            </div>

            {/* Messages */}
            {(error || success) && (
              <div className="mb-6">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-red-400">{error}</p>
                      </div>
                      <button onClick={clearMessages} className="text-red-400 hover:text-red-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {success && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-green-400">{success}</p>
                      </div>
                      <button onClick={clearMessages} className="text-green-400 hover:text-green-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'system', label: 'System Settings', icon: '⚙️' },
                    { id: 'features', label: 'Feature Flags', icon: '🚩' },
                    { id: 'email', label: 'Email Configuration', icon: '📧' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* System Settings Tab */}
            {activeTab === 'system' && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">System Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Application Name
                    </label>
                    <input
                      type="text"
                      value={systemSettings.appName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, appName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="WEBeenThere"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Upload Size (MB)
                    </label>
                    <input
                      type="number"
                      value={systemSettings.maxUploadSizeMB}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maxUploadSizeMB: parseInt(e.target.value) || 10 })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Site Description
                    </label>
                    <input
                      type="text"
                      value={systemSettings.siteDescription || ''}
                      onChange={(e) => setSystemSettings({ ...systemSettings, siteDescription: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Professional Website Builder Platform"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={systemSettings.contactEmail || ''}
                      onChange={(e) => setSystemSettings({ ...systemSettings, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="admin@webeenthere.com"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-300">
                      Maintenance Mode
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="registrationEnabled"
                      checked={systemSettings.registrationEnabled}
                      onChange={(e) => setSystemSettings({ ...systemSettings, registrationEnabled: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="registrationEnabled" className="ml-2 text-sm text-gray-300">
                      Enable User Registration
                    </label>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleSystemSettingsSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                  >
                    {isSaving ? 'Saving...' : 'Save System Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Feature Flags Tab */}
            {activeTab === 'features' && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Feature Flags</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'aiFeatures', label: 'AI Features', description: 'Enable AI-powered content generation' },
                    { key: 'templates', label: 'Templates', description: 'Enable template system' },
                    { key: 'analytics', label: 'Analytics', description: 'Enable user analytics tracking' },
                    { key: 'forum', label: 'Community Forum', description: 'Enable community forum features' },
                    { key: 'supportTickets', label: 'Support Tickets', description: 'Enable support ticket system' },
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Enable email notifications' },
                    { key: 'socialLogin', label: 'Social Login', description: 'Enable social media login' },
                    { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Enable 2FA for users' }
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">{feature.label}</h3>
                        <p className="text-gray-400 text-sm">{feature.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={featureFlags[feature.key as keyof FeatureFlags] as boolean}
                          onChange={(e) => setFeatureFlags({ ...featureFlags, [feature.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleFeatureFlagsSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                  >
                    {isSaving ? 'Saving...' : 'Save Feature Flags'}
                  </button>
                </div>
              </div>
            )}

            {/* Email Configuration Tab */}
            {activeTab === 'email' && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Email Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={emailConfig.smtpHost}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={emailConfig.smtpPort}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) || 587 })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                      max="65535"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={emailConfig.smtpUser}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your-email@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={emailConfig.smtpPassword}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="noreply@webeenthere.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="WEBeenThere"
                    />
                  </div>
                </div>

                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={handleEmailConfigSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                  >
                    {isSaving ? 'Saving...' : 'Save Email Config'}
                  </button>
                  
                  <button
                    onClick={testEmailConfig}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                  >
                    {isSaving ? 'Testing...' : 'Test Email'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
