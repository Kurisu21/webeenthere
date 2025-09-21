'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';

const navItems = [
  { id: 'main', label: 'Main', icon: '🏠', href: '/user/main' },
  { id: 'profile', label: 'User Details', icon: '👤', href: '/user/profile' },
  { id: 'create', label: '+ Create', icon: '➕', href: '/user/create' },
  { id: 'host', label: 'Host', icon: '⚙️', href: '/user/host' },
  { id: 'extensions', label: 'Extensions', icon: '✏️', href: '/user/extensions' },
  { id: 'share', label: 'Share', icon: '📤', href: '/user/share' },
  { id: 'images', label: 'Added Images', icon: '🖼️', href: '/user/images' },
  { id: 'goals', label: 'Problems & Goals', icon: '🎯', href: '/user/goals' },
  { id: 'changelog', label: 'Changelog', icon: '📝', href: '/user/changelog' },
];

const DashboardSidebar = memo(() => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside className={`
      fixed left-0 top-0 z-20 bg-gray-900 text-white flex flex-col py-4 md:py-8 px-4 md:min-h-screen border-r-0 md:border-r-4 border-gray-700 shadow-2xl transition-all duration-300 ease-in-out
      ${isCollapsed 
        ? 'w-16 md:w-16' 
        : 'w-full md:w-64'
      }
    `}>
      {/* Header with Toggle Button */}
      <div className="mb-4 md:mb-8 flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-xl md:text-2xl font-bold text-purple-400 text-center hover:animate-bounce transition-all duration-300">
            User
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 flex-shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex md:flex-col flex-1 space-y-2 overflow-x-auto md:overflow-x-visible">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 md:hover:translate-x-2 group
                ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <span className="text-base md:text-lg transform transition-transform duration-300 hover:rotate-12">
                {item.icon}
              </span>
              {!isCollapsed && (
                <>
                  <span className="font-medium text-sm md:text-base whitespace-nowrap">
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Bottom decoration */}
      {!isCollapsed && (
        <div className="mt-auto pt-4 border-t border-gray-700 hidden md:block">
          <div className="text-center text-gray-400 text-sm">
            ✨ WEBeenThere ✨
          </div>
        </div>
      )}
    </aside>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar; 