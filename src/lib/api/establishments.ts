import { EstablishmentRegistration } from '@/types/establishment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface EstablishmentRegistrationResponse {
  success: boolean;
  message: string;
  establishment: any;
  status: string;
  nextSteps?: string[];
}

export interface RegistrationStatusResponse {
  success: boolean;
  establishment: any;
  registrationStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  isApproved: boolean;
  isPending: boolean;
  isActive: boolean;
}

class EstablishmentAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async registerEstablishment(data: EstablishmentRegistration): Promise<EstablishmentRegistrationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/establishments/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to register establishment');
      }

      return result;
    } catch (error) {
      console.error('Register establishment error:', error);
      throw error;
    }
  }

  async getRegistrationStatus(): Promise<RegistrationStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/establishments/registration/status`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get registration status');
      }

      return result;
    } catch (error) {
      console.error('Get registration status error:', error);
      throw error;
    }
  }

  async updateRegistration(establishmentId: string, data: Partial<EstablishmentRegistration>): Promise<EstablishmentRegistrationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/establishments/registration/${establishmentId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update registration');
      }

      return result;
    } catch (error) {
      console.error('Update registration error:', error);
      throw error;
    }
  }

  async getMyEstablishments() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/establishments/my/establishments`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get establishments');
      }

      return result;
    } catch (error) {
      console.error('Get my establishments error:', error);
      throw error;
    }
  }
}

export const establishmentAPI = new EstablishmentAPI();
