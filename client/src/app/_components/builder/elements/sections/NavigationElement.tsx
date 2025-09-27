'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const NavigationElement: React.FC<ElementRendererProps> = ({
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
      <nav className="w-full h-full bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <a href="#" className="text-xl font-bold text-gray-900">Brand</a>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Products</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Services</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">Sign In</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>
    </BaseElement>
  );
};

export default NavigationElement;


