'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

const ProjectsElement: React.FC<ElementRendererProps> = ({ element }) => {
  return (
    <div 
      className="projects-element"
      style={{
        width: '100%',
        height: '100%',
        padding: '60px 40px',
        backgroundColor: 'white',
        ...element.styles
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#2c3e50' }}>
          {element.content || 'My Projects'}
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          A showcase of my recent work
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        <div style={{ background: '#f8f9fa', borderRadius: '15px', overflow: 'hidden' }}>
          <div style={{ height: '200px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
            Project 1
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#2c3e50' }}>Project Title</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Project description goes here</p>
          </div>
        </div>
        <div style={{ background: '#f8f9fa', borderRadius: '15px', overflow: 'hidden' }}>
          <div style={{ height: '200px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
            Project 2
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#2c3e50' }}>Project Title</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Project description goes here</p>
          </div>
        </div>
        <div style={{ background: '#f8f9fa', borderRadius: '15px', overflow: 'hidden' }}>
          <div style={{ height: '200px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
            Project 3
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#2c3e50' }}>Project Title</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Project description goes here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsElement;

