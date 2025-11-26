'use client';

import React, { useState, useEffect } from 'react';

interface FontSizeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const COMMON_SIZES = [
  { label: '8px', value: '8px' },
  { label: '10px', value: '10px' },
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
  { label: '36px', value: '36px' },
  { label: '40px', value: '40px' },
  { label: '48px', value: '48px' },
  { label: '56px', value: '56px' },
  { label: '64px', value: '64px' },
  { label: '72px', value: '72px' },
  { label: '96px', value: '96px' },
  { label: '120px', value: '120px' },
  { label: '140px', value: '140px' },
  { label: 'Custom', value: 'custom' },
];

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  value,
  onChange,
  placeholder = '16px',
  className = '',
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // Check if current value is in the common sizes
  useEffect(() => {
    const isInCommonSizes = COMMON_SIZES.some(size => size.value === value);
    if (!isInCommonSizes && value) {
      setIsCustom(true);
      setCustomValue(value);
    } else {
      setIsCustom(false);
      setCustomValue('');
    }
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'custom') {
      setIsCustom(true);
      setCustomValue(value || '');
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCustomValue(inputValue);
    onChange(inputValue);
  };

  const currentSelectValue = isCustom ? 'custom' : value || '';

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        value={currentSelectValue}
        onChange={handleSelectChange}
        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer flex-shrink-0"
        style={{ minWidth: '100px' }}
      >
        {COMMON_SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
      {isCustom && (
        <input
          type="text"
          value={customValue}
          onChange={handleCustomInputChange}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );
};



