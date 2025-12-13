'use client';

import React, { useState } from 'react';
import { Plan } from '../../../lib/subscriptionApi';
import { formatPriceInPhp, usdToPhp } from '../../../lib/currencyUtils';

interface MockPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onConfirm: (paymentReference: string) => void;
  isLoading?: boolean;
}

const MockPaymentModal: React.FC<MockPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onConfirm,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    cardNumber: '4242424242424242',
    expiryDate: '12/25',
    cvv: '123',
    cardholderName: 'John Doe'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentReference = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    onConfirm(paymentReference);
  };

  if (!isOpen || !plan) return null;

  const formatPrice = () => {
    if (plan.price === 0) return 'Free';
    if (plan.type === 'yearly') {
      return formatPriceInPhp(plan.price, 'year');
    }
    return formatPriceInPhp(plan.price, 'month');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface-elevated rounded-xl p-8 max-w-md w-full mx-4 border border-app">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Plan Summary */}
        <div className="bg-surface rounded-lg p-4 mb-6 border border-app">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-primary">{plan.name}</h3>
              <p className="text-sm text-secondary">{plan.features}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">{formatPrice()}</div>
              {plan.type === 'yearly' && (
                <div className="text-sm text-green-500">Save ₱{usdToPhp((2.15 * 12) - 20.64).toFixed(2)}/year</div>
              )}
            </div>
          </div>
        </div>

        {/* Mock Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="! Any fake card number !"
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="! Any fake date !"
                className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                CVV
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="! Any fake CVV !"
                className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              placeholder="! Any fake name !"
              className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Mock Payment Notice */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-300 text-sm font-medium">Mock Payment</p>
                <p className="text-yellow-200 text-xs mt-1">
                  This is a demonstration. No real payment will be processed.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
              {isLoading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MockPaymentModal;
