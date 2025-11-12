// services/PreviewService.js
const puppeteer = require('puppeteer');

class PreviewService {
  constructor() {
    this.browser = null;
  }

  /**
   * Initialize Puppeteer browser instance
   */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ],
        protocolTimeout: 120000 // Increase timeout to 120 seconds (2 minutes)
      });
    }
    return this.browser;
  }

  /**
   * Close browser instance
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Parse HTML content - handles both plain HTML and JSON format from GrapesJS
   * @param {string} htmlContent - HTML content (may be JSON stringified)
   * @returns {string} - Parsed HTML content
   */
  parseHtmlContent(htmlContent) {
    if (!htmlContent) return '';
    
    // Try to parse as JSON (GrapesJS format)
    try {
      const parsed = JSON.parse(htmlContent);
      if (parsed && typeof parsed === 'object') {
        // If it's an object with html property, use that
        if (parsed.html) {
          return parsed.html;
        }
        // If it's an object with both html and css, return html
        if (parsed.html_content) {
          return parsed.html_content;
        }
      }
    } catch (e) {
      // Not JSON, treat as plain HTML
    }
    
    return htmlContent;
  }

  /**
   * Parse CSS content - handles both plain CSS and JSON format from GrapesJS
   * @param {string} cssContent - CSS content (may be JSON stringified)
   * @returns {string} - Parsed CSS content
   */
  parseCssContent(cssContent, htmlContent) {
    // First try the provided cssContent
    if (cssContent) {
      try {
        const parsed = JSON.parse(cssContent);
        if (parsed && typeof parsed === 'object' && parsed.css) {
          return parsed.css;
        }
      } catch (e) {
        // Not JSON, use as-is
      }
      return cssContent;
    }
    
    // If no cssContent, try to extract from htmlContent JSON
    if (htmlContent) {
      try {
        const parsed = JSON.parse(htmlContent);
        if (parsed && typeof parsed === 'object' && parsed.css) {
          return parsed.css;
        }
      } catch (e) {
        // Not JSON
      }
    }
    
    return '';
  }

  /**
   * Generate preview screenshot for a website
   * @param {string} htmlContent - HTML content of the website
   * @param {string} cssContent - CSS content of the website
   * @param {Object} options - Options for screenshot (width, height, quality)
   * @returns {Promise<Buffer>} - PNG image buffer
   */
  async generatePreview(htmlContent, cssContent, options = {}) {
    const {
      width = 1280,
      height = 720,
      quality = 80
    } = options;

    let page = null;
    try {
      // Parse HTML and CSS content (handle JSON format from GrapesJS)
      const parsedHtml = this.parseHtmlContent(htmlContent);
      const parsedCss = this.parseCssContent(cssContent, htmlContent);

      if (!parsedHtml) {
        throw new Error('No HTML content to render');
      }

      const browser = await this.initBrowser();
      page = await browser.newPage();

      // Set viewport size
      await page.setViewport({
        width: width,
        height: height,
        deviceScaleFactor: 1
      });

      // Combine HTML and CSS into a complete HTML document
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${parsedCss || ''}</style>
        </head>
        <body>
          ${parsedHtml}
        </body>
        </html>
      `;

      // Set content and wait for it to load (use domcontentloaded for faster loading)
      await page.setContent(fullHtml, {
        waitUntil: 'domcontentloaded', // Changed from networkidle0 to domcontentloaded for faster loading
        timeout: 30000
      });

      // Wait for page to be fully rendered (reduced from 1500ms to 1000ms)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the actual page dimensions
      const pageDimensions = await page.evaluate(() => {
        return {
          width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
          height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
        };
      });

      // Use actual page dimensions or fallback to provided dimensions
      const screenshotWidth = Math.min(pageDimensions.width || width, width);
      const screenshotHeight = Math.min(pageDimensions.height || height, height * 2); // Allow up to 2x height for full page

      // Take screenshot - use fullPage if content is taller than viewport
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: screenshotHeight > height,
        clip: screenshotHeight <= height ? {
          x: 0,
          y: 0,
          width: screenshotWidth,
          height: screenshotHeight
        } : undefined,
        timeout: 60000 // 60 second timeout for screenshot
      });

      return screenshot;
    } catch (error) {
      console.error('Error generating preview:', error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Generate preview for a website from database
   * @param {Object} website - Website object with html_content and css_content
   * @param {Object} options - Screenshot options
   * @returns {Promise<Buffer>} - PNG image buffer
   */
  async generateWebsitePreview(website, options = {}) {
    if (!website || !website.html_content) {
      throw new Error('Website content is required');
    }

    return await this.generatePreview(
      website.html_content,
      website.css_content || '',
      options
    );
  }
}

module.exports = PreviewService;

