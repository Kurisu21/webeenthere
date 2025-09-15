# AI Integration Setup Guide

## OpenRouter API Setup

1. **Get OpenRouter API Key**:
   - Visit [OpenRouter.ai](https://openrouter.ai/)
   - Sign up for a free account
   - Go to [API Keys](https://openrouter.ai/keys)
   - Create a new API key

2. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory with:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=webeenthere
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   ```

3. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

4. **Start the Server**:
   ```bash
   npm run dev
   ```

## AI Features

### 🤖 AI Assistant Panel
- **Generate Section**: Create new website sections using natural language
- **Improve Selected**: Enhance existing elements with AI suggestions
- **Quick Prompts**: Pre-built prompts for common sections
- **Smart Suggestions**: AI-powered recommendations

### 💰 Cost Information
- **DeepSeek Chat**: Free tier available through OpenRouter
- **Usage-based pricing**: Pay only for what you use
- **No monthly subscriptions**: Flexible payment model

### 🎯 Example Prompts
- "Add a professional hero section for a tech startup"
- "Create a testimonials section with customer reviews"
- "Add a pricing table with three tiers"
- "Include social media links and contact form"

## API Endpoints

- `POST /api/ai/generate-section` - Generate new website sections
- `POST /api/ai/improve-content` - Improve existing content
- `GET /api/ai/suggestions` - Get AI suggestions
- `GET /api/ai/prompts/:userId` - Get user's AI history

## Troubleshooting

1. **API Key Issues**: Ensure your OpenRouter API key is valid and has credits
2. **CORS Errors**: Make sure the server is running on port 5000
3. **Database Errors**: Verify MySQL connection and table structure
4. **AI Response Issues**: Check console logs for detailed error messages


