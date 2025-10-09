'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WebsiteStructure, WebsiteSection, DEFAULT_GLOBAL_STYLES, DEFAULT_WEBSITE_SETTINGS } from './types/WebsiteStructure';
import SectionManager from './components/SectionManager';
import WebsitePreview from './components/WebsitePreview';
import { WebsiteExporter } from './utils/websiteExport';
import { apiGet, apiPost, apiPut, API_ENDPOINTS } from '../../../lib/apiConfig';

const CarrdStyleBuilder: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const websiteId = params?.id as string;

  const [website, setWebsite] = useState<WebsiteStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'sections' | 'preview' | 'export'>('details');
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteSlug, setWebsiteSlug] = useState('');
  const [websiteDescription, setWebsiteDescription] = useState('');

  useEffect(() => {
    if (websiteId) {
      loadWebsite();
    } else {
      // New website
      setWebsite({
        id: '',
        title: '',
        slug: '',
        description: '',
        sections: [],
        globalStyles: DEFAULT_GLOBAL_STYLES,
        settings: DEFAULT_WEBSITE_SETTINGS,
        seo: {
          title: '',
          description: '',
          keywords: [],
          robots: 'index'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsLoading(false);
    }
  }, [websiteId]);

  const loadWebsite = async () => {
    try {
      setIsLoading(true);
      const response = await apiGet(`${API_ENDPOINTS.WEBSITES}/${websiteId}`);
      
      if (response.success) {
        const websiteData = response.data;
        
        // Try to parse as new JSON structure first
        try {
          const parsedData = JSON.parse(websiteData.html_content);
          if (parsedData.sections && Array.isArray(parsedData.sections)) {
            // New Carrd-style structure
            setWebsite({
              id: websiteData.id,
              title: websiteData.title,
              slug: websiteData.slug,
              description: parsedData.description || '',
              sections: parsedData.sections,
              globalStyles: parsedData.globalStyles || DEFAULT_GLOBAL_STYLES,
              settings: parsedData.settings || DEFAULT_WEBSITE_SETTINGS,
              seo: parsedData.seo || {
                title: websiteData.title,
                description: '',
                keywords: [],
                robots: 'index'
              },
              createdAt: websiteData.created_at,
              updatedAt: websiteData.updated_at
            });
          } else {
            throw new Error('Invalid structure');
          }
        } catch (parseError) {
          // Fallback to legacy structure - convert to new format
          console.log('Converting legacy website to new format...');
          setWebsite({
            id: websiteData.id,
            title: websiteData.title,
            slug: websiteData.slug,
            description: '',
            sections: [
              {
                id: 'legacy-content',
                type: 'hero',
                title: 'Website Content',
                content: websiteData.html_content || '<h1>Welcome</h1><p>Your website content</p>',
                styles: {
                  backgroundColor: '#ffffff',
                  textColor: '#333333',
                  padding: '40px 20px',
                  textAlign: 'center'
                },
                settings: {
                  isVisible: true,
                  isFullWidth: true
                },
                order: 0
              }
            ],
            globalStyles: DEFAULT_GLOBAL_STYLES,
            settings: DEFAULT_WEBSITE_SETTINGS,
            seo: {
              title: websiteData.title,
              description: '',
              keywords: [],
              robots: 'index'
            },
            createdAt: websiteData.created_at,
            updatedAt: websiteData.updated_at
          });
        }

        setWebsiteTitle(websiteData.title);
        setWebsiteSlug(websiteData.slug);
        setWebsiteDescription(websiteData.description || '');
        setCurrentStep('sections');
      } else {
        setError('Failed to load website');
      }
    } catch (error) {
      console.error('Error loading website:', error);
      setError('Failed to load website');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionsChange = (sections: WebsiteSection[]) => {
    if (website) {
      setWebsite({
        ...website,
        sections: sections,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleSave = async () => {
    if (!website) return;

    try {
      setIsSaving(true);
      
      const websiteData = {
        title: websiteTitle,
        slug: websiteSlug,
        description: websiteDescription,
        html_content: JSON.stringify({
          sections: website.sections,
          globalStyles: website.globalStyles,
          settings: website.settings,
          seo: website.seo,
          description: websiteDescription
        }),
        css_content: '', // CSS is now generated from the structure
        template_id: 'carrd-style'
      };

      let response;
      if (websiteId) {
        response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, websiteData);
      } else {
        response = await apiPost(API_ENDPOINTS.WEBSITES, websiteData);
      }

      if (response.success) {
        alert('Website saved successfully!');
        if (!websiteId) {
          router.push(`/user/build/${response.data.id}`);
        }
      } else {
        alert('Failed to save website');
      }
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Failed to save website');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = (format: 'html' | 'json') => {
    if (!website) return;
    
    try {
      WebsiteExporter.downloadWebsite(website, format);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export website');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading website...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/user/main')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">🏗️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Website Found</h2>
          <p className="text-gray-600 mb-4">The website you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/user/main')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="carrd-style-builder min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {websiteId ? 'Edit Website' : 'Create Website'}
            </h1>
            <p className="text-sm text-gray-500">
              {websiteId ? 'Modify your website sections and content' : 'Build your website with sections'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Website'}
            </button>
            <div className="relative">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Export ↓
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => handleExport('html')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export HTML
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'details', label: 'Details', icon: '📝' },
            { id: 'sections', label: 'Sections', icon: '🏗️' },
            { id: 'preview', label: 'Preview', icon: '👁️' },
            { id: 'export', label: 'Export', icon: '📤' }
          ].map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentStep === step.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{step.icon}</span>
              {step.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {currentStep === 'details' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Website Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website Title
                  </label>
                  <input
                    type="text"
                    value={websiteTitle}
                    onChange={(e) => setWebsiteTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter website title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website Slug
                  </label>
                  <input
                    type="text"
                    value={websiteSlug}
                    onChange={(e) => setWebsiteSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="website-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={websiteDescription}
                    onChange={(e) => setWebsiteDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter website description"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep('sections')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue to Sections
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'sections' && (
          <div className="max-w-4xl mx-auto">
            <SectionManager
              sections={website.sections}
              onSectionsChange={handleSectionsChange}
            />
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="max-w-6xl mx-auto">
            <WebsitePreview website={website} />
          </div>
        )}

        {currentStep === 'export' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Export Website</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">HTML Export</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Download a complete HTML file with embedded CSS. Perfect for hosting anywhere.
                  </p>
                  <button
                    onClick={() => handleExport('html')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Download HTML
                  </button>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">JSON Export</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Download the raw website data as JSON. Useful for backup or migration.
                  </p>
                  <button
                    onClick={() => handleExport('json')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Download JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarrdStyleBuilder;
