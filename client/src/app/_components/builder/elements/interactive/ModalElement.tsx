'use client';

import React, { useState } from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const ModalElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleContentChange = (newContent: string) => {
    onUpdate({
      ...element,
      content: newContent
    });
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <>
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
            <textarea
              value={element.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full bg-transparent border-none outline-none resize-none text-center"
              style={{
                color: element.styles.color,
                fontSize: element.styles.fontSize,
                fontWeight: element.styles.fontWeight,
                backgroundColor: element.styles.backgroundColor,
                borderRadius: element.styles.borderRadius,
                padding: element.styles.padding,
                textAlign: element.styles.textAlign as any,
                boxShadow: element.styles.boxShadow
              }}
              onBlur={(e) => e.target.blur()}
            />
          ) : (
            <button
              onClick={handleOpenModal}
              className="w-full h-full border-none cursor-pointer"
              style={{
                color: element.styles.color,
                fontSize: element.styles.fontSize,
                fontWeight: element.styles.fontWeight,
                backgroundColor: element.styles.backgroundColor,
                borderRadius: element.styles.borderRadius,
                padding: element.styles.padding,
                textAlign: element.styles.textAlign as any,
                boxShadow: element.styles.boxShadow
              }}
            >
              {element.content}
            </button>
          )}
        </div>
      </BaseElement>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: element.styles.boxShadow,
              borderRadius: element.styles.borderRadius
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modal Content</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div
              style={{
                color: element.styles.color,
                fontSize: element.styles.fontSize
              }}
            >
              {element.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalElement;
