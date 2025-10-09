'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

const ServicesElement: React.FC<ElementRendererProps> = ({ element }) => {
  return (
    <div 
      className="services-element"
      style={{
        width: '100%',
        height: '100%',
        padding: '60px 40px',
        backgroundColor: '#f8f9fa',
        ...element.styles
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#2c3e50' }}>
          {element.content || 'Our Services'}
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          Professional solutions for your business needs
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#2c3e50' }}>Service 1</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>Description of service 1</p>
        </div>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💡</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#2c3e50' }}>Service 2</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>Description of service 2</p>
        </div>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚡</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#2c3e50' }}>Service 3</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>Description of service 3</p>
        </div>
      </div>
    </div>
  );
};

export default ServicesElement;

