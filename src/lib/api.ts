// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://sports-booking-backend-liql.onrender.com'
    : 'http://localhost:3001');

// API Client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/api/auth/refresh', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // Establishments endpoints
  async getEstablishments(params: {
    search?: string;
    sport?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    page?: number;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.request(`/establishments?${queryParams.toString()}`) as any;
    return response.data || [];
  }

  async getEstablishmentById(id: string) {
    const response = await this.request(`/establishments/${id}`) as any;
    return response.data;
  }

  async createEstablishment(data: any) {
    return this.request('/api/establishments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEstablishment(id: string, data: any) {
    return this.request(`/api/establishments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Courts endpoints
  async getCourts(establishmentId?: string) {
    const endpoint = establishmentId 
      ? `/api/courts?establishmentId=${establishmentId}`
      : '/api/courts';
    return this.request(endpoint);
  }

  async getCourt(id: string) {
    return this.request(`/api/courts/${id}`);
  }

  async getCourtAvailability(courtId: string, date: string) {
    return this.request(`/api/courts/${courtId}/availability?date=${date}`);
  }

  // Bookings endpoints
  async createBooking(data: {
    courtId: string;
    date: string;
    startTime: string;
    duration: number;
    paymentType?: string;
    participants?: any[];
  }) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings(params?: {
    userId?: string;
    establishmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getBooking(id: string) {
    return this.request(`/api/bookings/${id}`);
  }

  async cancelBooking(id: string) {
    return this.request(`/api/bookings/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Payments endpoints
  async createPayment(data: {
    bookingId: string;
    amount: number;
    paymentMethod?: string;
  }) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createSplitPayment(data: {
    bookingId: string;
    totalAmount: number;
    participants: Array<{
      email?: string;
      phone?: string;
      amount: number;
    }>;
  }) {
    return this.request('/api/payments/split', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for TypeScript
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default apiClient;
