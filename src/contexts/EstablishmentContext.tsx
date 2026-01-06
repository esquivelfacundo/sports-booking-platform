'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EstablishmentRegistration, Employee, Court } from '@/types/establishment';

interface EstablishmentData {
  id?: string;
  name: string;
  slug?: string;
  logo?: string;
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
  schedule: Record<string, { open: string; close: string; isOpen?: boolean; closed?: boolean }>;
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  closedDates?: string[];
  useNationalHolidays?: boolean;
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
  // Deposit/Seña configuration
  requireDeposit?: boolean;
  depositType?: 'percentage' | 'fixed';
  depositPercentage?: number;
  depositFixedAmount?: number;
  allowFullPayment?: boolean;
  // Booking restrictions
  maxAdvanceBookingDays?: number;
  minAdvanceBookingHours?: number;
  allowSameDayBooking?: boolean;
  cancellationDeadlineHours?: number;
  // Cancellation policy
  cancellationPolicy?: 'full_refund' | 'partial_refund' | 'no_refund' | 'credit';
  refundPercentage?: number;
  // No-show penalty
  noShowPenalty?: boolean;
  noShowPenaltyType?: 'full_charge' | 'deposit_only' | 'percentage';
  noShowPenaltyPercentage?: number;
  // Deposit payment deadline
  depositPaymentDeadlineHours?: number;
  // Open/Closed status
  isOpen?: boolean;
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

