// services/ContextAwareAiService.js
const axios = require('axios');

class ContextAwareAiService {
  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.baseUrl = 'https://openrouter.ai/api/v1';
  }

  // Sanitize content to remove HTML tags
  sanitizeContent(content) {
    if (typeof content !== 'string') return content;
    
    // Remove HTML tags but keep the text content
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<') // Decode HTML entities
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Clean AI-generated elements
  cleanAiElements(elements) {
    if (!Array.isArray(elements)) return elements;
    
    return elements.map(element => ({
      ...element,
      content: this.sanitizeContent(element.content)
    }));
  }

  // Analyze website context and create intelligent summaries
  analyzeWebsiteContext(elements, userAction = 'generate') {
    if (!elements || elements.length === 0) {
      return {
        summary: 'Empty website - starting from scratch',
        elementTypes: [],
        contentThemes: [],
        layoutPattern: 'empty',
        suggestions: ['Add a hero section', 'Create navigation', 'Add content sections']
      };
    }

    // Analyze element types and their distribution
    const elementTypes = elements.map(el => el.type);
    const typeCounts = elementTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Extract content themes
    const contentThemes = this.extractContentThemes(elements);
    
    // Analyze layout pattern
    const layoutPattern = this.analyzeLayoutPattern(elements);
    
    // Generate contextual suggestions
    const suggestions = this.generateContextualSuggestions(typeCounts, contentThemes, layoutPattern, userAction);

    return {
      summary: this.createContextSummary(typeCounts, contentThemes, layoutPattern),
      elementTypes: Object.keys(typeCounts),
      contentThemes,
      layoutPattern,
      suggestions,
      elementCount: elements.length,
      hasNavigation: elementTypes.includes('navigation'),
      hasHero: elementTypes.includes('hero'),
      hasFooter: elementTypes.includes('footer')
    };
  }

  extractContentThemes(elements) {
    const themes = [];
    const content = elements.map(el => el.content.toLowerCase()).join(' ');
    
    // Business themes
    if (content.includes('business') || content.includes('company') || content.includes('service')) {
      themes.push('business');
    }
    if (content.includes('portfolio') || content.includes('work') || content.includes('project')) {
      themes.push('portfolio');
    }
    if (content.includes('blog') || content.includes('article') || content.includes('post')) {
      themes.push('blog');
    }
    if (content.includes('shop') || content.includes('product') || content.includes('buy')) {
      themes.push('ecommerce');
    }
    if (content.includes('contact') || content.includes('email') || content.includes('phone')) {
      themes.push('contact');
    }
    if (content.includes('about') || content.includes('team') || content.includes('story')) {
      themes.push('about');
    }
    
    return themes.length > 0 ? themes : ['general'];
  }

  analyzeLayoutPattern(elements) {
    if (elements.length === 0) return 'empty';
    if (elements.length === 1) return 'single-element';
    if (elements.length <= 3) return 'simple';
    if (elements.length <= 6) return 'moderate';
    return 'complex';
  }

  createContextSummary(typeCounts, themes, layoutPattern) {
    const typeSummary = Object.entries(typeCounts)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
    
    const themeSummary = themes.length > 0 ? ` (${themes.join(', ')} theme)` : '';
    
    return `${layoutPattern} layout with ${typeSummary}${themeSummary}`;
  }

  generateContextualSuggestions(typeCounts, themes, layoutPattern, userAction) {
    const suggestions = [];
    
    // Layout-based suggestions
    if (layoutPattern === 'empty') {
      suggestions.push('Add a hero section with compelling headline');
      suggestions.push('Create navigation menu');
      suggestions.push('Add main content area');
    } else if (layoutPattern === 'simple') {
      suggestions.push('Add more content sections');
      suggestions.push('Include call-to-action buttons');
      suggestions.push('Add footer with links');
    } else if (layoutPattern === 'moderate') {
      suggestions.push('Optimize existing content');
      suggestions.push('Add interactive elements');
      suggestions.push('Improve visual hierarchy');
    }

    // Theme-based suggestions
    if (themes.includes('business')) {
      suggestions.push('Add testimonials section');
      suggestions.push('Include service descriptions');
      suggestions.push('Add team member profiles');
    }
    if (themes.includes('portfolio')) {
      suggestions.push('Add project gallery');
      suggestions.push('Include skills section');
      suggestions.push('Add client testimonials');
    }
    if (themes.includes('ecommerce')) {
      suggestions.push('Add product showcase');
      suggestions.push('Include pricing section');
      suggestions.push('Add customer reviews');
    }

    // Element-specific suggestions
    if (!typeCounts.hero) suggestions.push('Add hero section');
    if (!typeCounts.navigation) suggestions.push('Create navigation menu');
    if (!typeCounts.footer) suggestions.push('Add footer section');
    if (!typeCounts.button) suggestions.push('Add call-to-action buttons');

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  // Create intelligent system prompt based on context
  createIntelligentSystemPrompt(context, userAction = 'generate') {
    const { summary, elementTypes, contentThemes, layoutPattern, suggestions } = context;
    
    let actionSpecificInstructions = '';
    if (userAction === 'generate') {
      actionSpecificInstructions = `
GENERATION MODE:
- Create new elements that complement the existing website
- Consider the current layout pattern: ${layoutPattern}
- Build upon existing themes: ${contentThemes.join(', ')}
- Suggested improvements: ${suggestions.slice(0, 3).join(', ')}`;
    } else if (userAction === 'improve') {
      actionSpecificInstructions = `
IMPROVEMENT MODE:
- Enhance existing elements without changing core structure
- Focus on better styling, content, and user experience
- Maintain consistency with current design patterns
- Optimize for the ${layoutPattern} layout pattern`;
    }

    return `You are an expert website builder AI with deep understanding of web design principles.

CURRENT WEBSITE STATE: ${summary}
EXISTING ELEMENTS: ${elementTypes.join(', ')}
CONTENT THEMES: ${contentThemes.join(', ')}
LAYOUT COMPLEXITY: ${layoutPattern}

${actionSpecificInstructions}

DESIGN PRINCIPLES:
1. Maintain visual consistency with existing elements
2. Follow modern web design trends
3. Ensure responsive design considerations
4. Optimize for user experience
5. Use appropriate color schemes and typography

ELEMENT SPECIFICATIONS:
- Each element needs: id, type, content, styles, position, size
- Element types: hero, text, button, image, gallery, contact, about, navigation, footer, testimonial, feature
- Content: MUST be clean text only - NO HTML tags, NO markup, just plain text content
- Styles: color, fontSize, fontWeight, backgroundColor, padding, textAlign, borderRadius, border, borderColor, opacity
- Position: {x: number, y: number} (consider existing elements)
- Size: {width: number, height: number} (responsive-friendly)

IMPORTANT CONTENT RULES:
- Content field should contain ONLY plain text
- NO HTML tags like <h1>, <p>, <div>, etc.
- NO markup or formatting codes
- Just the actual text content that will be displayed
- Examples: "Welcome to Our Company" not "<h1>Welcome to Our Company</h1>"

RESPONSE FORMAT:
{
  "elements": [/* array of elements */],
  "suggestions": [/* 3-5 contextual suggestions */],
  "reasoning": "Brief explanation of design choices"
}`;
  }

  async generateWebsiteSection(prompt, elements = [], userAction = 'generate') {
    try {
      // Analyze current website context
      const context = this.analyzeWebsiteContext(elements, userAction);
      
      // Create intelligent system prompt
      const systemPrompt = this.createIntelligentSystemPrompt(context, userAction);
      
      // Enhance user prompt with context
      const enhancedPrompt = this.enhanceUserPrompt(prompt, context);

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'deepseek/deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: enhancedPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Webeenthere AI Builder'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      // Enhanced JSON parsing with better error handling
      return this.parseAiResponse(aiResponse, context);
      
    } catch (error) {
      console.error('Context-Aware AI Service Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        elements: [],
        suggestions: []
      };
    }
  }

  enhanceUserPrompt(prompt, context) {
    const { elementTypes, contentThemes, layoutPattern } = context;
    
    let contextHint = '';
    if (elementTypes.length > 0) {
      contextHint += `Current website has: ${elementTypes.join(', ')}. `;
    }
    if (contentThemes.length > 0) {
      contextHint += `Theme: ${contentThemes.join(', ')}. `;
    }
    contextHint += `Layout: ${layoutPattern}. `;
    
    return `${contextHint}User request: ${prompt}`;
  }

  parseAiResponse(aiResponse, context) {
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return {
        success: true,
        elements: this.cleanAiElements(parsedResponse.elements || []),
        suggestions: parsedResponse.suggestions || context.suggestions,
        reasoning: parsedResponse.reasoning || '',
        context: context,
        rawResponse: aiResponse
      };
    } catch (parseError) {
      console.log('Initial JSON parse failed:', parseError.message);
      console.log('AI Response:', aiResponse.substring(0, 200) + '...');
      
      // Enhanced JSON extraction
      const jsonStart = aiResponse.indexOf('{');
      if (jsonStart !== -1) {
        let braceCount = 0;
        let jsonEnd = -1;
        
        for (let i = jsonStart; i < aiResponse.length; i++) {
          if (aiResponse[i] === '{') braceCount++;
          if (aiResponse[i] === '}') braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
        
        if (jsonEnd !== -1) {
          try {
            const jsonString = aiResponse.substring(jsonStart, jsonEnd + 1);
            const parsedResponse = JSON.parse(jsonString);
            return {
              success: true,
              elements: parsedResponse.elements || [],
              suggestions: parsedResponse.suggestions || context.suggestions,
              reasoning: parsedResponse.reasoning || '',
              context: context,
              rawResponse: aiResponse
            };
          } catch (secondParseError) {
            console.log('Second JSON parse failed:', secondParseError.message);
          }
        }
      }
      
      // Fallback with context-aware default
      return {
        success: true,
        elements: this.cleanAiElements([{
          id: `ai-generated-${Date.now()}`,
          type: 'text',
          content: aiResponse.substring(0, 200) + '...',
          styles: {
            color: '#333333',
            fontSize: '16px',
            fontWeight: 'normal',
            backgroundColor: '#f8f9fa',
            padding: '20px',
            textAlign: 'left',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: '#e0e0e0',
            opacity: '1'
          },
          position: { x: 50, y: 50 },
          size: { width: 400, height: 100 }
        }]),
        suggestions: context.suggestions,
        reasoning: 'AI response received but couldn\'t parse structured data',
        context: context,
        rawResponse: aiResponse
      };
    }
  }

  async improveWebsiteContent(existingElements, improvementPrompt) {
    try {
      // Analyze context for improvement
      const context = this.analyzeWebsiteContext(existingElements, 'improve');
      
      const systemPrompt = `You are an expert website optimizer AI.

CURRENT WEBSITE STATE: ${context.summary}
EXISTING ELEMENTS: ${context.elementTypes.join(', ')}
CONTENT THEMES: ${context.contentThemes.join(', ')}
LAYOUT COMPLEXITY: ${context.layoutPattern}

IMPROVEMENT FOCUS:
- Enhance existing elements without breaking the layout
- Improve content quality and relevance
- Optimize styling for better user experience
- Maintain design consistency
- Consider responsive design improvements

CONTENT RULES:
- Content field must contain ONLY clean text - NO HTML tags
- NO markup like <h1>, <p>, <div>, etc.
- Just plain text content that will be displayed
- Examples: "Professional Solutions" not "<h1>Professional Solutions</h1>"

RESPONSE FORMAT:
{
  "improvedElements": [/* array of improved elements */],
  "improvements": [/* list of specific improvements made */],
  "reasoning": "explanation of optimization choices"
}`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'deepseek/deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: improvementPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Webeenthere AI Builder'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      try {
        const parsedResponse = JSON.parse(aiResponse);
        return {
          success: true,
          improvedElements: this.cleanAiElements(parsedResponse.improvedElements || existingElements),
          improvements: parsedResponse.improvements || [],
          reasoning: parsedResponse.reasoning || '',
          context: context,
          rawResponse: aiResponse
        };
      } catch (parseError) {
        console.log('Improvement JSON parse failed:', parseError.message);
        
        // Enhanced JSON extraction for improvements
        const jsonStart = aiResponse.indexOf('{');
        if (jsonStart !== -1) {
          let braceCount = 0;
          let jsonEnd = -1;
          
          for (let i = jsonStart; i < aiResponse.length; i++) {
            if (aiResponse[i] === '{') braceCount++;
            if (aiResponse[i] === '}') braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
          
          if (jsonEnd !== -1) {
            try {
              const jsonString = aiResponse.substring(jsonStart, jsonEnd + 1);
              const parsedResponse = JSON.parse(jsonString);
              return {
                success: true,
                improvedElements: this.cleanAiElements(parsedResponse.improvedElements || existingElements),
                improvements: parsedResponse.improvements || [],
                reasoning: parsedResponse.reasoning || '',
                context: context,
                rawResponse: aiResponse
              };
            } catch (secondParseError) {
              console.log('Second improvement JSON parse failed:', secondParseError.message);
            }
          }
        }
        
        return {
          success: true,
          improvedElements: existingElements,
          improvements: ['AI response received but couldn\'t parse structured data'],
          reasoning: aiResponse,
          context: context,
          rawResponse: aiResponse
        };
      }
    } catch (error) {
      console.error('AI Improvement Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        improvedElements: existingElements,
        improvements: []
      };
    }
  }
}

module.exports = ContextAwareAiService;
