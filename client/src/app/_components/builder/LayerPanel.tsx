'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const expandedNodesRef = useRef<Set<string>>(new Set());
  const hasInitializedRef = useRef<boolean>(false);
  const isUpdatingRef = useRef<boolean>(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Build layer tree from GrapesJS components - memoized to prevent unnecessary recreations
  const buildLayerTree = useCallback((component: any, autoExpand: boolean = false, currentExpandedNodes?: Set<string>): LayerNode[] => {
    if (!component) return [];
    
    // Use provided expanded nodes or ref to avoid closure issues
    const expandedSet = currentExpandedNodes || expandedNodesRef.current;
    
    const children = component.components ? component.components().models || [] : [];
    const childNodes = children.map((child: any) => {
      const childCid = child.cid;
      // Auto-expand all nodes by default on first load only
      if (autoExpand && !expandedNodesRef.current.has(childCid)) {
        expandedNodesRef.current.add(childCid);
      }
      const childChildren = buildLayerTree(child, autoExpand, expandedSet);
      return {
        component: child,
        children: childChildren,
        isExpanded: expandedSet.has(childCid) || (autoExpand && !hasInitializedRef.current),
      };
    });

    return childNodes;
  }, []);

  // Update layers when components change
  useEffect(() => {
    if (!editor) return;

    const updateLayers = () => {
      const root = editor.getWrapper();
      if (root) {
        // Auto-expand all nodes on first load only
        const shouldAutoExpand = !hasInitializedRef.current;
        // Use ref for expanded nodes to avoid closure issues
        const tree = buildLayerTree(root, shouldAutoExpand, expandedNodesRef.current);
        setLayers(tree);
        
        // Update expanded nodes state only on first load
        if (shouldAutoExpand) {
          setExpandedNodes(new Set(expandedNodesRef.current));
          hasInitializedRef.current = true;
        }
      }
    };

    const handleComponentAdd = () => {
      // Debounce to prevent rapid-fire updates
      requestAnimationFrame(() => {
        updateLayers();
      });
    };

    const handleComponentRemove = () => {
      // Debounce to prevent rapid-fire updates
      requestAnimationFrame(() => {
        updateLayers();
      });
    };

    const handleComponentUpdate = () => {
      // Skip if already updating
      if (isUpdatingRef.current) return;
      
      // Clear any pending timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Debounce with a longer delay to prevent rapid-fire updates
      updateTimeoutRef.current = setTimeout(() => {
        if (isUpdatingRef.current) return;
        isUpdatingRef.current = true;
        
        try {
          const root = editor.getWrapper();
          if (root) {
            // Use ref for expanded nodes to avoid closure issues
            const tree = buildLayerTree(root, false, expandedNodesRef.current);
            // Only update if tree structure actually changed
            setLayers((prevLayers) => {
              // Simple check - if component count changed, update
              const prevCount = prevLayers.reduce((count, node) => {
                const countChildren = (n: LayerNode): number => {
                  return 1 + n.children.reduce((sum, child) => sum + countChildren(child), 0);
                };
                return count + countChildren(node);
              }, 0);
              
              const newCount = tree.reduce((count, node) => {
                const countChildren = (n: LayerNode): number => {
                  return 1 + n.children.reduce((sum, child) => sum + countChildren(child), 0);
                };
                return count + countChildren(node);
              }, 0);
              
              // Only update if count changed (new component added/removed)
              if (prevCount !== newCount) {
                return tree;
              }
              return prevLayers;
            });
          }
        } finally {
          // Reset flag after a short delay
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 200);
        }
      }, 300); // 300ms debounce
    };

    const handleComponentSelected = (component: any) => {
      setSelectedComponent(component);
    };

    editor.on('component:add', handleComponentAdd);
    editor.on('component:remove', handleComponentRemove);
    // Don't listen to component:update - it fires too frequently and causes infinite loops
    // Only update on structural changes (add/remove)
    // editor.on('component:update', handleComponentUpdate);
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
      // editor.off('component:update', handleComponentUpdate);
      editor.off('component:selected', handleComponentSelected);
      isUpdatingRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [editor, buildLayerTree]); // Added buildLayerTree to dependencies since it's now memoized

  const toggleNode = (cid: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cid)) {
        newSet.delete(cid);
        expandedNodesRef.current.delete(cid);
      } else {
        newSet.add(cid);
        expandedNodesRef.current.add(cid);
      }
      return newSet;
    });
  };

  const closeAllNodes = () => {
    setExpandedNodes(new Set());
    expandedNodesRef.current.clear();
  };

  const expandAllNodes = useCallback(() => {
    // Get current layers from state using a function to avoid dependency
    setLayers((currentLayers) => {
      const collectAllCids = (nodes: LayerNode[]): Set<string> => {
        const cids = new Set<string>();
        nodes.forEach(node => {
          if (node.children.length > 0) {
            cids.add(node.component.cid);
            const childCids = collectAllCids(node.children);
            childCids.forEach(cid => cids.add(cid));
          }
        });
        return cids;
      };
      
      const allCids = collectAllCids(currentLayers);
      setExpandedNodes(allCids);
      expandedNodesRef.current = new Set(allCids);
      return currentLayers; // Don't change layers, just update expanded state
    });
  }, []);

  const selectComponent = (component: any) => {
    if (editor) {
      editor.select(component);
      component.trigger('active');
      
      // Scroll to component in canvas
      try {
        const view = component.getView();
        if (view && view.el) {
          const canvas = editor.Canvas;
          const frame = canvas?.getFrameEl?.();
          if (frame && frame.contentDocument) {
            const element = view.el;
            if (element) {
              // Scroll element into view
              element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              
              // Also try to scroll the iframe itself
              const frameRect = frame.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              const frameDoc = frame.contentDocument;
              const frameWindow = frameDoc.defaultView || frameDoc.parentWindow;
              
              if (frameWindow) {
                const scrollX = elementRect.left - frameRect.width / 2;
                const scrollY = elementRect.top - frameRect.height / 2;
                frameWindow.scrollTo({
                  left: scrollX,
                  top: scrollY,
                  behavior: 'smooth'
                });
              }
            }
          }
        }
      } catch (error) {
        console.warn('Could not scroll to component:', error);
      }
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
        <>
          <div className="layer-panel-actions">
            <button
              type="button"
              onClick={expandAllNodes}
              className="layer-action-btn"
              title="Expand All"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Expand All</span>
            </button>
            <button
              type="button"
              onClick={closeAllNodes}
              className="layer-action-btn"
              title="Close All"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>Close All</span>
            </button>
          </div>
          <div className="layer-list">
            {layers.map((node) => renderLayerNode(node))}
          </div>
        </>
      )}
    </div>
  );
};

