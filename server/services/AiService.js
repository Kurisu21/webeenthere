// services/AiService.js
const databaseSettingsService = require('./DatabaseSettingsService');

class AiService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    // Model will be loaded from settings, with fallback to default
    this.model = null;
    this.maxTokens = 4000;
    this.temperature = 0.7;
  }

  // Get AI configuration from settings (with caching)
  async getAiConfig() {
    try {
      const config = await databaseSettingsService.getAiConfig();
      this.model = config.model || 'x-ai/grok-4.1-fast:free';
      this.maxTokens = config.maxTokens || 4000;
      this.temperature = config.temperature || 0.7;
      return config;
    } catch (error) {
      console.error('Failed to load AI config from settings, using defaults:', error);
      // Fallback to defaults
      this.model = 'x-ai/grok-4.1-fast:free';
      this.maxTokens = 4000;
      this.temperature = 0.7;
      return {
        model: this.model,
        maxTokens: this.maxTokens,
        temperature: this.temperature
      };
    }
  }

  // Ensure config is loaded before making API calls
  async ensureConfigLoaded() {
    if (!this.model) {
      await this.getAiConfig();
    }
  }

  // Generate complete website template using OpenRoute API
  async generateCompleteTemplate(params) {
    try {
      const { description, websiteType, style, colorScheme, includeSections, userId, tailwindMode = false } = params;
      
      console.log('Generating template with params:', params);
      
      if (!this.apiKey) {
        console.log('No API key found, using fallback HTML/CSS');
        const fallback = this.createFallbackHtmlCss(params);
        const sanitized = this.sanitizeOutput({ html: fallback.html, css: fallback.css });
        return {
          success: true,
          html: sanitized.html,
          css: sanitized.css,
          slots: fallback.slots,
          meta: fallback.meta,
          reasoning: 'Generated fallback (no API key configured)',
          suggestions: ['Configure OpenRouter API key for AI-generated templates']
        };
      }

      console.log('API key found, attempting to call OpenRoute API...');

      // Enhanced prompt with user input as priority
      const enhancedPrompt = this.buildTemplatePrompt({
        description,
        websiteType,
        style,
        colorScheme,
        includeSections,
        tailwindMode
      });

      console.log('Sending request to OpenRoute API with prompt:', enhancedPrompt);

      // Call OpenRoute API
      const response = await this.callOpenRouteAPI(enhancedPrompt);
      
      if (!response.success) {
        console.log('OpenRoute API call failed:', response.error);
        console.log('Using fallback HTML/CSS');
        const fallback = this.createFallbackHtmlCss(params);
        const sanitized = this.sanitizeOutput({ html: fallback.html, css: fallback.css });
        return {
          success: true,
          html: sanitized.html,
          css: sanitized.css,
          slots: fallback.slots,
          meta: fallback.meta,
          reasoning: `Generated fallback (OpenRoute API failed: ${response.error})`,
          suggestions: ['Check API key validity and network connection', 'Verify OpenRouter API key is active']
        };
      }

      // Parse strict JSON into { html, css, slots, meta }
      const { html, css, slots, meta } = this.parseTemplateStrictResponse(response.content, params);
      const sanitized = this.sanitizeOutput({ html, css });
      return {
        success: true,
        html: sanitized.html,
        css: sanitized.css,
        slots,
        meta,
        reasoning: response.reasoning || 'Template generated successfully',
        suggestions: response.suggestions || []
      };

    } catch (error) {
      console.error('Generate Complete Template Error:', error);
      const fallback = this.createFallbackHtmlCss(params);
      const sanitized = this.sanitizeOutput({ html: fallback.html, css: fallback.css });
      return {
        success: true,
        html: sanitized.html,
        css: sanitized.css,
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
      console.log('Raw AI response:', content);
      let cleanContent = content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in AI response');
      const jsonString = jsonMatch[0];
      const data = JSON.parse(jsonString);
      const html = typeof data.html === 'string' ? data.html : '';
      const css = typeof data.css === 'string' ? data.css : '';
      const slots = Array.isArray(data.slots) ? data.slots : [];
      const meta = typeof data.meta === 'object' && data.meta !== null ? data.meta : { title: params.description || 'AI Template' };
      return { html, css, slots, meta };
    } catch (error) {
      console.error('Parse Template Strict Response Error:', error);
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
    const { description, websiteType, style, colorScheme, includeSections, tailwindMode = false } = params;
    const sections = Array.isArray(includeSections) && includeSections.length > 0
      ? includeSections.join(', ')
      : 'header, hero, 2-3 content sections, footer';
    
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

OUTPUT FORMAT (STRICT JSON):
{
  "html": "Complete HTML body content (no <html> or <head> tags)",
  "css": "Complete CSS with variables, responsive design, and animations",
  "slots": [{"id":"slot_id","type":"image|text|button","description":"Description"}],
  "meta": {"title":"Template Title", "colorScheme":"${colorScheme}", "style":"${style}"}${tailwindMode ? ',\n  "tailwind_html": "..."' : ''}
}

USER REQUEST: "${description}"
WEBSITE TYPE: ${websiteType}
DESIGN STYLE: ${style}
COLOR SCHEME: ${colorScheme}
REQUIRED SECTIONS: ${sections}

**CRITICAL CONTENT GENERATION RULES:**
1. **Understand the user's intent** from their prompt and create appropriate content
2. **For portfolio requests**: Create sections for "About Me", "My Work/Projects", "Skills", "Education", "Contact" with realistic content
3. **For business requests**: Create sections for "Services", "About Us", "Testimonials", "Contact" with professional content
4. **For blog requests**: Create article layouts, category navigation, author sections
5. **For landing pages**: Create compelling hero sections, feature highlights, testimonials, CTAs
6. **NEVER use the user's exact prompt text as content** - interpret it and create appropriate website content
7. **Use professional, realistic text** that matches the website type and user's intent
8. **Example**: If user says "portfolio for someone who just graduated", create content like "Recent Graduate", "Education", "Projects", "Skills", "Get In Touch" - NOT the prompt text itself

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

**Components to Include:**
1. **Header/Navigation:**
   - Sticky positioning with backdrop blur
   - Logo/brand area (data-slot="logo")
   - Navigation menu (horizontal on desktop, hamburger on mobile)
   - Clean, minimal design

2. **Hero Section:**
   - Compelling headline (data-slot="headline")
   - Supporting subheadline (data-slot="subheadline")
   - Hero image/visual area (data-slot="hero_image")
   - Primary CTA button (data-slot="primary_cta")
   - Secondary CTA button (optional, data-slot="secondary_cta")
   - Modern layout with proper spacing

3. **Content Sections:**
   - Feature sections with icons/images (data-slot="feature_icon_X", "feature_title_X", "feature_desc_X")
   - About/Description section
   - Services/Products section (if applicable)
   - Testimonials or social proof (if applicable)
   - Use cards with subtle borders and shadows

4. **Footer:**
   - Footer logo (data-slot="footer_logo")
   - Footer links or content
   - Copyright text (data-slot="footer_text")
   - Clean, organized layout

**CSS Requirements:**
- Use CSS custom properties (variables) for colors, spacing, and typography
- Example: :root { --brand: ${palette.primary}; --bg: ${palette.bg}; --text: ${palette.text}; --spacing-xs: 4px; --spacing-sm: 8px; --spacing-md: 16px; --spacing-lg: 24px; --spacing-xl: 32px; --spacing-2xl: 48px; --spacing-3xl: 64px; }
- Mobile-first media queries: @media (min-width: 640px), @media (min-width: 768px), @media (min-width: 1024px)
- Smooth transitions: transition: all 0.2s ease or transition: transform 0.2s ease, opacity 0.2s ease
- Subtle animations: Use @keyframes for loading states, hover effects, or entrance animations
- Professional button styles: rounded corners (8-12px), proper padding, hover states with transform or shadow changes
- Card components: border-radius: 12-16px, subtle shadow, padding: 24-32px

**HTML Requirements:**
- Semantic HTML5: <header>, <nav>, <main>, <section>, <article>, <footer>
- Proper heading hierarchy (h1 → h2 → h3)
- Accessibility: aria-labels where needed, alt text placeholders
- Use data-slot attributes for all replaceable content
- Clean, readable class names (BEM-like: .site-header, .hero-section, .feature-card)
- No inline styles (except data attributes)
- Proper indentation and structure

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
- Card-based layouts` : ''}

${style === 'minimal' ? `- Extremely clean, maximum white space
- Minimal color usage (mostly monochrome with one accent)
- Simple typography, no decorative elements
- Focus on content and readability` : ''}

${style === 'bold' ? `- Strong colors and high contrast
- Large, impactful typography
- Bold geometric shapes
- Strong visual hierarchy
- Eye-catching design elements` : ''}

${style === 'elegant' ? `- Sophisticated color palette
- Refined typography with serif or elegant sans-serif
- Subtle decorative elements
- Premium feel with attention to detail
- Classic layouts with modern touches` : ''}

${style === 'creative' ? `- Unique layouts and compositions
- Creative use of space and typography
- Artistic elements and patterns
- Bold color combinations
- Experimental but functional design` : ''}

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
          max_tokens: this.maxTokens,
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