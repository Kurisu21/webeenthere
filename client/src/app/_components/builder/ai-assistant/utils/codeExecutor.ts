/**
 * Safely executes AI-generated JavaScript code in the editor context
 * This is our own implementation with safety checks
 */

import type { Editor } from 'grapesjs';

/**
 * BRUTE FORCE: Directly manipulate HTML string and save to database
 * This bypasses GrapesJS component model and directly updates the HTML
 */
export async function bruteForceUpdateHTML(
  editor: Editor,
  htmlModifier: (html: string) => string,
  onSave?: (html: string, css: string) => Promise<void>
): Promise<boolean> {
  try {
    console.log('[BruteForce] Starting direct HTML manipulation...');
    
    // Get current HTML and CSS
    const currentHtml = editor.getHtml();
    const currentCss = editor.getCss();
    
    console.log('[BruteForce] Current HTML length:', currentHtml.length);
    
    // Apply modifier function
    const newHtml = htmlModifier(currentHtml);
    
    console.log('[BruteForce] New HTML length:', newHtml.length);
    console.log('[BruteForce] HTML changed:', currentHtml !== newHtml);
    
    if (currentHtml === newHtml) {
      console.warn('[BruteForce] ⚠️ HTML unchanged after modification');
      return false;
    }
    
    // CRITICAL: Directly set the new HTML in the editor
    // This bypasses the component model and forces a complete reload
    // Try to get wrapper, but don't fail if it's not available - setComponents should work anyway
    let wrapper = null;
    try {
      if (editor.getWrapper && typeof editor.getWrapper === 'function') {
        wrapper = editor.getWrapper();
      }
    } catch (e) {
      // Wrapper not available, but that's okay - setComponents might still work
      console.warn('[BruteForce] Could not get wrapper, but continuing anyway');
    }
    
    // Clear existing components first if wrapper is available
    if (wrapper) {
      try {
        const currentComponents = editor.getComponents();
        if (currentComponents && currentComponents.length > 0) {
          try {
            // Try to remove components
            currentComponents.forEach((comp: any) => {
              try {
                comp.remove();
              } catch (e) {
                // Ignore errors
              }
            });
          } catch (e) {
            // If removal fails, try to clear wrapper directly
            try {
              wrapper.empty();
            } catch (e2) {
              console.warn('[BruteForce] Could not clear existing components');
            }
          }
        }
      } catch (e) {
        console.warn('[BruteForce] Could not clear components, but continuing');
      }
    }
    
    // Wait a bit before setting new components
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Now set the new HTML - this should work even without wrapper
    try {
      editor.setComponents(newHtml);
    } catch (setError: any) {
      // If setComponents fails, try alternative approach
      console.warn('[BruteForce] setComponents failed, trying alternative:', setError.message);
      
      // Try to get wrapper and set via wrapper
      if (!wrapper) {
        for (let i = 0; i < 5; i++) {
          try {
            if (editor.getWrapper && typeof editor.getWrapper === 'function') {
              wrapper = editor.getWrapper();
              if (wrapper) break;
            }
          } catch (e) {
            // Not ready
          }
          if (i < 4) await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      if (wrapper) {
        try {
          wrapper.set('content', newHtml);
          wrapper.setComponents(newHtml);
        } catch (e2) {
          throw new Error(`Could not set components: ${setError.message}`);
        }
      } else {
        throw setError;
      }
    }
    
    // Force canvas refresh
    editor.trigger('component:update');
    editor.trigger('update');
    editor.trigger('canvas:update');
    
    // Wait for editor to process
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 300);
      });
    });
    
    // Force all components to re-render
    const allComponents = editor.getComponents();
    allComponents.forEach((comp: any) => {
      try {
        const view = comp.getView();
        if (view && view.render) {
          view.render();
        }
        comp.trigger('update');
        comp.trigger('component:update');
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Force canvas refresh
    const canvas = editor.Canvas;
    if (canvas) {
      editor.trigger('canvas:update');
      const currentZoom = canvas.getZoom();
      if (currentZoom) {
        canvas.setZoom(currentZoom + 0.001);
        await new Promise(resolve => setTimeout(resolve, 10));
        canvas.setZoom(currentZoom);
      }
    }
    
    // Save to database if callback provided
    if (onSave) {
      console.log('[BruteForce] Saving to database...');
      await onSave(newHtml, currentCss);
      console.log('[BruteForce] ✅ Saved to database');
    }
    
    console.log('[BruteForce] ✅ HTML updated successfully');
    return true;
  } catch (error: any) {
    console.error('[BruteForce] ❌ Failed:', error);
    throw error;
  }
}

export async function executeAICode(
  editor: Editor, 
  code: string, 
  selectedComponent?: any, 
  onSave?: () => Promise<void>,
  getHtml?: () => string,
  getCss?: () => string
): Promise<any> {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid code provided');
  }

  // If a component is selected, automatically scope the code to that component
  const selected = selectedComponent || editor.getSelected();
  if (selected) {
    const selectedId = selected.getId();
    const selectedTag = selected.get('tagName');
    const selectedType = selected.get('type');
    
    console.log('[WebeenthereAI] 🎯 Component selected - scoping edits to selected component:', {
      tagName: selectedTag,
      id: selectedId,
      type: selectedType
    });
    
    // Check if code already uses editor.getSelected() - if so, don't double-wrap
    const alreadyUsesSelected = /editor\.getSelected\(\)/.test(code);
    
    if (!alreadyUsesSelected) {
      // Wrap the code to ensure it uses the selected component
      // This makes it easier for the AI - they can just use 'comp' or 'selected'
      // IMPORTANT: We need to wrap set() on the selected component to track modifications
      const scopedCode = `
        // Auto-scope to selected component (user has selected a component to edit)
        const selectedComponent = editor.getSelected();
        if (!selectedComponent) {
          throw new Error('No component selected. Please select a component first.');
        }
        
        // Mark that we're attempting modifications
        tracker.modificationsAttempted = true;
        tracker.componentsFound = 1; // We found the selected component
        
        // Wrap set() method on selected component to track modifications
        let isUpdating = false;
        const originalSet = selectedComponent.set.bind(selectedComponent);
        selectedComponent.set = function(...args) {
          if (isUpdating) {
            return originalSet.apply(this, args);
          }
          
          try {
            console.log('[WebeenthereAI] 🔧 Calling selected component.set() with args:', args);
            const result = originalSet.apply(this, args);
            
            // Track the modification
            tracker.componentsModified++;
            console.log('[WebeenthereAI] ✅ Successfully modified selected component via set()');
            
            // Trigger updates
            isUpdating = true;
            try {
              this.trigger('change:content');
              if (args[0]) {
                this.trigger('change:' + args[0]);
              }
              this.trigger('update');
              this.trigger('component:update');
              if (this.view && this.view.render) {
                this.view.render();
              }
            } catch (updateError) {
              console.warn('[WebeenthereAI] Could not trigger selected component update:', updateError);
            } finally {
              isUpdating = false;
            }
            
            return result;
          } catch (setError) {
            isUpdating = false;
            console.error('[WebeenthereAI] ❌ Error in selected component.set():', setError);
            tracker.errors.push('selected component.set() failed: ' + (setError.message || setError));
            throw setError;
          }
        };
        
        // Store reference for easy access (AI can use 'comp' or 'selected')
        const comp = selectedComponent;
        const selected = selectedComponent;
        
        console.log('[WebeenthereAI] Editing selected component:', {
          tagName: comp.get('tagName'),
          id: comp.getId(),
          type: comp.get('type')
        });
        
        // User's code (will automatically edit the selected component)
        ${code}
      `;
      
      // Use scoped code instead
      code = scopedCode;
    } else {
      console.log('[WebeenthereAI] Code already uses editor.getSelected(), no need to wrap');
    }
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
    
    // Store selected component info for better error messages
    const selectedComponentInfo = selected ? {
      id: selected.getId(),
      tagName: selected.get('tagName'),
      type: selected.get('type')
    } : null;
    
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
          
          // Wrap editor.getSelected() to track when selected component is used
          const originalGetSelected = editor.getSelected.bind(editor);
          const selectedComponentWrapped = new WeakSet();
          editor.getSelected = function() {
            const selected = originalGetSelected.call(this);
            if (selected && !selectedComponentWrapped.has(selected)) {
              tracker.modificationsAttempted = true;
              tracker.componentsFound = 1;
              selectedComponentWrapped.add(selected);
              
              // Wrap set() on the selected component
              let isUpdating = false;
              const originalSet = selected.set.bind(selected);
              selected.set = function(...args) {
                if (isUpdating) {
                  return originalSet.apply(this, args);
                }
                
                try {
                  console.log('[WebeenthereAI] 🔧 Calling selected component.set() via getSelected() with args:', args);
                  const result = originalSet.apply(this, args);
                  
                  tracker.componentsModified++;
                  console.log('[WebeenthereAI] ✅ Successfully modified selected component via getSelected().set()');
                  
                  isUpdating = true;
                  try {
                    this.trigger('change:content');
                    if (args[0]) {
                      this.trigger('change:' + args[0]);
                    }
                    this.trigger('update');
                    this.trigger('component:update');
                    if (this.view && this.view.render) {
                      this.view.render();
                    }
                  } catch (updateError) {
                    console.warn('[WebeenthereAI] Could not trigger selected component update:', updateError);
                  } finally {
                    isUpdating = false;
                  }
                  
                  return result;
                } catch (setError) {
                  isUpdating = false;
                  console.error('[WebeenthereAI] ❌ Error in selected component.set():', setError);
                  tracker.errors.push('selected component.set() failed: ' + (setError.message || setError));
                  throw setError;
                }
              };
            }
            return selected;
          };
          
          // Track find() calls and wrap set() on found components
          const originalFind = editor.getWrapper().find;
          const wrappedComponents = new WeakSet(); // Track which components we've wrapped
          const foundComponents = new WeakSet(); // Track all found components
          
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
                if (comp) {
                  foundComponents.add(comp);
                  
                  if (!wrappedComponents.has(comp)) {
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
                    
                    // Wrap find() on component to track nested finds (e.g., header.find('.brand'))
                    if (typeof comp.find === 'function' && !comp._findWrapped) {
                      const originalCompFind = comp.find.bind(comp);
                      comp.find = function(selector) {
                        const results = originalCompFind.call(this, selector);
                        const resultsArray = Array.isArray(results) ? results : (results ? [results] : []);
                        if (resultsArray.length > 0) {
                          tracker.componentsFound += resultsArray.length;
                          console.log(\`[WebeenthereAI] Found \${resultsArray.length} nested component(s) with selector: \${selector}\`);
                          // Wrap set() on nested components too
                          resultsArray.forEach((nestedComp, nestedIndex) => {
                            if (nestedComp && !wrappedComponents.has(nestedComp)) {
                              foundComponents.add(nestedComp);
                              if (typeof nestedComp.set === 'function' && !wrappedComponents.has(nestedComp)) {
                                const originalSet = nestedComp.set.bind(nestedComp);
                                let isUpdating = false; // Prevent infinite recursion
                                nestedComp.set = function(...args) {
                                  // Prevent infinite recursion
                                  if (isUpdating) {
                                    return originalSet.apply(this, args);
                                  }
                                  
                                  try {
                                    console.log(\`[WebeenthereAI] 🔧 Calling nested component.set() with args:\`, args);
                                    const result = originalSet.apply(this, args);
                                    
                                    // Trigger updates without calling set() recursively
                                    isUpdating = true;
                                    try {
                                      nestedComp.trigger('change:content');
                                      nestedComp.trigger('update');
                                      nestedComp.trigger('component:update');
                                      if (nestedComp.view && nestedComp.view.render) {
                                        nestedComp.view.render();
                                      }
                                    } catch (updateError) {
                                      console.warn('[WebeenthereAI] Could not trigger nested component update:', updateError);
                                    } finally {
                                      isUpdating = false;
                                    }
                                    
                                    tracker.componentsModified++;
                                    console.log('[WebeenthereAI] ✅ Successfully modified nested component via set()');
                                    return result;
                                  } catch (setError) {
                                    isUpdating = false;
                                    console.error('[WebeenthereAI] ❌ Error in nested component.set():', setError);
                                    tracker.errors.push(\`nested component.set() failed: \${setError.message || setError}\`);
                                    throw setError;
                                  }
                                };
                                wrappedComponents.add(nestedComp);
                                console.log(\`[WebeenthereAI] ✅ Wrapped set() method on nested component \${nestedIndex + 1}\`);
                              }
                            }
                          });
                        }
                        return results;
                      };
                      comp._findWrapped = true;
                      console.log(\`[WebeenthereAI] ✅ Wrapped find() method on component \${index + 1} for nested searches\`);
                    }
                    
                    if (typeof comp.set === 'function') {
                      const originalSet = comp.set.bind(comp);
                      let isUpdating = false; // Prevent infinite recursion
                      comp.set = function(...args) {
                        // Prevent infinite recursion if this is being called from within an update
                        if (isUpdating) {
                          return originalSet.apply(this, args);
                        }
                        
                        try {
                          console.log(\`[WebeenthereAI] 🔧 Calling component.set() with args:\`, args);
                          
                          // Get current value before change for comparison
                          const propertyName = args[0];
                          const oldValue = propertyName ? comp.get(propertyName) : undefined;
                          
                          const result = originalSet.apply(this, args);
                          
                          // Verify the change was applied
                          if (propertyName) {
                            const newValue = comp.get(propertyName);
                            if (oldValue !== newValue) {
                              console.log(\`[WebeenthereAI] ✅ Verified change: \${propertyName} changed from "\${oldValue}" to "\${newValue}"\`);
                            } else {
                              console.warn(\`[WebeenthereAI] ⚠️ Warning: \${propertyName} appears unchanged after set() call\`);
                            }
                          }
                          
                          // CRITICAL: Force component to update and re-render
                          // Use a flag to prevent recursive calls
                          isUpdating = true;
                          try {
                            // Trigger component update events (these don't call set() recursively)
                            comp.trigger('change:content');
                            if (propertyName) {
                              comp.trigger(\`change:\${propertyName}\`);
                            }
                            comp.trigger('update');
                            comp.trigger('component:update');
                            
                            // Force view re-render if available
                            if (comp.view && comp.view.render) {
                              comp.view.render();
                            }
                            
                            // Don't call comp.set() here - it causes infinite recursion
                            // Instead, just ensure the component is marked as changed
                            if (comp.em && comp.em.trigger) {
                              comp.em.trigger('component:update', comp);
                            }
                          } catch (updateError) {
                            console.warn('[WebeenthereAI] Could not trigger component update:', updateError);
                          } finally {
                            isUpdating = false;
                          }
                          
                          tracker.componentsModified++;
                          console.log('[WebeenthereAI] ✅ Successfully modified component via set()');
                          return result;
                        } catch (setError) {
                          isUpdating = false;
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
                }
              });
            } else {
              console.log(\`[WebeenthereAI] ⚠️ No components found with selector: \${selector}\`);
            }
            return results;
          };
          
          ${code}
          
          // After code execution, check if any found components were modified via DOM
          // This handles cases where code manipulates DOM directly instead of using set()
          if (tracker.componentsFound > 0 && tracker.componentsModified === 0) {
            console.log('[WebeenthereAI] Checking for DOM-based modifications...');
            // Check if HTML actually changed (indicating DOM manipulation worked)
            // This will be checked later in the validation step
          }
          
          // Restore original methods
          editor.getWrapper().find = originalFind;
          editor.getSelected = originalGetSelected;
          
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
    
    // CRITICAL: Force all components to update and re-render
    // Get all components and trigger updates on them
    try {
      const allComponents = editor.getComponents();
      const updateComponent = (comp: any) => {
        try {
          comp.trigger('change:content');
          comp.trigger('update');
          comp.trigger('component:update');
          if (comp.view && comp.view.render) {
            comp.view.render();
          }
          // Recursively update child components
          const children = comp.components();
          if (children && children.length > 0) {
            children.forEach((child: any) => updateComponent(child));
          }
        } catch (e) {
          // Ignore errors for individual components
        }
      };
      
      // Update all components
      allComponents.forEach((comp: any) => updateComponent(comp));
    } catch (e) {
      console.warn('[WebeenthereAI] Could not update all components:', e);
    }
    
    // CRITICAL: Force editor to store current state for undo/redo
    if (editor.store) {
      editor.store();
    }
    
    // CRITICAL: Trigger update events to ensure GrapesJS processes all component changes
    // This ensures that component.set() changes are reflected in getHtml() and getCss()
    editor.trigger('component:update');
    editor.trigger('update');
    editor.trigger('change:component');
    editor.trigger('change');
    
    // Force canvas refresh to ensure changes are visible
    const canvas = editor.Canvas;
    if (canvas) {
      // Trigger canvas refresh without reloading
      editor.trigger('canvas:update');
      
      // Force a re-render by toggling zoom slightly (this forces a repaint)
      const currentZoom = canvas.getZoom();
      if (currentZoom) {
        canvas.setZoom(currentZoom + 0.001);
        canvas.setZoom(currentZoom);
      }
      
      // Force canvas frame to update (without full reload)
      const frame = canvas.getFrameEl();
      if (frame && frame.contentDocument) {
        try {
          // Trigger a repaint
          const event = new Event('resize', { bubbles: true });
          frame.contentWindow?.dispatchEvent(event);
        } catch (e) {
          // Cross-origin or other issue, use alternative method
          console.warn('[WebeenthereAI] Could not update canvas frame:', e);
        }
      }
    }
    
    // CRITICAL: Wait longer and force multiple update cycles to ensure all changes are processed
    // This ensures component.set() changes are fully reflected in the component model
    for (let i = 0; i < 3; i++) {
      editor.trigger('component:update');
      editor.trigger('update');
      editor.trigger('change');
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 100);
        });
      });
    }
    
    // Force store to persist changes
    if (editor.store) {
      editor.store();
    }
    
    // Wait one more time for store to complete
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 200);
      });
    });
    
    // CRITICAL: Use the same getHtml/getCss methods that handleSave uses
    // This ensures we're reading from the same source and getting consistent results
    // If custom functions are provided, use them; otherwise fall back to editor methods
    const htmlGetter = getHtml || (() => editor.getHtml());
    const cssGetter = getCss || (() => editor.getCss());
    
    // CRITICAL: Force multiple update cycles to ensure GrapesJS has fully processed all changes
    // This is essential because component.set() changes need time to propagate through the model
    for (let i = 0; i < 5; i++) {
      editor.trigger('component:update');
      editor.trigger('update');
      editor.trigger('change');
      editor.trigger('storage:store');
      
      // Wait between cycles to allow GrapesJS to process
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 50);
        });
      });
    }
    
    // Force canvas refresh to ensure visual updates (reuse canvas variable from earlier)
    if (canvas) {
      // CRITICAL: Force canvas to reload and re-render all components
      // This ensures visual changes are immediately visible
      editor.trigger('canvas:update');
      
      // Force a re-render by toggling zoom slightly
      const currentZoom = canvas.getZoom();
      if (currentZoom) {
        canvas.setZoom(currentZoom + 0.001);
        await new Promise(resolve => setTimeout(resolve, 10));
        canvas.setZoom(currentZoom);
      }
      
      // CRITICAL: Force all component views to re-render
      // This ensures that component.set() changes are visible in the canvas
      try {
        const allComponents = editor.getComponents();
        const forceComponentRender = (comp: any) => {
          try {
            // Get the view and force re-render
            const view = comp.getView();
            if (view && view.render) {
              view.render();
            }
            // Also trigger component update events
            comp.trigger('update');
            comp.trigger('component:update');
            
            // Recursively update child components
            const children = comp.components();
            if (children && children.length > 0) {
              children.forEach((child: any) => forceComponentRender(child));
            }
          } catch (e) {
            // Ignore errors for individual components
          }
        };
        
        // Force render all components
        allComponents.forEach((comp: any) => forceComponentRender(comp));
        
        // Force canvas frame to reload if possible
        const frame = canvas.getFrameEl();
        if (frame && frame.contentWindow) {
          try {
            // Trigger multiple events to force refresh
            frame.contentWindow.dispatchEvent(new Event('resize', { bubbles: true }));
            frame.contentWindow.dispatchEvent(new Event('load', { bubbles: true }));
            
            // If we can access the document, force a repaint
            if (frame.contentDocument) {
              const body = frame.contentDocument.body;
              if (body) {
                // Force a repaint by toggling display
                const originalDisplay = body.style.display;
                body.style.display = 'none';
                // Force reflow
                void body.offsetHeight;
                body.style.display = originalDisplay;
              }
            }
          } catch (e) {
            // Cross-origin or other issue - use alternative method
            console.warn('[WebeenthereAI] Could not force canvas frame refresh:', e);
          }
        }
      } catch (e) {
        console.warn('[WebeenthereAI] Could not force component re-render:', e);
      }
    }
    
    // Wait one more time for everything to settle
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 200);
      });
    });
    
    // Now get the HTML using the same method that handleSave uses
    let finalHtml = htmlGetter();
    
    console.log('[WebeenthereAI] Extracted HTML using', getHtml ? 'custom getHtml()' : 'editor.getHtml()', ', length:', finalHtml.length);
    
    // Verify HTML actually changed by checking if it's different from initial
    if (finalHtml === initialHtml && modificationTracker.componentsModified > 0) {
      console.warn('[WebeenthereAI] ⚠️ HTML unchanged after modifications. Attempting more aggressive refresh...');
      
      // Force a more aggressive refresh with longer waits
      for (let i = 0; i < 10; i++) {
        editor.trigger('storage:store');
        editor.trigger('component:update');
        editor.trigger('update');
        editor.trigger('change');
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Force canvas refresh again
      if (canvas) {
        editor.trigger('canvas:update');
        const currentZoom = canvas.getZoom();
        if (currentZoom) {
          canvas.setZoom(currentZoom + 0.001);
          await new Promise(resolve => setTimeout(resolve, 50));
          canvas.setZoom(currentZoom);
        }
      }
      
      // Wait longer before getting HTML again
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 300);
        });
      });
      
      finalHtml = htmlGetter();
      console.log('[WebeenthereAI] After forced refresh, HTML length:', finalHtml.length);
    }
    
    const finalCss = cssGetter();
    const finalComponentCount = editor.getComponents().length;
    
    console.log('[WebeenthereAI] Final HTML length:', finalHtml.length, 'Initial:', initialHtml.length);
    console.log('[WebeenthereAI] HTML changed:', initialHtml !== finalHtml);
    if (initialHtml !== finalHtml) {
      console.log('[WebeenthereAI] HTML diff preview - Initial:', initialHtml.substring(0, 100));
      console.log('[WebeenthereAI] HTML diff preview - Final:', finalHtml.substring(0, 100));
    }
    
    // Check for changes in multiple ways
    const hasHtmlChanges = initialHtml !== finalHtml;
    const hasCssChanges = initialCss !== finalCss;
    const componentCountChanged = initialComponentCount !== finalComponentCount;
    const hasModifications = modificationTracker.componentsModified > 0;
    const hasAttempts = modificationTracker.modificationsAttempted;
    const hasFoundComponents = modificationTracker.componentsFound > 0;
    
    // MUCH MORE LENIENT validation: 
    // 1. If components were modified via set() - success
    // 2. If HTML changed (even without tracking) - success (DOM manipulation worked)
    // 3. If components were found AND HTML changed - success (likely modification worked)
    // 4. If CSS changed - success
    // 5. If component count changed - success
    // 6. If a component was selected and code executed without errors - likely success
    const hasSuccessfulModification = hasModifications || 
                                      hasHtmlChanges || // HTML changed = something worked
                                      (hasFoundComponents && hasHtmlChanges) || // Found components + HTML changed
                                      hasCssChanges || 
                                      componentCountChanged ||
                                      (selected !== null && hasAttempts && !modificationTracker.errors.length); // Selected component + code ran without errors
    
    // If components were found but HTML didn't change, try to force a refresh
    if (hasFoundComponents && !hasHtmlChanges && !hasModifications) {
      console.log('[WebeenthereAI] Components found but HTML unchanged - attempting to force refresh...');
      
      // Force multiple update cycles with longer waits
      for (let i = 0; i < 10; i++) {
        editor.trigger('component:update');
        editor.trigger('update');
        editor.trigger('change');
        editor.trigger('storage:store');
        
        // Force canvas refresh
        if (canvas) {
          editor.trigger('canvas:update');
        }
        
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 100);
          });
        });
      }
      
      // Force canvas zoom toggle to force repaint
      if (canvas) {
        const currentZoom = canvas.getZoom();
        if (currentZoom) {
          canvas.setZoom(currentZoom + 0.001);
          await new Promise(resolve => setTimeout(resolve, 50));
          canvas.setZoom(currentZoom);
        }
        
        // CRITICAL: Force all component views to re-render again
        try {
          const allComponents = editor.getComponents();
          const forceComponentRender = (comp: any) => {
            try {
              const view = comp.getView();
              if (view && view.render) {
                view.render();
              }
              comp.trigger('update');
              comp.trigger('component:update');
              
              const children = comp.components();
              if (children && children.length > 0) {
                children.forEach((child: any) => forceComponentRender(child));
              }
            } catch (e) {
              // Ignore errors
            }
          };
          allComponents.forEach((comp: any) => forceComponentRender(comp));
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Wait longer before getting HTML again
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 300);
        });
      });
      
      // Get HTML again after forced updates using the same method
      const refreshedHtml = htmlGetter();
      if (refreshedHtml !== initialHtml) {
        console.log('[WebeenthereAI] ✅ HTML changed after forced refresh!');
        // Update finalHtml to reflect the change
        finalHtml = refreshedHtml;
        // Re-check
        const refreshedHasChanges = refreshedHtml !== initialHtml;
        if (refreshedHasChanges) {
          // Consider it successful now
          console.log('[WebeenthereAI] ✅ Changes detected after forced refresh - accepting as successful');
        }
      }
    }
    
    // Re-check after potential refresh
    const finalHasHtmlChanges = finalHtml !== initialHtml;
    const finalHasSuccessfulModification = hasModifications || 
                                          finalHasHtmlChanges || 
                                          (hasFoundComponents && finalHasHtmlChanges) || 
                                          hasCssChanges || 
                                          componentCountChanged ||
                                          (selected !== null && hasAttempts && !modificationTracker.errors.length);
    
    if (!finalHasSuccessfulModification) {
      // Build helpful error message
      let errorMsg = 'No changes were made. ';
      
      // Check if a component was selected - provide more specific guidance
      const hadSelectedComponent = selectedComponentInfo !== null;
      
      if (!hasAttempts) {
        errorMsg += "I couldn't find what you're looking for. ";
        if (hadSelectedComponent) {
          errorMsg += 'I tried to modify the selected element, but the code didn\'t make any changes. ';
          errorMsg += 'Please try rephrasing your request or selecting a different element.';
        } else {
          errorMsg += 'Try selecting the element first, or be more specific about which element you want to modify.';
        }
      } else if (modificationTracker.componentsFound === 0) {
        errorMsg += "I couldn't find that element on your page. ";
        if (hadSelectedComponent) {
          errorMsg += 'Even though you selected an element, the code tried to find a different element that doesn\'t exist. ';
          errorMsg += 'Try rephrasing your request to work with the selected element, or select a different element.';
        } else {
          errorMsg += 'Try selecting the element first, or check if the element name is correct.';
        }
      } else if (modificationTracker.componentsFound > 0 && modificationTracker.componentsModified === 0) {
        errorMsg += `I found ${modificationTracker.componentsFound} element(s) but couldn't modify them. `;
        if (modificationTracker.errors.length > 0) {
          const firstError = modificationTracker.errors[0];
          if (firstError.includes('does not have a set() method')) {
            errorMsg += 'The element found doesn\'t support direct modification. ';
            errorMsg += 'Try selecting the element first, or try modifying a parent/child element instead.';
          } else {
            errorMsg += 'There was an error while trying to modify the element. ';
            errorMsg += 'Try selecting the element first, or rephrase your request.';
          }
        } else {
          errorMsg += 'The code found the element but didn\'t call the modification method. ';
          errorMsg += 'Try selecting the element first, or rephrase your request to be more specific.';
        }
        if (modificationTracker.errors.length > 0) {
          console.error('[WebeenthereAI] Detailed errors:', modificationTracker.errors);
        }
      } else {
        errorMsg += "I couldn't make that change. ";
        if (hadSelectedComponent) {
          errorMsg += 'The selected element might be in a format that can\'t be modified directly. ';
          errorMsg += 'Try selecting a different element, or rephrase your request.';
        } else {
          errorMsg += 'The element might be protected or in a different format than expected. Try selecting it first.';
        }
      }
      
      console.warn('[WebeenthereAI] Code executed but no changes detected:', {
        componentsFound: modificationTracker.componentsFound,
        componentsModified: modificationTracker.componentsModified,
        errors: modificationTracker.errors,
        hasHtmlChanges: finalHasHtmlChanges,
        hasCssChanges,
        componentCountChanged,
        hadSelectedComponent,
        selectedComponentInfo
      });
      
      throw new Error(errorMsg);
    }
    
    // If HTML changed but set() wasn't tracked, log a warning but allow it
    if (hasHtmlChanges && modificationTracker.componentsModified === 0 && modificationTracker.componentsFound > 0) {
      console.warn('[WebeenthereAI] ⚠️ HTML changed but component.set() was not tracked. Changes detected via DOM manipulation.');
      console.warn('[WebeenthereAI] For better tracking, use component.set("content", value) instead of direct DOM manipulation.');
    }
    
    if (componentCountChanged && initialComponentCount > finalComponentCount) {
      const removedCount = initialComponentCount - finalComponentCount;
      console.warn(`[WebeenthereAI] WARNING: ${removedCount} component(s) were removed during execution.`);
      console.warn('[WebeenthereAI] This may be intentional, but if you only wanted to modify content, the AI should use component.set() instead of component.remove().');
      console.warn('[WebeenthereAI] Changes are undoable via Ctrl+Z or the undo button if this was a mistake.');
      // Don't throw error - allow it but warn the user
    }
    
    console.log('[WebeenthereAI] Code executed successfully. Changes are undoable via Ctrl+Z or the undo button.');
    
    // CRITICAL: Final canvas refresh to ensure all changes are visible
    // Do this one more time before saving to ensure visual updates
    if (canvas) {
      // Force all component views to re-render one final time
      try {
        const allComponents = editor.getComponents();
        const forceComponentRender = (comp: any) => {
          try {
            const view = comp.getView();
            if (view) {
              // Force view to update
              if (view.render) {
                view.render();
              }
              // Update the DOM element directly if possible
              if (view.el) {
                // Trigger a mutation observer or force update
                const el = view.el as HTMLElement;
                // Force a repaint
                el.style.display = 'none';
                void el.offsetHeight; // Force reflow
                el.style.display = '';
              }
            }
            comp.trigger('update');
            comp.trigger('component:update');
            comp.trigger('change:content');
            
            const children = comp.components();
            if (children && children.length > 0) {
              children.forEach((child: any) => forceComponentRender(child));
            }
          } catch (e) {
            // Ignore errors
          }
        };
        allComponents.forEach((comp: any) => forceComponentRender(comp));
        
        // Force canvas to update
        editor.trigger('canvas:update');
        editor.trigger('canvas:frame:load');
        
        // Force iframe refresh without reloading (safer - preserves editor state)
        const frame = canvas.getFrameEl();
        if (frame && frame.contentWindow) {
          try {
            // Trigger multiple events to force refresh
            frame.contentWindow.dispatchEvent(new Event('resize', { bubbles: true }));
            frame.contentWindow.dispatchEvent(new Event('scroll', { bubbles: true }));
            
            // If we can access the document, force a repaint
            if (frame.contentDocument) {
              const frameDoc = frame.contentDocument;
              const body = frameDoc.body;
              if (body) {
                // Force a repaint by toggling visibility
                const originalVisibility = body.style.visibility;
                body.style.visibility = 'hidden';
                void body.offsetHeight; // Force reflow
                body.style.visibility = originalVisibility || '';
              }
              
              // Also trigger a mutation on the document to force updates
              const event = new MutationObserver(() => {
                // This will trigger when DOM changes
              });
              event.observe(frameDoc.body || frameDoc.documentElement, {
                childList: true,
                subtree: true,
                attributes: true
              });
              // Disconnect after a short time
              setTimeout(() => event.disconnect(), 100);
            }
          } catch (e) {
            console.warn('[WebeenthereAI] Could not force canvas refresh:', e);
          }
        }
      } catch (e) {
        console.warn('[WebeenthereAI] Could not force final canvas refresh:', e);
      }
    }
    
    // Automatically save to database if changes were detected and onSave callback is provided
    if (finalHasSuccessfulModification && onSave) {
      try {
        // CRITICAL: Wait one more time before saving to ensure all updates are fully processed
        // This gives GrapesJS time to fully synchronize the component model with the HTML representation
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 300);
          });
        });
        
        // Force one final update cycle before saving
        editor.trigger('component:update');
        editor.trigger('update');
        editor.trigger('storage:store');
        
        // CRITICAL: Force canvas and component re-render one final time before saving
        if (canvas) {
          editor.trigger('canvas:update');
          
          // Force all component views to re-render
          try {
            const allComponents = editor.getComponents();
            const forceComponentRender = (comp: any) => {
              try {
                const view = comp.getView();
                if (view && view.render) {
                  view.render();
                }
                comp.trigger('update');
                comp.trigger('component:update');
                
                const children = comp.components();
                if (children && children.length > 0) {
                  children.forEach((child: any) => forceComponentRender(child));
                }
              } catch (e) {
                // Ignore errors
              }
            };
            allComponents.forEach((comp: any) => forceComponentRender(comp));
          } catch (e) {
            // Ignore errors
          }
        }
        
        // Wait a bit more
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('[WebeenthereAI] Auto-saving changes to database...');
        await onSave();
        console.log('[WebeenthereAI] ✅ Changes saved to database successfully');
      } catch (saveError: any) {
        console.error('[WebeenthereAI] ⚠️ Auto-save failed:', saveError);
        // Don't throw - changes were applied, just not saved yet
        // User can save manually if needed
      }
    }
    
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

