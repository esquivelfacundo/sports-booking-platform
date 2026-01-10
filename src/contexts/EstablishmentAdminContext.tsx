'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import type { AdminReservation, AdminCourt, AdminStats, AdminNotification } from '@/types/admin';

// Re-export types for convenience
export type { AdminReservation, AdminCourt, AdminStats, AdminNotification } from '@/types/admin';

// Helper function to map surface names
const mapSurface = (surface?: string): string => {
  const surfaceMap: Record<string, string> = {
    'Césped sintético': 'synthetic',
    'Césped natural': 'grass',
    'Polvo de ladrillo': 'clay',
    'Cemento': 'hard',
    'Parquet': 'indoor',
    'Arena': 'outdoor',
    'synthetic': 'synthetic',
    'grass': 'grass',
    'clay': 'clay',
    'hard': 'hard',
    'indoor': 'indoor',
    'outdoor': 'outdoor',
  };
  return surface ? (surfaceMap[surface] || 'synthetic') : 'synthetic';
};

// SWR fetchers for different data types
const courtsFetcher = async (key: string): Promise<AdminCourt[]> => {
  const establishmentId = key.split('establishmentId=')[1];
  if (!establishmentId) return [];
  const response = await apiClient.getCourts(establishmentId) as any;
  const courtsData = response.data || response.courts || [];
  return courtsData.map((court: any) => ({
    id: court.id,
    name: court.name,
    sport: court.sport,
    pricePerHour: parseFloat(court.pricePerHour) || 0,
    pricePerHour90: court.pricePerHour90 ? parseFloat(court.pricePerHour90) : undefined,
    pricePerHour120: court.pricePerHour120 ? parseFloat(court.pricePerHour120) : undefined,
    priceSchedules: court.priceSchedules || [],
    isActive: court.isActive !== false,
    description: court.description,
    images: court.images,
    surface: court.surface,
    covered: court.covered,
    lighting: court.lighting,
    features: court.features
  }));
};

const statsFetcher = async (key: string): Promise<AdminStats> => {
  const establishmentId = key.split('establishmentId=')[1];
  if (!establishmentId) return {
    todayBookings: 0, todayRevenue: 0, monthlyRevenue: 0, totalClients: 0,
    occupancyRate: 0, pendingBookings: 0, confirmedBookings: 0, cancelledBookings: 0
  };
  const response = await apiClient.getEstablishmentStats(establishmentId) as any;
  if (response.success && response.stats) {
    return {
      todayBookings: response.stats.todayBookings || 0,
      todayRevenue: response.stats.todayRevenue || 0,
      monthlyRevenue: response.stats.monthlyRevenue || 0,
      totalClients: response.stats.totalClients || 0,
      occupancyRate: response.stats.occupancyRate || 0,
      pendingBookings: response.stats.pendingBookings || 0,
      confirmedBookings: response.stats.confirmedBookings || 0,
      cancelledBookings: response.stats.cancelledBookings || 0
    };
  }
  return {
    todayBookings: 0, todayRevenue: 0, monthlyRevenue: 0, totalClients: 0,
    occupancyRate: 0, pendingBookings: 0, confirmedBookings: 0, cancelledBookings: 0
  };
};

const notificationsFetcher = async (): Promise<AdminNotification[]> => {
  const response = await apiClient.getNotifications() as any;
  return response.data || response.notifications || [];
};

interface EstablishmentAdminContextType {
  establishmentId: string | null;
  reservations: AdminReservation[];
  courts: AdminCourt[];
  stats: AdminStats;
  notifications: AdminNotification[];
  loading: boolean;
  reservationsLoading: boolean;
  courtsLoading: boolean;
  statsLoading: boolean;
  error: string | null;
  loadReservations: (filters?: {
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    futureOnly?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  loadCourts: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  confirmReservation: (id: string) => Promise<boolean>;
  cancelReservation: (id: string) => Promise<boolean>;
  startReservation: (id: string) => Promise<{ success: boolean; orders?: Array<{ id: string; orderNumber: string }> }>;
  completeReservation: (id: string) => Promise<boolean>;
  markNoShow: (id: string) => Promise<boolean>;
  moveReservation: (id: string, newCourtId: string, newStartTime: string) => Promise<{ success: boolean; error?: string }>;
  addReservationToState: (reservation: AdminReservation) => void;
  createCourt: (courtData: Partial<AdminCourt>) => Promise<boolean>;
  updateCourt: (courtId: string, courtData: Partial<AdminCourt>) => Promise<boolean>;
  deleteCourt: (courtId: string) => Promise<boolean>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const EstablishmentAdminContext = createContext<EstablishmentAdminContextType | undefined>(undefined);

// Default stats object
const defaultStats: AdminStats = {
  todayBookings: 0,
  todayRevenue: 0,
  monthlyRevenue: 0,
  totalClients: 0,
  occupancyRate: 0,
  pendingBookings: 0,
  confirmedBookings: 0,
  cancelledBookings: 0
};

export const EstablishmentAdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { establishment } = useEstablishment();
  
  // State - establishmentId now derived from EstablishmentContext when possible
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  
  // Loading states for reservations (still managed manually due to dynamic filters)
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SWR keys
  const courtsKey = establishmentId ? `courts?establishmentId=${establishmentId}` : null;
  const statsKey = establishmentId ? `stats?establishmentId=${establishmentId}` : null;
  const notificationsKey = establishmentId ? 'notifications' : null;

  // SWR hooks for cached data
  const { 
    data: courts = [], 
    isLoading: courtsLoading,
    mutate: mutateCourts 
  } = useSWR<AdminCourt[]>(courtsKey, courtsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    keepPreviousData: true,
  });

  const { 
    data: stats = defaultStats, 
    isLoading: statsLoading,
    mutate: mutateStats 
  } = useSWR<AdminStats>(statsKey, statsFetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  const { 
    data: notifications = [], 
    mutate: mutateNotifications 
  } = useSWR<AdminNotification[]>(notificationsKey, notificationsFetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  // Combined loading state
  const loading = courtsLoading || statsLoading;

  // Reset state when user logs out
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setEstablishmentId(null);
      setReservations([]);
      return;
    }

    // Use establishment from EstablishmentContext if available (eliminates duplicate API call)
    if (establishment?.id) {
      setEstablishmentId(establishment.id);
      return;
    }

    // Fallback for staff users who have establishmentId directly in user object
    if (user.isStaff && user.establishmentId) {
      setEstablishmentId(user.establishmentId);
    }
  }, [isAuthenticated, user, establishment?.id]);

