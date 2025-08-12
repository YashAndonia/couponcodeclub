import { CouponWithStats, SearchFilters } from '@/types/coupon';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Base API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Construct URL properly - if API_BASE_URL is empty, just use relative path
    const url = API_BASE_URL ? `${API_BASE_URL}/api${endpoint}` : `/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Coupon APIs
  async getCoupons(filters: SearchFilters = {}): Promise<ApiResponse<{
    coupons: CouponWithStats[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const params = new URLSearchParams();
    
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.submitter) params.append('submitter', filters.submitter);

    return this.request(`/coupons?${params.toString()}`);
  }

  async createCoupon(couponData: {
    brand: string;
    code: string;
    description: string;
    tags?: string[];
    link?: string;
    expiresAt?: string;
  }): Promise<ApiResponse<CouponWithStats>> {
    return this.request('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  }

  async getCoupon(id: string): Promise<ApiResponse<CouponWithStats>> {
    return this.request(`/coupons/${id}`);
  }

  async updateCoupon(id: string, couponData: Partial<{
    brand: string;
    code: string;
    description: string;
    tags: string[];
    link: string;
    expiresAt: string;
  }>): Promise<ApiResponse<CouponWithStats>> {
    return this.request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
  }

  async deleteCoupon(id: string): Promise<ApiResponse<void>> {
    return this.request(`/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  async voteCoupon(id: string, worked: boolean): Promise<ApiResponse<CouponWithStats>> {
    return this.request(`/coupons/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ worked }),
    });
  }

  // User APIs
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.request('/user/profile');
  }

  async getPublicUserProfile(username: string): Promise<ApiResponse<{
    user: any;
    coupons: CouponWithStats[];
  }>> {
    return this.request(`/user/${username}`);
  }

  // Leaderboard API
  async getLeaderboard(params: {
    limit?: number;
    period?: 'all' | 'month' | 'week';
  } = {}): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.period) searchParams.append('period', params.period);

    return this.request(`/leaderboard?${searchParams.toString()}`);
  }

  // Search API
  async search(params: {
    q: string;
    type?: 'coupons' | 'brands' | 'all';
    limit?: number;
  }): Promise<ApiResponse<{
    coupons?: CouponWithStats[];
    brands?: any[];
  }>> {
    const searchParams = new URLSearchParams();
    
    searchParams.append('q', params.q);
    if (params.type) searchParams.append('type', params.type);
    if (params.limit) searchParams.append('limit', params.limit.toString());

    return this.request(`/search?${searchParams.toString()}`);
  }

  // Brands API
  async getBrands(): Promise<ApiResponse<any[]>> {
    return this.request('/brands');
  }

  async getBrandDetails(brandName: string, filters: SearchFilters = {}): Promise<ApiResponse<{
    brand: any;
    coupons: CouponWithStats[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const params = new URLSearchParams();
    
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return this.request(`/brands/${encodeURIComponent(brandName)}?${params.toString()}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual functions for convenience - bound to maintain 'this' context
export const getCoupons = apiClient.getCoupons.bind(apiClient);
export const createCoupon = apiClient.createCoupon.bind(apiClient);
export const getCoupon = apiClient.getCoupon.bind(apiClient);
export const updateCoupon = apiClient.updateCoupon.bind(apiClient);
export const deleteCoupon = apiClient.deleteCoupon.bind(apiClient);
export const voteCoupon = apiClient.voteCoupon.bind(apiClient);
export const getUserProfile = apiClient.getUserProfile.bind(apiClient);
export const getPublicUserProfile = apiClient.getPublicUserProfile.bind(apiClient);
export const getLeaderboard = apiClient.getLeaderboard.bind(apiClient);
export const search = apiClient.search.bind(apiClient);
export const getBrands = apiClient.getBrands.bind(apiClient);
export const getBrandDetails = apiClient.getBrandDetails.bind(apiClient); 