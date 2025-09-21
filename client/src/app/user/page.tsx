'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main dashboard by default
    router.replace('/user/main');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-lg">Redirecting to dashboard...</p>
      </div>
    </div>
  );
} 