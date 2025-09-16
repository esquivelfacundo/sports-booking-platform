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
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

interface EstablishmentContextType {
  establishment: EstablishmentData | null;
  loading: boolean;
  updateEstablishment: (data: Partial<EstablishmentData>) => Promise<void>;
  refreshEstablishment: () => Promise<void>;
}

const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined);

export const EstablishmentProvider = ({ children }: { children: ReactNode }) => {
  const [establishment, setEstablishment] = useState<EstablishmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait a bit for AuthContext to initialize before loading establishment data
    const timer = setTimeout(() => {
      loadEstablishmentData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Debug effect to log establishment data changes
  useEffect(() => {
    console.log('EstablishmentContext: Establishment data changed:', {
      establishment: establishment ? {
        id: establishment.id,
        name: establishment.name,
        email: establishment.email,
        courtsCount: establishment.courts?.length || 0,
        staffCount: establishment.staff?.length || 0,
        status: establishment.status
      } : null,
      loading
    });
  }, [establishment, loading]);

  const loadEstablishmentData = async () => {
    setLoading(true);
    try {
      const userToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('EstablishmentContext: Loading data with token:', !!userToken, 'userData:', !!userData);
      
      if (!userToken) {
        console.log('EstablishmentContext: No token found - user not authenticated');
        setEstablishment(null);
        setLoading(false);
        return;
      }

      if (!userData) {
        // Retry after a delay in case AuthContext is still loading
        console.log('EstablishmentContext: No user data found, retrying in 500ms');
        setTimeout(() => {
          const retryToken = localStorage.getItem('auth_token');
          const retryUserData = localStorage.getItem('user_data');
          if (retryToken && retryUserData) {
            console.log('EstablishmentContext: Retry found data, reloading');
            loadEstablishmentData();
            return;
          }
          // If still no data after retry, set as null
          setEstablishment(null);
          setLoading(false);
        }, 500);
        return;
      }

      // Usuario autenticado - obtener datos del backend
      const user = JSON.parse(userData);
      console.log('EstablishmentContext: User data:', { userType: user.userType, establishmentId: user.establishmentId });
      
      if (user.userType === 'establishment') {
        // For establishment users, ALWAYS try to load their real data first from API
        try {
          console.log('EstablishmentContext: Attempting to load establishment data from API');
          console.log('EstablishmentContext: User data:', user);
          console.log('EstablishmentContext: Token:', userToken ? 'Present' : 'Missing');
          
          const response = await fetch(`http://localhost:3001/api/establishments/my-establishment`, {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('EstablishmentContext: API Response status:', response.status);
          console.log('EstablishmentContext: API Response headers:', response.headers);

          if (response.ok) {
            const result = await response.json();
            console.log('EstablishmentContext: Full API response:', result);
            const establishmentData = result.establishment;
            console.log('EstablishmentContext: Establishment data:', establishmentData);
            console.log('EstablishmentContext: Courts data:', establishmentData?.courts);
            console.log('EstablishmentContext: Staff data:', establishmentData?.staff);
            
            // Convert backend data to context format - REGARDLESS of approval status
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
            setLoading(false);
            return;
          } else {
            const errorText = await response.text();
            console.log('EstablishmentContext: API call failed with status:', response.status);
            console.log('EstablishmentContext: API error response:', errorText);
          }
        } catch (apiError) {
          console.error('EstablishmentContext: API error, trying localStorage fallback:', apiError);
        }

        // Fallback to localStorage data if API fails
        console.log('EstablishmentContext: Loading from localStorage as fallback');
        const registrationData = localStorage.getItem('establishmentRegistrationData') || localStorage.getItem('establishment_registration');
        if (registrationData) {
          const establishment = JSON.parse(registrationData);
          console.log('EstablishmentContext: Found localStorage registration data:', {
            hasBasicInfo: !!establishment.basicInfo,
            hasLocation: !!establishment.location,
            hasCourts: !!establishment.courts,
            courtsCount: establishment.courts?.length || 0,
            hasStaff: !!establishment.staff,
            staffCount: establishment.staff?.length || 0,
            hasRepresentative: !!establishment.representative
          });
          
          // Convert registration data to EstablishmentData format
          const formattedData: EstablishmentData = {
            id: establishment.id || establishment.establishmentId || 'temp_establishment',
            name: establishment.basicInfo?.name || 'Mi Establecimiento',
            description: establishment.basicInfo?.description || '',
            phone: establishment.basicInfo?.phone || '',
            email: establishment.basicInfo?.email || user.email,
            address: establishment.location?.address || '',
            city: establishment.location?.city || '',
            province: establishment.location?.state || '',
            postalCode: establishment.location?.zipCode || '',
            coordinates: establishment.location?.coordinates ? {
              lat: establishment.location.coordinates.lat,
              lng: establishment.location.coordinates.lng
            } : undefined,
            schedule: establishment.schedule || {},
            amenities: establishment.amenities || [],
            images: establishment.images || [],
            courts: establishment.courts || [],
            staff: establishment.staff || [],
            representative: establishment.representative || {
              fullName: user.firstName + ' ' + user.lastName,
              email: user.email,
              phone: '',
              documentType: '',
              documentNumber: '',
              position: '',
              businessName: '',
              taxId: '',
              address: ''
            },
            status: 'pending', // Keep real status for localStorage data
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          setEstablishment(formattedData);
          setLoading(false);
          return;
        }

        // If no data found anywhere, set null (no demo data for authenticated users)
        console.log('EstablishmentContext: No establishment data found for authenticated user');
        setEstablishment(null);
      } else {
        // Usuario no es de tipo establishment
        setEstablishment(null);
      }
    } catch (error) {
      console.error('Error loading establishment data:', error);
      // En caso de error, intentar cargar desde localStorage primero
      const registrationData = localStorage.getItem('establishmentRegistrationData') || localStorage.getItem('establishment_registration');
      if (registrationData) {
        console.log('Loading establishment from localStorage after error');
        try {
          const establishment = JSON.parse(registrationData);
          const userData = localStorage.getItem('user_data');
          const user = userData ? JSON.parse(userData) : {};
          
          // Convert registration data to EstablishmentData format
          const formattedData: EstablishmentData = {
            id: establishment.id || establishment.establishmentId || 'temp_establishment',
            name: establishment.basicInfo?.name || 'Mi Establecimiento',
            description: establishment.basicInfo?.description || '',
            phone: establishment.basicInfo?.phone || '',
            email: establishment.basicInfo?.email || user.email,
            address: establishment.location?.address || '',
            city: establishment.location?.city || '',
            province: establishment.location?.state || '',
            postalCode: establishment.location?.zipCode || '',
            coordinates: establishment.location?.coordinates ? {
              lat: establishment.location.coordinates.lat,
              lng: establishment.location.coordinates.lng
            } : undefined,
            schedule: establishment.schedule || {},
            amenities: establishment.amenities || [],
            images: establishment.images || [],
            courts: establishment.courts || [],
            staff: establishment.staff || [],
            representative: establishment.representative || {
              fullName: user.firstName + ' ' + user.lastName,
              email: user.email,
              phone: '',
              documentType: '',
              documentNumber: '',
              position: '',
              businessName: '',
              taxId: '',
              address: ''
            },
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          setEstablishment(formattedData);
        } catch (parseError) {
          console.error('Error parsing localStorage establishment data:', parseError);
          setEstablishment(null);
        }
      } else {
        setEstablishment(null);
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
    localStorage.setItem('establishmentRegistrationData', JSON.stringify(updatedEstablishment));

    // TODO: Aquí se podría hacer la llamada al backend para persistir los cambios
    try {
      // await api.updateEstablishment(establishment.id, data);
    } catch (error) {
      console.error('Error updating establishment:', error);
    }
  };

  const refreshEstablishment = async () => {
    // Reset state before reloading
    setEstablishment(null);
    setLoading(true);
    await loadEstablishmentData();
  };

  return (
    <EstablishmentContext.Provider
      value={{
        establishment,
        loading,
        updateEstablishment,
        refreshEstablishment,
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
