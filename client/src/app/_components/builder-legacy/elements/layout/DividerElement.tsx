'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const DividerElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
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
          height: element.styles.height,
          width: element.styles.width,
          margin: element.styles.margin,
          borderRadius: element.styles.borderRadius
        }}
      />
    </BaseElement>
  );
};

export default DividerElement;
