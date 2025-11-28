// controllers/AiController.js
const AiService = require('../services/AiService');
const AiPrompt = require('../models/AiPrompt');
const SubscriptionService = require('../services/SubscriptionService');
const ContentModerationService = require('../services/ContentModerationService');

class AiController {
  constructor(db) {
    this.db = db;
    this.aiService = new AiService();
    this.aiPromptModel = new AiPrompt(db);
    this.subscriptionService = new SubscriptionService(db);
    this.contentModeration = new ContentModerationService();
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

      // Validate and moderate input
      const moderationResult = this.contentModeration.validateInput(description, {
        checkProfanity: true,
        checkInjection: true,
        checkLength: true,
        checkSuspicious: true
      });

      if (!moderationResult.isValid) {
        console.log('ERROR: Content moderation failed:', moderationResult.reason);
        return res.status(400).json({
          success: false,
          error: moderationResult.reason,
          errorCode: moderationResult.errorCode
        });
      }

      // Use sanitized input
      const sanitizedDescription = moderationResult.sanitized;

      // Check AI chat limits if authenticated
      if (authUserId) {
        const aiChatLimits = await this.subscriptionService.checkAiChatLimit(authUserId);
        if (!aiChatLimits.canUse) {
          console.log('ERROR: AI chat limit reached for user:', authUserId);
          return res.status(403).json({
            success: false,
            error: `AI chat limit reached. You have used ${aiChatLimits.used || 0} of ${aiChatLimits.limit} AI messages allowed.`,
            errorCode: 'AI_CHAT_LIMIT_REACHED',
            upgradeRequired: true,
            currentUsage: aiChatLimits
          });
        }
      }

      console.log('Generating template for:', { description: sanitizedDescription, userId: authUserId, websiteType, style, colorScheme });

      // Generate template using AI service (strict html/css)
      const templateResult = await this.aiService.generateCompleteTemplate({
        description: sanitizedDescription,
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
          html_base: templateResult.html || '', // Also include for compatibility
          css_base: templateResult.css || '', // Also include for compatibility
          slots: templateResult.slots || [],
          meta: templateResult.meta || {},
          tags: ['ai-generated', websiteType, style],
          elements: [] // Empty elements array since we're using HTML/CSS
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
          prompt_text: JSON.stringify({ description: sanitizedDescription, websiteType, style, colorScheme, includeSections }),
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
            template: {
              ...savedTemplate,
              // Ensure template object has all necessary fields
              html: savedTemplate.html || templateResult.html || '',
              css: savedTemplate.css || templateResult.css || '',
              html_base: savedTemplate.html_base || templateResult.html || '',
              css_base: savedTemplate.css_base || templateResult.css || ''
            },
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

      // Validate and moderate brandHints if provided
      if (brandHints && typeof brandHints === 'string') {
        const moderationResult = this.contentModeration.validateInput(brandHints, {
          checkProfanity: true,
          checkInjection: true,
          checkLength: true,
          checkSuspicious: true
        });

        if (!moderationResult.isValid) {
          return res.status(400).json({
            success: false,
            error: moderationResult.reason,
            errorCode: moderationResult.errorCode
          });
        }
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

  async handleAssistantRequest(req, res) {
    try {
      const { prompt, userInput, isUserPrompt = false, website_id, conversation_id } = req.body || {};

      // Log authentication status for debugging
      const authHeader = req.header('Authorization');
      const hasToken = !!authHeader;
      const isAuthenticated = !!req.user?.id;
      console.log('[AI Assistant] Request received:', {
        hasToken,
        isAuthenticated,
        userId: req.user?.id || 'none',
        websiteId: website_id || 'none'
      });

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required and must be a string'
        });
      }

      // Validate and moderate user input (check userInput if provided, otherwise check prompt)
      const inputToValidate = userInput || prompt;
      const moderationResult = this.contentModeration.validateInput(inputToValidate, {
        checkProfanity: true,
        checkInjection: true,
        checkLength: true,
        checkSuspicious: true
      });

      if (!moderationResult.isValid) {
        console.log('[AI Assistant] Content moderation failed:', moderationResult.reason);
        return res.status(400).json({
          success: false,
          error: moderationResult.reason,
          errorCode: moderationResult.errorCode
        });
      }

      // Use sanitized input
      const sanitizedInput = moderationResult.sanitized;

      // Generate conversation_id if not provided (for new conversations)
      const currentConversationId = conversation_id || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Check AI chat limits if authenticated
      if (req.user?.id) {
        console.log('[AI Assistant] User authenticated, checking limits for user:', req.user.id);
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

      // Store user message in chat history BEFORE calling AI (use sanitized input)
      const userMessageText = isUserPrompt ? sanitizedInput : (userInput ? sanitizedInput : 'Auto-suggestion request');
      let userMessageId = null;
      try {
        userMessageId = await this.aiPromptModel.create({
          user_id: req.user?.id || null,
          prompt_type: 'assistant_request',
          prompt_text: userMessageText,
          response_html: null,
          used_on_site: false,
          website_id: website_id || null,
          conversation_id: currentConversationId,
          message_type: 'user',
          execution_status: 'pending'
        });
      } catch (e) {
        console.warn('Failed to record user message:', e.message);
      }

      // Call OpenRouter API to get AI response (use full prompt with system instructions)
      const aiResponse = await this.aiService.callOpenRouteAPI(prompt);

      if (!aiResponse.success) {
        return res.status(500).json({
          success: false,
          error: aiResponse.error || 'Failed to get AI response'
        });
      }

      // Parse the AI response (should be JSON with explanation and code)
      let suggestion;
      try {
        const cleaned = aiResponse.content.trim()
          .replace(/^```json\s*/g, '')
          .replace(/^```javascript\s*/g, '')
          .replace(/^```\s*/g, '')
          .replace(/\s*```$/g, '')
          .trim();

        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in AI response');
        }

        suggestion = JSON.parse(jsonMatch[0]);

        if (!suggestion.explanation || !suggestion.code) {
          throw new Error('Missing explanation or code in AI response');
        }
      } catch (parseError) {
        console.error('[AI Assistant] Failed to parse AI response:', parseError);
        return res.status(500).json({
          success: false,
          error: 'Failed to parse AI response. Please try again.',
          rawResponse: aiResponse.content.substring(0, 200)
        });
      }

      // Store AI response in chat history
      let aiResponseId = null;
      try {
        aiResponseId = await this.aiPromptModel.create({
          user_id: req.user?.id || null,
          prompt_type: 'assistant_request',
          prompt_text: userMessageText, // Store the user's original input, not the full prompt
          response_html: JSON.stringify(suggestion),
          used_on_site: false,
          website_id: website_id || null,
          conversation_id: currentConversationId,
          message_type: 'assistant',
          execution_status: 'pending'
        });
      } catch (e) {
        console.warn('Failed to record AI assistant response:', e.message);
      }

      // Increment AI chat usage if authenticated
      if (req.user?.id) {
        console.log('[AI Assistant] Incrementing usage for authenticated user:', req.user.id);
        await this.subscriptionService.incrementAiChatUsage(req.user.id);
      } else {
        console.log('[AI Assistant] Request from unauthenticated user - no usage tracking');
      }

      // Estimate token count (rough approximation)
      const tokenCount = Math.ceil((prompt.length + aiResponse.content.length) / 4);

      console.log('[AI Assistant] Request completed successfully:', {
        authenticated: !!req.user?.id,
        conversationId: currentConversationId,
        messageSaved: !!aiResponseId
      });

      return res.json({
        success: true,
        suggestion: {
          explanation: suggestion.explanation,
          code: suggestion.code
        },
        tokenCount,
        conversationId: currentConversationId,
        messageId: aiResponseId,
        userMessageId: userMessageId
      });

    } catch (error) {
      console.error('AI Assistant Request Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process AI assistant request'
      });
    }
  }

