/**
 * Responsive utility functions and CSS helpers for blocks
 */

export const responsiveCSS = `
/* Responsive Utilities */
@media (max-width: 640px) {
  .mobile-hide { display: none !important; }
  .mobile-full { width: 100% !important; }
  .mobile-stack { flex-direction: column !important; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .tablet-hide { display: none !important; }
}

@media (min-width: 1025px) {
  .desktop-only { display: block !important; }
}

/* Responsive Grid Utilities */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Responsive Container */
.responsive-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .responsive-container {
    padding: 0 2rem;
  }
}

/* Responsive Text */
.responsive-text {
  font-size: 1rem;
  line-height: 1.6;
}

@media (min-width: 640px) {
  .responsive-text {
    font-size: 1.125rem;
  }
}

/* Responsive Spacing */
.responsive-section {
  padding: 3rem 1rem;
}

@media (min-width: 640px) {
  .responsive-section {
    padding: 4rem 2rem;
  }
}

@media (min-width: 1024px) {
  .responsive-section {
    padding: 5rem 2rem;
  }
}

/* Auto-Adjust Padding Utilities - Prevents content from touching edges */
.auto-padding {
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .auto-padding {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (min-width: 1024px) {
  .auto-padding {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

@media (min-width: 1280px) {
  .auto-padding {
    padding-left: 4rem;
    padding-right: 4rem;
  }
}

/* Auto-Adjust Margin Utilities */
.auto-margin {
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .auto-margin {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (min-width: 1024px) {
  .auto-margin {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

/* Safe Edge Spacing - Ensures content never touches viewport edges */
.safe-edge {
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

@media (min-width: 640px) {
  .safe-edge {
    padding-left: max(2rem, env(safe-area-inset-left));
    padding-right: max(2rem, env(safe-area-inset-right));
  }
}

@media (min-width: 1024px) {
  .safe-edge {
    padding-left: max(3rem, env(safe-area-inset-left));
    padding-right: max(3rem, env(safe-area-inset-right));
  }
}

/* Responsive Section with Auto-Adjust */
.responsive-section-auto {
  padding: 3rem 1rem;
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

@media (min-width: 640px) {
  .responsive-section-auto {
    padding: 4rem 2rem;
    padding-left: max(2rem, env(safe-area-inset-left));
    padding-right: max(2rem, env(safe-area-inset-right));
  }
}

@media (min-width: 1024px) {
  .responsive-section-auto {
    padding: 5rem 3rem;
    padding-left: max(3rem, env(safe-area-inset-left));
    padding-right: max(3rem, env(safe-area-inset-right));
  }
}

/* Responsive Container with Auto-Adjust */
.responsive-container-auto {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

@media (min-width: 640px) {
  .responsive-container-auto {
    padding-left: max(2rem, env(safe-area-inset-left));
    padding-right: max(2rem, env(safe-area-inset-right));
  }
}

@media (min-width: 1024px) {
  .responsive-container-auto {
    padding-left: max(3rem, env(safe-area-inset-left));
    padding-right: max(3rem, env(safe-area-inset-right));
  }
}

/* Body/Page level auto-adjust */
body.auto-adjust-page,
html.auto-adjust-page {
  overflow-x: hidden;
}

body.auto-adjust-page > *,
html.auto-adjust-page > * {
  max-width: 100vw;
}

/* Section auto-adjust wrapper */
.section-auto-wrapper {
  width: 100%;
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

@media (min-width: 640px) {
  .section-auto-wrapper {
    padding-left: max(2rem, env(safe-area-inset-left));
    padding-right: max(2rem, env(safe-area-inset-right));
  }
}

@media (min-width: 1024px) {
  .section-auto-wrapper {
    padding-left: max(3rem, env(safe-area-inset-left));
    padding-right: max(3rem, env(safe-area-inset-right));
  }
}

@media (min-width: 1280px) {
  .section-auto-wrapper {
    padding-left: max(4rem, env(safe-area-inset-left));
    padding-right: max(4rem, env(safe-area-inset-right));
  }
}
`;

export const getResponsiveClasses = () => ({
  container: 'responsive-container',
  grid: 'responsive-grid',
  section: 'responsive-section',
  text: 'responsive-text',
  autoPadding: 'auto-padding',
  autoMargin: 'auto-margin',
  safeEdge: 'safe-edge',
  sectionAuto: 'responsive-section-auto',
  containerAuto: 'responsive-container-auto',
  sectionWrapper: 'section-auto-wrapper',
});

/**
 * Generate responsive padding CSS based on breakpoints
 */
export const generateResponsivePadding = (
  mobile: string = '1rem',
  tablet: string = '2rem',
  desktop: string = '3rem',
  large: string = '4rem'
): string => {
  return `
    padding-left: ${mobile};
    padding-right: ${mobile};
  }
  
  @media (min-width: 640px) {
    padding-left: ${tablet};
    padding-right: ${tablet};
  }
  
  @media (min-width: 1024px) {
    padding-left: ${desktop};
    padding-right: ${desktop};
  }
  
  @media (min-width: 1280px) {
    padding-left: ${large};
    padding-right: ${large};
  }`;
};

/**
 * Generate responsive margin CSS based on breakpoints
 */
export const generateResponsiveMargin = (
  mobile: string = '1rem',
  tablet: string = '2rem',
  desktop: string = '3rem',
  large: string = '4rem'
): string => {
  return `
    margin-left: ${mobile};
    margin-right: ${mobile};
  }
  
  @media (min-width: 640px) {
    margin-left: ${tablet};
    margin-right: ${tablet};
  }
  
  @media (min-width: 1024px) {
    margin-left: ${desktop};
    margin-right: ${desktop};
  }
  
  @media (min-width: 1280px) {
    margin-left: ${large};
    margin-right: ${large};
  }`;
};






