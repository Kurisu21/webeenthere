'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { API_ENDPOINTS, apiGet, apiPut } from '../../../../lib/apiConfig';

// Dynamically import the new builder to avoid SSR issues
const BuilderLayout = dynamic(
  () => import('../../../_components/builder/BuilderLayout'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading Website Builder...</p>
        </div>
      </div>
    )
  }
);

export default function BuildWebsitePage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;
  
  const [websiteData, setWebsiteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load website data
  useEffect(() => {
    if (websiteId) {
      loadWebsiteData();
    }
  }, [websiteId]);

  const loadWebsiteData = async () => {
    try {
      setIsLoading(true);
      const response = await apiGet(`${API_ENDPOINTS.WEBSITES}/${websiteId}`);
      
      if (response.success) {
        setWebsiteData(response.data);
        
        // Try to parse existing HTML content as JSON layout
        let layout = null;
        if (response.data.html_content) {
          try {
            layout = JSON.parse(response.data.html_content);
          } catch (e) {
            // If parsing fails, create a default layout
            layout = {
              blocks: [],
              globalStyles: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#333333',
                backgroundColor: '#ffffff',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
              },
              settings: {
                title: response.data.title || 'My Website',
                slug: response.data.slug || 'my-website',
                description: 'A beautiful website created with WebBeenThere',
                keywords: 'website, builder, responsive'
              },
              version: '1.0.0'
            };
          }
        }
        
        setWebsiteData({ ...response.data, layout });
      } else {
        throw new Error(response.message || 'Failed to load website');
      }
    } catch (error) {
      console.error('Error loading website:', error);
      setError('Failed to load website data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (layout: any) => {
    try {
      const response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, {
        html_content: JSON.stringify(layout),
        title: layout.settings.title,
        slug: layout.settings.slug
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to save website');
      }
      
      console.log('Website saved successfully');
    } catch (error) {
      console.error('Error saving website:', error);
      throw error;
    }
  };

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/preview/${websiteData.slug}`, '_blank');
  };

  const handlePublish = async () => {
    try {
      // Convert layout to HTML and save
      const { convertLayoutToHTML } = await import('../../../_components/builder-v2/utils/jsonToHtml');
      const html = convertLayoutToHTML(websiteData.layout);
      
      const response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, {
        html_content: html,
        is_published: true
      });
      
      if (response.success) {
        alert('Website published successfully!');
        // Optionally redirect to published site
        window.open(`/sites/${websiteData.slug}`, '_blank');
      } else {
        throw new Error(response.message || 'Failed to publish website');
      }
    } catch (error) {
      console.error('Error publishing website:', error);
      alert('Failed to publish website. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading Website Builder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/user')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!websiteData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-white text-lg mb-4">Website not found</p>
          <button
            onClick={() => router.push('/user')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <BuilderLayout
        websiteId={websiteId}
        currentWebsite={websiteData}
      />
    </div>
  );
}







