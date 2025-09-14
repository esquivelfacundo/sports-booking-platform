'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EstablishmentRegistration, Employee, Court } from '@/types/establishment';

interface EstablishmentData {
  id?: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  schedule: Record<string, { open: string; close: string; isOpen: boolean }>;
  amenities: string[];
  images: string[];
  courts: Court[];
  staff: Employee[];
  representative: {
    fullName: string;
    email: string;
    phone: string;
    documentType: string;
    documentNumber: string;
    position: string;
    businessName: string;
    taxId: string;
    address: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'demo';
  createdAt?: Date;
  updatedAt?: Date;
}

interface EstablishmentContextType {
  establishment: EstablishmentData | null;
  isDemo: boolean;
  loading: boolean;
  updateEstablishment: (data: Partial<EstablishmentData>) => Promise<void>;
  refreshEstablishment: () => Promise<void>;
  getDemoData: () => EstablishmentData;
}

const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined);

// Datos de demo para el usuario demo
const getDemoEstablishmentData = (): EstablishmentData => ({
  id: 'demo-establishment',
  name: 'Club Deportivo San Martín',
  description: 'Complejo deportivo con canchas de fútbol, paddle y tenis. Más de 20 años brindando el mejor servicio.',
  phone: '5491123456789',
  email: 'info@clubsanmartin.com',
  address: 'Av. San Martín 1234',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  postalCode: '1425',
  coordinates: {
    lat: -34.6037,
    lng: -58.3816
  },
  schedule: {
    monday: { open: '08:00', close: '23:00', isOpen: true },
    tuesday: { open: '08:00', close: '23:00', isOpen: true },
    wednesday: { open: '08:00', close: '23:00', isOpen: true },
    thursday: { open: '08:00', close: '23:00', isOpen: true },
    friday: { open: '08:00', close: '24:00', isOpen: true },
    saturday: { open: '09:00', close: '24:00', isOpen: true },
    sunday: { open: '09:00', close: '22:00', isOpen: true }
  },
  amenities: [
    'Estacionamiento gratuito',
    'Vestuarios',
    'Duchas',
    'Buffet',
    'Wi-Fi',
    'Iluminación LED',
    'Césped sintético',
    'Parrillas'
  ],
  images: [
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
    '/api/placeholder/800/600'
  ],
  courts: [
    {
      id: '1',
      name: 'Cancha 1',
      type: 'futbol',
      surface: 'Césped sintético',
      capacity: 10,
      pricePerHour: 5000,
      openTime: '08:00',
      closeTime: '23:00',
      lighting: true,
      covered: false,
      images: ['/api/placeholder/400/300'],
      description: 'Cancha de fútbol 5 con césped sintético de última generación'
    },
    {
      id: '2',
      name: 'Cancha 2',
      type: 'paddle',
      surface: 'Cemento',
      capacity: 4,
      pricePerHour: 3500,
      openTime: '08:00',
      closeTime: '23:00',
      lighting: true,
      covered: true,
      images: ['/api/placeholder/400/300'],
      description: 'Cancha de paddle techada con iluminación LED'
    },
    {
      id: '3',
      name: 'Cancha 3',
      type: 'tenis',
      surface: 'Polvo de ladrillo',
      capacity: 2,
      pricePerHour: 2500,
      openTime: '08:00',
      closeTime: '22:00',
      lighting: true,
      covered: false,
      images: ['/api/placeholder/400/300'],
      description: 'Cancha de tenis profesional con superficie de polvo de ladrillo'
    },
    {
      id: '4',
      name: 'Cancha 4',
      type: 'basquet',
      surface: 'Cemento',
      capacity: 10,
      pricePerHour: 4000,
      openTime: '08:00',
      closeTime: '23:00',
      lighting: true,
      covered: true,
      images: ['/api/placeholder/400/300'],
      description: 'Cancha de básquet cubierta con piso de cemento alisado'
    }
  ],
  staff: [
    {
      id: '1',
      name: 'Carlos Rodríguez',
      email: 'carlos@clubsanmartin.com',
      phone: '5491134567890',
      role: 'admin',
      schedule: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      permissions: ['all'],
      avatar: '/api/placeholder/100/100'
    },
    {
      id: '2',
      name: 'María González',
      email: 'maria@clubsanmartin.com',
      phone: '5491145678901',
      role: 'manager',
      schedule: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      permissions: ['reservations', 'courts', 'customers'],
      avatar: '/api/placeholder/100/100'
    },
    {
      id: '3',
      name: 'Juan Pérez',
      email: 'juan@clubsanmartin.com',
      phone: '5491156789012',
      role: 'staff',
      schedule: ['friday', 'saturday', 'sunday'],
      permissions: ['reservations'],
      avatar: '/api/placeholder/100/100'
    },
    {
      id: '4',
      name: 'Ana Martín',
      email: 'ana@clubsanmartin.com',
      phone: '5491167890123',
      role: 'maintenance',
      schedule: ['monday', 'wednesday', 'friday'],
      permissions: ['courts', 'maintenance'],
      avatar: '/api/placeholder/100/100'
    }
  ],
  representative: {
    fullName: 'Roberto San Martín',
    email: 'roberto@clubsanmartin.com',
    phone: '5491178901234',
    documentType: 'dni',
    documentNumber: '12345678',
    position: 'Director General',
    businessName: 'Club Deportivo San Martín S.A.',
    taxId: '30123456789',
    address: 'Av. San Martín 1234, Buenos Aires'
  },
  status: 'demo',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
});

