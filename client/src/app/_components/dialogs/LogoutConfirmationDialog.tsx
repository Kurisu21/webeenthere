'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  userType?: 'user' | 'admin';
}

const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  userType = 'user'
}) => {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  // Only render portal when mounted (client-side)
  if (!mounted || typeof document === 'undefined') return null;

  const dialogContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        style={{ zIndex: 10000 }}
      />
      
      {/* Dialog Container */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 pointer-events-none"
        style={{ zIndex: 10001 }}
      >
        {/* Dialog */}
        <div 
          className="relative bg-surface border border-app rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 md:p-8 pointer-events-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Icon */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 dark:bg-red-500/20 rounded-full flex items-center justify-center">
            <svg 
              className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-primary text-center mb-2">
          Confirm Logout
        </h2>

        {/* Message */}
        <p className="text-sm sm:text-base text-secondary text-center mb-4 sm:mb-6">
          Are you sure you want to logout? You'll need to sign in again to access your account.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-surface-elevated hover:bg-surface-elevated/80 border border-app text-primary rounded-lg font-medium transition-all duration-200 hover:shadow-md min-h-[44px] text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-500/20 min-h-[44px] text-sm sm:text-base"
          >
            Yes, Logout
          </button>
        </div>
        </div>
      </div>
    </>
  );

  // Render to document body using portal
  return createPortal(dialogContent, document.body);
};

export default LogoutConfirmationDialog;

