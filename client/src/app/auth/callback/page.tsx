'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../_components/auth/AuthContext';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) {
      return;
    }

    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      hasProcessed.current = true;
      setStatus('error');
      setMessage(error === 'oauth_failed' ? 'OAuth authentication failed. Please try again.' : 'An error occurred during authentication.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      return;
    }

    if (!token || !userParam) {
      hasProcessed.current = true;
      setStatus('error');
      setMessage('Invalid authentication response. Please try logging in again.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      
      // Mark as processed before calling login to prevent re-execution
      hasProcessed.current = true;
      
      // Store token and user in auth context
      login(token, user);
      
      setStatus('success');
      setMessage('Successfully authenticated! Redirecting...');
      
      // Redirect to dashboard - use replace to prevent back button issues
      setTimeout(() => {
        router.replace('/user/main');
      }, 1000);
    } catch (error) {
      console.error('Auth callback error:', error);
      hasProcessed.current = true;
      setStatus('error');
      setMessage('Failed to process authentication. Please try again.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Completing authentication...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-white text-lg">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <p className="text-red-300 text-lg">{message}</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

