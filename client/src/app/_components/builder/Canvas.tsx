'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Element, elementFactory } from './elements';

interface CanvasProps {
  elements: Element[];
  selectedElement: Element | null;
  onElementSelect: (element: Element, event: React.MouseEvent) => void;
  onElementUpdate: (id: string, updates: Partial<Element>) => void;
  onElementDelete: (id: string) => void;
  onCanvasClick: () => void;
  onElementMouseDown: (e: React.MouseEvent, element: Element) => void;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  pageBackground: {
    type: 'color' | 'gradient';
    color: string;
    gradient: string;
  };
}

const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedElement,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onCanvasClick,
  onElementMouseDown,
  onResizeStart,
  viewMode,
  pageBackground
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const getCanvasDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
      default:
        return { width: 1200, height: 800 };
    }
  };

  const { width, height } = getCanvasDimensions();

  const getBackgroundStyle = () => {
    if (pageBackground.type === 'gradient') {
      return {
        background: pageBackground.gradient
      };
    }
    return {
      backgroundColor: pageBackground.color
    };
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
      <div
        ref={canvasRef}
        className="bg-white shadow-2xl relative overflow-hidden"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          ...getBackgroundStyle()
        }}
        onClick={onCanvasClick}
      >
        {/* Elements */}
        {elements.map((element) => {
          const ElementRenderer = elementFactory.getRenderer(element.type);
          if (!ElementRenderer) {
            return null;
          }

          return (
            <ElementRenderer
              key={element.id}
              element={element}
              isSelected={selectedElement?.id === element.id}
              onSelect={onElementSelect}
              onUpdate={onElementUpdate}
              onDelete={onElementDelete}
              onMouseDown={onElementMouseDown}
              onResizeStart={onResizeStart}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Canvas;


