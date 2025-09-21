'use client';

import React from 'react';
import { useSidebar } from './SidebarContext';

interface MainContentWrapperProps {
  children: React.ReactNode;
}

const MainContentWrapper: React.FC<MainContentWrapperProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <main 
      className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}
      `}
    >
      <div className="min-h-[calc(100vh-120px)] p-4 md:p-6">
        {children}
      </div>
    </main>
  );
};

export default MainContentWrapper;

