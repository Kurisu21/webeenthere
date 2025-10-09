'use client';

import React from 'react';
import { useAuth } from './AuthContext';
import LoginRequired from './LoginRequired';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  countdownSeconds?: number;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/login',
  countdownSeconds = 10
}) => {
  const { isAuthenticated, isLoading } = useAuth();

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

  // Show login required page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginRequired 
        redirectTo={redirectTo} 
        countdownSeconds={countdownSeconds}
      />
    );
  }

  return <>{children}</>;
};
