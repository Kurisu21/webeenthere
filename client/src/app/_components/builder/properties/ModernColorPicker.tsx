'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ModernColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export const ModernColorPicker: React.FC<ModernColorPickerProps> = ({
  value,
  onChange,
  onClose,
}) => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [hex, setHex] = useState('#808080');
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const spectrumRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Convert Hex to HSL
  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  // Initialize from value (only if different from current)
  useEffect(() => {
    if (value && /^#[0-9A-Fa-f]{6}$/.test(value)) {
      const currentHex = hslToHex(hue, saturation, lightness).toUpperCase();
      if (value.toUpperCase() !== currentHex) {
        isUpdatingFromValue.current = true;
        const [h, s, l] = hexToHsl(value);
        setHue(h);
        setSaturation(s);
        setLightness(l);
        setHex(value.toUpperCase());
        // Reset flag after a short delay to allow state updates to complete
        setTimeout(() => {
          isUpdatingFromValue.current = false;
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Track if we're updating from value prop to prevent infinite loops
  const isUpdatingFromValue = useRef(false);

  // Update hex when HSL changes (but don't trigger onChange if updating from value prop)
  useEffect(() => {
    if (isUpdatingFromValue.current) {
      return; // Don't trigger onChange if we're updating from value prop
    }
    
    const newHex = hslToHex(hue, saturation, lightness);
    const newHexUpper = newHex.toUpperCase();
    if (newHexUpper !== hex) {
      setHex(newHexUpper);
      // Only call onChange if value prop doesn't match (user is actively changing color)
      if (!value || value.toUpperCase() !== newHexUpper) {
        onChange(newHex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, saturation, lightness]);

  // Handle spectrum click/drag
  const handleSpectrumMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSpectrum(e);
  };

  const handleSpectrumMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (isDragging) {
      updateSpectrum(e);
    }
  };

  const handleSpectrumMouseUp = () => {
    setIsDragging(false);
  };

  const updateSpectrum = (e: React.MouseEvent | MouseEvent) => {
    if (!spectrumRef.current) return;
    const rect = spectrumRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    setSaturation(Math.round((x / rect.width) * 100));
    setLightness(Math.round(100 - (y / rect.height) * 100));
  };

  // Handle hue slider
  const handleHueMouseDown = (e: React.MouseEvent) => {
    setIsDraggingHue(true);
    updateHue(e);
  };

  const handleHueMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (isDraggingHue) {
      updateHue(e);
    }
  };

  const handleHueMouseUp = () => {
    setIsDraggingHue(false);
  };

  const updateHue = (e: React.MouseEvent | MouseEvent) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setHue(Math.round((y / rect.height) * 360));
  };

  useEffect(() => {
    if (isDragging || isDraggingHue) {
      document.addEventListener('mousemove', isDragging ? handleSpectrumMouseMove : handleHueMouseMove);
      document.addEventListener('mouseup', isDragging ? handleSpectrumMouseUp : handleHueMouseUp);
      return () => {
        document.removeEventListener('mousemove', isDragging ? handleSpectrumMouseMove : handleHueMouseMove);
        document.removeEventListener('mouseup', isDragging ? handleSpectrumMouseUp : handleHueMouseUp);
      };
    }
  }, [isDragging, isDraggingHue]);

  // Predefined colors
  const predefinedColors = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3',
    '#800000', '#FF4500', '#808000', '#008000', '#000080', '#4B0082', '#8B008B',
    '#A52A2A', '#D2691E', '#B8860B', '#228B22', '#4682B4', '#191970', '#800080',
    '#696969', '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC', '#F5F5F5', '#FFFFFF',
    '#000000', '#2F2F2F', '#404040', '#555555', '#666666', '#777777', '#888888', '#999999',
  ];

  const handleHexChange = (newHex: string) => {
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newHex)) {
      setHex(newHex.toUpperCase());
      if (newHex.length === 7) {
        const [h, s, l] = hexToHsl(newHex);
        setHue(h);
        setSaturation(s);
        setLightness(l);
        onChange(newHex);
      }
    }
  };

  const currentColor = hslToHex(hue, saturation, lightness);

  return (
    <div className="modern-color-picker">
      <div className="color-picker-header">
        <span className="color-picker-title">Color Picker</span>
        <button
          type="button"
          onClick={onClose}
          className="color-picker-close"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="color-picker-content">
        {/* Color Spectrum */}
        <div className="color-spectrum-container">
          <div
            ref={spectrumRef}
            className="color-spectrum"
            style={{
              background: `linear-gradient(to right, hsl(${hue}, 100%, 50%), hsl(${hue}, 0%, 50%)), linear-gradient(to top, #000, transparent), linear-gradient(to bottom, #fff, transparent)`,
            }}
            onMouseDown={handleSpectrumMouseDown}
          >
            <div
              className="spectrum-cursor"
              style={{
                left: `${saturation}%`,
                top: `${100 - lightness}%`,
              }}
            />
          </div>

          {/* Hue Slider */}
          <div
            ref={hueSliderRef}
            className="hue-slider"
            onMouseDown={handleHueMouseDown}
          >
            <div
              className="hue-cursor"
              style={{
                top: `${(hue / 360) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Current Color Display */}
        <div className="color-display-section">
          <div className="current-color-display">
            <div
              className="color-preview-large"
              style={{ backgroundColor: currentColor }}
            />
            <div className="color-info">
              <div className="color-hex-input">
                <span className="color-label">HEX</span>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="hex-input"
                  maxLength={7}
                />
              </div>
              <div className="color-values">
                <div className="color-value-row">
                  <span>H</span>
                  <span>{hue}</span>
                </div>
                <div className="color-value-row">
                  <span>S</span>
                  <span>{saturation}</span>
                </div>
                <div className="color-value-row">
                  <span>L</span>
                  <span>{lightness}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Predefined Colors */}
          <div className="predefined-colors">
            <div className="predefined-colors-label">Presets</div>
            <div className="color-swatches">
              {predefinedColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    const [h, s, l] = hexToHsl(color);
                    setHue(h);
                    setSaturation(s);
                    setLightness(l);
                    setHex(color.toUpperCase());
                    onChange(color);
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="color-picker-footer">
        <button
          type="button"
          onClick={onClose}
          className="color-picker-button-done"
        >
          Done
        </button>
      </div>
    </div>
  );
};

