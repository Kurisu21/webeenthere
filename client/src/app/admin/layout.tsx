'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '../_components/layout/SidebarContext';
import { AdminAuthGuard } from '../_components/auth/AdminAuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't apply auth guard to login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AdminAuthGuard>
  );
}