  async getChatHistory(req, res) {
    try {
      const { websiteId } = req.params;
      const userId = req.user?.id;

      if (!websiteId) {
        return res.status(400).json({
          success: false,
          error: 'Website ID is required'
        });
      }

      // If not authenticated, return empty history (no error)
      if (!userId) {
        return res.json({
          success: true,
          conversations: []
        });
      }

      // Get all messages for this website
      const messages = await this.aiPromptModel.findByWebsiteId(parseInt(websiteId));

      // Filter to only assistant_request type and group by conversation_id
      const conversations = {};
      messages
        .filter(msg => msg.prompt_type === 'assistant_request')
        .forEach(msg => {
          const convId = msg.conversation_id || 'default';
          if (!conversations[convId]) {
            conversations[convId] = [];
          }
          conversations[convId].push({
            id: msg.id,
            messageType: msg.message_type,
            promptText: msg.prompt_text,
            responseHtml: msg.response_html,
            executionStatus: msg.execution_status,
            createdAt: msg.created_at
          });
        });

      // Convert to array format and sort by most recent conversation
      const conversationList = Object.entries(conversations)
        .map(([conversationId, messages]) => ({
          conversationId,
          messages: messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
          lastMessageAt: messages[messages.length - 1]?.createdAt
        }))
        .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

      return res.json({
        success: true,
        conversations: conversationList
      });

    } catch (error) {
      console.error('Get Chat History Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve chat history'
      });
    }
  }

  // Helper method to extract user input from the full prompt
  extractUserInputFromPrompt(fullPrompt) {
    // Try to find the "USER REQUEST:" section in the prompt
    const userRequestMatch = fullPrompt.match(/USER REQUEST:\s*"([^"]+)"/);
    if (userRequestMatch && userRequestMatch[1]) {
      return userRequestMatch[1];
    }
    
    // If no match, try to find text after "USER REQUEST:"
    const userRequestIndex = fullPrompt.indexOf('USER REQUEST:');
    if (userRequestIndex !== -1) {
      const afterRequest = fullPrompt.substring(userRequestIndex + 'USER REQUEST:'.length).trim();
      // Get first line or first quoted string
      const firstLine = afterRequest.split('\n')[0].trim();
      if (firstLine.startsWith('"') && firstLine.endsWith('"')) {
        return firstLine.slice(1, -1);
      }
      return firstLine.substring(0, 200); // Limit to 200 chars
    }
    
    // Fallback: return a generic message
    return 'User request';
  }
}

module.exports = AiController;


