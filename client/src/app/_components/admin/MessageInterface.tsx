'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supportApi, SupportMessage, SupportTicket } from '../../../lib/supportApi';
import { useAuth } from '../auth/AuthContext';
import { getProfileImageUrl } from '../../../lib/apiConfig';

interface MessageInterfaceProps {
  ticket: SupportTicket | null;
  onMessageSent: () => void;
}

export default function MessageInterface({ ticket, onMessageSent }: MessageInterfaceProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (ticket) {
      fetchMessages();
    }
  }, [ticket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!ticket) return;

    try {
      setIsLoading(true);
      const data = await supportApi.getTicketMessages(ticket.id, true);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !newMessage.trim() || !user) return;

    try {
      setIsSending(true);
      
      // Auto-assign ticket to admin if not already assigned
      if (user.role === 'admin' && !ticket.assignedTo) {
        await supportApi.assignTicket(ticket.id, user.id.toString());
      }
      
      await supportApi.addMessage(ticket.id, { message: newMessage });
      setNewMessage('');
      fetchMessages();
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const isCurrentUserSender = (message: SupportMessage) => {
    return user && message.senderId === user.id.toString();
  };

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-secondary">Select a ticket to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-surface rounded-lg border border-app">
      {/* Header */}
      <div className="p-4 border-b border-app">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* User Profile Picture */}
            {ticket.userId && (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-app bg-surface-elevated flex-shrink-0">
                {getProfileImageUrl(ticket.userId) ? (
                  <img
                    src={getProfileImageUrl(ticket.userId) || ''}
                    alt={ticket.userName || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const initials = (ticket.userName || 'U').substring(0, 2).toUpperCase();
                        parent.innerHTML = `<div class="w-full h-full bg-surface-elevated flex items-center justify-center"><span class="text-secondary text-xs font-medium">${initials}</span></div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                    <span className="text-secondary text-xs font-medium">
                      {(ticket.userName || 'U').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div>
              <h3 className="text-primary font-medium">{ticket.ticketNumber}</h3>
              <p className="text-secondary text-sm">{ticket.subject}</p>
              <p className="text-secondary text-xs mt-1">Chatting with: {ticket.userName || 'Unknown User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs ${
              ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' :
              ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {ticket.priority}
            </span>
            <span className={`px-2 py-1 rounded text-xs ${
              ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
              ticket.status === 'assigned' ? 'bg-blue-500/20 text-blue-400' :
              ticket.status === 'in_progress' ? 'bg-purple-500/20 text-purple-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {ticket.status}
            </span>
          </div>
        </div>
      </div>

      {/* Closed Ticket Banner */}
      {ticket.status === 'closed' && (
        <div className="bg-yellow-500/20 dark:bg-yellow-500/10 border-b border-yellow-500/30 dark:border-yellow-500/20 px-4 py-3">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-secondary">Loading messages...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isSender = isCurrentUserSender(message);
              const senderName = message.senderName || (message.senderType === 'admin' ? 'Admin' : 'User');
              const senderId = message.senderId;
              
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}
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
                  <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                    <div className="text-xs text-secondary mb-1 px-1">
                      {senderName}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isSender
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-surface-elevated dark:bg-surface text-primary dark:text-primary'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                      <div className={`text-xs mt-1 ${
                        isSender ? 'text-white/70 dark:text-black/70' : 'text-secondary dark:text-secondary'
                      }`}>
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      {ticket.status !== 'closed' && (
        <div className="p-4 border-t border-app">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Type your message..."
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="px-4 py-2 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
