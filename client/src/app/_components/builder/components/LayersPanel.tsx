'use client';

import React, { useEffect, useState } from 'react';

interface LayersPanelProps {
  editor: any;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ editor }) => {
  const [layers, setLayers] = useState<any[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<any>(null);

  useEffect(() => {
    if (!editor) return;

    const updateLayers = () => {
      const components = editor.getComponents();
      const layerList: any[] = [];

      const processComponent = (component: any, depth = 0) => {
        const layer = {
          id: component.getId(),
          name: component.get('tagName') || component.get('type') || 'Component',
          component: component,
          depth,
          visible: component.get('style')?.display !== 'none',
          locked: component.get('locked') || false
        };
        
        layerList.push(layer);

        // Process children
        const children = component.get('components');
        if (children && children.length > 0) {
          children.forEach((child: any) => {
            processComponent(child, depth + 1);
          });
        }
      };

      components.forEach((component: any) => {
        processComponent(component);
      });

      setLayers(layerList);
    };

    const handleComponentUpdate = () => {
      updateLayers();
    };

    const handleComponentSelect = (component: any) => {
      setSelectedLayer(component);
    };

    const handleComponentDeselect = () => {
      setSelectedLayer(null);
    };

    // Initial update
    updateLayers();

    // Listen for changes
    editor.on('component:add', handleComponentUpdate);
    editor.on('component:remove', handleComponentUpdate);
    editor.on('component:update', handleComponentUpdate);
    editor.on('component:selected', handleComponentSelect);
    editor.on('component:deselected', handleComponentDeselect);

    return () => {
      editor.off('component:add', handleComponentUpdate);
      editor.off('component:remove', handleComponentUpdate);
      editor.off('component:update', handleComponentUpdate);
      editor.off('component:selected', handleComponentSelect);
      editor.off('component:deselected', handleComponentDeselect);
    };
  }, [editor]);

  const toggleVisibility = (layer: any) => {
    const component = layer.component;
    const currentStyle = component.get('style') || {};
    
    if (layer.visible) {
      component.addStyle({ display: 'none' });
    } else {
      component.removeStyle('display');
    }
    
    // Update layers list
    setLayers(prev => prev.map(l => 
      l.id === layer.id ? { ...l, visible: !layer.visible } : l
    ));
  };

  const toggleLock = (layer: any) => {
    const component = layer.component;
    component.set('locked', !layer.locked);
    
    // Update layers list
    setLayers(prev => prev.map(l => 
      l.id === layer.id ? { ...l, locked: !layer.locked } : l
    ));
  };

  const selectLayer = (layer: any) => {
    editor.select(layer.component);
    setSelectedLayer(layer.component);
  };

  const deleteLayer = (layer: any) => {
    if (confirm('Are you sure you want to delete this component?')) {
      layer.component.remove();
    }
  };

  const duplicateLayer = (layer: any) => {
    const component = layer.component;
    const newComponent = component.clone();
    component.parent().append(newComponent);
    editor.select(newComponent);
  };

  return (
    <div className="p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Layers
      </h3>

      {layers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">No components in the canvas</div>
        </div>
      ) : (
        <div className="space-y-1">
          {layers.map(layer => (
            <div
              key={layer.id}
              className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                selectedLayer?.getId() === layer.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              style={{ paddingLeft: `${layer.depth * 12 + 8}px` }}
              onClick={() => selectLayer(layer)}
            >
              {/* Visibility Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(layer);
                }}
                className="mr-2 text-sm"
              >
                {layer.visible ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )}
              </button>

              {/* Lock Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(layer);
                }}
                className="mr-2 text-sm"
              >
                {layer.locked ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* Layer Name */}
              <div className="flex-1 text-sm font-medium truncate">
                {layer.name}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateLayer(layer);
                  }}
                  className="p-1 hover:bg-gray-600 rounded text-xs"
                  title="Duplicate"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayer(layer);
                  }}
                  className="p-1 hover:bg-red-600 rounded text-xs"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};








