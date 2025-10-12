'use client';

import React from 'react';

interface StatusBadgeProps {
  isActive: boolean;
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showBoth?: boolean;
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  verified: {
    label: 'Verified',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  unverified: {
    label: 'Unverified',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  isActive, 
  isVerified, 
  size = 'md',
  showBoth = false 
}) => {
  if (showBoth) {
    return (
      <div className="flex flex-col gap-1">
        <span className={`
          inline-flex items-center font-medium rounded-full border
          ${statusConfig[isActive ? 'active' : 'inactive'].color}
          ${sizeClasses[size]}
        `}>
          {isActive ? (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {statusConfig[isActive ? 'active' : 'inactive'].label}
        </span>
        <span className={`
          inline-flex items-center font-medium rounded-full border
          ${statusConfig[isVerified ? 'verified' : 'unverified'].color}
          ${sizeClasses[size]}
        `}>
          {isVerified ? (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          {statusConfig[isVerified ? 'verified' : 'unverified'].label}
        </span>
      </div>
    );
  }

  // Show combined status
  const combinedStatus = isActive && isVerified ? 'active' : 
                        isActive && !isVerified ? 'unverified' : 'inactive';
  
  const config = statusConfig[combinedStatus];
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${config.color}
      ${sizeClasses[size]}
    `}>
      {combinedStatus === 'active' && (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {combinedStatus === 'unverified' && (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )}
      {combinedStatus === 'inactive' && (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;

