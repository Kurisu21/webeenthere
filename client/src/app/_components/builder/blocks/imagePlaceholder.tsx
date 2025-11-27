/**
 * Image placeholder component for easy image uploads
 * Shows a button when empty, opens ImageLibrary when clicked
 */

export const createImagePlaceholderHTML = (placeholderText: string = 'Add Image') => {
  return `
    <div class="image-placeholder-container" style="position: relative; width: 100%; height: 100%; min-height: 200px; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
      <div class="image-placeholder-content" style="text-align: center; padding: 1rem;">
        <svg class="image-placeholder-icon" style="width: 3rem; height: 3rem; color: #9ca3af; margin-bottom: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <button class="image-placeholder-button" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
          ${placeholderText}
        </button>
        <p class="image-placeholder-hint" style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">Click to add image</p>
      </div>
      <img class="image-placeholder-img" style="display: none; width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" alt="" />
    </div>
  `;
};

export const imagePlaceholderCSS = `
  .image-placeholder-container:hover {
    background: #e5e7eb !important;
    border-color: #667eea !important;
  }
  .image-placeholder-container:hover .image-placeholder-button {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(102,126,234,0.3) !important;
  }
  .image-placeholder-container.has-image {
    border: none !important;
    background: transparent !important;
  }
  .image-placeholder-container.has-image .image-placeholder-content {
    display: none !important;
  }
  .image-placeholder-container.has-image .image-placeholder-img {
    display: block !important;
  }
`;





