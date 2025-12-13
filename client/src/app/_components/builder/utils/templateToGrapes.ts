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
 * Also injects CSS into canvas iframe for proper rendering
 */
export function loadTemplateToGrapes(editor: any, template: TemplateData) {
  if (!editor) return;
  
  const html = template.html_base || template.html || '';
  const css = template.css_base || template.css || '';
  
  if (html) {
    editor.setComponents(html);
  }
  
  if (css) {
    // Apply CSS to editor's style manager
    editor.setStyle(css);
    
    // CRITICAL: Also inject CSS directly into canvas iframe head
    // This ensures body/html styles, CSS variables, and complex selectors work properly
    const injectStylesIntoCanvas = () => {
      try {
        const canvas = editor.Canvas;
        const frame = canvas?.getFrameEl?.();
        
        if (frame && frame.contentDocument) {
          const frameDoc = frame.contentDocument;
          const frameHead = frameDoc.head || frameDoc.getElementsByTagName('head')[0];
          
          if (frameHead) {
            // Remove existing style tag if present
            const existingStyle = frameDoc.getElementById('template-styles');
            if (existingStyle) {
              existingStyle.remove();
            }
            
            // Create and inject style tag into iframe head
            const styleTag = frameDoc.createElement('style');
            styleTag.id = 'template-styles';
            styleTag.textContent = css;
            frameHead.appendChild(styleTag);
          }
        }
      } catch (error) {
        // Cross-origin or other iframe access issues - fallback to setStyle only
        console.warn('Could not inject styles into canvas iframe:', error);
      }
    };
    
    // Try immediately, then retry after delays to ensure canvas is ready
    injectStylesIntoCanvas();
    setTimeout(injectStylesIntoCanvas, 300);
    setTimeout(injectStylesIntoCanvas, 1000);
    
    // Listen for canvas frame load/reload events
    const handleFrameLoad = () => {
      injectStylesIntoCanvas();
    };
    editor.on('canvas:frame:load', handleFrameLoad);
    editor.on('canvas:update', handleFrameLoad);
  }
}
