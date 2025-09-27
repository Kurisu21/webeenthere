'use client';

import React from 'react';
import { ELEMENT_CATEGORIES, elementFactory } from '../elements';

interface ElementsPanelProps {
  onAddElement: (type: string) => void;
}

export const ElementsPanel: React.FC<ElementsPanelProps> = ({ onAddElement }) => {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Elements</h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Drag elements to canvas</p>
      </div>
  
      {/* Element Categories */}
      <div className="p-4">
        {Object.entries(ELEMENT_CATEGORIES).map(([category, elementTypes]) => (
          <div key={category} className="mb-6">
            <h4 className="text-gray-700 dark:text-gray-300 font-medium text-sm uppercase tracking-wide mb-3 capitalize">
              {category}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {elementTypes.map(elementType => {
                const config = elementFactory.getConfig(elementType);
                return (
                  <button
                    key={elementType}
                    onClick={() => onAddElement(elementType)}
                    className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-center transition-colors group"
                    title={config?.description}
                  >
                    <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                      <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-500 transition-colors">
                        {config?.icon || elementType.charAt(0).toUpperCase()}
                      </div>
                      {config?.name || elementType}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};




