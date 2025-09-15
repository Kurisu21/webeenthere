'use client';

import React, { useCallback, memo } from 'react';

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: 'main', label: 'Main', icon: '🏠' },
  { id: 'profile', label: 'User Details', icon: '👤' },
  { id: 'builder', label: '+ Create', icon: '➕' },
  { id: 'host', label: 'Host', icon: '⚙️' },
  { id: 'extensions', label: 'Extensions', icon: '✏️' },
  { id: 'share', label: 'Share', icon: '📤' },
  { id: 'images', label: 'Added Images', icon: '🖼️' },
  { id: 'goals', label: 'Problems & Goals', icon: '🎯' },
];

const DashboardSidebar = memo(({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const handleSectionChange = useCallback((section: string) => {
    onSectionChange(section);
  }, [onSectionChange]);

  return (
    <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col py-4 md:py-8 px-4 md:min-h-screen border-r-0 md:border-r-4 border-gray-700 fixed md:fixed left-0 top-0 z-20 shadow-2xl md:shadow-2xl">
      <div className="mb-4 md:mb-8 text-xl md:text-2xl font-bold text-purple-400 text-center hover:animate-bounce transition-all duration-300">
        User
      </div>
      <nav className="flex md:flex-col flex-1 space-y-2 overflow-x-auto md:overflow-x-visible">
        {navItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleSectionChange(item.id)}
            className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 md:hover:translate-x-2 ${
              activeSection === item.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                : 'hover:bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            <span className="text-base md:text-lg transform transition-transform duration-300 hover:rotate-12">{item.icon}</span>
            <span className="font-medium text-sm md:text-base whitespace-nowrap">{item.label}</span>
            {activeSection === item.id && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </nav>
      
      {/* Bottom decoration */}
      <div className="mt-auto pt-4 border-t border-gray-700 hidden md:block">
        <div className="text-center text-gray-400 text-sm">
          ✨ WEBeenThere ✨
        </div>
      </div>
    </aside>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar; 