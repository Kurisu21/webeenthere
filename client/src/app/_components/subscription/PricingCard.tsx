'use client';

import React from 'react';
import { Plan, planHelpers } from '../../../lib/subscriptionApi';

interface PricingCardProps {
  plan: Plan;
  currentPlan?: Plan | null;
  onSubscribe: (planId: number) => void;
  isLoading?: boolean;
  isPopular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  currentPlan,
  onSubscribe,
  isLoading = false,
  isPopular = false
}) => {
  const isCurrentPlan = currentPlan?.id === plan.id;
  const isUpgrade = currentPlan && plan.price > currentPlan.price;
  const isDowngrade = currentPlan && plan.price < currentPlan.price;
  
  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (plan.type === 'free') return 'Free Plan';
    if (isUpgrade) return 'Upgrade';
    if (isDowngrade) return 'Downgrade';
    return 'Subscribe';
  };

  const getButtonColor = () => {
    if (isCurrentPlan) return 'bg-gray-500 cursor-not-allowed';
    if (isPopular) return 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const formatPrice = () => {
    if (plan.price === 0) return 'Free';
    if (plan.type === 'yearly') {
      return `$${plan.price}/year`;
    }
    return `$${plan.price}/month`;
  };

  const getSavingsText = () => {
    if (plan.type === 'yearly') {
      const monthlyPrice = 9.99; // Monthly plan price
      const savings = planHelpers.calculateYearlySavings(monthlyPrice, plan.price);
      return `Save $${savings.toFixed(2)}/year`;
    }
    return null;
  };

  return (
    <div className={`
      relative bg-surface-elevated rounded-xl border-2 p-8 transition-all duration-300 hover:shadow-lg
      ${isPopular ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-app'}
      ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}
    `}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
        <div className="text-4xl font-bold text-primary mb-2">
          {formatPrice()}
        </div>
        {getSavingsText() && (
          <div className="text-green-500 text-sm font-medium">
            {getSavingsText()}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-secondary">
            {planHelpers.isUnlimited(plan.website_limit) ? 'Unlimited websites' : `${plan.website_limit} websites`}
          </span>
        </div>
        
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-secondary">
            {planHelpers.isUnlimited(plan.ai_chat_limit) ? 'Unlimited AI chat' : `${plan.ai_chat_limit} AI messages`}
          </span>
        </div>

        {plan.type === 'yearly' && (
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-secondary">Premium features</span>
          </div>
        )}

        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-secondary">All templates</span>
        </div>
      </div>

      {/* Subscribe Button */}
      <button
        onClick={() => !isCurrentPlan && onSubscribe(plan.id)}
        disabled={isCurrentPlan || isLoading}
        className={`
          w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105
          ${getButtonColor()}
          ${isCurrentPlan || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          text-white
        `}
      >
        {isLoading ? 'Processing...' : getButtonText()}
      </button>
    </div>
  );
};

export default PricingCard;
