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
  
  return (
    <div className="min-h-screen bg-white" style={{ margin: 0, padding: 0 }}>
      {extractedCss && <style dangerouslySetInnerHTML={{ __html: extractedCss }} />}
      <div dangerouslySetInnerHTML={{ __html: extractedHtml }} style={{ margin: 0, padding: 0 }} />
    </div>
  );
}
