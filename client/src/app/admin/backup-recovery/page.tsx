'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import { useAuth } from '../../_components/auth/AuthContext';
import { backupApi, downloadBlob } from '../../../lib/backupApi';

export default function BackupRecoveryPage() {
  const { token, isAdmin, isLoading: authLoading } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!authLoading) {
      if (!token) {
        setError('Authentication required. Please log in.');
        setIsReady(false);
      } else if (!isAdmin) {
        setError('Admin privileges required to access this page.');
        setIsReady(false);
      } else {
        setIsReady(true);
        setError(null);
      }
    }
  }, [token, isAdmin, authLoading]);

  const handleExport = async () => {
    if (!token || !isAdmin) {
      setError('Authentication required. Please log in as admin.');
      return;
    }

    try {
      setIsExporting(true);
      setError(null);
      setSuccess(null);

      console.log('[Backup] Starting database export...');
      console.log('[Backup] Token available:', !!token);
      console.log('[Backup] Is admin:', isAdmin);

      const blob = await backupApi.exportDatabase();
      
      if (!blob || blob.size === 0) {
        throw new Error('Received empty backup file');
      }

      const fileName = `database-export-${new Date().toISOString().split('T')[0]}.sql`;
      
      downloadBlob(blob, fileName);
      setSuccess(`Database exported successfully (${(blob.size / 1024).toFixed(2)} KB)`);
      
      console.log('[Backup] Export completed successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (err: any) {
      console.error('[Backup] Failed to export database:', err);
      const errorMessage = err.message || err.error || 'Failed to export database. Please check your connection and try again.';
      setError(errorMessage);
      
      // Clear error message after 10 seconds
      setTimeout(() => {
        setError(null);
      }, 10000);
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-primary mb-4">Backup</h1>
              <p className="text-secondary text-lg max-w-2xl mx-auto">
                Export your entire database as a SQL file for backup purposes.
              </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="max-w-2xl mx-auto mb-8 p-4 bg-surface-elevated border border-app rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-primary">{success}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="max-w-2xl mx-auto mb-8 p-4 bg-surface-elevated border border-app rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-primary">{error}</span>
                </div>
              </div>
            )}

            {/* Export Section */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-surface rounded-lg border border-app p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-primary mb-2">Export Database</h2>
                    <p className="text-secondary">
                      Download a complete backup of your database as a SQL file.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleExport}
                  disabled={!isReady || !token || !isAdmin}
                  className={`w-full px-6 py-3 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 ${
                    !isReady || !token || !isAdmin
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-60'
                      : isExporting
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg cursor-wait'
                      : 'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black shadow-md hover:shadow-lg'
                  }`}
                >
                  {isExporting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white dark:text-black font-semibold">Exporting...</span>
                    </>
                  ) : !isReady || !token || !isAdmin ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="font-semibold">Authentication Required</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="font-semibold">Export Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Information Section */}
            <div className="max-w-2xl mx-auto mt-12">
              <div className="bg-surface rounded-lg border border-app p-8">
                <h3 className="text-2xl font-semibold text-primary mb-4">About Database Backup</h3>
                <div className="space-y-4 text-secondary">
                  <p>
                    The backup feature allows you to create a complete copy of your database. This is useful for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Creating regular backups before major changes</li>
                    <li>Migrating data between environments</li>
                    <li>Recovering from data loss or corruption</li>
                    <li>Transferring your database to a new server</li>
                  </ul>
                  <p className="pt-4">
                    <strong className="text-primary">Note:</strong> The exported file contains all tables and data in SQL format. Keep your backup files secure as they contain sensitive information.
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
