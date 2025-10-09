'use client';

import React, { useRef, useEffect, forwardRef } from 'react';
import { Element, ElementRendererProps, elementFactory } from '../elements';
import { BaseElement } from '../elements/base/BaseElement';

interface BuilderCanvasProps {
  elements: Element[];
  selectedElement: Element | null;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  pageBackground: {
    type: string;
    value: string;
    gradient: {
      direction: string;
      colors: string[];
    };
  };
  isDragging: boolean;
  onElementClick: (element: Element, event: React.MouseEvent) => void;
  onCanvasClick: () => void;
  onMouseDown: (e: React.MouseEvent, element: Element) => void;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onUpdateElement: (id: string, updates: Partial<Element>) => void;
  onDeleteElement: (id: string) => void;
}

export const BuilderCanvas = forwardRef<HTMLDivElement, BuilderCanvasProps>(({
  elements,
  selectedElement,
  viewMode,
  pageBackground,
  isDragging,
  onElementClick,
  onCanvasClick,
  onMouseDown,
  onResizeStart,
  onMouseMove,
  onMouseUp,
  onUpdateElement,
  onDeleteElement
}, ref) => {

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const syntheticEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
        preventDefault: () => {},
        stopPropagation: () => {}
      } as React.MouseEvent;
      onMouseMove(syntheticEvent);
    };

    const handleGlobalMouseUp = () => {
      onMouseUp();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const getCanvasSize = () => {
    switch (viewMode) {
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'mobile':
        return { width: 375, height: 667 };
      default:
        return { width: 1200, height: 800 };
    }
  };

  const canvasSize = getCanvasSize();

  const getBackgroundStyle = () => {
    if (pageBackground.type === 'gradient') {
      return {
        background: `linear-gradient(${pageBackground.gradient.direction}, ${pageBackground.gradient.colors.join(', ')})`
      };
    }
    return { backgroundColor: pageBackground.value };
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-8 overflow-auto">
      <div
        ref={ref}
        className="relative bg-white dark:bg-gray-800 shadow-2xl border border-gray-300 dark:border-gray-600 overflow-hidden"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          ...getBackgroundStyle()
        }}
        onClick={onCanvasClick}
        onMouseDown={(e) => {
          console.log('Canvas mouse down');
          // Let the event bubble to elements
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />

        {/* Elements */}
        {elements.map(element => {
          const ElementComponent = elementFactory.getRenderer(element.type);
          if (!ElementComponent) return null;

          return (
            <BaseElement
              key={element.id}
              element={element}
              isSelected={selectedElement?.id === element.id}
              onSelect={onElementClick}
              onUpdate={(id: string, updates: Partial<Element>) => onUpdateElement(id, updates)}
              onDelete={onDeleteElement}
              onMouseDown={onMouseDown}
              onResizeStart={onResizeStart}
              isDragging={isDragging && selectedElement?.id === element.id}
            >
              <ElementComponent
                element={element}
                isSelected={selectedElement?.id === element.id}
                onSelect={onElementClick}
                onUpdate={(id: string, updates: Partial<Element>) => onUpdateElement(id, updates)}
                onDelete={onDeleteElement}
                onMouseDown={onMouseDown}
                onResizeStart={onResizeStart}
                isDragging={isDragging && selectedElement?.id === element.id}
              />
            </BaseElement>
          );
        })}

        {/* Drop zone indicator */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-lg font-medium">Start building your website</p>
              <p className="text-sm">Add elements from the left panel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

BuilderCanvas.displayName = 'BuilderCanvas';