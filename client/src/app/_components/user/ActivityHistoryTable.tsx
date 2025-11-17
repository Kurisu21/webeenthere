'use client';

import React from 'react';
import { ActivityLog, formatActivityDate, getActionIcon, getActionColor } from '../../../lib/activityApi';
import { formatActivityDetails, getActionDescription, formatActivityTimestamp } from '../../../lib/activityFormatters';

interface ActivityHistoryTableProps {
  logs: ActivityLog[];
  isLoading: boolean;
}

const ActivityHistoryTable: React.FC<ActivityHistoryTableProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-app rounded-lg overflow-hidden">
        <div className="p-6 border-b border-app">
          <h2 className="text-xl font-semibold text-primary">Activity History</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-elevated rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-card border border-app rounded-lg overflow-hidden">
        <div className="p-6 border-b border-app">
          <h2 className="text-xl font-semibold text-primary">Activity History</h2>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-secondary">No activity history found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-app rounded-lg overflow-hidden">
      <div className="p-6 border-b border-app">
        <h2 className="text-xl font-semibold text-primary">Activity History</h2>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {logs.map((log, index) => {
              const timestamp = formatActivityTimestamp(log.timestamp || '');
              const formattedDetails = formatActivityDetails(log.action || '', log.details);
              const actionDescription = getActionDescription(log.action || '');
              
              return (
                <tr key={log.id || index} className="hover:bg-surface-elevated transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{getActionIcon(log.action || '')}</span>
                      <span className={`text-sm font-medium ${getActionColor(log.action || '')}`}>
                        {actionDescription}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-primary max-w-lg">
                      <div className="font-medium mb-1">{formattedDetails}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-secondary">
                      {log.ipAddress && log.ipAddress !== 'unknown' ? log.ipAddress : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary">
                      <div className="font-medium">{timestamp.date}</div>
                      <div className="text-xs text-secondary mt-0.5">{timestamp.time}</div>
                      <div className="text-xs text-secondary mt-0.5">{timestamp.relative}</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-app">
        {logs.map((log, index) => {
          const timestamp = formatActivityTimestamp(log.timestamp || '');
          const formattedDetails = formatActivityDetails(log.action || '', log.details);
          const actionDescription = getActionDescription(log.action || '');
          
          return (
            <div key={log.id || index} className="p-4 hover:bg-surface-elevated transition-colors">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-3">{getActionIcon(log.action || '')}</span>
                <span className={`text-sm font-medium ${getActionColor(log.action || '')}`}>
                  {actionDescription}
                </span>
              </div>
              <div className="text-sm text-primary mb-3">
                <div className="font-medium">{formattedDetails}</div>
              </div>
              <div className="text-xs text-secondary space-y-1.5">
                <div>
                  <span className="font-medium text-secondary/70">IP Address:</span>{' '}
                  <span className="font-mono">{log.ipAddress && log.ipAddress !== 'unknown' ? log.ipAddress : 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-secondary/70">Date:</span> {timestamp.date}
                </div>
                <div>
                  <span className="font-medium text-secondary/70">Time:</span> {timestamp.time} ({timestamp.relative})
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityHistoryTable;

