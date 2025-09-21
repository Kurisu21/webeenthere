'use client';

import Background from '@/app/_components/layout/Background';
import LoginForm from '@/app/_components/forms/LoginForm';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    // Trigger the slide-in animation after component mounts
    const timer = setTimeout(() => {
      setShowLoginForm(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Background>


      {/* Back to home button */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

    
      <main className="flex min-h-screen">
     
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center max-w-lg">
            <h1 className="text-6xl font-bold mb-6">
              <span className="text-purple-400">WE</span>
              <span className="text-gray-300">BeenThere</span>
            </h1>
            <p className="text-xl text-white leading-relaxed">
              An Online Platform for Personalized and Simplified Content-Driven Website Tool
            </p>
          </div>
        </div>

     
        <div className={`w-1/3 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center px-8 transition-transform duration-700 ease-out ${
          showLoginForm ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <LoginForm />
        </div>
      </main>
    </Background>
  );
} 