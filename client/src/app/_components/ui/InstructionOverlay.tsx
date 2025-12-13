'use client';

import React from 'react';

interface InstructionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionOverlay: React.FC<InstructionOverlayProps> = ({ isOpen, onClose }) => {
  console.log('🎯 InstructionOverlay render - isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('❌ InstructionOverlay: Not rendering because isOpen is false');
    return null;
  }

  console.log('✅ InstructionOverlay: Rendering overlay!');

  return (
    <div 
      className="fixed inset-0 z-[9999] pointer-events-auto" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      {/* Semi-transparent overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
        onClick={onClose} 
      />
      
      {/* Instruction Content */}
      <div 
        className="absolute inset-0 p-2 sm:p-4 pointer-events-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        {/* Title */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-8 md:left-8 z-10 pointer-events-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
            Useful Instructions!
          </h2>
        </div>


        {/* Top Toolbar Instructions - Right Side */}
        <div className="absolute top-4 right-2 sm:top-6 sm:right-4 md:top-8 md:right-8 z-10 pointer-events-auto">
          <div className="relative">
            {/* Vertical line for arrows */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
            
            {/* Instructions pointing to toolbar icons */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Instructions icon */}
              <div className="relative flex items-center">
                <div className="absolute right-full mr-2 sm:mr-3 md:mr-4 top-1/2 transform -translate-y-1/2">
                  <div className="text-white text-[10px] xs:text-xs sm:text-sm md:text-base font-medium drop-shadow-lg whitespace-nowrap text-right">
                    Show instructions (this button)
                  </div>
                </div>
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Sidebar navigation */}
              <div className="relative flex items-center">
                <div className="absolute right-full mr-2 sm:mr-3 md:mr-4 top-1/2 transform -translate-y-1/2">
                  <div className="text-white text-[10px] xs:text-xs sm:text-sm md:text-base font-medium drop-shadow-lg whitespace-nowrap text-right">
                    Navigate to different pages
                  </div>
                </div>
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>

              {/* Create website */}
              <div className="relative flex items-center">
                <div className="absolute right-full mr-2 sm:mr-3 md:mr-4 top-1/2 transform -translate-y-1/2">
                  <div className="text-white text-[10px] xs:text-xs sm:text-sm md:text-base font-medium drop-shadow-lg whitespace-nowrap text-right">
                    Create new website
                  </div>
                </div>
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>

              {/* View websites */}
              <div className="relative flex items-center">
                <div className="absolute right-full mr-2 sm:mr-3 md:mr-4 top-1/2 transform -translate-y-1/2">
                  <div className="text-white text-[10px] xs:text-xs sm:text-sm md:text-base font-medium drop-shadow-lg whitespace-nowrap text-right">
                    View your websites
                  </div>
                </div>
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right - Close Button and Re-access Info */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-8 md:right-8 z-10 pointer-events-auto">
          <div className="flex flex-col items-end space-y-1 sm:space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-300 shadow-lg pointer-events-auto"
            >
              Okay, got it!
            </button>
            <p className="text-white text-[10px] xs:text-xs sm:text-sm drop-shadow-lg text-right max-w-[140px] sm:max-w-none">
              Click the Instructions button to show this screen again
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;



