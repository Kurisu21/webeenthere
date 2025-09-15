// services/AiService.js
const axios = require('axios');

class AiService {
  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.baseUrl = 'https://openrouter.ai/api/v1';
  }

  async generateWebsiteSection(prompt, websiteContext = '') {
    try {
      const systemPrompt = `You are a professional website builder AI assistant. Your task is to generate website sections based on user prompts.

CONTEXT: ${websiteContext}

INSTRUCTIONS:
1. Generate a JSON response with website elements
2. Each element should have: id, type, content, styles, position, size
3. Element types: hero, text, button, image, gallery, contact, about
4. Styles should include: color, fontSize, fontWeight, backgroundColor, padding, textAlign, borderRadius, border, borderColor, opacity
5. Position should be: {x: number, y: number}
6. Size should be: {width: number, height: number}
7. Make content relevant to the user's request
8. Use modern, professional styling
9. Ensure elements are properly positioned and sized

RESPONSE FORMAT:
{
  "elements": [
    {
      "id": "unique-id",
      "type": "element-type",
      "content": "element content",
      "styles": {
        "color": "#333333",
        "fontSize": "16px",
        "fontWeight": "normal",
        "backgroundColor": "#ffffff",
        "padding": "20px",
        "textAlign": "center",
        "borderRadius": "8px",
        "border": "1px solid",
        "borderColor": "#e0e0e0",
        "opacity": "1"
      },
      "position": {"x": 0, "y": 0},
      "size": {"width": 300, "height": 100}
    }
  ],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'deepseek/deepseek-chat', // Free DeepSeek model
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000', // Optional: for tracking
            'X-Title': 'Webeenthere AI Builder' // Optional: for tracking
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      // Try to parse JSON response
      try {
        const parsedResponse = JSON.parse(aiResponse);
        return {
          success: true,
          elements: parsedResponse.elements || [],
          suggestions: parsedResponse.suggestions || [],
          rawResponse: aiResponse
        };
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            elements: parsedResponse.elements || [],
            suggestions: parsedResponse.suggestions || [],
            rawResponse: aiResponse
          };
        }
        
        // Fallback: return a default structure
        return {
          success: true,
          elements: [{
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
          }],
          suggestions: ['Try rephrasing your request for better results'],
          rawResponse: aiResponse
        };
      }
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        elements: [],
        suggestions: []
      };
    }
  }

  async improveWebsiteContent(existingElements, improvementPrompt) {
    try {
      const elementsContext = existingElements.map(el => 
        `${el.type}: ${el.content} (${el.styles.color}, ${el.styles.fontSize})`
      ).join(', ');

      const systemPrompt = `You are a professional website content optimizer. Analyze the existing website elements and suggest improvements.

EXISTING ELEMENTS: ${elementsContext}

INSTRUCTIONS:
1. Analyze the current content and styling
2. Suggest improvements based on the user's request
3. Return a JSON response with improved elements
4. Maintain the same structure as input elements
5. Focus on content quality, readability, and visual appeal

RESPONSE FORMAT:
{
  "improvedElements": [
    {
      "id": "same-or-new-id",
      "type": "element-type",
      "content": "improved content",
      "styles": {
        "color": "#333333",
        "fontSize": "16px",
        "fontWeight": "normal",
        "backgroundColor": "#ffffff",
        "padding": "20px",
        "textAlign": "center",
        "borderRadius": "8px",
        "border": "1px solid",
        "borderColor": "#e0e0e0",
        "opacity": "1"
      },
      "position": {"x": 0, "y": 0},
      "size": {"width": 300, "height": 100}
    }
  ],
  "improvements": ["improvement1", "improvement2"],
  "reasoning": "explanation of changes"
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
          improvedElements: parsedResponse.improvedElements || existingElements,
          improvements: parsedResponse.improvements || [],
          reasoning: parsedResponse.reasoning || '',
          rawResponse: aiResponse
        };
      } catch (parseError) {
        return {
          success: true,
          improvedElements: existingElements,
          improvements: ['AI response received but couldn\'t parse structured data'],
          reasoning: aiResponse,
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

  async generateSuggestions(websiteType, currentElements) {
    const suggestions = {
      'portfolio': [
        'Add a professional headshot section',
        'Create a skills showcase with icons',
        'Add a testimonials section',
        'Include a contact form with social links'
      ],
      'business': [
        'Add a services section with pricing',
        'Create a team member showcase',
        'Include customer testimonials',
        'Add a call-to-action button'
      ],
      'blog': [
        'Add a featured posts section',
        'Create a newsletter signup',
        'Include social media links',
        'Add a search functionality'
      ],
      'ecommerce': [
        'Add a product showcase',
        'Create a featured products section',
        'Include customer reviews',
        'Add a shopping cart button'
      ]
    };

    return suggestions[websiteType] || [
      'Add a hero section with compelling headline',
      'Include an about section',
      'Add contact information',
      'Create a call-to-action section'
    ];
  }
}

module.exports = AiService;


