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
- **Monthly plan price**: ₱119.33 ≈ **$2.15 USD**
- **Yearly plan price**: ₱1,145.52 ≈ **$20.64 USD** (20% discount from $25.80, which is $2.15 × 12)

## Plan Limits Calculation

### Free Plan ($0)
- **AI Messages**: 20 messages
  - Cost: 20 × $0.00175 = **$0.035**
  - Rationale: Provides a taste of AI functionality to attract users
  
- **Websites**: 1 website
  - Rationale: Allows users to create and test one website, encouraging upgrades

### Monthly Plan ($2.15/month = ₱119.33/month)
- **AI Messages**: 300 messages per month
  - Cost: 300 × $0.00175 = **$0.525 per month**
  - Margin: $2.15 - $0.525 = **$1.625 per month** (75.6% margin)
  - Rationale: This plan is designed to be accessible and affordable for the Philippine market. At ₱119.33 per month (approximately $2.15), it provides excellent value for money. The 300 AI messages allow users to generate multiple templates and make numerous improvements to their websites throughout the month. This pricing makes professional website building tools accessible to freelancers, small businesses, students, and content creators who need reliable AI-powered assistance without a significant financial commitment. The healthy margin ensures the service remains sustainable while keeping costs low for users.
  
- **Websites**: 5 websites
  - Rationale: This limit allows users to manage multiple projects simultaneously - perfect for freelancers handling different client websites, small businesses with multiple brands, or individuals working on personal projects. The limit prevents resource abuse while providing sufficient flexibility for active users.

### Yearly Plan ($20.64/year = ₱1,145.52/year)
- **AI Messages**: 4,000 messages per month
  - Cost: 4,000 × $0.00175 = **$7.00 per month** = **$84.00 per year**
  - Monthly equivalent: $20.64 ÷ 12 = **$1.72 per month**
  - Margin per month: $1.72 - $7.00 = **-$5.28** (negative margin on AI costs alone)
  - **Total Yearly Margin**: $20.64 - $84.00 = **-$63.36** (negative margin on AI costs)
  - **Savings**: Users save $5.16 per year (20% discount) compared to paying monthly ($25.80 - $20.64)
  - Rationale: This is our premium plan designed for power users and professionals who need extensive AI assistance. The 4,000 messages per month (approximately 133 messages per day) provides ample capacity for agencies, professional freelancers, and businesses that frequently use AI features. While the AI costs exceed the subscription price, this plan is strategically priced to:
  1. **Reward annual commitment**: The 20% discount ($5.16 savings) incentivizes users to commit for a full year, providing predictable revenue and reducing administrative overhead.
  2. **Attract premium users**: The generous limits attract professional users who value the platform and are less likely to churn, providing long-term value through customer retention.
  3. **Market positioning**: The pricing makes premium features accessible in the Philippine market while positioning the service as a professional tool for serious users.
  4. **Volume efficiency**: Higher usage users help optimize our AI infrastructure costs through better resource utilization.
  
  The negative margin on AI costs is an acceptable trade-off for the strategic benefits of customer retention, reduced churn, and attracting high-value users who may also use other premium features.
  
- **Websites**: 20 websites
  - Rationale: This premium limit is designed for agencies, professional freelancers managing multiple client projects, or businesses with multiple brands/products. It provides the flexibility needed for serious professional use while maintaining reasonable infrastructure costs.

## Cost Breakdown Summary

| Plan | Price (USD) | Price (PHP) | AI Messages | AI Cost/Month | Margin/Month | Websites |
|------|-------------|-------------|-------------|---------------|-------------|----------|
| Free | $0 | ₱0 | 20 | $0.035 | N/A | 1 |
| Monthly | $2.15 | ₱119.33 | 300 | $0.525 | $1.625 (75.6%) | 5 |
| Yearly | $20.64 | ₱1,145.52 | 4,000 | $7.00 | -$5.28* | 20 |

