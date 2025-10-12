'use client';

import React from 'react';

interface BuilderSidebarProps {
  activePanel: 'blocks' | 'layers' | 'styles' | 'assets' | 'ai';
  onPanelChange: (panel: 'blocks' | 'layers' | 'styles' | 'assets' | 'ai') => void;
}

const BuilderSidebar: React.FC<BuilderSidebarProps> = ({ activePanel, onPanelChange }) => {
  return (
    <div className="w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-r-4 border-purple-500/30 flex flex-col py-6 px-6 shadow-2xl backdrop-blur-sm relative z-10">
      {/* Header */}
      <div className="mb-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-center hover:animate-pulse transition-all duration-300 flex items-center justify-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Builder Studio
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1 space-y-3">
        {/* Elements/Blocks */}
        <button
          onClick={() => onPanelChange('blocks')}
          className={`
            flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:translate-x-3 group relative overflow-hidden
            ${activePanel === 'blocks'
              ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 border border-purple-400/20'
              : 'hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-600/30'
            }
          `}
        >
          {/* Active indicator */}
          {activePanel === 'blocks' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
          )}
          <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </span>
          <span className="font-semibold text-sm whitespace-nowrap relative z-10">Elements</span>
          {activePanel === 'blocks' && (
            <div className="ml-auto w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
          )}
        </button>

        {/* Layers */}
        <button
          onClick={() => onPanelChange('layers')}
          className={`
            flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:translate-x-3 group relative overflow-hidden
            ${activePanel === 'layers'
              ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 border border-purple-400/20'
              : 'hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-600/30'
            }
          `}
        >
          {/* Active indicator */}
          {activePanel === 'layers' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
          )}
          <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </span>
          <span className="font-semibold text-sm whitespace-nowrap relative z-10">Layers</span>
          {activePanel === 'layers' && (
            <div className="ml-auto w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
          )}
        </button>

        {/* Global Styles */}
        <button
          onClick={() => onPanelChange('styles')}
          className={`
            flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:translate-x-3 group relative overflow-hidden
            ${activePanel === 'styles'
              ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 border border-purple-400/20'
              : 'hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-600/30'
            }
          `}
        >
          {/* Active indicator */}
          {activePanel === 'styles' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
          )}
          <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </span>
          <span className="font-semibold text-sm whitespace-nowrap relative z-10">Global Styles</span>
          {activePanel === 'styles' && (
            <div className="ml-auto w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
          )}
        </button>

        {/* Assets */}
        <button
          onClick={() => onPanelChange('assets')}
          className={`
            flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:translate-x-3 group relative overflow-hidden
            ${activePanel === 'assets'
              ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 border border-purple-400/20'
              : 'hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-600/30'
            }
          `}
        >
          {/* Active indicator */}
          {activePanel === 'assets' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
          )}
          <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          <span className="font-semibold text-sm whitespace-nowrap relative z-10">Assets</span>
          {activePanel === 'assets' && (
            <div className="ml-auto w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
          )}
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => onPanelChange('ai')}
          className={`
            flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:translate-x-3 group relative overflow-hidden
            ${activePanel === 'ai'
              ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 border border-purple-400/20'
              : 'hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-600/30'
            }
          `}
        >
          {/* Active indicator */}
          {activePanel === 'ai' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
          )}
          <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </span>
          <span className="font-semibold text-sm whitespace-nowrap relative z-10">AI Assistant</span>
          {activePanel === 'ai' && (
            <div className="ml-auto w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
          )}
        </button>
      </nav>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto mt-4">
        {activePanel === 'blocks' && (
          <div className="p-4">
            <div className="blocks-container"></div>
          </div>
        )}
        
        {activePanel === 'layers' && (
          <div className="p-4">
            <div className="layers-container"></div>
          </div>
        )}
        
        {activePanel === 'styles' && (
          <div className="p-4">
            <div className="styles-container"></div>
          </div>
        )}
        
        {activePanel === 'assets' && (
          <div className="p-4">
            <div className="assets-container"></div>
          </div>
        )}
        
        {activePanel === 'ai' && (
          <div className="p-4">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-sm">AI Assistant</p>
              <p className="text-xs mt-2">Coming Soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderSidebar;



