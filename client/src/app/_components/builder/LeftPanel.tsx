'use client';

import { useState } from 'react';
import { LayerPanel } from './LayerPanel';
import type { Editor } from 'grapesjs';

interface LeftPanelProps {
  isDark: boolean;
  editor?: Editor | null;
}

export default function LeftPanel({ isDark, editor }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<'layers' | 'blocks'>('layers');
  const [searchQuery, setSearchQuery] = useState('');

  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const bgTertiary = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-800' : 'bg-white';
  const tabActiveClass = isDark
    ? 'bg-gray-700 text-white border-b-2 border-blue-500'
    : 'bg-white text-gray-900 border-b-2 border-blue-500';
  const tabInactiveClass = isDark
    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

  return (
    <div className={`left-panel w-64 ${bgSecondary} border-r ${borderColor} flex flex-col h-full`}>
      {/* Tabs */}
      <div className={`flex border-b ${borderColor}`}>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'layers' ? `${tabActiveClass} left-panel-tab-active` : tabInactiveClass}`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Layers
          </div>
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'blocks' ? `${tabActiveClass} left-panel-tab-active` : tabInactiveClass}`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            Blocks
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className={`p-3 border-b ${borderColor}`}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'layers' ? 'Search layers...' : 'Search blocks...'}
            className={`w-full px-3 py-2 pl-9 ${inputBg} ${textPrimary} rounded-md border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
          />
          <svg
            className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'layers' ? (
          <LayerPanel editor={editor || null} isDark={isDark} />
        ) : (
          <div className="p-3">
            <div className="blocks-container" />
          </div>
        )}
      </div>
    </div>
  );
}

