/**
 * Website Export API utilities
 * Handles downloading websites as HTML, CSS, or ZIP files
 */

import { API_ENDPOINTS, apiGet } from './apiConfig';

export interface WebsiteExportOptions {
  format: 'html' | 'css' | 'zip';
}

export interface WebsiteData {
  id: number;
  title: string;
  slug: string;
  html_content: string;
  css_content: string;
  is_published: boolean;
}

/**
 * Download website as HTML file with inline CSS
 */
export const exportWebsiteHTML = async (websiteId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.WEBSITES}/${websiteId}/export?format=html`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export website');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-${websiteId}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting HTML:', error);
    throw error;
  }
};

/**
 * Download website CSS file only
 */
export const exportWebsiteCSS = async (websiteId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.WEBSITES}/${websiteId}/export?format=css`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export CSS');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-${websiteId}.css`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting CSS:', error);
    throw error;
  }
};

/**
 * Download website as ZIP file with separate HTML and CSS files
 */
export const exportWebsiteZip = async (websiteData: WebsiteData): Promise<void> => {
  try {
    // Create HTML content with inline CSS for ZIP
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${websiteData.title}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    ${websiteData.html_content || ''}
</body>
</html>`;

    // Create CSS content
    const cssContent = websiteData.css_content || '';

    // Create ZIP file using JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    zip.file('index.html', htmlContent);
    zip.file('styles.css', cssContent);
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    const url = window.URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${websiteData.slug}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error creating ZIP:', error);
    throw error;
  }
};

/**
 * Get website data for export
 */
export const getWebsiteForExport = async (websiteId: number): Promise<WebsiteData> => {
  try {
    const response = await apiGet(`${API_ENDPOINTS.WEBSITES}/${websiteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching website for export:', error);
    throw error;
  }
};

/**
 * Export website with specified format
 */
export const exportWebsite = async (websiteId: number, format: 'html' | 'css' | 'zip'): Promise<void> => {
  switch (format) {
    case 'html':
      await exportWebsiteHTML(websiteId);
      break;
    case 'css':
      await exportWebsiteCSS(websiteId);
      break;
    case 'zip':
      const websiteData = await getWebsiteForExport(websiteId);
      await exportWebsiteZip(websiteData);
      break;
    default:
      throw new Error('Invalid export format');
  }
};
