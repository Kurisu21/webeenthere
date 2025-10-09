'use client';

import React, { useState, useRef } from 'react';

export const AssetPanel: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      // Handle file upload logic here
      console.log('Files to upload:', files);
      // You would typically upload to your server here
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const stockImages = [
    { id: 1, url: 'https://via.placeholder.com/300x200', name: 'Placeholder 1' },
    { id: 2, url: 'https://via.placeholder.com/300x200', name: 'Placeholder 2' },
    { id: 3, url: 'https://via.placeholder.com/300x200', name: 'Placeholder 3' },
    { id: 4, url: 'https://via.placeholder.com/300x200', name: 'Placeholder 4' },
  ];

  return (
    <div className="p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Assets
      </h3>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-600 rounded-lg p-4 mb-4 hover:border-gray-500 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-400 text-sm">
            {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
        </div>
      </div>

      {/* Stock Images */}
      <div>
        <h4 className="text-gray-300 text-sm font-medium mb-2">Stock Images</h4>
        <div className="grid grid-cols-2 gap-2">
          {stockImages.map(image => (
            <div
              key={image.id}
              className="relative group cursor-pointer"
              onClick={() => {
                // Add image to editor
                console.log('Adding image:', image.url);
              }}
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-20 object-cover rounded"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Icons */}
      <div className="mt-4">
        <h4 className="text-gray-300 text-sm font-medium mb-2">Icons</h4>
        <div className="grid grid-cols-4 gap-2">
          {['home', 'user', 'mail', 'phone', 'star', 'heart', 'share', 'search'].map(icon => (
            <button
              key={icon}
              className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
              onClick={() => {
                // Add icon to editor
                console.log('Adding icon:', icon);
              }}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


