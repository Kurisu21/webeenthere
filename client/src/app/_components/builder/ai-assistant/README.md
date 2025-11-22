# Webeenthere AI Assistant

This is our own implementation of an AI assistant for the Webeenthere website builder. It provides intelligent suggestions and executes user requests to help build websites more efficiently.

## Overview

The AI Assistant is a React-based component that integrates with GrapesJS editor to provide:
- **Automatic suggestions**: Analyzes the website and suggests improvements
- **User prompts**: Executes specific user requests (e.g., "make the header blue")
- **Code execution**: Safely executes AI-generated JavaScript code in the editor context
- **Error handling**: Retry logic and error recovery

## Architecture

### Components

1. **WebeenthereAIAssistant.tsx** - Main React component with UI
2. **useWebeenthereAI.ts** - Custom hook managing AI interactions
3. **promptBuilder.ts** - Builds AI prompts with editor context
4. **codeExecutor.ts** - Safely executes AI-generated code

### Backend

- **Route**: `/api/ai/assistant` (POST)
- **Controller**: `AiController.handleAssistantRequest()`
- **Service**: Uses existing `AiService` with OpenRouter API

## Features

### Automatic Suggestions
- Monitors editor changes
- Suggests improvements for SEO, accessibility, responsive design, performance
- Only triggers when significant changes are detected

### User Prompts
- Users can type natural language requests
- AI generates GrapesJS-compatible JavaScript code
- Code is auto-executed for user prompts
- Supports prompt history (arrow keys to navigate)

### Safety
- Code execution is sandboxed
- Dangerous patterns are blocked (eval, Function constructor, etc.)
- Only GrapesJS APIs are used (no native DOM manipulation)

### Technical Metrics
- Token usage tracking
- Retry count
- Error tracking
- Request cancellation support

## Usage

The AI Assistant appears as a floating button in the bottom-right corner of the builder. Click to open the panel.

### Asking for Changes
1. Type your request in the input field (e.g., "make all headings blue")
2. Press Enter or click "Ask AI"
3. The AI will generate and execute the code automatically

### Getting Suggestions
1. Click the "Suggest" button
2. The AI will analyze your website and suggest improvements
3. Click "Apply" to execute the suggestion

### Retrying Failed Requests
If a request fails, click "Try Again" to retry with a different approach.

## Integration

The component is integrated into `BuilderLayout.tsx`:

```tsx
<WebeenthereAIAssistant editor={editor} isDark={isDark} />
```

## API Endpoint

**POST** `/api/ai/assistant`

Request body:
```json
{
  "prompt": "User prompt or context prompt",
  "isUserPrompt": false
}
```

Response:
```json
{
  "success": true,
  "suggestion": {
    "explanation": "What the AI wants to do",
    "code": "JavaScript code using GrapesJS APIs"
  },
  "tokenCount": 1234,
  "aiPromptId": "prompt_id"
}
```

## Implementation Notes

- This is our own implementation, not copied from any other project
- Uses our existing AI service infrastructure
- Follows Webeenthere coding conventions
- Integrates with subscription limits and usage tracking
- Supports both light and dark themes

## Safety Considerations

- Code execution is limited to GrapesJS APIs
- Dangerous JavaScript patterns are blocked
- All code is executed in a controlled context
- Errors are caught and displayed to users

## Future Enhancements

- Conversation history
- Multiple suggestion options
- Undo/redo support for AI changes
- Custom prompt templates
- Integration with analytics


