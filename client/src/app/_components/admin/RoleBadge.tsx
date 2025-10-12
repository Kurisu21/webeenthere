'use client';

import React from 'react';

interface RoleBadgeProps {
  role: 'user' | 'admin';
  size?: 'sm' | 'md' | 'lg';
}

const roleConfig = {
  user: {
    label: 'User',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  admin: {
    label: 'Admin',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const config = roleConfig[role];
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${config.color}
      ${sizeClasses[size]}
    `}>
      {role === 'admin' && (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )}
      {config.label}
    </span>
  );
};

export default RoleBadge;

