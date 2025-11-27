/**
 * Utility functions to convert layout JSON to HTML
 */

export interface LayoutData {
  html?: string;
  css?: string;
  blocks?: any[];
  globalStyles?: any;
  settings?: any;
  version?: string;
}

/**
 * Converts a layout object to a complete HTML document
 * Supports both GrapesJS format ({ html, css }) and custom block format
 */
export function convertLayoutToHTML(layout: LayoutData | null | undefined): string {
  if (!layout) {
    return '<html><head><meta charset="UTF-8"><title>Website</title></head><body><p>No content available</p></body></html>';
  }

  // If layout is in GrapesJS format (has html and/or css properties)
  if (layout.html !== undefined || layout.css !== undefined) {
    const html = layout.html || '';
    const css = layout.css || '';
    
    // Extract title from settings if available
    const title = layout.settings?.title || 'Website';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${layout.settings?.description ? `<meta name="description" content="${escapeHtml(layout.settings.description)}">` : ''}
  ${layout.settings?.keywords ? `<meta name="keywords" content="${escapeHtml(layout.settings.keywords)}">` : ''}
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`;
  }

  // If layout is in custom block format (has blocks array)
  if (layout.blocks && Array.isArray(layout.blocks)) {
    const title = layout.settings?.title || 'Website';
    const globalStyles = layout.globalStyles || {};
    
    // Build CSS from global styles
    const css = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: ${globalStyles.fontFamily || 'Inter, system-ui, sans-serif'};
        font-size: ${globalStyles.fontSize || '16px'};
        line-height: ${globalStyles.lineHeight || '1.6'};
        color: ${globalStyles.color || '#333333'};
        background-color: ${globalStyles.backgroundColor || '#ffffff'};
      }
      .container {
        max-width: ${globalStyles.maxWidth || '1200px'};
        margin: ${globalStyles.margin || '0 auto'};
        padding: ${globalStyles.padding || '0 20px'};
      }
    `;
    
    // Convert blocks to HTML (simplified - you may need to enhance this based on your block structure)
    const html = layout.blocks.map((block: any) => {
      // This is a simplified conversion - you may need to implement proper block-to-HTML conversion
      return `<div class="block" data-block-type="${block.type || 'unknown'}">${block.content || ''}</div>`;
    }).join('\n');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${layout.settings?.description ? `<meta name="description" content="${escapeHtml(layout.settings.description)}">` : ''}
  ${layout.settings?.keywords ? `<meta name="keywords" content="${escapeHtml(layout.settings.keywords)}">` : ''}
  <style>${css}</style>
</head>
<body>
  <div class="container">
    ${html}
  </div>
</body>
</html>`;
  }

  // Fallback for unknown format
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website</title>
</head>
<body>
  <p>Content format not recognized</p>
</body>
</html>`;
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }
  // Use simple string replacement for reliability across all contexts
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

