'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

const FooterElement: React.FC<ElementRendererProps> = ({ element }) => {
  return (
    <div 
      className="footer-element"
      style={{
        width: '100%',
        height: '100%',
        padding: '40px',
        backgroundColor: '#34495e',
        color: 'white',
        ...element.styles
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '30px' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#3498db' }}>
            {element.content || 'Company Name'}
          </h3>
          <p style={{ lineHeight: '1.6', opacity: '0.8' }}>
            Creating amazing digital experiences for businesses worldwide.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="#home" style={{ color: 'white', textDecoration: 'none', opacity: '0.8' }}>Home</a>
            <a href="#about" style={{ color: 'white', textDecoration: 'none', opacity: '0.8' }}>About</a>
            <a href="#services" style={{ color: 'white', textDecoration: 'none', opacity: '0.8' }}>Services</a>
            <a href="#contact" style={{ color: 'white', textDecoration: 'none', opacity: '0.8' }}>Contact</a>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Contact Info</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: '0.8' }}>
            <div>📧 info@company.com</div>
            <div>📞 +1 (555) 123-4567</div>
            <div>📍 123 Business St, City, State</div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #4a5f7a', paddingTop: '20px', textAlign: 'center', opacity: '0.6' }}>
        <p>&copy; 2025 Company Name. All rights reserved.</p>
      </div>
    </div>
  );
};

export default FooterElement;