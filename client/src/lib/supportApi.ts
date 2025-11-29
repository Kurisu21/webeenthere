import { API_BASE_URL, apiCall, apiPost, apiGet, apiPut } from './apiConfig';

// Types
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName?: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  attachments: string[];
  status: 'open' | 'assigned' | 'in_progress' | 'closed';
  assignedTo: string | null;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  resolution?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  message: string;
  senderId: string;
  senderType: 'user' | 'admin';
  senderName?: string;
  attachments: string[];
  isInternal: boolean;
  createdAt: string;
}

export interface TicketAssignment {
  id: string;
  ticketId: string;
  adminId: string;
  assignedAt: string;
}

export interface SupportStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  closed: number;
  byPriority: Record<string, number>;
  averageResolutionTime: number;
  averageResponseTime: number;
}

export interface AdminWorkload {
  assignedTickets: number;
  openTickets: number;
  inProgressTickets: number;
}

// API Client
class SupportApi {
  private baseUrl = '/api/support';

  // Tickets
  async getTickets(params?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    userId?: string;
  }): Promise<SupportTicket[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params?.userId) queryParams.append('userId', params.userId);

    const data = await apiGet(`${API_BASE_URL}/api/support/tickets?${queryParams}`);
    return data.data;
  }

  async getMyTickets(): Promise<SupportTicket[]> {
    const data = await apiGet(`${API_BASE_URL}/api/support/tickets/my`);
    return data.data;
  }

  async getTicket(id: string): Promise<SupportTicket> {
    const data = await apiGet(`${API_BASE_URL}/api/support/tickets/${id}`);
    return data.data;
  }

  async createTicket(ticket: {
    subject: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    attachments?: string[];
  }): Promise<SupportTicket> {
    const data = await apiPost(`${API_BASE_URL}/api/support/tickets`, ticket);
    return data.data;
  }

  async updateTicket(id: string, ticket: Partial<SupportTicket>): Promise<SupportTicket> {
    const data = await apiPut(`${API_BASE_URL}/api/support/tickets/${id}`, ticket);
    return data.data;
  }

  async deleteTicket(id: string): Promise<void> {
    await apiCall(`${API_BASE_URL}/api/support/tickets/${id}`, { method: 'DELETE' });
  }

  // Admin operations
  async assignTicket(id: string, adminId: string): Promise<SupportTicket> {
    const data = await apiPost(`${API_BASE_URL}/api/support/tickets/${id}/assign`, { adminId });
    return data.data;
  }

  async closeTicket(id: string, resolution?: string): Promise<SupportTicket> {
    const data = await apiPost(`${API_BASE_URL}/api/support/tickets/${id}/close`, { resolution });
    return data.data;
  }

  // Messages
  async getTicketMessages(id: string, includeInternal?: boolean): Promise<SupportMessage[]> {
    const queryParams = new URLSearchParams();
    if (includeInternal) queryParams.append('includeInternal', 'true');

    const data = await apiGet(`${API_BASE_URL}/api/support/tickets/${id}/messages?${queryParams}`);
    return data.data;
  }

  async addMessage(id: string, message: {
    message: string;
    attachments?: string[];
  }): Promise<SupportMessage> {
    const data = await apiPost(`${API_BASE_URL}/api/support/tickets/${id}/messages`, message);
    return data.data;
  }

  // Statistics
  async getStats(): Promise<SupportStats> {
    const data = await apiGet(`${API_BASE_URL}/api/support/stats`);
    return data.data;
  }

  async getRecentTickets(limit?: number): Promise<SupportTicket[]> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());

    const data = await apiGet(`${API_BASE_URL}/api/support/recent?${queryParams}`);
    return data.data;
  }

  async bulkUpdateTickets(ticketIds: string[], updateData: Partial<SupportTicket>): Promise<SupportTicket[]> {
    const data = await apiPost(`${API_BASE_URL}/api/support/bulk/update`, { ticketIds, updateData });
    return data.data;
  }

  // Assignments
  async getTicketAssignments(id: string): Promise<TicketAssignment[]> {
    const data = await apiGet(`${API_BASE_URL}/api/support/tickets/${id}/assignments`);
    return data.data;
  }

  async getAdminWorkload(adminId: string): Promise<AdminWorkload> {
    const data = await apiGet(`${API_BASE_URL}/api/support/admin/${adminId}/workload`);
    return data.data;
  }
}

export const supportApi = new SupportApi();