'use client';

import React, { useState } from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const TabsElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Tab 1', 'Tab 2', 'Tab 3'];

  const handleContentChange = (newContent: string) => {
    onUpdate({
      ...element,
      content: newContent
    });
  };

  return (
    <BaseElement
      element={element}
      isSelected={isSelected}
      onSelect={onSelect}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onMouseDown={onMouseDown}
      onResizeStart={onResizeStart}
    >
      <div
        className="w-full h-full"
        style={{
          backgroundColor: element.styles.backgroundColor,
          borderRadius: element.styles.borderRadius,
          border: element.styles.border,
          padding: element.styles.padding
        }}
      >
        {isSelected ? (
          <textarea
            value={element.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none resize-none"
            style={{
              color: element.styles.color,
              fontSize: element.styles.fontSize,
              textAlign: element.styles.textAlign as any
            }}
            onBlur={(e) => e.target.blur()}
          />
        ) : (
          <div className="w-full h-full">
            {/* Tab Headers */}
            <div className="flex border-b">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(index);
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === index
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="p-4">
              <div
                style={{
                  color: element.styles.color,
                  fontSize: element.styles.fontSize
                }}
              >
                {element.content} - {tabs[activeTab]}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseElement>
  );
};

export default TabsElement;
