'use client';

import React, { useState, useEffect } from 'react';
import { supportApi, SupportTicket } from '../../../lib/supportApi';

interface TicketListProps {
  onAssign: (ticketId: string, adminId: string) => void;
  onClose: (ticketId: string, resolution?: string) => void;
  onSelectTicket: (ticket: SupportTicket) => void;
  refreshTrigger?: number;
}

export default function TicketList({ onAssign, onClose, onSelectTicket, refreshTrigger }: TicketListProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [resolution, setResolution] = useState('');

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supportApi.getTickets(filters);
      setTickets(data);
    } catch (error) {
      setError('Failed to fetch tickets');
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters, refreshTrigger]);

  const handleClose = async () => {
    if (!selectedTicket) return;

    try {
      await supportApi.closeTicket(selectedTicket.id, resolution || undefined);
      onClose(selectedTicket.id, resolution || undefined);
      setResolution('');
      setIsClosing(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      setError('Failed to close ticket');
      console.error('Error closing ticket:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-500/20 text-yellow-400';
      case 'assigned': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400';
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading tickets...</p>
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
          <p className="text-primary text-lg font-medium mb-2">Error Loading Tickets</p>
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
            className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="md:w-48">
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-4 py-2 bg-surface border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-surface-elevated rounded-lg border border-app overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-app">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  User
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
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-primary font-medium">{ticket.ticketNumber}</div>
                      <div className="text-secondary text-sm mt-1">
                        {ticket.subject}
                      </div>
                      <div className="text-secondary text-xs mt-1">
                        {ticket.description.substring(0, 80)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-secondary text-sm">
                      {ticket.userName || 'Unknown User'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary text-sm">
                    {ticket.assignedTo || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-secondary text-sm">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectTicket(ticket)}
                        className="text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors"
                        title="View ticket"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setIsClosing(true);
                        }}
                        className="text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors"
                        title="Close ticket"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-secondary">No tickets found</p>
          </div>
        )}
      </div>

      {/* Close Ticket Modal */}
      {isClosing && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-elevated rounded-xl border border-app w-full max-w-2xl">
            <div className="p-6 border-b border-app">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Close Ticket</h3>
                <button
                  onClick={() => {
                    setIsClosing(false);
                    setSelectedTicket(null);
                    setResolution('');
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
                <h4 className="text-primary font-medium mb-2">Ticket: {selectedTicket.ticketNumber}</h4>
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-secondary">{selectedTicket.subject}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Resolution (Optional)
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                  placeholder="Describe how the issue was resolved..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black rounded-lg transition-all duration-200 font-medium"
                >
                  Close Ticket
                </button>
                <button
                  onClick={() => {
                    setIsClosing(false);
                    setSelectedTicket(null);
                    setResolution('');
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
