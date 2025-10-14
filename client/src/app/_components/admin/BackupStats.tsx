'use client';

import React from 'react';
import { BackupStats as BackupStatsType } from '../../../lib/backupApi';
import { formatFileSize, getRelativeTime } from '../../../lib/backupApi';

interface BackupStatsProps {
  stats: BackupStatsType;
  className?: string;
}

const BackupStats: React.FC<BackupStatsProps> = ({ stats, className = '' }) => {
  const statCards = [
    {
      title: 'Total Backups',
      value: stats.totalBackups.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-purple-600 to-blue-600',
      bgGradient: 'from-purple-600/20 to-blue-600/20'
    },
    {
      title: 'Total Size',
      value: formatFileSize(stats.totalSize),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      gradient: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-600/20 to-cyan-600/20'
    },
    {
      title: 'Last Backup',
      value: stats.lastBackupDate ? getRelativeTime(stats.lastBackupDate) : 'Never',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-green-600 to-emerald-600',
      bgGradient: 'from-green-600/20 to-emerald-600/20'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-orange-600 to-red-600',
      bgGradient: 'from-orange-600/20 to-red-600/20'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards.map((card, index) => (
        <div
          key={index}
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all duration-300 transform hover:scale-105 group overflow-hidden"
        >
          {/* Enhanced hover background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${card.bgGradient} border border-gray-600/50 group-hover:border-gray-500/70 transition-colors duration-300`}>
                <div className={`text-white group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
              </div>
              <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${card.gradient} group-hover:w-16 transition-all duration-300`}></div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide group-hover:text-gray-300 transition-colors duration-300">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors duration-300">
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BackupStats;
