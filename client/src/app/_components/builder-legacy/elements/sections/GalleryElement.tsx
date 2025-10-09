'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const GalleryElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  // Get images from element data instead of local state
  const images = (element as any).galleryImages || [];

  const handleContentChange = (newContent: string) => {
    onUpdate({
      ...element,
      content: newContent
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push(event.target?.result as string);
        onUpdate({
          ...element,
          galleryImages: newImages
        });
      };
      reader.readAsDataURL(file);
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
        className="w-full h-full"
        style={{
          backgroundColor: element.styles.backgroundColor,
          borderRadius: element.styles.borderRadius,
          padding: element.styles.padding,
          textAlign: element.styles.textAlign as any
        }}
      >
        {isSelected ? (
          <div className="w-full h-full">
            <textarea
              value={element.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-1/2 bg-transparent border-none outline-none resize-none text-center"
              style={{
                color: element.styles.color,
                fontSize: element.styles.fontSize,
                textAlign: element.styles.textAlign as any
              }}
              onBlur={(e) => e.target.blur()}
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="mt-2 text-xs"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className="w-full h-full">
            <div
              className="text-center mb-4"
              style={{
                color: element.styles.color,
                fontSize: element.styles.fontSize
              }}
            >
              {element.content}
            </div>
            <div className="grid grid-cols-2 gap-2 h-3/4">
              {images.length > 0 ? (
                images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                ))
              ) : (
                <div className="col-span-2 flex items-center justify-center text-gray-500">
                  No images uploaded
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseElement>
  );
};

export default GalleryElement;
