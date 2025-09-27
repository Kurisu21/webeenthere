'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const LinkElement: React.FC<ElementRendererProps> = ({
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.interaction?.click?.action === 'link' && element.interaction.click.target) {
      window.open(element.interaction.click.target, '_blank');
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
              textDecoration: element.styles.textDecoration || 'underline',
              textAlign: element.styles.textAlign as any
            }}
            onBlur={(e) => e.target.blur()}
          />
        ) : (
          <a
            href={element.interaction?.click?.target || '#'}
            onClick={handleClick}
            className="w-full h-full flex items-center justify-center cursor-pointer"
            style={{
              color: element.styles.color,
              fontSize: element.styles.fontSize,
              fontWeight: element.styles.fontWeight,
              textDecoration: element.styles.textDecoration || 'underline',
              textAlign: element.styles.textAlign as any
            }}
          >
            {element.content}
          </a>
        )}
      </div>
    </BaseElement>
  );
};

export default LinkElement;
