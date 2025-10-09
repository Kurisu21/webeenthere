'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

export const ButtonElement: React.FC<ElementRendererProps> = ({
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
    <>
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
            backgroundColor: element.styles.backgroundColor,
            borderRadius: element.styles.borderRadius,
            padding: element.styles.padding,
            textAlign: element.styles.textAlign as any,
            border: element.styles.border,
            boxShadow: element.styles.boxShadow,
            transition: element.styles.transition
          }}
          onBlur={(e) => e.target.blur()}
        />
      ) : (
        <button
          className="w-full h-full border-none cursor-pointer"
          style={{
            color: element.styles.color,
            fontSize: element.styles.fontSize,
            fontWeight: element.styles.fontWeight,
            backgroundColor: element.styles.backgroundColor,
            borderRadius: element.styles.borderRadius,
            padding: element.styles.padding,
            textAlign: element.styles.textAlign as any,
            border: element.styles.border,
            boxShadow: element.styles.boxShadow,
            transition: element.styles.transition
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Handle button click action
            if (element.interaction?.click?.action === 'link' && element.interaction.click.target) {
              window.open(element.interaction.click.target, '_blank');
            }
          }}
        >
          {element.content}
        </button>
      )}
    </>
  );
};

export default ButtonElement;
