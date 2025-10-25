'use client';

import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiGet } from '../../../lib/apiConfig';

export default function TestVisitorTracking() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`${API_ENDPOINTS.WEBSITES}/public/all`);
      if (response.success) {
        setWebsites(response.data);
      }
    } catch (error) {
      console.error('Error loading websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const visitWebsite = (slug: string) => {
    // Open website in new tab - this will automatically track the visit
    window.open(`/sites/${slug}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading websites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Visitor Tracking</h1>
        
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">How to Test Visitor Tracking:</h2>
          <ol className="text-white space-y-2">
            <li>1. Click on any website below to visit it</li>
            <li>2. Each visit will be automatically tracked</li>
            <li>3. Open multiple tabs to simulate different visitors</li>
            <li>4. Check the analytics in your user dashboard</li>
            <li>5. In development mode, each visit gets a random IP to simulate different users</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <div key={website.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">{website.title}</h3>
              <p className="text-gray-400 mb-4">Slug: {website.slug}</p>
              <p className="text-gray-300 text-sm mb-4">
                {website.is_published ? '✅ Published' : '❌ Not Published'}
              </p>
              
              {website.is_published ? (
                <button
                  onClick={() => visitWebsite(website.slug)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Visit Website
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-600 text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                >
                  Not Published
                </button>
              )}
            </div>
          ))}
        </div>

        {websites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No published websites found</p>
            <p className="text-gray-500 text-sm mt-2">
              Create and publish a website first to test visitor tracking
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


