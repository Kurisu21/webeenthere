'use client';

import React, { useState } from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const RatingElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const handleContentChange = (newContent: string) => {
    onUpdate({
      ...element,
      content: newContent
    });
  };

  const handleRatingClick = (newRating: number) => {
    setRating(newRating);
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
        className="w-full h-full flex flex-col items-center justify-center"
        style={{
          backgroundColor: element.styles.backgroundColor,
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
              textAlign: element.styles.textAlign as any
            }}
            onBlur={(e) => e.target.blur()}
          />
        ) : (
          <div className="text-center">
            <div
              className="flex space-x-1 mb-2"
              style={{
                color: element.styles.color,
                fontSize: element.styles.fontSize
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRatingClick(star);
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="cursor-pointer"
                  style={{
                    color: star <= (hoverRating || rating) ? '#ffc107' : '#e0e0e0'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <div
              style={{
                color: element.styles.color,
                fontSize: element.styles.fontSize
              }}
            >
              {element.content} ({rating}/5)
            </div>
          </div>
        )}
      </div>
    </BaseElement>
  );
};

export default RatingElement;
