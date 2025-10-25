'use client';

import React, { useState } from 'react';
import { apiCall, apiGet } from '../../lib/apiConfig';

export default function DebugVisitorTracking() {
  const [slug, setSlug] = useState('john-portfolio');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testVisit = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/api/analytics/test-visit', {
        method: 'POST',
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const checkWebsites = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/analytics/debug/websites');
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const checkDbStructure = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/analytics/debug/db-structure');
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const visitWebsite = () => {
    window.open(`/sites/${slug}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Debug Visitor Tracking</h1>
        
        <div className="space-y-6">
          {/* Check Websites */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">1. Check Available Websites</h2>
            <button
              onClick={checkWebsites}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Check Websites'}
            </button>
          </div>

          {/* Check Database Structure */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">2. Check Database Structure</h2>
            <button
              onClick={checkDbStructure}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Check DB Structure'}
            </button>
          </div>

          {/* Test Visit */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">3. Test Manual Visit Insert</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Website slug"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
              />
              <button
                onClick={testVisit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Visit'}
              </button>
            </div>
          </div>

          {/* Visit Website */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">4. Visit Website (Auto Tracking)</h2>
            <button
              onClick={visitWebsite}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Visit /sites/{slug}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
