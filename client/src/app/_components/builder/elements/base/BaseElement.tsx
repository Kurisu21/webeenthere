'use client';

import React from 'react';
import { Element, ElementRendererProps } from './ElementInterface';

interface BaseElementProps extends ElementRendererProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const BaseElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  onSelect,
  onMouseDown,
  onResizeStart,
  children,
  className = '',
  style = {},
  isDragging = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element, e);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('BaseElement handleMouseDown called for element:', element.id);
    onMouseDown(e, element);
  };

  const elementStyle: React.CSSProperties = {
    position: 'absolute' as const,
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
    color: element.styles.color,
    fontSize: element.styles.fontSize,
    fontWeight: element.styles.fontWeight,
    backgroundColor: element.styles.backgroundColor,
    padding: element.styles.padding,
    margin: element.styles.margin,
    textAlign: element.styles.textAlign as any,
    borderRadius: element.styles.borderRadius,
    border: element.styles.border,
    opacity: element.styles.opacity,
    boxShadow: element.styles.boxShadow,
    transform: element.styles.transform,
    transition: element.styles.transition,
    backgroundImage: element.styles.backgroundImage,
    backgroundSize: element.styles.backgroundSize,
    backgroundPosition: element.styles.backgroundPosition,
    zIndex: element.styles.zIndex,
    overflow: element.styles.overflow,
    display: element.styles.display as any,
    flexDirection: element.styles.flexDirection as any,
    justifyContent: element.styles.justifyContent as any,
    alignItems: element.styles.alignItems as any,
    gap: element.styles.gap,
    fontFamily: element.styles.fontFamily,
    lineHeight: element.styles.lineHeight,
    letterSpacing: element.styles.letterSpacing,
    verticalAlign: element.styles.verticalAlign as any,
    backgroundRepeat: element.styles.backgroundRepeat as any,
    textDecoration: element.styles.textDecoration,
    cursor: element.styles.cursor,
    ...style
  };

  return (
    <div
      className={`absolute select-none ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} ${className}`}
      style={{
        ...elementStyle,
        cursor: isDragging ? 'grabbing' : 'grab',
        pointerEvents: 'auto'
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* Resize Handles */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
            style={{ top: -6, left: -6 }}
            onMouseDown={(e) => onResizeStart(e, 'nw')}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
            style={{ top: -6, right: -6 }}
            onMouseDown={(e) => onResizeStart(e, 'ne')}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
            style={{ bottom: -6, left: -6 }}
            onMouseDown={(e) => onResizeStart(e, 'sw')}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
            style={{ bottom: -6, right: -6 }}
            onMouseDown={(e) => onResizeStart(e, 'se')}
          />
          
          {/* Edge handles */}
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white cursor-n-resize"
            style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
            onMouseDown={(e) => onResizeStart(e, 'n')}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white cursor-s-resize"
            style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
            onMouseDown={(e) => onResizeStart(e, 's')}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white cursor-w-resize"
            style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={(e) => onResizeStart(e, 'w')}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white cursor-e-resize"
            style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={(e) => onResizeStart(e, 'e')}
          />
        </>
      )}
    </div>
  );
};

export default BaseElement;
