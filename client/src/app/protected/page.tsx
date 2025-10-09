'use client';

import React from 'react';
import { requireAuth } from '../_components/auth/requireAuth';

const ProtectedPageContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🛡️ Protected Page
        </h1>
        <p className="text-gray-300 mb-6">
          This page requires authentication. If you can see this, you're logged in!
        </p>
        <div className="bg-green-600 text-white px-6 py-3 rounded-lg">
          ✅ Access granted - You are authenticated!
        </div>
      </div>
    </div>
  );
};

// Apply authentication protection with custom countdown
const ProtectedPage = requireAuth(ProtectedPageContent, {
  redirectTo: '/login',
  countdownSeconds: 10
});

export default ProtectedPage;
