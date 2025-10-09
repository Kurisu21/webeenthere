'use client';

import React, { useState } from 'react';

interface AIPanelProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  suggestions: string[];
}

export const AIPanel: React.FC<AIPanelProps> = ({
  onGenerate,
  isLoading,
  suggestions
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('content');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
      setPrompt('');
    }
  };

  const quickPrompts = [
    'Create a hero section for a tech startup',
    'Add a contact form with modern styling',
    'Generate a pricing table for SaaS',
    'Create a testimonials section',
    'Add a call-to-action button',
    'Generate a footer with social links'
  ];

  return (
    <div className="p-4 border-b border-gray-700">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        AI Assistant
      </h3>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-purple-500 focus:outline-none"
          >
            <option value="content">Generate Content</option>
            <option value="section">Create Section</option>
            <option value="improve">Improve Existing</option>
            <option value="seo">SEO Optimization</option>
          </select>
        </div>

        <div className="mb-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create..."
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate
            </>
          )}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-gray-300 text-sm font-medium mb-2">Suggestions:</h4>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="text-gray-400 text-xs p-2 bg-gray-800 rounded"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-gray-300 text-sm font-medium mb-2">Quick Prompts:</h4>
        <div className="space-y-1">
          {quickPrompts.map((quickPrompt, index) => (
            <button
              key={index}
              onClick={() => setPrompt(quickPrompt)}
              className="w-full text-left text-gray-400 text-xs p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              {quickPrompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


