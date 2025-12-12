'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Booking, BookingStats, BookingFilters } from '@/types/booking';
import { apiClient } from '@/lib/api';

interface BookingContextType {
  bookings: Booking[];
  bookingStats: BookingStats;
  isLoading: boolean;
  error: string | null;
  filters: BookingFilters;
  setFilters: (filters: BookingFilters) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  getFilteredBookings: () => Booking[];
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Transform backend booking data to frontend format
const transformBooking = (backendBooking: any): Booking => {
  return {
    id: backendBooking.id,
    odId: backendBooking.odId,
    facilityId: backendBooking.establishmentId || backendBooking.court?.establishmentId,
    facilityName: backendBooking.establishment?.name || backendBooking.court?.establishment?.name || 'Establecimiento',
    facilityImage: backendBooking.establishment?.images?.[0] || '/api/placeholder/400/300',
    facilityAddress: backendBooking.establishment?.address || '',
    sport: backendBooking.court?.sport || backendBooking.sport || 'Deporte',
    date: backendBooking.date,
    startTime: backendBooking.startTime,
    endTime: backendBooking.endTime,
    duration: backendBooking.duration || 60,
    price: backendBooking.totalAmount || backendBooking.price || 0,
    status: backendBooking.status,
    paymentStatus: backendBooking.paymentStatus || 'pending',
    paymentMethod: backendBooking.paymentMethod || '',
    createdAt: backendBooking.createdAt,
    updatedAt: backendBooking.updatedAt,
    notes: backendBooking.notes || '',
    participants: backendBooking.participants || [],
    maxParticipants: backendBooking.playerCount || backendBooking.court?.capacity || 10,
    courtId: backendBooking.courtId,
    courtName: backendBooking.court?.name
  };
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Load bookings from API
  const loadBookings = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (!token) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getBookings() as any;
      const bookingsData = response.data || response || [];
      
      // Transform backend data to frontend format
      const transformedBookings = Array.isArray(bookingsData) 
        ? bookingsData.map(transformBooking)
        : [];
      
      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Error al cargar las reservas');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load bookings on mount and when auth changes
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Refresh bookings function
  const refreshBookings = async () => {
    await loadBookings();
  };

  // Calculate booking stats
  const bookingStats: BookingStats = {
    totalBookings: bookings.length,
    upcomingBookings: bookings.filter(b => b.status === 'confirmed' && new Date(b.date) > new Date()).length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    totalSpent: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.price, 0),
    favoritesSport: 'Fútbol 5', // Most booked sport
    hoursPlayed: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.duration, 0)
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createBooking({
        courtId: bookingData.courtId || '',
        date: bookingData.date,
        startTime: bookingData.startTime,
        duration: bookingData.duration,
        paymentType: 'full',
        participants: bookingData.participants
      }) as any;
      
      const newBooking = transformBooking(response.data || response);
      setBookings(prev => [newBooking, ...prev]);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Error al crear la reserva');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.cancelBooking(bookingId);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
          : booking
      ));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Error al cancelar la reserva');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, update locally - backend PUT endpoint can be called here
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
          : booking
      ));
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Error al actualizar la reserva');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredBookings = (): Booking[] => {
    let filtered = [...bookings];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'upcoming') {
        filtered = filtered.filter(b => 
          (b.status === 'confirmed' || b.status === 'pending') && 
          new Date(b.date) >= new Date()
        );
      } else {
        filtered = filtered.filter(b => b.status === filters.status);
      }
    }

    // Filter by sport
    if (filters.sport) {
      filtered = filtered.filter(b => b.sport === filters.sport);
    }

    // Filter by date range
    if (filters.dateRange) {
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.date);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.date + ' ' + a.startTime);
            bValue = new Date(b.date + ' ' + b.startTime);
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'facility':
            aValue = a.facilityName;
            bValue = b.facilityName;
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      bookingStats,
      isLoading,
      error,
      filters,
      setFilters,
      createBooking,
      cancelBooking,
      updateBooking,
      getFilteredBookings,
      refreshBookings
    }}>
      {children}
    </BookingContext.Provider>
  );
};
