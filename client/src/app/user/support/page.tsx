'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supportApi, SupportTicket, SupportMessage } from '../../../lib/supportApi';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function SupportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    // Check if user is admin and redirect
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      router.push('/admin/dashboard');
      return;
    }
    
    fetchMyTickets();
  }, [router]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages();
    }
  }, [selectedTicket]);

  const fetchMyTickets = async () => {
    try {
      setIsLoading(true);
      const data = await supportApi.getMyTickets();
      setMyTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedTicket) return;

    try {
      const data = await supportApi.getTicketMessages(selectedTicket.id);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await supportApi.createTicket(formData);
      setSuccess('Support ticket created successfully! We will get back to you soon.');
      setFormData({ subject: '', description: '', priority: 'medium' });
      fetchMyTickets();
    } catch (error) {
      setError('Failed to create support ticket. Please try again.');
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      setIsSendingMessage(true);
      await supportApi.addMessage(selectedTicket.id, { message: newMessage });
      setNewMessage('');
      fetchMessages();
      fetchMyTickets(); // Update ticket status
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-500/20 text-yellow-400';
      case 'assigned': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400';
      case 'closed': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Support Center</h1>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Need help? Create a support ticket and our team will assist you with any questions or issues.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Ticket Form */}
          <div className="bg-surface rounded-lg border border-app p-8">
            <h2 className="text-2xl font-semibold text-primary mb-6">Create Support Ticket</h2>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
                <p className="text-green-400">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Low - General question</option>
                  <option value="medium">Medium - Minor issue</option>
                  <option value="high">High - Urgent issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                  placeholder="Please provide detailed information about your issue. Include steps to reproduce, error messages, and any other relevant details..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Ticket...' : 'Create Support Ticket'}
              </button>
            </form>

            {/* Tips */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2">Tips for faster resolution:</h3>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Provide clear, detailed descriptions</li>
                <li>• Include error messages or screenshots</li>
                <li>• Mention your browser and operating system</li>
                <li>• Describe what you were trying to do</li>
              </ul>
            </div>
          </div>

          {/* Ticket History */}
          <div className="bg-surface rounded-lg border border-app p-8">
            <h2 className="text-2xl font-semibold text-primary mb-6">My Support Tickets</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-primary">Loading tickets...</p>
                </div>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-secondary">No support tickets yet</p>
                <p className="text-gray-500 text-sm mt-2">Your support tickets will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    className={`bg-surface rounded-lg p-4 border border-app cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'border-purple-500' : 'hover:border-app'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-medium">{ticket.ticketNumber}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <span className="text-secondary text-xs">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-primary font-medium mb-2">{ticket.subject}</h3>
                    <p className="text-gray-300 text-sm">
                      {ticket.description.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Interface */}
        {selectedTicket && (
          <div className="mt-8 bg-surface rounded-lg border border-app p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary">
                Conversation - {selectedTicket.ticketNumber}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-surface-elevated rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => {
                  // For user view: user messages on right, admin messages on left
                  const isUserMessage = message.senderType === 'user';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isUserMessage
                            ? 'bg-blue-600 text-primary'
                            : 'bg-surface-elevated text-secondary'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                        <div className={`text-xs mt-1 ${
                          isUserMessage ? 'text-blue-200' : 'text-secondary'
                        }`}>
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Message Input */}
            {selectedTicket.status !== 'closed' && (
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Type your message..."
                  disabled={isSendingMessage}
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingMessage ? 'Sending...' : 'Send'}
                </button>
              </form>
            )}

            {selectedTicket.status === 'closed' && (
              <div className="text-center py-4">
                <p className="text-secondary">This ticket has been closed. You can create a new ticket if you need further assistance.</p>
              </div>
            )}
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <div className="bg-surface rounded-lg border border-app p-8">
            <h3 className="text-2xl font-semibold text-primary mb-4">Other Ways to Get Help</h3>
            <p className="text-secondary mb-6">
              Check out our help resources or join the community discussion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/user/help"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Help Center
              </a>
              <a
                href="/user/forum"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-elevated hover:bg-surface text-primary rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                Community Forum
              </a>
            </div>
          </div>
        </div>
      </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
