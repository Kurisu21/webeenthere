'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS, apiGet } from '../../../lib/apiConfig';

export default function PublicWebsiteViewer() {
  const params = useParams();
  const slug = params.slug as string;
  const [website, setWebsite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWebsite = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`${API_ENDPOINTS.WEBSITES}/public/${slug}`);
        
        if (response.success) {
          setWebsite(response.data);
        } else {
          setError(response.message || 'Website not found');
        }
      } catch (error) {
        console.error('Error loading website:', error);
        setError('Failed to load website');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadWebsite();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading website...</p>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Website Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || 'The website you are looking for does not exist or is not published.'}
          </p>
          <a 
            href="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Handle both formats: separate css_content OR inline styles in html_content
  const cssContent = website.css_content || '';
  const htmlContent = website.html_content || '';
  
  return (
    <div className="min-h-screen bg-white">
      {cssContent && <style dangerouslySetInnerHTML={{ __html: cssContent }} />}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}



