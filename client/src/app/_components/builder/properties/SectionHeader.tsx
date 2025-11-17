'use client';

import React from 'react';

interface SectionHeaderProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
  isDark?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  isExpanded,
  onToggle,
  className = '',
  isDark = true,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between py-3 px-0 text-left section-header ${isDark ? 'dark' : 'light'} ${isExpanded ? 'expanded' : 'collapsed'} ${className}`}
    >
      <span className={`text-sm font-medium section-title ${isDark ? 'text-gray-200' : ''}`}>
        {title}
      </span>
      <span className={`text-lg section-toggle ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {isExpanded ? '—' : '+'}
      </span>
    </button>
  );
};

