'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../lib/apiConfig';

interface WebsitePreviewImageProps {
  websiteId: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const WebsitePreviewImage: React.FC<WebsitePreviewImageProps> = ({
  websiteId,
  alt = 'Website preview',
  className = '',
  style = {}
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        // Get auth token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const headers: HeadersInit = {
          'Content-Type': 'image/png',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/websites/preview/${websiteId}`, {
          headers,
        });

        if (!response.ok) {
          setError(true);
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (err) {
        console.error('Error fetching preview:', err);
        setError(true);
      }
    };

    if (websiteId) {
      fetchPreview();
    }

    // Cleanup blob URL on unmount
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [websiteId]);

  if (error || !imageUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={style}>
        <div className="text-center">
          <svg className="w-8 h-8 text-secondary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xs text-secondary">Preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      <img
        src={imageUrl}
        alt={alt}
        className={`${className}`}
        style={{ 
          ...style, 
          maxWidth: '100%', 
          maxHeight: '100%', 
          width: 'auto', 
          height: 'auto',
          objectFit: style.objectFit || 'contain'
        }}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

