'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS, apiGet, apiCall } from '../../../lib/apiConfig';

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
        
        // Track the visit first
        await trackVisit(slug);
        
        // Then load the website
        const response = await apiGet(`${API_ENDPOINTS.WEBSITES}/public/${slug}`);
        
        if (response.success) {
          setWebsite(response.data);
        } else {
          // Show detailed error message if available
          const errorMsg = response.details 
            ? `${response.message}: ${response.details}` 
            : response.message || 'Website not found';
          setError(errorMsg);
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

  const trackVisit = async (websiteSlug: string) => {
    try {
      console.log('🔍 Tracking visit for slug:', websiteSlug);
      
      // Generate or retrieve visitor ID and session ID
      const visitorId = getOrCreateVisitorId();
      const sessionId = getOrCreateSessionId();
      
      // Get visitor information
      const visitorInfo = {
        slug: websiteSlug,
        visitorId: visitorId,
        sessionId: sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      console.log('📊 Sending visitor info:', visitorInfo);

      // Send tracking data to backend using apiCall
      const response = await apiCall('/api/analytics/track-visit', {
        method: 'POST',
        body: JSON.stringify(visitorInfo),
      });

      const result = await response.json();
      console.log('✅ Tracking response:', result);
      
      if (!response.ok) {
        console.error('❌ Tracking failed:', result);
      }
    } catch (error) {
      console.error('❌ Error tracking visit:', error);
      // Don't throw error - tracking failure shouldn't break the website
    }
  };

  // Helper functions for visitor and session tracking
  const getOrCreateVisitorId = () => {
    let visitorId = localStorage.getItem('webeenthere_visitor_id');
    if (!visitorId) {
      visitorId = generateUniqueId();
      localStorage.setItem('webeenthere_visitor_id', visitorId);
    }
    return visitorId;
  };

  const getOrCreateSessionId = () => {
    let sessionId = sessionStorage.getItem('webeenthere_session_id');
    if (!sessionId) {
      sessionId = generateUniqueId();
      sessionStorage.setItem('webeenthere_session_id', sessionId);
    }
    return sessionId;
  };

  const generateUniqueId = () => {
    return 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  };

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
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Website Not Found</h1>
          <p className="text-gray-400 mb-2">
            {error || 'The website you are looking for does not exist or is not published.'}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            This could mean:
            <br />• The website doesn't exist
            <br />• The website hasn't been published yet
            <br />• The URL might be incorrect
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Go Home
            </a>
            <a 
              href="/login" 
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Login to Create
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle both formats: separate css_content OR inline styles in html_content
  const cssContent = website.css_content || '';
  const htmlContent = website.html_content || '';
  
  // Debug logging
  console.log('Website data:', { 
    title: website.title,
    slug: website.slug,
    hasCssContent: !!cssContent,
    hasHtmlContent: !!htmlContent,
    cssContent: cssContent?.substring(0, 200), 
    htmlContent: htmlContent?.substring(0, 200),
    cssLength: cssContent?.length,
    htmlLength: htmlContent?.length
  });
  
  // Check if html_content is JSON (GrapesJS format)
  let extractedCss = cssContent;
  let extractedHtml = htmlContent;
  
  try {
    const parsed = JSON.parse(htmlContent);
    if (parsed.html && parsed.css) {
      // GrapesJS format: { html: '...', css: '...' }
      extractedCss = parsed.css || cssContent;
      extractedHtml = parsed.html;
      
      // Remove <body> wrapper if present
      extractedHtml = extractedHtml.replace(/<body[^>]*>|<\/body>/gi, '');
      
      console.log('Parsed as GrapesJS JSON format');
    }
  } catch (e) {
    // Not JSON, use as-is
    console.log('Not JSON format');
  }
  
  // Check if HTML contains style tags
  if (extractedHtml && extractedHtml.includes('<style>')) {
    const styleMatch = extractedHtml.match(/<style[^>]*>(.*?)<\/style>/s);
    if (styleMatch) {
      extractedCss = styleMatch[1] + (extractedCss ? '\n' + extractedCss : '');
      extractedHtml = extractedHtml.replace(/<style[^>]*>.*?<\/style>/s, '');
    }
  }
  
  // Always merge database css_content with any extracted CSS from JSON/inline
  const combinedCss = [extractedCss, cssContent]
    .filter(Boolean)
    .join('\n');

  // Render in an iframe to isolate from app styles for accurate rendering
  const srcDoc = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css" rel="stylesheet" />
      <style>
        html, body { margin: 0; padding: 0; background: #ffffff; color: #111827; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; }
        ${combinedCss}
      </style>
    </head>
    <body>
      ${extractedHtml || ''}
    </body>
  </html>`;

  return (
    <iframe
      title={website.title || 'Website Preview'}
      srcDoc={srcDoc}
      className="w-full min-h-screen border-0"
      style={{ display: 'block' }}
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
    />
  );
}
