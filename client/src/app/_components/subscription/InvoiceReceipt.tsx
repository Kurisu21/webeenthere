'use client';

import React, { useState } from 'react';
import { Invoice } from '../../../lib/invoiceApi';
import { invoiceApi } from '../../../lib/invoiceApi';

interface InvoiceReceiptProps {
  invoice: Invoice;
  onClose: () => void;
  onDownload?: () => void;
}

const InvoiceReceipt: React.FC<InvoiceReceiptProps> = ({ invoice, onClose, onDownload }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await invoiceApi.downloadInvoice(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      if (onDownload) onDownload();
    } catch (err) {
      console.error('Failed to download invoice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download invoice';
      alert(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'sent':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-surface-elevated rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-app animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Payment Receipt</h2>
              <p className="text-purple-100 text-sm mt-1">Invoice #{invoice.invoice_number}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </span>
            <div className="text-sm text-secondary">
              Issued: {formatDate(invoice.issue_date)}
            </div>
          </div>

          {/* Company Info */}
          <div className="border-b border-app pb-4">
            <h3 className="text-xl font-bold text-primary mb-2">Webeenthere</h3>
            <p className="text-sm text-secondary">Thank you for your subscription!</p>
          </div>

          {/* Bill To */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-2">Bill To:</h4>
            <div className="text-sm text-primary">
              <p className="font-medium">{invoice.username}</p>
              <p className="text-secondary">{invoice.email}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-surface rounded-lg p-4 border border-app">
            <table className="w-full">
              <thead>
                <tr className="border-b border-app">
                  <th className="text-left py-2 text-sm font-semibold text-primary">Description</th>
                  <th className="text-right py-2 text-sm font-semibold text-primary">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 text-sm text-primary">
                    <div className="font-medium">{invoice.plan_name}</div>
                    <div className="text-xs text-secondary">{invoice.plan_type} subscription</div>
                  </td>
                  <td className="py-3 text-right text-sm font-semibold text-primary">
                    ${parseFloat(invoice.amount.toString()).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-app space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Subtotal</span>
                <span className="text-primary">${parseFloat(invoice.amount.toString()).toFixed(2)}</span>
              </div>
              {parseFloat(invoice.tax_amount.toString()) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Tax</span>
                  <span className="text-primary">${parseFloat(invoice.tax_amount.toString()).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-app">
                <span className="text-primary">Total</span>
                <span className="text-primary">${parseFloat(invoice.total_amount.toString()).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {invoice.transaction_reference && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-sm font-semibold text-primary">Payment Reference</span>
              </div>
              <p className="text-sm text-secondary font-mono">{invoice.transaction_reference}</p>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="text-sm text-secondary">
              <p className="font-medium mb-1 text-primary">Notes:</p>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-app">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface hover:bg-surface-elevated border border-app text-primary rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InvoiceReceipt;

