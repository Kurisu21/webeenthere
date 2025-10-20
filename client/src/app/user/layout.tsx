'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '../_components/layout/SidebarContext';
import { AuthGuard } from '../_components/auth/AuthGuard';
import ThemeProvider from '../_components/theme/ThemeProvider';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin and redirect to admin dashboard
    const checkUserRole = () => {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      }
    };

    checkUserRole();
  }, [router]);

  return (
    <AuthGuard>
      <ThemeProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ThemeProvider>
    </AuthGuard>
  );
}

