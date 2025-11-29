'use client';

import React, { useState, useEffect } from 'react';
import { feedbackApi, Feedback } from '../../../lib/feedbackApi';
import { adminApi, User } from '../../../lib/adminApi';

interface FeedbackListProps {
  onAssign: (feedbackId: string, adminId: string) => void;
  onRespond?: (feedbackId: string, response: string) => void;
  onClose: (feedbackId: string, response?: string) => void;
  refreshTrigger?: number;
}

export default function FeedbackList({ onAssign, onRespond, onClose, refreshTrigger }: FeedbackListProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: ''
  });
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await feedbackApi.getFeedback(filters);
      setFeedback(data);
    } catch (error) {
      setError('Failed to fetch feedback');
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
    fetchAdmins();
  }, [filters, refreshTrigger]);

  const fetchAdmins = async () => {
    try {
      const response = await adminApi.getUsersByRole('admin', 1, 100);
      setAdmins(response.users || []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedFeedback || !selectedAdminId) return;

    try {
      await feedbackApi.assignFeedback(selectedFeedback.id, selectedAdminId);
      onAssign(selectedFeedback.id, selectedAdminId);
      setSelectedAdminId('');
      setIsAssigning(false);
      setSelectedFeedback(null);
      fetchFeedback();
    } catch (error) {
      setError('Failed to assign feedback');
      console.error('Error assigning feedback:', error);
    }
  };

  const handleClose = async () => {
    if (!selectedFeedback) return;

    try {
      await feedbackApi.closeFeedback(selectedFeedback.id, responseText || undefined);
      onClose(selectedFeedback.id, responseText || undefined);
      setResponseText('');
      setIsClosing(false);
      setSelectedFeedback(null);
      fetchFeedback();
    } catch (error) {
      setError('Failed to close feedback');
      console.error('Error closing feedback:', error);
    }
  };

  const handleReopen = async (feedback: Feedback) => {
    try {
      await feedbackApi.updateFeedback(feedback.id, { status: 'open' });
      fetchFeedback();
    } catch (error) {
      setError('Failed to reopen feedback');
      console.error('Error reopening feedback:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-500/20 text-yellow-400';
      case 'assigned': return 'bg-blue-500/20 text-blue-400';
      case 'responded': return 'bg-purple-500/20 text-purple-400';
      case 'closed': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-primary">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-primary text-lg font-medium mb-2">Error Loading Feedback</p>
          <p className="text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-48">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="md:w-48">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="improvement">Improvement</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="md:w-48">
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-app">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {feedback.map((item) => (
                <tr key={item.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-primary font-medium">{item.type}</div>
                      <div className="text-secondary text-sm mt-1">
                        {item.message.substring(0, 100)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary text-sm">
                    {item.assigned_to_name || item.assigned_to_email || (item.assignedTo ? `Admin ${item.assignedTo}` : 'Unassigned')}
                  </td>
                  <td className="px-6 py-4 text-secondary text-sm">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedFeedback(item);
                          setIsAssigning(true);
                        }}
                        className="px-3 py-1.5 bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border border-app hover:border-primary/30 dark:hover:border-primary/30 rounded-lg transition-all duration-200 text-sm"
                        title="Assign"
                      >
                        Assign
                      </button>
                      {item.status === 'closed' ? (
                        <button
                          onClick={() => handleReopen(item)}
                          className="px-3 py-1.5 bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border border-app hover:border-primary/30 dark:hover:border-primary/30 rounded-lg transition-all duration-200 text-sm"
                          title="Reopen"
                        >
                          Reopen
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setSelectedFeedback(item);
                              setIsClosing(true);
                            }}
                            className="px-3 py-1.5 bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border border-app hover:border-primary/30 dark:hover:border-primary/30 rounded-lg transition-all duration-200 text-sm"
                            title="Close / Mark as Fixed"
                          >
                            Close
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {feedback.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <p className="text-secondary">No feedback found</p>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {isAssigning && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-elevated rounded-xl border border-app w-full max-w-2xl">
            <div className="p-6 border-b border-app">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Assign Feedback</h3>
                <button
                  onClick={() => {
                    setIsAssigning(false);
                    setSelectedFeedback(null);
                    setSelectedAdminId('');
                  }}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-primary font-medium mb-2">Feedback:</h4>
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-secondary">{selectedFeedback.message.substring(0, 200)}...</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Assign To Admin
                </label>
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an admin</option>
                  {admins.map(admin => (
                    <option key={admin.id} value={String(admin.id)}>
                      {admin.username || admin.email} {admin.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAssign}
                  disabled={!selectedAdminId}
                  className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed text-primary dark:text-primary border border-app hover:border-primary/30 dark:hover:border-primary/30 rounded-lg transition-all duration-200"
                >
                  Assign Feedback
                </button>
                <button
                  onClick={() => {
                    setIsAssigning(false);
                    setSelectedFeedback(null);
                    setSelectedAdminId('');
                  }}
                  className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border border-app hover:border-primary/30 dark:hover:border-primary/30 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close / Mark as Fixed Modal */}
      {isClosing && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-elevated rounded-xl border border-app w-full max-w-2xl">
            <div className="p-6 border-b border-app">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Close Feedback / Mark as Fixed</h3>
                <button
                  onClick={() => {
                    setIsClosing(false);
                    setSelectedFeedback(null);
                    setResponseText('');
                  }}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-primary font-medium mb-2">Original Feedback:</h4>
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-secondary">{selectedFeedback.message}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Resolution Message (Optional)
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                  placeholder="Describe how this was fixed or resolved (optional)..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border border-app hover:border-primary/30 dark:hover:border-primary/30 rounded-lg transition-all duration-200"
                >
                  Close Feedback
                </button>
                <button
                  onClick={() => {
                    setIsClosing(false);
                    setSelectedFeedback(null);
                    setResponseText('');
                  }}
                  className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border border-app hover:border-primary/30 dark:hover:border-primary/30 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
