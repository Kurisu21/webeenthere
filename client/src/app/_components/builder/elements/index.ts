// Base exports
export * from './base/ElementInterface';
export { BaseElement } from './base/BaseElement';
export { elementFactory } from './base/ElementRegistry';

// Basic elements
export { TextElement } from './basic/TextElement';
export { ButtonElement } from './basic/ButtonElement';
export { ImageElement } from './basic/ImageElement';
export { HeroElement } from './basic/HeroElement';

// Layout elements
export { DividerElement } from './layout/DividerElement';
export { SpacerElement } from './layout/SpacerElement';
export { LinkElement } from './layout/LinkElement';
export { LogoElement } from './layout/LogoElement';

// Interactive elements
export { ModalElement } from './interactive/ModalElement';
export { TabsElement } from './interactive/TabsElement';
export { AccordionElement } from './interactive/AccordionElement';
export { SliderElement } from './interactive/SliderElement';
export { RatingElement } from './interactive/RatingElement';

// Form elements
export { ContactElement } from './forms/ContactElement';

// Section elements
export { AboutElement } from './sections/AboutElement';
export { GalleryElement } from './sections/GalleryElement';
export { SocialElement } from './sections/SocialElement';

// Element categories for easy access
export const ELEMENT_CATEGORIES = {
  basic: ['text', 'button', 'image', 'hero'],
  layout: ['divider', 'spacer', 'link', 'logo'],
  interactive: ['modal', 'tabs', 'accordion', 'slider', 'rating'],
  forms: ['contact'],
  sections: ['about', 'gallery', 'social']
} as const;

export type ElementCategory = keyof typeof ELEMENT_CATEGORIES;
export type ElementType = typeof ELEMENT_CATEGORIES[ElementCategory][number];



