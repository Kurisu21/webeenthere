import React from 'react';

const navItems = [
  { label: 'User Details', href: '/user/profile' },
  { label: 'Create', href: '/user/create' },
  { label: 'Host', href: '/user/host' },
  { label: 'Extensions', href: '/user/extensions' },
  { label: 'Share', href: '/user/share' },
  { label: 'Added Images', href: '/user/images' },
  { label: 'Problems & Goals', href: '/user/goals' },
  { label: 'Help Center', href: '/user/help' },
  { label: 'Community Forum', href: '/user/forum' },
  { label: 'Send Feedback', href: '/user/feedback' },
  { label: 'Support', href: '/user/support' },
];

export default function UserSidebar() {
  return (
    <aside className="w-64 bg-surface text-primary flex flex-col py-8 px-4 min-h-screen transition-colors-fast">
      <div className="mb-8 text-2xl font-bold text-primary text-center">User</div>
      <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surface-elevated transition-colors-fast"
          >
            <span className="inline-block w-4 h-4 bg-[var(--border)] rounded-full" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
} 