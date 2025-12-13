import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from './apiConfig';

export interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  html_base: string;
  css_base: string;
  is_featured: boolean;
  is_active: boolean;
  is_community: boolean;
  creator_user_id?: number;
  source_website_id?: number;
  creator_username?: string;
  creator_email?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreateData {
  name: string;
  description: string;
  category: string;
}

export interface TemplateUpdateData {
  name?: string;
  description?: string;
  category?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

// Get all templates
export const getAllTemplates = async (): Promise<Template[]> => {
  const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch templates');
};

// Get community templates
export const getCommunityTemplates = async (): Promise<Template[]> => {
  const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/community`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch community templates');
};

// Get official templates
export const getOfficialTemplates = async (): Promise<Template[]> => {
  const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/official`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch official templates');
};

// Get active templates with creator info
export const getActiveTemplatesWithCreator = async (): Promise<Template[]> => {
  const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/active-with-creator`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch templates');
};

// Get templates by category
export const getTemplatesByCategory = async (category: string): Promise<Template[]> => {
  const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/category/${category}`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch templates by category');
};

// Get featured templates
export const getFeaturedTemplates = async (): Promise<Template[]> => {
  const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/featured`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch featured templates');
};

// Get single template by ID
export const getTemplateById = async (id: number): Promise<Template> => {
  const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/${id}`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch template');
};

// Share website as template (user)
export const shareWebsiteAsTemplate = async (
  websiteId: number, 
  data: TemplateCreateData
): Promise<{ id: number }> => {
  const response = await apiPost(`${API_ENDPOINTS.TEMPLATES}/from-website/${websiteId}`, data);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to share website as template');
};

// Create template (admin only)
export const createTemplate = async (data: TemplateCreateData & {
  html_base: string;
  css_base: string;
  is_featured?: boolean;
}): Promise<{ id: number }> => {
  const response = await apiPost(`${API_ENDPOINTS.TEMPLATES}`, data);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to create template');
};

// Update template (admin only)
export const updateTemplate = async (id: number, data: TemplateUpdateData): Promise<void> => {
  const response = await apiPut(`${API_ENDPOINTS.TEMPLATES}/${id}`, data);
  if (!response.success) {
    throw new Error(response.message || 'Failed to update template');
  }
};

// Toggle template active status (admin only)
export const toggleTemplateActive = async (id: number, isActive: boolean): Promise<void> => {
  const response = await apiPut(`${API_ENDPOINTS.TEMPLATES}/${id}/toggle-active`, { isActive });
  if (!response.success) {
    throw new Error(response.message || 'Failed to update template status');
  }
};

// Toggle template featured status (admin only)
export const toggleTemplateFeatured = async (id: number, isFeatured: boolean): Promise<void> => {
  const response = await apiPut(`${API_ENDPOINTS.TEMPLATES}/${id}/toggle-featured`, { isFeatured });
  if (!response.success) {
    throw new Error(response.message || 'Failed to update template featured status');
  }
};

// Delete template (admin only)
export const deleteTemplate = async (id: number): Promise<void> => {
  const response = await apiDelete(`${API_ENDPOINTS.TEMPLATES}/${id}`);
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete template');
  }
};

// Get all templates with creator info (admin only)
export const getAllTemplatesWithCreator = async (): Promise<Template[]> => {
  const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/admin/all-with-creator`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch templates');
};

// Get templates by creator (admin only)
export const getTemplatesByCreator = async (userId: number): Promise<Template[]> => {
  const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/admin/user/${userId}`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch templates by creator');
};

// Import template from HTML file (admin only)
export interface TemplateImportData {
  name: string;
  description: string;
  category: string;
  is_featured?: boolean;
}

export const importTemplateFromHTML = async (
  file: File,
  data: TemplateImportData
): Promise<{ id: number }> => {
  const formData = new FormData();
  formData.append('htmlFile', file);
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('category', data.category);
  if (data.is_featured !== undefined) {
    formData.append('is_featured', data.is_featured.toString());
  }

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_ENDPOINTS.TEMPLATES}/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to import template');
  }

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to import template');
};

// Template categories
export const TEMPLATE_CATEGORIES = [
  { id: 'portfolio', name: 'Portfolio' },
  { id: 'business', name: 'Business' },
  { id: 'personal', name: 'Personal' },
  { id: 'blog', name: 'Blog' },
  { id: 'landing', name: 'Landing Page' },
  { id: 'ecommerce', name: 'E-commerce' },
  { id: 'creative', name: 'Creative' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'modern', name: 'Modern' },
  { id: 'classic', name: 'Classic' }
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]['id'];

