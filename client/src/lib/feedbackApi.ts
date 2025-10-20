import { API_BASE_URL, apiCall, apiPost, apiGet, apiPut } from './apiConfig';

// Types
export interface Feedback {
  id: string;
  userId: string;
  type: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  attachments: string[];
  status: 'open' | 'assigned' | 'responded' | 'closed';
  assignedTo: string | null;
  response: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  adminId: string;
  response: string;
  createdAt: string;
}

export interface FeedbackStats {
  total: number;
  open: number;
  assigned: number;
  responded: number;
  closed: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  averageResponseTime: number;
}

// API Client
class FeedbackApi {
  private baseUrl = '/api/feedback';

  // Feedback
  async getFeedback(params?: {
    status?: string;
    type?: string;
    priority?: string;
    assignedTo?: string;
    userId?: string;
  }): Promise<Feedback[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params?.userId) queryParams.append('userId', params.userId);

    const data = await apiGet(`${API_BASE_URL}/api/feedback?${queryParams}`);
    return data.data;
  }

  async getMyFeedback(): Promise<Feedback[]> {
    const data = await apiGet(`${API_BASE_URL}/api/feedback/my`);
    return data.data;
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    const data = await apiGet(`${API_BASE_URL}/api/feedback/${id}`);
    return data.data;
  }

  async createFeedback(feedback: {
    type: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
    attachments?: string[];
  }): Promise<Feedback> {
    const data = await apiPost(`${API_BASE_URL}/api/feedback`, feedback);
    return data.data;
  }

  async updateFeedback(id: string, feedback: Partial<Feedback>): Promise<Feedback> {
    const data = await apiPut(`${API_BASE_URL}/api/feedback/${id}`, feedback);
    return data.data;
  }

  async deleteFeedback(id: string): Promise<void> {
    await apiCall(`${API_BASE_URL}/api/feedback/${id}`, { method: 'DELETE' });
  }

  // Admin operations
  async assignFeedback(id: string, adminId: string): Promise<Feedback> {
    const data = await apiPost(`${API_BASE_URL}/api/feedback/${id}/assign`, { adminId });
    return data.data;
  }

  async closeFeedback(id: string, response?: string): Promise<Feedback> {
    const data = await apiPost(`${API_BASE_URL}/api/feedback/${id}/close`, { response });
    return data.data;
  }

  async addResponse(id: string, response: string): Promise<{ feedback: Feedback; response: FeedbackResponse }> {
    const data = await apiPost(`${API_BASE_URL}/api/feedback/${id}/response`, { response });
    return data.data;
  }

  async getFeedbackResponses(id: string): Promise<FeedbackResponse[]> {
    const data = await apiGet(`${API_BASE_URL}/api/feedback/${id}/responses`);
    return data.data;
  }

  async getStats(): Promise<FeedbackStats> {
    const data = await apiGet(`${API_BASE_URL}/api/feedback/stats/overview`);
    return data.data;
  }

  async getRecentFeedback(limit?: number): Promise<Feedback[]> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());

    const data = await apiGet(`${API_BASE_URL}/api/feedback/recent/list?${queryParams}`);
    return data.data;
  }

  async bulkUpdateFeedback(feedbackIds: string[], updateData: Partial<Feedback>): Promise<Feedback[]> {
    const data = await apiPost(`${API_BASE_URL}/api/feedback/bulk/update`, { feedbackIds, updateData });
    return data.data;
  }
}

export const feedbackApi = new FeedbackApi();





