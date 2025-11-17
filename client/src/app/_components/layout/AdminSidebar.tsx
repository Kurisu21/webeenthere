'use client';

import React, { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';

// Icons temporarily removed

const navSections = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: null, href: '/admin/dashboard' },
      { id: 'users', label: 'User Management', icon: null, href: '/admin/users' },
      { id: 'profile', label: 'Profile Management', icon: null, href: '/admin/profile' },
      { id: 'settings', label: 'Account Settings', icon: null, href: '/admin/settings' },
      { id: 'roles', label: 'Role Management', icon: null, href: '/admin/roles' },
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
  const { isCollapsed, toggleSidebar } = useSidebar();
  
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
    <aside className={`
      fixed left-0 top-0 z-20 bg-surface-elevated/80 backdrop-blur-sm text-primary flex flex-col py-4 md:py-8 px-4 md:min-h-screen border-r-0 md:border-r border-app/50 shadow-2xl transition-all duration-300 ease-in-out
      ${isCollapsed 
        ? 'w-16 md:w-16' 
        : 'w-full md:w-64'
      }
    `}>
      {/* Header with Admin Info and Toggle Button */}
      <div className="mb-4 md:mb-8">
        {/* Close Button - Top Right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleSidebar}
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
      <nav className="flex md:flex-col flex-1 space-y-1 overflow-x-auto md:overflow-x-visible overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400">
        {navSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const hasActiveItem = section.items.some(item => pathname === item.href);
          
          return (
            <div key={section.id} className="space-y-1 w-full">
              {/* Section Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group text-secondary hover:text-primary hover:bg-surface-elevated/30"
                >
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    {section.label}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {/* Section Items */}
              <div className={`
                transition-all duration-300 ease-in-out overflow-hidden w-full
                ${isExpanded || isCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
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
                          ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.label : ''}
                      >
                        {item.icon && (
                          <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                            {item.icon}
                          </span>
                        )}
                        {!isCollapsed && (
                          <>
                            <span className="font-medium text-sm whitespace-nowrap">
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
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
});

AdminSidebar.displayName = 'AdminSidebar';

export default AdminSidebar;

