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
  redirectTo = '/login',
  countdownSeconds = 5
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      // Redirect immediately to login
      router.push(redirectTo);
    }
  }, [isAuthenticated, isAdmin, isLoading, router, redirectTo]);

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

  // Redirect immediately if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return null; // Return null while redirecting
  }

  return <>{children}</>;
};

