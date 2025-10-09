'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

const SectionElement: React.FC<ElementRendererProps> = ({ element }) => {
  return (
    <div 
      className="section-element"
      style={{
        width: '100%',
        height: '100%',
        padding: '40px',
        backgroundColor: 'white',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        ...element.styles
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2c3e50' }}>
          {element.content || 'Section Title'}
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.6' }}>
          This is a generic section that can be customized with your content.
        </p>
      </div>
    </div>
  );
};

export default SectionElement;