  // Listen for storage changes (when user logs in/out)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user_data') {
        console.log('EstablishmentContext: Storage changed, reloading data');
        loadEstablishmentData();
      }
    };

    // Also listen for custom auth events
    const handleAuthChange = () => {
      console.log('EstablishmentContext: Auth change detected, reloading data');
      setTimeout(() => loadEstablishmentData(), 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
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
      console.log('EstablishmentContext: User data:', { userType: user.userType, establishmentId: user.establishmentId, isStaff: user.isStaff });
      
      // Handle staff users - they have establishmentId directly
      if (user.isStaff && user.establishmentId) {
        try {
          console.log('EstablishmentContext: Staff user - loading establishment by ID:', user.establishmentId);
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await fetch(`${apiUrl}/api/establishments/${user.establishmentId}`, {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            const establishmentData = result.data || result.establishment || result;
            console.log('EstablishmentContext: Staff loaded establishment:', establishmentData.name);
            
            const formattedData: EstablishmentData = {
              id: establishmentData.id,
              name: establishmentData.name,
              slug: establishmentData.slug || '',
              description: establishmentData.description || '',
              phone: establishmentData.phone || '',
              email: establishmentData.email || '',
              address: establishmentData.address || '',
              city: establishmentData.city || '',
              province: establishmentData.province || '',
              postalCode: establishmentData.postalCode || '',
              coordinates: establishmentData.latitude && establishmentData.longitude ? {
                lat: parseFloat(establishmentData.latitude),
                lng: parseFloat(establishmentData.longitude)
              } : undefined,
              schedule: establishmentData.openingHours || {},
              openingHours: establishmentData.openingHours || {},
              closedDates: establishmentData.closedDates || [],
              useNationalHolidays: establishmentData.useNationalHolidays !== false,
              amenities: establishmentData.amenities || [],
              images: establishmentData.images || [],
              logo: establishmentData.logo || '',
              courts: establishmentData.courts || [],
              staff: establishmentData.staff || [],
              representative: {
                fullName: '',
                email: '',
                phone: '',
                documentType: '',
                documentNumber: '',
                position: '',
                businessName: '',
                taxId: '',
                address: ''
              },
              status: establishmentData.registrationStatus || 'approved',
              createdAt: establishmentData.createdAt ? new Date(establishmentData.createdAt) : new Date(),
              updatedAt: establishmentData.updatedAt ? new Date(establishmentData.updatedAt) : new Date(),
              // Deposit/Seña configuration
              requireDeposit: establishmentData.requireDeposit !== false,
              depositType: establishmentData.depositType || 'percentage',
              depositPercentage: establishmentData.depositPercentage ?? 50,
              depositFixedAmount: establishmentData.depositFixedAmount || 5000,
              allowFullPayment: establishmentData.allowFullPayment === true,
              // Booking restrictions
              maxAdvanceBookingDays: establishmentData.maxAdvanceBookingDays ?? 30,
              minAdvanceBookingHours: establishmentData.minAdvanceBookingHours ?? 2,
              allowSameDayBooking: establishmentData.allowSameDayBooking !== false,
              cancellationDeadlineHours: establishmentData.cancellationDeadlineHours ?? 24,
              // Cancellation policy
              cancellationPolicy: establishmentData.cancellationPolicy || 'partial_refund',
              refundPercentage: establishmentData.refundPercentage ?? 50,
              // No-show penalty
              noShowPenalty: establishmentData.noShowPenalty !== false,
              noShowPenaltyType: establishmentData.noShowPenaltyType || 'deposit_only',
              noShowPenaltyPercentage: establishmentData.noShowPenaltyPercentage ?? 100,
              // Deposit payment deadline
              depositPaymentDeadlineHours: establishmentData.depositPaymentDeadlineHours ?? 2
            };
            
            setEstablishment(formattedData);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('EstablishmentContext: Error loading establishment for staff:', apiError);
        }
        setEstablishment(null);
        setLoading(false);
        return;
      }
      
      // Handle admin and establishment users - load THEIR OWN establishments (not all)
      if (user.userType === 'admin' || user.userType === 'establishment') {
        try {
          console.log('EstablishmentContext: Admin user - loading MY establishments');
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          // Use /me endpoint to get only establishments owned by this user
          const response = await fetch(`${apiUrl}/api/establishments/me`, {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            const establishments = result.data || result.establishments || [];
            
            if (establishments.length > 0) {
              const establishmentData = establishments[0];
              console.log('EstablishmentContext: Admin loaded establishment:', establishmentData.name);
              
              const formattedData: EstablishmentData = {
                id: establishmentData.id,
                name: establishmentData.name,
                slug: establishmentData.slug || '',
                description: establishmentData.description || '',
                phone: establishmentData.phone || '',
                email: establishmentData.email || '',
                address: establishmentData.address || '',
                city: establishmentData.city || '',
                province: establishmentData.province || '',
                postalCode: establishmentData.postalCode || '',
                coordinates: establishmentData.latitude && establishmentData.longitude ? {
                  lat: parseFloat(establishmentData.latitude),
                  lng: parseFloat(establishmentData.longitude)
                } : undefined,
                schedule: establishmentData.openingHours || {},
                openingHours: establishmentData.openingHours || {},
                closedDates: establishmentData.closedDates || [],
                useNationalHolidays: establishmentData.useNationalHolidays !== false,
                amenities: establishmentData.amenities || [],
                images: establishmentData.images || [],
                logo: establishmentData.logo || '',
                courts: establishmentData.courts || [],
                staff: establishmentData.staff || [],
                representative: {
                  fullName: '',
                  email: '',
                  phone: '',
                  documentType: '',
                  documentNumber: '',
                  position: '',
                  businessName: '',
                  taxId: '',
                  address: ''
                },
                status: establishmentData.registrationStatus || 'approved',
                createdAt: establishmentData.createdAt ? new Date(establishmentData.createdAt) : new Date(),
                updatedAt: establishmentData.updatedAt ? new Date(establishmentData.updatedAt) : new Date(),
                // Deposit/Seña configuration
                requireDeposit: establishmentData.requireDeposit !== false,
                depositType: establishmentData.depositType || 'percentage',
                depositPercentage: establishmentData.depositPercentage ?? 50,
                depositFixedAmount: establishmentData.depositFixedAmount || 5000,
                allowFullPayment: establishmentData.allowFullPayment === true,
                // Booking restrictions
                maxAdvanceBookingDays: establishmentData.maxAdvanceBookingDays ?? 30,
                minAdvanceBookingHours: establishmentData.minAdvanceBookingHours ?? 2,
                allowSameDayBooking: establishmentData.allowSameDayBooking !== false,
                cancellationDeadlineHours: establishmentData.cancellationDeadlineHours ?? 24,
                // Cancellation policy
                cancellationPolicy: establishmentData.cancellationPolicy || 'partial_refund',
                refundPercentage: establishmentData.refundPercentage ?? 50,
                // No-show penalty
                noShowPenalty: establishmentData.noShowPenalty !== false,
                noShowPenaltyType: establishmentData.noShowPenaltyType || 'deposit_only',
                noShowPenaltyPercentage: establishmentData.noShowPenaltyPercentage ?? 100,
                // Deposit payment deadline
                depositPaymentDeadlineHours: establishmentData.depositPaymentDeadlineHours ?? 2
              };
              
              setEstablishment(formattedData);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.error('EstablishmentContext: Error loading establishments for admin:', apiError);
        }
        setEstablishment(null);
        setLoading(false);
        return;
      }
      
      if (user.userType === 'establishment') {
        // For establishment users, ALWAYS try to load their real data first from API
        try {
          console.log('EstablishmentContext: Attempting to load establishment data from API');
          console.log('EstablishmentContext: User data:', user);
          console.log('EstablishmentContext: Token:', userToken ? 'Present' : 'Missing');
          
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await fetch(`${apiUrl}/api/establishments/my/establishments`, {
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
              slug: establishmentData.slug || '',
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
              openingHours: establishmentData.openingHours || {},
              closedDates: establishmentData.closedDates || [],
              useNationalHolidays: establishmentData.useNationalHolidays !== false,
              amenities: establishmentData.amenities || [],
              images: establishmentData.images?.photos || [],
              logo: establishmentData.logo || '',
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
              updatedAt: establishmentData.updatedAt ? new Date(establishmentData.updatedAt) : new Date(),
              // Deposit/Seña configuration
              requireDeposit: establishmentData.requireDeposit !== false,
              depositType: establishmentData.depositType || 'percentage',
              depositPercentage: establishmentData.depositPercentage ?? 50,
              depositFixedAmount: establishmentData.depositFixedAmount || 5000,
              allowFullPayment: establishmentData.allowFullPayment === true,
              // Booking restrictions
              maxAdvanceBookingDays: establishmentData.maxAdvanceBookingDays ?? 30,
              minAdvanceBookingHours: establishmentData.minAdvanceBookingHours ?? 2,
              allowSameDayBooking: establishmentData.allowSameDayBooking !== false,
              cancellationDeadlineHours: establishmentData.cancellationDeadlineHours ?? 24,
              // Cancellation policy
              cancellationPolicy: establishmentData.cancellationPolicy || 'partial_refund',
              refundPercentage: establishmentData.refundPercentage ?? 50,
              // No-show penalty
              noShowPenalty: establishmentData.noShowPenalty !== false,
              noShowPenaltyType: establishmentData.noShowPenaltyType || 'deposit_only',
              noShowPenaltyPercentage: establishmentData.noShowPenaltyPercentage ?? 100,
              // Deposit payment deadline
              depositPaymentDeadlineHours: establishmentData.depositPaymentDeadlineHours ?? 2
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
            logo: establishment.logo || '',
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
            logo: establishment.logo || '',
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
    if (!establishment || !establishment.id) return;

    try {
      const userToken = localStorage.getItem('auth_token');
      if (!userToken) {
        throw new Error('No authentication token');
      }

      // Build update payload with only defined values
      const updatePayload: Record<string, any> = {};
      
      if (data.name) updatePayload.name = data.name;
      if (data.slug !== undefined) updatePayload.slug = data.slug;
      if (data.description !== undefined) updatePayload.description = data.description;
      if (data.email) updatePayload.email = data.email;
      if (data.address) updatePayload.address = data.address;
      if (data.city) updatePayload.city = data.city;
      if (data.province) updatePayload.province = data.province;
      if (data.postalCode) updatePayload.postalCode = data.postalCode;
      if (data.amenities) updatePayload.amenities = data.amenities;
      if (data.schedule) updatePayload.openingHours = data.schedule;
      if (data.closedDates !== undefined) updatePayload.closedDates = data.closedDates;
      if (data.useNationalHolidays !== undefined) updatePayload.useNationalHolidays = data.useNationalHolidays;
      if (data.images !== undefined) updatePayload.images = data.images;
      
      // Deposit/Seña configuration
      if (data.requireDeposit !== undefined) updatePayload.requireDeposit = data.requireDeposit;
      if (data.depositType !== undefined) updatePayload.depositType = data.depositType;
      if (data.depositPercentage !== undefined) updatePayload.depositPercentage = data.depositPercentage;
      if (data.depositFixedAmount !== undefined) updatePayload.depositFixedAmount = data.depositFixedAmount;
      
      // Full payment option
      if (data.allowFullPayment !== undefined) updatePayload.allowFullPayment = data.allowFullPayment;
      
      // Booking restrictions
      if (data.maxAdvanceBookingDays !== undefined) updatePayload.maxAdvanceBookingDays = data.maxAdvanceBookingDays;
      if (data.minAdvanceBookingHours !== undefined) updatePayload.minAdvanceBookingHours = data.minAdvanceBookingHours;
      if (data.allowSameDayBooking !== undefined) updatePayload.allowSameDayBooking = data.allowSameDayBooking;
      if (data.cancellationDeadlineHours !== undefined) updatePayload.cancellationDeadlineHours = data.cancellationDeadlineHours;
      
      // Cancellation policy
      if (data.cancellationPolicy !== undefined) updatePayload.cancellationPolicy = data.cancellationPolicy;
      if (data.refundPercentage !== undefined) updatePayload.refundPercentage = data.refundPercentage;
      
      // No-show penalty
      if (data.noShowPenalty !== undefined) updatePayload.noShowPenalty = data.noShowPenalty;
      if (data.noShowPenaltyType !== undefined) updatePayload.noShowPenaltyType = data.noShowPenaltyType;
      if (data.noShowPenaltyPercentage !== undefined) updatePayload.noShowPenaltyPercentage = data.noShowPenaltyPercentage;
      
      // Deposit payment deadline
      if (data.depositPaymentDeadlineHours !== undefined) updatePayload.depositPaymentDeadlineHours = data.depositPaymentDeadlineHours;
      
      // Open/Closed status
      if (data.isOpen !== undefined) updatePayload.isOpen = data.isOpen;
      
      // Only include phone if it's a valid format (strip non-numeric for validation)
      if (data.phone) {
        const cleanPhone = data.phone.replace(/[^\d+]/g, '');
        if (cleanPhone.length >= 10) {
          updatePayload.phone = cleanPhone;
        }
      }

      console.log('EstablishmentContext: Updating with payload:', updatePayload);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/establishments/${establishment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('EstablishmentContext: Update failed:', errorData);
        throw new Error(errorData.message || 'Error updating establishment');
      }

      const result = await response.json();
      console.log('EstablishmentContext: Update successful:', result);

      // Update local state with the response data
      const updatedEstablishment = {
        ...establishment,
        ...data,
        updatedAt: new Date()
      };

      setEstablishment(updatedEstablishment);
      localStorage.setItem('establishmentRegistrationData', JSON.stringify(updatedEstablishment));
    } catch (error) {
      console.error('Error updating establishment:', error);
      throw error;
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
