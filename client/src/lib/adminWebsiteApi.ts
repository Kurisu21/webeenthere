/**
 * Admin Website API client
 * Handles all admin operations for website management
 */

import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from './apiConfig';

export interface AdminWebsite {
  id: number;
  title: string;
  slug: string;
  html_content: string;
  css_content: string;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
  username: string;
  email: string;
}

export interface HostingStats {
  totalWebsites: number;
  publishedWebsites: number;
  draftWebsites: number;
  totalUsers: number;
}

export interface WebsiteFilters {
  page?: number;
  limit?: number;
  status?: 'published' | 'draft';
  search?: string;
  userId?: number;
}

export interface WebsiteListResponse {
  websites: AdminWebsite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get all websites with filters and pagination
 */
export const getAllWebsites = async (filters: WebsiteFilters = {}): Promise<WebsiteListResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.userId) params.append('userId', filters.userId.toString());
  
  const queryString = params.toString();
  const url = queryString ? `/api/admin/websites?${queryString}` : '/api/admin/websites';
  
  const response = await apiGet(url);
  return response.data;
};

/**
 * Get specific website details
 */
export const getWebsiteById = async (websiteId: number): Promise<AdminWebsite> => {
  const response = await apiGet(`/api/admin/websites/${websiteId}`);
  return response.data;
};

/**
 * Update website slug
 */
export const updateWebsiteSlug = async (websiteId: number, slug: string): Promise<void> => {
  await apiPut(`/api/admin/websites/${websiteId}/slug`, { slug });
};

/**
 * Force publish website
 */
export const publishWebsite = async (websiteId: number): Promise<void> => {
  await apiPost(`/api/admin/websites/${websiteId}/publish`, {});
};

/**
 * Force unpublish website
 */
export const unpublishWebsite = async (websiteId: number): Promise<void> => {
  await apiPost(`/api/admin/websites/${websiteId}/unpublish`, {});
};

/**
 * Delete website
 */
export const deleteWebsite = async (websiteId: number): Promise<void> => {
  await apiDelete(`/api/admin/websites/${websiteId}`);
};

/**
 * Get hosting statistics
 */
export const getHostingStats = async (): Promise<HostingStats> => {
  const response = await apiGet('/api/admin/websites/stats');
  return response.data;
};