*Note: Yearly plan has negative margin on AI costs alone when calculated monthly, but the 20% discount ($5.16 savings) and annual commitment provide value through customer retention and premium tier positioning. The plan is designed for power users who value the higher website limits and annual savings.

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
- **Monthly plan**: Maintains healthy 75.6% margins, making it sustainable and profitable. The pricing at ₱119.33/month ($2.15) is carefully calibrated for the Philippine market - affordable enough to attract individual users, freelancers, and small businesses, while maintaining profitability. This price point covers AI costs, infrastructure expenses, and provides room for growth and feature development.
- **Infrastructure costs**: Hosting, storage, and bandwidth costs are relatively minimal compared to AI costs, allowing us to offer competitive pricing while maintaining service quality. The infrastructure is designed to scale efficiently as user base grows.
- **Yearly plan**: Strategically priced to balance value for users with business sustainability:
  - **20% discount incentive**: The $5.16 annual savings ($25.80 monthly vs $20.64 yearly) rewards users who commit for a full year, providing predictable revenue and reducing payment processing overhead.
  - **Customer retention**: Annual commitments significantly reduce churn rates, providing long-term value that offsets the negative margin on AI costs alone.
  - **Premium positioning**: The generous limits (4,000 messages/month, 20 websites) attract professional users who value the platform and are less likely to churn.
  - **Market accessibility**: At ₱1,145.52/year (approximately ₱95.46/month), the yearly plan remains accessible in the Philippine market while offering substantial value for power users.
  - **Strategic trade-off**: The negative margin on AI costs is an acceptable strategic decision because the customer lifetime value, reduced churn, and premium user acquisition offset the cost difference.
- **Pricing accessibility**: All prices are displayed in PHP (₱) for the Philippine market, making them more relatable and accessible. The monthly plan at ₱119.33 is affordable for students, freelancers, and small businesses, while the yearly plan at ₱1,145.52 offers significant savings (equivalent to ₱95.46/month) for users who can commit annually.

### Value Proposition
- **Free Plan**: Perfect for trying the platform and understanding its capabilities. With 20 AI messages and 1 website, users can fully experience the platform's AI-powered features before committing to a paid plan. This allows users to test template generation, AI assistant functionality, and website building tools at no cost.

- **Monthly Plan (₱119.33/month ≈ $2.15/month)**: 
  - **Target audience**: Freelancers, small businesses, students, content creators, and individuals building personal or client websites
  - **Value**: 300 AI messages per month (approximately 10 messages per day) provides ample capacity for regular use, while 5 websites allow management of multiple projects
  - **Flexibility**: No long-term commitment - perfect for users who want to try the service or have variable needs
  - **Affordability**: At just ₱119.33/month, this plan makes professional website building tools accessible to a wide range of users in the Philippine market

- **Yearly Plan (₱1,145.52/year ≈ $20.64/year, equivalent to ₱95.46/month)**: 
  - **Target audience**: Professional freelancers, agencies, businesses, and power users who frequently use AI features
  - **Value**: 4,000 AI messages per month (approximately 133 messages per day) provides extensive capacity for heavy AI usage, plus 20 websites for managing multiple client projects or brands
  - **Savings**: Save 20% compared to monthly billing (₱1,432.00/year vs ₱1,145.52/year), equivalent to getting 2.4 months free
  - **Best for**: Users who are committed to the platform and want maximum value, professional users managing multiple client projects, or businesses with high AI usage needs

## AI Chat Usage Tracking

All AI interactions count against the AI chat limit:
- **Template generation** (`/api/ai/generate-template`)
- **Canvas improvement** (`/api/ai/improve-canvas`)
- **AI Assistant** (`/api/ai/assistant`)

Each successful AI request increments the user's `ai_chat_usage` counter, which resets every 30 days based on the user's subscription start date. The reset cycle is calculated from the subscription start date, ensuring users get a full 30-day period of AI usage regardless of when they subscribed.

**Reset Logic:**
- Free plan: Resets 30 days from account creation
- Paid plans: Resets every 30 days from subscription start date
- Example: If a user subscribes on January 15th, their AI limit resets on February 14th, March 15th, April 14th, etc.

## Future Considerations

1. **Usage Monitoring**: Track actual token usage to refine cost calculations
2. **Dynamic Pricing**: Consider adjusting limits based on actual costs
3. **Overage Handling**: Define policy for users exceeding limits
4. **Yearly Plan Optimization**: Monitor yearly plan usage and adjust if margins become unsustainable
