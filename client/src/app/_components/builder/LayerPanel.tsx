'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Editor } from 'grapesjs';
import './LayerPanel.css';

interface LayerPanelProps {
  editor: Editor | null;
  isDark?: boolean;
}

interface LayerNode {
  component: any;
  children: LayerNode[];
  isExpanded: boolean;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  editor,
  isDark = true,
}) => {
  const [layers, setLayers] = useState<LayerNode[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build layer tree from GrapesJS components
  const buildLayerTree = (component: any): LayerNode[] => {
    if (!component) return [];
    
    const children = component.components ? component.components().models || [] : [];
    const childNodes = children.map((child: any) => {
      const childChildren = buildLayerTree(child);
      return {
        component: child,
        children: childChildren,
        isExpanded: expandedNodes.has(child.cid),
      };
    });

    return childNodes;
  };

  // Update layers when components change
  useEffect(() => {
    if (!editor) return;

    const updateLayers = () => {
      const root = editor.getWrapper();
      if (root) {
        const tree = buildLayerTree(root);
        setLayers(tree);
      }
    };

    const handleComponentAdd = () => {
      updateLayers();
    };

    const handleComponentRemove = () => {
      updateLayers();
    };

    const handleComponentUpdate = () => {
      updateLayers();
    };

    const handleComponentSelected = (component: any) => {
      setSelectedComponent(component);
    };

    editor.on('component:add', handleComponentAdd);
    editor.on('component:remove', handleComponentRemove);
    editor.on('component:update', handleComponentUpdate);
    editor.on('component:selected', handleComponentSelected);

    // Initial load
    updateLayers();
    const initial = editor.getSelected();
    if (initial) {
      setSelectedComponent(initial);
    }

    return () => {
      editor.off('component:add', handleComponentAdd);
      editor.off('component:remove', handleComponentRemove);
      editor.off('component:update', handleComponentUpdate);
      editor.off('component:selected', handleComponentSelected);
    };
  }, [editor, expandedNodes]);

  const toggleNode = (cid: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cid)) {
        newSet.delete(cid);
      } else {
        newSet.add(cid);
      }
      return newSet;
    });
  };

  const selectComponent = (component: any) => {
    if (editor) {
      editor.select(component);
      component.trigger('active');
    }
  };

  const getComponentIcon = (component: any) => {
    const tagName = component.get('tagName')?.toLowerCase() || '';
    const type = component.get('type') || '';
    
    if (tagName === 'a' || component.get('href')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    }
    
    if (tagName === 'svg' || type === 'svg') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      );
    }
    
    if (tagName === 'p' || tagName === 'span' || tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || tagName === 'h5' || tagName === 'h6' || type === 'text') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      );
    }
    
    if (tagName === 'div' || tagName === 'section' || tagName === 'header' || tagName === 'footer' || tagName === 'main') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    }
    
    // Default icon
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    );
  };

  const getComponentLabel = (component: any): string => {
    const tagName = component.get('tagName') || '';
    const type = component.get('type') || '';
    const content = component.get('content') || '';
    const attributes = component.getAttributes();
    const href = attributes?.href || '';
    const text = content.replace(/<[^>]*>/g, '').trim().substring(0, 30) || '';
    
    if (tagName === 'a' || href) {
      const linkText = text || href || 'Link';
      return `a | ${linkText}`;
    }
    
    if (tagName === 'p' || type === 'text') {
      return `T p | ${text || 'Text'}`;
    }
    
    if (tagName === 'svg') {
      return 'svg';
    }
    
    if (tagName === 'div' || tagName === 'section') {
      const className = component.getClasses().join(' ') || '';
      return className || tagName;
    }
    
    return tagName || type || 'Element';
  };

  const renderLayerNode = (node: LayerNode, depth: number = 0): React.ReactNode => {
    const component = node.component;
    const cid = component.cid;
    const isExpanded = expandedNodes.has(cid);
    const isSelected = selectedComponent?.cid === cid;
    const hasChildren = node.children.length > 0;
    const indent = depth * 16;

    return (
      <div key={cid}>
        <div
          className={`layer-item ${isSelected ? 'layer-item-selected' : ''}`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => selectComponent(component)}
        >
          <div className="layer-item-content">
            {hasChildren && (
              <button
                type="button"
                className="layer-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(cid);
                }}
              >
                <svg
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {!hasChildren && <div className="layer-toggle-placeholder" />}
            <div className="layer-icon">
              {getComponentIcon(component)}
            </div>
            <span className="layer-label">{getComponentLabel(component)}</span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="layer-children">
            {node.children.map((child) => renderLayerNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`layer-panel ${isDark ? 'dark' : 'light'}`}>
      {layers.length === 0 ? (
        <div className="layer-panel-empty">
          <p className="text-sm text-gray-400">No layers yet</p>
        </div>
      ) : (
        <div className="layer-list">
          {layers.map((node) => renderLayerNode(node))}
        </div>
      )}
    </div>
  );
};

