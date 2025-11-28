'use client';

import React, { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';

// Section Icons
const SectionIcon = ({ id }: { id: string }) => {
  const iconClass = "w-5 h-5";
  switch (id) {
    case 'core':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case 'analytics':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'subscription':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case 'hosting':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case 'content':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'community':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'system':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
};

const navSections = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: null, href: '/admin/dashboard' },
      { id: 'users', label: 'User Management', icon: null, href: '/admin/users' },
      { id: 'settings', label: 'Account Settings', icon: null, href: '/admin/settings' },
    ]
  },
  {
    id: 'analytics',
    label: 'Dashboard & Analytics',
    items: [
      { id: 'analytics', label: 'Analytics', icon: null, href: '/admin/analytics' },
      { id: 'reports', label: 'Reports', icon: null, href: '/admin/reports' },
    ]
  },
  {
    id: 'subscription',
    label: 'Subscription Management',
    items: [
      { id: 'subscriptions', label: 'Subscriptions Overview', icon: null, href: '/admin/subscriptions' },
      { id: 'subscriptionLogs', label: 'Subscription Logs', icon: null, href: '/admin/subscriptions/logs' },
      { id: 'paymentTransactions', label: 'Payment Transactions', icon: null, href: '/admin/subscriptions/transactions' },
    ]
  },
  {
    id: 'hosting',
    label: 'Hosting & Publication',
    items: [
      { id: 'websiteManagement', label: 'Website Management', icon: null, href: '/admin/hosting' },
    ]
  },
  {
    id: 'content',
    label: 'Content Management',
    items: [
      { id: 'templates', label: 'Template Management', icon: null, href: '/admin/templates' },
    ]
  },
  {
    id: 'community',
    label: 'Community & Support',
    items: [
      { id: 'forum', label: 'Forum Management', icon: null, href: '/admin/forum' },
      { id: 'support', label: 'Support Tickets', icon: null, href: '/admin/support' },
      { id: 'helpCenter', label: 'Help Center', icon: null, href: '/admin/help-center' },
      { id: 'feedback', label: 'Feedback Management', icon: null, href: '/admin/feedback' },
    ]
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'systemSettings', label: 'System Settings', icon: null, href: '/admin/settings-system' },
      { id: 'activityLogs', label: 'Activity Logs', icon: null, href: '/admin/activity-logs' },
      { id: 'backupRecovery', label: 'Backup & Recovery', icon: null, href: '/admin/backup-recovery' },
    ]
  }
];

const AdminSidebar = memo(() => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } = useSidebar();
  
  // Accordion state management
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core']));
  
  // Load saved preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-sections');
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
      localStorage.setItem('admin-sidebar-sections', JSON.stringify([...newSet]));
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
        fixed left-0 top-0 z-40 bg-surface-elevated/80 backdrop-blur-sm text-primary flex flex-col py-4 md:py-8 px-4 md:min-h-screen border-r-0 md:border-r border-app/50 shadow-2xl transition-all duration-300 ease-in-out
        ${isCollapsed 
          ? 'w-16 md:w-16' 
          : 'w-full md:w-64'
        }
        ${isMobileOpen 
          ? 'translate-x-0' 
          : '-translate-x-full md:translate-x-0'
        }
      `}>
      {/* Header with Admin Info and Toggle Button */}
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
            {/* Admin Portal Title */}
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent text-center hover:animate-pulse transition-all duration-300">
              Admin Portal
            </div>
            <div className="text-xs text-secondary text-center mt-1">
              System Administration
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex md:flex-col flex-1 overflow-x-auto md:overflow-x-visible overflow-y-auto max-h-[calc(100vh-280px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? 'gap-1' : 'space-y-1'}`}>
        {navSections.map((section) => {
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
                title={isCollapsed ? section.label : ''}
                style={isCollapsed ? { pointerEvents: 'auto' } : {}}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <SectionIcon id={section.id} />
                  </div>
                  {!isCollapsed && (
                    <span className="font-semibold text-xs uppercase tracking-wider text-left leading-tight flex-1 min-w-0">
                      {section.label}
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
                  <div className="space-y-1 pl-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={`
                            flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 md:hover:translate-x-2 group
                            ${isActive
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 border border-purple-500/50'
                              : 'hover:bg-surface-elevated text-secondary hover:text-primary border border-transparent'
                            }
                          `}
                          title={item.label}
                        >
                          {item.icon && (
                            <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                              {item.icon}
                            </span>
                          )}
                          <span className="font-medium text-sm whitespace-nowrap">
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

AdminSidebar.displayName = 'AdminSidebar';

export default AdminSidebar;

