'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { InlineEditor, EditableNode } from '../../utils/inlineEditor';

const InlineEditableWebsite: React.FC<ElementRendererProps> = ({ element }) => {
  const [editableNodes, setEditableNodes] = useState<EditableNode[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [updatedHTML, setUpdatedHTML] = useState<string>(element.content);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (element.content) {
      const nodes = InlineEditor.parseHTMLToEditableNodes(element.content);
      setEditableNodes(nodes);
      setUpdatedHTML(element.content);
    }
  }, [element.content]);

  const handleNodeClick = (nodeId: string) => {
    if (isEditing) {
      setSelectedNode(nodeId);
    }
  };

  const handleNodeHover = (nodeId: string) => {
    if (isEditing) {
      setHoveredNode(nodeId);
    }
  };

  const handleContentChange = (nodeId: string, newContent: string) => {
    const updatedNodes = InlineEditor.updateNodeContent(editableNodes, nodeId, newContent);
    setEditableNodes(updatedNodes);
    
    // Update the HTML content
    const newHTML = InlineEditor.generateHTMLFromNodes(updatedNodes);
    setUpdatedHTML(newHTML);
  };

  const handleSaveChanges = () => {
    // Update the element content with the new HTML
    const updatedElement = {
      ...element,
      content: updatedHTML
    };
    
    // You would typically call a callback here to update the parent element
    console.log('Saving updated HTML:', updatedHTML);
    
    // Close editing mode
    setIsEditing(false);
    setSelectedNode(null);
  };

  return (
    <div 
      ref={containerRef}
      className="inline-editable-website"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'auto',
        ...element.styles
      }}
    >
      {/* CSS Content */}
      {(element as any).cssContent && (
        <style dangerouslySetInnerHTML={{ __html: (element as any).cssContent }} />
      )}

      {/* Editing Controls */}
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          display: 'flex',
          gap: '10px'
        }}
      >
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            padding: '8px 16px',
            backgroundColor: isEditing ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {isEditing ? 'Exit Edit' : 'Edit Content'}
        </button>
        
        {isEditing && (
          <button
            onClick={handleSaveChanges}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Website Content */}
      <div 
        dangerouslySetInnerHTML={{ __html: updatedHTML }}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '600px'
        }}
      />

      {/* Inline Editor Modal */}
      {isEditing && selectedNode && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 2000,
            minWidth: '300px'
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Edit Content</h3>
          
          {(() => {
            const node = editableNodes.find(n => n.id === selectedNode);
            if (!node) return null;

            return (
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                  Content:
                </label>
                <textarea
                  value={node.content}
                  onChange={(e) => handleContentChange(node.id, e.target.value)}
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setSelectedNode(null)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setSelectedNode(null)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default InlineEditableWebsite;