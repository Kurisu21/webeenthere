'use client';

import React, { useState, useEffect } from 'react';
import { Plan } from '../../../lib/subscriptionApi';

interface AssignPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: {
    userId: number;
    planId: number;
    startDate?: string;
    endDate?: string;
    paymentReference?: string;
  }) => void;
  isLoading?: boolean;
  userId?: number;
  userName?: string;
}

const AssignPlanModal: React.FC<AssignPlanModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  isLoading = false,
  userId,
  userName
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState({
    userId: userId || 0,
    planId: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    paymentReference: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      setFormData(prev => ({
        ...prev,
        userId: userId || 0
      }));
    }
  }, [isOpen, userId]);

  const loadPlans = async () => {
    try {
      const { subscriptionApi } = await import('../../../lib/subscriptionApi');
      const response = await subscriptionApi.getPlans();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.planId) {
      alert('Please fill in all required fields');
      return;
    }

    onAssign({
      userId: formData.userId,
      planId: formData.planId,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      paymentReference: formData.paymentReference || undefined
    });
  };

  const handleClose = () => {
    setFormData({
      userId: userId || 0,
      planId: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      paymentReference: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface-elevated rounded-xl p-8 max-w-md w-full mx-4 border border-app">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Assign Plan</h2>
          <button
            onClick={handleClose}
            className="text-secondary hover:text-primary transition-colors"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        {userName && (
          <div className="bg-surface rounded-lg p-4 mb-6 border border-app">
            <div className="text-sm text-secondary">Assigning plan to:</div>
            <div className="text-lg font-semibold text-primary">{userName}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              User ID *
            </label>
            <input
              type="number"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', parseInt(e.target.value))}
              placeholder="Enter user ID"
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || !!userId}
              required
            />
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Plan *
            </label>
            <select
              value={formData.planId}
              onChange={(e) => handleInputChange('planId', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            >
              <option value={0}>Select a plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price}/{plan.type === 'yearly' ? 'year' : 'month'}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-xs text-secondary mt-1">
              Leave empty for unlimited duration (free plans) or auto-renewal (paid plans)
            </p>
          </div>

          {/* Payment Reference */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Payment Reference (Optional)
            </label>
            <input
              type="text"
              value={formData.paymentReference}
              onChange={(e) => handleInputChange('paymentReference', e.target.value)}
              placeholder="e.g., ADMIN_ASSIGNED_001"
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Assigning...' : 'Assign Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignPlanModal;