  // Load reservations
  const loadReservations = useCallback(async (filters?: {
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    futureOnly?: boolean;
    page?: number;
    limit?: number;
  }) => {
    if (!establishmentId) return;
    
    setReservationsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getEstablishmentBookings(establishmentId, {
        status: filters?.status,
        date: filters?.date,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        futureOnly: filters?.futureOnly,
        page: filters?.page || 1,
        limit: filters?.limit || 100
      }) as any;
      
      const bookingsData = response.data || response.bookings || [];
      
      const transformedReservations: AdminReservation[] = bookingsData.map((booking: any) => {
        const normalizeTime = (time: string): string => {
          if (!time) return '';
          return time.substring(0, 5);
        };
        
        return {
          id: booking.id,
          establishmentId: booking.establishmentId || establishmentId,
          clientName: booking.clientName || (booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Cliente'),
          clientEmail: booking.clientEmail || booking.user?.email || '',
          clientPhone: booking.clientPhone || booking.user?.phone || '',
          court: booking.court?.name || booking.amenity?.name || 'Sin asignar',
          courtId: booking.courtId || undefined,
          amenityId: booking.amenityId || undefined,
          sportName: booking.court?.sport || (booking.amenityId ? 'amenity' : undefined),
          date: booking.date,
          time: normalizeTime(booking.startTime),
          endTime: normalizeTime(booking.endTime),
          duration: booking.duration || 60,
          price: parseFloat(booking.totalAmount) || 0,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
          notes: booking.notes,
          isRecurring: booking.isRecurring || false,
          depositAmount: parseFloat(booking.depositAmount) || 0,
          initialDeposit: parseFloat(booking.initialDeposit) || 0,
          depositPercent: booking.depositPercent || undefined,
          depositMethod: booking.depositMethod || null,
          serviceFee: parseFloat(booking.serviceFee) || 0,
          mpPaymentId: booking.mpPaymentId || undefined,
          paidAt: booking.paidAt || undefined,
          establishment: booking.establishment || undefined,
          orders: booking.orders || undefined
        };
      });
      
      setReservations(transformedReservations);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('Error al cargar reservas');
    } finally {
      setReservationsLoading(false);
    }
  }, [establishmentId]);

  // Load courts - now triggers SWR revalidation
  const loadCourts = useCallback(async () => {
    if (!establishmentId) return;
    await mutateCourts();
  }, [establishmentId, mutateCourts]);

  // Load stats - now triggers SWR revalidation
  const loadStats = useCallback(async () => {
    if (!establishmentId) return;
    await mutateStats();
  }, [establishmentId, mutateStats]);

  // Load notifications - now triggers SWR revalidation
  const loadNotifications = useCallback(async () => {
    if (!establishmentId) return;
    await mutateNotifications();
  }, [establishmentId, mutateNotifications]);

