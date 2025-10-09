// components/builder/AIContextDisplay.tsx
import React from 'react';

interface AIContextDisplayProps {
  context?: {
    summary: string;
    elementTypes: string[];
    contentThemes: string[];
    layoutPattern: string;
    suggestions: string[];
    elementCount: number;
    hasNavigation: boolean;
    hasHero: boolean;
    hasFooter: boolean;
  };
  reasoning?: string;
}

const AIContextDisplay: React.FC<AIContextDisplayProps> = ({ context, reasoning }) => {
  if (!context) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
        <h3 className="text-sm font-semibold text-blue-800">AI Context Analysis</h3>
      </div>
      
      <div className="space-y-2 text-sm text-blue-700">
        <div>
          <span className="font-medium">Website State:</span> {context.summary}
        </div>
        
        <div className="flex flex-wrap gap-1">
          <span className="font-medium">Elements:</span>
          {context.elementTypes.map((type, index) => (
            <span key={index} className="bg-blue-100 px-2 py-1 rounded text-xs">
              {type}
            </span>
          ))}
        </div>
        
        {context.contentThemes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="font-medium">Themes:</span>
            {context.contentThemes.map((theme, index) => (
              <span key={index} className="bg-green-100 px-2 py-1 rounded text-xs">
                {theme}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs">
          <span className={`px-2 py-1 rounded ${context.hasNavigation ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {context.hasNavigation ? '✓ Navigation' : '✗ Navigation'}
          </span>
          <span className={`px-2 py-1 rounded ${context.hasHero ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {context.hasHero ? '✓ Hero' : '✗ Hero'}
          </span>
          <span className={`px-2 py-1 rounded ${context.hasFooter ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {context.hasFooter ? '✓ Footer' : '✗ Footer'}
          </span>
        </div>
        
        {context.suggestions.length > 0 && (
          <div>
            <span className="font-medium">Suggestions:</span>
            <ul className="list-disc list-inside ml-2 mt-1">
              {context.suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="text-xs">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {reasoning && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <span className="font-medium">AI Reasoning:</span>
            <p className="text-xs mt-1 italic">{reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIContextDisplay;


