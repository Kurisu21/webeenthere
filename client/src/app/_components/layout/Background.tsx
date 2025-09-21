import React from 'react';

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const Background: React.FC<BackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-stone-900 to-slate-800 ${className}`}>
      {children}
    </div>
  );
};

export default Background; 