export const EstablishmentProvider = ({ children }: { children: ReactNode }) => {
  const [establishment, setEstablishment] = useState<EstablishmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    loadEstablishmentData();
  }, []);

  const loadEstablishmentData = async () => {
    setLoading(true);
    try {
      const userToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (!userToken || userToken === 'demo-token') {
        // Usuario demo - usar datos de demostración
        setEstablishment(getDemoEstablishmentData());
        setIsDemo(true);
      } else if (userData) {
        // Usuario autenticado - obtener datos del backend
        const user = JSON.parse(userData);
        
        if (user.userType === 'establishment') {
          // First try to get establishment ID from user data, then from registration data
          let establishmentId = user.establishmentId;
          
          if (!establishmentId) {
            // Try to get from registration success data
            const registrationSuccess = localStorage.getItem('registrationSuccess');
            if (registrationSuccess) {
              const regData = JSON.parse(registrationSuccess);
              establishmentId = regData.establishment?.id;
            }
          }
          
          if (establishmentId) {
            try {
              // Llamada al backend para obtener datos del establecimiento
              const response = await fetch(`http://localhost:3001/api/establishments/${establishmentId}`, {
                headers: {
                  'Authorization': `Bearer ${userToken}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.ok) {
                const result = await response.json();
                const establishmentData = result.establishment;
                
                // Convertir datos del backend al formato del contexto
                const formattedData: EstablishmentData = {
                  id: establishmentData.id,
                  name: establishmentData.name,
                  description: establishmentData.description,
                  phone: establishmentData.phone,
                  email: establishmentData.email,
                  address: establishmentData.address,
                  city: establishmentData.city,
                  province: establishmentData.province || '',
                  postalCode: establishmentData.postalCode || '',
                  coordinates: establishmentData.latitude && establishmentData.longitude ? {
                    lat: parseFloat(establishmentData.latitude),
                    lng: parseFloat(establishmentData.longitude)
                  } : undefined,
                  schedule: establishmentData.openingHours || {},
                  amenities: establishmentData.amenities || [],
                  images: establishmentData.images?.photos || [],
                  courts: establishmentData.courts || [],
                  staff: establishmentData.staff || [],
                  representative: {
                    fullName: establishmentData.representativeName || '',
                    email: establishmentData.representativeEmail || '',
                    phone: establishmentData.representativeWhatsapp || '',
                    documentType: establishmentData.representativeDocumentType || '',
                    documentNumber: establishmentData.representativeDocumentNumber || '',
                    position: establishmentData.representativePosition || '',
                    businessName: establishmentData.representativeBusinessName || '',
                    taxId: establishmentData.representativeTaxId || '',
                    address: establishmentData.representativeAddress || ''
                  },
                  status: establishmentData.registrationStatus || 'pending',
                  createdAt: establishmentData.createdAt ? new Date(establishmentData.createdAt) : new Date(),
                  updatedAt: establishmentData.updatedAt ? new Date(establishmentData.updatedAt) : new Date()
                };
                
                setEstablishment(formattedData);
                setIsDemo(false);
              } else {
                throw new Error('Failed to fetch establishment data');
              }
            } catch (apiError) {
              console.error('Error fetching establishment from API:', apiError);
              // Fallback a localStorage si falla el API
              const registrationData = localStorage.getItem('establishmentRegistrationData');
              if (registrationData) {
                console.log('Using localStorage establishment data as fallback');
                const data = JSON.parse(registrationData);
                setEstablishment(data);
                setIsDemo(false);
              } else {
                console.log('No establishment data found, setting to null');
                setEstablishment(null);
                setIsDemo(false);
              }
            }
          } else {
            // No establishment ID found
            setEstablishment(null);
            setIsDemo(false);
          }
        } else {
          // Usuario no es de establecimiento
          setEstablishment(null);
          setIsDemo(false);
        }
      } else {
        // Sin datos de usuario
        setEstablishment(null);
        setIsDemo(false);
      }
    } catch (error) {
      console.error('Error loading establishment data:', error);
      // En caso de error, no usar datos demo automáticamente
      // Intentar cargar desde localStorage primero
      const registrationData = localStorage.getItem('establishmentRegistrationData');
      if (registrationData) {
        console.log('Loading establishment from localStorage after error');
        const data = JSON.parse(registrationData);
        setEstablishment(data);
        setIsDemo(false);
      } else {
        console.log('No establishment data available, setting to null');
        setEstablishment(null);
        setIsDemo(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateEstablishment = async (data: Partial<EstablishmentData>) => {
    if (!establishment) return;

    const updatedEstablishment = {
      ...establishment,
      ...data,
      updatedAt: new Date()
    };

    setEstablishment(updatedEstablishment);

    // Guardar en localStorage si no es demo
    if (!isDemo) {
      localStorage.setItem('establishmentRegistrationData', JSON.stringify(updatedEstablishment));
    }

    // TODO: Aquí se podría hacer la llamada al backend para persistir los cambios
    try {
      // await api.updateEstablishment(establishment.id, data);
    } catch (error) {
      console.error('Error updating establishment:', error);
    }
  };

  const refreshEstablishment = async () => {
    await loadEstablishmentData();
  };

  const getDemoData = () => getDemoEstablishmentData();

  return (
    <EstablishmentContext.Provider
      value={{
        establishment,
        isDemo,
        loading,
        updateEstablishment,
        refreshEstablishment,
        getDemoData
      }}
    >
      {children}
    </EstablishmentContext.Provider>
  );
};

export const useEstablishment = () => {
  const context = useContext(EstablishmentContext);
  if (context === undefined) {
    throw new Error('useEstablishment must be used within an EstablishmentProvider');
  }
  return context;
};

export default EstablishmentContext;
