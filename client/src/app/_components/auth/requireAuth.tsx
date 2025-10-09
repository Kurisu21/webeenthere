'use client';

import React from 'react';
import { AuthGuard } from './AuthGuard';

interface WithAuthOptions {
  redirectTo?: string;
  countdownSeconds?: number;
}

/**
 * Higher Order Component to protect routes that require authentication
 * Shows a login required page with countdown instead of immediate redirect
 */
export function requireAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { 
    redirectTo = '/login', 
    countdownSeconds = 10 
  } = options;

  const ProtectedComponent: React.FC<P> = (props) => {
    return (
      <AuthGuard 
        redirectTo={redirectTo} 
        countdownSeconds={countdownSeconds}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };

  ProtectedComponent.displayName = `requireAuth(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
}

/**
 * Hook-based protection that returns a component to render
 * Useful for conditional protection within pages
 */
export function useAuthProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { 
    redirectTo = '/login', 
    countdownSeconds = 10 
  } = options;

  const ProtectedComponent: React.FC<P> = (props) => {
    return (
      <AuthGuard 
        redirectTo={redirectTo} 
        countdownSeconds={countdownSeconds}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };

  return ProtectedComponent;
}
