'use client';

import React from 'react';
import { SidebarProvider } from '../_components/layout/SidebarContext';
import { AuthGuard } from '../_components/auth/AuthGuard';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AuthGuard>
  );
}

