import React from 'react';

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const Background: React.FC<BackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gray-900 ${className}`}>
      {children}
    </div>
  );
};

export default Background; 