'use client';

import React from 'react';
import { planHelpers } from '../../../lib/subscriptionApi';

interface SubscriptionBadgeProps {
  planType: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  planType,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-lg';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const getDisplayName = () => {
    switch (planType) {
      case 'free':
        return 'Free';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      default:
        return planType;
    }
  };

  const getIcon = () => {
    switch (planType) {
      case 'free':
        return (
          <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'monthly':
        return (
          <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'yearly':
        return (
          <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium text-white transition-all duration-200
      ${planHelpers.getBadgeColor(planType)}
      ${getSizeClasses()}
      ${className}
    `}>
      {showIcon && (
        <span className="mr-1">
          {getIcon()}
        </span>
      )}
      {getDisplayName()}
    </span>
  );
};

export default SubscriptionBadge;