  // Reservation actions
  const confirmReservation = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.updateBooking(id, { status: 'confirmed' });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' as const } : r));
      return true;
    } catch (err) {
      console.error('Error confirming reservation:', err);
      return false;
    }
  }, []);

  const cancelReservation = useCallback(async (id: string, reason: string = 'Cancelado por administrador'): Promise<boolean> => {
    try {
      await apiClient.updateBooking(id, { status: 'cancelled', cancellationReason: reason });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r));
      return true;
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      return false;
    }
  }, []);

  const startReservation = useCallback(async (id: string): Promise<{ success: boolean; orders?: Array<{ id: string; orderNumber: string }> }> => {
    try {
      const response = await apiClient.updateBooking(id, { status: 'in_progress' }) as any;
      const orders = response?.booking?.orders || [];
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'in_progress' as const, orders } : r));
      return { success: true, orders };
    } catch (err) {
      console.error('Error starting reservation:', err);
      return { success: false };
    }
  }, []);

  const completeReservation = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.updateBooking(id, { status: 'completed' });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' as const } : r));
      return true;
    } catch (err) {
      console.error('Error completing reservation:', err);
      return false;
    }
  }, []);

  const markNoShow = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.updateBooking(id, { status: 'no_show' });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'no_show' as const } : r));
      return true;
    } catch (err) {
      console.error('Error marking no-show:', err);
      return false;
    }
  }, []);

  const moveReservation = useCallback(async (id: string, newCourtId: string, newStartTime: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find the reservation to get its date
      const reservation = reservations.find(r => r.id === id);
      if (!reservation) {
        return { success: false, error: 'Reserva no encontrada' };
      }
      
      // Calculate new end time based on duration
      const [hours, minutes] = newStartTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + reservation.duration;
      const newEndTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
      
      // Find new court name
      const newCourt = courts.find(c => c.id === newCourtId);
      
      // Optimistic update
      setReservations(prev => prev.map(r => 
        r.id === id 
          ? { ...r, courtId: newCourtId, court: newCourt?.name || r.court, time: newStartTime, endTime: newEndTime }
          : r
      ));
      
      await apiClient.updateBooking(id, { 
        courtId: newCourtId,
        startTime: newStartTime,
        endTime: newEndTime
      });
      return { success: true };
    } catch (err: any) {
      console.error('Error moving reservation:', err);
      // Reload to revert optimistic update
      return { success: false, error: err.message || 'Error al mover la reserva' };
    }
  }, [reservations, courts]);

  const addReservationToState = useCallback((reservation: AdminReservation) => {
    setReservations(prev => [reservation, ...prev]);
  }, []);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await apiClient.markNotificationRead(notificationId);
      // Optimistically update the cache
      mutateNotifications(
        (current: AdminNotification[] | undefined) => 
          current?.map((n: AdminNotification) => n.id === notificationId ? { ...n, isRead: true } : n) || [],
        { revalidate: false }
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  }, [mutateNotifications]);

  const refreshAll = useCallback(async () => {
    if (!establishmentId) return;
    await Promise.all([loadReservations(), loadCourts(), loadStats(), loadNotifications()]);
  }, [establishmentId, loadReservations, loadCourts, loadStats, loadNotifications]);

  // Create court
  const createCourt = useCallback(async (courtData: Partial<AdminCourt>): Promise<boolean> => {
    if (!establishmentId) return false;
    
    try {
      await apiClient.createCourt({
        establishmentId,
        name: courtData.name || 'Nueva Cancha',
        sport: courtData.sport,
        surface: mapSurface(courtData.surface),
        isIndoor: courtData.isIndoor,
        capacity: courtData.capacity,
        pricePerHour: courtData.pricePerHour,
        pricePerHour90: courtData.pricePerHour90,
        pricePerHour120: courtData.pricePerHour120,
        amenities: courtData.amenities,
        description: courtData.description,
      });
      await loadCourts();
      return true;
    } catch (err) {
      console.error('Error creating court:', err);
      return false;
    }
  }, [establishmentId, loadCourts]);

  // Update court
  const updateCourt = useCallback(async (courtId: string, courtData: Partial<AdminCourt>): Promise<boolean> => {
    try {
      const mappedData = {
        ...courtData,
        surface: courtData.surface ? mapSurface(courtData.surface) : undefined,
      };
      
      await apiClient.updateCourt(courtId, mappedData);
      await loadCourts();
      return true;
    } catch (err) {
      console.error('Error updating court:', err);
      return false;
    }
  }, [loadCourts]);

  // Delete court
  const deleteCourt = useCallback(async (courtId: string): Promise<boolean> => {
    try {
      await apiClient.deleteCourt(courtId);
      await loadCourts();
      return true;
    } catch (err) {
      console.error('Error deleting court:', err);
      return false;
    }
  }, [loadCourts]);

  // Note: Initial data loading is now handled automatically by SWR
  // when the establishment ID becomes available (via the SWR keys)

  return (
    <EstablishmentAdminContext.Provider value={{
      establishmentId,
      reservations,
      courts,
      stats,
      notifications,
      loading,
      reservationsLoading,
      courtsLoading,
      statsLoading,
      error,
      loadReservations,
      loadCourts,
      loadStats,
      loadNotifications,
      confirmReservation,
      cancelReservation,
      startReservation,
      completeReservation,
      markNoShow,
      moveReservation,
      addReservationToState,
      createCourt,
      updateCourt,
      deleteCourt,
      markNotificationRead,
      refreshAll
    }}>
      {children}
    </EstablishmentAdminContext.Provider>
  );
};

export const useEstablishmentAdminContext = (): EstablishmentAdminContextType => {
  const context = useContext(EstablishmentAdminContext);
  if (context === undefined) {
    throw new Error('useEstablishmentAdminContext must be used within an EstablishmentAdminProvider');
  }
  return context;
};
