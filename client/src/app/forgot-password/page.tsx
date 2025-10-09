'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Background from '../_components/layout/Background';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setStatus('error');
      setMessage('Failed to send reset email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Background>
      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                WEBeenThere
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          </div>

          {status === 'form' && (
            <>
              <p className="text-gray-300 mb-6 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-center">
                <div className="text-6xl mb-6">📧</div>
                <h1 className="text-2xl font-bold text-green-400 mb-4">Check Your Email</h1>
                <p className="text-white mb-6">{message}</p>
                <p className="text-gray-300 mb-6">
                  Don't see the email? Check your spam folder or try again.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setStatus('form')}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Try Different Email
                  </button>
                  <Link
                    href="/login"
                    className="w-full inline-block bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-center">
                <div className="text-6xl mb-6">❌</div>
                <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
                <p className="text-white mb-6">{message}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setStatus('form')}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/login"
                    className="w-full inline-block bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </Background>
  );
}
