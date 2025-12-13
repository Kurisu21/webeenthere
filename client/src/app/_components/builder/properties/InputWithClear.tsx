'use client';

import React from 'react';

interface InputWithClearProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  isDark?: boolean;
}

export const InputWithClear: React.FC<InputWithClearProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  type = 'text',
  isDark = true,
}) => {
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
  };

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const placeholderColor = isDark ? 'placeholder-gray-500' : 'placeholder-gray-400';
  const clearButtonColor = isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700';

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        placeholder={placeholder}
        className={`w-full px-3 py-2 pr-8 ${bgColor} ${borderColor} border rounded-md ${textColor} ${placeholderColor} text-sm focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-300'} focus:border-transparent`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute right-2 top-1/2 -translate-y-1/2 ${clearButtonColor} transition-colors`}
          aria-label="Clear"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};







