/**
 * Interactive component definitions for GrapesJS
 * These provide actual functionality (links, accordions, etc.)
 */

export const interactiveComponentsCSS = `
  /* FAQ Accordion Styles */
  .faq-item {
    transition: all 0.3s ease;
  }
  .faq-item.active .faq-content {
    display: block !important;
    animation: fadeIn 0.3s ease;
  }
  .faq-item.active .faq-icon {
    transform: rotate(180deg);
  }
  .faq-content {
    display: none;
    overflow: hidden;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 1000px;
    }
  }
  
  /* Link button styles */
  .link-button {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .link-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15) !important;
  }
`;

/**
 * FAQ Accordion Item Component
 * Makes FAQ items actually toggle open/close
 */
export const createFAQItemHTML = (question: string = 'Question?', answer: string = 'Answer here.', isOpen: boolean = false) => {
  return `
    <div class="faq-item" data-gjs-type="faq-item" ${isOpen ? 'data-faq-open="true"' : ''} style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
        <h3 class="faq-question" style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0;">${question}</h3>
        <svg class="faq-icon" style="width: 1.5rem; height: 1.5rem; color: #6b7280; transition: transform 0.3s;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      <div class="faq-content" style="color: #6b7280; margin-top: 1rem; line-height: 1.6; ${isOpen ? 'display: block;' : 'display: none;'}">${answer}</div>
    </div>
  `;
};

/**
 * Link Button Component
 * Button with editable href property
 */
export const createLinkButtonHTML = (
  text: string = 'Click Me',
  href: string = '#',
  target: string = '_self',
  style: string = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'
) => {
  return `
    <a href="${href}" target="${target}" class="link-button" data-gjs-type="link-button" style="${style}">${text}</a>
  `;
};

/**
 * Text Link Component
 * Simple text link with editable href
 */
export const createTextLinkHTML = (
  text: string = 'Link Text',
  href: string = '#',
  target: string = '_self',
  style: string = 'color: #2563eb; font-weight: 600; text-decoration: none;'
) => {
  return `
    <a href="${href}" target="${target}" class="text-link" data-gjs-type="text-link" style="${style}">${text}</a>
  `;
};

/**
 * YouTube Video Embed Component
 * Embed YouTube videos with just the video ID
 */
export const createYouTubeEmbedHTML = (
  videoId: string = '',
  placeholder: string = 'Add YouTube Video ID'
) => {
  if (videoId) {
    return `
      <div class="youtube-embed" data-gjs-type="youtube-embed" data-video-id="${videoId}" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 1rem;">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    `;
  } else {
    return `
      <div class="youtube-embed-placeholder" data-gjs-type="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; background: #1f2937; border-radius: 1rem; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 2px dashed #6b7280;">
        <div style="text-align: center; color: white; padding: 2rem;">
          <svg style="width: 4rem; height: 4rem; margin: 0 auto 1rem; opacity: 0.8;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <p style="opacity: 0.8; font-size: 1.125rem; margin-bottom: 0.5rem;">${placeholder}</p>
          <p style="font-size: 0.875rem; opacity: 0.6;">Enter YouTube Video ID in properties panel</p>
        </div>
      </div>
    `;
  }
};



