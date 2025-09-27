'use client';

import React, { useState } from 'react';
import { Element } from '../elements';

interface EnhancedPropertiesPanelProps {
  selectedElement: Element | null;
  onUpdateElement: (id: string, updates: Partial<Element>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
}

interface PropertySection {
  id: string;
  title: string;
  icon: string;
  hasChanges: boolean;
}

export const EnhancedPropertiesPanel: React.FC<EnhancedPropertiesPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['layout', 'typography']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const updateStyle = (key: string, value: string) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, {
        styles: { ...selectedElement.styles, [key]: value }
      });
    }
  };

  const updateContent = (content: string) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { content });
    }
  };

  const updatePosition = (x: number, y: number) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { position: { x, y } });
    }
  };

  const updateSize = (width: number, height: number) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { size: { width, height } });
    }
  };

  const hasStyleValue = (key: string): boolean => {
    const value = selectedElement?.styles[key as keyof typeof selectedElement.styles];
    return Boolean(value && value !== '' && value !== '0' && value !== 'none');
  };

  const sections: PropertySection[] = [
    { id: 'layout', title: 'Layout', icon: 'L', hasChanges: hasStyleValue('display') || hasStyleValue('flexDirection') || hasStyleValue('justifyContent') || hasStyleValue('alignItems') },
    { id: 'size', title: 'Size', icon: 'S', hasChanges: hasStyleValue('width') || hasStyleValue('height') },
    { id: 'space', title: 'Space', icon: 'P', hasChanges: hasStyleValue('padding') || hasStyleValue('margin') },
    { id: 'position', title: 'Position', icon: 'P', hasChanges: selectedElement?.position.x !== 0 || selectedElement?.position.y !== 0 },
    { id: 'typography', title: 'Typography', icon: 'T', hasChanges: hasStyleValue('fontSize') || hasStyleValue('fontWeight') || hasStyleValue('color') || hasStyleValue('textAlign') },
    { id: 'background', title: 'Background', icon: 'B', hasChanges: hasStyleValue('backgroundColor') || hasStyleValue('backgroundImage') },
    { id: 'borders', title: 'Borders', icon: 'B', hasChanges: hasStyleValue('border') || hasStyleValue('borderRadius') },
    { id: 'effects', title: 'Effects', icon: 'E', hasChanges: hasStyleValue('boxShadow') || hasStyleValue('opacity') || hasStyleValue('transform') }
  ];

  if (!selectedElement) {
    return (
      <div className="w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-sm">Properties</h3>
        </div>
        <div className="p-4 text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const renderSection = (section: PropertySection) => {
    const isExpanded = expandedSections.has(section.id);

    return (
      <div key={section.id} className="border-b border-gray-700">
        <button
          onClick={() => toggleSection(section.id)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs text-gray-300 font-bold">{section.icon}</span>
            </div>
            <span className="text-white font-medium">{section.title}</span>
            {section.hasChanges && (
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-4">
            {section.id === 'layout' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Display</label>
                  <select
                    value={selectedElement.styles.display || 'block'}
                    onChange={(e) => updateStyle('display', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="block">Block</option>
                    <option value="inline">Inline</option>
                    <option value="inline-block">Inline Block</option>
                    <option value="flex">Flex</option>
                    <option value="grid">Grid</option>
                    <option value="none">None</option>
                  </select>
                </div>
                {selectedElement.styles.display === 'flex' && (
                  <>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Flex Direction</label>
                      <select
                        value={selectedElement.styles.flexDirection || 'row'}
                        onChange={(e) => updateStyle('flexDirection', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="row">Row</option>
                        <option value="column">Column</option>
                        <option value="row-reverse">Row Reverse</option>
                        <option value="column-reverse">Column Reverse</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Justify Content</label>
                      <select
                        value={selectedElement.styles.justifyContent || 'flex-start'}
                        onChange={(e) => updateStyle('justifyContent', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Space Between</option>
                        <option value="space-around">Space Around</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Align Items</label>
                      <select
                        value={selectedElement.styles.alignItems || 'stretch'}
                        onChange={(e) => updateStyle('alignItems', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="stretch">Stretch</option>
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="baseline">Baseline</option>
                      </select>
                    </div>
                  </>
                )}
              </>
            )}

            {section.id === 'size' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Width</label>
                  <input
                    type="number"
                    value={selectedElement.size.width}
                    onChange={(e) => updateSize(parseInt(e.target.value) || 0, selectedElement.size.height)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Height</label>
                  <input
                    type="number"
                    value={selectedElement.size.height}
                    onChange={(e) => updateSize(selectedElement.size.width, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {section.id === 'space' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Padding</label>
                  <input
                    type="text"
                    value={selectedElement.styles.padding || '0'}
                    onChange={(e) => updateStyle('padding', e.target.value)}
                    placeholder="10px"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Margin</label>
                  <input
                    type="text"
                    value={selectedElement.styles.margin || '0'}
                    onChange={(e) => updateStyle('margin', e.target.value)}
                    placeholder="10px"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {section.id === 'position' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">X Position</label>
                  <input
                    type="number"
                    value={selectedElement.position.x}
                    onChange={(e) => updatePosition(parseInt(e.target.value) || 0, selectedElement.position.y)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Y Position</label>
                  <input
                    type="number"
                    value={selectedElement.position.y}
                    onChange={(e) => updatePosition(selectedElement.position.x, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {section.id === 'typography' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={selectedElement.content}
                    onChange={(e) => updateContent(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Font Size</label>
                  <input
                    type="text"
                    value={selectedElement.styles.fontSize || '16px'}
                    onChange={(e) => updateStyle('fontSize', e.target.value)}
                    placeholder="16px"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Font Weight</label>
                  <select
                    value={selectedElement.styles.fontWeight || 'normal'}
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Light</option>
                    <option value="bolder">Bolder</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                    <option value="600">600</option>
                    <option value="700">700</option>
                    <option value="800">800</option>
                    <option value="900">900</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Text Color</label>
                  <input
                    type="color"
                    value={selectedElement.styles.color || '#333333'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Text Align</label>
                  <select
                    value={selectedElement.styles.textAlign || 'left'}
                    onChange={(e) => updateStyle('textAlign', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Font Family</label>
                  <select
                    value={selectedElement.styles.fontFamily || 'Arial'}
                    onChange={(e) => updateStyle('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Impact">Impact</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Line Height</label>
                  <input
                    type="text"
                    value={selectedElement.styles.lineHeight || 'normal'}
                    onChange={(e) => updateStyle('lineHeight', e.target.value)}
                    placeholder="1.5 or 24px"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Letter Spacing</label>
                  <input
                    type="text"
                    value={selectedElement.styles.letterSpacing || 'normal'}
                    onChange={(e) => updateStyle('letterSpacing', e.target.value)}
                    placeholder="0.5px"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {section.id === 'background' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Background Color</label>
                  <input
                    type="color"
                    value={selectedElement.styles.backgroundColor || '#ffffff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Background Image URL</label>
                  <input
                    type="url"
                    value={selectedElement.styles.backgroundImage || ''}
                    onChange={(e) => updateStyle('backgroundImage', e.target.value ? `url(${e.target.value})` : '')}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Background Size</label>
                  <select
                    value={selectedElement.styles.backgroundSize || 'cover'}
                    onChange={(e) => updateStyle('backgroundSize', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="100% 100%">Stretch</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Background Position</label>
                  <select
                    value={selectedElement.styles.backgroundPosition || 'center'}
                    onChange={(e) => updateStyle('backgroundPosition', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top left">Top Left</option>
                    <option value="top right">Top Right</option>
                    <option value="bottom left">Bottom Left</option>
                    <option value="bottom right">Bottom Right</option>
                  </select>
                </div>
              </>
            )}

            {section.id === 'borders' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Border</label>
                  <input
                    type="text"
                    value={selectedElement.styles.border || 'none'}
                    onChange={(e) => updateStyle('border', e.target.value)}
                    placeholder="1px solid #000"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Border Radius</label>
                  <input
                    type="text"
                    value={selectedElement.styles.borderRadius || '0'}
                    onChange={(e) => updateStyle('borderRadius', e.target.value)}
                    placeholder="5px"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {section.id === 'effects' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Box Shadow</label>
                  <input
                    type="text"
                    value={selectedElement.styles.boxShadow || 'none'}
                    onChange={(e) => updateStyle('boxShadow', e.target.value)}
                    placeholder="0 2px 4px rgba(0,0,0,0.1)"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElement.styles.opacity || '1'}
                    onChange={(e) => updateStyle('opacity', e.target.value)}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 mt-1">{selectedElement.styles.opacity || '1'}</div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Transform</label>
                  <input
                    type="text"
                    value={selectedElement.styles.transform || 'none'}
                    onChange={(e) => updateStyle('transform', e.target.value)}
                    placeholder="rotate(45deg) scale(1.2)"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Transition</label>
                  <input
                    type="text"
                    value={selectedElement.styles.transition || 'all 0.3s ease'}
                    onChange={(e) => updateStyle('transition', e.target.value)}
                    placeholder="all 0.3s ease"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Z-Index</label>
                  <input
                    type="number"
                    value={selectedElement.styles.zIndex || 'auto'}
                    onChange={(e) => updateStyle('zIndex', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Properties</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDuplicateElement(selectedElement.id)}
              className="text-blue-400 hover:text-blue-300 p-1"
              title="Duplicate Element"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => onDeleteElement(selectedElement.id)}
              className="text-red-400 hover:text-red-300 p-1"
              title="Delete Element"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-1 capitalize">{selectedElement.type} Element</p>
      </div>

      {/* Property Sections */}
      <div className="divide-y divide-gray-700">
        {sections.map(renderSection)}
      </div>
    </div>
  );
};
