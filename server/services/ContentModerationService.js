// services/ContentModerationService.js
// Content moderation service to filter harmful inputs for AI prompts and template generation

class ContentModerationService {
  constructor() {
    // Initialize bad words filter (we'll use a simple implementation)
    // In production, you might want to use npm package 'bad-words' or similar
    this.profanityWords = this.initializeProfanityList();
    
    // Patterns to detect code injection attempts
    this.injectionPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick=, onerror=, etc.
      /<iframe[\s\S]*?>/gi,
      /<object[\s\S]*?>/gi,
      /<embed[\s\S]*?>/gi,
      /eval\s*\(/gi,
      /exec\s*\(/gi,
      /SELECT.*FROM/gi,
      /INSERT.*INTO/gi,
      /DELETE.*FROM/gi,
      /UPDATE.*SET/gi,
      /DROP.*TABLE/gi,
      /UNION.*SELECT/gi,
      /<svg[\s\S]*?onload/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi
    ];
    
    // Maximum input length (prevent abuse)
    this.maxInputLength = 5000; // characters
  }

  /**
   * Initialize a basic profanity word list
   * In production, consider using a comprehensive library or API
   */
  initializeProfanityList() {
    // Basic profanity list - you can expand this or use a library
    const words = [
      // Common profanity (censored examples)
      'f***', 's***', 'a**', 'b****', 'd***', 'h***', 'c***', 'p***',
      // Hate speech indicators
      'kill yourself', 'kys', 'die', 'suicide',
      // Extremely inappropriate content
      'nazi', 'hitler', 'kkk'
    ];
    
    // Create regex patterns for word boundaries
    return words.map(word => new RegExp(`\\b${word.replace(/\*/g, '\\w*')}\\b`, 'gi'));
  }

  /**
   * Check if input contains profanity
   * @param {string} text - Text to check
   * @returns {boolean} - True if profanity detected
   */
  containsProfanity(text) {
    if (!text || typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase();
    
    // Check against profanity patterns
    for (const pattern of this.profanityWords) {
      if (pattern.test(text)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if input contains code injection attempts
   * @param {string} text - Text to check
   * @returns {boolean} - True if injection pattern detected
   */
  containsInjectionAttempts(text) {
    if (!text || typeof text !== 'string') return false;
    
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if input is too long (potential abuse)
   * @param {string} text - Text to check
   * @returns {boolean} - True if too long
   */
  isTooLong(text) {
    if (!text || typeof text !== 'string') return false;
    return text.length > this.maxInputLength;
  }

  /**
   * Check if input contains suspicious patterns
   * @param {string} text - Text to check
   * @returns {boolean} - True if suspicious
   */
  containsSuspiciousPatterns(text) {
    if (!text || typeof text !== 'string') return false;
    
    // Check for excessive repetition (spam detection)
    const words = text.split(/\s+/);
    if (words.length > 0) {
      const wordCounts = {};
      for (const word of words) {
        const lowerWord = word.toLowerCase();
        wordCounts[lowerWord] = (wordCounts[lowerWord] || 0) + 1;
        // If a word appears more than 20 times in a short text, it's suspicious
        if (wordCounts[lowerWord] > 20 && text.length < 500) {
          return true;
        }
      }
    }
    
    // Check for excessive special characters (potential obfuscation)
    const specialCharRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
    if (specialCharRatio > 0.5 && text.length > 100) {
      return true;
    }
    
    return false;
  }

  /**
   * Validate and moderate user input
   * @param {string} input - User input to validate
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result with isValid and reason
   */
  validateInput(input, options = {}) {
    const {
      checkProfanity = true,
      checkInjection = true,
      checkLength = true,
      checkSuspicious = true
    } = options;

    // Check if input is empty or not a string
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        reason: 'Input is required and must be a string',
        errorCode: 'INVALID_INPUT'
      };
    }

    // Trim whitespace
    const trimmedInput = input.trim();
    
    if (trimmedInput.length === 0) {
      return {
        isValid: false,
        reason: 'Input cannot be empty',
        errorCode: 'EMPTY_INPUT'
      };
    }

    // Check length
    if (checkLength && this.isTooLong(trimmedInput)) {
      return {
        isValid: false,
        reason: `Input is too long. Maximum length is ${this.maxInputLength} characters.`,
        errorCode: 'INPUT_TOO_LONG'
      };
    }

    // Check profanity
    if (checkProfanity && this.containsProfanity(trimmedInput)) {
      return {
        isValid: false,
        reason: 'Input contains inappropriate language. Please use professional and respectful language.',
        errorCode: 'PROFANITY_DETECTED'
      };
    }

    // Check injection attempts
    if (checkInjection && this.containsInjectionAttempts(trimmedInput)) {
      return {
        isValid: false,
        reason: 'Input contains potentially harmful code. Please use plain text only.',
        errorCode: 'INJECTION_ATTEMPT'
      };
    }

    // Check suspicious patterns
    if (checkSuspicious && this.containsSuspiciousPatterns(trimmedInput)) {
      return {
        isValid: false,
        reason: 'Input contains suspicious patterns. Please provide a clear, meaningful description.',
        errorCode: 'SUSPICIOUS_PATTERN'
      };
    }

    return {
      isValid: true,
      sanitized: trimmedInput
    };
  }

  /**
   * Sanitize input by removing potentially harmful content
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    let sanitized = input.trim();
    
    // Remove script tags and their content
    sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
    
    // Remove javascript: and data: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:text\/html/gi, '');
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    return sanitized.trim();
  }
}

module.exports = ContentModerationService;

