'use client';

import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import { Template } from '../../_data/templates-simple';

// Dynamically import GrapeJS only on client side
const GrapesJS = dynamic(() => import('./GrapesJSComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <div>Loading drag & drop editor...</div>
        <div className="text-sm text-gray-400 mt-2">Setting up interface</div>
      </div>
    </div>
  )
});

interface GrapeJSBuilderProps {
  template?: Template;
  onSave?: (html: string, css: string) => void;
  onCancel?: () => void;
}

const GrapeJSBuilder = memo(({ template, onSave, onCancel }: GrapeJSBuilderProps) => {
  return <GrapesJS template={template} onSave={onSave} onCancel={onCancel} />;
});

GrapeJSBuilder.displayName = 'GrapeJSBuilder';

export default GrapeJSBuilder;
