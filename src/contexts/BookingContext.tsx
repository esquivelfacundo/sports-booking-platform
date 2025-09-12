'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStats, BookingFilters } from '@/types/booking';

interface BookingContextType {
  bookings: Booking[];
  bookingStats: BookingStats;
  isLoading: boolean;
  filters: BookingFilters;
  setFilters: (filters: BookingFilters) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  getFilteredBookings: () => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Mock booking data
const mockBookings: Booking[] = [
  {
    id: '1',
    userId: 'user1',
    facilityId: 'facility1',
    facilityName: 'Club Atlético River Plate',
    facilityImage: '/api/placeholder/400/300',
    facilityAddress: 'Av. Figueroa Alcorta 7597, Buenos Aires',
    sport: 'Fútbol 5',
    date: '2024-01-15',
    startTime: '18:00',
    endTime: '19:00',
    duration: 1,
    price: 8000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Tarjeta de crédito',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    notes: 'Partido con amigos del trabajo',
    participants: ['Juan Pérez', 'María García', 'Carlos López'],
    maxParticipants: 10
  },
  {
    id: '2',
    userId: 'user1',
    facilityId: 'facility2',
    facilityName: 'Paddle Club Palermo',
    facilityImage: '/api/placeholder/400/300',
    facilityAddress: 'Av. del Libertador 4500, Palermo',
    sport: 'Paddle',
    date: '2024-01-20',
    startTime: '20:00',
    endTime: '21:30',
    duration: 1.5,
    price: 6000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Mercado Pago',
    createdAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    participants: ['Ana Martínez', 'Diego Rodríguez'],
    maxParticipants: 4
  },
  {
    id: '3',
    userId: 'user1',
    facilityId: 'facility3',
    facilityName: 'Tennis Club Belgrano',
    facilityImage: '/api/placeholder/400/300',
    facilityAddress: 'Av. Cabildo 2100, Belgrano',
    sport: 'Tenis',
    date: '2024-01-08',
    startTime: '16:00',
    endTime: '17:00',
    duration: 1,
    price: 4500,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'Efectivo',
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-08T17:00:00Z',
    participants: ['Roberto Silva'],
    maxParticipants: 2
  },
  {
    id: '4',
    userId: 'user1',
    facilityId: 'facility4',
    facilityName: 'Complejo Deportivo Norte',
    facilityImage: '/api/placeholder/400/300',
    facilityAddress: 'Av. General Paz 1200, Villa Urquiza',
    sport: 'Básquet',
    date: '2024-01-25',
    startTime: '19:00',
    endTime: '20:30',
    duration: 1.5,
    price: 7200,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'Transferencia',
    createdAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
    participants: ['Equipo Los Halcones'],
    maxParticipants: 10
  },
  {
    id: '5',
    userId: 'user1',
    facilityId: 'facility5',
    facilityName: 'Futsal San Telmo',
    facilityImage: '/api/placeholder/400/300',
    facilityAddress: 'Defensa 800, San Telmo',
    sport: 'Fútbol 5',
    date: '2024-01-03',
    startTime: '21:00',
    endTime: '22:00',
    duration: 1,
    price: 7500,
    status: 'cancelled',
    paymentStatus: 'failed',
    paymentMethod: 'Tarjeta de débito',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-02T10:30:00Z',
    notes: 'Cancelado por lluvia'
  }
];

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newBooking: Booking = {
      ...bookingData,
      id: `booking_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setBookings(prev => [newBooking, ...prev]);
    setIsLoading(false);
  };

  const cancelBooking = async (bookingId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
        : booking
    ));
    
    setIsLoading(false);
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
        : booking
    ));
    
    setIsLoading(false);
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
      filters,
      setFilters,
      createBooking,
      cancelBooking,
      updateBooking,
      getFilteredBookings
    }}>
      {children}
    </BookingContext.Provider>
  );
};
