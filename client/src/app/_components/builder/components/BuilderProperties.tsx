'use client';

import React from 'react';

const BuilderProperties: React.FC = () => {
  return (
    <div className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 border-l-4 border-purple-500/30 flex flex-col shadow-2xl backdrop-blur-sm relative z-10">
      {/* Properties Header */}
      <div className="p-6 border-b-2 border-purple-500/20 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
        <h3 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-3">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Properties
        </h3>
      </div>
      
      {/* Properties Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-800/30 to-gray-900/30">
        <div className="traits-container"></div>
      </div>
    </div>
  );
};

export default BuilderProperties;



