'use client';

import React, { useState, useEffect } from 'react';

interface FontFamilySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Palatino', value: 'Palatino, "Palatino Linotype", serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
  { label: 'Bookman', value: 'Bookman, serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { label: 'Arial Black', value: '"Arial Black", Gadget, sans-serif' },
  { label: 'Impact', value: 'Impact, Charcoal, sans-serif' },
  { label: 'Lucida Console', value: '"Lucida Console", Monaco, monospace' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Roboto', value: '"Roboto", sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: '"Lato", sans-serif' },
  { label: 'Montserrat', value: '"Montserrat", sans-serif' },
  { label: 'Raleway', value: '"Raleway", sans-serif' },
  { label: 'Poppins', value: '"Poppins", sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Merriweather', value: '"Merriweather", serif' },
  { label: 'Oswald', value: '"Oswald", sans-serif' },
  { label: 'Source Sans Pro', value: '"Source Sans Pro", sans-serif' },
  { label: 'Ubuntu', value: '"Ubuntu", sans-serif' },
  { label: 'Nunito', value: '"Nunito", sans-serif' },
  { label: 'Dancing Script', value: '"Dancing Script", cursive' },
  { label: 'Pacifico', value: '"Pacifico", cursive' },
  { label: 'Lobster', value: '"Lobster", cursive' },
  { label: 'Bebas Neue', value: '"Bebas Neue", cursive' },
  { label: 'Custom', value: 'custom' },
];

export const FontFamilySelector: React.FC<FontFamilySelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // Check if current value is in the font list
  useEffect(() => {
    const isInFontList = FONT_FAMILIES.some(font => font.value === value);
    if (!isInFontList && value && value !== 'custom') {
      setIsCustom(true);
      setCustomValue(value);
    } else if (value === 'custom') {
      setIsCustom(true);
      setCustomValue('');
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
        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
      {isCustom && (
        <input
          type="text"
          value={customValue}
          onChange={handleCustomInputChange}
          placeholder="Enter font family"
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );
};

