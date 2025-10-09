'use client';

import React from 'react';
import { Element } from './elements';

interface LayersPanelProps {
  elements: Element[];
  selectedElement: Element | null;
  onElementSelect: (element: Element) => void;
  onElementDelete: (id: string) => void;
  onElementReorder: (fromIndex: number, toIndex: number) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedElement,
  onElementSelect,
  onElementDelete,
  onElementReorder
}) => {
  const getElementIcon = (type: string) => {
    const icons: Record<string, string> = {
      text: 'T',
      button: '🔘',
      image: '🖼️',
      hero: 'H',
      divider: '➖',
      spacer: '📏',
      link: '🔗',
      logo: '🏷️',
      modal: '🪟',
      tabs: '📑',
      accordion: 'A',
      slider: '🎚️',
      rating: '⭐',
      contact: '📧',
      about: 'ℹ️',
      gallery: '🖼️',
      social: '🔗'
    };
    return icons[type] || '📦';
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex !== targetIndex) {
      onElementReorder(sourceIndex, targetIndex);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Layers</h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          {elements.length} element{elements.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Layers List */}
      <div className="p-2">
        {elements.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No elements yet
          </div>
        ) : (
          <div className="space-y-1">
            {elements.map((element, index) => (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  flex items-center p-2 rounded cursor-pointer transition-colors
                  ${selectedElement?.id === element.id 
                    ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                onClick={() => onElementSelect(element)}
              >
                {/* Element Icon */}
                <div className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded text-xs mr-3">
                  {getElementIcon(element.type)}
                </div>

                {/* Element Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {element.content || 'Empty element'}
                  </div>
                </div>

                {/* Visibility Toggle */}
                <button
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement visibility toggle
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                {/* Delete Button */}
                <button
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onElementDelete(element.id);
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;




