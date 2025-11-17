'use client';

import React from 'react';
import { SidebarProvider } from '../_components/layout/SidebarContext';
import { AdminAuthGuard } from '../_components/auth/AdminAuthGuard';
import ThemeProvider from '../_components/theme/ThemeProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <ThemeProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ThemeProvider>
    </AdminAuthGuard>
  );
}

