'use client';

import React, { memo, useEffect, useState, ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';

// Professional SVG Icons
const Icons = {
  main: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  create: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  host: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  extensions: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  share: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
  ),
  images: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  goals: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  subscription: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  invoice: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  pages: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  history: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0zM4 4v4h4" />
    </svg>
  ),
  support: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636A9 9 0 105.636 18.364 9 9 0 0018.364 5.636zM9 10h.01M15 10h.01M8 15h8" />
    </svg>
  ),
  help: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10a4 4 0 118 0c0 1.657-1 2.5-2 3m-2 4h.01" />
    </svg>
  ),
  forum: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z" />
    </svg>
  ),
  feedback: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m1 8l-4-4H8a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
};

type NavItem = { id: string; label: string; icon: ReactElement; href: string };
type NavSection = { id: string; title: string; items: NavItem[] };

// Section Icons
const SectionIcon = ({ id }: { id: string }) => {
  const iconClass = "w-5 h-5";
  switch (id) {
    case 'general':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case 'account':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'support':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636A9 9 0 105.636 18.364 9 9 0 0018.364 5.636zM9 10h.01M15 10h.01M8 15h8" />
        </svg>
      );
    default:
      return null;
  }
};

const sections: NavSection[] = [
  {
    id: 'general',
    title: 'General',
    items: [
      { id: 'main', label: 'Main', icon: Icons.main, href: '/user/main' },
      { id: 'create', label: '+ Create', icon: Icons.create, href: '/user/create' },
      { id: 'pages', label: 'My Pages', icon: Icons.pages, href: '/user/pages' },
      { id: 'images', label: 'Media Library', icon: Icons.images, href: '/user/images' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    items: [
      { id: 'profile', label: 'User Details', icon: Icons.profile, href: '/user/profile' },
      { id: 'subscription', label: 'Subscription', icon: Icons.subscription, href: '/user/subscription' },
      { id: 'history', label: 'History', icon: Icons.history, href: '/user/history' },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    items: [
      { id: 'help', label: 'Help Center', icon: Icons.help, href: '/user/help' },
      { id: 'support', label: 'Support', icon: Icons.support, href: '/user/support' },
      { id: 'forum', label: 'Forum', icon: Icons.forum, href: '/user/forum' },
      { id: 'feedback', label: 'Feedback', icon: Icons.feedback, href: '/user/feedback' },
    ],
  },
];

const DashboardSidebar = memo(() => {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } = useSidebar();
  
  // Accordion state management
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general', 'account', 'support']));
  
  // Load saved preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user-sidebar-sections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setExpandedSections(new Set(parsed));
      } catch (error) {
        console.warn('Failed to parse saved sidebar sections:', error);
      }
    }
  }, []);
  
  // Save preferences to localStorage
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      localStorage.setItem('user-sidebar-sections', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-40 bg-surface text-primary flex flex-col py-4 md:py-8 px-4 md:min-h-screen border-r-0 md:border-r-4 border-app shadow-2xl transition-all duration-300 ease-in-out
        ${isCollapsed 
          ? 'w-16 md:w-16' 
          : 'w-full md:w-64'
        }
        ${isMobileOpen 
          ? 'translate-x-0' 
          : '-translate-x-full md:translate-x-0'
        }
      `}>
        {/* Header with User Info and Toggle Button */}
      <div className="mb-4 md:mb-8">
        {/* Close Button - Top Right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              // On mobile, close the sidebar; on desktop, toggle collapse
              if (window.innerWidth < 768) {
                closeMobileSidebar();
              } else {
                toggleSidebar();
              }
            }}
            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors duration-200 flex-shrink-0"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isCollapsed && (
          <div className="mb-4">
            {/* Menu Title */}
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent text-center transition-all duration-300">
              Menu
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex md:flex-col flex-1 overflow-x-auto md:overflow-x-visible overflow-y-auto max-h-[calc(100vh-200px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? 'gap-1' : 'space-y-1'}`}>
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const hasActiveItem = section.items.some(item => pathname === item.href);
          
          return (
            <div key={section.id} className={isCollapsed ? 'w-full' : 'space-y-1 w-full'}>
              {/* Section Header */}
              <button
                onClick={() => !isCollapsed && toggleSection(section.id)}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed 
                    ? 'justify-center p-2' 
                    : 'justify-between items-start gap-2 px-3 py-2 hover:bg-surface-elevated/30 group text-secondary hover:text-primary'
                  }
                `}
                title={isCollapsed ? section.title : ''}
                style={isCollapsed ? { pointerEvents: 'auto' } : {}}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <SectionIcon id={section.id} />
                  </div>
                  {!isCollapsed && (
                    <span className="font-semibold text-xs uppercase tracking-wider text-left leading-tight flex-1 min-w-0">
                      {section.title}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 mt-0.5 ${isExpanded ? 'rotate-90' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
              
              {/* Section Items - Only show when expanded and not collapsed */}
              {!isCollapsed && (
                <div className={`
                  transition-all duration-300 ease-in-out overflow-hidden w-full
                  ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}>
                  <div className="space-y-2 pl-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={`
                            flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 md:hover:translate-x-2 group
                            ${isActive
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                              : 'hover:bg-surface-elevated text-secondary hover:text-primary'
                            }
                          `}
                          title={item.label}
                        >
                          <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                            {item.icon}
                          </span>
                          <span className="font-medium text-sm md:text-base whitespace-nowrap">
                            {item.label}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
    </>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar; 