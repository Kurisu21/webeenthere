import React from 'react';

const navItems = [
  { label: 'User Details' },
  { label: 'Create' },
  { label: 'Host' },
  { label: 'Extensions' },
  { label: 'Share' },
  { label: 'Added Images' },
  { label: 'Problems & Goals' },
];

export default function UserSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col py-8 px-4 min-h-screen">
      <div className="mb-8 text-2xl font-bold text-purple-400 text-center">User</div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className="inline-block w-4 h-4 bg-gray-700 rounded-full" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
} 