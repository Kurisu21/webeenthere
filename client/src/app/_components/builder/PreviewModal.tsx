'use client';

import React from 'react';
import { Element, elementFactory } from './elements';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: Element[];
  pageBackground: {
    type: 'color' | 'gradient';
    color: string;
    gradient: string;
  };
  viewMode: 'desktop' | 'tablet' | 'mobile';
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  elements,
  pageBackground,
  viewMode
}) => {
  if (!isOpen) return null;

  const getCanvasDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
      default:
        return { width: 1200, height: 800 };
    }
  };

  const { width, height } = getCanvasDimensions();

  const getBackgroundStyle = () => {
    if (pageBackground.type === 'gradient') {
      return {
        background: pageBackground.gradient
      };
    }
    return {
      backgroundColor: pageBackground.color
    };
  };

  const generatePreviewHTML = () => {
    const elementsHTML = elements.map(element => {
      const ElementRenderer = elementFactory.getRenderer(element.type);
      if (!ElementRenderer) return '';

      // Create a temporary div to render the element
      const tempDiv = document.createElement('div');
      // This is a simplified version - in a real implementation, you'd need to properly render React components
      return `
        <div 
          class="element-${element.id}"
          style="
            position: absolute;
            left: ${element.position.x}px;
            top: ${element.position.y}px;
            width: ${element.size.width}px;
            height: ${element.size.height}px;
            color: ${element.styles.color || '#333333'};
            font-size: ${element.styles.fontSize || '16px'};
            font-weight: ${element.styles.fontWeight || 'normal'};
            background: ${element.styles.backgroundColor || 'transparent'};
            background-image: ${element.styles.backgroundImage || 'none'};
            background-size: ${element.styles.backgroundSize || 'cover'};
            background-position: ${element.styles.backgroundPosition || 'center'};
            padding: ${element.styles.padding || '0'};
            margin: ${element.styles.margin || '0'};
            text-align: ${element.styles.textAlign || 'left'};
            border-radius: ${element.styles.borderRadius || '0'};
            border: ${element.styles.border || 'none'};
            opacity: ${element.styles.opacity || '1'};
            box-shadow: ${element.styles.boxShadow || 'none'};
            transform: ${element.styles.transform || 'none'};
            transition: ${element.styles.transition || 'none'};
            z-index: ${element.styles.zIndex || 'auto'};
            overflow: ${element.styles.overflow || 'visible'};
            display: ${element.styles.display || 'block'};
            flex-direction: ${element.styles.flexDirection || 'row'};
            justify-content: ${element.styles.justifyContent || 'flex-start'};
            align-items: ${element.styles.alignItems || 'stretch'};
            gap: ${element.styles.gap || '0'};
            font-family: ${element.styles.fontFamily || 'inherit'};
            line-height: ${element.styles.lineHeight || 'normal'};
            letter-spacing: ${element.styles.letterSpacing || 'normal'};
            vertical-align: ${element.styles.verticalAlign || 'baseline'};
            background-repeat: ${element.styles.backgroundRepeat || 'repeat'};
            text-decoration: ${element.styles.textDecoration || 'none'};
            cursor: ${element.styles.cursor || 'default'};
          "
        >
          ${element.content}
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Website Preview</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow-x: hidden;
          }
          .preview-container {
            position: relative;
            width: ${width}px;
            height: ${height}px;
            margin: 0 auto;
            ${pageBackground.type === 'gradient' 
              ? `background: ${pageBackground.gradient};` 
              : `background-color: ${pageBackground.color};`
            }
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          ${elementsHTML}
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = () => {
    const html = generatePreviewHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website-preview.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    const html = generatePreviewHTML();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Website Preview - {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Download HTML
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
            >
              Open in New Tab
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-center min-h-full">
            <div
              className="bg-white shadow-2xl relative overflow-hidden"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                ...getBackgroundStyle()
              }}
            >
              {/* Elements */}
              {elements.map((element) => {
                const ElementRenderer = elementFactory.getRenderer(element.type);
                if (!ElementRenderer) {
                  return null;
                }

                return (
                  <ElementRenderer
                    key={element.id}
                    element={element}
                    isSelected={false}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    onMouseDown={() => {}}
                    onResizeStart={() => {}}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;




