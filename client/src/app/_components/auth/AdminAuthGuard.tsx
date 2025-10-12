'use client';

import React from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  countdownSeconds?: number;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ 
  children, 
  redirectTo = '/user/main',
  countdownSeconds = 5
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      // Redirect after a short delay to show the message
      const timer = setTimeout(() => {
        router.push(redirectTo);
      }, countdownSeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isAdmin, isLoading, router, redirectTo, countdownSeconds]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Access Denied
          </h1>
          
          <p className="text-gray-300 mb-6">
            {!isAuthenticated 
              ? 'You must be logged in to access the admin panel.'
              : 'You do not have admin privileges to access this area.'
            }
          </p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm">
              Redirecting to user dashboard in {countdownSeconds} seconds...
            </p>
          </div>
          
          <button
            onClick={() => router.push(redirectTo)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            Go to User Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

