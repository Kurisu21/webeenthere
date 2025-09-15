'use client';

import React, { memo } from 'react';
import { Template } from '../_data/templates-simple';

interface TemplatePreviewProps {
  template: Template;
  className?: string;
}

const TemplatePreview = memo(({ template, className = '' }: TemplatePreviewProps) => {
  // Create a visual mockup based on template category
  const getCategoryColor = (category: string) => {
    const colors = {
      portfolio: 'from-purple-500 to-pink-500',
      business: 'from-blue-500 to-cyan-500',
      personal: 'from-green-500 to-emerald-500',
      creative: 'from-orange-500 to-red-500',
      landing: 'from-indigo-500 to-purple-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      portfolio: '🎨',
      business: '💼',
      personal: '👤',
      creative: '✨',
      landing: '🚀'
    };
    return icons[category as keyof typeof icons] || '📄';
  };

  const getCategoryColorHex = (category: string) => {
    const colors = {
      portfolio: '#8B5CF6, #EC4899',
      business: '#3B82F6, #06B6D4',
      personal: '#10B981, #059669',
      creative: '#F97316, #EF4444',
      landing: '#6366F1, #8B5CF6'
    };
    return colors[category as keyof typeof colors] || '#6B7280, #4B5563';
  };

  // Fallback if template is undefined
  if (!template) {
    return (
      <div className={`w-full h-full bg-gray-600 flex items-center justify-center ${className}`}>
        <div className="text-white text-sm">No template data</div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <div 
        className={`w-full h-full relative overflow-hidden rounded-lg`}
        style={{
          background: `linear-gradient(135deg, ${getCategoryColorHex(template.category)})`
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-2 w-8 h-8 border-2 border-white/30 rounded"></div>
          <div className="absolute top-6 right-4 w-4 h-4 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border border-white/30 rounded"></div>
          <div className="absolute top-12 right-2 w-2 h-2 bg-white/25 rounded-full"></div>
        </div>
        
        {/* Template Icon */}
        <div className="absolute top-3 left-3 text-white text-xl font-bold">
          {template.image}
        </div>
        
        {/* Mock Header */}
        <div className="absolute top-8 left-3 right-3">
          <div className="h-2 bg-white/40 rounded mb-1"></div>
          <div className="h-1 bg-white/20 rounded w-3/4"></div>
        </div>
        
        {/* Mock Content Blocks */}
        <div className="absolute top-16 left-3 right-3 space-y-1">
          <div className="h-1 bg-white/30 rounded"></div>
          <div className="h-1 bg-white/20 rounded w-5/6"></div>
          <div className="h-1 bg-white/15 rounded w-4/6"></div>
          <div className="h-1 bg-white/10 rounded w-3/6"></div>
        </div>
        
        {/* Mock Button */}
        <div className="absolute bottom-3 right-3">
          <div className="w-12 h-4 bg-white/30 rounded-full"></div>
        </div>
        
        {/* Mock Image Placeholder */}
        <div className="absolute bottom-8 left-3 w-8 h-6 bg-white/20 rounded"></div>
        
        {/* Category Badge */}
        <div className="absolute bottom-2 left-2 bg-white/20 backdrop-blur-sm rounded px-2 py-1">
          <div className="text-white text-xs font-medium flex items-center">
            <span className="mr-1">{getCategoryIcon(template.category)}</span>
            {template.category}
          </div>
        </div>
        
        {/* Template Name Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-white text-xs font-semibold opacity-80">
            {template.name}
          </div>
        </div>
      </div>
    </div>
  );
});

TemplatePreview.displayName = 'TemplatePreview';

export default TemplatePreview;
