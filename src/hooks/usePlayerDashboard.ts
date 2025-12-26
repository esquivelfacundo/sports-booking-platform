'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  establishmentName: string;
  establishmentId: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  totalAmount: number;
  location?: string;
}

interface Favorite {
  id: string;
  establishmentId: string;
  establishmentName: string;
  location: string;
  rating: number;
  reviewCount: number;
  sports: string[];
  priceRange: string;
  image?: string;
}

interface DashboardStats {
  totalReservations: number;
  upcomingReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  totalFavorites: number;
  totalSpent: number;
}

export function usePlayerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    upcomingReservations: 0,
    completedReservations: 0,
    cancelledReservations: 0,
    totalFavorites: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user bookings
  const loadBookings = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      const response = await apiClient.getBookings({ userId: user.id }) as any;
      const bookingsData = response?.bookings || response?.data || response || [];
      
      // Ensure bookingsData is an array
      if (!Array.isArray(bookingsData)) {
        console.warn('Bookings response is not an array:', bookingsData);
        setBookings([]);
        return;
      }
      
      // Transform API response to our format
      const transformedBookings: Booking[] = bookingsData.map((b: any) => ({
        id: b.id,
        courtId: b.courtId,
        courtName: b.court?.name || b.courtName || 'Cancha',
        establishmentName: b.court?.establishment?.name || b.establishmentName || 'Establecimiento',
        establishmentId: b.court?.establishmentId || b.establishmentId,
        sport: b.court?.sport || b.sport || 'Deporte',
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        duration: b.duration || 60,
        status: b.status,
        paymentStatus: b.paymentStatus || 'pending',
        totalAmount: b.totalAmount || 0,
        location: b.court?.establishment?.city || b.location || '',
      }));
      
      setBookings(transformedBookings);
      
      // Calculate stats
      const now = new Date();
      const upcoming = transformedBookings.filter(b => 
        new Date(b.date) >= now && b.status !== 'cancelled'
      );
      const completed = transformedBookings.filter(b => b.status === 'completed');
      const cancelled = transformedBookings.filter(b => b.status === 'cancelled');
      const totalSpent = completed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalReservations: transformedBookings.length,
        upcomingReservations: upcoming.length,
        completedReservations: completed.length,
        cancelledReservations: cancelled.length,
        totalSpent,
      }));
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  }, [isAuthenticated, user?.id]);

  // Load user favorites
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await apiClient.getFavorites() as any;
      const favoritesData = response?.data || response || [];
      
      // Ensure favoritesData is an array
      if (!Array.isArray(favoritesData)) {
        console.warn('Favorites response is not an array:', favoritesData);
        setFavorites([]);
        return;
      }
      
      // Transform API response to our format
      const transformedFavorites: Favorite[] = favoritesData.map((f: any) => ({
        id: f.id,
        establishmentId: f.establishmentId || f.establishment?.id,
        establishmentName: f.establishment?.name || f.name || 'Establecimiento',
        location: f.establishment?.city ? `${f.establishment.city}, ${f.establishment.province}` : '',
        rating: f.establishment?.rating || 0,
        reviewCount: f.establishment?.totalReviews || 0,
        sports: f.establishment?.sports || [],
        priceRange: f.establishment?.priceRange || '',
        image: f.establishment?.images?.[0] || null,
      }));
      
      setFavorites(transformedFavorites);
      setStats(prev => ({
        ...prev,
        totalFavorites: transformedFavorites.length,
      }));
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }, [isAuthenticated]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      await apiClient.cancelBooking(bookingId);
      await loadBookings();
      return true;
    } catch (err) {
      console.error('Error cancelling booking:', err);
      return false;
    }
  }, [loadBookings]);

  // Remove favorite
  const removeFavorite = useCallback(async (establishmentId: string) => {
    try {
      await apiClient.removeFavorite(establishmentId);
      await loadFavorites();
      return true;
    } catch (err) {
      console.error('Error removing favorite:', err);
      return false;
    }
  }, [loadFavorites]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([loadBookings(), loadFavorites()]);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, loadBookings, loadFavorites]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([loadBookings(), loadFavorites()]);
  }, [loadBookings, loadFavorites]);

  // Get bookings by status
  const getUpcomingBookings = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return bookings.filter(b => {
      if (b.status !== 'confirmed' && b.status !== 'in_progress') return false;
      
      const bookingDate = b.date;
      
      // If booking is in the future, include it
      if (bookingDate > today) return true;
      
      // If booking is today, check if the time hasn't passed yet
      if (bookingDate === today) {
        const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
        const bookingEndTime = b.endTime || b.startTime;
        return bookingEndTime > currentTime;
      }
      
      return false;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bookings]);

  const getPastBookings = useCallback(() => {
    return bookings.filter(b => 
      b.status === 'completed'
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings]);

  const getCancelledBookings = useCallback(() => {
    return bookings.filter(b => b.status === 'cancelled')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings]);

  const getNoShowBookings = useCallback(() => {
    return bookings.filter(b => b.status === 'no_show')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings]);

  return {
    // Data
    bookings,
    favorites,
    stats,
    loading,
    error,
    
    // Computed
    upcomingBookings: getUpcomingBookings(),
    pastBookings: getPastBookings(),
    cancelledBookings: getCancelledBookings(),
    noShowBookings: getNoShowBookings(),
    
    // Actions
    cancelBooking,
    removeFavorite,
    refresh,
    loadBookings,
    loadFavorites,
  };
}
