'use client';

import Background from '@/app/_components/layout/Background';
import AdminLoginForm from '@/app/_components/forms/AdminLoginForm';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLoginPage() {
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
      {/* Moving Templates Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Template 1 - Moving from left to right */}
        <div className="absolute top-20 left-[-200px] w-64 h-80 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 backdrop-blur-sm animate-slideRight">
          <div className="p-4">
            <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-2"></div>
            <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-4"></div>
            <div className="w-full h-20 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-2/3 h-3 bg-gray-300/30 rounded"></div>
          </div>
        </div>

        {/* Template 2 - Moving from right to left */}
        <div className="absolute top-40 right-[-200px] w-64 h-80 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm animate-slideLeft">
          <div className="p-4">
            <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-2"></div>
            <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-4"></div>
            <div className="w-full h-16 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
          </div>
        </div>

        {/* Template 3 - Floating up and down */}
        <div className="absolute bottom-20 left-1/4 w-56 h-72 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30 backdrop-blur-sm animate-float">
          <div className="p-4">
            <div className="w-full h-3 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-2/3 h-3 bg-gray-300/30 rounded mb-2"></div>
            <div className="w-full h-3 bg-gray-300/30 rounded mb-4"></div>
            <div className="w-full h-12 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
          </div>
        </div>

        {/* Template 4 - Rotating slowly */}
        <div className="absolute top-1/2 right-1/4 w-48 h-64 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm animate-rotateSlow">
          <div className="p-4">
            <div className="w-full h-4 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-2"></div>
            <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-4"></div>
            <div className="w-full h-14 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-2/3 h-3 bg-gray-300/30 rounded"></div>
          </div>
        </div>

        {/* Template 5 - Bouncing */}
        <div className="absolute bottom-1/3 left-1/3 w-52 h-76 bg-gradient-to-br from-green-600/20 to-teal-600/20 rounded-lg border border-green-500/30 backdrop-blur-sm animate-bounce">
          <div className="p-4">
            <div className="w-full h-3 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-3/4 h-3 bg-gray-300/30 rounded mb-2"></div>
            <div className="w-1/2 h-3 bg-gray-300/30 rounded mb-4"></div>
            <div className="w-full h-16 bg-gray-300/30 rounded mb-3"></div>
            <div className="w-1/2 h-3 bg-gray-300/30 rounded"></div>
          </div>
        </div>
      </div>

      <main className="flex flex-col lg:flex-row min-h-screen relative z-10">
        {/* Left Section - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-8 min-h-screen">
          <div className="text-center max-w-lg">
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">WEBeenThere</span>
            </h1>
            <p className="text-xl text-white leading-relaxed mb-2">
              Professional Website Builder Platform
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Administrative Control Panel
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">Restricted Access</span>
            </div>
          </div>
        </div>

        {/* Right Section - Admin Login Form */}
        <div className={`w-full lg:w-1/3 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center px-4 md:px-8 py-8 lg:py-0 h-screen lg:min-h-screen transition-transform duration-700 ease-out ${
          showLoginForm ? 'translate-x-0' : 'translate-x-full lg:translate-x-full'
        }`}>
          <AdminLoginForm />
        </div>
      </main>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideRight {
          0% {
            transform: translateX(-200px) rotate(0deg);
          }
          100% {
            transform: translateX(calc(100vw + 200px)) rotate(360deg);
          }
        }
        
        @keyframes slideLeft {
          0% {
            transform: translateX(200px) rotate(0deg);
          }
          100% {
            transform: translateX(calc(-100vw - 200px)) rotate(-360deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes rotateSlow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .animate-slideRight {
          animation: slideRight 20s linear infinite;
        }
        
        .animate-slideLeft {
          animation: slideLeft 25s linear infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-rotateSlow {
          animation: rotateSlow 30s linear infinite;
        }
      `}</style>
    </Background>
  );
}

