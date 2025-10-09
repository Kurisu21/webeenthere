'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

const NavigationElement: React.FC<ElementRendererProps> = ({ element }) => {
  return (
    <div 
      className="navigation-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        backgroundColor: '#2c3e50',
        color: 'white',
        ...element.styles
      }}
    >
      <div className="nav-brand" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        {element.content || 'Brand Name'}
      </div>
      <div className="nav-links" style={{ display: 'flex', gap: '20px' }}>
        <a href="#home" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
        <a href="#about" style={{ color: 'white', textDecoration: 'none' }}>About</a>
        <a href="#contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
      </div>
    </div>
  );
};

export default NavigationElement;