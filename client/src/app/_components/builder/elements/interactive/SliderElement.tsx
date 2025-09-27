'use client';

import React, { useState } from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const SliderElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ['Slide 1', 'Slide 2', 'Slide 3'];

  const handleContentChange = (newContent: string) => {
    onUpdate({
      ...element,
      content: newContent
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
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
        className="w-full h-full relative"
        style={{
          backgroundColor: element.styles.backgroundColor,
          borderRadius: element.styles.borderRadius,
          padding: element.styles.padding
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
          <div className="w-full h-full relative">
            {/* Slide Content */}
            <div className="w-full h-full flex items-center justify-center">
              <div
                style={{
                  color: element.styles.color,
                  fontSize: element.styles.fontSize,
                  textAlign: element.styles.textAlign as any
                }}
              >
                {element.content} - {slides[currentSlide]}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded"
            >
              ›
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(index);
                  }}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseElement>
  );
};

export default SliderElement;
