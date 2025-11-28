'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const colorClasses = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  purple: 'bg-purple-600',
  yellow: 'bg-yellow-600',
  indigo: 'bg-indigo-600',
};

const iconBgClasses = {
  blue: 'bg-blue-500/20 text-blue-400',
  green: 'bg-green-500/20 text-green-400',
  red: 'bg-red-500/20 text-red-400',
  purple: 'bg-purple-500/20 text-purple-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  indigo: 'bg-indigo-500/20 text-indigo-400',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
}) => {
  return (
    <div className="bg-surface-elevated rounded-xl p-6 border border-app hover:border-app/70 transition-all duration-300 shadow-lg hover:shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-secondary text-sm font-medium">{title}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-5xl font-bold text-primary mb-2">{value}</p>
        {subtitle && (
          <p className="text-secondary text-sm">{subtitle}</p>
        )}
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div className="flex items-center justify-between">
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            trend.isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <svg 
              className={`w-4 h-4 mr-2 ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={trend.isPositive ? "M7 14l3-3m0 0l3 3m-3-3v8" : "M17 10l-3 3m0 0l-3-3m3 3v8"} 
              />
            </svg>
            {trend.isPositive ? '+' : ''}{trend.value}% vs last month
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;

