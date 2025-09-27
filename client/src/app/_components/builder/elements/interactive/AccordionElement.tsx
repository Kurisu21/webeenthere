'use client';

import React, { useState } from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const AccordionElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  const [openItems, setOpenItems] = useState<number[]>([0]);
  const items = ['Item 1', 'Item 2', 'Item 3'];

  const handleContentChange = (newContent: string) => {
    onUpdate({
      ...element,
      content: newContent
    });
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
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
            {items.map((item, index) => (
              <div key={index} className="border-b last:border-b-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(index);
                  }}
                  className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <span
                    style={{
                      color: element.styles.color,
                      fontSize: element.styles.fontSize
                    }}
                  >
                    {item}
                  </span>
                  <span className="text-gray-500">
                    {openItems.includes(index) ? '−' : '+'}
                  </span>
                </button>
                {openItems.includes(index) && (
                  <div className="px-4 pb-3">
                    <div
                      style={{
                        color: element.styles.color,
                        fontSize: element.styles.fontSize
                      }}
                    >
                      {element.content} - {item} content
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseElement>
  );
};

export default AccordionElement;
