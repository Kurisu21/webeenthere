'use client';

import React from 'react';
import Background from '../_components/layout/Background';
import { AuthGuard } from '../_components/auth/AuthGuard';

const SecureDashboardContent: React.FC = () => {
  return (
    <Background>
      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-2xl bg-gray-900/50 backdrop-blur-sm rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🚀 Secure Dashboard
            </h1>
            <p className="text-gray-300">
              This is a highly secure area that requires special authentication.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-600/20 p-6 rounded-lg border border-purple-500/30">
              <h3 className="text-white font-semibold mb-2">🔒 Security Features</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Email verification required</li>
                <li>• Session timeout protection</li>
                <li>• Secure token validation</li>
                <li>• Automatic logout on inactivity</li>
              </ul>
            </div>
            
            <div className="bg-blue-600/20 p-6 rounded-lg border border-blue-500/30">
              <h3 className="text-white font-semibold mb-2">⚡ Performance</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Real-time data updates</li>
                <li>• Optimized loading speeds</li>
                <li>• Cached responses</li>
                <li>• Background sync</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg inline-block">
              🎉 Welcome to your secure dashboard!
            </div>
          </div>
        </div>
      </main>
    </Background>
  );
};

const SecureDashboardPage: React.FC = () => {
  return (
    <AuthGuard redirectTo="/login" countdownSeconds={8}>
      <SecureDashboardContent />
    </AuthGuard>
  );
};

export default SecureDashboardPage;
