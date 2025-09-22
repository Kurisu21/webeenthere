// controllers/AiController.js
const ContextAwareAiService = require('../services/ContextAwareAiService');
const AIOrchestrationService = require('../services/AIOrchestrationService');
const AiPrompt = require('../models/AiPrompt');

class AiController {
  constructor(db) {
    this.aiService = new ContextAwareAiService();
    this.orchestrationService = new AIOrchestrationService();
    this.aiPromptModel = new AiPrompt(db);
  }

  async generateSection(req, res) {
    try {
      const { prompt, websiteContext, userId, elements = [], useOrchestration = false } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required'
        });
      }

      let aiResponse;
      
      // Use orchestration for complex requests or when explicitly requested
      if (useOrchestration || this.shouldUseOrchestration(prompt)) {
        aiResponse = await this.orchestrationService.orchestrateComplexRequest(
          userId || 'anonymous', 
          prompt, 
          elements
        );
      } else {
        // Use enhanced prompt with context
        const enhancedPrompt = this.orchestrationService.enhancePromptWithContext(
          prompt, 
          elements, 
          userId || 'anonymous'
        );
        
        aiResponse = await this.aiService.generateWebsiteSection(
          enhancedPrompt, 
          elements, 
          'generate'
        );
      }

      if (!aiResponse.success) {
        return res.status(500).json({
          success: false,
          error: aiResponse.error || 'Failed to generate AI response'
        });
      }

      // Save the prompt to database if userId is provided and database is available
      if (userId && process.env.NODE_ENV !== 'test') {
        try {
          await this.aiPromptModel.create({
            user_id: userId,
            prompt_type: useOrchestration ? 'orchestrated' : 'section',
            prompt_text: prompt,
            response_html: JSON.stringify(aiResponse.elements),
            used_on_site: false
          });
        } catch (dbError) {
          // Silently skip database save during testing/development
          if (process.env.NODE_ENV === 'development') {
            console.log('Skipping database save during development/testing');
          } else {
            console.error('Failed to save AI prompt:', dbError);
          }
        }
      }

      res.json({
        success: true,
        elements: aiResponse.elements,
        suggestions: aiResponse.suggestions,
        reasoning: aiResponse.reasoning,
        context: aiResponse.context,
        rawResponse: aiResponse.rawResponse,
        orchestrated: useOrchestration || this.shouldUseOrchestration(prompt),
        stepsCompleted: aiResponse.stepsCompleted || 1
      });

    } catch (error) {
      console.error('AI Controller Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  shouldUseOrchestration(prompt) {
    const orchestrationKeywords = [
      'complete website', 'full site', 'entire page', 'multiple sections',
      'navigation', 'footer', 'header', 'multiple pages', 'e-commerce',
      'portfolio with', 'business website with', 'landing page with',
      'create everything', 'build complete', 'make a full'
    ];
    
    return orchestrationKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
  }

  async improveContent(req, res) {
    try {
      const { existingElements, improvementPrompt, userId } = req.body;

      if (!improvementPrompt || !existingElements) {
        return res.status(400).json({
          success: false,
          error: 'Improvement prompt and existing elements are required'
        });
      }

      // Generate AI improvements
      const aiResponse = await this.aiService.improveWebsiteContent(existingElements, improvementPrompt);

      if (!aiResponse.success) {
        return res.status(500).json({
          success: false,
          error: aiResponse.error || 'Failed to generate AI improvements'
        });
      }

      // Save the prompt to database if userId is provided and database is available
      if (userId && process.env.NODE_ENV !== 'test') {
        try {
          await this.aiPromptModel.create({
            user_id: userId,
            prompt_type: 'improvement',
            prompt_text: improvementPrompt,
            response_html: JSON.stringify(aiResponse.improvedElements),
            used_on_site: false
          });
        } catch (dbError) {
          // Silently skip database save during testing/development
          if (process.env.NODE_ENV === 'development') {
            console.log('Skipping database save during development/testing');
          } else {
            console.error('Failed to save AI prompt:', dbError);
          }
        }
      }

      res.json({
        success: true,
        improvedElements: aiResponse.improvedElements,
        improvements: aiResponse.improvements,
        reasoning: aiResponse.reasoning,
        context: aiResponse.context,
        rawResponse: aiResponse.rawResponse
      });

    } catch (error) {
      console.error('AI Controller Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getSuggestions(req, res) {
    try {
      const { websiteType, currentElements } = req.query;

      const suggestions = await this.aiService.generateSuggestions(websiteType, currentElements);

      res.json({
        success: true,
        suggestions
      });

    } catch (error) {
      console.error('AI Controller Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getUserPrompts(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // This would need to be implemented in the AiPrompt model
      const prompts = await this.aiPromptModel.findByUserId(userId);

      res.json({
        success: true,
        prompts
      });

    } catch (error) {
      console.error('AI Controller Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = AiController;


