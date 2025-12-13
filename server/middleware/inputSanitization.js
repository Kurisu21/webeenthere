// middleware/inputSanitization.js
// Global middleware to sanitize and validate all user inputs against SQL injection and other attacks

const ContentModerationService = require('../services/ContentModerationService');

const contentModeration = new ContentModerationService();

/**
 * Enhanced SQL injection patterns
 */
const sqlInjectionPatterns = [
  // SQL keywords in suspicious contexts
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b[\s\S]*?)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi, // OR 1=1, AND 1=1
  /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi, // OR 'a'='a'
  /(\bUNION\s+ALL\s+SELECT)/gi,
  /(\bSELECT\s+.*\s+FROM\s+.*\s+WHERE)/gi,
  /(\bINSERT\s+INTO\s+.*\s+VALUES)/gi,
  /(\bDELETE\s+FROM\s+.*\s+WHERE)/gi,
  /(\bUPDATE\s+.*\s+SET\s+.*\s+WHERE)/gi,
  /(\bDROP\s+(TABLE|DATABASE|INDEX|VIEW))/gi,
  /(\bCREATE\s+(TABLE|DATABASE|INDEX|VIEW))/gi,
  /(\bALTER\s+TABLE)/gi,
  /(\bTRUNCATE\s+TABLE)/gi,
  /(\bEXEC\s*\()/gi,
  /(\bEXECUTE\s*\()/gi,
  /(\bSP_\w+)/gi, // Stored procedures
  /(\bxp_\w+)/gi, // Extended stored procedures
  /(\bCAST\s*\()/gi,
  /(\bCONVERT\s*\()/gi,
  /(\bCHAR\s*\()/gi,
  /(\bASCII\s*\()/gi,
  /(\bSUBSTRING\s*\()/gi,
  /(\bCONCAT\s*\()/gi,
  // SQL comment patterns - only match if they appear in SQL comment context
  /(--\s|#\s|\/\*|\*\/)/g, // Match -- or # only if followed by whitespace (SQL comment), not standalone #
  // SQL string concatenation
  /(\+\s*['"]|['"]\s*\+)/g,
  // SQL injection via hex encoding
  /(0x[0-9a-fA-F]+)/g,
  // Time-based SQL injection patterns
  /(\bSLEEP\s*\()/gi,
  /(\bWAITFOR\s+DELAY)/gi,
  /(\bBENCHMARK\s*\()/gi,
  // Boolean-based SQL injection
  /(\b(IF|CASE)\s*\(.*\s*THEN)/gi,
  // Error-based SQL injection
  /(\bEXTRACTVALUE\s*\()/gi,
  /(\bUPDATEXML\s*\()/gi,
  // Second-order SQL injection
  /(\bLOAD_FILE\s*\()/gi,
  /(\bINTO\s+OUTFILE)/gi,
  /(\bINTO\s+DUMPFILE)/gi,
];

/**
 * Check if input contains SQL injection patterns
 * @param {string} input - Input to check
 * @param {Object} options - Options for checking
 * @returns {boolean} - True if SQL injection detected
 */
function containsSQLInjection(input, options = {}) {
  if (!input || typeof input !== 'string') return false;
  
  const { allowEmailChars = false, allowPasswordChars = false } = options;
  
  // For email addresses, allow @ and other valid email characters
  // For passwords, allow # and other special characters
  if (allowEmailChars || allowPasswordChars) {
    // Skip patterns that would flag legitimate email/password characters
    // Only check for actual SQL statement patterns
    const sqlStatementPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b[\s\S]*?)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi,
      /(\bUNION\s+ALL\s+SELECT)/gi,
      /(\bSELECT\s+.*\s+FROM\s+.*\s+WHERE)/gi,
      /(\bINSERT\s+INTO\s+.*\s+VALUES)/gi,
      /(\bDELETE\s+FROM\s+.*\s+WHERE)/gi,
      /(\bUPDATE\s+.*\s+SET\s+.*\s+WHERE)/gi,
      /(\bDROP\s+(TABLE|DATABASE|INDEX|VIEW))/gi,
      /(\bCREATE\s+(TABLE|DATABASE|INDEX|VIEW))/gi,
      /(\bALTER\s+TABLE)/gi,
      /(\bTRUNCATE\s+TABLE)/gi,
      /(\bEXEC\s*\()/gi,
      /(\bEXECUTE\s*\()/gi,
      /(\bSP_\w+)/gi,
      /(\bxp_\w+)/gi,
      /(\bCAST\s*\()/gi,
      /(\bCONVERT\s*\()/gi,
      /(\bCHAR\s*\()/gi,
      /(\bASCII\s*\()/gi,
      /(\bSUBSTRING\s*\()/gi,
      /(\bCONCAT\s*\()/gi,
      /(--\s|\/\*|\*\/)/g, // SQL comments (but not standalone #)
      /(\+\s*['"]|['"]\s*\+)/g,
      /(0x[0-9a-fA-F]+)/g,
      /(\bSLEEP\s*\()/gi,
      /(\bWAITFOR\s+DELAY)/gi,
      /(\bBENCHMARK\s*\()/gi,
      /(\b(IF|CASE)\s*\(.*\s*THEN)/gi,
      /(\bEXTRACTVALUE\s*\()/gi,
      /(\bUPDATEXML\s*\()/gi,
      /(\bLOAD_FILE\s*\()/gi,
      /(\bINTO\s+OUTFILE)/gi,
      /(\bINTO\s+DUMPFILE)/gi,
    ];
    
    for (const pattern of sqlStatementPatterns) {
      if (pattern.test(input)) {
        // Check if it's part of a SQL statement structure
        const suspiciousContexts = [
          /SELECT\s+.*\s+FROM/i,
          /INSERT\s+INTO/i,
          /UPDATE\s+.*\s+SET/i,
          /DELETE\s+FROM/i,
          /DROP\s+TABLE/i,
          /UNION\s+SELECT/i,
          /OR\s+\d+\s*=\s*\d+/i,
          /AND\s+\d+\s*=\s*\d+/i,
          /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
          /'\s*(OR|AND)\s+\d+\s*=\s*\d+/i,
          /"\s*(OR|AND)\s+\d+\s*=\s*\d+/i,
        ];
        
        for (const context of suspiciousContexts) {
          if (context.test(input)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  const upperInput = input.toUpperCase();
  
  // Check against SQL injection patterns
  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(input)) {
      // Additional check: if it's a common word like "select" in normal context, allow it
      // But if it's in a suspicious SQL-like structure, flag it
      if (pattern.test(upperInput)) {
        // Check if it's part of a SQL statement structure
        const suspiciousContexts = [
          /SELECT\s+.*\s+FROM/i,
          /INSERT\s+INTO/i,
          /UPDATE\s+.*\s+SET/i,
          /DELETE\s+FROM/i,
          /DROP\s+TABLE/i,
          /UNION\s+SELECT/i,
          /OR\s+\d+\s*=\s*\d+/i,
          /AND\s+\d+\s*=\s*\d+/i,
          /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
          /'\s*(OR|AND)\s+\d+\s*=\s*\d+/i,
          /"\s*(OR|AND)\s+\d+\s*=\s*\d+/i,
        ];
        
        for (const context of suspiciousContexts) {
          if (context.test(input)) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

/**
 * Sanitize input by removing SQL injection patterns
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Remove SQL comment patterns
  sanitized = sanitized.replace(/--.*$/gm, ''); // Remove SQL comments
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
  sanitized = sanitized.replace(/#.*$/gm, ''); // Remove MySQL comments
  
  // Remove common SQL injection patterns
  sanitized = sanitized.replace(/['";]\s*(OR|AND)\s+\d+\s*=\s*\d+/gi, '');
  sanitized = sanitized.replace(/['";]\s*(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"]/gi, '');
  
  // Remove semicolons that might be used to terminate SQL statements
  sanitized = sanitized.replace(/;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)/gi, '');
  
  // Remove hex encoding attempts
  sanitized = sanitized.replace(/0x[0-9a-fA-F]{4,}/g, '');
  
  return sanitized.trim();
}

/**
 * Recursively sanitize object/array inputs
 * @param {any} data - Data to sanitize
 * @param {Object} options - Sanitization options
 * @returns {any} - Sanitized data
 */
function sanitizeData(data, options = {}) {
  const {
    checkSQLInjection = true,
    checkXSS = true,
    checkLength = true,
    maxLength = 10000,
    allowHTML = false
  } = options;
  
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle strings
  if (typeof data === 'string') {
    let sanitized = data;
    
    // Check length (skip if explicitly told to skip via options)
    if (checkLength && !options.skipLengthCheck && sanitized.length > maxLength) {
      throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
    }
    
    // Check SQL injection
    if (checkSQLInjection && containsSQLInjection(sanitized)) {
      throw new Error('Input contains potentially harmful SQL code. Please use plain text only.');
    }
    
    // Check XSS (if not allowing HTML)
    if (checkXSS && !allowHTML) {
      const xssResult = contentModeration.validateInput(sanitized, {
        checkInjection: true,
        checkProfanity: false,
        checkLength: false,
        checkSuspicious: false
      });
      
      if (!xssResult.isValid) {
        throw new Error(xssResult.reason || 'Input contains potentially harmful code.');
      }
      
      sanitized = xssResult.sanitized || sanitized;
    }
    
    return sanitized;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, options));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize the key as well
      const sanitizedKey = typeof key === 'string' ? sanitizeData(key, options) : key;
      
      // For html_content, css_content, and prompt fields, skip all sanitization checks
      // These fields contain actual website HTML/CSS content or AI prompts which can be very large
      // and may contain patterns that look like SQL injection but are actually valid content
      const isContentField = key === 'html_content' || key === 'css_content' || key === 'prompt';
      const fieldOptions = isContentField 
        ? { ...options, skipLengthCheck: true, allowHTML: true, checkSQLInjection: false, checkXSS: false }
        : options;
      
      sanitized[sanitizedKey] = sanitizeData(value, fieldOptions);
    }
    return sanitized;
  }
  
  // Return other types as-is (numbers, booleans, etc.)
  return data;
}

/**
 * Global middleware to sanitize all request inputs
 */
const inputSanitizationMiddleware = (options = {}) => {
  return (req, res, next) => {
    try {
      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeData(req.body, {
          checkSQLInjection: true,
          checkXSS: true,
          checkLength: true,
          maxLength: options.maxLength || 10000,
          allowHTML: options.allowHTML || false,
          ...options
        });
      }
      
      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeData(req.query, {
          checkSQLInjection: true,
          checkXSS: true,
          checkLength: true,
          maxLength: options.maxLength || 1000, // Shorter for query params
          allowHTML: false,
          ...options
        });
      }
      
      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeData(req.params, {
          checkSQLInjection: true,
          checkXSS: true,
          checkLength: true,
          maxLength: options.maxLength || 500, // Shorter for URL params
          allowHTML: false,
          ...options
        });
      }
      
      next();
    } catch (error) {
      console.error('[InputSanitization] Error sanitizing input:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Invalid input detected. Please check your input and try again.',
        errorCode: 'INVALID_INPUT'
      });
    }
  };
};

/**
 * Middleware specifically for login/authentication endpoints
 * More strict validation for sensitive endpoints
 */
const loginInputSanitization = (req, res, next) => {
  try {
    const { email, username, password } = req.body || {};
    
    // Validate email/username
    if (email) {
      if (typeof email !== 'string') {
        return res.status(400).json({ error: 'Email must be a string' });
      }
      
      const emailStr = email.trim();
      
      // Check SQL injection - allow email characters like @
      if (containsSQLInjection(emailStr, { allowEmailChars: true })) {
        console.warn('[InputSanitization] SQL injection attempt detected in email:', emailStr.substring(0, 50));
        return res.status(400).json({ error: 'Invalid email format' });
      }
      
      // Basic email format validation (additional to express-validator)
      if (emailStr.length > 255) {
        return res.status(400).json({ error: 'Email is too long' });
      }
      
      req.body.email = emailStr;
    }
    
    // Validate username (if provided)
    if (username) {
      if (typeof username !== 'string') {
        return res.status(400).json({ error: 'Username must be a string' });
      }
      
      const usernameStr = username.trim();
      
      // Check SQL injection
      if (containsSQLInjection(usernameStr)) {
        console.warn('[InputSanitization] SQL injection attempt detected in username:', usernameStr.substring(0, 50));
        return res.status(400).json({ error: 'Invalid username format' });
      }
      
      // Username length validation
      if (usernameStr.length > 50 || usernameStr.length < 3) {
        return res.status(400).json({ error: 'Username must be between 3 and 50 characters' });
      }
      
      req.body.username = usernameStr;
    }
    
    // Password should not be checked for SQL injection (it's hashed anyway)
    // But we can validate it's a string and reasonable length
    // Allow all password characters including #, @, and other special chars
    if (password) {
      if (typeof password !== 'string') {
        return res.status(400).json({ error: 'Password must be a string' });
      }
      
      if (password.length > 1000) {
        return res.status(400).json({ error: 'Password is too long' });
      }
      
      // Only check for actual SQL statements in password, not special characters
      // Passwords can contain #, @, and other special characters
      if (containsSQLInjection(password, { allowPasswordChars: true })) {
        console.warn('[InputSanitization] SQL injection attempt detected in password');
        return res.status(400).json({ error: 'Invalid password format' });
      }
    }
    
    next();
  } catch (error) {
    console.error('[InputSanitization] Error in login sanitization:', error);
    return res.status(400).json({
      error: 'Invalid input. Please check your credentials and try again.'
    });
  }
};

module.exports = {
  inputSanitizationMiddleware,
  loginInputSanitization,
  sanitizeData,
  containsSQLInjection,
  sanitizeInput
};

