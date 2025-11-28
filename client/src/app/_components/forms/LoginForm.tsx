'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS, apiPost, API_BASE_URL } from '@/lib/apiConfig';
import { useAuth } from '../auth/AuthContext';

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Restore rememberMe state on mount
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    setRememberMe(savedRememberMe);
  }, []);

  // Check for OAuth errors in URL parameters
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const detailsParam = searchParams.get('details');
    
    if (errorParam) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      switch (errorParam) {
        case 'connection_not_enabled':
          errorMessage = detailsParam 
            ? decodeURIComponent(detailsParam)
            : 'OAuth connection is not enabled. Please contact support or try using Google login.';
          break;
        case 'oauth_failed':
          errorMessage = detailsParam
            ? decodeURIComponent(detailsParam)
            : 'OAuth authentication failed. Please try again.';
          break;
        case 'access_denied':
          errorMessage = 'Access was denied. Please try again and grant the necessary permissions.';
          break;
        default:
          errorMessage = detailsParam
            ? decodeURIComponent(detailsParam)
            : 'An error occurred during authentication. Please try again.';
      }
      
      setError(errorMessage);
      
      // Clear error from URL after displaying
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiPost(`${API_ENDPOINTS.USERS}/login`, {
        email: email.trim(),
        password: password,
      });

      if (response.token && response.user) {
        // Use auth context to manage login with rememberMe flag
        // The login function will handle storing in localStorage or sessionStorage
        login(response.token, response.user, rememberMe);
        
        // Redirect based on user role
        if (response.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user');
        }
      }
    } catch (error: any) {
      // Display the specific error message from backend
      const errorMessage = error.message || 'Login failed. Please check your connection and try again.';
      setError(errorMessage);
      
      // Check if error is about unverified account
      if (errorMessage.toLowerCase().includes('not verified') || 
          errorMessage.toLowerCase().includes('verify')) {
        setIsUnverified(true);
      } else {
        setIsUnverified(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setIsResendingCode(true);
    setResendSuccess(false);
    setError('');

    try {
      const response = await apiPost(`${API_ENDPOINTS.USERS}/resend-code`, {
        email: email.trim(),
      });

      if (response.message) {
        setResendSuccess(true);
        // Redirect to verify page with email
        router.push(`/verify-code?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resend verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsResendingCode(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 sm:px-0">
      {/* Back to home button - Mobile only */}
      <div className="lg:hidden mb-4 sm:mb-6">
        <Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Brand title */}
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center">
        <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">WEBeenThere</span>
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <span className="text-red-300 text-sm block">{error}</span>
              
              {/* Show resend code options for unverified accounts */}
              {isUnverified && (
                <div className="mt-3 pt-3 border-t border-red-700/50">
                  <p className="text-red-200 text-xs mb-3">
                    Your account needs to be verified before you can login. You can:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleResendCode}
                      disabled={isResendingCode || !email}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-medium py-2 px-3 rounded transition-colors disabled:cursor-not-allowed"
                    >
                      {isResendingCode ? 'Sending...' : 'Resend Verification Code'}
                    </button>
                    <Link
                      href={`/verify-code?email=${encodeURIComponent(email || '')}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded text-center transition-colors"
                    >
                      Go to Verify Page
                    </Link>
                  </div>
                  {resendSuccess && (
                    <p className="text-green-300 text-xs mt-2">
                      ✓ Verification code sent! Redirecting...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
            Email or Username
          </label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email or Username"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 sm:pr-12 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                rememberMe ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  rememberMe ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-300">Remember me</span>
          </div>
          <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
            Forgot password?
          </Link>
        </div>

        <button 
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <a 
            href={`${API_BASE_URL}/api/auth/login/google`}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 sm:gap-3 block text-sm sm:text-base"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </a>
        </div>

        {/* Login Method Explanation */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-blue-200">
              <p className="font-medium mb-1">Login Methods:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-300/80">
                <li>Accounts created with email/password can only login with email/password</li>
                <li>Accounts created with Google can only login with Google</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-300">
          <span>Dont have an account? </span>
          <a href="/register" className="text-blue-400 hover:text-blue-300">
            Sign up now
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 