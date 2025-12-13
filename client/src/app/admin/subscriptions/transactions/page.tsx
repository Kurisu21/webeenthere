'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '../../../_components/layout/DashboardHeader';
import AdminSidebar from '../../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../../_components/layout/MainContentWrapper';
import { adminSubscriptionApi, AdminPaymentTransaction, PaginationInfo } from '../../../../lib/adminSubscriptionApi';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    userId: '',
    status: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminSubscriptionApi.getPaymentTransactions({
        page: currentPage,
        limit: 50,
        user_id: filters.userId ? parseInt(filters.userId) : undefined,
        status: filters.status || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        min_amount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
        max_amount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined
      });
      
      setTransactions(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to fetch payment transactions:', err);
      setError('Failed to load payment transactions');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters.userId, filters.status, filters.startDate, filters.endDate, filters.minAmount, filters.maxAmount]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);


  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      userId: '',
      status: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount: number) => {
    // Display in PHP, but amount is in USD from database
    const phpAmount = amount * 55.5;
    return `₱${phpAmount.toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate pagination helpers
  const hasPrev = pagination ? pagination.currentPage > 1 : false;
  const hasNext = pagination ? pagination.currentPage < pagination.totalPages : false;

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-primary">Payment Transactions</h1>
                  <p className="text-secondary">View all payment transactions and mock payments</p>
                </div>
                <div className="text-sm text-secondary">
                  {transactions.length} total records
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">User ID</label>
                  <input
                    type="number"
                    value={filters.userId}
                    onChange={(e) => handleFilterChange('userId', e.target.value)}
                    placeholder="User ID"
                    className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Min Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Max Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    placeholder="999.99"
                    className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleClearFilters}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-300">{error}</span>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            {isLoading ? (
              <div className="bg-surface-elevated rounded-lg border border-app p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-primary">Loading payment transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-surface-elevated rounded-lg border border-app p-8 text-center">
                <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="text-xl font-semibold text-primary mb-2">No Transactions Found</h3>
                <p className="text-secondary">No payment transactions match your current filters.</p>
              </div>
            ) : (
              <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface border-b border-app">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-surface transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                            {formatDateTime(transaction.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-primary">{transaction.username}</div>
                              <div className="text-sm text-secondary">{transaction.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                            {transaction.plan_name} ({transaction.plan_type})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary font-medium">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusBadgeColor(transaction.status)}`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary font-mono">
                            {transaction.transaction_reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrev}
                    className="px-3 py-2 text-sm font-medium text-secondary bg-surface-elevated border border-app rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === currentPage;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isCurrentPage
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'text-secondary bg-surface-elevated border border-app hover:bg-surface'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNext}
                    className="px-3 py-2 text-sm font-medium text-secondary bg-surface-elevated border border-app rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}


