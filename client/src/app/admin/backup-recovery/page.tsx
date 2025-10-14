'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import BackupStats from '../../_components/admin/BackupStats';
import BackupList from '../../_components/admin/BackupList';
import BackupSchedule from '../../_components/admin/BackupSchedule';
import BackupRestore from '../../_components/admin/BackupRestore';
import { 
  backupApi, 
  Backup, 
  BackupStats as BackupStatsType, 
  ScheduleConfig,
  BackupCreateRequest,
  downloadBlob 
} from '../../../lib/backupApi';

export default function BackupRecoveryPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStatsType>({
    totalBackups: 0,
    totalSize: 0,
    lastBackupDate: null,
    backupsByType: {},
    successRate: 0
  });
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    enabled: false,
    frequency: 'daily',
    time: '02:00',
    dayOfWeek: 0,
    dayOfMonth: 1,
    retentionDays: 30,
    autoDelete: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Backup creation form state
  const [backupForm, setBackupForm] = useState<BackupCreateRequest>({
    type: 'full',
    description: '',
    encrypt: false,
    password: ''
  });
  
  // Restore dialog state
  const [restoreDialog, setRestoreDialog] = useState<{
    isOpen: boolean;
    backup: Backup | null;
  }>({
    isOpen: false,
    backup: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [backupsResult, statsResult, scheduleResult] = await Promise.all([
        backupApi.listBackups({ limit: 50 }),
        backupApi.getStats(),
        backupApi.getSchedule()
      ]);
      
      if (backupsResult.success) {
        setBackups(backupsResult.backups);
      }
      
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
      
      if (scheduleResult.success) {
        setSchedule(scheduleResult.schedule);
      }
      
    } catch (err) {
      console.error('Failed to fetch backup data:', err);
      setError('Failed to load backup data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (backupForm.encrypt && !backupForm.password) {
      setError('Password is required when encryption is enabled');
      return;
    }
    
    try {
      setIsCreating(true);
      setError(null);
      setSuccess(null);
      
      const result = await backupApi.createBackup(backupForm);
      
      if (result.success) {
        setSuccess(`${backupForm.type} backup created successfully`);
        setBackupForm({
          type: 'full',
          description: '',
          encrypt: false,
          password: ''
        });
        // Refresh data
        await fetchData();
      } else {
        setError(result.error || 'Failed to create backup');
      }
      
    } catch (err) {
      console.error('Failed to create backup:', err);
      setError('Failed to create backup');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadBackup = async (backupId: string) => {
    try {
      setError(null);
      
      const blob = await backupApi.downloadBackup(backupId);
      const backup = backups.find(b => b.id === backupId);
      const filename = backup?.fileName || `backup-${backupId}`;
      
      downloadBlob(blob, filename);
      setSuccess('Backup download started');
      
    } catch (err) {
      console.error('Failed to download backup:', err);
      setError('Failed to download backup');
    }
  };

  const handleRestoreBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (backup) {
      setRestoreDialog({
        isOpen: true,
        backup
      });
    }
  };

  const handleConfirmRestore = async (password?: string) => {
    if (!restoreDialog.backup) return;
    
    try {
      setIsRestoring(true);
      setError(null);
      setSuccess(null);
      
      const result = await backupApi.restoreBackup(restoreDialog.backup.id, {
        confirm: true,
        password
      });
      
      if (result.success) {
        setSuccess('Backup restored successfully');
        setRestoreDialog({ isOpen: false, backup: null });
        // Refresh data
        await fetchData();
      } else {
        setError(result.error || 'Failed to restore backup');
      }
      
    } catch (err) {
      console.error('Failed to restore backup:', err);
      setError('Failed to restore backup');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      const result = await backupApi.deleteBackup(backupId);
      
      if (result.success) {
        setSuccess('Backup deleted successfully');
        // Refresh data
        await fetchData();
      } else {
        setError(result.error || 'Failed to delete backup');
      }
      
    } catch (err) {
      console.error('Failed to delete backup:', err);
      setError('Failed to delete backup');
    }
  };

  const handleUpdateSchedule = async (newSchedule: ScheduleConfig) => {
    try {
      setError(null);
      setSuccess(null);
      
      const result = await backupApi.updateSchedule(newSchedule);
      
      if (result.success) {
        setSchedule(newSchedule);
        setSuccess('Backup schedule updated successfully');
      } else {
        setError(result.error || 'Failed to update schedule');
      }
      
    } catch (err) {
      console.error('Failed to update schedule:', err);
      setError('Failed to update schedule');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Backup & Recovery</h1>
              <p className="text-gray-400">Manage system backups and recovery procedures</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-900/50 border border-green-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-300">{success}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-300">{error}</span>
                </div>
              </div>
            )}

            {/* Backup Statistics */}
            <BackupStats stats={stats} className="mb-8" />

            {/* Create Backup Form */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">Create New Backup</h2>
              
              <form onSubmit={handleCreateBackup} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Backup Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Backup Type
                    </label>
                    <select
                      value={backupForm.type}
                      onChange={(e) => setBackupForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="full">Full Backup (Database + Files)</option>
                      <option value="database">Database Only</option>
                      <option value="files">Files Only</option>
                      <option value="incremental">Incremental Backup</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={backupForm.description}
                      onChange={(e) => setBackupForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this backup"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Encryption Options */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="encrypt"
                      checked={backupForm.encrypt}
                      onChange={(e) => setBackupForm(prev => ({ ...prev, encrypt: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="encrypt" className="ml-2 text-sm text-gray-300">
                      Encrypt backup with password
                    </label>
                  </div>

                  {backupForm.encrypt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Encryption Password
                      </label>
                      <input
                        type="password"
                        value={backupForm.password}
                        onChange={(e) => setBackupForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter password for encryption"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Create Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isCreating || (backupForm.encrypt && !backupForm.password)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </div>
                    ) : (
                      'Create Backup'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Backup Schedule */}
            <BackupSchedule 
              schedule={schedule} 
              onUpdate={handleUpdateSchedule}
              className="mb-8"
            />

            {/* Backup List */}
            <BackupList
              backups={backups}
              onDownload={handleDownloadBackup}
              onRestore={handleRestoreBackup}
              onDelete={handleDeleteBackup}
              isLoading={isLoading}
            />

            {/* Restore Dialog */}
            <BackupRestore
              backup={restoreDialog.backup}
              isOpen={restoreDialog.isOpen}
              onClose={() => setRestoreDialog({ isOpen: false, backup: null })}
              onConfirm={handleConfirmRestore}
              isRestoring={isRestoring}
            />
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
