'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Background from '../layout/Background';

interface LoginRequiredProps {
  redirectTo?: string;
  countdownSeconds?: number;
}

export const LoginRequired: React.FC<LoginRequiredProps> = ({
  redirectTo = '/login',
  countdownSeconds = 10
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      router.push(redirectTo);
    }
  }, [countdown, router, redirectTo]);

  return (
    <Background>
      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 text-center">
          {/* Brand */}
          <div className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              WEBeenThere
            </span>
          </div>

          {/* Main Content */}
          <div className="mb-8">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
            <p className="text-gray-300 mb-6">
              You need to be logged in to access this page. Please sign in to continue.
            </p>
          </div>

          {/* Countdown */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm mb-2">Redirecting automatically in:</p>
            <div className={`text-3xl font-bold transition-colors duration-300 ${
              countdown <= 3 ? 'text-red-400 animate-pulse' : 'text-purple-400'
            }`}>
              {countdown}
            </div>
            <p className="text-gray-400 text-xs mt-1">seconds</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={redirectTo}
              className="w-full inline-block bg-gradient-to-r from-purple-500 to-blue-600 hover:bg-purple-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              Go to Login
            </Link>
            <Link
              href="/register"
              className="w-full inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              Create Account
            </Link>
          </div>

          {/* Footer Link */}
          <div className="mt-6">
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </Background>
  );
};

export default LoginRequired;
