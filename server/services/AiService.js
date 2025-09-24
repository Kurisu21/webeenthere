// services/AiService.js
class AiService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  // Generate website section using AI
  async generateWebsiteSection(prompt, elements = [], action = 'generate') {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'OpenAI API key not configured',
          elements: [],
          suggestions: [],
          reasoning: 'API configuration missing'
        };
      }

      // For now, return mock data until OpenAI integration is properly set up
      const mockResponse = this.generateMockResponse(prompt, elements, action);
      
      return {
        success: true,
        elements: mockResponse.elements,
        suggestions: mockResponse.suggestions,
        reasoning: mockResponse.reasoning,
        rawResponse: mockResponse.rawResponse
      };
    } catch (error) {
      console.error('AiService Error:', error);
      return {
        success: false,
        error: error.message,
        elements: [],
        suggestions: [],
        reasoning: 'AI generation failed'
      };
    }
  }

  // Improve existing website content
  async improveWebsiteContent(existingElements, improvementPrompt) {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'OpenAI API key not configured',
          improvedElements: existingElements,
          improvements: [],
          reasoning: 'API configuration missing'
        };
      }

      // For now, return mock improvements
      const mockImprovements = this.generateMockImprovements(existingElements, improvementPrompt);
      
      return {
        success: true,
        improvedElements: mockImprovements.improvedElements,
        improvements: mockImprovements.improvements,
        reasoning: mockImprovements.reasoning,
        rawResponse: mockImprovements.rawResponse
      };
    } catch (error) {
      console.error('AiService Improvement Error:', error);
      return {
        success: false,
        error: error.message,
        improvedElements: existingElements,
        improvements: [],
        reasoning: 'AI improvement failed'
      };
    }
  }

  // Generate mock response for development/testing
  generateMockResponse(prompt, elements, action) {
    const elementId = Date.now().toString();
    
    // Generate different content based on prompt keywords
    let content = '';
    let elementType = 'section';
    
    if (prompt.toLowerCase().includes('hero') || prompt.toLowerCase().includes('banner')) {
      elementType = 'hero';
      content = `
        <div class="hero-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 80px 20px; text-align: center; color: white;">
          <h1 style="font-size: 3rem; margin-bottom: 20px; font-weight: bold;">Welcome to Our Amazing Website</h1>
          <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9;">Discover something incredible with our innovative solutions</p>
          <button style="background: white; color: #667eea; padding: 15px 30px; border: none; border-radius: 5px; font-size: 1.1rem; font-weight: bold; cursor: pointer;">Get Started</button>
        </div>
      `;
    } else if (prompt.toLowerCase().includes('nav') || prompt.toLowerCase().includes('menu')) {
      elementType = 'navigation';
      content = `
        <nav style="background: #333; padding: 15px 0;">
          <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
            <div style="color: white; font-size: 1.5rem; font-weight: bold;">Logo</div>
            <ul style="display: flex; list-style: none; margin: 0; padding: 0;">
              <li style="margin: 0 20px;"><a href="#" style="color: white; text-decoration: none;">Home</a></li>
              <li style="margin: 0 20px;"><a href="#" style="color: white; text-decoration: none;">About</a></li>
              <li style="margin: 0 20px;"><a href="#" style="color: white; text-decoration: none;">Services</a></li>
              <li style="margin: 0 20px;"><a href="#" style="color: white; text-decoration: none;">Contact</a></li>
            </ul>
          </div>
        </nav>
      `;
    } else if (prompt.toLowerCase().includes('footer')) {
      elementType = 'footer';
      content = `
        <footer style="background: #222; color: white; padding: 40px 20px; text-align: center;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <p style="margin-bottom: 20px;">© 2024 Your Company Name. All rights reserved.</p>
            <div style="display: flex; justify-content: center; gap: 20px;">
              <a href="#" style="color: white; text-decoration: none;">Privacy Policy</a>
              <a href="#" style="color: white; text-decoration: none;">Terms of Service</a>
              <a href="#" style="color: white; text-decoration: none;">Contact Us</a>
            </div>
          </div>
        </footer>
      `;
    } else if (prompt.toLowerCase().includes('product') || prompt.toLowerCase().includes('shop')) {
      elementType = 'product-section';
      content = `
        <section style="padding: 60px 20px; background: #f8f9fa;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 40px; font-size: 2.5rem;">Our Products</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 15px; color: #333;">Product 1</h3>
                <p style="color: #666; margin-bottom: 20px;">Amazing product description that highlights key features and benefits.</p>
                <button style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Learn More</button>
              </div>
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 15px; color: #333;">Product 2</h3>
                <p style="color: #666; margin-bottom: 20px;">Another great product with compelling features and value proposition.</p>
                <button style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Learn More</button>
              </div>
            </div>
          </div>
        </section>
      `;
    } else {
      // Default content section
      content = `
        <section style="padding: 60px 20px;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 30px; font-size: 2.5rem; color: #333;">${this.extractTitleFromPrompt(prompt)}</h2>
            <p style="text-align: center; font-size: 1.1rem; color: #666; line-height: 1.6; margin-bottom: 40px;">
              ${this.extractDescriptionFromPrompt(prompt)}
            </p>
            <div style="text-align: center;">
              <button style="background: #007bff; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 1.1rem; cursor: pointer;">Learn More</button>
            </div>
          </div>
        </section>
      `;
    }

    return {
      elements: [{
        id: elementId,
        type: elementType,
        content: content,
        text: this.extractTextFromContent(content),
        timestamp: Date.now()
      }],
      suggestions: [
        'Add more visual elements',
        'Include call-to-action buttons',
        'Consider adding images or icons'
      ],
      reasoning: `Generated ${elementType} based on prompt: "${prompt}"`,
      rawResponse: {
        prompt: prompt,
        action: action,
        elementCount: elements.length,
        generatedAt: new Date().toISOString()
      }
    };
  }

  // Generate mock improvements
  generateMockImprovements(existingElements, improvementPrompt) {
    const improvedElements = existingElements.map(element => {
      // Add some basic improvements
      const improvedElement = { ...element };
      
      if (improvementPrompt.toLowerCase().includes('color') || improvementPrompt.toLowerCase().includes('styling')) {
        // Add some color improvements
        improvedElement.content = improvedElement.content.replace(
          /style="([^"]*)"/g,
          (match, styles) => {
            if (!styles.includes('color')) {
              return `style="${styles}; color: #333;"`;
            }
            return match;
          }
        );
      }
      
      if (improvementPrompt.toLowerCase().includes('spacing') || improvementPrompt.toLowerCase().includes('padding')) {
        // Add spacing improvements
        improvedElement.content = improvedElement.content.replace(
          /style="([^"]*)"/g,
          (match, styles) => {
            if (!styles.includes('padding') && !styles.includes('margin')) {
              return `style="${styles}; padding: 20px;"`;
            }
            return match;
          }
        );
      }
      
      return improvedElement;
    });

    return {
      improvedElements: improvedElements,
      improvements: [
        'Enhanced visual styling',
        'Improved spacing and layout',
        'Added better color contrast'
      ],
      reasoning: `Applied improvements based on: "${improvementPrompt}"`,
      rawResponse: {
        improvementPrompt: improvementPrompt,
        originalElementCount: existingElements.length,
        improvedAt: new Date().toISOString()
      }
    };
  }

  // Helper methods
  extractTitleFromPrompt(prompt) {
    // Extract a title from the prompt
    const words = prompt.split(' ');
    if (words.length <= 3) {
      return prompt.charAt(0).toUpperCase() + prompt.slice(1);
    }
    return words.slice(0, 3).join(' ').charAt(0).toUpperCase() + words.slice(0, 3).join(' ').slice(1);
  }

  extractDescriptionFromPrompt(prompt) {
    // Generate a description based on the prompt
    if (prompt.toLowerCase().includes('business')) {
      return 'Professional business solutions designed to help your company grow and succeed in today\'s competitive market.';
    } else if (prompt.toLowerCase().includes('portfolio')) {
      return 'Showcasing creative work and professional projects that demonstrate expertise and innovation.';
    } else if (prompt.toLowerCase().includes('product')) {
      return 'High-quality products that deliver exceptional value and meet the needs of our customers.';
    } else {
      return 'Discover amazing content and features that will enhance your experience and provide valuable insights.';
    }
  }

  extractTextFromContent(content) {
    // Extract text content from HTML
    return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Analyze website context for orchestration
  analyzeWebsiteContext(elements) {
    const context = {
      elementCount: elements.length,
      hasNavigation: false,
      hasHero: false,
      hasFooter: false,
      contentThemes: [],
      summary: ''
    };

    elements.forEach(element => {
      const content = element.content || element.text || '';
      const lowerContent = content.toLowerCase();
      
      // Check for navigation
      if (lowerContent.includes('nav') || lowerContent.includes('menu') || 
          element.type === 'navigation') {
        context.hasNavigation = true;
      }
      
      // Check for hero section
      if (lowerContent.includes('hero') || lowerContent.includes('banner') || 
          element.type === 'hero') {
        context.hasHero = true;
      }
      
      // Check for footer
      if (lowerContent.includes('footer') || element.type === 'footer') {
        context.hasFooter = true;
      }
      
      // Analyze content themes
      if (lowerContent.includes('business') || lowerContent.includes('corporate')) {
        context.contentThemes.push('business');
      }
      if (lowerContent.includes('portfolio') || lowerContent.includes('gallery')) {
        context.contentThemes.push('portfolio');
      }
      if (lowerContent.includes('shop') || lowerContent.includes('product') || 
          lowerContent.includes('ecommerce')) {
        context.contentThemes.push('ecommerce');
      }
    });

    // Generate summary
    if (context.elementCount === 0) {
      context.summary = 'Empty website - starting from scratch';
    } else if (context.elementCount < 3) {
      context.summary = `Simple website with ${context.elementCount} elements`;
    } else {
      context.summary = `Complex website with ${context.elementCount} elements`;
    }

    return context;
  }
}

module.exports = AiService;
