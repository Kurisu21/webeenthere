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
`;

export const getResponsiveClasses = () => ({
  container: 'responsive-container',
  grid: 'responsive-grid',
  section: 'responsive-section',
  text: 'responsive-text',
});






