'use client';

import React from 'react';
import { AdminSubscription, adminSubscriptionHelpers } from '../../../lib/adminSubscriptionApi';

interface SubscriptionTableProps {
  subscriptions: AdminSubscription[];
  onEditUser: (subscription: AdminSubscription) => void;
  onViewDetails: (userId: number) => void;
  isLoading?: boolean;
}

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  onEditUser,
  onViewDetails,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-primary">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-surface-elevated rounded-lg border border-app p-8 text-center">
        <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-primary mb-2">No Subscriptions Found</h3>
        <p className="text-secondary">No subscriptions match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface border-b border-app">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Auto Renew
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="hover:bg-surface transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-primary">{subscription.username}</div>
                    <div className="text-sm text-secondary">{subscription.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${adminSubscriptionHelpers.getActionBadgeColor(subscription.plan_type)}`}>
                      {subscription.plan_name}
                    </span>
                    <span className="ml-2 text-sm text-secondary">
                      {adminSubscriptionHelpers.formatCurrency(subscription.price)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${adminSubscriptionHelpers.getStatusBadgeColor(subscription)}`}>
                    {adminSubscriptionHelpers.getSubscriptionStatus(subscription)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {adminSubscriptionHelpers.formatDate(subscription.start_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {subscription.end_date ? adminSubscriptionHelpers.formatDate(subscription.end_date) : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscription.auto_renew 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.auto_renew ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetails(subscription.user_id)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onEditUser(subscription)}
                      className="text-purple-600 hover:text-purple-900 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionTable;



