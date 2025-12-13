'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import SubscriptionTable from '../../_components/admin/SubscriptionTable';
import AssignPlanModal from '../../_components/admin/AssignPlanModal';
import { adminSubscriptionApi, AdminSubscription, PaginationInfo } from '../../../lib/adminSubscriptionApi';
import { useRouter } from 'next/navigation';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planTypeFilter, setPlanTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const router = useRouter();

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminSubscriptionApi.getAllSubscriptions({
        page: currentPage,
        limit: 20,
        plan_type: planTypeFilter || undefined,
        is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        search: searchTerm || undefined
      });
      
      setSubscriptions(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
      setError('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, planTypeFilter, statusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubscriptions();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPlanTypeFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleAssignPlan = async (data: {
    userId: number;
    planId: number;
    paymentReference?: string;
  }) => {
    try {
      setIsAssigning(true);
      setError(null);

      const response = await adminSubscriptionApi.assignPlan(data);

      if (response.success) {
        setShowAssignModal(false);
        await fetchSubscriptions();
      } else {
        setError(response.error || 'Failed to assign plan');
      }
    } catch (err) {
      console.error('Failed to assign plan:', err);
      setError('Failed to assign plan');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEditUser = (subscription: AdminSubscription) => {
    router.push(`/admin/subscriptions/${subscription.user_id}`);
  };

  const handleViewDetails = (userId: number) => {
    router.push(`/admin/subscriptions/${userId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
                  <h1 className="text-3xl font-bold text-primary">Subscription Management</h1>
                  <p className="text-secondary">Manage user subscriptions and plans</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {subscriptions.length} Subscriptions
                  </span>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Assign Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-surface-elevated rounded-lg border border-app p-6 mb-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-primary mb-2">
                      Search Users
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by username or email..."
                        className="w-full px-4 py-2 pl-10 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <svg className="w-5 h-5 absolute left-3 top-2.5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Plan Type Filter */}
                  <div>
                    <label htmlFor="planType" className="block text-sm font-medium text-primary mb-2">
                      Plan Type
                    </label>
                    <select
                      id="planType"
                      value={planTypeFilter}
                      onChange={(e) => setPlanTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Plans</option>
                      <option value="free">Free</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-primary mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Search
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </form>
            </div>

            {/* Results Summary */}
            {pagination && (
              <div className="mb-4">
                <p className="text-secondary text-sm">
                  Showing {subscriptions.length} of {pagination.totalItems} subscriptions
                  {searchTerm && ` matching "${searchTerm}"`}
                  {planTypeFilter && ` with plan "${planTypeFilter}"`}
                  {statusFilter && ` with status "${statusFilter}"`}
                </p>
              </div>
            )}

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

            {/* Subscription Table */}
            <SubscriptionTable
              subscriptions={subscriptions}
              onEditUser={handleEditUser}
              onViewDetails={handleViewDetails}
              isLoading={isLoading}
            />

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

            {/* Assign Plan Modal */}
            <AssignPlanModal
              isOpen={showAssignModal}
              onClose={() => setShowAssignModal(false)}
              onAssign={handleAssignPlan}
              isLoading={isAssigning}
            />
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}


