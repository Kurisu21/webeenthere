'use client';

import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  // Debug log to help identify if modal is rendering
  console.log('ConfirmDialog rendering:', { isOpen, title, message });

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'info':
        return {
          icon: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          icon: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        };
    }
  };

  const { icon, confirmButton } = getVariantStyles();

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem'
      }}
    >
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        onClick={onCancel}
      ></div>

      {/* Dialog */}
      <div 
        className="relative bg-surface rounded-lg shadow-xl max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto"
        style={{
          position: 'relative',
          backgroundColor: 'var(--surface)',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '28rem',
          width: '100%',
          margin: '0 auto',
          maxHeight: '90vh'
        }}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-100 dark:bg-red-900/20">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-primary">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-secondary">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-surface px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row-reverse gap-2 sm:gap-3 rounded-b-lg">
          <button
            type="button"
            className={`px-4 py-2.5 sm:py-2 rounded-md text-sm font-medium min-h-[44px] ${confirmButton}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="px-4 py-2.5 sm:py-2 rounded-md text-sm font-medium bg-surface text-secondary hover:bg-surface-elevated border border-app min-h-[44px]"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
