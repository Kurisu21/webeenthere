'use client';

import React from 'react';

interface BuilderInstructionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuilderInstructionOverlay: React.FC<BuilderInstructionOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
        className="absolute inset-0 p-2 sm:p-4 pointer-events-none overflow-y-auto"
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
            Builder Instructions!
          </h2>
        </div>

        {/* Instructions Sections */}
        <div className="max-w-4xl mx-auto mt-16 sm:mt-20 md:mt-24 space-y-6 sm:space-y-8 pointer-events-auto">
          
          {/* Section 1: Top Toolbar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 drop-shadow-lg">
              📋 Top Toolbar
            </h3>
            <div className="space-y-3 text-white text-sm sm:text-base">
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Exit Button:</span>
                <span>Click to leave the builder and return to dashboard</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Title:</span>
                <span>Click the title to edit your website name</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Device Buttons:</span>
                <span>Switch between Desktop, Tablet, and Mobile views to preview responsive design</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Undo/Redo:</span>
                <span>Revert or reapply your last actions (Ctrl+Z / Ctrl+Y)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Preview:</span>
                <span>View how your website will look to visitors</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Code View:</span>
                <span>See the HTML/CSS code of your website</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Save:</span>
                <span>Manually save your work (auto-save is also enabled)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Publish:</span>
                <span>Make your website live and accessible to the public</span>
              </div>
            </div>
          </div>

          {/* Section 2: Left Panel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 drop-shadow-lg">
              🧩 Left Panel - Components & Layers
            </h3>
            <div className="space-y-3 text-white text-sm sm:text-base">
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Blocks Tab:</span>
                <span>Drag and drop components (text, images, buttons, etc.) onto the canvas</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Layers Tab:</span>
                <span>View and manage the hierarchy of all elements on your page</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Search:</span>
                <span>Quickly find blocks or layers by typing their name</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Tip:</span>
                <span>Click on any element in the canvas to select and edit it</span>
              </div>
            </div>
          </div>

          {/* Section 3: Center Canvas */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 drop-shadow-lg">
              🎨 Center Canvas - Design Area
            </h3>
            <div className="space-y-3 text-white text-sm sm:text-base">
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Drag & Drop:</span>
                <span>Drag blocks from the left panel onto the canvas to add elements</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Select Elements:</span>
                <span>Click any element to select it and view its properties on the right</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Move Elements:</span>
                <span>Drag selected elements to reposition them on the page</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Zoom Controls:</span>
                <span>Use the zoom buttons (bottom right) to zoom in/out or reset view</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Grid Toggle:</span>
                <span>Enable grid overlay to help align elements precisely</span>
              </div>
            </div>
          </div>

          {/* Section 4: Right Panel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 drop-shadow-lg">
              ⚙️ Right Panel - Properties
            </h3>
            <div className="space-y-3 text-white text-sm sm:text-base">
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Edit Properties:</span>
                <span>When an element is selected, edit its style, content, and settings here</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Styling:</span>
                <span>Change colors, fonts, spacing, borders, and more</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Content:</span>
                <span>Edit text, images, links, and other content directly</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Responsive:</span>
                <span>Adjust styles for different screen sizes (desktop, tablet, mobile)</span>
              </div>
            </div>
          </div>

          {/* Section 5: Quick Tips */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 drop-shadow-lg">
              💡 Quick Tips
            </h3>
            <div className="space-y-3 text-white text-sm sm:text-base">
              <div className="flex items-start gap-3">
                <span className="font-semibold">•</span>
                <span>Your work is auto-saved, but you can manually save anytime</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold">•</span>
                <span>Use the AI Assistant for quick content generation and suggestions</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold">•</span>
                <span>Test your design on different device sizes before publishing</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold">•</span>
                <span>Delete elements by selecting them and pressing Delete key</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold">•</span>
                <span>Use the Layers panel to organize and find nested elements</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Right - Close Button */}
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

export default BuilderInstructionOverlay;



