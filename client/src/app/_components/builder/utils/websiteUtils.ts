import { Element } from '../elements';
import { EnhancedTemplate } from '../../../_data/enhanced-templates';
import { WebsiteSectionParser } from './websiteSectionParser';
import { API_ENDPOINTS, apiPost, apiPut } from '../../../../lib/apiConfig';

export const generateHTML = (elements: Element[]): string => {
  // Check if we have a single website element with existing HTML
  const websiteElement = elements.find(el => el.type === 'website');
  if (websiteElement && websiteElement.content.includes('<')) {
    // Use the existing HTML content directly
    return websiteElement.content;
  }
  
  // Check if we have section-based elements
  const hasSections = elements.some(el => ['hero', 'navigation', 'about', 'gallery', 'services', 'projects', 'footer', 'stats', 'section'].includes(el.type));
  
  if (hasSections) {
    // Use section parser for structured HTML generation
    return WebsiteSectionParser.sectionsToHTML(elements);
  }
  
  return elements.map(element => {
    // Handle website element specially - return the raw HTML content
    if (element.type === 'website') {
      return element.content;
    }
    
    const buttonHtml = `<button style="width: 100%; height: 100%; border: none; cursor: pointer;">${element.content}</button>`;
    const imageHtml = `<img src="${element.imageUrl || 'https://via.placeholder.com/300x200'}" alt="${element.content}" style="width: 100%; height: 100%; object-fit: cover;" />`;
    const defaultHtml = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${element.content}</div>`;
    
    const contentHtml = element.type === 'button' ? buttonHtml : 
                      element.type === 'image' ? imageHtml : defaultHtml;
    
    return `
      <div class="element-${element.id}" style="position: absolute; left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.size.width}px; height: ${element.size.height}px;">
        ${contentHtml}
      </div>
    `;
  }).join('');
};

export const generateCSS = (elements: Element[], selectedTemplate?: EnhancedTemplate | null): string => {
  // Check if we have a single website element with existing CSS
  const websiteElement = elements.find(el => el.type === 'website');
  if (websiteElement && (websiteElement as any).cssContent) {
    // Use the existing CSS content directly
    return (websiteElement as any).cssContent;
  }
  
  const templateCSS = selectedTemplate?.css_base ? selectedTemplate.css_base : '';
  const elementsCSS = elements.map(element => {
    // Handle website element specially - return the raw CSS content
    if (element.type === 'website') {
      return (element as any).cssContent || '';
    }
    
    return `
    .element-${element.id} {
      color: ${element.styles.color || '#333333'};
      font-size: ${element.styles.fontSize || '16px'};
      font-weight: ${element.styles.fontWeight || 'normal'};
      background: ${element.styles.backgroundColor || 'transparent'};
      background-image: ${element.styles.backgroundImage || 'none'};
      background-size: ${element.styles.backgroundSize || 'cover'};
      background-position: ${element.styles.backgroundPosition || 'center'};
      padding: ${element.styles.padding || '0'};
      margin: ${element.styles.margin || '0'};
      text-align: ${element.styles.textAlign || 'left'};
      border-radius: ${element.styles.borderRadius || '0'};
      border: ${element.styles.border || 'none'};
      opacity: ${element.styles.opacity || '1'};
      box-shadow: ${element.styles.boxShadow || 'none'};
      transform: ${element.styles.transform || 'none'};
      transition: ${element.styles.transition || 'all 0.3s ease'};
      animation: ${element.animation ? `${element.animation.type} ${element.animation.duration}s ${element.animation.delay}s ${element.animation.iteration}` : 'none'};
      z-index: ${element.styles.zIndex || 'auto'};
      overflow: ${element.styles.overflow || 'hidden'};
      display: ${element.styles.display || 'block'};
      flex-direction: ${element.styles.flexDirection || 'row'};
      justify-content: ${element.styles.justifyContent || 'flex-start'};
      align-items: ${element.styles.alignItems || 'stretch'};
      gap: ${element.styles.gap || '0'};
      box-sizing: border-box;
    }
    ${element.animation ? `
      @keyframes ${element.animation.type} {
        ${element.animation.type === 'fadeIn' ? 'from { opacity: 0; } to { opacity: 1; }' : ''}
        ${element.animation.type === 'slideIn' ? 'from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; }' : ''}
        ${element.animation.type === 'bounce' ? '0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); }' : ''}
        ${element.animation.type === 'pulse' ? '0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); }' : ''}
        ${element.animation.type === 'rotate' ? 'from { transform: rotate(0deg); } to { transform: rotate(360deg); }' : ''}
        ${element.animation.type === 'scale' ? 'from { transform: scale(0); } to { transform: scale(1); }' : ''}
      }
      .element-${element.id} {
        animation: ${element.animation.type} ${element.animation.duration}s ${element.animation.delay}s ${element.animation.iteration};
      }
    ` : ''}
    ${element.interaction?.hover ? `
      .element-${element.id}:hover {
        ${element.interaction.hover.styles ? Object.entries(element.interaction.hover.styles).map(([key, value]) => `${key}: ${value};`).join(' ') : ''}
      }
    ` : ''}
  `;
  }).join('');
  
  return templateCSS + '\n' + elementsCSS;
};

export const handlePreview = (websiteTitle: string, elements: Element[], selectedTemplate?: EnhancedTemplate | null) => {
  const html = generateHTML(elements);
  const css = generateCSS(elements, selectedTemplate);
  const previewWindow = window.open('', '_blank');
  if (previewWindow) {
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${websiteTitle} - Preview</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            ${css}
          </style>
        </head>
        <body>
          <div style="position: relative; min-height: 100vh;">
            ${html}
          </div>
        </body>
      </html>
    `);
    previewWindow.document.close();
  }
};

export const handleSaveWebsite = async (
  websiteTitle: string,
  websiteSlug: string,
  elements: Element[],
  selectedTemplate: EnhancedTemplate | null,
  setIsCreating: (creating: boolean) => void,
  setCurrentStep: (step: 'template-selection' | 'website-details' | 'builder') => void,
  setSelectedTemplate: (template: EnhancedTemplate | null) => void,
  setWebsiteTitle: (title: string) => void,
  setWebsiteSlug: (slug: string) => void,
  setElements: (elements: Element[]) => void,
  setSelectedElement: (element: Element | null) => void,
  websiteId?: string
) => {
  setIsCreating(true);
  try {
    const html = generateHTML(elements);
    const css = generateCSS(elements, selectedTemplate);
    
    const websiteData = {
      title: websiteTitle,
      slug: websiteSlug || websiteTitle.toLowerCase().replace(/\s+/g, '-'),
      html_content: html,
      css_content: css,
      template_id: selectedTemplate?.id || null,
      is_published: false
    };

    console.log('Saving website:', websiteData);
    
    let response;
    if (websiteId) {
      // Update existing website
      response = await apiPut(`${API_ENDPOINTS.WEBSITES}/${websiteId}`, websiteData);
    } else {
      // Create new website
      response = await apiPost(API_ENDPOINTS.WEBSITES, websiteData);
    }
    
    if (response.success) {
      alert('Website saved successfully!');
      
      if (!websiteId) {
        // Redirect to edit the newly created website
        window.location.href = `/user/build/${response.data.id}`;
      }
    } else {
      alert('Error saving website: ' + response.message);
    }
    
  } catch (error) {
    console.error('Error saving website:', error);
    alert('Error saving website. Please try again.');
  } finally {
    setIsCreating(false);
  }
};








