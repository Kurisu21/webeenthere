'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supportApi, SupportTicket, SupportMessage } from '../../../lib/supportApi';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import { getProfileImageUrl } from '../../../lib/apiConfig';
import { useAuth } from '../../_components/auth/AuthContext';

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuth();
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
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="low">Low - General question</option>
                  <option value="medium">Medium - Minor issue</option>
                  <option value="high">High - Urgent issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                  placeholder="Please provide detailed information about your issue. Include steps to reproduce, error messages, and any other relevant details..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
                      selectedTicket?.id === ticket.id ? 'border-primary/50 dark:border-primary/50' : 'hover:border-primary/30 dark:hover:border-primary/30'
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-app">
              <div className="flex items-center gap-3">
                {/* Admin/Support Profile Picture */}
                {selectedTicket.assignedTo && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-app bg-surface-elevated flex-shrink-0">
                    {getProfileImageUrl(selectedTicket.assignedTo) ? (
                      <img
                        src={getProfileImageUrl(selectedTicket.assignedTo) || ''}
                        alt={selectedTicket.assignedToName || 'Support'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const initials = (selectedTicket.assignedToName || 'S').substring(0, 2).toUpperCase();
                            parent.innerHTML = `<div class="w-full h-full bg-surface-elevated flex items-center justify-center"><span class="text-secondary text-xs font-medium">${initials}</span></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                        <span className="text-secondary text-xs font-medium">
                          {(selectedTicket.assignedToName || 'S').substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-primary">
                    Conversation - {selectedTicket.ticketNumber}
                  </h2>
                  <p className="text-secondary text-sm mt-1">
                    {selectedTicket.assignedToName 
                      ? `Chatting with: ${selectedTicket.assignedToName}` 
                      : 'Waiting for support team...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>
            </div>

            {/* Closed Ticket Banner */}
            {selectedTicket.status === 'closed' && (
              <div className="bg-yellow-500/20 dark:bg-yellow-500/10 border border-yellow-500/30 dark:border-yellow-500/20 rounded-lg px-4 py-3 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-yellow-400 dark:text-yellow-500 text-sm font-medium">
                    This ticket is closed. No further messages can be sent.
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="bg-surface-elevated rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => {
                  // For user view: user messages on right, admin messages on left
                  const isUserMessage = message.senderType === 'user';
                  const senderName = message.senderName || (message.senderType === 'admin' ? 'Support' : user?.username || 'You');
                  const senderId = message.senderId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Profile Picture */}
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-app bg-surface-elevated flex-shrink-0">
                        {senderId && getProfileImageUrl(senderId) ? (
                          <img
                            src={getProfileImageUrl(senderId) || ''}
                            alt={senderName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const initials = senderName.substring(0, 2).toUpperCase();
                                parent.innerHTML = `<div class="w-full h-full bg-surface-elevated flex items-center justify-center"><span class="text-secondary text-xs font-medium">${initials}</span></div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                            <span className="text-secondary text-xs font-medium">
                              {senderName.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className={`flex flex-col ${isUserMessage ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                        <div className="text-xs text-secondary mb-1 px-1">
                          {senderName}
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isUserMessage
                              ? 'bg-black dark:bg-white text-white dark:text-black'
                              : 'bg-surface text-primary dark:text-primary'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                          <div className={`text-xs mt-1 ${
                            isUserMessage ? 'text-white/70 dark:text-black/70' : 'text-secondary dark:text-secondary'
                          }`}>
                            {formatDate(message.createdAt)}
                          </div>
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
                  className="flex-1 px-4 py-3 bg-surface-elevated border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Type your message..."
                  disabled={isSendingMessage}
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !newMessage.trim()}
                  className="px-6 py-3 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSendingMessage ? 'Sending...' : 'Send'}
                </button>
              </form>
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black rounded-lg transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Help Center
              </a>
              <a
                href="/user/forum"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border border-app hover:border-primary/30 dark:hover:border-primary/30 rounded-lg transition-all duration-200"
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
