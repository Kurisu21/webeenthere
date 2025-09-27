'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const AboutElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
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
        className="w-full h-full flex items-center justify-center"
        style={{
          backgroundColor: element.styles.backgroundColor,
          borderRadius: element.styles.borderRadius,
          padding: element.styles.padding,
          textAlign: element.styles.textAlign as any
        }}
      >
        {isSelected ? (
          <textarea
            value={element.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none resize-none text-center"
            style={{
              color: element.styles.color,
              fontSize: element.styles.fontSize,
              fontWeight: element.styles.fontWeight,
              fontFamily: element.styles.fontFamily,
              lineHeight: element.styles.lineHeight,
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
              lineHeight: element.styles.lineHeight,
              textAlign: element.styles.textAlign as any
            }}
          >
            {element.content}
          </div>
        )}
      </div>
    </BaseElement>
  );
};

export default AboutElement;
