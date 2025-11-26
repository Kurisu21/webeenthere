'use client';

import React, { useState } from 'react';

interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  isDark?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
  isDark = true,
}) => {
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);

  return (
    <div className={`flex rounded-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-1 ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        const isHovered = hoveredValue === option.value && !isActive;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(option.value);
              // Clear hover immediately on click
              setHoveredValue(null);
            }}
            onMouseEnter={() => {
              if (value !== option.value) {
                setHoveredValue(option.value);
              }
            }}
            onMouseLeave={() => {
              setHoveredValue(null);
            }}
            onMouseDown={(e) => {
              // Prevent focus issues
              e.preventDefault();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${
              isActive
                ? isDark
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'bg-white text-gray-900 shadow-sm'
                : isHovered
                ? isDark
                  ? 'text-gray-300'
                  : 'text-gray-700'
                : isDark
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            {option.icon && <span className="w-4 h-4 flex items-center justify-center">{option.icon}</span>}
            {option.label && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

