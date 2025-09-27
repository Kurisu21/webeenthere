// services/AiService.js
class AiService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    // Use DeepSeek V3.1 (free) model
    this.model = 'deepseek/deepseek-chat-v3.1:free';
  }

  // Generate complete website template using OpenRoute API
  async generateCompleteTemplate(params) {
    try {
      const { description, websiteType, style, colorScheme, includeSections, userId } = params;
      
      console.log('Generating template with params:', params);
      
      if (!this.apiKey) {
        console.log('No API key found, using fallback template');
        return {
          success: true,
          template: this.createFallbackTemplate(params),
          reasoning: 'Generated fallback template (no API key configured)',
          suggestions: ['Configure OpenRoute API key for AI-generated templates']
        };
      }

      console.log('API key found, attempting to call OpenRoute API...');

      // Enhanced prompt with user input as priority
      const enhancedPrompt = this.buildTemplatePrompt({
        description,
        websiteType,
        style,
        colorScheme,
        includeSections
      });

      console.log('Sending request to OpenRoute API with prompt:', enhancedPrompt);

      // Call OpenRoute API
      const response = await this.callOpenRouteAPI(enhancedPrompt);
      
      if (!response.success) {
        console.log('OpenRoute API call failed:', response.error);
        console.log('Using fallback template');
        return {
          success: true,
          template: this.createFallbackTemplate(params),
          reasoning: `Generated fallback template (OpenRoute API failed: ${response.error})`,
          suggestions: ['Check API key validity and network connection', 'Verify OpenRoute API key is active']
        };
      }

      // Parse the AI response into template structure
      const template = this.parseTemplateResponse(response.content, params);
      
      return {
        success: true,
        template,
        reasoning: response.reasoning || 'Template generated successfully',
        suggestions: response.suggestions || []
      };

    } catch (error) {
      console.error('Generate Complete Template Error:', error);
      return {
        success: true,
        template: this.createFallbackTemplate(params),
        reasoning: 'Generated fallback template due to error',
        suggestions: ['Try refining your description for better results']
      };
    }
  }

  // Create fallback template
  createFallbackTemplate(params) {
    const { description, websiteType, style, colorScheme } = params;
    
    return {
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} ${websiteType} Template`,
      description: description || 'AI Generated Template',
      category: websiteType || 'ai-generated',
      elements: this.createFallbackElements(params),
      css_base: this.createFallbackCSS(params),
      tags: ['ai-generated', websiteType, style],
      reasoning: 'Generated fallback template',
      suggestions: ['Configure OpenRoute API key for AI-generated templates']
    };
  }

  // Build enhanced prompt prioritizing user input
  buildTemplatePrompt(params) {
    const { description, websiteType, style, colorScheme, includeSections } = params;
    
    return `You are a premium web designer and developer. Create a complete, professional website template based on these requirements:

USER REQUEST: "${description}"
WEBSITE TYPE: ${websiteType}
DESIGN STYLE: ${style}
COLOR SCHEME: ${colorScheme}

CRITICAL INSTRUCTIONS:
1. Create a complete website with header, hero, content sections, and footer
2. Use modern, professional design principles
3. Ensure responsive design for mobile and desktop
4. Include proper typography, spacing, and visual hierarchy
5. Make it visually appealing and user-friendly

REQUIRED SECTIONS:
- Header with navigation menu
- Hero section with compelling headline
- Main content area (2-3 sections based on user request)
- Footer with contact info

RESPONSE FORMAT - Return ONLY valid JSON, no other text. Keep CSS concise to avoid truncation:

{
  "name": "Professional ${websiteType} Template",
  "description": "${description}",
  "category": "${websiteType}",
  "elements": [
    {
      "id": "header_1",
      "type": "header",
      "content": "<nav class='navbar'><div class='nav-brand'>Your Brand</div><ul class='nav-menu'><li><a href='#home'>Home</a></li><li><a href='#about'>About</a></li><li><a href='#services'>Services</a></li><li><a href='#contact'>Contact</a></li></ul></nav>",
      "position": {"x": 0, "y": 0},
      "size": {"width": "100%", "height": "80px"},
      "styles": {
        "backgroundColor": "#1a1a1a",
        "color": "#ffffff",
        "padding": "0 20px",
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "space-between",
        "boxShadow": "0 2px 10px rgba(0,0,0,0.1)"
      }
    },
    {
      "id": "hero_1",
      "type": "hero",
      "content": "<div class='hero-content'><h1>Welcome to Our ${websiteType}</h1><p>Professional solutions for your business needs</p><button class='cta-button'>Get Started</button></div>",
      "position": {"x": 0, "y": 80},
      "size": {"width": "100%", "height": "500px"},
      "styles": {
        "backgroundColor": "#f8f9fa",
        "color": "#333333",
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "center",
        "textAlign": "center",
        "padding": "60px 20px"
      }
    }
  ],
  "css_base": "body { font-family: sans-serif; margin: 0; padding: 0; line-height: 1.6; color: #333; } .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; } .navbar { display: flex; justify-content: space-between; align-items: center; } .nav-menu { display: flex; list-style: none; gap: 30px; } .nav-menu a { color: #fff; text-decoration: none; font-weight: 500; } .hero-content h1 { font-size: 3rem; margin-bottom: 20px; font-weight: 700; } .hero-content p { font-size: 1.2rem; margin-bottom: 30px; color: #666; } .cta-button { background: #007bff; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 1.1rem; cursor: pointer; } .cta-button:hover { background: #0056b3; } @media (max-width: 768px) { .hero-content h1 { font-size: 2rem; } .nav-menu { flex-direction: column; gap: 15px; } }",
  "reasoning": "Created a professional ${websiteType} template with modern design, responsive layout, and user-friendly navigation. Used ${style} design principles with ${colorScheme} color scheme.",
  "suggestions": ["Add more content sections based on your specific needs", "Customize colors and fonts to match your brand", "Add images and icons for better visual appeal"]
}`;
  }

  // Call OpenRoute API
  async callOpenRouteAPI(prompt) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'WebBeenThere AI Template Generator'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.message || 'Unknown error';
        console.error(`OpenRoute API error: ${response.status} - ${errorMessage}`);
        throw new Error(`OpenRoute API error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenRoute API');
      }

      return {
        success: true,
        content,
        reasoning: 'Template generated using OpenRoute API'
      };

    } catch (error) {
      console.error('OpenRoute API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Parse AI response into template structure
  parseTemplateResponse(content, params) {
    try {
      console.log('Raw AI response:', content);
      
      // Clean the response - remove any markdown formatting
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to extract JSON from the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('No JSON found in response, using fallback');
        throw new Error('No JSON found in AI response');
      }

      const jsonString = jsonMatch[0];
      console.log('Extracted JSON string:', jsonString.substring(0, 200) + '...');
      
      // Try to parse the JSON
      let templateData;
      try {
        templateData = JSON.parse(jsonString);
      } catch (parseError) {
        console.log('JSON parse error:', parseError.message);
        console.log('Attempting to fix common JSON issues...');
        
        // Try to fix common JSON issues
        let fixedJson = jsonString
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
          .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,\}\]])/g, ': "$1"$2') // Quote unquoted string values
          .replace(/"css_base":\s*"([^"]*?)(?="[^"]*"[^"]*$)/g, '"css_base": "body { font-family: sans-serif; margin: 0; padding: 0; }"') // Fix truncated CSS
          .replace(/"reasoning":\s*"([^"]*?)(?="[^"]*"[^"]*$)/g, '"reasoning": "Template generated successfully"') // Fix truncated reasoning
          .replace(/"suggestions":\s*\[([^\]]*?)(?=\][^]]*$)/g, '"suggestions": []'); // Fix truncated suggestions
        
        console.log('Fixed JSON string:', fixedJson.substring(0, 200) + '...');
        templateData = JSON.parse(fixedJson);
      }
      
      console.log('Successfully parsed template data:', templateData);
      
      // Validate and enhance the template
      const enhancedTemplate = {
        name: templateData.name || `Professional ${params.websiteType} Template`,
        description: templateData.description || params.description,
        category: templateData.category || params.websiteType,
        elements: Array.isArray(templateData.elements) ? templateData.elements : [],
        css_base: templateData.css_base || '',
        tags: ['ai-generated', params.websiteType, params.style],
        reasoning: templateData.reasoning || 'Generated by AI',
        suggestions: Array.isArray(templateData.suggestions) ? templateData.suggestions : []
      };
      
      console.log('Enhanced template:', enhancedTemplate);
      return enhancedTemplate;

    } catch (error) {
      console.error('Parse Template Response Error:', error);
      console.log('Using fallback template due to parsing error');
      
      // Fallback: create a basic template
      return {
        name: 'AI Generated Template',
        description: params.description,
        category: 'ai-generated',
        elements: this.createFallbackElements(params),
        css_base: this.createFallbackCSS(params),
        tags: ['ai-generated', 'fallback'],
        reasoning: 'Generated fallback template due to parsing error',
        suggestions: ['Consider refining your description for better results']
      };
    }
  }

  // Create fallback elements when parsing fails
  createFallbackElements(params) {
    const { description, websiteType, style, colorScheme } = params;
    
    // Define color schemes
    const colorSchemes = {
      blue: { primary: '#2563eb', secondary: '#f8fafc', text: '#1e293b' },
      purple: { primary: '#7c3aed', secondary: '#faf5ff', text: '#581c87' },
      green: { primary: '#059669', secondary: '#f0fdf4', text: '#064e3b' },
      red: { primary: '#dc2626', secondary: '#fef2f2', text: '#991b1b' },
      dark: { primary: '#1f2937', secondary: '#111827', text: '#f9fafb' }
    };

    const colors = colorSchemes[colorScheme] || colorSchemes.blue;

    return [
      {
        id: 'header_1',
        type: 'header',
        content: 'Welcome to My Website',
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 80 },
        styles: {
          backgroundColor: colors.primary,
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '20px'
        }
      },
      {
        id: 'hero_1',
        type: 'hero',
        content: description || 'Your website description goes here',
        position: { x: 0, y: 80 },
        size: { width: 1200, height: 400 },
        styles: {
          backgroundColor: colors.secondary,
          color: colors.text,
          fontSize: '18px',
          textAlign: 'center',
          padding: '60px 20px'
        }
      },
      {
        id: 'text_1',
        type: 'text',
        content: `This is a ${style} ${websiteType} template generated by AI. Customize it to match your needs.`,
        position: { x: 50, y: 500 },
        size: { width: 1100, height: 100 },
        styles: {
          color: colors.text,
          fontSize: '16px',
          textAlign: 'left',
          padding: '20px'
        }
      },
      {
        id: 'button_1',
        type: 'button',
        content: 'Get Started',
        position: { x: 50, y: 620 },
        size: { width: 200, height: 50 },
        styles: {
          backgroundColor: colors.primary,
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '15px 30px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer'
        }
      }
    ];
  }

  // Create fallback CSS
  createFallbackCSS(params) {
    return `
/* AI Generated Template Styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
}
`;
  }
}

module.exports = AiService;