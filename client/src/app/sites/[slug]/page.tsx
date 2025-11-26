'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS, apiGet, apiCall, API_BASE_URL } from '../../../lib/apiConfig';

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

  // Normalize image URLs in HTML to work in public view
  // Convert absolute API URLs to use the correct API base URL for the current environment
  const normalizeImageUrls = (html: string): string => {
    if (!html) return html;
    
    let normalizedHtml = html;
    
    // Helper function to normalize a single URL
    const normalizeUrl = (url: string): string => {
      if (!url) return url;
      
      // If already a full URL with correct API_BASE_URL, return as is
      if (url.startsWith(API_BASE_URL)) {
        return url;
      }
      
      // If it's a relative path starting with /api/media, make it absolute
      if (url.startsWith('/api/media')) {
        return `${API_BASE_URL}${url}`;
      }
      
      // If it's an absolute URL pointing to a different API server, normalize it
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const urlObj = new URL(url);
          // Extract the path and rebuild with current API_BASE_URL
          if (urlObj.pathname.startsWith('/api/media')) {
            return `${API_BASE_URL}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
          }
        } catch (e) {
          // If URL parsing fails, try to extract path manually
          const pathMatch = url.match(/\/api\/media\/[^\s"'>]*/);
          if (pathMatch) {
            return `${API_BASE_URL}${pathMatch[0]}`;
          }
        }
      }
      
      return url;
    };
    
    // Pattern 1: Match img tags with src attribute (most common case)
    // This handles: <img src="..." /> or <img ... src="..." ...>
    // Also handles: <img class="..." src="..." /> (any attribute order)
    normalizedHtml = normalizedHtml.replace(
      /<img([^>]*)>/gi,
      (match, attributes) => {
        // Extract src from attributes
        const srcMatch = attributes.match(/\ssrc=["']([^"']+)["']/);
        if (srcMatch && srcMatch[1]) {
          const originalUrl = srcMatch[1];
          const normalized = normalizeUrl(originalUrl);
          // Replace the src in attributes
          const updatedAttributes = attributes.replace(
            /\ssrc=["'][^"']+["']/,
            ` src="${normalized}"`
          );
          return `<img${updatedAttributes}>`;
        }
        return match;
      }
    );
    
    // Pattern 2: Match src attribute in any tag (handles div with src attribute, image-placeholder components)
    // This catches: <div src="..." ...> or any element with src attribute
    normalizedHtml = normalizedHtml.replace(
      /(<[^>]+\s)src=["']([^"']+)["']([^>]*>)/gi,
      (match, tagStart, url, tagEnd) => {
        // Only normalize if it looks like a media URL
        if (url.includes('/api/media/')) {
          const normalized = normalizeUrl(url);
          return `${tagStart}src="${normalized}"${tagEnd}`;
        }
        return match;
      }
    );
    
    // Also handle standalone src attributes (fallback pattern)
    normalizedHtml = normalizedHtml.replace(
      /(\s)src=["']([^"']+)["']/gi,
      (match, space, url) => {
        // Only normalize if it looks like a media URL and wasn't already caught
        if (url.includes('/api/media/') && !url.startsWith(API_BASE_URL)) {
          const normalized = normalizeUrl(url);
          return `${space}src="${normalized}"`;
        }
        return match;
      }
    );
    
    // Pattern 3: Match CSS url() functions
    normalizedHtml = normalizedHtml.replace(
      /url\(["']?([^"')]+)["']?\)/gi,
      (match, url) => {
        if (url.includes('/api/media/')) {
          const normalized = normalizeUrl(url);
          return `url("${normalized}")`;
        }
        return match;
      }
    );
    
    // Pattern 4: Match data attributes (data-src, data-background, etc.)
    normalizedHtml = normalizedHtml.replace(
      /(data-[^=]+=["'])([^"']+)(["'])/gi,
      (match, attr, url, quote) => {
        if (url.includes('/api/media/')) {
          const normalized = normalizeUrl(url);
          return `${attr}${normalized}${quote}`;
        }
        return match;
      }
    );
    
    // Pattern 5: Match background-image in style attributes
    normalizedHtml = normalizedHtml.replace(
      /(background-image\s*:\s*url\(["']?)([^"')]+)(["']?\))/gi,
      (match, prefix, url, suffix) => {
        if (url.includes('/api/media/')) {
          const normalized = normalizeUrl(url);
          return `${prefix}${normalized}"${suffix}`;
        }
        return match;
      }
    );
    
    // CRITICAL: Handle image-placeholder components
    // These components have src on the div but the img tag inside needs it too
    // Strategy: Find all img tags with image-placeholder-img class that don't have src
    // Then find their parent div that has src attribute
    normalizedHtml = normalizedHtml.replace(
      /<img([^>]*class=["'][^"']*image-placeholder-img[^"']*["'])([^>]*)>/gi,
      (imgMatch, imgAttrs1, imgAttrs2) => {
        const fullAttrs = imgAttrs1 + imgAttrs2;
        // If img already has src, normalize it
        if (fullAttrs.includes('src=')) {
          return imgMatch.replace(/src=["']([^"']+)["']/gi, (srcMatch, url) => {
            if (url.includes('/api/media/')) {
              return `src="${normalizeUrl(url)}"`;
            }
            return srcMatch;
          });
        }
        
        // If img doesn't have src, find the parent div with src
        // We'll do this by searching backwards from the img tag position
        const imgIndex = normalizedHtml.indexOf(imgMatch);
        if (imgIndex === -1) return imgMatch;
        
        // Search backwards for the opening div tag with src
        const beforeImg = normalizedHtml.substring(0, imgIndex);
        // Find the most recent div with src attribute that contains this img
        const divMatches = Array.from(beforeImg.matchAll(/<div([^>]*\s)src=["']([^"']+)["']([^>]*)>/gi));
        
        for (let i = divMatches.length - 1; i >= 0; i--) {
          const divMatch = divMatches[i];
          const divSrc = divMatch[2];
          if (divSrc.includes('/api/media/')) {
            // Check if this div contains the image-placeholder-img (by checking if there's a closing div after our img)
            const divStartIndex = divMatch.index! + divMatch[0].length;
            const afterDiv = normalizedHtml.substring(divStartIndex);
            // Check if our img is before the next closing div tag
            const nextClosingDiv = afterDiv.indexOf('</div>');
            const imgPosInAfter = afterDiv.indexOf(imgMatch);
            
            if (imgPosInAfter !== -1 && (nextClosingDiv === -1 || imgPosInAfter < nextClosingDiv)) {
              const normalizedSrc = normalizeUrl(divSrc);
              return `<img${imgAttrs1} src="${normalizedSrc}"${imgAttrs2}>`;
            }
          }
        }
        
        return imgMatch;
      }
    );
    
    // Also handle the div replacement to ensure src is normalized on div
    normalizedHtml = normalizedHtml.replace(
      /<div([^>]*\s)src=["']([^"']+)["']([^>]*>)/gi,
      (match, divAttrs1, divSrc, divAttrs2) => {
        if (divSrc.includes('/api/media/')) {
          const normalizedSrc = normalizeUrl(divSrc);
          return `<div${divAttrs1}src="${normalizedSrc}"${divAttrs2}`;
        }
        return match;
      }
    );
    
    // Final fallback: Use DOM parsing approach for more reliable parent-child matching
    // This handles edge cases where regex might miss nested structures
    if (typeof document !== 'undefined') {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = normalizedHtml;
      
      // Find all img tags with image-placeholder-img class
      const imgElements = tempDiv.querySelectorAll('img.image-placeholder-img');
      imgElements.forEach((imgEl) => {
        const img = imgEl as HTMLImageElement;
        // If img doesn't have src, find parent div with src
        if (!img.src || img.src === window.location.href || img.src === 'about:blank') {
          let parent = img.parentElement;
          while (parent && parent.tagName !== 'BODY') {
            const parentSrc = parent.getAttribute('src');
            if (parentSrc && parentSrc.includes('/api/media/')) {
              const normalizedSrc = normalizeUrl(parentSrc);
              img.setAttribute('src', normalizedSrc);
              break;
            }
            parent = parent.parentElement;
          }
        } else if (img.src.includes('/api/media/')) {
          // Normalize existing src
          const normalizedSrc = normalizeUrl(img.src);
          img.setAttribute('src', normalizedSrc);
        }
      });
      
        normalizedHtml = tempDiv.innerHTML;
      } catch (e) {
        // If DOM parsing fails (e.g., invalid HTML), continue with regex-based approach
        if (process.env.NODE_ENV === 'development') {
          console.warn('[PublicView] DOM parsing fallback failed, using regex only:', e);
        }
      }
    }
    
    return normalizedHtml;
  };

  // Normalize image URLs in the HTML
  let normalizedHtml = normalizeImageUrls(extractedHtml || '');
  const normalizedCss = normalizeImageUrls(combinedCss);
  
  // Add interactive JavaScript for FAQ accordions and other interactive components
  const interactiveScript = `
    <script>
      (function() {
        // FAQ Accordion functionality
        document.addEventListener('DOMContentLoaded', function() {
          const faqItems = document.querySelectorAll('.faq-item');
          faqItems.forEach(function(item) {
            const header = item.querySelector('.faq-header');
            const content = item.querySelector('.faq-content');
            const icon = item.querySelector('.faq-icon');
            
            if (header && content) {
              // Items are closed by default - only open if explicitly set
              // Don't auto-open any items
              
              header.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = item.classList.contains('active');
                
                if (isOpen) {
                  item.classList.remove('active');
                  content.style.display = 'none';
                  if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                  }
                } else {
                  item.classList.add('active');
                  content.style.display = 'block';
                  if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                  }
                }
              });
            }
          });
        });
      })();
    </script>
  `;
  
  // Inject interactive script before closing body tag
  if (normalizedHtml.includes('</body>')) {
    normalizedHtml = normalizedHtml.replace('</body>', interactiveScript + '</body>');
  } else {
    normalizedHtml += interactiveScript;
  }
  
  // Debug: Check image-placeholder components before and after normalization
  if (process.env.NODE_ENV === 'development') {
    const beforeMatches = extractedHtml?.match(/<div[^>]*data-gjs-type=["']image-placeholder["'][^>]*>/gi);
    const afterMatches = normalizedHtml.match(/<div[^>]*data-gjs-type=["']image-placeholder["'][^>]*>/gi);
    const beforeImgMatches = extractedHtml?.match(/<img[^>]*class=["'][^"']*image-placeholder-img[^"']*["'][^>]*>/gi);
    const afterImgMatches = normalizedHtml.match(/<img[^>]*class=["'][^"']*image-placeholder-img[^"']*["'][^>]*>/gi);
    
    console.log('[PublicView] Before normalization - Image placeholder divs:', beforeMatches?.length || 0);
    console.log('[PublicView] After normalization - Image placeholder divs:', afterMatches?.length || 0);
    console.log('[PublicView] Before normalization - Image placeholder img tags:', beforeImgMatches?.length || 0);
    console.log('[PublicView] After normalization - Image placeholder img tags:', afterImgMatches?.length || 0);
    
    if (afterImgMatches) {
      afterImgMatches.forEach((match, idx) => {
        const srcMatch = match.match(/src=["']([^"']+)["']/);
        const hasSrc = !!srcMatch;
        console.log(`[PublicView] Image placeholder img ${idx + 1} after normalization - has src:`, hasSrc, hasSrc ? srcMatch[1].substring(0, 60) : 'NO SRC');
      });
    }
  }
  
  // Debug: Log image URLs found in HTML (development only)
  if (process.env.NODE_ENV === 'development') {
    const imgMatches = normalizedHtml.match(/<img[^>]*>/gi);
    if (imgMatches) {
      console.log('[PublicView] Found', imgMatches.length, 'img tags');
      imgMatches.forEach((match, idx) => {
        const srcMatch = match.match(/src=["']([^"']+)["']/);
        if (srcMatch) {
          console.log(`[PublicView] Image ${idx + 1} src:`, srcMatch[1]);
        }
      });
    }
    
    // Check for image-placeholder components
    const placeholderMatches = normalizedHtml.match(/<div[^>]*data-gjs-type=["']image-placeholder["'][^>]*>[\s\S]{0,500}/gi);
    if (placeholderMatches) {
      console.log('[PublicView] Found', placeholderMatches.length, 'image-placeholder components');
      placeholderMatches.forEach((match, idx) => {
        const srcMatch = match.match(/src=["']([^"']+)["']/);
        const imgSrcMatch = match.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/);
        console.log(`[PublicView] Placeholder ${idx + 1}:`, {
          hasDivSrc: !!srcMatch,
          divSrc: srcMatch?.[1],
          hasImgSrc: !!imgSrcMatch,
          imgSrc: imgSrcMatch?.[1]
        });
      });
    }
  }

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
        ${normalizedCss}
        /* FAQ Accordion Styles */
        .faq-item {
          transition: all 0.3s ease;
        }
        .faq-item.active .faq-content {
          display: block !important;
          animation: fadeIn 0.3s ease;
        }
        .faq-item.active .faq-icon {
          transform: rotate(180deg);
        }
        .faq-content {
          display: none;
          overflow: hidden;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
        /* Link button styles */
        .link-button {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .link-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15) !important;
        }
        /* Default link styles - ONLY apply to links without ANY style attribute */
        /* Links with inline styles will preserve their custom styles */
        /* Use attribute selector to check for style attribute existence */
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
        /* Smooth scrolling for anchor links */
        html {
          scroll-behavior: smooth;
        }
        /* Ensure sections with IDs are scrollable targets */
        [id] {
          scroll-margin-top: 20px;
        }
      </style>
      <script>
        // Handle anchor link clicks with smooth scrolling
        document.addEventListener('DOMContentLoaded', function() {
          // Handle clicks on anchor links
          document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
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
                  history.pushState(null, null, link.hash);
                }
              }
            }
          });
        });
      </script>
    </head>
    <body>
      ${normalizedHtml}
    </body>
  </html>`;

  return (
    <iframe
      title={website.title || 'Website Preview'}
      srcDoc={srcDoc}
      className="w-full min-h-screen border-0"
      style={{ display: 'block' }}
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      allow="fullscreen"
    />
  );
}
