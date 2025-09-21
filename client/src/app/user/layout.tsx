'use client';

import React from 'react';
import { SidebarProvider } from '../_components/layout/SidebarContext';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}

