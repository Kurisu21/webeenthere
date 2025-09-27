'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

export const ImageElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({
          ...element,
          imageUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded overflow-hidden">
      {element.imageUrl ? (
        <img 
          src={element.imageUrl} 
          alt={element.content}
          className="w-full h-full object-cover"
          style={{
            borderRadius: element.styles.borderRadius
          }}
        />
      ) : (
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-gray-500 text-sm mt-2">{element.content}</div>
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
  );
};

export default ImageElement;
