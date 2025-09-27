'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

export const HeroElement: React.FC<ElementRendererProps> = ({
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

  return (
    <div className="w-full h-full flex items-center justify-center">
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
            textAlign: element.styles.textAlign as any,
            backgroundImage: element.styles.backgroundImage,
            backgroundSize: element.styles.backgroundSize,
            backgroundPosition: element.styles.backgroundPosition
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
            textAlign: element.styles.textAlign as any,
            backgroundImage: element.styles.backgroundImage,
            backgroundSize: element.styles.backgroundSize,
            backgroundPosition: element.styles.backgroundPosition
          }}
        >
          {element.content}
        </div>
      )}
    </div>
  );
};

export default HeroElement;
