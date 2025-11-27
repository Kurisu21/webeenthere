'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Plan } from '../../../lib/subscriptionApi';
import { subscriptionApi } from '../../../lib/subscriptionApi';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Custom hook to detect dark mode
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(isDark);
      }
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  return isDarkMode;
};

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onConfirm: (paymentIntentId: string) => void;
  isLoading?: boolean;
}

// Payment Form Component
const PaymentForm: React.FC<{
  plan: Plan;
  onConfirm: (paymentIntentId: string) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ plan, onConfirm, onClose, isLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [cardComplete, setCardComplete] = useState(false);

  // Create payment intent when component mounts
  useEffect(() => {
    if (plan && plan.type !== 'free' && plan.price > 0) {
      createPaymentIntent();
    }
  }, [plan]);

  const createPaymentIntent = async () => {
    try {
      setError(null);
      setInitializing(true);
      const response = await subscriptionApi.createPaymentIntent(plan.id);
      
      if (response.success && response.data) {
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
        setInitializing(false);
      } else {
        setError(response.error || 'Failed to initialize payment');
        setInitializing(false);
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to initialize payment. Please try again.');
      setInitializing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret || !paymentIntentId) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, call onConfirm with payment intent ID
        onConfirm(paymentIntentId);
      } else {
        setError('Payment was not completed. Please try again.');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An error occurred during payment. Please try again.');
      setProcessing(false);
    }
  };

  const formatPrice = () => {
    if (plan.price === 0) return 'Free';
    if (plan.type === 'yearly') {
      return `$${plan.price}/year`;
    }
    return `$${plan.price}/month`;
  };

  const calculateSavings = () => {
    if (plan.type === 'yearly') {
      // Assuming monthly plan is $9.99
      const monthlyTotal = 9.99 * 12;
      return monthlyTotal - plan.price;
    }
    return 0;
  };

  // Detect dark mode
  const isDarkMode = useDarkMode();

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: isDarkMode ? '#f3f4f6' : '#1f2937', // Light text in dark mode, dark text in light mode
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', // Dark bg in dark mode, white in light mode
        '::placeholder': {
          color: isDarkMode ? '#9ca3af' : '#6b7280', // Lighter placeholder in dark mode
        },
        ':-webkit-autofill': {
          color: isDarkMode ? '#f3f4f6' : '#1f2937',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: '#10b981',
        iconColor: '#10b981',
      },
    },
    hidePostalCode: false,
  };

  const handleCardChange = (event: any) => {
    if (event.complete) {
      setCardComplete(true);
      setError(null);
    } else {
      setCardComplete(false);
      if (event.error) {
        setError(event.error.message);
      } else {
        setError(null);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enhanced Plan Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              {plan.type === 'yearly' && (
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                  BEST VALUE
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{plan.features}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice()}</span>
              {plan.type === 'monthly' && (
                <span className="text-sm text-gray-500 dark:text-gray-400">per month</span>
              )}
            </div>
            {plan.type === 'yearly' && calculateSavings() > 0 && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                💰 Save ${calculateSavings().toFixed(2)} per year
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {plan.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {initializing && (
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-600 dark:bg-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="ml-4 text-gray-600 dark:text-gray-400">Initializing payment...</p>
        </div>
      )}

      {/* Card Element Section */}
      {!initializing && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Payment Information
            </label>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg blur-xl"></div>
              <div className="relative p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                <CardElement 
                  options={cardElementOptions}
                  onChange={handleCardChange}
                />
              </div>
            </div>
            {cardComplete && (
              <div className="mt-2 flex items-center text-green-600 dark:text-green-400 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Card details valid
              </div>
            )}
          </div>

          {/* Payment Method Icons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">We accept</div>
            <div className="flex gap-2">
              <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
              <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
              <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 animate-shake">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              {error.includes('card') && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    createPaymentIntent();
                  }}
                  className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Security Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Secure Payment</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Your payment is encrypted and processed securely by Stripe. We never store your card details.
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-blue-600 dark:text-blue-400">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>PCI Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={processing || isLoading || initializing}
          className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing || isLoading || !clientSecret || initializing || !cardComplete}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {processing || isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Pay {formatPrice()}</span>
            </>
          )}
        </button>
      </div>

      {/* Test Mode Notice */}
      {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-yellow-800 dark:text-yellow-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Test Mode:</span>
            <span>Use card <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">4242 4242 4242 4242</code> to test</span>
          </div>
        </div>
      )}
    </form>
  );
};

// Main Modal Component
const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onConfirm,
  isLoading = false
}) => {
  // ALWAYS call hooks first - before any conditional returns
  const isDarkModeForElements = useDarkMode();

  // Handle free plans - auto-confirm in useEffect to avoid render-time state updates
  useEffect(() => {
    if (isOpen && plan && (plan.type === 'free' || plan.price === 0)) {
      // Use setTimeout to ensure this runs after render
      const timer = setTimeout(() => {
        onConfirm('');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, plan, onConfirm]);

  // Now we can do conditional returns after all hooks are called
  if (!isOpen || !plan) return null;

  // Skip payment modal for free plans - just close immediately
  if (plan.type === 'free' || plan.price === 0) {
    return null;
  }

  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: isDarkModeForElements ? 'night' : 'stripe',
      variables: {
        colorPrimary: '#9333ea',
        colorBackground: isDarkModeForElements ? '#1f2937' : '#ffffff',
        colorText: isDarkModeForElements ? '#f3f4f6' : '#1f2937',
        colorDanger: '#ef4444',
        colorTextSecondary: isDarkModeForElements ? '#9ca3af' : '#6b7280',
        colorTextPlaceholder: isDarkModeForElements ? '#6b7280' : '#9ca3af',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          border: isDarkModeForElements ? '2px solid #374151' : '2px solid #e5e7eb',
          backgroundColor: isDarkModeForElements ? '#1f2937' : '#ffffff',
          color: isDarkModeForElements ? '#f3f4f6' : '#1f2937',
          boxShadow: 'none',
        },
        '.Input:focus': {
          border: '2px solid #9333ea',
          boxShadow: '0 0 0 3px rgba(147, 51, 234, 0.1)',
        },
        '.Input--invalid': {
          border: '2px solid #ef4444',
        },
        '.Label': {
          color: isDarkModeForElements ? '#f3f4f6' : '#1f2937',
        },
      },
    },
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-200 dark:border-gray-800 animate-slideUp">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
              <p className="text-purple-100 text-sm mt-1">Secure checkout powered by Stripe</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Elements stripe={stripePromise} options={elementsOptions}>
            <PaymentForm
              plan={plan}
              onConfirm={onConfirm}
              onClose={onClose}
              isLoading={isLoading}
            />
          </Elements>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default StripePaymentModal;
