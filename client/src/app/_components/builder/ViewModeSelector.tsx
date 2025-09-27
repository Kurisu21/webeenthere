'use client';

import React from 'react';

interface ViewModeSelectorProps {
  currentMode: 'desktop' | 'tablet' | 'mobile';
  onModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  currentMode,
  onModeChange
}) => {
  const modes = [
    { id: 'desktop', label: 'Desktop', icon: '🖥️', width: '1200px' },
    { id: 'tablet', label: 'Tablet', icon: '📱', width: '768px' },
    { id: 'mobile', label: 'Mobile', icon: '📱', width: '375px' }
  ] as const;

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${currentMode === mode.id
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }
          `}
          title={`${mode.label} (${mode.width})`}
        >
          <span className="text-lg">{mode.icon}</span>
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewModeSelector;




