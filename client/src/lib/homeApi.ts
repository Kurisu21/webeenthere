import { apiGet } from './apiConfig';

export interface PublicStats {
  totalWebsites: number;
  publishedWebsites: number;
  totalUsers: number;
  totalTemplates: number;
}

class HomeApi {
  async getPublicStats(): Promise<PublicStats> {
    try {
      const data = await apiGet('/api/websites/public/stats');
      if (data && data.success && data.data) {
        return data.data;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      // Re-throw with more context for better error handling
      if (error?.isNetworkError) {
        const networkError: any = new Error('Network error: Backend server is not running or not accessible. Please ensure the backend server is running on http://localhost:5000');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  }
}

export const homeApi = new HomeApi();

