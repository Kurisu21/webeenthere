'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Background from '../_components/layout/Background';
import { API_ENDPOINTS, apiPost } from '@/lib/apiConfig';

function VerifyCodeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) {
            newCode[i] = digit;
          }
        });
        setCode(newCode);
        if (digits.length === 6) {
          inputRefs.current[5]?.focus();
        } else if (digits.length > 0) {
          inputRefs.current[digits.length]?.focus();
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiPost(`${API_ENDPOINTS.USERS}/verify-code`, {
        email,
        code: codeString,
      });

      if (response.message) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      if (error.response) {
        const errorData = await error.response.json();
        setError(errorData.error || 'Invalid verification code. Please try again.');
      } else {
        setError('Failed to verify code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) {
      return;
    }

    setIsResending(true);
    setError('');

    try {
      const response = await apiPost(`${API_ENDPOINTS.USERS}/resend-code`, {
        email,
      });

      if (response.message) {
        setResendCooldown(60); // 60 second cooldown
        setCode(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      if (error.response) {
        const errorData = await error.response.json();
        setError(errorData.error || 'Failed to resend code. Please try again.');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <Background>
        <main className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-2xl font-bold text-green-400 mb-4">Email Verified!</h1>
            <p className="text-white mb-6">Your email has been successfully verified. Redirecting to login...</p>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </main>
      </Background>
    );
  }

  return (
    <Background>
      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                WEBeenThere
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-300 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="text-purple-300 font-medium mt-1">{email}</p>
            <p className="text-gray-400 text-xs mt-2">
              The code will expire in 15 minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-colors"
                  />
                ))}
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.join('').length !== 6}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isResending}
                className="text-purple-400 hover:text-purple-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Resend Code'}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-700">
              <Link
                href="/register"
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                Back to Registration
              </Link>
            </div>
          </form>
        </div>
      </main>
    </Background>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense
      fallback={
        <Background>
          <main className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
            </div>
          </main>
        </Background>
      }
    >
      <VerifyCodeContent />
    </Suspense>
  );
}

