'use client';

import React from 'react';

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  label,
  variant = 'primary',
  disabled = false,
  className = '',
  size = 'md'
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2'
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white focus:ring-gray-500 shadow-sm hover:shadow-md',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500 shadow-sm hover:shadow-md',
    warning: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white focus:ring-amber-500 shadow-sm hover:shadow-md'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && (
        <span className="flex-shrink-0" style={{ width: '1em', height: '1em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </span>
      )}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
};













