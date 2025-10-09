import { Element } from '../elements/base/ElementInterface';
import { TemplateElement } from '../../../_data/enhanced-templates';

export const convertTemplateElementToElement = (templateElement: TemplateElement): Element => {
  // Map unknown element types to supported ones
  const elementTypeMap: Record<string, string> = {
    'navigation': 'text',
    'header': 'text',
    'footer': 'text',
    'video': 'text'
  };
  
  const elementType = elementTypeMap[templateElement.type] || templateElement.type;
  
  return {
    id: templateElement.id,
    type: elementType,
    content: templateElement.content,
    styles: {
      // Only use properties that exist in TemplateElement interface
      color: templateElement.styles.color || '#000000',
      fontSize: templateElement.styles.fontSize || '16px',
      fontWeight: templateElement.styles.fontWeight || 'normal',
      backgroundColor: templateElement.styles.backgroundColor || 'transparent',
      padding: templateElement.styles.padding || '0px',
      margin: templateElement.styles.margin || '0px',
      textAlign: templateElement.styles.textAlign || 'left',
      borderRadius: templateElement.styles.borderRadius || '0px',
      border: templateElement.styles.border || 'none',
      opacity: templateElement.styles.opacity || '1',
      width: templateElement.styles.width || 'auto',
      height: templateElement.styles.height || 'auto'
    },
    position: {
      x: templateElement.position.x,
      y: templateElement.position.y
    },
    size: {
      width: templateElement.size.width,
      height: templateElement.size.height
    },
    imageUrl: templateElement.imageUrl,
    videoUrl: undefined,
    url: undefined,
    buttonType: 'button',
    inputType: 'text',
    animation: {
      type: 'none',
      duration: 0,
      delay: 0,
      iteration: '1'
    },
    interaction: {
      hover: undefined
    }
  };
};

export const convertTemplateElementsToElements = (templateElements: TemplateElement[]): Element[] => {
  return templateElements.map(convertTemplateElementToElement);
};
