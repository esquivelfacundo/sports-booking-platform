'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useEstablishmentAdminContext, AdminReservation } from '@/contexts/EstablishmentAdminContext';
import { useCommandMenu } from '@/contexts/CommandMenuContext';
import { CreateReservationSidebar } from '@/components/admin/CreateReservationSidebar';
import { BookingCalendarGrid } from '@/components/admin/BookingCalendarGrid';
import { CreateBookingSidebar } from '@/components/admin/CreateBookingSidebar';
import { ReservationDetailsSidebar } from '@/components/admin/ReservationDetailsSidebar';
import { usePinConfirmation } from '@/components/admin/PinConfirmation';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  CalendarDays,
  RefreshCw,
  DollarSign,
  Download,
  Phone,
  Copy,
  MoveHorizontal,
  MessageSquare,
  Save,
  X,
  CalendarX,
  RepeatIcon
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/api';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface Amenity {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  isBookable: boolean;
  isPublic: boolean;
  isActive: boolean;
  capacity?: number;
}

interface Reservation {
  id: string;
  establishmentId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  court: string;
  courtId?: string;
  amenityId?: string;
  date: string;
  time: string;
  endTime?: string;
  duration: number;
  price: number;
  status: 'confirmed' | 'pending' | 'in_progress' | 'cancelled' | 'completed' | 'no_show';
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
  notes?: string;
  isRecurring?: boolean;
  depositAmount?: number;
  initialDeposit?: number;
  depositPercent?: number;
  depositMethod?: string;
  serviceFee?: number;
  mpPaymentId?: string;
  paidAt?: string;
}

