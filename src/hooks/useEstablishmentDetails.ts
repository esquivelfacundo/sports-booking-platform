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
  establishmentId?: string | null;
  slug?: string | null;
  autoFetch?: boolean;
}

export const useEstablishmentDetails = ({ establishmentId, slug, autoFetch = true }: UseEstablishmentDetailsOptions) => {
  const [establishment, setEstablishment] = useState<EstablishmentDetails | null>(null);
  // Start with loading=true if autoFetch is enabled and we have an id/slug to fetch
  const [loading, setLoading] = useState(autoFetch && !!(establishmentId || slug));
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

  const fetchEstablishmentBySlug = async (slugParam: string) => {
    if (!slugParam) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getEstablishmentBySlug(slugParam);
      setEstablishment(response);
    } catch (err) {
      console.error('Error fetching establishment by slug:', err);
      setError('Error al cargar los detalles del establecimiento');
      setEstablishment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      if (slug) {
        fetchEstablishmentBySlug(slug);
      } else if (establishmentId) {
        fetchEstablishmentDetails(establishmentId);
      }
    }
  }, [establishmentId, slug, autoFetch]);

  return {
    establishment,
    loading,
    error,
    fetchEstablishmentDetails,
    fetchEstablishmentBySlug,
    refetch: () => {
      if (slug) {
        fetchEstablishmentBySlug(slug);
      } else if (establishmentId) {
        fetchEstablishmentDetails(establishmentId);
      }
    }
  };
};
