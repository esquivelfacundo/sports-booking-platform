'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Types for establishment admin data
export interface AdminReservation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  court: string;
  courtId: string;
  date: string;
  time: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  notes?: string;
}

export interface AdminCourt {
  id: string;
  name: string;
  sport: string;
  surface: string;
  isIndoor: boolean;
  capacity: number;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  amenities: string[];
  isActive: boolean;
  description?: string;
}

export interface AdminStats {
  todayBookings: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  occupancyRate: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface UseEstablishmentAdminReturn {
  // Data
  establishmentId: string | null;
  reservations: AdminReservation[];
  courts: AdminCourt[];
  stats: AdminStats;
  notifications: AdminNotification[];
  
  // Loading states
  loading: boolean;
  reservationsLoading: boolean;
  courtsLoading: boolean;
  statsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions - Reservations
  loadReservations: (filters?: { status?: string; date?: string; courtId?: string }) => Promise<void>;
  confirmReservation: (reservationId: string) => Promise<boolean>;
  cancelReservation: (reservationId: string, reason?: string) => Promise<boolean>;
  completeReservation: (reservationId: string) => Promise<boolean>;
  
  // Actions - Courts
  loadCourts: () => Promise<void>;
  createCourt: (courtData: Partial<AdminCourt>) => Promise<boolean>;
  updateCourt: (courtId: string, courtData: Partial<AdminCourt>) => Promise<boolean>;
  deleteCourt: (courtId: string) => Promise<boolean>;
  
  // Actions - Stats
  loadStats: () => Promise<void>;
  
  // Actions - Notifications
  loadNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  
  // Refresh all data
  refreshAll: () => Promise<void>;
}

export const useEstablishmentAdmin = (): UseEstablishmentAdminReturn => {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [courts, setCourts] = useState<AdminCourt[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    todayBookings: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    occupancyRate: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0
  });
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Get establishment ID on mount
  useEffect(() => {
    console.log('useEstablishmentAdmin: useEffect triggered, isAuthenticated:', isAuthenticated, 'userType:', user?.userType);
    
    const loadEstablishmentId = async () => {
      if (!isAuthenticated) {
        console.log('useEstablishmentAdmin: Not authenticated, skipping');
        setLoading(false);
        return;
      }

      // For admin users, get the first establishment or allow selection
      if (user?.userType === 'admin') {
        try {
          console.log('useEstablishmentAdmin: Admin user detected, loading establishments...');
          // Admin can see all establishments - get the first one for now
          const response = await apiClient.getEstablishments() as any;
          // getEstablishments already returns the array directly (response.data || response || [])
          const establishments = Array.isArray(response) ? response : (response.data || response.establishments || []);
          console.log('useEstablishmentAdmin: Found establishments:', establishments.length, establishments);
          if (establishments.length > 0) {
            console.log('useEstablishmentAdmin: Setting establishmentId to:', establishments[0].id);
            setEstablishmentId(establishments[0].id);
          }
        } catch (err) {
          console.error('Error loading establishments for admin:', err);
          setError('Error al cargar establecimientos');
        } finally {
          setLoading(false);
        }
        return;
      }

      // For establishment users, get their own establishment
      if (user?.userType !== 'establishment') {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.getMyEstablishments() as any;
        if (response.establishment?.id) {
          setEstablishmentId(response.establishment.id);
        }
      } catch (err) {
        console.error('Error loading establishment ID:', err);
        setError('Error al cargar datos del establecimiento');
      } finally {
        setLoading(false);
      }
    };

    loadEstablishmentId();
  }, [isAuthenticated, user]);

  // Load reservations
  const loadReservations = useCallback(async (filters?: { status?: string; date?: string; courtId?: string }) => {
    if (!establishmentId) {
      console.log('useEstablishmentAdmin: No establishmentId, skipping loadReservations');
      return;
    }
    
    console.log('useEstablishmentAdmin: Loading reservations for establishment:', establishmentId);
    setReservationsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getEstablishmentBookings(establishmentId, {
        status: filters?.status,
        date: filters?.date,
        limit: 100
      }) as any;
      
      console.log('useEstablishmentAdmin: Reservations response:', response);
      const bookingsData = response.data || response.bookings || [];
      
      const transformedReservations: AdminReservation[] = bookingsData.map((booking: any) => ({
        id: booking.id,
        clientName: booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Cliente',
        clientEmail: booking.user?.email || '',
        clientPhone: booking.user?.phone || '',
        court: booking.court?.name || 'Cancha',
        courtId: booking.courtId,
        date: booking.date,
        time: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration || 60,
        price: parseFloat(booking.totalAmount) || 0,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
        notes: booking.notes
      }));
      
      setReservations(transformedReservations);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('Error al cargar reservas');
      setReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  }, [establishmentId]);

