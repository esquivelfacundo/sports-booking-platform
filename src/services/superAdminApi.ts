const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface EstablishmentData {
  id: string;
  name: string;
  city: string;
  email: string;
  registrationStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  address: string;
  phone: string;
  description?: string;
  amenities: string[];
  sports: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  role: string;
  phone?: string;
  city?: string;
}

class SuperAdminApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('superAdminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Establishments API
  async getAllEstablishments(): Promise<EstablishmentData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/establishments`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching establishments:', error);
      throw error;
    }
  }

  async approveEstablishment(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/establishments/${id}/approve`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status: 'approved', isActive: true }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error approving establishment:', error);
      return false;
    }
  }

  async rejectEstablishment(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/establishments/${id}/reject`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status: 'rejected', isActive: false }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error rejecting establishment:', error);
      return false;
    }
  }

  async deleteEstablishment(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/establishments/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting establishment:', error);
      return false;
    }
  }

  // Users API
  async getAllUsers(): Promise<UserData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async suspendUser(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/suspend`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive: false }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error suspending user:', error);
      return false;
    }
  }

  async activateUser(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/activate`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive: true }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error activating user:', error);
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Analytics API
  async getPlatformStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Return basic stats if API fails
      return {
        totalEstablishments: 0,
        approvedEstablishments: 0,
        pendingEstablishments: 0,
        totalUsers: 0,
        totalReservations: 0,
        totalRevenue: 0
      };
    }
  }
}

export const superAdminApi = new SuperAdminApiService();
