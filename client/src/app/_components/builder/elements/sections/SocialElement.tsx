'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const SocialElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' }
  ];

  const handleContentChange = (newContent: string) => {
    onUpdate({
      ...element,
      content: newContent
    });
  };

  const handleSocialClick = (url: string) => {
    if (url !== '#') {
      window.open(url, '_blank');
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
              className="mb-4"
              style={{
                color: element.styles.color,
                fontSize: element.styles.fontSize
              }}
            >
              {element.content}
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSocialClick(social.url);
                  }}
                  className="text-2xl hover:scale-110 transition-transform"
                  title={social.name}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseElement>
  );
};

export default SocialElement;
