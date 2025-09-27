'use client';

import React, { useState } from 'react';
import { ElementRendererProps } from '../base/ElementInterface';
import { BaseElement } from '../base/BaseElement';

export const VideoElement: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResizeStart
}) => {
  const [videoUrl, setVideoUrl] = useState(element.videoUrl || '');

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    onUpdate(element.id, { videoUrl: url });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleVideoUrlChange(url);
    }
  };

  return (
    <BaseElement
      element={element}
      isSelected={isSelected}
      onSelect={onSelect}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onMouseDown={onMouseDown}
      onResizeStart={onResizeStart}
    >
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-cover"
            style={{
              borderRadius: element.styles.borderRadius
            }}
          />
        ) : (
          <div className="text-center">
            {isSelected ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="Enter video URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="mt-2 text-xs text-gray-500">or</div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="mt-2 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Click to add video</p>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseElement>
  );
};

export default VideoElement;


