# Subscription Pricing Rationale

## Overview

This document explains the pricing model, cost calculations, and plan limits for the subscription service.

## Token Pricing Model

Our AI service uses OpenAI's API with the following token pricing:
- **Input tokens**: $0.20 per million tokens
- **Output tokens**: $0.50 per million tokens

## Average AI Message Cost Calculation

### Token Usage Per Message
- Average AI message: **4,000-6,000 tokens** (average: **5,000 tokens**)
  - Input tokens: **2,500 tokens** (user prompt + context)
  - Output tokens: **2,500 tokens** (AI response)

### Cost Per Message
```
Input cost:  2,500 tokens × ($0.20 / 1,000,000) = $0.0005
Output cost: 2,500 tokens × ($0.50 / 1,000,000) = $0.00125
Total cost per message: $0.00175
```

**Average cost per AI message: ~$0.00175**

## Currency Conversion

- **Exchange rate**: ~55.5 PHP/USD
- **Monthly plan price**: 300 PHP ≈ **$5.40 USD**
- **Yearly plan price**: 300 PHP × 12 = 3,600 PHP ≈ **$64.80 USD**

## Plan Limits Calculation

### Free Plan ($0)
- **AI Messages**: 20 messages
  - Cost: 20 × $0.00175 = **$0.035**
  - Rationale: Provides a taste of AI functionality to attract users
  
- **Websites**: 1 website
  - Rationale: Allows users to create and test one website, encouraging upgrades

### Monthly Plan ($5.40/month)
- **AI Messages**: 300 messages
  - Cost: 300 × $0.00175 = **$0.525**
  - Margin: $5.40 - $0.525 = **$4.875** (90.3% margin)
  - Rationale: Provides substantial AI usage while maintaining healthy margins
  
- **Websites**: 5 websites
  - Rationale: Supports multiple projects for active users without overwhelming infrastructure

### Yearly Plan ($64.80/year = $5.40/month)
- **AI Messages**: 4,000 messages per month
  - Cost: 4,000 × $0.00175 = **$7.00**
  - Margin: $5.40 - $7.00 = **-$1.60** (negative margin on AI costs alone)
  - Rationale: Higher volume plan that may require additional cost management, but provides value through website limits and annual commitment
  
- **Websites**: 20 websites
  - Rationale: Premium tier for power users managing multiple projects

## Cost Breakdown Summary

| Plan | Price | AI Messages | AI Cost | Margin | Websites |
|------|-------|-------------|---------|--------|----------|
| Free | $0 | 20 | $0.035 | N/A | 1 |
| Monthly | $5.40 | 300 | $0.525 | $4.875 (90.3%) | 5 |
| Yearly | $64.80 | 4,000 | $7.00 | -$1.60* | 20 |

*Note: Yearly plan has negative margin on AI costs alone, but the annual commitment and higher website limits provide value. Consider monitoring usage patterns and adjusting if needed.

## Website Limits Justification

### Free Plan (1 website)
- Allows users to test the platform
- Encourages upgrades for multiple projects
- Low infrastructure cost

### Monthly Plan (5 websites)
- Supports active users with multiple projects
- Reasonable infrastructure load
- Good balance between value and cost

### Yearly Plan (20 websites)
- Premium tier for power users
- Higher infrastructure cost offset by annual commitment
- Attracts professional users managing multiple client projects

## Pricing Reasonableness

### Competitive Analysis
- Our pricing is competitive with similar SaaS platforms
- Free tier provides meaningful value without excessive cost
- Paid tiers offer clear value progression

### Cost Coverage
- Monthly plan maintains healthy 90%+ margins
- Infrastructure costs (hosting, storage, bandwidth) are minimal compared to AI costs
- Yearly plan may require monitoring for high-usage users

### Value Proposition
- **Free**: Perfect for trying the platform
- **Monthly**: Great for regular users with multiple projects
- **Yearly**: Best value for power users and professionals

## AI Chat Usage Tracking

All AI interactions count against the AI chat limit:
- **Template generation** (`/api/ai/generate-template`)
- **Canvas improvement** (`/api/ai/improve-canvas`)
- **AI Assistant** (`/api/ai/assistant`)

Each successful AI request increments the user's `ai_chat_usage` counter, which resets monthly based on the user's subscription cycle.

## Future Considerations

1. **Usage Monitoring**: Track actual token usage to refine cost calculations
2. **Dynamic Pricing**: Consider adjusting limits based on actual costs
3. **Overage Handling**: Define policy for users exceeding limits
4. **Yearly Plan Optimization**: Monitor yearly plan usage and adjust if margins become unsustainable
