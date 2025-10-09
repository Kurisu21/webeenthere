'use client';

import React from 'react';
import { ElementRendererProps } from '../base/ElementInterface';

const WebsiteElement: React.FC<ElementRendererProps> = ({ element }) => {
  // Extract CSS content if available
  const cssContent = (element as any).cssContent || '';
  
  // Scope CSS to prevent leaking into the app UI
  const scopedCSS = cssContent.replace(/([^{}]+){/g, (match, selector) => {
    // Skip if already scoped or is a keyframe
    if (selector.includes('.website-element') || selector.includes('@keyframes') || selector.includes('@media')) {
      return match;
    }
    // Scope all other selectors
    return `.website-element ${selector.trim()}{`;
  });
  
  return (
    <div 
      className="website-element"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        isolation: 'isolate' // Creates a new stacking context
      }}
    >
      {/* Inject scoped CSS styles */}
      {scopedCSS && (
        <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />
      )}
      
      {/* Render HTML content */}
      <div 
        dangerouslySetInnerHTML={{ __html: element.content }}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '600px'
        }}
      />
    </div>
  );
};

export default WebsiteElement;


