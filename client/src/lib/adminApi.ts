// lib/adminApi.ts
import { API_ENDPOINTS, API_BASE_URL } from './apiConfig';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Check both localStorage and sessionStorage for token
  let token = localStorage.getItem('token');
  if (!token) {
    token = sessionStorage.getItem('token');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    };

    console.log('Making API request to:', url);
    console.log('Request config:', config);

    const response = await fetch(url, config);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        } else {
          errorData = {};
        }
      } catch {
        errorData = { error: `HTTP error! status: ${response.status}` };
      }
      
      // Handle different error response formats
      const errorMessage = errorData.error 
        || errorData.message 
        || (typeof errorData === 'string' ? errorData : null)
        || `HTTP error! status: ${response.status}`;
      
      console.error('API Error:', errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Admin API functions
export const adminApi = {
  // Dashboard statistics
  getStats: async () => {
    return apiRequest('/api/admin/stats');
  },

  // User management
  getAllUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    return apiRequest(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  getUserById: async (id: number) => {
    return apiRequest(`/api/admin/users/${id}`);
  },

  updateUserRole: async (id: number, role: 'user' | 'admin') => {
    return apiRequest(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  updateUserStatus: async (id: number, status: { is_active?: boolean; is_verified?: boolean }) => {
    return apiRequest(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
  },

  updateUserProfile: async (id: number, profileData: {
    username?: string;
    email?: string;
    profile_image?: string;
    theme_mode?: string;
  }) => {
    return apiRequest(`/api/admin/users/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  updateUserPassword: async (id: number, password: string) => {
    return apiRequest(`/api/admin/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  },

  uploadUserProfileImage: async (id: number, imageBlob: Blob) => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'profile.jpg');
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/users/profile/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload profile image');
    }

    return response.json();
  },

  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
    is_verified?: boolean;
  }) => {
    return apiRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: number) => {
    return apiRequest(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk operations
  bulkUpdateUserStatus: async (userIds: number[], status: { is_active?: boolean; is_verified?: boolean }) => {
    const promises = userIds.map(id => adminApi.updateUserStatus(id, status));
    return Promise.all(promises);
  },

  // Search and filter helpers
  searchUsers: async (searchTerm: string, filters: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    return adminApi.getAllUsers({
      search: searchTerm,
      ...filters,
    });
  },

  // Role management helpers
  getUsersByRole: async (role: string, page = 1, limit = 10) => {
    return adminApi.getAllUsers({ role, page, limit });
  },

  getUsersByStatus: async (status: string, page = 1, limit = 10) => {
    return adminApi.getAllUsers({ status, page, limit });
  },

  // Analytics helpers
  getUserStats: async () => {
    try {
      const stats = await adminApi.getStats();
      // Handle different response structures
      const statsData = stats.stats || stats || {};
      return {
        totalUsers: statsData.totalUsers || 0,
        activeUsers: statsData.activeUsers || 0,
        verifiedUsers: statsData.verifiedUsers || 0,
        adminUsers: statsData.adminUsers || 0,
        recentUsers: statsData.recentUsers || [],
      };
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      // Return default values on error
      return {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        adminUsers: 0,
        recentUsers: [],
      };
    }
  },
};

// Type definitions for better TypeScript support
export interface User {
  id: number;
  username: string;
  email: string;
  profile_image?: string;
  role: 'user' | 'admin';
  theme_mode: 'light' | 'dark';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  recentUsers: User[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export default adminApi;

