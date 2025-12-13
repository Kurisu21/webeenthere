
// services/AiService.js
const databaseSettingsService = require('./DatabaseSettingsService');

class AiService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    // Model will be loaded from settings, with fallback to default
    this.model = null;
    this.temperature = 0.7;
  }

  // Get AI configuration from settings (with caching)
  async getAiConfig() {
    // Set model directly to default
    this.model = 'x-ai/grok-4.1-fast';
    this.temperature = 0.7;
    
    try {
      const config = await databaseSettingsService.getAiConfig();
      // Only override defaults if config exists and has values
      if (config) {
        if (config.model) this.model = config.model;
        if (config.temperature) this.temperature = config.temperature;
      }
    } catch (error) {
      console.error('Failed to load AI config from settings, using defaults:', error);
      // Already set to defaults above, so just continue
    }
    
    return {
      model: this.model,
      temperature: this.temperature
    };
  }

  // Ensure config is loaded before making API calls
  async ensureConfigLoaded() {
    if (!this.model) {
      await this.getAiConfig();
    }
  }

  // Build simplified prompt without structure guidance
  buildSimpleTemplatePrompt(description) {
    return `You are an expert web designer. Generate a complete website template based on the user's description.

CRITICAL: Return ONLY valid JSON. The HTML and CSS strings MUST be properly escaped for JSON:
- Escape all quotes: " becomes \\"
- Escape all newlines: \\n becomes \\\\n
- Escape all backslashes: \\ becomes \\\\
- Do NOT use @import in CSS - use direct CSS only
- Do NOT include <script>, <iframe>, or external links

**IMPORTANT - IMAGE PLACEHOLDERS:**
For ALL images in your HTML, use the editor's image placeholder block format:
<div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Image" style="width: 100%; min-height: 300px; border-radius: 8px;"></div>

DO NOT use regular <img> tags. Always use the image placeholder format above so users can easily add images through the editor's image library. You can customize:
- data-gjs-placeholder-text: The button text (e.g., "Add Hero Image", "Add Product Image")
- style: Adjust width, height, min-height, aspect-ratio, border-radius, etc.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no explanations):
{
  "html": "Complete HTML body content (no <html> or <head> tags, just body content - properly escaped for JSON)",
  "css": "Complete CSS styles (no @import, properly escaped for JSON)",
  "slots": [{"id":"slot_id","type":"image|text|button","description":"Description"}],
  "meta": {"title":"Template Title"}
}

USER REQUEST: "${description}"

Generate a creative, unique website that matches the user's request. Be creative with the structure and design. Use semantic HTML5 tags. Make it visually appealing with modern CSS. Include proper responsive design.

IMPORTANT: Ensure your JSON is valid - all quotes, newlines, and special characters in HTML/CSS strings must be properly escaped.`;
  }

  // Generate complete website template using OpenRoute API
  async generateCompleteTemplate(params) {
    try {
      const { description, websiteType, style, colorScheme, includeSections, userId, tailwindMode = false, simpleMode = false } = params;
      
      console.log('Generating template with params:', params);
      
      if (!this.apiKey) {
        console.log('No API key found, using fallback HTML/CSS');
        const fallback = this.createFallbackHtmlCss(params);
        // Skip sanitization to preserve exact content
        // const sanitized = this.sanitizeOutput({ html: fallback.html, css: fallback.css });
        return {
          success: true,
          html: fallback.html || '',
          css: fallback.css || '',
          slots: fallback.slots,
          meta: fallback.meta,
          reasoning: 'Generated fallback (no API key configured)',
          suggestions: ['Configure OpenRouter API key for AI-generated templates']
        };
      }

      console.log('API key found, attempting to call OpenRoute API...');

      // Use simplified prompt if simpleMode is enabled
      let enhancedPrompt;
      if (simpleMode) {
        enhancedPrompt = this.buildSimpleTemplatePrompt(description);
        console.log('Using SIMPLIFIED prompt (no structure guidance)');
      } else {
        // Enhanced prompt with user input as priority
        enhancedPrompt = this.buildTemplatePrompt({
          description,
          websiteType,
          style,
          colorScheme,
          includeSections,
          tailwindMode
        });
      }

      console.log('Sending request to OpenRoute API with prompt:', enhancedPrompt);

      // Call OpenRoute API
      const response = await this.callOpenRouteAPI(enhancedPrompt);
      
      // Log the full AI response for debugging
      console.log('=== AI TEMPLATE GENERATION RESPONSE ===');
      console.log('Response success:', response.success);
      if (response.success) {
        console.log('Raw AI content length:', response.content?.length || 0);
        console.log('Raw AI content preview (first 500 chars):', response.content?.substring(0, 500) || 'No content');
      } else {
        console.log('AI API error:', response.error);
      }
      
      if (!response.success) {
        console.log('OpenRoute API call failed:', response.error);
        console.log('Using fallback HTML/CSS');
        const fallback = this.createFallbackHtmlCss(params);
        // Skip sanitization to preserve exact content
        // const sanitized = this.sanitizeOutput({ html: fallback.html, css: fallback.css });
        return {
          success: true,
          html: fallback.html || '',
          css: fallback.css || '',
          slots: fallback.slots,
          meta: fallback.meta,
          reasoning: `Generated fallback (OpenRoute API failed: ${response.error})`,
          suggestions: ['Check API key validity and network connection', 'Verify OpenRouter API key is active']
        };
      }

      // Parse strict JSON into { html, css, slots, meta }
      const { html, css, slots, meta } = this.parseTemplateStrictResponse(response.content, params);
      
      // Log parsed template data
      console.log('=== PARSED TEMPLATE DATA ===');
      console.log('HTML length:', html?.length || 0);
      console.log('CSS length:', css?.length || 0);
      console.log('Slots count:', slots?.length || 0);
      console.log('Meta:', JSON.stringify(meta, null, 2));
      console.log('HTML preview (first 300 chars):', html?.substring(0, 300) || 'No HTML');
      console.log('CSS preview (first 300 chars):', css?.substring(0, 300) || 'No CSS');
      
      // Skip sanitization to preserve exact AI-generated HTML/CSS content
      // const sanitized = this.sanitizeOutput({ html, css });
      
      // Log output (unsanitized)
      console.log('=== OUTPUT (UNSANITIZED - PRESERVING EXACT CONTENT) ===');
      console.log('HTML length:', html?.length || 0);
      console.log('CSS length:', css?.length || 0);
      
      return {
        success: true,
        html: html || '',
        css: css || '',
        slots,
        meta,
        reasoning: response.reasoning || 'Template generated successfully',
        suggestions: response.suggestions || []
      };

    } catch (error) {
      console.error('Generate Complete Template Error:', error);
      const fallback = this.createFallbackHtmlCss(params);
      // Skip sanitization to preserve exact content
      // const sanitized = this.sanitizeOutput({ html: fallback.html, css: fallback.css });
      return {
        success: true,
        html: fallback.html || '',
        css: fallback.css || '',
        slots: fallback.slots,
        meta: fallback.meta,
        reasoning: 'Generated fallback due to error',
        suggestions: ['Try refining your description for better results']
      };
    }
  }

  // Improve existing canvas HTML/CSS with specific intent
  async improveCanvas(params) {
    const { html, css, intent = 'all', brandHints } = params || {};
    try {
      if (!html && !css) {
        return { success: false, error: 'HTML or CSS is required' };
      }

      if (!this.apiKey) {
        // No API key: return sanitized original as a no-op improvement
        const sanitized = this.sanitizeOutput({ html, css });
        return {
          success: true,
          html: sanitized.html,
          css: sanitized.css,
          suggestions: ['Configure OpenRouter API key for AI improvements']
        };
      }

      const prompt = this.buildImprovePrompt({ html, css, intent, brandHints });
      const response = await this.callOpenRouteAPI(prompt);
      if (!response.success) {
        // Fallback to sanitized original
        const sanitized = this.sanitizeOutput({ html, css });
        return {
          success: true,
          html: sanitized.html,
          css: sanitized.css,
          suggestions: [`AI improvement fallback used: ${response.error}`]
        };
      }

      const { html: newHtml, css: newCss } = this.parseImproveResponse(response.content, { html, css });
      const sanitized = this.sanitizeOutput({ html: newHtml, css: newCss });
      return { success: true, html: sanitized.html, css: sanitized.css };
    } catch (error) {
      console.error('Improve Canvas Error:', error);
      const sanitized = this.sanitizeOutput({ html, css });
      return { success: true, html: sanitized.html, css: sanitized.css };
    }
  }

  // Parse strict { html, css, slots, meta } response (with markdown tolerance)
  parseTemplateStrictResponse(content, params) {
    try {
      console.log('=== PARSING AI RESPONSE ===');
      console.log('Raw AI response length:', content?.length || 0);
      console.log('Raw AI response preview (first 1000 chars):', content?.substring(0, 1000) || 'No content');
      
      let cleanContent = content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in AI response');
        throw new Error('No JSON found in AI response');
      }
      
      let jsonString = jsonMatch[0];
      console.log('Extracted JSON string length:', jsonString.length);
      console.log('Extracted JSON preview (first 500 chars):', jsonString.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        console.log('Error position:', parseError.message.match(/position (\d+)/)?.[1] || 'unknown');
        console.log('Attempting to fix JSON...');
        
        // More robust JSON fixing - extract values manually
        try {
          console.log('Attempting manual extraction of HTML and CSS...');
          
          // Find "html": and extract the string value (handling escaped quotes)
          const htmlStart = jsonString.indexOf('"html"');
          const cssStart = jsonString.indexOf('"css"');
          
          if (htmlStart !== -1 && cssStart !== -1) {
            // Extract HTML value
            let htmlValue = '';
            let htmlPos = jsonString.indexOf(':', htmlStart) + 1;
            // Skip whitespace
            while (htmlPos < jsonString.length && /\s/.test(jsonString[htmlPos])) htmlPos++;
            
            if (jsonString[htmlPos] === '"') {
              htmlPos++; // Skip opening quote
              let inString = true;
              let escaped = false;
              while (htmlPos < jsonString.length && inString) {
                if (escaped) {
                  htmlValue += jsonString[htmlPos];
                  escaped = false;
                } else if (jsonString[htmlPos] === '\\') {
                  htmlValue += jsonString[htmlPos];
                  escaped = true;
                } else if (jsonString[htmlPos] === '"') {
                  // Check if this is the end of the string (next char should be , or } or whitespace)
                  let nextPos = htmlPos + 1;
                  while (nextPos < jsonString.length && /\s/.test(jsonString[nextPos])) nextPos++;
                  if (nextPos >= jsonString.length || jsonString[nextPos] === ',' || jsonString[nextPos] === '}') {
                    inString = false;
                    break;
                  }
                  htmlValue += jsonString[htmlPos];
                } else {
                  htmlValue += jsonString[htmlPos];
                }
                htmlPos++;
              }
            }
            
            // Extract CSS value (similar approach)
            let cssValue = '';
            let cssPos = jsonString.indexOf(':', cssStart) + 1;
            while (cssPos < jsonString.length && /\s/.test(jsonString[cssPos])) cssPos++;
            
            if (jsonString[cssPos] === '"') {
              cssPos++;
              let inString = true;
              let escaped = false;
              while (cssPos < jsonString.length && inString) {
                if (escaped) {
                  cssValue += jsonString[cssPos];
                  escaped = false;
                } else if (jsonString[cssPos] === '\\') {
                  cssValue += jsonString[cssPos];
                  escaped = true;
                } else if (jsonString[cssPos] === '"') {
                  let nextPos = cssPos + 1;
                  while (nextPos < jsonString.length && /\s/.test(jsonString[nextPos])) nextPos++;
                  if (nextPos >= jsonString.length || jsonString[nextPos] === ',' || jsonString[nextPos] === '}') {
                    inString = false;
                    break;
                  }
                  cssValue += jsonString[cssPos];
                } else {
                  cssValue += jsonString[cssPos];
                }
                cssPos++;
              }
            }
            
            if (htmlValue || cssValue) {
              console.log('Successfully extracted HTML and CSS manually');
              // Unescape the values (handle JSON escape sequences)
              htmlValue = htmlValue
                .replace(/\\\\/g, '\\') // Unescape backslashes first
                .replace(/\\"/g, '"')    // Unescape quotes
                .replace(/\\n/g, '\n')   // Unescape newlines
                .replace(/\\t/g, '\t')   // Unescape tabs
                .replace(/\\r/g, '\r')   // Unescape carriage returns
                .replace(/\\'/g, "'");    // Unescape single quotes
              
              cssValue = cssValue
                .replace(/\\\\/g, '\\')  // Unescape backslashes first
                .replace(/\\"/g, '"')    // Unescape quotes
                .replace(/\\n/g, '\n')   // Unescape newlines
                .replace(/\\t/g, '\t')   // Unescape tabs
                .replace(/\\r/g, '\r')   // Unescape carriage returns
                .replace(/\\'/g, "'");   // Unescape single quotes
              
              // Remove <link> tags from HTML
              htmlValue = htmlValue.replace(/<link[^>]*>/gi, '');
              
              // Remove @import from CSS
              cssValue = cssValue.replace(/@import\s+url\([^)]*\);?/gi, '').replace(/@import\s+['"][^'"]*['"];?/gi, '');
              
              // Try to extract slots and meta
              let slots = [];
              let meta = { title: params.description || 'AI Template' };
              
              try {
                const slotsStart = jsonString.indexOf('"slots"');
                if (slotsStart !== -1) {
                  const slotsArrayStart = jsonString.indexOf('[', slotsStart);
                  const slotsArrayEnd = jsonString.indexOf(']', slotsArrayStart);
                  if (slotsArrayStart !== -1 && slotsArrayEnd !== -1) {
                    const slotsStr = jsonString.substring(slotsArrayStart, slotsArrayEnd + 1);
                    slots = JSON.parse(slotsStr);
                  }
                }
              } catch (e) {
                console.warn('Could not parse slots, using empty array');
              }
              
              try {
                const metaStart = jsonString.indexOf('"meta"');
                if (metaStart !== -1) {
                  const metaObjStart = jsonString.indexOf('{', metaStart);
                  let braceCount = 0;
                  let metaObjEnd = metaObjStart;
                  for (let i = metaObjStart; i < jsonString.length; i++) {
                    if (jsonString[i] === '{') braceCount++;
                    if (jsonString[i] === '}') braceCount--;
                    if (braceCount === 0) {
                      metaObjEnd = i;
                      break;
                    }
                  }
                  if (metaObjStart !== -1 && metaObjEnd !== -1) {
                    const metaStr = jsonString.substring(metaObjStart, metaObjEnd + 1);
                    meta = JSON.parse(metaStr);
                  }
                }
              } catch (e) {
                console.warn('Could not parse meta, using default');
              }
              
              console.log('Extracted values - HTML length:', htmlValue.length, 'CSS length:', cssValue.length, 'Slots:', slots.length);
              return { html: htmlValue, css: cssValue, slots, meta };
            }
          }
        } catch (regexError) {
          console.error('Manual extraction also failed:', regexError.message);
        }
        
        // Fallback: try to fix common JSON issues
        let fixedJson = jsonString
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
          .replace(/([^\\])"/g, '$1\\"') // Escape unescaped quotes (but this might break things)
          .replace(/\\n/g, '\\n') // Preserve newlines
          .replace(/\\"/g, '\\"'); // Preserve escaped quotes
        
        console.log('Fixed JSON preview (first 500 chars):', fixedJson.substring(0, 500));
        try {
          data = JSON.parse(fixedJson);
        } catch (secondError) {
          console.error('Second parse attempt also failed:', secondError.message);
          throw parseError; // Throw original error
        }
      }
      
      console.log('Parsed JSON keys:', Object.keys(data));
      
      // Clean HTML - remove any <link> tags that shouldn't be in body content
      let html = typeof data.html === 'string' ? data.html : '';
      html = html.replace(/<link[^>]*>/gi, ''); // Remove link tags from HTML
      
      let css = typeof data.css === 'string' ? data.css : '';
      // Remove @import statements from CSS (should be done before parsing, but do it here too for safety)
      css = css.replace(/@import\s+url\([^)]*\);?/gi, '').replace(/@import\s+['"][^'"]*['"];?/gi, '');
      
      const slots = Array.isArray(data.slots) ? data.slots : [];
      const meta = typeof data.meta === 'object' && data.meta !== null ? data.meta : { title: params.description || 'AI Template' };
      
      console.log('Extracted values - HTML length:', html.length, 'CSS length:', css.length, 'Slots:', slots.length);
      
      return { html, css, slots, meta };
    } catch (error) {
      console.error('=== PARSE TEMPLATE STRICT RESPONSE ERROR ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.log('Using fallback template');
      const fb = this.createFallbackHtmlCss(params);
      return { html: fb.html, css: fb.css, slots: fb.slots, meta: fb.meta };
    }
  }

  // Create fallback HTML/CSS with slots when AI is unavailable
  createFallbackHtmlCss(params) {
    const { description, websiteType, style, colorScheme } = params || {};
    const title = (description && String(description).slice(0, 60)) || `${style || 'modern'} ${websiteType || 'site'}`;

    const html = `
<header class="site-header">
  <div class="container">
    <div class="brand" data-slot="logo" aria-label="Brand logo"></div>
    <nav class="nav" aria-label="Primary">
      <a href="#" class="nav-link">Home</a>
      <a href="#" class="nav-link">About</a>
      <a href="#" class="nav-link">Services</a>
      <a href="#" class="nav-link">Contact</a>
    </nav>
  </div>
  <div class="header-underline" aria-hidden="true"></div>
  <button class="menu-toggle" aria-label="Open menu" data-slot="menu_toggle"></button>
</header>

<main id="hero" class="hero">
  <div class="container hero-inner">
    <div class="hero-media" data-slot="hero_image" aria-label="Hero image placeholder"></div>
    <div class="hero-content">
      <h1 class="hero-title" data-slot="headline">Make something great</h1>
      <p class="hero-subtitle" data-slot="subheadline">${title}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#" data-slot="primary_cta">Get Started</a>
        <a class="btn btn-secondary" href="#" data-slot="secondary_cta">Learn More</a>
      </div>
    </div>
  </div>
</main>

<section class="features">
  <div class="container">
    <div class="feature">
      <div class="feature-icon" data-slot="feature_icon_1" aria-hidden="true"></div>
      <h3 class="feature-title" data-slot="feature_title_1">Fast</h3>
      <p class="feature-desc" data-slot="feature_desc_1">Performance-first with elegant motion.</p>
    </div>
    <div class="feature">
      <div class="feature-icon" data-slot="feature_icon_2" aria-hidden="true"></div>
      <h3 class="feature-title" data-slot="feature_title_2">Responsive</h3>
      <p class="feature-desc" data-slot="feature_desc_2">Looks premium on every device.</p>
    </div>
    <div class="feature">
      <div class="feature-icon" data-slot="feature_icon_3" aria-hidden="true"></div>
      <h3 class="feature-title" data-slot="feature_title_3">Accessible</h3>
      <p class="feature-desc" data-slot="feature_desc_3">Inclusive and standards-compliant.</p>
    </div>
  </div>
  <div class="features-bg" aria-hidden="true"></div>
  <div class="gradient"></div>
</section>

<footer class="site-footer">
  <div class="container">
    <div class="footer-brand" data-slot="footer_logo"></div>
    <p class="footer-copy" data-slot="footer_text">© ${new Date().getFullYear()} Your Brand. All rights reserved.</p>
  </div>
</footer>`;

    const css = `
:root{--brand:#2563eb;--brand-2:#7c3aed;--bg:#0b1220;--card:#0f172a;--text:#e5e7eb;--muted:#94a3b8}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
.container{max-width:1120px;margin:0 auto;padding:0 24px}
.site-header{position:sticky;top:0;background:rgba(15,23,42,.7);backdrop-filter:blur(8px);z-index:10}
.site-header .container{display:flex;align-items:center;justify-content:space-between;height:64px}
.brand{width:120px;height:28px;background:linear-gradient(90deg,var(--brand),var(--brand-2));border-radius:6px;animation:shimmer 3s linear infinite}
.nav{display:flex;gap:24px}
.nav-link{color:var(--text);text-decoration:none;opacity:.85;transition:opacity .2s ease}
.nav-link:hover,.nav-link:focus{opacity:1}
.menu-toggle{display:none}
.header-underline{height:1px;background:linear-gradient(90deg,transparent,var(--brand),transparent);opacity:.5}
.hero{padding:72px 0;background:radial-gradient(1200px 600px at 10% 10%,rgba(124,58,237,.2),transparent),radial-gradient(1000px 500px at 90% 10%,rgba(37,99,235,.2),transparent)}
.hero-inner{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:center}
.hero-media{min-height:280px;background:linear-gradient(135deg,#111827,#0b1220);border:1px solid #1f2937;border-radius:16px;position:relative;overflow:hidden}
.hero-media::after{content:"";position:absolute;inset:-40%;background:radial-gradient(circle at 30% 20%,rgba(37,99,235,.35),transparent 40%),radial-gradient(circle at 70% 40%,rgba(124,58,237,.35),transparent 40%);filter:blur(30px)}
.hero-content{display:flex;flex-direction:column;gap:16px}
.hero-title{font-size:44px;line-height:1.1;margin:0}
.hero-subtitle{margin:0;color:var(--muted)}
.hero-actions{display:flex;gap:12px;margin-top:8px}
.btn{display:inline-flex;align-items:center;justify-content:center;height:40px;padding:0 16px;border-radius:10px;text-decoration:none;font-weight:600}
.btn-primary{background:linear-gradient(90deg,var(--brand),var(--brand-2));color:white;box-shadow:0 10px 30px rgba(37,99,235,.25)}
.btn-secondary{background:#0b1220;border:1px solid #1f2937;color:#e5e7eb}
.btn:hover{transform:translateY(-1px);transition:transform .15s ease}
.features{position:relative;padding:56px 0}
.features .container{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feature{background:var(--card);border:1px solid #1f2937;border-radius:14px;padding:20px;position:relative;overflow:hidden}
.feature-icon{width:36px;height:36px;border-radius:8px;background:linear-gradient(90deg,var(--brand),var(--brand-2));opacity:.9}
.feature-title{margin:12px 0 6px;font-size:18px}
.feature-desc{margin:0;color:var(--muted)}
.features-bg{position:absolute;inset:0;background:radial-gradient(600px 300px at 10% 10%,rgba(37,99,235,.12),transparent),radial-gradient(600px 300px at 90% 10%,rgba(124,58,237,.12),transparent);pointer-events:none}
.gradient{position:absolute;inset:auto auto -40px -40px;width:400px;height:400px;background:radial-gradient(circle,rgba(37,99,235,.3),transparent 60%);filter:blur(60px);opacity:.4}
.site-footer{padding:28px 0;border-top:1px solid #1f2937}
.footer-brand{width:100px;height:24px;border-radius:6px;background:linear-gradient(90deg,var(--brand),var(--brand-2))}
.footer-copy{color:#9ca3af}
@keyframes shimmer{0%{filter:brightness(1)}50%{filter:brightness(1.2)}100%{filter:brightness(1)}}
@media (max-width: 1024px){.hero-inner{grid-template-columns:1fr;gap:28px}.hero-title{font-size:36px}}
@media (max-width: 640px){.nav{display:none}.menu-toggle{display:inline-block;width:36px;height:36px;border-radius:8px;background:linear-gradient(90deg,var(--brand),var(--brand-2));border:none}.hero{padding:56px 0}.features .container{grid-template-columns:1fr}.hero-title{font-size:30px}}
`;

    const slots = [
      { id: 'logo', type: 'image', description: 'Brand logo image' },
      { id: 'menu_toggle', type: 'button', description: 'Mobile menu toggle' },
      { id: 'hero_image', type: 'image', description: 'Prominent hero visual' },
      { id: 'headline', type: 'text', description: 'Main hero headline' },
      { id: 'subheadline', type: 'text', description: 'Supporting subheadline' },
      { id: 'primary_cta', type: 'text', description: 'Primary call-to-action label' },
      { id: 'secondary_cta', type: 'text', description: 'Secondary call-to-action label' },
      { id: 'feature_icon_1', type: 'image', description: 'Feature 1 icon' },
      { id: 'feature_title_1', type: 'text', description: 'Feature 1 title' },
      { id: 'feature_desc_1', type: 'text', description: 'Feature 1 description' },
      { id: 'feature_icon_2', type: 'image', description: 'Feature 2 icon' },
      { id: 'feature_title_2', type: 'text', description: 'Feature 2 title' },
      { id: 'feature_desc_2', type: 'text', description: 'Feature 2 description' },
      { id: 'feature_icon_3', type: 'image', description: 'Feature 3 icon' },
      { id: 'feature_title_3', type: 'text', description: 'Feature 3 title' },
      { id: 'feature_desc_3', type: 'text', description: 'Feature 3 description' },
      { id: 'footer_logo', type: 'image', description: 'Footer logo' },
      { id: 'footer_text', type: 'text', description: 'Footer copyright text' }
    ];

    const meta = { title, colorScheme: colorScheme || 'blue', style: style || 'modern', websiteType: websiteType || 'general' };
    return { html, css, slots, meta };
  }
  buildImprovePrompt({ html, css, intent, brandHints }) {
    const goalMap = {
      content: 'Rewrite and enhance textual content tone and clarity without changing structure significantly.',
      layout: 'Improve layout flow, spacing, and section hierarchy; keep semantic tags and IDs, avoid breaking DOM.',
      style: 'Polish visual style: consistent scale, color palette, typography; prefer classes over inline.',
      all: 'Improve content, layout, and style cohesively while keeping structure and IDs stable.'
    };
    const goal = goalMap[intent] || goalMap.all;

    return `You are a senior frontend designer. Improve the following website HTML and CSS.

INTENT: ${intent}
GOAL: ${goal}
BRAND HINTS: ${brandHints || 'None'}

CONSTRAINTS:
- Keep existing DOM IDs and data attributes stable.
- Do not include <script>, <iframe>, external links, or remote @import.
- Mobile-first, accessible (proper headings, contrast), semantic HTML.
- Use classes; minimize inline styles.
- Use data-slot attributes to mark replaceable content when obvious (e.g., logo, hero images, CTAs).

RETURN ONLY valid JSON with keys html, css, slots. No markdown.
{
  "html": "...improved full HTML markup only for the body content (no <html> <head>)...",
  "css": "...improved CSS...",
  "slots": [
    {"id":"logo","type":"image","description":"Brand logo image"}
  ]
}

CURRENT_HTML:
${html || ''}

CURRENT_CSS:
${css || ''}`;
  }

  parseImproveResponse(content, original) {
    try {
      let clean = content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON in AI response');
      const json = JSON.parse(match[0]);
      const html = typeof json.html === 'string' && json.html.trim() ? json.html : (original.html || '');
      const css = typeof json.css === 'string' ? json.css : (original.css || '');
      const slots = Array.isArray(json.slots) ? json.slots : [];
      return { html, css, slots };
    } catch (e) {
      console.warn('parseImproveResponse fallback due to error:', e.message);
      return { html: original.html || '', css: original.css || '', slots: [] };
    }
  }

  sanitizeOutput({ html = '', css = '' }) {
    const safeHtml = (html || '')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
      .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '')
      .replace(/on[a-z]+\s*=\s*'[^']*'/gi, '')
      .replace(/on[a-z]+\s*=\s*[^\s>]+/gi, '');

    const safeCss = (css || '')
      .replace(/@import\s+url\([^)]*\);?/gi, '')
      .replace(/url\((http|https):[^)]*\)/gi, 'url(about:blank)');

    return { html: safeHtml, css: safeCss };
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

  // Build enhanced prompt prioritizing user input with professional design guidelines
  buildTemplatePrompt(params) {
    const { description, websiteType = 'general', style = 'modern', colorScheme = 'blue', includeSections, tailwindMode = false } = params;
    const sections = Array.isArray(includeSections) && includeSections.length > 0
      ? includeSections.join(', ')
      : 'header, hero, 2-3 content sections, footer';
    
    // Content type-specific structure and content guidance (NOT design)
    const contentTypeGuidance = {
      'landing-page': {
        structure: 'Be creative with layout - consider hero sections, features/benefits, social proof/testimonials, pricing (if applicable), and footer. Use unique, conversion-focused arrangements that vary from typical patterns.',
        content: 'Generate persuasive copy that highlights value proposition, benefits, and clear calls-to-action. Include realistic testimonials and feature descriptions. Be creative with how you present the content.'
      },
      'portfolio': {
        structure: 'Be creative with how you showcase work - consider hero/intro sections, about sections, projects/work displays, skills sections, and contact. Use unique layouts and arrangements, not standard grid patterns.',
        content: 'Generate professional portfolio content including project descriptions, skill lists, about text, and contact information. Use realistic project names and descriptions. Be creative with content presentation.'
      },
      'e-commerce': {
        structure: 'Be creative with product presentation - consider navigation, hero/banner sections, product categories, featured products, product details, and checkout/contact. Use unique, engaging layouts that facilitate browsing.',
        content: 'Generate product listings with names, descriptions, prices, and categories. Include realistic product information and shopping-related content. Be creative with how products are presented.'
      },
      'business': {
        structure: 'Be creative with corporate layout - consider navigation, hero sections, services/offerings, about/company sections, testimonials, and contact forms. Use unique, professional arrangements that convey trust.',
        content: 'Generate business-focused content including service descriptions, company information, team details, and professional contact information. Be creative with how business information is presented.'
      },
      'content-creator': {
        structure: 'Be creative with media presentation - consider hero sections, featured content/videos, social media links, collaboration highlights, about sections, and contact. Use unique, media-rich layouts that showcase content effectively.',
        content: 'Generate content creator-focused sections including video descriptions, social media stats, collaboration examples, and personal branding content. Be creative with how creator content is displayed.'
      }
    };
    
    const typeGuidance = contentTypeGuidance[websiteType] || null;
    
    // Color scheme mappings for professional palettes
    const colorPalettes = {
      blue: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', bg: '#f8fafc', text: '#1e293b', muted: '#64748b' },
      purple: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6', bg: '#faf5ff', text: '#581c87', muted: '#a78bfa' },
      green: { primary: '#059669', secondary: '#047857', accent: '#10b981', bg: '#f0fdf4', text: '#064e3b', muted: '#6ee7b7' },
      red: { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', bg: '#fef2f2', text: '#991b1b', muted: '#fca5a5' },
      dark: { primary: '#1f2937', secondary: '#111827', accent: '#374151', bg: '#0f172a', text: '#f9fafb', muted: '#6b7280' },
      orange: { primary: '#ea580c', secondary: '#c2410c', accent: '#f97316', bg: '#fff7ed', text: '#9a3412', muted: '#fdba74' },
      teal: { primary: '#0d9488', secondary: '#0f766e', accent: '#14b8a6', bg: '#f0fdfa', text: '#134e4a', muted: '#5eead4' }
    };
    
    const palette = colorPalettes[colorScheme] || colorPalettes.blue;
    
    return `You are an expert web designer and frontend developer specializing in creating premium, professional website templates. Your task is to generate a complete, production-ready website template that is visually stunning, modern, and highly functional.

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON in this exact format. No markdown code blocks, no extra text, no commentary.
- The template must be immediately usable and professional-looking
- All code must be clean, semantic, and follow modern web standards
- **NEVER include the user's prompt text in the website content** - create appropriate content based on the prompt's intent
- **Generate realistic, professional content** that matches what the user requested, not placeholder text or the prompt itself
- **Generate COMPLETE HTML with multiple sections** like header, hero, about/services, features, testimonials, contact, footer
- **Use modern CSS** with gradients, animations, hover effects, and smooth transitions
- **Make it visually impressive** with proper spacing, typography, and color schemes
- **DESIGN QUALITY**: Generate templates with the same visual quality as premium portfolio and gaming websites:
  - Rich gradients (linear-gradient, radial-gradient) for backgrounds and buttons
  - Sophisticated animations (@keyframes for glow, float, shimmer effects)
  - Modern visual effects (backdrop-filter: blur(), text-shadow, multi-layer box-shadow)
  - Professional typography with gradient text effects where appropriate
  - Smooth hover interactions with transforms and shadow changes
  - Glassmorphism effects (backdrop-filter: blur() with rgba backgrounds)
  - SVG patterns and geometric shapes for visual interest

OUTPUT FORMAT (STRICT JSON):
{
  "html": "Complete HTML body content (no <html> or <head> tags)",
  "css": "Complete CSS with variables, responsive design, and animations",
  "slots": [{"id":"slot_id","type":"image|text|button","description":"Description"}],
  "meta": {"title":"Template Title", "colorScheme":"${colorScheme}", "style":"${style}"}${tailwindMode ? ',\n  "tailwind_html": "..."' : ''}
}

**CRITICAL EDITOR COMPATIBILITY REQUIREMENTS:**
The HTML and CSS you generate will be loaded into a GrapesJS visual editor using:
- editor.setComponents(html) - expects plain HTML string that can be parsed into editable components
- editor.setStyle(css) - expects plain CSS string

**HTML FORMAT REQUIREMENTS FOR EDITOR COMPATIBILITY:**
1. **Use semantic HTML structure creatively** - GrapesJS parses HTML into components, so keep structure clean but feel free to be creative with layouts
2. **Avoid deeply nested structures** - Keep nesting to 3-4 levels maximum for better editor parsing
3. **Use proper HTML5 semantic tags creatively** - <header>, <nav>, <main>, <section>, <article>, <footer> - use these creatively, not in a fixed pattern
4. **Each major section should be a separate element** - Don't nest too many divs, use semantic tags instead, but arrange them uniquely
5. **Avoid inline event handlers** - No onclick, onload, etc. (already mentioned, but critical)
6. **Use creative, descriptive class names** - GrapesJS uses classes to identify components, so use unique names that describe the specific design
7. **Keep HTML clean and well-formatted** - Proper indentation helps GrapesJS parse correctly
8. **Avoid special characters in attributes** - Use standard quotes, no smart quotes or special Unicode
9. **Text content should be directly in elements** - Not wrapped in extra spans unless necessary
10. **Use data-slot attributes for editable content** - This helps the editor identify what can be edited

**CSS FORMAT REQUIREMENTS FOR EDITOR COMPATIBILITY:**
1. **Use standard CSS syntax** - No experimental features that might not parse
2. **Keep selectors simple** - Complex selectors work but simple ones are easier for editor to manage
3. **Use CSS variables in :root** - These work well with GrapesJS style manager
4. **Avoid @import statements** - Use direct CSS only
5. **Media queries should be at the end** - Better for editor organization
6. **Use standard units** - px, rem, em, %, vw, vh - avoid exotic units
7. **Keep CSS readable** - Proper formatting helps editor parse and display styles correctly

USER REQUEST: "${description}"

**IMPORTANT**: Analyze the user's description to determine:
- Website type (portfolio, business, ecommerce, blog, landing page, etc.)
- Design style (modern, minimal, elegant, bold, creative, etc.)
- Color scheme (blue, purple, green, red, dark, orange, teal, etc.)

Choose appropriate values based on the user's intent and description. For example:
- "portfolio" or "showcase my work" → portfolio type
- "business" or "company" → business type
- "ecommerce" or "online store" → ecommerce type
- "premium" or "elegant" → elegant style
- "bold" or "eye-catching" → bold style
- "minimal" or "clean" → minimal style
- User mentions colors → use those colors, otherwise use blue as default

REQUIRED SECTIONS: ${sections}

${typeGuidance ? `**CONTENT TYPE-SPECIFIC GUIDANCE (${websiteType.toUpperCase()}):**

**STRUCTURE SUGGESTIONS (be creative, don't follow a pattern):**
${typeGuidance.structure}

**CONTENT SUGGESTIONS (be creative with presentation):**
${typeGuidance.content}

**CRITICAL**: Use this guidance as inspiration, NOT as a template. Be creative and unique with each generation. Vary your HTML structure, layout arrangements, and content presentation. Do NOT follow the same pattern for every request - each website should feel fresh and different.

` : ''}

**CRITICAL CONTENT GENERATION RULES:**
1. **Understand the user's intent** from their prompt and create appropriate content
2. **NEVER use the user's exact prompt text as content** - interpret it and create appropriate website content
3. **Use professional, realistic text** that matches the website type and user's intent
4. **Generate unique content** - each website type should have distinct, appropriate content (not generic placeholder text)
5. **Example**: If user says "portfolio for someone who just graduated", create content like "Recent Graduate", "Education", "Projects", "Skills", "Get In Touch" - NOT the prompt text itself
6. **Focus on structure and content quality** - the HTML structure should match the website type's needs, and content should be realistic and appropriate

DESIGN GUIDELINES - PROFESSIONAL TEMPLATE REQUIREMENTS:

**Visual Design:**
- Modern, clean aesthetic with excellent visual hierarchy
- Professional typography: Use system fonts (Inter, -apple-system, Segoe UI, Roboto) or web-safe alternatives
- Generous white space and proper spacing (use consistent spacing scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Subtle shadows and depth for modern look (box-shadow: 0 1px 3px rgba(0,0,0,0.1) for cards, 0 4px 6px for elevated elements)
- Smooth transitions and micro-interactions (hover effects, focus states)
- Professional color palette with proper contrast ratios (WCAG AA minimum)
- Use gradients tastefully for modern appeal (linear-gradient for buttons, radial-gradient for backgrounds)

**Color Palette to Use:**
Primary: ${palette.primary}
Secondary: ${palette.secondary}
Accent: ${palette.accent}
Background: ${palette.bg}
Text: ${palette.text}
Muted Text: ${palette.muted}

**Layout & Structure:**
- Mobile-first responsive design (design for mobile, enhance for desktop)
- Use CSS Grid and Flexbox for modern layouts
- Maximum content width: 1200px (use .container class with max-width)
- Proper section spacing: 64px-96px between major sections on desktop, 48px-64px on mobile
- Sticky header with backdrop blur for modern feel
- Footer with proper spacing and organization

**Typography:**
- Heading hierarchy: h1 (48-56px desktop, 32-40px mobile), h2 (36-40px desktop, 28-32px mobile), h3 (24-28px), h4 (20-24px)
- Body text: 16-18px with 1.6-1.8 line height
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Proper text contrast: minimum 4.5:1 for body text, 3:1 for large text

**Components to Consider (be creative with arrangement and design):**
- Header/Navigation with logo/brand area (data-slot="logo")
- Hero sections with headlines (data-slot="headline"), subheadlines (data-slot="subheadline"), images (data-slot="hero_image"), and CTAs (data-slot="primary_cta")
- Content sections with features, about, services, testimonials, etc.
- Footer with links and copyright (data-slot="footer_text")

**IMPORTANT**: These are suggestions, not requirements. Be creative with how you arrange and design these components. Each website should have a unique structure and layout that matches its purpose and the user's request.

**CSS Requirements - PREMIUM DESIGN QUALITY:**
- Use CSS custom properties (variables) for colors, spacing, and typography
- Example: :root { --brand: ${palette.primary}; --bg: ${palette.bg}; --text: ${palette.text}; --spacing-xs: 4px; --spacing-sm: 8px; --spacing-md: 16px; --spacing-lg: 24px; --spacing-xl: 32px; --spacing-2xl: 48px; --spacing-3xl: 64px; }
- Mobile-first media queries: @media (min-width: 640px), @media (min-width: 768px), @media (min-width: 1024px)
- Smooth transitions: transition: all 0.2s ease or transition: transform 0.2s ease, opacity 0.2s ease
- **PREMIUM ANIMATIONS**: Use @keyframes for sophisticated effects like:
  - Glow animations: text-shadow pulsing, element glowing
  - Float animations: subtle translateY movements for hero sections
  - Shimmer effects: gradient animations on buttons/cards
  - Fade-in animations: opacity transitions for content sections
- **PROFESSIONAL BUTTON STYLES**: 
  - Rounded corners (8-12px), proper padding, hover states with transform or shadow changes
  - Gradient backgrounds: linear-gradient(45deg, color1, color2)
  - Box shadows: 0 10px 30px rgba(0, 0, 0, 0.1) for depth
  - Hover effects: transform: translateY(-2px to -5px), enhanced shadows
- **CARD COMPONENTS**: 
  - border-radius: 12-16px, subtle shadow, padding: 24-32px
  - Hover effects: transform: translateY(-8px to -10px), enhanced box-shadow
  - Background: rgba() with backdrop-filter: blur() for glassmorphism effects
- **USE GRADIENTS CREATIVELY**: 
  - Linear gradients for buttons: linear-gradient(45deg, #color1, #color2)
  - Radial gradients for hero sections: radial-gradient(circle at position, color1, transparent)
  - Multiple gradient layers for depth
- **MODERN VISUAL EFFECTS**:
  - backdrop-filter: blur(10px to 20px) for glassmorphism headers/navs
  - text-shadow: 0 0 20px color for glow effects on headings
  - box-shadow: Multiple layers (0 1px 3px, 0 4px 6px, 0 10px 25px) for depth
  - background gradients: linear-gradient(135deg, color1 0%, color2 50%, color3 100%) for rich backgrounds
  - SVG patterns: Use data URIs for grid patterns, geometric shapes
- **TYPOGRAPHY EFFECTS**:
  - Gradient text: background: linear-gradient(), -webkit-background-clip: text, -webkit-text-fill-color: transparent
  - Text shadows for depth and glow
  - Letter spacing for modern feel
- **INTERACTIVE ELEMENTS**:
  - Smooth hover transitions (0.2s to 0.3s ease)
  - Transform effects on hover (scale, translateY)
  - Color transitions on links and buttons
  - Underline animations using ::after pseudo-elements

**HTML Requirements:**
- Semantic HTML5: <header>, <nav>, <main>, <section>, <article>, <footer> - use creatively, not in a fixed pattern
- Proper heading hierarchy (h1 → h2 → h3)
- Accessibility: aria-labels where needed, alt text placeholders
- Use data-slot attributes for all replaceable content
- Creative, descriptive class names that match the specific design (avoid generic patterns)
- No inline styles (except data attributes)
- Proper indentation and structure
- **VARY YOUR STRUCTURE** - Don't use the same HTML pattern for every request. Be creative and unique!
- **MUST include multiple complete sections**: header with navigation, hero section, 2-4 content sections (about, services, features, testimonials, etc.), and footer
- **Each section should be substantial** with proper content, not just placeholders
- **CRITICAL: DO NOT include <link> tags in the HTML** - HTML should only contain body content (no <head>, <html>, <link>, <script>, or <style> tags)
- **Icons should use Font Awesome classes** like <i class="fas fa-icon-name"></i> - the editor will handle adding the Font Awesome CDN link
- **Include smooth scrolling** and interactive elements where appropriate
- **Escape all quotes properly in JSON** - use \" for quotes inside HTML strings
- **Structure for editor compatibility**: Keep HTML structure simple and flat where possible - GrapesJS editor needs to parse this into editable components
- **Avoid complex nested divs** - Use semantic HTML5 elements instead of div soup
- **Each major content block should be a direct child** of its parent section for better editor componentization

**Responsive Design:**
- Mobile: Single column, stacked layout, hamburger menu
- Tablet: 2-column grids where appropriate
- Desktop: Multi-column layouts, full navigation
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)

**Performance & Best Practices:**
- No external resources (images, fonts, scripts)
- Use CSS for visual elements (gradients, shapes, patterns)
- Optimize CSS (group related rules, use shorthand)
- No JavaScript required (pure HTML/CSS)
- Fast loading, minimal CSS

**Style-Specific Guidelines:**

${style === 'modern' ? `- Clean lines, minimal design, lots of white space
- Subtle shadows and depth
- Modern typography with good hierarchy
- Smooth animations and transitions
- Card-based layouts
- Use gradients sparingly but effectively
- backdrop-filter: blur() for modern glassmorphism effects` : ''}

${style === 'minimal' ? `- Extremely clean, maximum white space
- Minimal color usage (mostly monochrome with one accent)
- Simple typography, no decorative elements
- Focus on content and readability
- Subtle hover effects only` : ''}

${style === 'bold' ? `- Strong colors and high contrast
- Large, impactful typography
- Bold geometric shapes
- Strong visual hierarchy
- Eye-catching design elements
- Vibrant gradients and bold shadows
- Text shadows for emphasis
- Strong hover effects with transforms` : ''}

${style === 'elegant' ? `- Sophisticated color palette
- Refined typography with serif or elegant sans-serif
- Subtle decorative elements
- Premium feel with attention to detail
- Classic layouts with modern touches
- Subtle animations and transitions
- Gradient text effects for headings` : ''}

${style === 'creative' ? `- Unique layouts and compositions
- Creative use of space and typography
- Artistic elements and patterns
- Bold color combinations
- Experimental but functional design
- Multiple gradient layers
- Animated backgrounds and effects
- Glow effects and text shadows
- Creative hover interactions
- SVG patterns and geometric shapes` : ''}

**Website Type Considerations:**

${websiteType === 'portfolio' ? `- **Hero Section**: Compelling headline like "Welcome to My Portfolio" or "Hi, I'm [Name]" with a professional tagline
- **About Section**: Personal introduction, background, education, skills, and career goals (for recent graduates, emphasize education, projects, and aspirations)
- **Projects/Work Section**: Showcase portfolio items, projects, or work samples with descriptions
- **Skills Section**: List relevant skills, technologies, or expertise areas
- **Education Section** (especially for recent graduates): Highlight education, degrees, certifications, coursework
- **Contact Section**: Professional contact information and social links
- **Content should be**: Professional, authentic, and tailored to the user's situation (e.g., recent graduate = emphasize education, projects, learning journey)
- **NEVER include the user's prompt text** - create appropriate portfolio content based on their request` : ''}

${websiteType === 'business' ? `- Professional header with navigation
- Services/products section
- About/company section
- Testimonials or social proof
- Contact/CTA sections
- Trust indicators` : ''}

${websiteType === 'blog' ? `- Article/blog post layout
- Category navigation
- Author information
- Reading-friendly typography
- Related posts section` : ''}

${websiteType === 'landing' ? `- Strong hero with clear value proposition
- Multiple benefit/feature sections
- Social proof (testimonials, stats)
- Multiple CTAs throughout
- Conversion-focused design` : ''}

**Slots to Include:**
All replaceable content must have data-slot attributes:
- logo, hero_image, headline, subheadline, primary_cta, secondary_cta
- feature_icon_1, feature_title_1, feature_desc_1 (and 2, 3 if applicable)
- footer_logo, footer_text
- Any other content that should be editable

**Example JSON Structure (for reference only - generate your own):**
{
  "html": "<header class=\"site-header\">...</header><main>...</main><footer>...</footer>",
  "css": ":root{--brand:${palette.primary};--bg:${palette.bg};--text:${palette.text}}body{...}@media(min-width:768px){...}",
  "slots": [
    {"id":"logo","type":"image","description":"Brand logo"},
    {"id":"headline","type":"text","description":"Main hero headline"},
    {"id":"hero_image","type":"image","description":"Hero section image"},
    {"id":"primary_cta","type":"text","description":"Primary call-to-action button text"}
  ],
  "meta": {"title":"${websiteType} - ${style}","colorScheme":"${colorScheme}","style":"${style}"}
}

**CREATIVITY & VARIATION REQUIREMENTS:**
- **BE CREATIVE AND UNIQUE** - Do NOT follow a fixed template or pattern. Each website should have its own distinct structure and layout.
- **Vary your approach** - Use different layouts, section arrangements, and component structures for each request.
- **Think outside the box** - Experiment with different HTML structures, creative section arrangements, and unique component designs.
- **Avoid repetitive patterns** - Each generation should feel fresh and different, not like a copy of a template.
- **Use semantic HTML creatively** - While maintaining editor compatibility, be creative with how you structure and organize content.
- **Unique class names** - Use creative, descriptive class names that match the specific design (not generic names like "section-1", "section-2").
- **Innovative layouts** - Try different grid patterns, flex arrangements, and creative spacing approaches.

**CRITICAL:**
- Return ONLY the JSON object, no markdown, no code blocks, no explanations
- HTML must be complete and valid
- CSS must be complete with all necessary styles
- All slots must be properly marked with data-slot attributes
- Template must look professional and modern
- Must be fully responsive
- Must follow all design guidelines above`;
  }

  // Call OpenRoute API
  async callOpenRouteAPI(prompt) {
    try {
      // Ensure config is loaded from settings
      await this.ensureConfigLoaded();
      
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
          temperature: this.temperature
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
