'use client';

import React from 'react';

interface BuilderToolbarProps {
  onWebsiteDetails: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const BuilderToolbar: React.FC<BuilderToolbarProps> = ({ onWebsiteDetails, onSave, isSaving }) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b-2 border-purple-500/20 px-6 py-4 flex items-center justify-between shadow-lg backdrop-blur-sm">
      <div className="flex items-center space-x-6">
        <button 
          onClick={onWebsiteDetails}
          className="text-gray-200 hover:text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-600/20 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Website Details
        </button>
        <div className="w-px h-6 bg-gray-500"></div>
        <button className="text-gray-200 hover:text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-600/20 transition-all duration-300 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Code
        </button>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Device Selector */}
        <div className="panel__devices flex items-center space-x-3 bg-gray-800/50 rounded-lg p-1 border border-gray-600/30">
          <button className="px-4 py-2 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md shadow-lg font-semibold transition-all duration-300 hover:scale-105">Desktop</button>
          <button className="px-4 py-2 text-xs text-gray-300 rounded-md hover:bg-gray-700/50 transition-all duration-300">Tablet</button>
          <button className="px-4 py-2 text-xs text-gray-300 rounded-md hover:bg-gray-700/50 transition-all duration-300">Mobile</button>
        </div>
        
        <div className="w-px h-6 bg-gray-500"></div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 p-2 rounded-lg hover:bg-purple-600/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 p-2 rounded-lg hover:bg-purple-600/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 p-2 rounded-lg hover:bg-purple-600/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-500"></div>
        
        {/* Save & Publish Buttons */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save
              </>
            )}
          </button>
          <button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/30 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuilderToolbar;



