'use client';

import React from 'react';

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
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex rounded-md bg-gray-800 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${
            value === option.value
              ? 'bg-gray-700 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          {option.icon && <span className="w-4 h-4 flex items-center justify-center">{option.icon}</span>}
          {option.label && <span>{option.label}</span>}
        </button>
      ))}
    </div>
  );
};

