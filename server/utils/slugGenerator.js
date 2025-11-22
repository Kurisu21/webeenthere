/**
 * Utility functions for generating and validating website slugs
 */

/**
 * Sanitize a string to create a valid URL slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} - A sanitized slug
 */
function sanitizeSlug(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .trim()
    // Replace special characters with their readable equivalents
    .replace(/&/g, 'and')
    .replace(/\+/g, 'plus')
    .replace(/@/g, 'at')
    .replace(/#/g, 'hash')
    .replace(/\$/g, 'dollar')
    .replace(/%/g, 'percent')
    // Replace spaces and multiple dashes with single dash
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    // Remove all non-alphanumeric characters except dashes
    .replace(/[^a-z0-9-]/g, '')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 80);
}

/**
 * Generate a unique slug by appending a number if the base slug exists
 * @param {Object} websiteModel - The website model instance
 * @param {string} baseSlug - The base slug to check
 * @param {number} excludeId - Optional website ID to exclude from check (for updates)
 * @returns {Promise<string>} - A unique slug
 */
async function generateUniqueSlug(websiteModel, baseSlug, excludeId = null) {
  let slug = sanitizeSlug(baseSlug);
  
  // If slug is empty after sanitization, generate a default one
  if (!slug) {
    slug = 'website-' + Date.now();
  }

  let finalSlug = slug;
  let counter = 1;
  const maxAttempts = 100; // Prevent infinite loops

  while (counter <= maxAttempts) {
    const existing = await websiteModel.findBySlug(finalSlug);
    
    // If no existing website found, or it's the same website (for updates), use this slug
    if (!existing || (excludeId && existing.id === excludeId)) {
      return finalSlug;
    }

    // Try with a number suffix
    counter++;
    finalSlug = `${slug}-${counter}`;
  }

  // Fallback: use timestamp if we can't find a unique slug
  return `${slug}-${Date.now()}`;
}

/**
 * Generate a slug from a template name for a new website
 * @param {string} templateName - The template name
 * @param {number} userId - The user ID to make it more unique
 * @returns {string} - A sanitized slug with timestamp
 */
function generateSlugFromTemplate(templateName, userId = null) {
  const baseSlug = sanitizeSlug(templateName);
  const timestamp = Date.now();
  const userSuffix = userId ? `-u${userId}` : '';
  
  // Combine base slug with timestamp and optional user ID
  return `${baseSlug}-${timestamp}${userSuffix}`;
}

/**
 * Validate if a slug is available
 * @param {Object} websiteModel - The website model instance
 * @param {string} slug - The slug to check
 * @param {number} excludeId - Optional website ID to exclude from check (for updates)
 * @returns {Promise<boolean>} - True if available, false if taken
 */
async function isSlugAvailable(websiteModel, slug, excludeId = null) {
  const sanitized = sanitizeSlug(slug);
  if (!sanitized) {
    return false;
  }

  const existing = await websiteModel.findBySlug(sanitized);
  
  // Available if no existing website, or it's the same website (for updates)
  return !existing || (excludeId && existing.id === excludeId);
}

module.exports = {
  sanitizeSlug,
  generateUniqueSlug,
  generateSlugFromTemplate,
  isSlugAvailable
};