  // Load courts
  const loadCourts = useCallback(async () => {
    if (!establishmentId) return;
    
    setCourtsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getCourts(establishmentId) as any;
      const courtsData = response.courts || response.data || [];
      
      const transformedCourts: AdminCourt[] = courtsData.map((court: any) => ({
        id: court.id,
        name: court.name,
        sport: court.sport,
        surface: court.surface,
        isIndoor: court.isIndoor,
        capacity: court.capacity,
        pricePerHour: parseFloat(court.pricePerHour) || 0,
        pricePerHour90: court.pricePerHour90 ? parseFloat(court.pricePerHour90) : undefined,
        pricePerHour120: court.pricePerHour120 ? parseFloat(court.pricePerHour120) : undefined,
        amenities: court.amenities || [],
        isActive: court.isActive,
        description: court.description
      }));
      
      setCourts(transformedCourts);
    } catch (err) {
      console.error('Error loading courts:', err);
      setError('Error al cargar canchas');
      setCourts([]);
    } finally {
      setCourtsLoading(false);
    }
  }, [establishmentId]);

  // Load stats
  const loadStats = useCallback(async () => {
    if (!establishmentId) return;
    
    setStatsLoading(true);
    
    try {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Load bookings to calculate stats
      const response = await apiClient.getEstablishmentBookings(establishmentId, { limit: 100 }) as any;
      const bookings = response.data || response.bookings || [];
      
      // Calculate stats from bookings
      const todayBookings = bookings.filter((b: any) => b.date === today);
      const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed');
      const pendingBookings = bookings.filter((b: any) => b.status === 'pending');
      const cancelledBookings = bookings.filter((b: any) => b.status === 'cancelled');
      const paidBookings = bookings.filter((b: any) => b.paymentStatus === 'paid' || b.paymentStatus === 'completed');
      
      const todayRevenue = todayBookings
        .filter((b: any) => b.paymentStatus === 'paid' || b.paymentStatus === 'completed')
        .reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0);
      
      const monthlyRevenue = paidBookings
        .reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0);
      
      // Get unique clients
      const uniqueClients = new Set(bookings.map((b: any) => b.userId)).size;
      
      setStats({
        todayBookings: todayBookings.length,
        todayRevenue,
        monthlyRevenue,
        totalClients: uniqueClients,
        occupancyRate: 0, // TODO: Calculate based on available slots
        pendingBookings: pendingBookings.length,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: cancelledBookings.length
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [establishmentId]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const response = await apiClient.getNotifications() as any;
      const notificationsData = response.data || response.notifications || [];
      
      const transformedNotifications: AdminNotification[] = notificationsData.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title || getNotificationTitle(n.type),
        message: n.message || n.content,
        time: getRelativeTime(n.createdAt),
        read: n.isRead || n.read
      }));
      
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setNotifications([]);
    }
  }, []);

  // Confirm reservation
  const confirmReservation = useCallback(async (reservationId: string): Promise<boolean> => {
    try {
      await apiClient.updateBooking(reservationId, { status: 'confirmed' });
      await loadReservations();
      return true;
    } catch (err) {
      console.error('Error confirming reservation:', err);
      return false;
    }
  }, [loadReservations]);

  // Cancel reservation
  const cancelReservation = useCallback(async (reservationId: string, reason?: string): Promise<boolean> => {
    try {
      await apiClient.cancelBooking(reservationId);
      await loadReservations();
      return true;
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      return false;
    }
  }, [loadReservations]);

  // Complete reservation
  const completeReservation = useCallback(async (reservationId: string): Promise<boolean> => {
    try {
      await apiClient.updateBooking(reservationId, { status: 'completed' });
      await loadReservations();
      return true;
    } catch (err) {
      console.error('Error completing reservation:', err);
      return false;
    }
  }, [loadReservations]);

  // Create court
  const createCourt = useCallback(async (courtData: Partial<AdminCourt>): Promise<boolean> => {
    if (!establishmentId) return false;
    
    try {
      await apiClient.createCourt({
        establishmentId,
        ...courtData
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
      await apiClient.updateCourt(courtId, courtData);
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

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await apiClient.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!establishmentId) return;
    
    await Promise.all([
      loadReservations(),
      loadCourts(),
      loadStats(),
      loadNotifications()
    ]);
  }, [establishmentId, loadReservations, loadCourts, loadStats, loadNotifications]);

  // Load initial data when establishment ID is available
  useEffect(() => {
    if (establishmentId) {
      console.log('useEstablishmentAdmin: Loading data for establishment:', establishmentId);
      refreshAll();
    }
  }, [establishmentId, refreshAll]);

  return {
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
    confirmReservation,
    cancelReservation,
    completeReservation,
    loadCourts,
    createCourt,
    updateCourt,
    deleteCourt,
    loadStats,
    loadNotifications,
    markNotificationRead,
    refreshAll
  };
};

// Helper functions
function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    'booking_confirmed': 'Reserva confirmada',
    'booking_cancelled': 'Reserva cancelada',
    'booking_reminder': 'Recordatorio de reserva',
    'payment_received': 'Pago recibido',
    'payment_failed': 'Pago fallido',
    'review_request': 'Nueva reseña',
    'system_announcement': 'Anuncio del sistema'
  };
  return titles[type] || 'Notificación';
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
}

export default useEstablishmentAdmin;
