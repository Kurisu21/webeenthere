# AI Assistant Files Tracker

This document lists all files created for the Webeenthere AI Assistant feature. Use this to track, edit, or delete AI assistant-related code.

## 📁 Frontend Components

### Main Component
- **Path**: `client/src/app/_components/builder/ai-assistant/WebeenthereAIAssistant.tsx`
- **Description**: Main React component for the AI Assistant UI
- **Purpose**: Provides the user interface (floating panel, input, suggestions display)
- **Can be deleted**: ✅ Yes - Entire AI Assistant feature

### Styles
- **Path**: `client/src/app/_components/builder/ai-assistant/WebeenthereAIAssistant.css`
- **Description**: CSS styles for the AI Assistant component
- **Purpose**: Styling for light/dark themes, animations, layout
- **Can be deleted**: ✅ Yes - Entire AI Assistant feature

### Documentation
- **Path**: `client/src/app/_components/builder/ai-assistant/README.md`
- **Description**: Documentation for the AI Assistant feature
- **Purpose**: Explains how the feature works
- **Can be deleted**: ✅ Yes - Entire AI Assistant feature

## 🔧 Hooks & Utilities

### AI Hook
- **Path**: `client/src/app/_components/builder/ai-assistant/hooks/useWebeenthereAI.ts`
- **Description**: Custom React hook managing AI interactions
- **Purpose**: Handles API calls, state management, code execution
- **Can be deleted**: ✅ Yes - Entire AI Assistant feature

### Prompt Builder
- **Path**: `client/src/app/_components/builder/ai-assistant/utils/promptBuilder.ts`
- **Description**: Builds AI prompts with editor context
- **Purpose**: Creates prompts for AI service with HTML/CSS/editor state
- **Can be deleted**: ✅ Yes - Entire AI Assistant feature

### Code Executor
- **Path**: `client/src/app/_components/builder/ai-assistant/utils/codeExecutor.ts`
- **Description**: Safely executes AI-generated JavaScript code
- **Purpose**: Sandboxes and executes code in editor context
- **Can be deleted**: ✅ Yes - Entire AI Assistant feature

## 🔌 Backend Integration

### API Route
- **Path**: `server/routes/aiRoutes.js`
- **Changes**: Added new route handler
- **Line**: ~20-23 (new route: `/assistant`)
- **Code added**:
  ```javascript
  // AI Assistant endpoint for real-time suggestions and user prompts
  router.post('/assistant', authMiddleware, async (req, res) => {
    await aiController.handleAssistantRequest(req, res);
  });
  ```
- **Can be removed**: ✅ Yes - Remove the route handler block

### Controller Method
- **Path**: `server/controllers/AiController.js`
- **Changes**: Added new method `handleAssistantRequest()`
- **Line**: ~225-320 (new method)
- **Code added**: Entire `handleAssistantRequest` method
- **Can be removed**: ✅ Yes - Remove the entire method

## 🔗 Integration Points

### Builder Layout Integration
- **Path**: `client/src/app/_components/builder/BuilderLayout.tsx`
- **Changes**: 
  1. Added import statement (line ~11)
  2. Added component in JSX (line ~491)
- **Code added**:
  ```tsx
  // Import (around line 11)
  import WebeenthereAIAssistant from './ai-assistant/WebeenthereAIAssistant';
  
  // Component usage (around line 491)
  <WebeenthereAIAssistant editor={editor} isDark={isDark} />
  ```
- **Can be removed**: ✅ Yes - Remove import and component usage

### API Configuration
- **Path**: `client/src/lib/apiConfig.ts`
- **Changes**: 
  1. Added new endpoint constant (line ~30)
  2. Updated `apiPost` function signature (line ~129)
- **Code added**:
  ```typescript
  // In API_ENDPOINTS object (around line 30)
  AI_ASSISTANT: `${API_BASE_URL}/api/ai/assistant`,
  
  // Updated apiPost signature (around line 129)
  export const apiPost = async (
    endpoint: string,
    data: any,
    options?: { signal?: AbortSignal }  // <-- New parameter
  ): Promise<any> => {
  ```
- **Can be removed**: 
  - ✅ Remove `AI_ASSISTANT` from API_ENDPOINTS
  - ⚠️ Keep `options` parameter if used elsewhere, otherwise remove

## 📊 File Summary

### New Files Created (6 files)
1. `client/src/app/_components/builder/ai-assistant/WebeenthereAIAssistant.tsx`
2. `client/src/app/_components/builder/ai-assistant/WebeenthereAIAssistant.css`
3. `client/src/app/_components/builder/ai-assistant/README.md`
4. `client/src/app/_components/builder/ai-assistant/hooks/useWebeenthereAI.ts`
5. `client/src/app/_components/builder/ai-assistant/utils/promptBuilder.ts`
6. `client/src/app/_components/builder/ai-assistant/utils/codeExecutor.ts`

### Modified Files (4 files)
1. `server/routes/aiRoutes.js` - Added route handler
2. `server/controllers/AiController.js` - Added controller method
3. `client/src/app/_components/builder/BuilderLayout.tsx` - Added import and component
4. `client/src/lib/apiConfig.ts` - Added endpoint and updated apiPost signature

## 🗑️ Quick Delete Guide

### To completely remove the AI Assistant feature:

1. **Delete entire directory**:
   ```bash
   rm -rf client/src/app/_components/builder/ai-assistant
   ```

2. **Remove from BuilderLayout.tsx**:
   - Delete import: `import WebeenthereAIAssistant from './ai-assistant/WebeenthereAIAssistant';`
   - Delete component: `<WebeenthereAIAssistant editor={editor} isDark={isDark} />`

3. **Remove from aiRoutes.js**:
   - Delete the `/assistant` route handler block

4. **Remove from AiController.js**:
   - Delete the entire `handleAssistantRequest()` method

5. **Remove from apiConfig.ts**:
   - Remove `AI_ASSISTANT: ...` from API_ENDPOINTS
   - Revert `apiPost` signature if not used elsewhere

## 🔍 Search for References

To find all references to the AI Assistant in your codebase:

```bash
# Search for component usage
grep -r "WebeenthereAIAssistant" client/

# Search for API endpoint
grep -r "AI_ASSISTANT" client/
grep -r "/api/ai/assistant" client/

# Search for hook usage
grep -r "useWebeenthereAI" client/

# Search for controller method
grep -r "handleAssistantRequest" server/
```

## 📝 Notes

- All AI Assistant code is self-contained in the `ai-assistant` directory
- The feature integrates with existing AI service infrastructure
- Subscription limits and usage tracking are handled automatically
- No database schema changes were required
- The feature is optional and can be completely removed without breaking the builder

## ⚠️ Important

Before deleting:
1. Check if any other components reference the AI Assistant
2. Verify that `apiPost` options parameter isn't used elsewhere
3. Test the builder after removal to ensure nothing breaks
4. Consider keeping the directory structure if you plan to re-add similar features later