const ReservationsPage = () => {
  const { establishment, loading: establishmentLoading } = useEstablishment();
  const { 
    establishmentId,
    reservations: apiReservations, 
    courts: adminCourts,
    reservationsLoading,
    loadReservations,
    confirmReservation: apiConfirmReservation,
    cancelReservation: apiCancelReservation,
    startReservation: apiStartReservation,
    completeReservation: apiCompleteReservation,
    markNoShow: apiMarkNoShow,
    moveReservation: apiMoveReservation,
    addReservationToState,
    refreshAll
  } = useEstablishmentAdminContext();
  
  const { openCashRegisterAction } = useCommandMenu();
  const { showSuccess, showError, showWarning, showBookingNotification } = useToast();
  const { requestPin, PinModal } = usePinConfirmation();
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gridSelectedDate, setGridSelectedDate] = useState(new Date());
  const [showGridBookingSidebar, setShowGridBookingSidebar] = useState(false);
  const [gridSelectedCourt, setGridSelectedCourt] = useState<any>(null);
  const [gridSelectedTime, setGridSelectedTime] = useState('');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingNotes, setEditingNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  
  // Amenities state
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);

  // Load amenities
  useEffect(() => {
    const loadAmenities = async () => {
      if (!establishment?.id) return;
      setAmenitiesLoading(true);
      try {
        const response = await apiClient.getAmenities(establishment.id);
        // Only get bookable amenities
        const bookableAmenities = (response.amenities || []).filter((a: Amenity) => a.isBookable && a.isActive);
        setAmenities(bookableAmenities);
      } catch (error) {
        console.error('Error loading amenities:', error);
      } finally {
        setAmenitiesLoading(false);
      }
    };
    loadAmenities();
  }, [establishment?.id]);

  const loading = establishmentLoading || reservationsLoading;

  // Get opening hours for the selected date
  const getOpeningHoursForDate = (date: Date) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    
    // Get schedule from establishment
    const schedule = establishment?.schedule || establishment?.openingHours;
    if (!schedule || !schedule[dayName]) {
      return { startHour: 8, endHour: 23, isClosed: false };
    }
    
    const daySchedule = schedule[dayName];
    const isClosed = daySchedule.closed === true || daySchedule.isOpen === false;
    
    if (isClosed) {
      return { startHour: 8, endHour: 23, isClosed: true };
    }
    
    const startHour = parseInt(daySchedule.open?.split(':')[0] || '8');
    const endHour = parseInt(daySchedule.close?.split(':')[0] || '23');
    
    return { startHour, endHour, isClosed: false };
  };

  // Check if a date is closed (specific closed dates or national holidays)
  const isDateClosed = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check specific closed dates
    if (establishment?.closedDates?.includes(dateStr)) {
      return true;
    }
    
    // Check national holidays if enabled
    if (establishment?.useNationalHolidays !== false) {
      const nationalHolidays = [
        '2024-12-25', '2025-01-01', '2025-02-24', '2025-02-25', '2025-03-24',
        '2025-04-02', '2025-04-18', '2025-05-01', '2025-05-25', '2025-06-16',
        '2025-06-20', '2025-07-09', '2025-08-18', '2025-10-13', '2025-11-24',
        '2025-12-08', '2025-12-25'
      ];
      if (nationalHolidays.includes(dateStr)) {
        return true;
      }
    }
    
    return false;
  };

  // Get hours for the grid based on selected date
  const gridHours = getOpeningHoursForDate(gridSelectedDate);
  const isGridDateClosed = isDateClosed(gridSelectedDate) || gridHours.isClosed;

  // Get the header portal container on mount
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);

  // Transform API reservations to local format
  const reservations: Reservation[] = apiReservations.map(r => ({
    id: r.id,
    establishmentId: r.establishmentId || establishmentId || undefined,
    clientName: r.clientName,
    clientEmail: r.clientEmail,
    clientPhone: r.clientPhone,
    court: r.court,
    courtId: r.courtId,
    amenityId: r.amenityId,
    date: r.date,
    time: r.time,
    endTime: r.endTime,
    duration: r.duration,
    price: r.price,
    status: r.status,
    paymentStatus: r.paymentStatus === 'refunded' ? 'failed' : r.paymentStatus,
    createdAt: r.createdAt,
    notes: r.notes,
    isRecurring: r.isRecurring,
    depositAmount: r.depositAmount,
    initialDeposit: r.initialDeposit,
    depositPercent: r.depositPercent,
    depositMethod: r.depositMethod || undefined,
    serviceFee: r.serviceFee,
    mpPaymentId: r.mpPaymentId,
    paidAt: r.paidAt
  }));

  // Helper to get month date range
  const getMonthRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  };

  // Load reservations based on view mode
  useEffect(() => {
    // Wait for establishmentId to be available
    if (!establishmentId) {
      return;
    }
    
    const filters: { 
      status?: string; 
      date?: string; 
      startDate?: string; 
      endDate?: string;
      futureOnly?: boolean;
      limit?: number;
    } = {};
    
    if (selectedStatus !== 'all') filters.status = selectedStatus;
    
    // Both views use the selected date
    const dateStr = `${gridSelectedDate.getFullYear()}-${String(gridSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(gridSelectedDate.getDate()).padStart(2, '0')}`;
    filters.date = dateStr;
    filters.limit = 200; // Max bookings per day
    
    loadReservations(filters);
  }, [selectedStatus, viewMode, gridSelectedDate, loadReservations, establishmentId]);

  // Handlers for reservation management - using API with PIN validation
  const handleConfirmReservation = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    requestPin(async () => {
      const success = await apiConfirmReservation(reservationId);
      if (success) {
        showSuccess('Reserva confirmada', `${reservation?.clientName || 'Cliente'} - ${reservation?.court || 'Cancha'}`);
      } else {
        showError('Error al confirmar', 'No se pudo confirmar la reserva');
      }
    }, { title: 'Confirmar reserva', description: 'Ingresa tu PIN para confirmar la reserva' });
  };

  const handleCancelReservation = (reservationId: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      const reservation = reservations.find(r => r.id === reservationId);
      requestPin(async () => {
        const success = await apiCancelReservation(reservationId);
        if (success) {
          showWarning('Reserva cancelada', `${reservation?.clientName || 'Cliente'} - ${reservation?.court || 'Cancha'}`);
        } else {
          showError('Error al cancelar', 'No se pudo cancelar la reserva');
        }
      }, { title: 'Cancelar reserva', description: 'Ingresa tu PIN para cancelar la reserva' });
    }
  };

  const handleCompleteReservation = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    requestPin(async () => {
      const success = await apiCompleteReservation(reservationId);
      if (success) {
        showSuccess('Turno completado', `${reservation?.clientName || 'Cliente'} - ${reservation?.court || 'Cancha'}`);
      } else {
        showError('Error al completar', 'No se pudo completar el turno');
      }
    }, { title: 'Completar turno', description: 'Ingresa tu PIN para completar el turno' });
  };

  const handleMarkNoShow = async (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    const success = await apiMarkNoShow(reservationId);
    if (success) {
      showWarning('No asistió', `${reservation?.clientName || 'Cliente'} no se presentó a su turno`);
    } else {
      showError('Error', 'No se pudo marcar como no asistió');
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowEditModal(true);
  };

  const handleDeleteReservation = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      const reservation = reservations.find(r => r.id === id);
      const success = await apiCancelReservation(id);
      if (success) {
        showSuccess('Reserva eliminada', `${reservation?.clientName || 'Cliente'}`);
        // Refresh reservations list after deletion
        await loadReservations();
      } else {
        showError('Error al eliminar', 'No se pudo eliminar la reserva');
      }
    }
  };

  const handleSaveReservation = async (reservationData: Partial<Reservation>) => {
    if (!selectedReservation) return;
    
    setIsSaving(true);
    try {
      // Update reservation via API - send all allowed fields
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/bookings/${selectedReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          status: reservationData.status,
          notes: reservationData.notes || '',
          date: reservationData.date,
          startTime: reservationData.time,
          courtId: reservationData.court
        })
      });
      
      if (response.ok) {
        showSuccess('Reserva actualizada', `${selectedReservation.clientName}`);
        refreshAll();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Error updating reservation');
      }
    } catch (err: any) {
      console.error('Error saving reservation:', err);
      showError('Error al guardar', err.message || 'No se pudo actualizar la reserva');
    } finally {
      setIsSaving(false);
      setShowEditModal(false);
      setSelectedReservation(null);
    }
  };

  const handleDuplicateReservation = async (reservation: Reservation) => {
    // Calculate next available date (same day next week)
    const originalDate = new Date(reservation.date + 'T00:00:00');
    const nextWeek = new Date(originalDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const newDate = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`;
    
    if (confirm(`¿Duplicar esta reserva para el ${new Date(newDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}?`)) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            courtId: reservation.courtId,
            date: newDate,
            startTime: reservation.time,
            duration: reservation.duration,
            paymentType: 'cash',
            participants: [{
              email: reservation.clientEmail,
              phone: reservation.clientPhone,
              amount: reservation.price
            }]
          })
        });
        
        if (response.ok) {
          alert('Reserva duplicada exitosamente');
          refreshAll();
        } else {
          throw new Error('Error duplicating reservation');
        }
      } catch (err) {
        console.error('Error duplicating reservation:', err);
        alert('Error al duplicar la reserva');
      }
    }
  };

  const handleMoveReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowMoveModal(true);
  };

  const handleSaveMove = async (newDate: string, newTime: string, newCourtId?: string) => {
    if (!selectedReservation) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/bookings/${selectedReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          date: newDate,
          startTime: newTime,
          ...(newCourtId && { courtId: newCourtId })
        })
      });
      
      if (response.ok) {
        showSuccess('Reserva movida', 'La reserva fue movida exitosamente');
        refreshAll();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error moving reservation');
      }
    } catch (err: any) {
      console.error('Error moving reservation:', err);
      showError('Error al mover', err.message || 'No se pudo mover la reserva');
    } finally {
      setIsSaving(false);
      setShowMoveModal(false);
      setSelectedReservation(null);
    }
  };

  const handleOpenNotes = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditingNotes(reservation.notes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedReservation) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/bookings/${selectedReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ notes: editingNotes })
      });
      
      if (response.ok) {
        showSuccess('Notas guardadas', 'Las notas fueron actualizadas');
        refreshAll();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error saving notes');
      }
    } catch (err: any) {
      console.error('Error saving notes:', err);
      showError('Error al guardar', err.message || 'No se pudieron guardar las notas');
    } finally {
      setIsSaving(false);
      setShowNotesModal(false);
      setSelectedReservation(null);
    }
  };

  const handleCreateReservation = () => {
    setSelectedReservation(null);
    setShowCreateSidebar(true);
  };

  const handleReservationCreated = () => {
    refreshAll();
  };

  const handleRefresh = () => {
    refreshAll();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'confirmed': return 'text-yellow-400 bg-yellow-400/10';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10';
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'no_show': return 'text-red-400 bg-red-400/10';
      case 'cancelled': return 'text-red-600 bg-red-800/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-400 bg-emerald-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'confirmed': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'no_show': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Filter reservations for display (backend already filters by date range based on view)
  const filteredReservations = reservations
    .filter(reservation => {
      // Status filter is applied on backend, but we can also filter client-side for search
      const matchesSearch = !searchTerm || 
        reservation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.court.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    // Sort by date and time ascending (upcoming first)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchTerm, viewMode]);

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    totalRevenue: reservations.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + r.price, 0),
    pendingPayments: reservations.filter(r => r.paymentStatus === 'pending').reduce((sum, r) => sum + r.price, 0)
  };

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsSidebar(true);
  };

  const handleEditReservationFromSidebar = (reservation: Reservation) => {
    setShowDetailsSidebar(false);
    // Keep the selected reservation for the edit sidebar
    setSelectedReservation(reservation);
    // Find the court for this reservation
    const court = adminCourts.find(c => c.id === reservation.courtId);
    if (court) {
      setGridSelectedCourt({
        id: court.id,
        name: court.name,
        sport: court.sport,
        pricePerHour: court.pricePerHour
      });
    }
    setGridSelectedTime(reservation.time);
    setGridSelectedDate(new Date(reservation.date + 'T00:00:00'));
    setShowEditSidebar(true);
  };

  // Only show full loading screen on initial load (when we have no data yet)
  // When changing dates, keep showing the grid with old data while loading
  const isInitialLoad = loading && reservations.length === 0 && adminCourts.length === 0;
  
  if (isInitialLoad) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <UnifiedLoader size="md" />
      </div>
    );
  }

  // Calendar navigation functions
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const getCalendarTitle = () => {
    const options: Intl.DateTimeFormatOptions = {};
    
    if (calendarView === 'month') {
      options.year = 'numeric';
      options.month = 'long';
    } else if (calendarView === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (calendarView === 'day') {
      options.weekday = 'long';
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
    }
    
    return currentDate.toLocaleDateString('es-AR', options);
  };

  // Format date without timezone issues
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get reservations for calendar view
  const getReservationsForDate = (date: Date) => {
    const dateStr = formatDateLocal(date);
    return filteredReservations.filter(reservation => reservation.date === dateStr);
  };

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Generate week days for week view
  const generateWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Generate hours for day view
  const generateDayHours = () => {
    const hours = [];
    for (let i = 6; i <= 23; i++) {
      hours.push(i);
    }
    return hours;
  };

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Generate calendar days for date picker
  const generateDatePickerDays = () => {
    const year = gridSelectedDate.getFullYear();
    const month = gridSelectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Header controls to be rendered via portal
  const headerControls = (
    <div className="flex items-center w-full space-x-3">
      {/* View Mode Toggle */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-sm transition-colors ${
            viewMode === 'grid' 
              ? 'bg-emerald-600 text-white' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Grid className="h-4 w-4" />
          <span className="hidden sm:inline">Grilla</span>
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-sm transition-colors ${
            viewMode === 'list' 
              ? 'bg-emerald-600 text-white' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Lista</span>
        </button>
      </div>

      {/* Date Navigation - For both Grid and List views */}
      <div className="flex items-center space-x-1 relative">
          <button
            onClick={() => {
              const newDate = new Date(gridSelectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setGridSelectedDate(newDate);
            }}
            className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white min-w-[200px] text-center transition-colors"
          >
            {formatDateDisplay(gridSelectedDate)}
          </button>
          <button
            onClick={() => {
              const newDate = new Date(gridSelectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setGridSelectedDate(newDate);
            }}
            className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-3">
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => {
                    const newDate = new Date(gridSelectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setGridSelectedDate(newDate);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
                <span className="text-gray-900 dark:text-white font-medium">
                  {gridSelectedDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    const newDate = new Date(gridSelectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setGridSelectedDate(newDate);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateDatePickerDays().map((day, index) => {
                  const isCurrentMonth = day.getMonth() === gridSelectedDate.getMonth();
                  const isSelected = day.toDateString() === gridSelectedDate.toDateString();
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setGridSelectedDate(day);
                        setShowDatePicker(false);
                      }}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : isToday
                            ? 'bg-emerald-100 dark:bg-emerald-600/30 text-emerald-600 dark:text-emerald-400'
                            : isCurrentMonth
                              ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                              : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
              
              {/* Today Button */}
              <button
                onClick={() => {
                  setGridSelectedDate(new Date());
                  setShowDatePicker(false);
                }}
                className="w-full mt-2 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Hoy
              </button>
            </div>
          )}
        </div>

      {/* Refresh Button */}
      <button 
        onClick={() => refreshAll()}
        className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
        title="Actualizar"
      >
        <RefreshCw className="h-4 w-4" />
      </button>

      {/* Turnos Fijos Button */}
      <Link 
        href="/establecimientos/admin/turnos-fijos"
        className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
      >
        <RepeatIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Turnos Fijos</span>
      </Link>

      {/* New Reservation Button */}
      <button 
        onClick={handleCreateReservation}
        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nueva Reserva</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
        {/* Content Area - Full Height */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Loading overlay - shows while loading but doesn't hide content */}
          {loading && (
            <div className="absolute top-2 right-2 z-50 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Actualizando...</span>
            </div>
          )}
          {viewMode === 'grid' ? (
        /* Grid View - Like AlquilaTuCancha */
        <div className="h-full">
          {/* Closed day warning */}
          {isGridDateClosed && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4 mx-4 mt-4 flex items-center gap-3">
              <CalendarX className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">Establecimiento cerrado</p>
                <p className="text-red-400/70 text-sm">
                  {gridHours.isClosed 
                    ? `El establecimiento está cerrado los ${['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'][gridSelectedDate.getDay()]}`
                    : 'Este día está marcado como cerrado en la configuración'}
                </p>
              </div>
            </div>
          )}
          <BookingCalendarGrid
            courts={adminCourts.map(c => ({
              id: c.id,
              name: c.name,
              sport: c.sport,
              pricePerHour: c.pricePerHour
            }))}
            amenities={amenities}
            bookings={reservations.map(r => {
              // Calculate endTime if not present
              const calcEndTime = () => {
                if (r.endTime) return r.endTime;
                const [h, m] = (r.time || '00:00').split(':').map(Number);
                const endMins = h * 60 + m + (r.duration || 60);
                return `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`;
              };
              
              return {
                id: r.id,
                courtId: r.courtId,
                amenityId: r.amenityId,
                date: r.date,
                startTime: r.time,
                endTime: calcEndTime(),
                duration: r.duration,
                clientName: r.clientName,
                clientPhone: r.clientPhone,
                status: r.status,
                isRecurring: r.isRecurring,
                price: r.price,
                depositAmount: r.depositAmount
              };
            })}
            selectedDate={gridSelectedDate}
            onDateChange={setGridSelectedDate}
            onSlotClick={(itemId, time, date) => {
              // Check if it's a court or an amenity
              const court = adminCourts.find(c => c.id === itemId);
              const amenity = amenities.find(a => a.id === itemId);
              
              if (court) {
                setGridSelectedCourt({
                  id: court.id,
                  name: court.name,
                  sport: court.sport,
                  pricePerHour: court.pricePerHour,
                  pricePerHour90: court.pricePerHour90,
                  pricePerHour120: court.pricePerHour120
                });
                setGridSelectedTime(time);
                setGridSelectedDate(date);
                setShowGridBookingSidebar(true);
              } else if (amenity) {
                // For amenities, create a court-like object
                setGridSelectedCourt({
                  id: amenity.id,
                  name: amenity.name,
                  sport: 'amenity',
                  pricePerHour: amenity.pricePerHour,
                  pricePerHour90: amenity.pricePerHour90,
                  pricePerHour120: amenity.pricePerHour120
                });
                setGridSelectedTime(time);
                setGridSelectedDate(date);
                setShowGridBookingSidebar(true);
              }
            }}
            onBookingClick={(booking) => {
              const reservation = reservations.find(r => r.id === booking.id);
              if (reservation) {
                handleViewReservation(reservation);
              }
            }}
            onBookingMove={async (bookingId, newCourtId, newStartTime) => {
              const result = await apiMoveReservation(bookingId, newCourtId, newStartTime);
              if (!result.success) {
                alert(result.error || 'Error al mover la reserva.');
              }
              // No need to reload - optimistic update handles it
            }}
            onBookingCancel={async (bookingId) => {
              const success = await apiCancelReservation(bookingId);
              if (!success) {
                alert('Error al cancelar la reserva.');
              }
              // No need to reload - optimistic update handles it
            }}
            startHour={gridHours.startHour}
            endHour={gridHours.endHour}
          />
          
          <CreateBookingSidebar
            isOpen={showGridBookingSidebar}
            onClose={() => setShowGridBookingSidebar(false)}
            onSuccess={async (bookingData) => {
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/bookings`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  },
                  body: JSON.stringify(bookingData)
                });
                
                if (response.ok) {
                  const result = await response.json();
                  // Add the new booking to local state (optimistic update)
                  if (result.booking) {
                    const newReservation = {
                      id: result.booking.id,
                      clientName: result.booking.clientName || bookingData.clientName || 'Cliente',
                      clientEmail: result.booking.clientEmail || bookingData.clientEmail || '',
                      clientPhone: result.booking.clientPhone || bookingData.clientPhone || '',
                      court: gridSelectedCourt?.name || 'Cancha',
                      courtId: result.booking.courtId || bookingData.courtId,
                      date: result.booking.date || bookingData.date,
                      time: (result.booking.startTime || bookingData.startTime || '').substring(0, 5),
                      endTime: (result.booking.endTime || bookingData.endTime || '').substring(0, 5),
                      duration: result.booking.duration || bookingData.duration || 60,
                      price: parseFloat(result.booking.totalAmount) || bookingData.totalAmount || 0,
                      status: result.booking.status || 'confirmed',
                      paymentStatus: result.booking.paymentStatus || 'pending',
                      createdAt: result.booking.createdAt || new Date().toISOString(),
                      notes: result.booking.notes,
                      isRecurring: result.booking.isRecurring || false,
                      depositAmount: parseFloat(result.booking.depositAmount) || bookingData.depositAmount || 0,
                      depositMethod: result.booking.depositMethod || bookingData.depositMethod
                    };
                    addReservationToState(newReservation);
                  }
                  setShowGridBookingSidebar(false);
                } else {
                  const errorData = await response.json().catch(() => ({}));
                  console.error('Booking error details:', errorData);
                  const detailsMsg = Array.isArray(errorData.details) 
                    ? errorData.details.map((d: any) => d.msg || d.message).join(', ') 
                    : (typeof errorData.details === 'string' ? errorData.details : '');
                  throw new Error(errorData.message + (detailsMsg ? `: ${detailsMsg}` : '') || 'Error creating booking');
                }
              } catch (error) {
                console.error('Error creating booking:', error);
                throw error;
              }
            }}
            court={gridSelectedCourt}
            selectedTime={gridSelectedTime}
            selectedDate={gridSelectedDate}
            existingBookings={reservations
              .filter(r => {
                // Only include reservations for the selected date
                const selectedDateStr = gridSelectedDate.toISOString().split('T')[0];
                return r.date === selectedDateStr;
              })
              .map(r => ({
                id: r.id,
                courtId: r.courtId || '',
                startTime: r.time,
                endTime: r.endTime,
                duration: r.duration,
                status: r.status
              }))}
            requestPin={requestPin}
            amenities={amenities}
          />
        </div>
      ) : (
        /* List View - Reservations Table */
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cancha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Duración</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Pago</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedReservations.map((reservation, index) => (
                  <motion.tr
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {reservation.clientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{reservation.clientName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{reservation.clientEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">{reservation.court}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(reservation.date + 'T12:00:00').toLocaleDateString('es-AR')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {reservation.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reservation.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-emerald-400">
                        ${reservation.price.toLocaleString()}
                      </div>
                      <div className={`text-xs ${
                          (reservation.price - (reservation.depositAmount || 0)) <= 0 
                            ? 'text-emerald-400' 
                            : (reservation.depositAmount || 0) > 0 
                              ? 'text-yellow-400' 
                              : 'text-red-400'
                        }`}>
                          {(reservation.price - (reservation.depositAmount || 0)) <= 0 
                            ? 'Pagado' 
                            : (reservation.depositAmount || 0) > 0 
                              ? 'Pago parcial' 
                              : 'No pagado'}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        <span className="ml-1 capitalize">{reservation.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                        <span className="capitalize">{reservation.paymentStatus === 'paid' ? 'Pagado' : reservation.paymentStatus === 'pending' ? 'Pendiente' : 'Fallido'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewReservation(reservation)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditReservation(reservation)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                          title="Editar reserva"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleMoveReservation(reservation)}
                          className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded transition-colors"
                          title="Mover horario/cancha"
                        >
                          <MoveHorizontal className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenNotes(reservation)}
                          className={`p-1.5 hover:bg-orange-400/10 rounded transition-colors ${
                            reservation.notes ? 'text-orange-400' : 'text-gray-500 hover:text-orange-400'
                          }`}
                          title={reservation.notes ? 'Ver/editar notas' : 'Agregar nota'}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        {reservation.status === 'pending' && (
                          <button 
                            onClick={() => handleConfirmReservation(reservation.id)}
                            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded transition-colors"
                            title="Confirmar reserva"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {reservation.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCompleteReservation(reservation.id)}
                            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded transition-colors"
                            title="Marcar como completada"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                          <button 
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded transition-colors"
                            title="Cancelar reserva"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteReservation(reservation.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                          title="Eliminar reserva"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReservations.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white">No hay reservas</h3>
              <p className="mt-1 text-sm text-gray-400">
                No se encontraron reservas que coincidan con los filtros seleccionados.
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredReservations.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredReservations.length)} de {filteredReservations.length} reservas
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Primera
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Última
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Reservation Details Sidebar */}
      <ReservationDetailsSidebar
        isOpen={showDetailsSidebar}
        reservation={selectedReservation}
        onClose={() => {
          setShowDetailsSidebar(false);
          setSelectedReservation(null);
        }}
        onEdit={handleEditReservationFromSidebar}
        onCancel={async (id) => {
          return new Promise<void>((resolve) => {
            requestPin(async () => {
              const success = await apiCancelReservation(id);
              if (!success) {
                showError('Error', 'No se pudo cancelar la reserva');
              } else {
                showWarning('Reserva cancelada', 'La reserva ha sido cancelada');
              }
              resolve();
            }, { title: 'Cancelar reserva', description: 'Ingresa tu PIN para cancelar' });
          });
        }}
        onConfirm={async (id) => {
          return new Promise<void>((resolve) => {
            requestPin(async () => {
              const success = await apiConfirmReservation(id);
              if (!success) {
                showError('Error', 'No se pudo confirmar la reserva');
              } else {
                showSuccess('Reserva confirmada', 'La reserva ha sido confirmada');
              }
              resolve();
            }, { title: 'Confirmar reserva', description: 'Ingresa tu PIN para confirmar' });
          });
        }}
        onComplete={async (id) => {
          return new Promise<void>((resolve) => {
            requestPin(async () => {
              const result = await apiStartReservation(id);
              if (!result.success) {
                showError('Error', 'No se pudo iniciar el turno');
              } else {
                showSuccess('Turno iniciado', 'El turno ha comenzado');
                if (selectedReservation?.id === id && result.orders) {
                  setSelectedReservation({
                    ...selectedReservation,
                    status: 'in_progress',
                    orders: result.orders
                  } as any);
                }
              }
              resolve();
            }, { title: 'Iniciar turno', description: 'Ingresa tu PIN para iniciar el turno' });
          });
        }}
        onNoShow={async (id) => {
          return new Promise<void>((resolve) => {
            requestPin(async () => {
              const success = await apiMarkNoShow(id);
              if (!success) {
                showError('Error', 'No se pudo marcar como no asistió');
              } else {
                showWarning('No asistió', 'La reserva ha sido marcada como no asistió');
              }
              resolve();
            }, { title: 'Marcar no asistió', description: 'Ingresa tu PIN para confirmar' });
          });
        }}
        onPaymentRegistered={(bookingId, newDepositAmount) => {
          // Update selected reservation for immediate UI feedback
          if (selectedReservation?.id === bookingId) {
            const updatedReservation = { 
              ...selectedReservation, 
              depositAmount: newDepositAmount, 
              paymentStatus: (newDepositAmount >= selectedReservation.price ? 'paid' : selectedReservation.paymentStatus) as 'paid' | 'pending' | 'failed'
            };
            setSelectedReservation(updatedReservation);
          }
          // Refresh reservations list to update grid/table
          loadReservations({ date: gridSelectedDate.toISOString().split('T')[0] });
        }}
        onStatusChanged={(reservationId, newStatus) => {
          // Update selected reservation status for immediate UI feedback
          if (selectedReservation?.id === reservationId) {
            setSelectedReservation({
              ...selectedReservation,
              status: newStatus as any
            });
          }
          // Refresh reservations list
          loadReservations({ date: gridSelectedDate.toISOString().split('T')[0] });
        }}
        onFinalize={async (id) => {
          return new Promise<void>((resolve) => {
            requestPin(async () => {
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/bookings/${id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  },
                  body: JSON.stringify({ status: 'completed' })
                });
                if (response.ok) {
                  showSuccess('Turno completado', 'El turno ha sido finalizado');
                  loadReservations({ date: gridSelectedDate.toISOString().split('T')[0] });
                  if (selectedReservation?.id === id) {
                    setSelectedReservation({ ...selectedReservation, status: 'completed' } as any);
                  }
                } else {
                  showError('Error', 'No se pudo completar el turno');
                }
              } catch (error) {
                showError('Error', 'No se pudo completar el turno');
              }
              resolve();
            }, { title: 'Completar turno', description: 'Ingresa tu PIN para finalizar el turno' });
          });
        }}
        establishmentName={establishment?.name}
        establishmentSlug={establishment?.slug}
        onOpenCashRegister={openCashRegisterAction}
      />

      {/* Edit Reservation Sidebar */}
      <CreateBookingSidebar
        isOpen={showEditSidebar}
        onClose={() => {
          setShowEditSidebar(false);
          setSelectedReservation(null);
        }}
        onSuccess={async () => {}} // Not used in edit mode
        court={gridSelectedCourt}
        selectedTime={gridSelectedTime}
        selectedDate={gridSelectedDate}
        editingReservation={selectedReservation ? {
          id: selectedReservation.id,
          clientName: selectedReservation.clientName,
          clientEmail: selectedReservation.clientEmail,
          clientPhone: selectedReservation.clientPhone,
          duration: selectedReservation.duration,
          notes: selectedReservation.notes,
          depositAmount: selectedReservation.depositAmount,
          depositMethod: selectedReservation.depositMethod,
          date: selectedReservation.date,
          startTime: selectedReservation.time
        } : null}
        onUpdate={async (reservationId, data) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/bookings/${reservationId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify({
                courtId: data.courtId,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                duration: data.duration,
                totalAmount: data.totalAmount,
                notes: data.notes,
                depositAmount: data.depositAmount,
                depositMethod: data.depositMethod,
                clientName: data.clientName,
                clientPhone: data.clientPhone,
                clientEmail: data.clientEmail,
                bookingType: data.bookingType
              })
            });
            
            if (response.ok) {
              refreshAll();
              setShowEditSidebar(false);
              setSelectedReservation(null);
            } else {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || 'Error updating booking');
            }
          } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
          }
        }}
        requestPin={requestPin}
        amenities={amenities}
      />

      {/* Edit Reservation Sidebar */}
      <AnimatePresence>
        {showEditModal && selectedReservation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-gray-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Edit className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Editar Reserva</h2>
                    <p className="text-sm text-gray-400">{selectedReservation.clientName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const reservationData = {
                  clientName: formData.get('clientName') as string,
                  clientEmail: formData.get('clientEmail') as string,
                  clientPhone: formData.get('clientPhone') as string,
                  court: formData.get('court') as string,
                  date: formData.get('date') as string,
                  time: formData.get('time') as string,
                  duration: Number(formData.get('duration')),
                  price: Number(formData.get('price')),
                  status: formData.get('status') as Reservation['status'],
                  paymentStatus: formData.get('paymentStatus') as Reservation['paymentStatus'],
                  notes: formData.get('notes') as string
                };
                handleSaveReservation(reservationData);
              }} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre del Cliente *
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      required
                      defaultValue={selectedReservation.clientName}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      required
                      defaultValue={selectedReservation.clientEmail}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="clientPhone"
                      required
                      defaultValue={selectedReservation.clientPhone}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cancha *
                    </label>
                    <select
                      name="court"
                      required
                      defaultValue={selectedReservation.courtId}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {adminCourts.filter(c => c.isActive).map(court => (
                        <option key={court.id} value={court.id}>
                          {court.name} - {court.sport}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      defaultValue={selectedReservation.date}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hora *
                    </label>
                    <input
                      type="time"
                      name="time"
                      required
                      defaultValue={selectedReservation.time}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duración (minutos) *
                    </label>
                    <select
                      name="duration"
                      required
                      defaultValue={selectedReservation.duration}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="60">60 minutos</option>
                      <option value="90">90 minutos</option>
                      <option value="120">120 minutos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio (ARS) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      defaultValue={selectedReservation.price}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estado *
                    </label>
                    <select
                      name="status"
                      required
                      defaultValue={selectedReservation.status}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estado de Pago *
                    </label>
                    <select
                      name="paymentStatus"
                      required
                      defaultValue={selectedReservation.paymentStatus}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagado</option>
                      <option value="failed">Fallido</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={selectedReservation.notes || ''}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Notas adicionales sobre la reserva..."
                  />
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Reservation Sidebar */}
      <CreateReservationSidebar
        isOpen={showCreateSidebar}
        onClose={() => setShowCreateSidebar(false)}
        establishmentId={establishmentId || ''}
        courts={adminCourts.map(c => ({
          id: c.id,
          name: c.name,
          sport: c.sport,
          pricePerHour: c.pricePerHour,
          pricePerHour90: c.pricePerHour90,
          pricePerHour120: c.pricePerHour120,
          isActive: c.isActive,
        }))}
        amenities={amenities}
        onReservationCreated={handleReservationCreated}
      />

      {/* Move Reservation Sidebar */}
      <AnimatePresence>
        {showMoveModal && selectedReservation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => {
                setShowMoveModal(false);
                setSelectedReservation(null);
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <MoveHorizontal className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Mover Reserva</h2>
                    <p className="text-sm text-gray-400">Cambiar fecha, hora o cancha</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMoveModal(false);
                    setSelectedReservation(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Current Reservation Info */}
                <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Reserva actual</p>
                  <p className="font-semibold text-white">{selectedReservation.clientName}</p>
                  <p className="text-sm text-gray-300 mt-1">
                    {new Date(selectedReservation.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} a las {selectedReservation.time}
                  </p>
                  <p className="text-sm text-gray-400">{selectedReservation.court}</p>
                </div>

                <form id="move-form" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveMove(
                    formData.get('newDate') as string,
                    formData.get('newTime') as string,
                    formData.get('newCourt') as string || undefined
                  );
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nueva Fecha
                    </label>
                    <input
                      type="date"
                      name="newDate"
                      required
                      defaultValue={selectedReservation.date}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nueva Hora
                    </label>
                    <input
                      type="time"
                      name="newTime"
                      required
                      defaultValue={selectedReservation.time}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nueva Cancha (opcional)
                    </label>
                    <select
                      name="newCourt"
                      defaultValue=""
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="">Mantener cancha actual</option>
                      {adminCourts.filter(c => c.isActive).map(court => (
                        <option key={court.id} value={court.id}>
                          {court.name} - {court.sport}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-700 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoveModal(false);
                    setSelectedReservation(null);
                  }}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="move-form"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MoveHorizontal className="w-4 h-4" />
                  {isSaving ? 'Moviendo...' : 'Mover Reserva'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notes Sidebar */}
      <AnimatePresence>
        {showNotesModal && selectedReservation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => {
                setShowNotesModal(false);
                setSelectedReservation(null);
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Notas de Reserva</h2>
                    <p className="text-sm text-gray-400">Notas internas del staff</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                    setSelectedReservation(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Reservation Info */}
                <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                  <p className="font-semibold text-white">{selectedReservation.clientName}</p>
                  <p className="text-sm text-gray-300 mt-1">
                    {new Date(selectedReservation.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} a las {selectedReservation.time}
                  </p>
                  <p className="text-sm text-gray-400">{selectedReservation.court}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas internas
                  </label>
                  <textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    rows={8}
                    placeholder="Agregar notas sobre esta reserva..."
                    className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Estas notas son solo visibles para el staff del establecimiento.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-700 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotesModal(false);
                    setSelectedReservation(null);
                  }}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Guardando...' : 'Guardar Notas'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PIN Confirmation Modal */}
      <PinModal />
    </div>
  </>
  );
};

export default ReservationsPage;
