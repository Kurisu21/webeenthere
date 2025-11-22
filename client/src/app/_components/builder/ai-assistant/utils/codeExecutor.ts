/**
 * Safely executes AI-generated JavaScript code in the editor context
 * This is our own implementation with safety checks
 */

import type { Editor } from 'grapesjs';

export function executeAICode(editor: Editor, code: string): any {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid code provided');
  }

  // Basic safety checks - remove potentially dangerous patterns
  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /setTimeout\s*\(/,
    /setInterval\s*\(/,
    /XMLHttpRequest/,
    /fetch\s*\(/,
    /import\s+/,
    /require\s*\(/
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      throw new Error('Code contains potentially unsafe patterns');
    }
  }

  // Warn about potentially destructive operations (but allow them with warning)
  const destructivePatterns = [
    { pattern: /\.remove\s*\(/g, name: 'component.remove()' },
    { pattern: /\.replaceWith\s*\(/g, name: 'component.replaceWith()' },
    { pattern: /\.empty\s*\(/g, name: 'component.empty()' },
    { pattern: /editor\.setComponents\s*\(/g, name: 'editor.setComponents()' }
  ];

  const warnings: string[] = [];
  for (const { pattern, name } of destructivePatterns) {
    if (pattern.test(code)) {
      warnings.push(`Warning: Code uses ${name} which may remove/replace components`);
    }
  }

  if (warnings.length > 0) {
    console.warn('[WebeenthereAI] Destructive operations detected:', warnings);
    // Don't block, but warn - sometimes removal is needed
  }

  try {
    // Store initial state for validation
    const initialHtml = editor.getHtml();
    const initialCss = editor.getCss();
    const initialComponentCount = editor.getComponents().length;
    
    // Track modification attempts
    const modificationTracker = {
      componentsFound: 0,
      componentsModified: 0,
      modificationsAttempted: false,
      errors: [] as string[]
    };
    
    // Create a safe execution context with only the editor
    // GrapesJS automatically tracks changes for undo/redo when using component.set(), addStyle(), etc.
    const safeCode = `
      (function(editor, tracker) {
        // Helper function to safely find and modify components
        function safeModifyComponent(selector, modifier, description) {
          console.log(\`=== \${description} ===\`);
          const components = editor.getWrapper().find(selector);
          console.log(\`Found \${components.length} component(s) with selector: \${selector}\`);
          
          tracker.componentsFound += components.length;
          tracker.modificationsAttempted = true;
          
          if (components.length === 0) {
            console.warn(\`⚠️ No components found with selector: \${selector}\`);
            tracker.errors.push(\`No components found with selector: \${selector}\`);
            return false;
          }
          
          let modified = 0;
          components.forEach((comp, index) => {
            try {
              const before = comp.get('content') || comp.getId() || 'component';
              console.log(\`Component \${index + 1}: \${before}\`);
              modifier(comp, index);
              modified++;
              tracker.componentsModified++;
              console.log(\`✅ Modified component \${index + 1}\`);
            } catch (err) {
              console.error(\`❌ Error modifying component \${index + 1}:\`, err.message);
              tracker.errors.push(\`Error modifying component \${index + 1}: \${err.message}\`);
            }
          });
          
          console.log(\`✅ Successfully modified \${modified}/\${components.length} components\`);
          return modified > 0;
        }
        
        try {
          console.log('[WebeenthereAI] Starting code execution...');
          console.log('[WebeenthereAI] Initial component count:', editor.getComponents().length);
          
          // Track find() calls and wrap set() on found components
          const originalFind = editor.getWrapper().find;
          const wrappedComponents = new WeakSet(); // Track which components we've wrapped
          
          editor.getWrapper().find = function(selector) {
            const results = originalFind.call(this, selector);
            tracker.modificationsAttempted = true;
            // Ensure results is an array
            const resultsArray = Array.isArray(results) ? results : (results ? [results] : []);
            if (resultsArray.length > 0) {
              tracker.componentsFound += resultsArray.length;
              console.log(\`[WebeenthereAI] Found \${resultsArray.length} component(s) with selector: \${selector}\`);
              // Wrap set() method on found components to track modifications
              resultsArray.forEach((comp, index) => {
                if (comp && !wrappedComponents.has(comp)) {
                  // Log component info for debugging
                  try {
                    const compId = comp.getId ? comp.getId() : 'no-id';
                    const compType = comp.get ? comp.get('type') : 'unknown';
                    const compTag = comp.get ? comp.get('tagName') : 'unknown';
                    const compContent = comp.get ? comp.get('content') : 'unknown';
                    console.log(\`[WebeenthereAI] Component \${index + 1}: id=\${compId}, type=\${compType}, tag=\${compTag}, content="\${compContent}"\`);
                    console.log(\`[WebeenthereAI] Component \${index + 1} has set() method: \${typeof comp.set === 'function'}\`);
                  } catch (logError) {
                    console.warn(\`[WebeenthereAI] Could not log component \${index + 1} info:\`, logError);
                  }
                  
                  if (typeof comp.set === 'function') {
                    const originalSet = comp.set.bind(comp);
                    comp.set = function(...args) {
                      try {
                        console.log(\`[WebeenthereAI] 🔧 Calling component.set() with args:\`, args);
                        const result = originalSet.apply(this, args);
                        tracker.componentsModified++;
                        console.log('[WebeenthereAI] ✅ Successfully modified component via set()');
                        return result;
                      } catch (setError) {
                        console.error('[WebeenthereAI] ❌ Error in component.set():', setError);
                        tracker.errors.push(\`component.set() failed: \${setError.message || setError}\`);
                        throw setError; // Re-throw so the AI code can handle it
                      }
                    };
                    wrappedComponents.add(comp);
                    console.log(\`[WebeenthereAI] ✅ Wrapped set() method on component \${index + 1}\`);
                  } else {
                    console.warn(\`[WebeenthereAI] ⚠️ Component \${index + 1} does not have a set() method - cannot modify it\`);
                    tracker.errors.push(\`Component \${index + 1} does not have a set() method\`);
                  }
                }
              });
            } else {
              console.log(\`[WebeenthereAI] ⚠️ No components found with selector: \${selector}\`);
            }
            return results;
          };
          
          ${code}
          
          // Restore original find
          editor.getWrapper().find = originalFind;
          
          console.log('[WebeenthereAI] Code execution completed');
          console.log('[WebeenthereAI] Final component count:', editor.getComponents().length);
          console.log('[WebeenthereAI] Tracking summary:', {
            componentsFound: tracker.componentsFound,
            componentsModified: tracker.componentsModified,
            modificationsAttempted: tracker.modificationsAttempted,
            errors: tracker.errors.length
          });
          
          // Warn if components were found but not modified
          if (tracker.componentsFound > 0 && tracker.componentsModified === 0) {
            console.warn('[WebeenthereAI] ⚠️ WARNING: Components were found but component.set() was never called on them!');
            console.warn('[WebeenthereAI] This usually means the code found components but did not call set() to modify them.');
            console.warn('[WebeenthereAI] Example of correct code:');
            console.warn('[WebeenthereAI]   const comp = editor.getWrapper().find("h1")[0];');
            console.warn('[WebeenthereAI]   if (comp) { comp.set("content", "New text"); }');
          }
          
        } catch (error) {
          console.error('[WebeenthereAI] Code execution error:', error);
          tracker.errors.push(error.message || 'Unknown error during code execution');
          
          // Provide helpful error messages for common mistakes
          if (error.message && error.message.includes('is not a function')) {
            const methodMatch = error.message.match(/(\\w+)\\.(\\w+)\\s+is not a function/);
            if (methodMatch) {
              const [, obj, method] = methodMatch;
              if (method === 'setContent' || method === 'setText') {
                throw new Error(\`\${method} is not a function. Use component.set('content', value) instead.\`);
              }
            }
          }
          
          throw error;
        }
      })(editor, modificationTracker);
    `;

    // Execute the code with editor as context
    const result = new Function('editor', 'modificationTracker', safeCode)(editor, modificationTracker);
    
    // Verify changes were made using multiple methods
    const finalHtml = editor.getHtml();
    const finalCss = editor.getCss();
    const finalComponentCount = editor.getComponents().length;
    
    // Check for changes in multiple ways
    const hasHtmlChanges = initialHtml !== finalHtml;
    const hasCssChanges = initialCss !== finalCss;
    const componentCountChanged = initialComponentCount !== finalComponentCount;
    const hasModifications = modificationTracker.componentsModified > 0;
    const hasAttempts = modificationTracker.modificationsAttempted;
    
    // More lenient validation: if components were modified, consider it successful
    // even if HTML string didn't change (GrapesJS might not immediately reflect changes)
    if (!hasHtmlChanges && !hasCssChanges && !componentCountChanged && !hasModifications) {
      // Build helpful error message
      let errorMsg = 'No changes were made. ';
      
      if (!hasAttempts) {
        errorMsg += "I couldn't find what you're looking for. ";
        errorMsg += 'Try being more specific about which element you want to modify, or select it first.';
      } else if (modificationTracker.componentsFound === 0) {
        errorMsg += "I couldn't find that element on your page. ";
        errorMsg += 'Try selecting the element first, or check if the element name is correct.';
      } else if (modificationTracker.componentsFound > 0 && modificationTracker.componentsModified === 0) {
        errorMsg += `I found ${modificationTracker.componentsFound} element(s) but couldn't modify them. `;
        errorMsg += 'This might mean the element structure is different than expected. ';
        errorMsg += 'Try selecting the element first, or be more specific about which element you want to change.';
        if (modificationTracker.errors.length > 0) {
          console.error('[WebeenthereAI] Detailed errors:', modificationTracker.errors);
        }
      } else {
        errorMsg += "I couldn't make that change. ";
        errorMsg += 'The element might be protected or in a different format than expected. Try selecting it first.';
      }
      
      console.warn('[WebeenthereAI] Code executed but no changes detected:', {
        componentsFound: modificationTracker.componentsFound,
        componentsModified: modificationTracker.componentsModified,
        errors: modificationTracker.errors,
        hasHtmlChanges,
        hasCssChanges,
        componentCountChanged
      });
      
      throw new Error(errorMsg);
    }
    
    if (componentCountChanged && initialComponentCount > finalComponentCount) {
      const removedCount = initialComponentCount - finalComponentCount;
      console.warn(`[WebeenthereAI] WARNING: ${removedCount} component(s) were removed during execution.`);
      console.warn('[WebeenthereAI] This may be intentional, but if you only wanted to modify content, the AI should use component.set() instead of component.remove().');
      console.warn('[WebeenthereAI] Changes are undoable via Ctrl+Z or the undo button if this was a mistake.');
      // Don't throw error - allow it but warn the user
    }
    
    console.log('[WebeenthereAI] Code executed successfully. Changes are undoable via Ctrl+Z or the undo button.');
    return result;
  } catch (error: any) {
    console.error('[WebeenthereAI] Code execution failed:', error);
    
    // Enhanced error message for common API mistakes - keep technical details in console, show user-friendly message
    let errorMessage = error.message || 'Something went wrong';
    const technicalError = errorMessage;
    
    // Log technical details to console for debugging
    console.error('[WebeenthereAI] Technical error details:', technicalError);
    
    // Convert to user-friendly message
    if (errorMessage.includes('setContent is not a function') || errorMessage.includes('setText is not a function')) {
      errorMessage = "I couldn't modify that element. The element structure might be different than expected.";
    } else if (errorMessage.includes('is not a function')) {
      errorMessage = "I encountered an issue while trying to make that change. Please try a different approach.";
    } else if (errorMessage.includes('No changes were made')) {
      // Keep the user-friendly message we already built
      errorMessage = errorMessage.replace('Code execution failed: ', '');
    } else {
      errorMessage = "I couldn't complete that request. Please try rephrasing or selecting the element first.";
    }
    
    throw new Error(errorMessage);
  }
}

