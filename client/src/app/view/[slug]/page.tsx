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
  
  // Add smooth scrolling for anchor links
  useEffect(() => {
    if (!htmlContent) return;
    
    // Add smooth scrolling CSS and ensure inline styles are preserved
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
      [id] {
        scroll-margin-top: 20px;
      }
      /* Default link styles - ONLY apply to links without color/text-decoration in style */
      /* Links with inline styles will preserve their custom styles */
      a[href]:not([data-gjs-type="link-button"]):not(.link-button):not([style*="color"]):not([style*="text-decoration"]):not([style*="textDecoration"]) {
        color: #2563eb;
        text-decoration: underline;
      }
      a[href]:not([data-gjs-type="link-button"]):not(.link-button):not([style*="color"]):hover {
        color: #1d4ed8;
      }
      /* Text link specific styles - only if no color/text-decoration in style */
      .text-link:not([style*="color"]), 
      a[data-gjs-type="text-link"]:not([style*="color"]) {
        color: #2563eb;
        cursor: pointer;
      }
      .text-link:not([style*="text-decoration"]):not([style*="textDecoration"]), 
      a[data-gjs-type="text-link"]:not([style*="text-decoration"]):not([style*="textDecoration"]) {
        text-decoration: underline;
      }
      .text-link:not([style*="color"]):hover, 
      a[data-gjs-type="text-link"]:not([style*="color"]):hover {
        color: #1d4ed8;
      }
      /* CRITICAL: Inline styles have highest specificity (1,0,0,0) and will always override */
      /* Links with inline color or text-decoration will use those values */
      a[style*="color"] {
        /* Inline color will override any CSS color rules */
      }
      a[style*="text-decoration"], a[style*="textDecoration"] {
        /* Inline text-decoration will override any CSS text-decoration rules */
      }
    `;
    document.head.appendChild(style);
    
    // Handle anchor link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement;
      if (link && link.hash) {
        e.preventDefault();
        const targetId = link.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          // Update URL without triggering scroll
          if (history.pushState) {
            history.pushState(null, '', link.hash);
          }
        }
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.head.removeChild(style);
    };
  }, [htmlContent]);
  
  return (
    <div className="min-h-screen bg-white">
      {cssContent && <style dangerouslySetInnerHTML={{ __html: cssContent }} />}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}



