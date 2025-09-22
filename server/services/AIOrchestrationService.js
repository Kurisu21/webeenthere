// services/AIOrchestrationService.js
const ContextAwareAiService = require('./ContextAwareAiService');

class AIOrchestrationService {
  constructor() {
    this.contextService = new ContextAwareAiService();
    this.conversationHistory = new Map(); // Store conversation context per user
  }

  // Multi-step AI orchestration for complex requests
  async orchestrateComplexRequest(userId, request, elements = []) {
    const conversation = this.getConversationHistory(userId);
    
    // Step 1: Analyze the request complexity
    const requestAnalysis = this.analyzeRequestComplexity(request);
    
    if (requestAnalysis.complexity === 'simple') {
      // Direct generation for simple requests
      return await this.contextService.generateWebsiteSection(request, elements, 'generate');
    }
    
    // Step 2: Break down complex requests into steps
    const steps = this.breakDownRequest(request, elements);
    
    // Step 3: Execute steps sequentially
    const results = [];
    let currentElements = [...elements];
    
    for (const step of steps) {
      const stepResult = await this.executeStep(step, currentElements, conversation);
      results.push(stepResult);
      
      if (stepResult.success) {
        currentElements = [...currentElements, ...stepResult.elements];
      }
    }
    
    // Step 4: Synthesize final result
    return this.synthesizeResults(results, request);
  }

  analyzeRequestComplexity(request) {
    const complexKeywords = [
      'complete website', 'full site', 'entire page', 'multiple sections',
      'navigation', 'footer', 'header', 'multiple pages', 'e-commerce',
      'portfolio with', 'business website with', 'landing page with'
    ];
    
    const hasComplexKeywords = complexKeywords.some(keyword => 
      request.toLowerCase().includes(keyword)
    );
    
    const wordCount = request.split(' ').length;
    
    return {
      complexity: hasComplexKeywords || wordCount > 15 ? 'complex' : 'simple',
      keywords: complexKeywords.filter(keyword => 
        request.toLowerCase().includes(keyword)
      ),
      wordCount
    };
  }

  breakDownRequest(request, elements) {
    const steps = [];
    
    // Analyze what's missing
    const context = this.contextService.analyzeWebsiteContext(elements);
    
    if (request.toLowerCase().includes('complete website') || 
        request.toLowerCase().includes('full site')) {
      
      // Step 1: Navigation
      if (!context.hasNavigation) {
        steps.push({
          type: 'generate',
          prompt: 'Create a professional navigation menu',
          priority: 1
        });
      }
      
      // Step 2: Hero section
      if (!context.hasHero) {
        steps.push({
          type: 'generate',
          prompt: 'Create an engaging hero section',
          priority: 2
        });
      }
      
      // Step 3: Content sections
      steps.push({
        type: 'generate',
        prompt: 'Add main content sections',
        priority: 3
      });
      
      // Step 4: Footer
      if (!context.hasFooter) {
        steps.push({
          type: 'generate',
          prompt: 'Create a footer with links and contact info',
          priority: 4
        });
      }
    } else if (request.toLowerCase().includes('e-commerce') || 
               request.toLowerCase().includes('shop')) {
      
      steps.push({
        type: 'generate',
        prompt: 'Create product showcase section',
        priority: 1
      });
      
      steps.push({
        type: 'generate',
        prompt: 'Add pricing section',
        priority: 2
      });
      
      steps.push({
        type: 'generate',
        prompt: 'Create call-to-action buttons for purchases',
        priority: 3
      });
    } else if (request.toLowerCase().includes('portfolio')) {
      
      steps.push({
        type: 'generate',
        prompt: 'Create project gallery section',
        priority: 1
      });
      
      steps.push({
        type: 'generate',
        prompt: 'Add skills and experience section',
        priority: 2
      });
      
      steps.push({
        type: 'generate',
        prompt: 'Create contact section for clients',
        priority: 3
      });
    }
    
    return steps.sort((a, b) => a.priority - b.priority);
  }

  async executeStep(step, elements, conversation) {
    try {
      // Add conversation context to prompt
      const contextualPrompt = this.buildContextualPrompt(step.prompt, elements, conversation);
      
      const result = await this.contextService.generateWebsiteSection(
        contextualPrompt, 
        elements, 
        'generate'
      );
      
      // Store step in conversation history
      conversation.steps.push({
        step: step.prompt,
        result: result.success,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('Step execution error:', error);
      return {
        success: false,
        error: error.message,
        elements: []
      };
    }
  }

  buildContextualPrompt(stepPrompt, elements, conversation) {
    const context = this.contextService.analyzeWebsiteContext(elements);
    
    let contextualPrompt = stepPrompt;
    
    // Add previous step context
    if (conversation.steps.length > 0) {
      const recentSteps = conversation.steps.slice(-2);
      contextualPrompt += `\n\nPrevious steps completed: ${recentSteps.map(s => s.step).join(', ')}`;
    }
    
    // Add current website state
    contextualPrompt += `\n\nCurrent website state: ${context.summary}`;
    
    return contextualPrompt;
  }

  synthesizeResults(results, originalRequest) {
    const successfulResults = results.filter(r => r.success);
    const allElements = successfulResults.flatMap(r => r.elements);
    const allSuggestions = successfulResults.flatMap(r => r.suggestions);
    
    return {
      success: successfulResults.length > 0,
      elements: allElements,
      suggestions: [...new Set(allSuggestions)], // Remove duplicates
      reasoning: `Completed ${successfulResults.length} steps for: ${originalRequest}`,
      context: successfulResults[0]?.context,
      stepsCompleted: successfulResults.length,
      totalSteps: results.length
    };
  }

  getConversationHistory(userId) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, {
        steps: [],
        lastActivity: Date.now()
      });
    }
    return this.conversationHistory.get(userId);
  }

  // Smart prompt enhancement
  enhancePromptWithContext(prompt, elements, userId) {
    const context = this.contextService.analyzeWebsiteContext(elements);
    const conversation = this.getConversationHistory(userId);
    
    // Add contextual hints
    let enhancedPrompt = prompt;
    
    if (context.elementCount === 0) {
      enhancedPrompt = `Create a new website. ${prompt}`;
    } else if (context.elementCount < 3) {
      enhancedPrompt = `Expand the existing simple website. ${prompt}`;
    } else {
      enhancedPrompt = `Enhance the existing website. ${prompt}`;
    }
    
    // Add theme-specific guidance
    if (context.contentThemes.includes('business')) {
      enhancedPrompt += ' Focus on professional, corporate styling.';
    } else if (context.contentThemes.includes('portfolio')) {
      enhancedPrompt += ' Focus on creative, showcase-oriented design.';
    } else if (context.contentThemes.includes('ecommerce')) {
      enhancedPrompt += ' Focus on conversion-optimized design.';
    }
    
    return enhancedPrompt;
  }

  // Clean up old conversations
  cleanupConversations() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [userId, conversation] of this.conversationHistory.entries()) {
      if (now - conversation.lastActivity > maxAge) {
        this.conversationHistory.delete(userId);
      }
    }
  }
}

module.exports = AIOrchestrationService;

