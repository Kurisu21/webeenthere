// controllers/AiController.js
const AiService = require('../services/AiService');
const AiPrompt = require('../models/AiPrompt');

class AiController {
  constructor(db) {
    this.aiService = new AiService();
    this.aiPromptModel = new AiPrompt(db);
  }

  async generateSection(req, res) {
    try {
      const { prompt, websiteContext, userId } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required'
        });
      }

      // Generate AI response
      const aiResponse = await this.aiService.generateWebsiteSection(prompt, websiteContext);

      if (!aiResponse.success) {
        return res.status(500).json({
          success: false,
          error: aiResponse.error || 'Failed to generate AI response'
        });
      }

      // Save the prompt to database if userId is provided
      if (userId) {
        try {
          await this.aiPromptModel.create({
            user_id: userId,
            prompt_type: 'section',
            prompt_text: prompt,
            response_html: JSON.stringify(aiResponse.elements),
            used_on_site: false
          });
        } catch (dbError) {
          console.error('Failed to save AI prompt:', dbError);
          // Continue even if database save fails
        }
      }

      res.json({
        success: true,
        elements: aiResponse.elements,
        suggestions: aiResponse.suggestions,
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

      // Save the prompt to database if userId is provided
      if (userId) {
        try {
          await this.aiPromptModel.create({
            user_id: userId,
            prompt_type: 'improvement',
            prompt_text: improvementPrompt,
            response_html: JSON.stringify(aiResponse.improvedElements),
            used_on_site: false
          });
        } catch (dbError) {
          console.error('Failed to save AI prompt:', dbError);
        }
      }

      res.json({
        success: true,
        improvedElements: aiResponse.improvedElements,
        improvements: aiResponse.improvements,
        reasoning: aiResponse.reasoning,
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


