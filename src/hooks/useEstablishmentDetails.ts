import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Court {
  id: string;
  name: string;
  type: string;
  surface: string;
  sport: string;
  pricePerHour: number;
  isActive: boolean;
}

interface EstablishmentDetails {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  images: string[];
  amenities: string[];
  sports: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  courts: Court[];
}

interface UseEstablishmentDetailsOptions {
  establishmentId: string | null;
  autoFetch?: boolean;
}

export const useEstablishmentDetails = ({ establishmentId, autoFetch = true }: UseEstablishmentDetailsOptions) => {
  const [establishment, setEstablishment] = useState<EstablishmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablishmentDetails = async (id: string) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getEstablishmentById(id);
      setEstablishment(response);
    } catch (err) {
      console.error('Error fetching establishment details:', err);
      setError('Error al cargar los detalles del establecimiento');
      setEstablishment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && establishmentId) {
      fetchEstablishmentDetails(establishmentId);
    }
  }, [establishmentId, autoFetch]);

  return {
    establishment,
    loading,
    error,
    fetchEstablishmentDetails,
    refetch: () => establishmentId && fetchEstablishmentDetails(establishmentId)
  };
};
