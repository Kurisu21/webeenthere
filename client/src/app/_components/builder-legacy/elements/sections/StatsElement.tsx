'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

const StatsElement: React.FC<ElementRendererProps> = ({ element }) => {
  return (
    <div 
      className="stats-element"
      style={{
        width: '100%',
        height: '100%',
        padding: '60px 40px',
        backgroundColor: '#2c3e50',
        color: 'white',
        ...element.styles
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
          {element.content || 'Our Statistics'}
        </h2>
        <p style={{ fontSize: '1.2rem', opacity: '0.8' }}>
          Numbers that speak for themselves
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px', color: '#3498db' }}>100+</div>
          <div style={{ fontSize: '1.2rem', opacity: '0.8' }}>Projects Completed</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px', color: '#e74c3c' }}>50+</div>
          <div style={{ fontSize: '1.2rem', opacity: '0.8' }}>Happy Clients</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px', color: '#2ecc71' }}>5+</div>
          <div style={{ fontSize: '1.2rem', opacity: '0.8' }}>Years Experience</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px', color: '#f39c12' }}>24/7</div>
          <div style={{ fontSize: '1.2rem', opacity: '0.8' }}>Support</div>
        </div>
      </div>
    </div>
  );
};

export default StatsElement;

