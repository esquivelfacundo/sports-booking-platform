'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useEstablishmentAdminContext } from '@/contexts/EstablishmentAdminContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { 
  RepeatIcon, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  ChevronRight,
  Trash2,
  Edit,
  Eye,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  MoreVertical,
  CalendarDays,
  MapPin,
  Hash,
  CreditCard,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface RecurringGroup {
  id: string;
  establishmentId: string;
  clientId: string;
  clientName: string;
  courtId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  sport: string;
  totalWeeks: number;
  completedOccurrences: number;
  cancelledOccurrences: number;
  pricePerBooking: string;
  totalPrice: string;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid';
  startDate: string;
  endDate: string;
  createdAt: string;
  primaryCourt?: {
    id: string;
    name: string;
    sport: string;
  };
  client?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface RecurringBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  recurringSequence: number;
  recurringPaymentStatus: string;
  court?: {
    id: string;
    name: string;
  };
  payments?: any[];
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function TurnosFijosPage() {
  const { establishment } = useEstablishment();
  const { courts, refreshAll } = useEstablishmentAdminContext();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<RecurringGroup[]>([]);
  const [expandedBookings, setExpandedBookings] = useState<Array<RecurringBooking & { groupInfo: RecurringGroup; totalInGroup: number }>>([]);
  const [selectedGroup, setSelectedGroup] = useState<RecurringGroup | null>(null);
  const [groupBookings, setGroupBookings] = useState<RecurringBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'cancelled' | 'completed'>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  
  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelType, setCancelType] = useState<'single' | 'from_date' | 'all_pending'>('single');
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<RecurringBooking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Header portal
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  
  // Setup header portal
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);

  // Fetch recurring groups
  useEffect(() => {
    if (establishment?.id) {
      fetchGroups();
    }
  }, [establishment?.id, statusFilter]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const url = statusFilter === 'all' 
        ? `${API_URL}/api/recurring-bookings?establishmentId=${establishment?.id}`
        : `${API_URL}/api/recurring-bookings?establishmentId=${establishment?.id}&status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setGroups(data.groups || []);
        
        // Fetch bookings for each group and expand them
        const allBookings: Array<RecurringBooking & { groupInfo: RecurringGroup; totalInGroup: number }> = [];
        
        for (const group of (data.groups || [])) {
          try {
            const detailResponse = await fetch(`${API_URL}/api/recurring-bookings/${group.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const detailData = await detailResponse.json();
            
            if (detailData.success && detailData.bookings) {
              const bookings = detailData.bookings;
              bookings.forEach((booking: RecurringBooking) => {
                allBookings.push({
                  ...booking,
                  groupInfo: group,
                  totalInGroup: bookings.length
                });
              });
            }
          } catch (err) {
            console.error(`Error fetching bookings for group ${group.id}:`, err);
          }
        }
        
        setExpandedBookings(allBookings);
      }
    } catch (error) {
      console.error('Error fetching recurring groups:', error);
      showError('Error al cargar los turnos fijos');
    } finally {
      setLoading(false);
    }
  };

  // Fetch group details with bookings
  const fetchGroupDetails = async (groupId: string) => {
    try {
      setLoadingBookings(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/recurring-bookings/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setGroupBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Handle cancel recurring
  const handleCancelRecurring = async () => {
    if (!selectedGroup) return;
    
    setIsCancelling(true);
    try {
      const token = localStorage.getItem('auth_token');
      const body: any = {
        cancelType: cancelType,
        reason: cancelReason
      };
      
      if (cancelType === 'single' && selectedBookingForCancel) {
        body.bookingId = selectedBookingForCancel.id;
      } else if (cancelType === 'from_date' && selectedBookingForCancel) {
        body.bookingId = selectedBookingForCancel.id;
        body.fromDate = selectedBookingForCancel.date;
      }
      
      const response = await fetch(`${API_URL}/api/recurring-bookings/${selectedGroup.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(data.message || 'Turnos cancelados exitosamente');
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedBookingForCancel(null);
        
        // Refresh data
        await fetchGroups();
        if (selectedGroup) {
          await fetchGroupDetails(selectedGroup.id);
        }
        refreshAll();
      } else {
        throw new Error(data.error || 'Error al cancelar');
      }
    } catch (error: any) {
      console.error('Error cancelling:', error);
      showError(error.message || 'Error al cancelar los turnos');
    } finally {
      setIsCancelling(false);
    }
  };

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...expandedBookings];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.groupInfo.clientName?.toLowerCase().includes(query) ||
        b.groupInfo.client?.name?.toLowerCase().includes(query) ||
        b.groupInfo.client?.phone?.includes(query) ||
        b.groupInfo.primaryCourt?.name?.toLowerCase().includes(query)
      );
    }
    
    if (courtFilter !== 'all') {
      filtered = filtered.filter(b => b.groupInfo.courtId === courtFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.groupInfo.status === statusFilter);
    }
    
    return filtered;
  }, [expandedBookings, searchQuery, courtFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const active = groups.filter(g => g.status === 'active').length;
    const paused = groups.filter(g => g.status === 'paused').length;
    // Calculate total revenue from pricePerBooking * totalWeeks for each group
    const totalRevenue = groups.reduce((sum, g) => {
      const price = parseFloat(g.pricePerBooking || '0');
      const weeks = g.totalWeeks || 0;
      return sum + (price * weeks);
    }, 0);
    const pendingPayments = groups.filter(g => g.paymentStatus !== 'paid').length;
    return { active, paused, totalRevenue, pendingPayments };
  }, [groups]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Activo</span>;
      case 'paused':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Pausado</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Cancelado</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Completado</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Pagado</span>;
      case 'partial':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Parcial</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400">Pendiente</span>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return '$ 0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '$ 0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time?.substring(0, 5) || '';
  };

  const openGroupDetails = async (group: RecurringGroup) => {
    setSelectedGroup(group);
    setShowDetailsModal(true);
    await fetchGroupDetails(group.id);
  };

  const openCancelModal = async (group: RecurringGroup, booking?: RecurringBooking) => {
    setSelectedGroup(group);
    
    // If no specific booking, load the first pending booking to show all options
    if (!booking) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_URL}/api/recurring-bookings/${group.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.bookings?.length > 0) {
          // Find first pending (future) booking
          const today = new Date().toISOString().split('T')[0];
          const pendingBooking = data.bookings.find((b: RecurringBooking) => 
            b.date >= today && b.status !== 'cancelled'
          );
          setSelectedBookingForCancel(pendingBooking || data.bookings[0]);
        }
      } catch (error) {
        console.error('Error loading bookings for cancel:', error);
      }
    } else {
      setSelectedBookingForCancel(booking);
    }
    
    setCancelType(booking ? 'single' : 'all_pending');
    setShowCancelModal(true);
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Header controls for portal
  const headerControls = (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search - hidden on mobile, shown in content */}
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-3 py-1.5 w-40 lg:w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>
      
      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as any)}
        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
      >
        <option value="all">Todos</option>
        <option value="active">Activos</option>
        <option value="paused">Pausados</option>
        <option value="cancelled">Cancelados</option>
      </select>
      
      {/* Refresh */}
      <button
        onClick={fetchGroups}
        className="p-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
        title="Actualizar"
      >
        <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
      
      {/* New button */}
      <Link
        href="/establecimientos/admin/reservas"
        className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nuevo</span>
      </Link>
    </div>
  );

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="p-4 md:p-6 space-y-4">
        {/* Mobile search */}
        <div className="sm:hidden relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o cancha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Activos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Pause className="w-4 h-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.paused}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pausados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Valor total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.pendingPayments}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pagos pendientes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <RepeatIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No hay turnos fijos</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Los turnos fijos se crean desde la grilla de reservas
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBookings.map((booking) => {
                const group = booking.groupInfo;
                const sequence = booking.recurringSequence || 0;
                const total = booking.totalInGroup;
                
                return (
                  <div 
                    key={booking.id} 
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Main Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <RepeatIcon className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {group.client?.name || group.clientName || 'Sin cliente'}
                            </span>
                            {getStatusBadge(booking.status)}
                            {getPaymentStatusBadge(booking.recurringPaymentStatus || 'pending')}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {booking.court?.name || group.primaryCourt?.name || 'Sin cancha'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {DAY_NAMES[group.dayOfWeek]}s • {formatDate(booking.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(booking.startTime)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sequence */}
                      <div className="hidden md:block text-center px-4">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {sequence}/{total}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Turno</p>
                      </div>

                      {/* Price */}
                      <div className="hidden md:block text-center px-4">
                        <p className="text-lg font-bold text-emerald-500">
                          {formatCurrency(group.pricePerBooking)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Por turno</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openGroupDetails(group)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                        </button>
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => openCancelModal(group, booking)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <Trash2 className="w-5 h-5 text-red-400 hover:text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Sidebar */}
      {showDetailsModal && selectedGroup && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowDetailsModal(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <RepeatIcon className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedGroup.client?.name || selectedGroup.clientName || 'Turno Fijo'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedGroup.primaryCourt?.name} • {DAY_NAMES[selectedGroup.dayOfWeek]} {formatTime(selectedGroup.startTime)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{groupBookings.length || selectedGroup.totalWeeks || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total turnos</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-2xl font-bold text-emerald-500">
                    {groupBookings.filter(b => new Date(b.date) < new Date() && b.status !== 'cancelled').length || selectedGroup.completedOccurrences || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completados</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-2xl font-bold text-red-400">
                    {groupBookings.filter(b => b.status === 'cancelled').length || selectedGroup.cancelledOccurrences || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cancelados</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-2xl font-bold text-purple-500">{formatCurrency(parseFloat(selectedGroup.pricePerBooking || '0') * (groupBookings.length || selectedGroup.totalWeeks || 0))}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor total</p>
                </div>
              </div>

              {/* Client Info */}
              {(selectedGroup.client || selectedGroup.clientName) && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cliente</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedGroup.client?.name || selectedGroup.clientName}</p>
                      {selectedGroup.client?.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedGroup.client.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Turnos ({groupBookings.length})
                </h3>
                {loadingBookings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : groupBookings.length === 0 ? (
                  <div className="text-center py-6 text-gray-600 dark:text-gray-400">
                    No hay turnos registrados
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {groupBookings.map((booking) => {
                      const isPast = new Date(booking.date) < new Date(new Date().toDateString());
                      const isCancelled = booking.status === 'cancelled';
                      
                      return (
                        <div 
                          key={booking.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isCancelled 
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                              : isPast 
                                ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">#{booking.recurringSequence || '-'}</span>
                            <span className={`font-medium ${isCancelled ? 'text-red-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                              {formatDate(booking.date)}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatTime(booking.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCancelled ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Cancelado</span>
                            ) : isPast ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Completado</span>
                            ) : (
                              <>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Próximo</span>
                                <button
                                  onClick={() => openCancelModal(selectedGroup, booking)}
                                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                  title="Cancelar este turno"
                                >
                                  <XCircle className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
              >
                Cerrar
              </button>
              {selectedGroup.status === 'active' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openCancelModal(selectedGroup);
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancelar
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Cancel Sidebar */}
      {showCancelModal && selectedGroup && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={() => {
              setShowCancelModal(false);
              setCancelReason('');
              setSelectedBookingForCancel(null);
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[60] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Cancelar Turno Fijo
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedGroup.client?.name || selectedGroup.clientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedBookingForCancel(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Cancel Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ¿Qué deseas cancelar?
                </label>
                
                {selectedBookingForCancel && (
                  <button
                    onClick={() => setCancelType('single')}
                    className={`w-full p-4 rounded-xl border text-left transition-colors ${
                      cancelType === 'single'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${cancelType === 'single' ? 'border-red-500 bg-red-500' : 'border-gray-400 dark:border-gray-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Solo este turno</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(selectedBookingForCancel.date)} - {formatTime(selectedBookingForCancel.startTime)}
                        </p>
                      </div>
                    </div>
                  </button>
                )}
                
                {selectedBookingForCancel && (
                  <button
                    onClick={() => setCancelType('from_date')}
                    className={`w-full p-4 rounded-xl border text-left transition-colors ${
                      cancelType === 'from_date'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${cancelType === 'from_date' ? 'border-red-500 bg-red-500' : 'border-gray-400 dark:border-gray-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Este y todos los siguientes</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cancela desde {formatDate(selectedBookingForCancel.date)} en adelante
                        </p>
                      </div>
                    </div>
                  </button>
                )}
                
                <button
                  onClick={() => setCancelType('all_pending')}
                  className={`w-full p-4 rounded-xl border text-left transition-colors ${
                    cancelType === 'all_pending'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${cancelType === 'all_pending' ? 'border-red-500 bg-red-500' : 'border-gray-400 dark:border-gray-500'}`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Todos los turnos pendientes</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cancela todos los turnos futuros de este turno fijo
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Motivo (opcional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ej: Cambio de horario, viaje, etc..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedBookingForCancel(null);
                }}
                disabled={isCancelling}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleCancelRecurring}
                disabled={isCancelling}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
