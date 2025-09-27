import { Element } from '../elements';
import { EnhancedTemplate } from '../../../_data/enhanced-templates';

export const generateHTML = (elements: Element[]): string => {
  return elements.map(element => {
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
  const templateCSS = selectedTemplate?.css_base ? selectedTemplate.css_base : '';
  const elementsCSS = elements.map(element => `
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
  `).join('');
  
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
  setSelectedElement: (element: Element | null) => void
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
    alert('Website saved successfully! (Demo mode)');
    
    // Reset form
    setCurrentStep('template-selection');
    setSelectedTemplate(null);
    setWebsiteTitle('');
    setWebsiteSlug('');
    setElements([]);
    setSelectedElement(null);
  } catch (error) {
    console.error('Error saving website:', error);
    alert('Error saving website. Please try again.');
  } finally {
    setIsCreating(false);
  }
};



