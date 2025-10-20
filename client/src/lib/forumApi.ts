import { API_BASE_URL, apiCall, apiPost, apiGet, apiPut } from './apiConfig';

// Types
export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  threadCount: number;
  lastActivity: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  views: number;
  replies: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumReply {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  likes: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadListResponse {
  threads: ForumThread[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReplyListResponse {
  replies: ForumReply[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ForumStats {
  totalCategories: number;
  totalThreads: number;
  totalReplies: number;
  totalViews: number;
  totalLikes: number;
  averageRepliesPerThread: string;
}

// API Client
class ForumApi {
  private baseUrl = '/api/forum';

  // Categories
  async getCategories(): Promise<ForumCategory[]> {
    const data = await apiGet(`${API_BASE_URL}/api/forum/categories`);
    return data.data;
  }

  async createCategory(category: {
    name: string;
    description: string;
    icon?: string;
    color?: string;
  }): Promise<ForumCategory> {
    const data = await apiPost(`${API_BASE_URL}/api/forum/categories`, category);
    return data.data;
  }

  async updateCategory(id: string, category: Partial<ForumCategory>): Promise<ForumCategory> {
    const data = await apiPut(`${API_BASE_URL}/api/forum/categories/${id}`, category);
    return data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await apiCall(`${API_BASE_URL}/api/forum/categories/${id}`, { method: 'DELETE' });
  }

  // Threads
  async getThreads(params?: {
    categoryId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<ThreadListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const data = await apiGet(`${API_BASE_URL}/api/forum/threads?${queryParams}`);
    return data.data;
  }

  async getThread(id: string): Promise<ForumThread> {
    const data = await apiGet(`${API_BASE_URL}/api/forum/threads/${id}`);
    return data.data;
  }

  async createThread(thread: {
    categoryId: string;
    title: string;
    content: string;
    tags?: string[];
  }): Promise<ForumThread> {
    const data = await apiPost(`${API_BASE_URL}/api/forum/threads`, thread);
    return data.data;
  }

  async updateThread(id: string, thread: Partial<ForumThread>): Promise<ForumThread> {
    const data = await apiPut(`${API_BASE_URL}/api/forum/threads/${id}`, thread);
    return data.data;
  }

  async deleteThread(id: string): Promise<void> {
    await apiCall(`${API_BASE_URL}/api/forum/threads/${id}`, { method: 'DELETE' });
  }

  async searchThreads(query: string, limit?: number): Promise<ForumThread[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (limit) queryParams.append('limit', limit.toString());

    const data = await apiGet(`${API_BASE_URL}/api/forum/search?${queryParams}`);
    return data.data;
  }

  async moderateThread(id: string, action: string, reason?: string): Promise<any> {
    const data = await apiPost(`${API_BASE_URL}/api/forum/threads/${id}/moderate`, { action, reason });
    return data.data;
  }

  // Replies
  async getReplies(threadId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ReplyListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const data = await apiGet(`${API_BASE_URL}/api/forum/threads/${threadId}/replies?${queryParams}`);
    return data.data;
  }

  async createReply(threadId: string, content: string): Promise<ForumReply> {
    const data = await apiPost(`${API_BASE_URL}/api/forum/threads/${threadId}/replies`, { content });
    return data.data;
  }

  async updateReply(id: string, reply: Partial<ForumReply>): Promise<ForumReply> {
    const data = await apiPut(`${API_BASE_URL}/api/forum/replies/${id}`, reply);
    return data.data;
  }

  async deleteReply(id: string): Promise<void> {
    await apiCall(`${API_BASE_URL}/api/forum/replies/${id}`, { method: 'DELETE' });
  }

  // Statistics
  async getStats(): Promise<ForumStats> {
    const data = await apiGet(`${API_BASE_URL}/api/forum/stats`);
    return data.data;
  }
}

export const forumApi = new ForumApi();





