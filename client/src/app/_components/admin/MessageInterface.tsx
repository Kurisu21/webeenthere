'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supportApi, SupportMessage, SupportTicket } from '../../../lib/supportApi';
import { useAuth } from '../auth/AuthContext';

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
    if (!ticket || !newMessage.trim()) return;

    try {
      setIsSending(true);
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
    <div className="flex flex-col h-96 bg-gradient-to-br from-surface to-surface-elevated rounded-lg border border-app">
      {/* Header */}
      <div className="p-4 border-b border-app">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-primary font-medium">{ticket.ticketNumber}</h3>
            <p className="text-secondary text-sm">{ticket.subject}</p>
            <p className="text-secondary text-xs mt-1">Created by: {ticket.userName || 'Unknown User'}</p>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <p className="text-secondary">Loading messages...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isSender = isCurrentUserSender(message);
              return (
                <div
                  key={message.id}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isSender
                        ? 'bg-purple-600 text-primary'
                        : 'bg-surface text-secondary'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                    <div className={`text-xs mt-1 ${
                      isSender ? 'text-purple-200' : 'text-secondary'
                    }`}>
                      {formatDate(message.createdAt)}
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
      <div className="p-4 border-t border-app">
        {ticket.status === 'closed' ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-secondary text-sm">This ticket is closed. No further messages can be sent.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-surface border border-app rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Type your message..."
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-primary rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
