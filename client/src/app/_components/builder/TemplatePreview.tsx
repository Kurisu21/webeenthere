// components/TemplatePreview.tsx
import React from 'react';

interface TemplatePreviewProps {
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    image: string;
    html_base: string;
    css_base: string;
    is_featured: boolean;
  };
  onClick: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClick }) => {
  const background = getTemplateBackground(template.category);
  
  const previewStyle = {
    width: '100%',
    height: '100%',
    background: background,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    padding: '20px',
    boxSizing: 'border-box' as const,
    position: 'relative' as const,
    overflow: 'hidden'
  };

  return (
    <div style={previewStyle} onClick={onClick}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
        {getTemplateIcon(template.category)}
      </div>
      <div style={{ fontSize: '16px', marginBottom: '4px' }}>
        {template.name}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>
        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
      </div>
      {template.is_featured && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#f39c12',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          ⭐ Featured
        </div>
      )}
    </div>
  );
};

// Helper functions for template styling
const getTemplateBackground = (category: string): string => {
  const backgrounds: { [key: string]: string } = {
    portfolio: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    business: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
    personal: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    creative: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)',
    landing: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)'
  };
  return backgrounds[category] || 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
};

const getTemplateIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    portfolio: '🎨',
    business: '💼',
    personal: '👤',
    creative: '✨',
    landing: '🚀'
  };
  return icons[category] || '📄';
};

export default TemplatePreview;