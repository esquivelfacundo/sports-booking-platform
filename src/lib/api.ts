// API Configuration - Uses environment variable with fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      mode: 'cors',
      credentials: 'include',
      ...options,
    };

    // Add auth token if available (only in browser environment)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      console.log('ApiClient: Making request to:', url);
      console.log('ApiClient: Request config:', config);
      
      const response = await fetch(url, config);
      console.log('ApiClient: Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('ApiClient: Response data:', responseData);
      return responseData;
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
    country?: string;
    province?: string;
    city?: string;
    postalCode?: string;
    sports?: any[];
    preferredTimes?: string[];
    birthDate?: string;
    bio?: string;
    userType?: string;
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    console.log('ApiClient: Making login request to:', `${this.baseURL}/api/auth/login`);
    console.log('ApiClient: Login credentials:', { email: credentials.email, password: '***' });
    
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    console.log('ApiClient: Login response:', response);
    return response;
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
    city?: string;
    sport?: string;
    minRating?: number;
    maxPrice?: number;
    amenities?: string[];
    page?: number;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && 
          key !== 'latitude' && key !== 'longitude' && key !== 'radius') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.request(`/api/establishments?${queryParams.toString()}`) as any;
    return response.data || response || [];
  }

  async getEstablishmentById(id: string) {
    const response = await this.request(`/api/establishments/${id}`) as any;
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

  async getEstablishmentBookings(establishmentId: string, params?: {
    status?: string;
    date?: string;
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

    const endpoint = `/api/bookings/establishment/${establishmentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
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

  // ==================== USERS ====================
  async getUser(id: string) {
    return this.request(`/api/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserBookings(userId: string) {
    return this.request(`/api/users/${userId}/bookings`);
  }

  async getUserFavorites(userId: string) {
    return this.request(`/api/users/${userId}/favorites`);
  }

  async getUserReviews(userId: string) {
    return this.request(`/api/users/${userId}/reviews`);
  }

  // ==================== REVIEWS ====================
  async getEstablishmentReviews(establishmentId: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/reviews/establishment/${establishmentId}${query}`);
  }

  async createReview(data: {
    establishmentId: string;
    rating: number;
    comment?: string;
    courtId?: string;
    bookingId?: string;
  }) {
    return this.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReview(id: string, data: { rating?: number; comment?: string }) {
    return this.request(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReview(id: string) {
    return this.request(`/api/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== FAVORITES ====================
  async getFavorites() {
    return this.request('/api/favorites');
  }

  async addFavorite(establishmentId: string) {
    return this.request('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ establishmentId }),
    });
  }

  async removeFavorite(establishmentId: string) {
    return this.request(`/api/favorites/${establishmentId}`, {
      method: 'DELETE',
    });
  }

  async checkFavorite(establishmentId: string) {
    return this.request(`/api/favorites/check/${establishmentId}`);
  }

  async toggleFavorite(establishmentId: string) {
    return this.request(`/api/favorites/toggle/${establishmentId}`, {
      method: 'POST',
    });
  }

  // ==================== NOTIFICATIONS ====================
  async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/notifications${query}`);
  }

  async getUnreadNotificationCount() {
    return this.request('/api/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/api/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== MATCHES (Public Games) ====================
  async getMatches(params?: {
    sport?: string;
    city?: string;
    date?: string;
    status?: string;
    skillLevel?: string;
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
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/matches${query}`);
  }

  async getMatch(id: string) {
    return this.request(`/api/matches/${id}`);
  }

  async createMatch(data: {
    courtId?: string;
    establishmentId?: string;
    sport: string;
    date: string;
    startTime: string;
    endTime?: string;
    maxPlayers?: number;
    pricePerPlayer?: number;
    skillLevel?: string;
    description?: string;
  }) {
    return this.request('/api/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinMatch(id: string) {
    return this.request(`/api/matches/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveMatch(id: string) {
    return this.request(`/api/matches/${id}/leave`, {
      method: 'POST',
    });
  }

  async updateMatch(id: string, data: any) {
    return this.request(`/api/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelMatch(id: string) {
    return this.request(`/api/matches/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyMatches(type?: 'organized' | 'joined' | 'all') {
    const query = type ? `?type=${type}` : '';
    return this.request(`/api/matches/my/matches${query}`);
  }

  // ==================== TOURNAMENTS ====================
  async getTournaments(params?: {
    sport?: string;
    city?: string;
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
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/tournaments${query}`);
  }

  async getTournament(id: string) {
    return this.request(`/api/tournaments/${id}`);
  }

  async createTournament(data: {
    establishmentId: string;
    name: string;
    sport: string;
    startDate: string;
    endDate: string;
    maxTeams?: number;
    entryFee?: number;
    description?: string;
  }) {
    return this.request('/api/tournaments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerForTournament(id: string, data?: { teamName?: string; players?: string[] }) {
    return this.request(`/api/tournaments/${id}/register`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getTournamentParticipants(id: string) {
    return this.request(`/api/tournaments/${id}/participants`);
  }

  async getTournamentBrackets(id: string) {
    return this.request(`/api/tournaments/${id}/brackets`);
  }

  // ==================== ADMIN ====================
  async adminGetEstablishments(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/admin/establishments${query}`);
  }

  async adminApproveEstablishment(id: string) {
    return this.request(`/api/admin/establishments/${id}/approve`, {
      method: 'PUT',
    });
  }

  async adminRejectEstablishment(id: string, reason?: string) {
    return this.request(`/api/admin/establishments/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async adminDeleteEstablishment(id: string) {
    return this.request(`/api/admin/establishments/${id}`, {
      method: 'DELETE',
    });
  }

  async adminGetUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/admin/users${query}`);
  }

  async adminSuspendUser(id: string, reason?: string) {
    return this.request(`/api/admin/users/${id}/suspend`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async adminActivateUser(id: string) {
    return this.request(`/api/admin/users/${id}/activate`, {
      method: 'PUT',
    });
  }

  async adminDeleteUser(id: string) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async adminGetStats() {
    return this.request('/api/admin/stats');
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
