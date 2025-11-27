'use client';

import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiGet, API_BASE_URL } from '../../lib/apiConfig';

/**
 * Test page to debug image-placeholder component HTML output
 * Access at: /test-image-placeholder?websiteId=YOUR_WEBSITE_ID
 */
export default function TestImagePlaceholder() {
  const [websiteId, setWebsiteId] = useState<string>('');
  const [website, setWebsite] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [htmlAnalysis, setHtmlAnalysis] = useState<any>(null);

  useEffect(() => {
    // Get websiteId from URL params
    const params = new URLSearchParams(window.location.search);
    const id = params.get('websiteId');
    if (id) {
      setWebsiteId(id);
      loadWebsite(id);
    }
  }, []);

  const loadWebsite = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(`${API_ENDPOINTS.WEBSITES}/${id}`);
      if (response.success) {
        setWebsite(response.data);
        analyzeHtml(response.data);
      } else {
        setError(response.message || 'Failed to load website');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading website');
    } finally {
      setLoading(false);
    }
  };

  const analyzeHtml = (websiteData: any) => {
    if (!websiteData?.html_content) {
      setHtmlAnalysis({ error: 'No HTML content found' });
      return;
    }

    let html = '';
    try {
      const parsed = JSON.parse(websiteData.html_content);
      html = parsed.html || websiteData.html_content;
    } catch {
      html = websiteData.html_content;
    }

    // Find all image-placeholder components
    const placeholderDivs = html.match(/<div[^>]*data-gjs-type=["']image-placeholder["'][^>]*>/gi) || [];
    const placeholderImgs = html.match(/<img[^>]*class=["'][^"']*image-placeholder-img[^"']*["'][^>]*>/gi) || [];

    const analysis: any = {
      totalPlaceholderDivs: placeholderDivs.length,
      totalPlaceholderImgs: placeholderImgs.length,
      placeholders: [],
      imageUrls: [],
      issues: [],
    };

    // Analyze each placeholder
    placeholderDivs.forEach((divHtml, idx) => {
      const divSrcMatch = divHtml.match(/src=["']([^"']+)["']/);
      const divSrc = divSrcMatch ? divSrcMatch[1] : null;
      
      // Find corresponding img tag (next img with image-placeholder-img class after this div)
      const divIndex = html.indexOf(divHtml);
      const afterDiv = html.substring(divIndex);
      const imgMatch = afterDiv.match(/<img[^>]*class=["'][^"']*image-placeholder-img[^"']*["'][^>]*>/);
      const imgHtml = imgMatch ? imgMatch[0] : null;
      const imgSrcMatch = imgHtml ? imgHtml.match(/src=["']([^"']+)["']/) : null;
      const imgSrc = imgSrcMatch ? imgSrcMatch[1] : null;

      const placeholder = {
        index: idx + 1,
        divHtml: divHtml.substring(0, 200),
        imgHtml: imgHtml ? imgHtml.substring(0, 200) : null,
        divHasSrc: !!divSrc,
        imgHasSrc: !!imgSrc,
        divSrc: divSrc,
        imgSrc: imgSrc,
        issue: null as string | null,
      };

      if (!divSrc && !imgSrc) {
        placeholder.issue = 'No src attribute found on div or img';
      } else if (divSrc && !imgSrc) {
        placeholder.issue = 'src on div but missing on img tag';
      } else if (divSrc !== imgSrc) {
        placeholder.issue = `src mismatch: div="${divSrc?.substring(0, 50)}" vs img="${imgSrc?.substring(0, 50)}"`;
      }

      analysis.placeholders.push(placeholder);
      
      if (divSrc) {
        analysis.imageUrls.push({
          url: divSrc,
          source: 'div',
          normalized: normalizeUrl(divSrc),
        });
      }
      if (imgSrc && imgSrc !== divSrc) {
        analysis.imageUrls.push({
          url: imgSrc,
          source: 'img',
          normalized: normalizeUrl(imgSrc),
        });
      }

      if (placeholder.issue) {
        analysis.issues.push(`Placeholder ${idx + 1}: ${placeholder.issue}`);
      }
    });

    setHtmlAnalysis(analysis);
  };

  const normalizeUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith(API_BASE_URL)) return url;
    if (url.startsWith('/api/media')) return `${API_BASE_URL}${url}`;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const urlObj = new URL(url);
        if (urlObj.pathname.startsWith('/api/media')) {
          return `${API_BASE_URL}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
        }
      } catch (e) {
        // Invalid URL
      }
    }
    return url;
  };

  const testImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        accessible: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type'),
      };
    } catch (err) {
      return {
        accessible: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Image Placeholder Test & Debug</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Website ID:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={websiteId}
            onChange={(e) => setWebsiteId(e.target.value)}
            placeholder="Enter website ID"
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            onClick={() => loadWebsite(websiteId)}
            disabled={!websiteId || loading}
            style={{
              padding: '0.5rem 1rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          Or add ?websiteId=YOUR_ID to the URL
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      {website && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Website Info</h2>
          <p><strong>Title:</strong> {website.title}</p>
          <p><strong>Slug:</strong> {website.slug || 'N/A'}</p>
          <p><strong>HTML Length:</strong> {website.html_content?.length || 0} characters</p>
          <p><strong>CSS Length:</strong> {website.css_content?.length || 0} characters</p>
        </div>
      )}

      {htmlAnalysis && (
        <div>
          <h2>HTML Analysis</h2>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#e8f4f8', borderRadius: '8px' }}>
            <p><strong>Total Image Placeholder Divs:</strong> {htmlAnalysis.totalPlaceholderDivs}</p>
            <p><strong>Total Image Placeholder Img Tags:</strong> {htmlAnalysis.totalPlaceholderImgs}</p>
            <p><strong>Issues Found:</strong> {htmlAnalysis.issues.length}</p>
          </div>

          {htmlAnalysis.issues.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>Issues:</h3>
              <ul>
                {htmlAnalysis.issues.map((issue: string, idx: number) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <h3>Placeholder Details</h3>
            {htmlAnalysis.placeholders.map((placeholder: any, idx: number) => (
              <div
                key={idx}
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: placeholder.issue ? '#fff3cd' : '#f9f9f9',
                }}
              >
                <h4>Placeholder #{placeholder.index}</h4>
                <p><strong>Div has src:</strong> {placeholder.divHasSrc ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Img has src:</strong> {placeholder.imgHasSrc ? '✅ Yes' : '❌ No'}</p>
                {placeholder.divSrc && (
                  <p>
                    <strong>Div src:</strong>{' '}
                    <a href={placeholder.divSrc} target="_blank" rel="noopener noreferrer">
                      {placeholder.divSrc.substring(0, 80)}...
                    </a>
                  </p>
                )}
                {placeholder.imgSrc && (
                  <p>
                    <strong>Img src:</strong>{' '}
                    <a href={placeholder.imgSrc} target="_blank" rel="noopener noreferrer">
                      {placeholder.imgSrc.substring(0, 80)}...
                    </a>
                  </p>
                )}
                {placeholder.issue && (
                  <p style={{ color: '#c00', fontWeight: 'bold' }}>⚠️ {placeholder.issue}</p>
                )}
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#0070f3' }}>View HTML</summary>
                  <pre style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5', overflow: 'auto', fontSize: '0.75rem' }}>
                    {placeholder.divHtml}
                    {placeholder.imgHtml && '\n' + placeholder.imgHtml}
                  </pre>
                </details>
              </div>
            ))}
          </div>

          <div>
            <h3>Image URLs</h3>
            {htmlAnalysis.imageUrls.map((urlInfo: any, idx: number) => (
              <div
                key={idx}
                style={{
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                <p>
                  <strong>Source:</strong> {urlInfo.source} |{' '}
                  <strong>Original:</strong>{' '}
                  <a href={urlInfo.url} target="_blank" rel="noopener noreferrer">
                    {urlInfo.url.substring(0, 100)}...
                  </a>
                </p>
                <p>
                  <strong>Normalized:</strong>{' '}
                  <a href={urlInfo.normalized} target="_blank" rel="noopener noreferrer">
                    {urlInfo.normalized.substring(0, 100)}...
                  </a>
                </p>
                <img
                  src={urlInfo.normalized}
                  alt={`Test ${idx + 1}`}
                  style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '0.5rem', border: '1px solid #ddd' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.border = '2px solid red';
                    (e.target as HTMLImageElement).alt = '❌ Image failed to load';
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.border = '2px solid green';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {website && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Raw HTML Preview</h2>
          <details>
            <summary style={{ cursor: 'pointer', color: '#0070f3', marginBottom: '0.5rem' }}>
              Show/Hide Raw HTML
            </summary>
            <pre
              style={{
                padding: '1rem',
                background: '#f5f5f5',
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '0.75rem',
              }}
            >
              {(() => {
                try {
                  const parsed = JSON.parse(website.html_content);
                  return parsed.html || website.html_content;
                } catch {
                  return website.html_content;
                }
              })()}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}




