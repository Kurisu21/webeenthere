'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const LogoElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  const handleContentChange = (newContent: string) => {
    onUpdate(element.id, {
      content: newContent
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate(element.id, {
          imageUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
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
      <div className="w-full h-full flex items-center justify-center">
        {element.imageUrl ? (
          <img 
            src={element.imageUrl} 
            alt={element.content}
            className="w-full h-full object-contain"
            style={{
              borderRadius: element.styles.borderRadius
            }}
          />
        ) : (
          <div className="text-center">
            {isSelected ? (
              <input
                type="text"
                value={element.content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none text-center"
                style={{
                  color: element.styles.color,
                  fontSize: element.styles.fontSize,
                  fontWeight: element.styles.fontWeight,
                  fontFamily: element.styles.fontFamily,
                  textAlign: element.styles.textAlign as any
                }}
                onBlur={(e) => e.target.blur()}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  color: element.styles.color,
                  fontSize: element.styles.fontSize,
                  fontWeight: element.styles.fontWeight,
                  fontFamily: element.styles.fontFamily,
                  textAlign: element.styles.textAlign as any
                }}
              >
                {element.content}
              </div>
            )}
            {isSelected && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-2 text-xs"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}
      </div>
    </BaseElement>
  );
};

export default LogoElement;
