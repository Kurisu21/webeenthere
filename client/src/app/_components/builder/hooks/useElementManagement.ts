import { useState, useCallback } from 'react';
import { Element, elementFactory } from '../elements';

export const useElementManagement = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const addElement = useCallback((type: string, setElements: (elements: Element[]) => void, setSelectedElement: (element: Element) => void) => {
    const newElement = elementFactory.create(type);
    setElements(prev => {
      newElement.position = { x: 50, y: prev.length * 100 + 50 };
      return [...prev, newElement];
    });
    setSelectedElement(newElement);
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<Element>, elements: Element[], setElements: (elements: Element[]) => void, selectedElement: Element | null, setSelectedElement: (element: Element | null) => void) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
    if (selectedElement?.id === id) {
      setSelectedElement(selectedElement ? { ...selectedElement, ...updates } : null);
    }
  }, []);

  const deleteElement = useCallback((id: string, elements: Element[], setElements: (elements: Element[]) => void, selectedElement: Element | null, setSelectedElement: (element: Element | null) => void) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  }, []);

  const duplicateElement = useCallback((id: string, elements: Element[], setElements: (elements: Element[]) => void, setSelectedElement: (element: Element) => void) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (elementToDuplicate) {
      const duplicatedElement = {
        ...elementToDuplicate,
        id: `${elementToDuplicate.id}-copy-${Date.now()}`,
        position: {
          x: elementToDuplicate.position.x + 20,
          y: elementToDuplicate.position.y + 20
        }
      };
      setElements(prev => [...prev, duplicatedElement]);
      setSelectedElement(duplicatedElement);
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, element: Element, canvasRef: React.RefObject<HTMLDivElement | null>, setSelectedElement: (element: Element) => void) => {
    if (isResizing) return;
    
    e.stopPropagation();
    console.log('Mouse down on element:', element.id);
    setSelectedElement(element);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - element.position.x,
        y: e.clientY - rect.top - element.position.y
      });
    }
  }, [isResizing]);

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string, selectedElement: Element | null) => {
    e.stopPropagation();
    if (!selectedElement) return;
    
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: selectedElement.size.width,
      height: selectedElement.size.height
    });
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent, selectedElement: Element | null, canvasRef: React.RefObject<HTMLDivElement | null>, updateElement: (id: string, updates: Partial<Element>) => void) => {
    if (isResizing && selectedElement && resizeHandle) {
      const deltaX = event.clientX - resizeStart.x;
      const deltaY = event.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      if (resizeHandle.includes('e')) newWidth += deltaX;
      if (resizeHandle.includes('w')) newWidth -= deltaX;
      if (resizeHandle.includes('s')) newHeight += deltaY;
      if (resizeHandle.includes('n')) newHeight -= deltaY;
      
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(30, newHeight);
      
      updateElement(selectedElement.id, {
        size: { width: newWidth, height: newHeight }
      });
    } else if (isDragging && selectedElement && canvasRef.current) {
      console.log('Dragging element:', selectedElement.id, 'isDragging:', isDragging);
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = event.clientX - rect.left - dragOffset.x;
      const newY = event.clientY - rect.top - dragOffset.y;
      
      updateElement(selectedElement.id, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) }
      });
    }
  }, [isDragging, isResizing, dragOffset, resizeHandle, resizeStart]);

  const handleMouseUp = useCallback(() => {
    console.log('Mouse up - stopping drag');
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  const handleElementClick = useCallback((element: Element, event: React.MouseEvent, setSelectedElement: (element: Element) => void) => {
    event.stopPropagation();
    setSelectedElement(element);
  }, []);

  const handleCanvasClick = useCallback((setSelectedElement: (element: Element | null) => void) => {
    setSelectedElement(null);
  }, []);

  return {
    // State
    isDragging,
    dragOffset,
    isResizing,
    resizeHandle,
    resizeStart,
    
    // Actions
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    
    // Event Handlers
    handleMouseDown,
    handleResizeStart,
    handleMouseMove,
    handleMouseUp,
    handleElementClick,
    handleCanvasClick
  };
};
