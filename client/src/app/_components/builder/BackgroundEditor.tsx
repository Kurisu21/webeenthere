'use client';

import React, { useState } from 'react';

interface BackgroundEditorProps {
  background: {
    type: 'color' | 'gradient';
    color: string;
    gradient: string;
  };
  onBackgroundChange: (background: {
    type: 'color' | 'gradient';
    color: string;
    gradient: string;
  }) => void;
}

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({
  background,
  onBackgroundChange
}) => {
  const [showGradientEditor, setShowGradientEditor] = useState(false);

  const gradientPresets = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
  ];

  const colorPresets = [
    '#ffffff', '#000000', '#f3f4f6', '#1f2937',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  return (
    <div className="space-y-4">
      {/* Background Type */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
          Background Type
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => onBackgroundChange({ ...background, type: 'color' })}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              background.type === 'color'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            Color
          </button>
          <button
            onClick={() => onBackgroundChange({ ...background, type: 'gradient' })}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              background.type === 'gradient'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            Gradient
          </button>
        </div>
      </div>

      {/* Color Background */}
      {background.type === 'color' && (
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
            Background Color
          </label>
          <div className="space-y-3">
            {/* Color Picker */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={background.color}
                onChange={(e) => onBackgroundChange({ ...background, color: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={background.color}
                onChange={(e) => onBackgroundChange({ ...background, color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#ffffff"
              />
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-gray-600 dark:text-gray-400 text-xs mb-2">
                Presets
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => onBackgroundChange({ ...background, color })}
                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gradient Background */}
      {background.type === 'gradient' && (
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
            Gradient
          </label>
          <div className="space-y-3">
            {/* Gradient Input */}
            <div>
              <input
                type="text"
                value={background.gradient}
                onChange={(e) => onBackgroundChange({ ...background, gradient: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </div>

            {/* Gradient Presets */}
            <div>
              <label className="block text-gray-600 dark:text-gray-400 text-xs mb-2">
                Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {gradientPresets.map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => onBackgroundChange({ ...background, gradient })}
                    className="h-12 rounded border border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors relative overflow-hidden"
                    style={{ background: gradient }}
                    title={gradient}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Editor Toggle */}
            <button
              onClick={() => setShowGradientEditor(!showGradientEditor)}
              className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
            >
              {showGradientEditor ? 'Hide' : 'Show'} Advanced Editor
            </button>

            {/* Advanced Gradient Editor */}
            {showGradientEditor && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md space-y-3">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">
                    Direction
                  </label>
                  <select
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                    onChange={(e) => {
                      const direction = e.target.value;
                      const currentGradient = background.gradient;
                      const newGradient = currentGradient.replace(/linear-gradient\([^,]+,/, `linear-gradient(${direction},`);
                      onBackgroundChange({ ...background, gradient: newGradient });
                    }}
                  >
                    <option value="135deg">Diagonal (135°)</option>
                    <option value="90deg">Vertical (90°)</option>
                    <option value="0deg">Horizontal (0°)</option>
                    <option value="45deg">Diagonal (45°)</option>
                    <option value="180deg">Vertical (180°)</option>
                  </select>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Advanced gradient editing coming soon...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
          Preview
        </label>
        <div
          className="w-full h-20 rounded border border-gray-300 dark:border-gray-600"
          style={{
            background: background.type === 'gradient' ? background.gradient : background.color
          }}
        />
      </div>
    </div>
  );
};

export default BackgroundEditor;




