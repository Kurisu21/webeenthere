import { API_BASE_URL, apiCall, apiPost, apiGet, apiPut } from './apiConfig';

// Types
export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  content: string;
  authorId: string;
  tags?: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  userVote?: boolean | null; // true = helpful, false = not helpful, null = no vote
  categoryName?: string; // Category name from database join
  authorName?: string; // Author name from database join
}

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse {
  articles: HelpArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HelpStats {
  totalArticles: number;
  totalCategories: number;
  totalViews: number;
  totalHelpful?: number;
  totalNotHelpful?: number;
  averageRating: string;
}

// API Client
class HelpCenterApi {
  private baseUrl = '/api/help';

  // Articles
  async getArticles(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ArticleListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const data = await apiGet(`${API_BASE_URL}/api/help/articles?${queryParams}`);
    return data.data;
  }

  async getArticle(id: string): Promise<HelpArticle> {
    const data = await apiGet(`${API_BASE_URL}/api/help/articles/${id}`);
    return data.data;
  }

  async createArticle(article: {
    category: string;
    title: string;
    content: string;
    tags?: string[];
    isPublished?: boolean;
  }): Promise<HelpArticle> {
    const data = await apiPost(`${API_BASE_URL}/api/help/articles`, article);
    return data.data;
  }

  async updateArticle(id: string, article: Partial<HelpArticle>): Promise<HelpArticle> {
    const data = await apiPut(`${API_BASE_URL}/api/help/articles/${id}`, article);
    return data.data;
  }

  async deleteArticle(id: string): Promise<void> {
    await apiCall(`${API_BASE_URL}/api/help/articles/${id}`, { method: 'DELETE' });
  }

  async searchArticles(query: string, limit?: number): Promise<HelpArticle[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (limit) queryParams.append('limit', limit.toString());

    const data = await apiGet(`${API_BASE_URL}/api/help/search?${queryParams}`);
    return data.data;
  }

  async rateArticle(id: string, isHelpful: boolean): Promise<HelpArticle> {
    const data = await apiPost(`${API_BASE_URL}/api/help/articles/${id}/rate`, { isHelpful });
    return data.data;
  }

  // Categories
  async getCategories(): Promise<HelpCategory[]> {
    const data = await apiGet(`${API_BASE_URL}/api/help/categories`);
    return data.data;
  }

  async createCategory(category: {
    name: string;
    description: string;
    icon?: string;
  }): Promise<HelpCategory> {
    const data = await apiPost(`${API_BASE_URL}/api/help/categories`, category);
    return data.data;
  }

  async updateCategory(id: string, category: Partial<HelpCategory>): Promise<HelpCategory> {
    const data = await apiPut(`${API_BASE_URL}/api/help/categories/${id}`, category);
    return data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await apiCall(`${API_BASE_URL}/api/help/categories/${id}`, { method: 'DELETE' });
  }

  // Statistics
  async getStats(): Promise<HelpStats> {
    const data = await apiGet(`${API_BASE_URL}/api/help/stats`);
    return data.data;
  }
}

export const helpCenterApi = new HelpCenterApi();





