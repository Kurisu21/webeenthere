/**
 * Convert template HTML/CSS to GrapesJS JSON format
 */

export interface TemplateData {
  html_base?: string;
  css_base?: string;
  elements?: any[];
  id?: string;
  name?: string;
  description?: string;
}

/**
 * Converts template data to GrapesJS JSON format
 */
export function convertTemplateToGrapesJSON(template: TemplateData): string {
  const html = template.html_base || '';
  const css = template.css_base || '';
  
  return JSON.stringify({
    html,
    css,
    assets: [],
  });
}

/**
 * Converts GrapesJS HTML to clean HTML for publishing
 */
export function convertGrapesToPublishableHTML(grapesJson: string): string {
  try {
    const data = JSON.parse(grapesJson);
    const html = data.html || '';
    const css = data.css || '';
    
    return `<html><head><style>${css}</style></head><body>${html}</body></html>`;
  } catch (e) {
    console.error('Error converting GrapesJS to HTML:', e);
    return '<html><head></head><body><p>Error loading content</p></body></html>';
  }
}

/**
 * Loads template HTML into GrapesJS components
 */
export function loadTemplateToGrapes(editor: any, template: TemplateData) {
  if (!editor) return;
  
  const html = template.html_base || '';
  const css = template.css_base || '';
  
  if (html) {
    editor.setComponents(html);
  }
  
  if (css) {
    editor.setStyle(css);
  }
}
