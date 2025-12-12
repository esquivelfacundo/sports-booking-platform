import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface Establishment {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  images: string[];
  sports: string[];
  amenities: string[];
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  rating: number;
  reviewCount: number;
  priceRange: string;
  featured: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseEstablishmentsParams {
  search?: string;
  sport?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  autoFetch?: boolean;
}

interface UseEstablishmentsReturn {
  establishments: Establishment[];
  loading: boolean;
  error: string | null;
  fetchEstablishments: (params?: UseEstablishmentsParams) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useEstablishments = (
  initialParams?: UseEstablishmentsParams
): UseEstablishmentsReturn => {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<UseEstablishmentsParams>(
    initialParams || {}
  );

  const fetchEstablishments = async (params?: UseEstablishmentsParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = params || currentParams;
      setCurrentParams(searchParams);
      
      const response = await apiClient.getEstablishments(searchParams) as any;
      
      if (response && response.data) {
        // Transform API data to match frontend expectations
        const transformedData = response.data.map((est: any) => ({
          ...est,
          location: est.city || est.address,
          coordinates: est.latitude && est.longitude ? [parseFloat(est.latitude), parseFloat(est.longitude)] : undefined,
          sport: est.sports && est.sports.length > 0 ? est.sports[0] : 'futbol',
          price: 2500, // Default price since API doesn't have this
          reviews: est.reviewCount || 0,
          image: (est.images?.photos && est.images.photos.length > 0) ? est.images.photos[0] : 
                 (est.images && Array.isArray(est.images) && est.images.length > 0) ? est.images[0] : 
                 '/assets/default-card.png'
        }));
        setEstablishments(transformedData);
      } else if (Array.isArray(response)) {
        // Transform array response
        const transformedData = response.map((est: any) => ({
          ...est,
          location: est.city || est.address,
          coordinates: est.latitude && est.longitude ? [parseFloat(est.latitude), parseFloat(est.longitude)] : undefined,
          sport: est.sports && est.sports.length > 0 ? est.sports[0] : 'futbol',
          price: 2500, // Default price since API doesn't have this
          reviews: est.reviewCount || 0,
          image: (est.images?.photos && est.images.photos.length > 0) ? est.images.photos[0] : 
                 (est.images && Array.isArray(est.images) && est.images.length > 0) ? est.images[0] : 
                 '/assets/default-card.png'
        }));
        setEstablishments(transformedData);
      } else {
        setError('No se encontraron establecimientos');
        setEstablishments([]);
      }
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError('Error de conexión. Por favor, verifica que el servidor esté corriendo.');
      setEstablishments([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchEstablishments(currentParams);

  useEffect(() => {
    if (initialParams?.autoFetch !== false) {
      fetchEstablishments(initialParams);
    }
  }, []); // Remove initialParams?.autoFetch from dependencies to prevent infinite loop

  return {
    establishments,
    loading,
    error,
    fetchEstablishments,
    refetch,
  };
};

// Mock data fallback
const getMockEstablishments = (): Establishment[] => [
  {
    id: '1',
    name: 'Club Deportivo Palermo',
    location: 'Palermo, Buenos Aires',
    coordinates: [-34.5755, -58.4338],
    sport: 'futbol',
    rating: 4.8,
    reviews: 127,
    price: 8000,
    image: '/assets/default-card.png',
    amenities: ['Estacionamiento', 'Vestuarios', 'Parrilla'],
    description: 'Moderno complejo deportivo en el corazón de Palermo con canchas de última generación.',
    phone: '+54 11 4567-8901',
    address: 'Av. Santa Fe 3456, Palermo',
    city: 'Buenos Aires',
    reviewCount: 156,
    priceRange: '$$',
    featured: true,
    verified: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'Complejo Deportivo Norte',
    description: 'Amplio complejo con múltiples disciplinas deportivas',
    address: 'Av. Cabildo 1500',
    city: 'Buenos Aires',
    latitude: -34.5601,
    longitude: -58.4566,
    phone: '+54 11 4782-9876',
    email: 'contacto@complejonorte.com',
    images: [],
    image: '/assets/default-card.png',
    sports: ['futbol5', 'basquet', 'voley'],
    amenities: ['estacionamiento', 'vestuarios', 'buffet'],
    openingHours: {
      monday: { open: '07:00', close: '23:00' },
      tuesday: { open: '07:00', close: '23:00' },
      wednesday: { open: '07:00', close: '23:00' },
      thursday: { open: '07:00', close: '23:00' },
      friday: { open: '07:00', close: '24:00' },
      saturday: { open: '08:00', close: '24:00' },
      sunday: { open: '09:00', close: '22:00' }
    },
    rating: 4.5,
    reviewCount: 89,
    priceRange: '$',
    featured: false,
    verified: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z'
  },
  {
    id: '3',
    name: 'Paddle & Tenis Club',
    description: 'Especialistas en paddle y tenis con instructores profesionales',
    address: 'Av. Santa Fe 2800',
    city: 'Buenos Aires',
    latitude: -34.5956,
    longitude: -58.4011,
    phone: '+54 11 4825-3456',
    email: 'info@paddletenis.com',
    images: [],
    image: '/assets/default-card.png',
    sports: ['paddle', 'tenis'],
    amenities: ['estacionamiento', 'vestuarios', 'pro-shop', 'wifi', 'aire-acondicionado'],
    openingHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '23:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '09:00', close: '21:00' }
    },
    rating: 4.9,
    reviewCount: 203,
    priceRange: '$$$',
    featured: true,
    verified: true,
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-22T09:15:00Z'
  }
];

export default useEstablishments;
