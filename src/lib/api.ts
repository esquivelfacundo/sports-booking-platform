// API Configuration - Uses environment variable with smart fallback
const getApiBaseUrl = () => {
  // If env var is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser, detect if we're in production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'www.miscanchas.com' || hostname === 'miscanchas.com') {
      // In production, API is served from same domain via Vercel rewrites
      return window.location.origin;
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:8001';
};

const API_BASE_URL = getApiBaseUrl();

// Rate limit error class for specific handling
export class RateLimitError extends Error {
  retryAfter: number;
  
  constructor(message: string, retryAfter: number = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Event emitter for rate limit notifications
type RateLimitListener = (retryAfter: number, attemptNumber: number) => void;
const rateLimitListeners: Set<RateLimitListener> = new Set();

export const onRateLimitHit = (listener: RateLimitListener) => {
  rateLimitListeners.add(listener);
  return () => rateLimitListeners.delete(listener);
};

const notifyRateLimitHit = (retryAfter: number, attemptNumber: number) => {
  rateLimitListeners.forEach(listener => listener(retryAfter, attemptNumber));
};

// API Client class
class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  
  // Rate limit retry configuration
  private readonly maxRetries: number = 3;
  private readonly baseDelayMs: number = 1000; // 1 second base delay

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  // Exponential backoff delay calculator
  private getRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 1s, 2s, 4s, etc.
    return this.baseDelayMs * Math.pow(2, attemptNumber);
  }
  
  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Redirect to appropriate login page based on user type
  private redirectToLogin() {
    if (typeof window !== 'undefined') {
      const userType = localStorage.getItem('user_type');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_data');
      
      // Redirect based on user type or current path
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/establecimientos') || userType === 'admin') {
        window.location.href = '/establecimientos/login';
      } else {
        window.location.href = '/login';
      }
    }
  }

  // Try to refresh the access token
  private async tryRefreshToken(): Promise<boolean> {
    // If already refreshing, wait for that to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        
        if (!refreshToken) {
          console.log('ApiClient: No refresh token available');
          return false;
        }

        const response = await fetch(`${this.baseURL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          console.log('ApiClient: Refresh token request failed');
          return false;
        }

        const data = await response.json();
        
        if (data.tokens?.accessToken) {
          localStorage.setItem('auth_token', data.tokens.accessToken);
          if (data.tokens.refreshToken) {
            localStorage.setItem('refresh_token', data.tokens.refreshToken);
          }
          console.log('ApiClient: Token refreshed successfully');
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('ApiClient: Error refreshing token:', error);
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized: boolean = true,
    rateLimitRetryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if this is a public endpoint (no auth required)
    const isPublicEndpoint = endpoint.includes('/public/') || 
                            endpoint.includes('/by-payment/') || 
                            endpoint.includes('/by-reference/') ||
                            endpoint.includes('/qr.png') ||
                            endpoint.includes('/qr?') ||
                            endpoint.match(/\/bookings\/[^\/]+\/qr/);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'include',
      ...options,
    };

    // Add auth token if available (only in browser environment and not public endpoint)
    if (typeof window !== 'undefined' && !isPublicEndpoint) {
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
        
        // Handle 401 Unauthorized - try to refresh token (but not for public endpoints)
        if (response.status === 401 && retryOnUnauthorized && !endpoint.includes('/auth/') && !isPublicEndpoint) {
          console.log('ApiClient: Token expired, attempting refresh...');
          const refreshed = await this.tryRefreshToken();
          
          if (refreshed) {
            // Retry the original request with new token
            return this.request<T>(endpoint, options, false);
          } else {
            // Refresh failed, redirect to login
            console.log('ApiClient: Token refresh failed, redirecting to login');
            this.redirectToLogin();
            throw new Error('Session expired. Please login again.');
          }
        }
        
        // For public endpoints, don't redirect on 401, just throw error
        if (isPublicEndpoint && response.status === 401) {
          throw new Error('Unauthorized access to public endpoint');
        }
        
        // Handle 429 Too Many Requests - retry with exponential backoff
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          
          if (rateLimitRetryCount < this.maxRetries) {
            const delayMs = this.getRetryDelay(rateLimitRetryCount);
            console.log(`ApiClient: Rate limited. Retry ${rateLimitRetryCount + 1}/${this.maxRetries} after ${delayMs}ms`);
            
            // Notify listeners about rate limit hit
            notifyRateLimitHit(retryAfter, rateLimitRetryCount + 1);
            
            await this.sleep(delayMs);
            return this.request<T>(endpoint, options, retryOnUnauthorized, rateLimitRetryCount + 1);
          } else {
            // Max retries reached, throw specific error
            console.error('ApiClient: Rate limit max retries reached');
            notifyRateLimitHit(retryAfter, rateLimitRetryCount + 1);
            throw new RateLimitError(
              errorData.error || 'Demasiadas solicitudes. Por favor, espera un momento.',
              retryAfter
            );
          }
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('ApiClient: Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generic HTTP methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
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
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
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

  async getEstablishmentBySlug(slug: string) {
    const response = await this.request(`/api/establishments/slug/${slug}`) as any;
    return response.establishment || response.data;
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

  async getMyEstablishments() {
    return this.request('/api/establishments/me');
  }

  // Courts endpoints
  async getCourts(establishmentId?: string) {
    const endpoint = establishmentId 
      ? `/api/courts?establishmentId=${establishmentId}`
      : '/api/courts';
    return this.request(endpoint);
  }

  async getCourtsByEstablishment(establishmentId: string) {
    return this.request(`/api/courts/establishment/${establishmentId}`);
  }

  async getCourt(id: string) {
    return this.request(`/api/courts/${id}`);
  }

  async getCourtAvailability(courtId: string, date: string, duration: number = 60) {
    return this.request(`/api/courts/${courtId}/availability?date=${date}&duration=${duration}`);
  }

  async createCourt(data: {
    establishmentId: string;
    name: string;
    sport?: string;
    surface?: string;
    isIndoor?: boolean;
    capacity?: number;
    pricePerHour?: number;
    pricePerHour90?: number;
    pricePerHour120?: number;
    amenities?: string[];
    description?: string;
  }) {
    return this.request('/api/courts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourt(id: string, data: any) {
    return this.request(`/api/courts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourt(id: string) {
    return this.request(`/api/courts/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings endpoints
  async createBooking(data: {
    courtId: string;
    date: string;
    startTime: string;
    endTime?: string;
    duration: number;
    totalAmount?: number;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    paymentType?: string;
    notes?: string;
    participants?: any[];
    depositAmount?: number;
    depositMethod?: string;
  }) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkRecurringAvailability(data: {
    courtId: string;
    dates: string[];
    startTime: string;
    duration: number;
    sport?: string;
  }) {
    return this.request('/api/bookings/check-recurring-availability', {
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
    startDate?: string;
    endDate?: string;
    futureOnly?: boolean;
    clientId?: string;
    courtId?: string;
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

  async exportBookingsToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
    courtId?: string;
    status?: string;
    clientName?: string;
    paymentMethod?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/bookings/export?${queryParams.toString()}`;
    
    // Get the token
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Create a temporary link to download the file
    const url = `${this.baseURL}${endpoint}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    
    // Add authorization header via fetch
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export bookings');
    }
    
    // Get the blob and create download link
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    link.href = blobUrl;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'reservas.csv';
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }

  // Generic CSV export helper
  private async downloadCSV(endpoint: string, defaultFilename: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      throw new Error('No token provided');
    }
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export');
    }
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    link.download = filenameMatch ? filenameMatch[1] : defaultFilename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }

  async exportCashRegistersToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    status?: 'open' | 'closed';
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/cash-registers/export?${queryParams.toString()}`, 'turnos_caja.csv');
  }

  async exportExpensesToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    userId?: string;
    origin?: 'cash_register' | 'administration';
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/expenses/establishment/${params.establishmentId}/export?${queryParams.toString()}`, 'gastos.csv');
  }

  async exportOrdersToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
    orderType?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/orders/export?${queryParams.toString()}`, 'ventas.csv');
  }

  async exportInventoryToCSV(params: {
    establishmentId: string;
    categoryId?: string;
    stockStatus?: 'low' | 'critical';
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/products/export?${queryParams.toString()}`, 'inventario.csv');
  }

  // Phase 2 exports
  async exportCashMovementsToCSV(params: {
    establishmentId: string;
    cashRegisterId?: string;
    type?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/cash-register-movements/export?${queryParams.toString()}`, 'movimientos_caja.csv');
  }

  async exportIncomeByMethodToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/cash-register-movements/income-by-method/export?${queryParams.toString()}`, 'ingresos_metodo_pago.csv');
  }

  async exportSalesByProductToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/orders/sales-by-product/export?${queryParams.toString()}`, 'ventas_por_producto.csv');
  }

  async exportClientsToCSV(params: {
    establishmentId: string;
    hasDebt?: boolean;
    isActive?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params.hasDebt !== undefined) queryParams.append('hasDebt', params.hasDebt.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    await this.downloadCSV(`/api/clients/establishment/${params.establishmentId}/export?${queryParams.toString()}`, 'clientes.csv');
  }

  async exportCurrentAccountsToCSV(params: {
    establishmentId: string;
    accountType?: string;
    hasBalance?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params.accountType) queryParams.append('accountType', params.accountType);
    if (params.hasBalance !== undefined) queryParams.append('hasBalance', params.hasBalance.toString());
    await this.downloadCSV(`/api/current-accounts/establishment/${params.establishmentId}/export?${queryParams.toString()}`, 'cuentas_corrientes.csv');
  }

  // Phase 3 exports
  async exportCourtOccupancyToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/analytics/court-occupancy/export?${queryParams.toString()}`, 'ocupacion_canchas.csv');
  }

  async exportTopClientsToCSV(params: {
    establishmentId: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('establishmentId', params.establishmentId);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    await this.downloadCSV(`/api/analytics/top-clients/export?${queryParams.toString()}`, 'clientes_frecuentes.csv');
  }

  async exportPeakHoursToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/analytics/peak-hours/export?${queryParams.toString()}`, 'horarios_pico.csv');
  }

  async exportExpensesByCategoryToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/expenses/by-category/export?${queryParams.toString()}`, 'gastos_por_categoria.csv');
  }

  async exportPurchasesToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
    supplierId?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/stock-movements/purchases/export?${queryParams.toString()}`, 'compras_proveedores.csv');
  }

  // Phase 4 exports
  async exportStockMovementsToCSV(params: {
    establishmentId: string;
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/stock-movements/export?${queryParams.toString()}`, 'movimientos_stock.csv');
  }

  async exportByWeekdayToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/analytics/by-weekday/export?${queryParams.toString()}`, 'rendimiento_por_dia.csv');
  }

  async exportRevenueByCourtToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/analytics/revenue-by-court/export?${queryParams.toString()}`, 'ingresos_por_cancha.csv');
  }

  async exportAccountMovementsToCSV(params: {
    establishmentId: string;
    accountId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/current-accounts/movements/export?${queryParams.toString()}`, 'movimientos_cuenta_corriente.csv');
  }

  async exportLowStockProductsToCSV(params: {
    establishmentId: string;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('establishmentId', params.establishmentId);
    await this.downloadCSV(`/api/products/alerts/low-stock/export?${queryParams.toString()}`, 'productos_stock_bajo.csv');
  }

  async exportWasteToCSV(params: {
    establishmentId: string;
    productId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/stock-movements/waste/export?${queryParams.toString()}`, 'mermas.csv');
  }

  async exportInactiveClientsToCSV(params: {
    establishmentId: string;
    minDaysInactive?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params.minDaysInactive) queryParams.append('minDaysInactive', params.minDaysInactive.toString());
    await this.downloadCSV(`/api/clients/establishment/${params.establishmentId}/inactive/export?${queryParams.toString()}`, 'clientes_inactivos.csv');
  }

  async exportPendingDebtsToCSV(params: {
    establishmentId: string;
    minAmount?: number;
    minDays?: number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('establishmentId', params.establishmentId);
    if (params.minAmount) queryParams.append('minAmount', params.minAmount.toString());
    if (params.minDays) queryParams.append('minDays', params.minDays.toString());
    await this.downloadCSV(`/api/current-accounts/debts/export?${queryParams.toString()}`, 'deudas_pendientes.csv');
  }

  async exportRecurringBookingsToCSV(params: {
    establishmentId: string;
    status?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/recurring-bookings/export?${queryParams.toString()}`, 'reservas_recurrentes.csv');
  }

  async exportNoShowBookingsToCSV(params: {
    establishmentId: string;
    courtId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/bookings/no-show/export?${queryParams.toString()}`, 'reservas_no_show.csv');
  }

  async exportFinancialSummaryToCSV(params: {
    establishmentId: string;
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/finance/summary/export?${queryParams.toString()}`, 'resumen_financiero.csv');
  }

  async exportPendingPaymentsToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/finance/pending-payments/export?${queryParams.toString()}`, 'pagos_pendientes.csv');
  }

  async exportDailyCashClosingToCSV(params: {
    establishmentId: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/cash-registers/daily-closing/export?${queryParams.toString()}`, 'cierre_caja_diario.csv');
  }

  async exportExpensesBySupplierToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/expenses/by-supplier/export?${queryParams.toString()}`, 'gastos_por_proveedor.csv');
  }

  async exportSalesByPaymentMethodToCSV(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    await this.downloadCSV(`/api/orders/by-payment-method/export?${queryParams.toString()}`, 'ventas_por_metodo_pago.csv');
  }

  // Optimized stats endpoint - returns aggregated statistics without fetching all bookings
  async getEstablishmentStats(establishmentId: string) {
    return this.request(`/api/bookings/establishment/${establishmentId}/stats`);
  }

  // Get total booking count for an establishment
  async getEstablishmentBookingCount(establishmentId: string) {
    return this.request(`/api/bookings/establishment/${establishmentId}/count`);
  }

  async updateBooking(id: string, data: any) {
    return this.request(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelBooking(id: string) {
    return this.request(`/api/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async registerBookingPayment(bookingId: string, data: {
    amount: number;
    method?: 'cash' | 'transfer' | 'card' | 'other';
    playerName?: string;
    notes?: string;
  }) {
    return this.request(`/api/bookings/${bookingId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookingPayments(bookingId: string) {
    return this.request(`/api/bookings/${bookingId}/payments`);
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

  // Alias for markNotificationAsRead
  async markNotificationRead(id: string) {
    return this.markNotificationAsRead(id);
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

  // Client endpoints
  async searchClients(establishmentId: string, query: string) {
    return this.request(`/api/clients/establishment/${establishmentId}/search?q=${encodeURIComponent(query)}&limit=10`);
  }

  async getClients(establishmentId: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/clients/establishment/${establishmentId}${query}`);
  }

  async createClient(establishmentId: string, clientData: { name: string; phone?: string; email?: string; notes?: string }) {
    return this.request(`/api/clients/establishment/${establishmentId}`, {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(establishmentId: string, clientId: string, clientData: any) {
    return this.request(`/api/clients/establishment/${establishmentId}/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(establishmentId: string, clientId: string) {
    return this.request(`/api/clients/establishment/${establishmentId}/${clientId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getEstablishmentAnalytics(establishmentId: string, period: '7d' | '30d' | '90d' | '1y' = '30d') {
    return this.request(`/api/analytics/establishment/${establishmentId}?period=${period}`);
  }

  async getTopCustomers(establishmentId: string, period: '7d' | '30d' | '90d' | '1y' = '30d', limit: number = 10) {
    return this.request(`/api/analytics/establishment/${establishmentId}/top-customers?period=${period}&limit=${limit}`);
  }

  // Finance endpoints
  async getFinancialSummary(establishmentId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return this.request(`/api/finance/establishment/${establishmentId}?period=${period}`);
  }

  async getPendingPayments(establishmentId: string) {
    return this.request(`/api/finance/establishment/${establishmentId}/pending`);
  }

  async getSalesByProductAndPaymentMethod(establishmentId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return this.request(`/api/finance/establishment/${establishmentId}/sales-by-product?period=${period}`);
  }

  async getPurchasesByProduct(establishmentId: string, period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return this.request(`/api/stock-movements/purchases-by-product/${establishmentId}?period=${period}`);
  }

  // Expenses endpoints
  async getExpenses(establishmentId: string, params?: { period?: string; userId?: string; cashRegisterId?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.cashRegisterId) queryParams.append('cashRegisterId', params.cashRegisterId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/expenses/establishment/${establishmentId}${query}`);
  }

  async createExpense(data: {
    establishmentId: string;
    cashRegisterId?: string;
    category: string;
    description: string;
    amount: number;
    paymentMethod?: string;
    invoiceNumber?: string;
    supplier?: string;
    notes?: string;
    expenseDate?: string;
  }) {
    return this.request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(id: string, data: {
    category?: string;
    description?: string;
    amount?: number;
    paymentMethod?: string;
    invoiceNumber?: string;
    supplier?: string;
    notes?: string;
    expenseDate?: string;
  }) {
    return this.request(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: string) {
    return this.request(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Staff endpoints
  async getStaff(establishmentId: string) {
    return this.request(`/api/staff/establishment/${establishmentId}`);
  }

  async createStaff(establishmentId: string, staffData: { name: string; email: string; phone?: string; password: string; role: string }) {
    return this.request(`/api/staff/establishment/${establishmentId}`, {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  }

  async updateStaff(establishmentId: string, staffId: string, staffData: any) {
    return this.request(`/api/staff/establishment/${establishmentId}/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  }

  async deleteStaff(establishmentId: string, staffId: string) {
    return this.request(`/api/staff/establishment/${establishmentId}/${staffId}`, {
      method: 'DELETE',
    });
  }

  async getDefaultPermissions() {
    return this.request(`/api/staff/permissions`);
  }

  // Upload endpoints
  async uploadImage(file: File): Promise<{ success: boolean; url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const response = await fetch(`${this.baseURL}/api/upload/image`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    return response.json();
  }

  async uploadImages(files: File[]): Promise<{ success: boolean; urls: string[]; count: number }> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const response = await fetch(`${this.baseURL}/api/upload/images`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload images');
    }
    
    return response.json();
  }

  async deleteImage(filename: string): Promise<{ success: boolean }> {
    return this.request(`/api/upload/image/${filename}`, {
      method: 'DELETE',
    }) as Promise<{ success: boolean }>;
  }

  getImageUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${this.baseURL}${path}`;
  }

  // ==================== STOCK MANAGEMENT ====================
  // Products
  async getProducts(params?: {
    establishmentId?: string;
    categoryId?: string;
    search?: string;
    isActive?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.establishmentId) queryParams.append('establishmentId', params.establishmentId);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/products${query}`);
  }

  async getProduct(id: string) {
    return this.request(`/api/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getLowStockProducts(establishmentId: string) {
    return this.request(`/api/products/alerts/low-stock?establishmentId=${establishmentId}`);
  }

  // Product Categories
  async getProductCategories(establishmentId: string) {
    return this.request(`/api/product-categories?establishmentId=${establishmentId}`);
  }

  async createProductCategory(data: any) {
    return this.request('/api/product-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductCategory(id: string, data: any) {
    return this.request(`/api/product-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductCategory(id: string) {
    return this.request(`/api/product-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Suppliers
  async getSuppliers(params?: {
    establishmentId?: string;
    search?: string;
    isActive?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.establishmentId) queryParams.append('establishmentId', params.establishmentId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/suppliers${query}`);
  }

  async getSupplier(id: string) {
    return this.request(`/api/suppliers/${id}`);
  }

  async createSupplier(data: any) {
    return this.request('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupplier(id: string, data: any) {
    return this.request(`/api/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSupplier(id: string) {
    return this.request(`/api/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  // Stock Movements
  async getStockMovements(params?: {
    establishmentId?: string;
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.establishmentId) queryParams.append('establishmentId', params.establishmentId);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/stock-movements${query}`);
  }

  async createStockMovement(data: any) {
    return this.request('/api/stock-movements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStockSummary(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('establishmentId', params.establishmentId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    return this.request(`/api/stock-movements/summary?${queryParams.toString()}`);
  }

  // Booking Consumptions
  async getBookingConsumptions(bookingId: string) {
    return this.request(`/api/booking-consumptions/booking/${bookingId}`);
  }

  async addBookingConsumption(data: {
    bookingId: string;
    productId: string;
    quantity: number;
    notes?: string;
  }) {
    return this.request('/api/booking-consumptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBookingConsumption(consumptionId: string, data: { quantity: number }) {
    return this.request(`/api/booking-consumptions/${consumptionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBookingConsumption(consumptionId: string) {
    return this.request(`/api/booking-consumptions/${consumptionId}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(params: {
    establishmentId: string;
    status?: string;
    paymentStatus?: string;
    orderType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params.orderType) queryParams.append('orderType', params.orderType);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/orders/establishment/${params.establishmentId}${query}`);
  }

  async getOrder(orderId: string) {
    return this.request(`/api/orders/${orderId}`);
  }

  async getOrderByBookingId(bookingId: string) {
    return this.request(`/api/orders/booking/${bookingId}`);
  }

  async createOrder(data: {
    establishmentId: string;
    clientId?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    currentAccountId?: string;
    items: Array<{ productId: string; quantity: number; notes?: string; unitPrice?: number }>;
    paymentMethod?: string;
    paidAmount?: number;
    discount?: number;
    notes?: string;
  }) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createOrderFromBooking(bookingId: string, data: {
    paymentMethod?: string;
    paidAmount?: number;
  }) {
    return this.request(`/api/orders/from-booking/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addOrderPayment(orderId: string, data: {
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }) {
    return this.request(`/api/orders/${orderId}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getOrderStats(params: {
    establishmentId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/orders/stats/${params.establishmentId}${query}`);
  }

  // ==================== PAYMENT METHODS ====================
  async getPaymentMethods(establishmentId: string, includeInactive = false) {
    const query = includeInactive ? '?includeInactive=true' : '';
    return this.request(`/api/payment-methods/establishment/${establishmentId}${query}`);
  }

  async createPaymentMethod(data: {
    establishmentId: string;
    name: string;
    code: string;
    icon?: string;
  }) {
    return this.request('/api/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(id: string, data: {
    name?: string;
    icon?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    return this.request(`/api/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentMethod(id: string) {
    return this.request(`/api/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }

  async initializePaymentMethods(establishmentId: string) {
    return this.request(`/api/payment-methods/initialize/${establishmentId}`, {
      method: 'POST',
    });
  }

  // ==================== EXPENSE CATEGORIES ====================
  async getExpenseCategories(establishmentId: string) {
    return this.request(`/api/expense-categories?establishmentId=${establishmentId}`);
  }

  async createExpenseCategory(data: {
    establishmentId: string;
    name: string;
    description?: string;
    color?: string;
  }) {
    return this.request('/api/expense-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpenseCategory(id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    return this.request(`/api/expense-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExpenseCategory(id: string) {
    return this.request(`/api/expense-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== CASH REGISTER ====================
  async getActiveCashRegister(establishmentId: string) {
    return this.request(`/api/cash-registers/active?establishmentId=${establishmentId}`);
  }

  async getCashRegisterHistory(params: {
    establishmentId: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, String(value));
    });
    return this.request(`/api/cash-registers/history?${query.toString()}`);
  }

  async getCashRegister(id: string) {
    return this.request(`/api/cash-registers/${id}`);
  }

  async openCashRegister(data: {
    establishmentId: string;
    initialCash: number;
    openingNotes?: string;
  }) {
    return this.request('/api/cash-registers/open', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async closeCashRegister(id: string, data: {
    actualCash: number;
    closingNotes?: string;
  }) {
    return this.request(`/api/cash-registers/${id}/close`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== CASH REGISTER MOVEMENTS ====================
  async getCashRegisterMovements(params: {
    cashRegisterId?: string;
    establishmentId?: string;
    type?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, String(value));
    });
    return this.request(`/api/cash-register-movements?${query.toString()}`);
  }

  async createExpenseMovement(data: {
    cashRegisterId: string;
    amount: number;
    paymentMethod: string;
    expenseCategoryId?: string;
    description?: string;
    notes?: string;
  }) {
    return this.request('/api/cash-register-movements/expense', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCashRegisterReport(cashRegisterId: string) {
    return this.request(`/api/cash-register-movements/report/${cashRegisterId}`);
  }

  // ==================== AMENITIES ====================
  async getAmenities(establishmentId: string, options?: { includeInactive?: boolean; publicOnly?: boolean }) {
    const query = new URLSearchParams();
    if (options?.includeInactive) query.append('includeInactive', 'true');
    if (options?.publicOnly) query.append('publicOnly', 'true');
    const queryString = query.toString();
    return this.request(`/api/amenities/establishment/${establishmentId}${queryString ? `?${queryString}` : ''}`);
  }

  async getPublicAmenities(establishmentId: string) {
    return this.request(`/api/amenities/public/${establishmentId}`, {}, false);
  }

  async getAmenity(id: string) {
    return this.request(`/api/amenities/${id}`);
  }

  async createAmenity(data: {
    establishmentId: string;
    name: string;
    description?: string;
    icon?: string;
    images?: string[];
    pricePerHour: number;
    pricePerHour90?: number;
    pricePerHour120?: number;
    isBookable?: boolean;
    isPublic?: boolean;
    capacity?: number;
    customSchedule?: any;
    sortOrder?: number;
  }) {
    return this.request('/api/amenities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAmenity(id: string, data: Partial<{
    name: string;
    description: string;
    icon: string;
    images: string[];
    pricePerHour: number;
    pricePerHour90: number;
    pricePerHour120: number;
    isBookable: boolean;
    isPublic: boolean;
    isActive: boolean;
    capacity: number;
    customSchedule: any;
    sortOrder: number;
  }>) {
    return this.request(`/api/amenities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAmenity(id: string) {
    return this.request(`/api/amenities/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== INTEGRATIONS ====================
  async getIntegrations() {
    return this.request('/api/integrations');
  }

  async getIntegration(type: 'OPENAI' | 'WHATSAPP') {
    return this.request(`/api/integrations/${type}`);
  }

  async saveIntegration(data: {
    type: 'OPENAI' | 'WHATSAPP';
    apiKey: string;
    phoneNumberId?: string;
    businessAccountId?: string;
    verifyToken?: string;
    config?: Record<string, any>;
  }) {
    return this.request('/api/integrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async testIntegration(type: 'OPENAI' | 'WHATSAPP') {
    return this.request(`/api/integrations/${type}/test`, {
      method: 'POST',
    });
  }

  async toggleIntegration(type: 'OPENAI' | 'WHATSAPP') {
    return this.request(`/api/integrations/${type}/toggle`, {
      method: 'PATCH',
    });
  }

  async deleteIntegration(type: 'OPENAI' | 'WHATSAPP') {
    return this.request(`/api/integrations/${type}`, {
      method: 'DELETE',
    });
  }

  // ==================== ARCA / AFIP ====================
  async getArcaConfig(establishmentId: string) {
    return this.request(`/api/arca/config/${establishmentId}`);
  }

  async saveArcaConfig(establishmentId: string, data: {
    cuit: string;
    razonSocial: string;
    domicilioFiscal: string;
    condicionFiscal: 'monotributista' | 'responsable_inscripto';
    inicioActividades: string;
    certificado?: string;
    clavePrivada?: string;
  }) {
    return this.request(`/api/arca/config/${establishmentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async testArcaConfig(establishmentId: string) {
    return this.request(`/api/arca/config/${establishmentId}/test`, {
      method: 'POST',
    });
  }

  async setArcaConfigActive(establishmentId: string, isActive: boolean) {
    return this.request(`/api/arca/config/${establishmentId}/activate`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async getArcaPuntosVenta(establishmentId: string) {
    return this.request(`/api/arca/puntos-venta/${establishmentId}`);
  }

  async getArcaPuntosVentaFromAfip(establishmentId: string) {
    return this.request(`/api/arca/puntos-venta/${establishmentId}/afip`);
  }

  async createArcaPuntoVenta(establishmentId: string, data: {
    numero: number;
    descripcion?: string;
    isDefault?: boolean;
  }) {
    return this.request(`/api/arca/puntos-venta/${establishmentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArcaPuntoVenta(puntoVentaId: string, data: {
    descripcion?: string;
    isDefault?: boolean;
    isActive?: boolean;
  }) {
    return this.request(`/api/arca/puntos-venta/${puntoVentaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async emitirFacturaArca(establishmentId: string, data: {
    items: Array<{ descripcion: string; cantidad: number; precioUnitario: number }>;
    total: number;
    cliente?: {
      nombre?: string;
      docTipo?: number;
      docNro?: string;
      condicionIva?: number;
    };
    receptorCondicion?: 'responsable_inscripto' | 'monotributista' | 'consumidor_final' | 'exento';
    orderId?: string;
    bookingId?: string;
    puntoVentaId?: string;
  }) {
    return this.request(`/api/arca/facturas/${establishmentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async emitirNotaCreditoArca(establishmentId: string, data: {
    facturaId: string;
    total: number;
    motivo: string;
    items?: Array<{ descripcion: string; cantidad: number; precioUnitario: number }>;
    puntoVentaId?: string;
  }) {
    return this.request(`/api/arca/notas-credito/${establishmentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getArcaInvoices(establishmentId: string, params?: {
    page?: number;
    limit?: number;
    tipo?: number;
    status?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    search?: string;
    orderId?: string;
    bookingId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.tipo) queryParams.append('tipo', params.tipo.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.orderId) queryParams.append('orderId', params.orderId);
    if (params?.bookingId) queryParams.append('bookingId', params.bookingId);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/api/arca/facturas/${establishmentId}${query}`);
  }

  async getArcaInvoice(establishmentId: string, invoiceId: string) {
    return this.request(`/api/arca/facturas/${establishmentId}/${invoiceId}`);
  }

  getArcaInvoicePdfUrl(establishmentId: string, invoiceId: string) {
    return `${this.baseURL}/api/arca/facturas/${establishmentId}/${invoiceId}/pdf`;
  }

  async downloadArcaInvoicePdf(establishmentId: string, invoiceId: string): Promise<Blob> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const url = `${this.baseURL}/api/arca/facturas/${establishmentId}/${invoiceId}/pdf`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error al descargar PDF' }));
      throw new Error(error.error || error.message || 'Error al descargar PDF');
    }

    return response.blob();
  }

  async openArcaInvoicePdf(establishmentId: string, invoiceId: string): Promise<void> {
    const blob = await this.downloadArcaInvoicePdf(establishmentId, invoiceId);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  // OCR Processing
  async processOCR(imageFile: File): Promise<{
    success: boolean;
    data: any;
    confidence: number;
    warnings: string[];
    processingTimeMs: number;
    error?: string;
  }> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const response = await fetch(`${this.baseURL}/api/integrations/ocr/process`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to process OCR');
    }
    
    return response.json();
  }

  async processOCRBase64(imageBase64: string): Promise<{
    success: boolean;
    data: any;
    confidence: number;
    warnings: string[];
    processingTimeMs: number;
    error?: string;
  }> {
    return this.request('/api/integrations/ocr/process', {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    }) as Promise<any>;
  }

  // ==================== WHATSAPP ====================
  async sendWhatsAppMessage(to: string, message: string) {
    return this.request('/api/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ to, message, type: 'text' }),
    });
  }

  async sendWhatsAppBookingConfirmation(bookingId: string, phoneNumber: string) {
    return this.request('/api/whatsapp/send-booking-confirmation', {
      method: 'POST',
      body: JSON.stringify({ bookingId, phoneNumber }),
    });
  }

  async sendWhatsAppBookingReminder(bookingId: string, phoneNumber: string) {
    return this.request('/api/whatsapp/send-booking-reminder', {
      method: 'POST',
      body: JSON.stringify({ bookingId, phoneNumber }),
    });
  }

  // ==================== RECURRING BOOKINGS (TURNOS FIJOS) ====================
  async getRecurringBookingGroups(params: { establishmentId: string; status?: string; clientId?: string }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    return this.request(`/api/recurring-bookings?${queryParams.toString()}`);
  }

  async getRecurringBookingGroup(groupId: string) {
    return this.request(`/api/recurring-bookings/${groupId}`);
  }

  async checkRecurringBookingAvailability(data: {
    establishmentId: string;
    courtId: string;
    startDate: string;
    startTime: string;
    duration: number;
    totalWeeks: number;
    sport?: string;
  }) {
    return this.request('/api/recurring-bookings/check-availability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createRecurringBooking(data: {
    establishmentId: string;
    courtId: string;
    clientId?: string;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    startDate: string;
    startTime: string;
    duration: number;
    sport?: string;
    bookingType?: string;
    totalWeeks: number;
    pricePerBooking: number;
    notes?: string;
    dateConfigurations?: Array<{ date: string; courtId?: string; skip?: boolean }>;
    initialPayment?: { amount: number; method: string };
  }) {
    return this.request('/api/recurring-bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async payRecurringBooking(groupId: string, data: { amount?: number; method: string; bookingId?: string }) {
    return this.request(`/api/recurring-bookings/${groupId}/pay`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelRecurringBooking(groupId: string, data: { cancelType: 'single' | 'all_pending'; bookingId?: string; reason?: string }) {
    return this.request(`/api/recurring-bookings/${groupId}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  async getRecurringPendingBookings(groupId: string) {
    return this.request(`/api/recurring-bookings/${groupId}/pending-bookings`);
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
