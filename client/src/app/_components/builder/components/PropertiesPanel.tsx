'use client';

import React, { useEffect, useState } from 'react';

interface PropertiesPanelProps {
  editor: any;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ editor }) => {
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [properties, setProperties] = useState<any>({});

  useEffect(() => {
    if (!editor) return;

    const handleComponentSelect = (component: any) => {
      setSelectedComponent(component);
      if (component) {
        const traits = component.get('traits') || [];
        const props: any = {};
        traits.forEach((trait: any) => {
          props[trait.name] = trait.value;
        });
        setProperties(props);
      }
    };

    editor.on('component:selected', handleComponentSelect);
    editor.on('component:deselected', () => {
      setSelectedComponent(null);
      setProperties({});
    });

    return () => {
      editor.off('component:selected', handleComponentSelect);
    };
  }, [editor]);

  const updateProperty = (name: string, value: any) => {
    if (!selectedComponent) return;

    const traits = selectedComponent.get('traits') || [];
    const trait = traits.find((t: any) => t.name === name);
    
    if (trait) {
      trait.set('value', value);
    } else {
      selectedComponent.addTrait({
        type: 'text',
        name: name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        value: value
      });
    }

    setProperties({ ...properties, [name]: value });
  };

  if (!selectedComponent) {
    return (
      <div className="p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Properties
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">Select a component to edit its properties</div>
        </div>
      </div>
    );
  }

  const componentType = selectedComponent.get('type');
  const componentTag = selectedComponent.get('tagName');

  return (
    <div className="p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Properties
      </h3>

      <div className="mb-4">
        <div className="text-gray-300 text-sm mb-1">Component Type</div>
        <div className="text-white text-sm font-medium">{componentType || componentTag}</div>
      </div>

      {/* Common Properties */}
      <div className="space-y-4">
        {/* ID */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">ID</label>
          <input
            type="text"
            value={properties.id || ''}
            onChange={(e) => updateProperty('id', e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
          />
        </div>

        {/* Class */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">Class</label>
          <input
            type="text"
            value={properties.class || ''}
            onChange={(e) => updateProperty('class', e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
          />
        </div>

        {/* Text Content (for text elements) */}
        {(componentTag === 'h1' || componentTag === 'h2' || componentTag === 'h3' || 
          componentTag === 'h4' || componentTag === 'h5' || componentTag === 'h6' || 
          componentTag === 'p' || componentTag === 'span') && (
          <div>
            <label className="block text-gray-300 text-sm mb-1">Text Content</label>
            <textarea
              value={selectedComponent.get('content') || ''}
              onChange={(e) => selectedComponent.set('content', e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Link (for anchor tags) */}
        {componentTag === 'a' && (
          <div>
            <label className="block text-gray-300 text-sm mb-1">Link URL</label>
            <input
              type="url"
              value={properties.href || ''}
              onChange={(e) => updateProperty('href', e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
            />
          </div>
        )}

        {/* Image Source (for img tags) */}
        {componentTag === 'img' && (
          <div>
            <label className="block text-gray-300 text-sm mb-1">Image Source</label>
            <input
              type="url"
              value={properties.src || ''}
              onChange={(e) => updateProperty('src', e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
            />
          </div>
        )}

        {/* Alt Text (for img tags) */}
        {componentTag === 'img' && (
          <div>
            <label className="block text-gray-300 text-sm mb-1">Alt Text</label>
            <input
              type="text"
              value={properties.alt || ''}
              onChange={(e) => updateProperty('alt', e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
            />
          </div>
        )}

        {/* Button Type (for button tags) */}
        {componentTag === 'button' && (
          <div>
            <label className="block text-gray-300 text-sm mb-1">Button Type</label>
            <select
              value={properties.type || 'button'}
              onChange={(e) => updateProperty('type', e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
            >
              <option value="button">Button</option>
              <option value="submit">Submit</option>
              <option value="reset">Reset</option>
            </select>
          </div>
        )}

        {/* Form Action (for form tags) */}
        {componentTag === 'form' && (
          <div>
            <label className="block text-gray-300 text-sm mb-1">Form Action</label>
            <input
              type="url"
              value={properties.action || ''}
              onChange={(e) => updateProperty('action', e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
            />
          </div>
        )}

        {/* Form Method (for form tags) */}
        {componentTag === 'form' && (
          <div>
            <label className="block text-gray-300 text-sm mb-1">Form Method</label>
            <select
              value={properties.method || 'post'}
              onChange={(e) => updateProperty('method', e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
            >
              <option value="get">GET</option>
              <option value="post">POST</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};








