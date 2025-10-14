'use client';

import React, { useState } from 'react';
import { Backup } from '../../../lib/backupApi';
import { formatFileSize, formatBackupDate, getBackupTypeLabel } from '../../../lib/backupApi';

interface BackupRestoreProps {
  backup: Backup | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password?: string) => void;
  isRestoring?: boolean;
}

const BackupRestore: React.FC<BackupRestoreProps> = ({
  backup,
  isOpen,
  onClose,
  onConfirm,
  isRestoring = false
}) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = () => {
    if (confirmText.toLowerCase() !== 'restore') {
      return;
    }
    onConfirm(backup?.isEncrypted ? password : undefined);
  };

  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    onClose();
  };

  if (!isOpen || !backup) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-700">
          <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Restore Backup
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isRestoring}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {/* Warning */}
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-red-400 font-medium mb-1">Warning: Data Overwrite</h4>
                  <p className="text-red-300 text-sm">
                    This action will overwrite existing data. This cannot be undone. Make sure you have a current backup before proceeding.
                  </p>
                </div>
              </div>
            </div>

            {/* Backup Details */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <h4 className="text-white font-medium mb-3">Backup Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{getBackupTypeLabel(backup.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">File:</span>
                  <span className="text-white font-mono text-xs">{backup.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white">{formatFileSize(backup.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{formatBackupDate(backup.created)}</span>
                </div>
                {backup.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Description:</span>
                    <span className="text-white">{backup.description}</span>
                  </div>
                )}
                {backup.isEncrypted && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Encryption:</span>
                    <span className="text-yellow-400">Encrypted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password Input (if encrypted) */}
            {backup.isEncrypted && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Backup Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter backup password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isRestoring}
                />
              </div>
            )}

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type "restore" to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type 'restore' here"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isRestoring}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleClose}
                disabled={isRestoring}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  isRestoring || 
                  confirmText.toLowerCase() !== 'restore' ||
                  (backup.isEncrypted && !password)
                }
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-red-400 disabled:to-pink-400 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
              >
                {isRestoring ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Restoring...
                  </div>
                ) : (
                  'Restore Backup'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
