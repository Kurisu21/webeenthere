'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ModernColorPicker } from './ModernColorPicker';
import './ModernColorPicker.css';

interface ColorPickerButtonProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({
  value,
  onChange,
  label = 'Set Color',
  className = '',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      // Calculate position
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const pickerWidth = 320;
        const pickerHeight = 500; // Approximate height
        const spacing = 8;
        
        let left = rect.left;
        let top = rect.bottom + spacing;

        // Adjust if would go off right edge
        if (left + pickerWidth > window.innerWidth) {
          left = window.innerWidth - pickerWidth - 16;
        }

        // Adjust if would go off bottom edge
        if (top + pickerHeight > window.innerHeight) {
          top = rect.top - pickerHeight - spacing;
        }

        // Ensure it doesn't go off left edge
        if (left < 16) {
          left = 16;
        }

        // Ensure it doesn't go off top edge
        if (top < 16) {
          top = rect.bottom + spacing;
        }

        setPickerPosition({ top, left });
      }

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleClickOutside, true);
    };
  }, [showPicker]);

  const getColorDisplay = () => {
    if (!value || value === 'transparent' || value === 'none') {
      return '#808080'; // Default gray
    }
    return value;
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 transition-colors text-left"
        >
          {/* Rainbow gradient color picker icon */}
          <div
            className="w-5 h-5 rounded-full border border-gray-600 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff0000 100%)',
            }}
          />
          <span className="text-sm text-gray-300">{label}</span>
        </button>
      </div>
      {showPicker &&
        typeof window !== 'undefined' &&
        createPortal(
          <div ref={pickerRef} style={{ position: 'fixed', top: `${pickerPosition.top}px`, left: `${pickerPosition.left}px`, zIndex: 9999 }}>
            <ModernColorPicker
              value={getColorDisplay()}
              onChange={onChange}
              onClose={() => setShowPicker(false)}
            />
          </div>,
          document.body
        )}
    </>
  );
};

