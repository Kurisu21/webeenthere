'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_ENDPOINTS, apiGet, API_BASE_URL } from '../../../lib/apiConfig';

export default function TemplateViewer() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/${templateId}`);
        
        if (response.success) {
          setTemplate(response.data);
        } else {
          setError(response.message || 'Template not found');
        }
      } catch (error: any) {
        console.error('Error loading template:', error);
        setError(error.message || 'Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Template Not Found</h1>
          <p className="text-gray-400 mb-2">
            {error || 'The template you are looking for does not exist or is not available.'}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            This could mean:
            <br />• The template doesn't exist
            <br />• The template is not active
            <br />• The URL might be incorrect
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/admin/templates')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Back to Templates
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle both formats: separate css_base OR inline styles in html_base
  const cssContent = template.css_base || '';
  const htmlContent = template.html_base || '';
  
  // Check if html_base is JSON (GrapesJS format)
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
    }
  } catch (e) {
    // Not JSON, use as-is
  }
  
  // Check if HTML contains style tags
  if (extractedHtml && extractedHtml.includes('<style>')) {
    const styleMatch = extractedHtml.match(/<style[^>]*>(.*?)<\/style>/s);
    if (styleMatch) {
      extractedCss = styleMatch[1] + (extractedCss ? '\n' + extractedCss : '');
      extractedHtml = extractedHtml.replace(/<style[^>]*>.*?<\/style>/s, '');
    }
  }
  
  // Always merge database css_base with any extracted CSS from JSON/inline
  const combinedCss = [extractedCss, cssContent]
    .filter(Boolean)
    .join('\n');

  // Normalize image URLs in HTML to work in public view
  const normalizeImageUrls = (html: string): string => {
    if (!html) return html;
    
    let normalizedHtml = html;
    
    const normalizeUrl = (url: string): string => {
      if (!url) return url;
      
      if (url.startsWith(API_BASE_URL)) {
        return url;
      }
      
      if (url.startsWith('/api/media')) {
        return `${API_BASE_URL}${url}`;
      }
      
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const urlObj = new URL(url);
          if (urlObj.pathname.startsWith('/api/media')) {
            return `${API_BASE_URL}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
          }
        } catch (e) {
          const pathMatch = url.match(/\/api\/media\/[^\s"'>]*/);
          if (pathMatch) {
            return `${API_BASE_URL}${pathMatch[0]}`;
          }
        }
      }
      
      return url;
    };
    
    // Normalize img tags
    normalizedHtml = normalizedHtml.replace(
      /<img([^>]*)>/gi,
      (match, attributes) => {
        const srcMatch = attributes.match(/\ssrc=["']([^"']+)["']/);
        if (srcMatch && srcMatch[1]) {
          const originalUrl = srcMatch[1];
          const normalized = normalizeUrl(originalUrl);
          const updatedAttributes = attributes.replace(
            /\ssrc=["'][^"']+["']/,
            ` src="${normalized}"`
          );
          return `<img${updatedAttributes}>`;
        }
        return match;
      }
    );
    
    // Normalize CSS url() functions
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
    
    return normalizedHtml;
  };

  // Normalize image URLs in the HTML and CSS
  let normalizedHtml = normalizeImageUrls(extractedHtml || '');
  const normalizedCss = normalizeImageUrls(combinedCss);
  
  // Add interactive JavaScript for FAQ accordions and other interactive components
  const interactiveScript = `
    <script>
      (function() {
        document.addEventListener('DOMContentLoaded', function() {
          const faqItems = document.querySelectorAll('.faq-item');
          faqItems.forEach(function(item) {
            const header = item.querySelector('.faq-header');
            const content = item.querySelector('.faq-content');
            const icon = item.querySelector('.faq-icon');
            
            if (header && content) {
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
        /* Default link styles */
        a[href]:not([data-gjs-type="link-button"]):not(.link-button):not([style*="color"]):not([style*="text-decoration"]):not([style*="textDecoration"]) {
          color: #2563eb;
          text-decoration: underline;
        }
        a[href]:not([data-gjs-type="link-button"]):not(.link-button):not([style*="color"]):hover {
          color: #1d4ed8;
        }
        /* Text link specific styles */
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
        /* Smooth scrolling for anchor links */
        html {
          scroll-behavior: smooth;
        }
        [id] {
          scroll-margin-top: 20px;
        }
      </style>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
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
    <div className="min-h-screen bg-gray-900">
      {/* Header Bar with Template Info */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
              title="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{template.name}</h1>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                template.is_community 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {template.is_community ? 'Community' : 'Official'}
              </span>
              {template.is_featured && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {template.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/admin/templates`}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Manage Templates
            </a>
          </div>
        </div>
      </div>

      {/* Template Preview */}
      <iframe
        title={template.name || 'Template Preview'}
        srcDoc={srcDoc}
        className="w-full min-h-screen border-0"
        style={{ display: 'block' }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        allow="fullscreen"
      />
    </div>
  );
}



