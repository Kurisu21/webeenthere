// controllers/AiController.js
const AiService = require('../services/AiService');
const AiPrompt = require('../models/AiPrompt');
const SubscriptionService = require('../services/SubscriptionService');

class AiController {
  constructor(db) {
    this.db = db;
    this.aiService = new AiService();
    this.aiPromptModel = new AiPrompt(db);
    this.subscriptionService = new SubscriptionService(db);
  }

  async generateTemplate(req, res) {
    try {
      console.log('=== AI TEMPLATE GENERATION REQUEST ===');
      console.log('Request body received:', req.body);
      console.log('Request headers:', req.headers);
      console.log('Request method:', req.method);
      console.log('Request URL:', req.url);
      
      const { 
        description, 
        websiteType = 'general',
        style = 'modern',
        colorScheme = 'blue',
        includeSections = []
      } = req.body;

      const authUserId = req.user?.id || null;

      console.log('Extracted parameters:', { description, authUserId, websiteType, style, colorScheme });

      if (!description) {
        console.log('ERROR: No description provided');
        return res.status(400).json({
          success: false,
          error: 'Website description is required'
        });
      }

      // Check AI chat limits if authenticated
      if (authUserId) {
        const aiChatLimits = await this.subscriptionService.checkAiChatLimit(authUserId);
        if (!aiChatLimits.canUse) {
          console.log('ERROR: AI chat limit reached for user:', userId);
          return res.status(403).json({
            success: false,
            error: `AI chat limit reached. You have used ${aiChatLimits.used || 0} of ${aiChatLimits.limit} AI messages allowed.`,
            errorCode: 'AI_CHAT_LIMIT_REACHED',
            upgradeRequired: true,
            currentUsage: aiChatLimits
          });
        }
      }

      console.log('Generating template for:', { description, userId: authUserId, websiteType, style, colorScheme });

      // Generate template using AI service (strict html/css)
      const templateResult = await this.aiService.generateCompleteTemplate({
        description,
        websiteType,
        style,
        colorScheme,
        includeSections,
        userId: authUserId || 'anonymous'
      });

      if (!templateResult.success) {
        return res.status(500).json({
          success: false,
          error: templateResult.error || 'Failed to generate template'
        });
      }

      // Support both new and old shapes for backward compat
      let savedTemplate;
      if (templateResult.html || templateResult.css) {
        // New strict shape
        savedTemplate = {
          id: `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${style} ${websiteType} Template`,
          description: description || 'AI Generated Template',
          category: websiteType || 'ai-generated',
          html: templateResult.html || '',
          css: templateResult.css || '',
          slots: templateResult.slots || [],
          meta: templateResult.meta || {},
          tags: ['ai-generated', websiteType, style]
        };
      } else {
        // Legacy shape via existing helper
        savedTemplate = await this.saveGeneratedTemplate({
          ...templateResult.template,
          userId: authUserId || 'anonymous',
          originalDescription: description
        });
      }

      // Record AI prompt usage
      let aiPromptId = null;
      try {
        aiPromptId = await this.aiPromptModel.create({
          user_id: authUserId || null,
          prompt_type: 'template_generate',
          prompt_text: JSON.stringify({ description, websiteType, style, colorScheme, includeSections }),
          response_html: JSON.stringify(savedTemplate),
          used_on_site: 0
        });
      } catch (e) {
        console.warn('Failed to record AI prompt:', e.message);
      }

      const response = templateResult.html || templateResult.css
        ? {
            success: true,
            html: templateResult.html,
            css: templateResult.css,
            slots: templateResult.slots || [],
            meta: templateResult.meta || {},
            template: savedTemplate,
            reasoning: templateResult.reasoning,
            suggestions: templateResult.suggestions || [],
            aiPromptId
          }
        : {
            success: true,
            template: savedTemplate,
            reasoning: templateResult.reasoning,
            suggestions: templateResult.suggestions || [],
            aiPromptId
          };
      
      // Increment AI chat usage if userId is provided and generation was successful
      if (authUserId && templateResult.success) {
        await this.subscriptionService.incrementAiChatUsage(authUserId);
        console.log('Incremented AI chat usage for user:', authUserId);
      }
      
      console.log('Sending response:', response);
      res.json(response);

    } catch (error) {
      console.error('Generate Template Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate template'
      });
    }
  }

  async saveGeneratedTemplate(templateData) {
    try {
      // Create a unique ID for the generated template
      const templateId = `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const template = {
        id: templateId,
        name: templateData.name || 'AI Generated Template',
        description: templateData.description || 'Generated by AI',
        category: templateData.category || 'ai-generated',
        image: templateData.image || '/api/placeholder/400/300',
        elements: templateData.elements || [],
        css_base: templateData.css_base || '',
        is_featured: false,
        tags: ['ai-generated', ...(templateData.tags || [])],
        created_at: new Date(),
        user_id: templateData.userId,
        original_description: templateData.originalDescription
      };

      // For now, return the template object
      // In a real implementation, you'd save this to the database
      return template;
    } catch (error) {
      console.error('Save Template Error:', error);
      throw error;
    }
  }

  async improveCanvas(req, res) {
    try {
      const { html, css, intent = 'all', brandHints } = req.body || {};

      if (!html && !css) {
        return res.status(400).json({ success: false, error: 'HTML or CSS is required' });
      }

      // Optional: enforce AI chat limits similar to generation
      if (req.user?.id) {
        const aiChatLimits = await this.subscriptionService.checkAiChatLimit(req.user.id);
        if (!aiChatLimits.canUse) {
          return res.status(403).json({
            success: false,
            error: `AI chat limit reached. You have used ${aiChatLimits.used || 0} of ${aiChatLimits.limit} AI messages allowed.`,
            errorCode: 'AI_CHAT_LIMIT_REACHED',
            upgradeRequired: true,
            currentUsage: aiChatLimits
          });
        }
      }

      const result = await this.aiService.improveCanvas({ html, css, intent, brandHints });
      let aiPromptId = null;
      try {
        aiPromptId = await this.aiPromptModel.create({
          user_id: req.user?.id || null,
          prompt_type: 'improve_canvas',
          prompt_text: JSON.stringify({ intent, brandHints }),
          response_html: JSON.stringify({ html: result.html, css: result.css }),
          used_on_site: 0
        });
      } catch (e) {
        console.warn('Failed to record AI improve prompt:', e.message);
      }
      if (req.user?.id && result.success) {
        await this.subscriptionService.incrementAiChatUsage(req.user.id);
      }
      return res.json({ ...result, aiPromptId });
    } catch (error) {
      console.error('Improve Canvas Controller Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to improve canvas' });
    }
  }
}

module.exports = AiController;


