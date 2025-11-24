'use client';

import Background from '../_components/layout/Background';
import RegistrationForm from '../_components/forms/RegistrationForm';

export default function RegisterPage() {

  return (
    <Background>
      {/* Beautiful Static Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main Content - Two Column Layout */}
      <main className="flex flex-col lg:flex-row min-h-screen relative z-10">
        {/* Left Section - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-8 min-h-screen">
          <div className="text-center max-w-lg">
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">WEBeenThere</span>
            </h1>
            <p className="text-xl text-white leading-relaxed">
              An Online Platform for Personalized and Simplified Content-Driven Website Tool
            </p>
          </div>
        </div>
        {/* Right Section - Registration Form */}
        <div className="w-full lg:w-1/3 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 lg:py-0 min-h-screen lg:min-h-screen">
          <RegistrationForm />
        </div>
      </main>

    </Background>
  );
} 