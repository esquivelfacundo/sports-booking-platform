'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
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
  Phone
} from 'lucide-react';

interface Reservation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  court: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
  notes?: string;
}

const ReservationsPage = () => {
  const { establishment, isDemo, loading } = useEstablishment();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Initialize reservations based on demo or real data
  useEffect(() => {
    if (isDemo) {
      // Demo data
      setReservations([
    {
      id: '1',
      clientName: 'Juan Pérez',
      clientEmail: 'juan.perez@email.com',
      clientPhone: '+54 11 1234-5678',
      court: 'Cancha 1 - Fútbol 5',
      date: '2024-01-15',
      time: '18:00',
      duration: 90,
      price: 8000,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2024-01-10T10:30:00Z',
      notes: 'Cumpleaños de empresa'
    },
    {
      id: '2',
      clientName: 'María González',
      clientEmail: 'maria.gonzalez@email.com',
      clientPhone: '+54 11 9876-5432',
      court: 'Cancha 2 - Paddle',
      date: '2024-01-15',
      time: '20:00',
      duration: 60,
      price: 6000,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '2024-01-12T14:15:00Z'
    },
    {
      id: '3',
      clientName: 'Carlos Rodríguez',
      clientEmail: 'carlos.rodriguez@email.com',
      clientPhone: '+54 11 5555-1234',
      court: 'Cancha 3 - Tenis',
      date: '2024-01-16',
      time: '16:00',
      duration: 120,
      price: 10000,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2024-01-11T09:45:00Z'
    },
    {
      id: '4',
      clientName: 'Ana Martínez',
      clientEmail: 'ana.martinez@email.com',
      clientPhone: '+54 11 7777-8888',
      court: 'Cancha 1 - Fútbol 5',
      date: '2024-01-14',
      time: '19:00',
      duration: 90,
      price: 8000,
      status: 'cancelled',
      paymentStatus: 'failed',
      createdAt: '2024-01-09T16:20:00Z',
      notes: 'Cancelado por lluvia'
    },
    {
      id: '5',
      clientName: 'Diego López',
      clientEmail: 'diego.lopez@email.com',
      clientPhone: '+54 11 3333-4444',
      court: 'Cancha 2 - Paddle',
      date: '2024-01-13',
      time: '21:00',
      duration: 60,
      price: 6000,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: '2024-01-08T11:10:00Z'
    }
      ]);
    } else {
      // Real establishment - no reservations yet
      setReservations([]);
    }
  }, [establishment, isDemo]);

  // Handlers for reservation management
  const handleConfirmReservation = (reservationId: string) => {
    setReservations(reservations.map(reservation => 
      reservation.id === reservationId 
        ? { ...reservation, status: 'confirmed' as const }
        : reservation
    ));
    alert('Reserva confirmada exitosamente');
  };

  const handleCancelReservation = (reservationId: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      setReservations(reservations.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: 'cancelled' as const }
          : reservation
      ));
      alert('Reserva cancelada exitosamente');
    }
  };

  const handleCompleteReservation = (reservationId: string) => {
    setReservations(reservations.map(reservation => 
      reservation.id === reservationId 
        ? { ...reservation, status: 'completed' as const }
          : reservation
    ));
    alert('Reserva marcada como completada');
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowEditModal(true);
  };

  const handleDeleteReservation = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      setReservations(reservations.filter(r => r.id !== id));
      alert('Reserva eliminada exitosamente');
    }
  };

  // Dashboard actions would be implemented here in a real application

  const handleSaveReservation = (reservationData: Partial<Reservation>) => {
    if (selectedReservation) {
      // Edit existing reservation
      setReservations(reservations.map(reservation => 
        reservation.id === selectedReservation.id 
          ? { ...reservation, ...reservationData }
          : reservation
      ));
      alert('Reserva actualizada exitosamente');
      setShowEditModal(false);
      setSelectedReservation(null);
    } else {
      // Create new reservation
      const newReservation: Reservation = {
        id: Date.now().toString(),
        clientName: reservationData.clientName || '',
        clientEmail: reservationData.clientEmail || '',
        clientPhone: reservationData.clientPhone || '',
        court: reservationData.court || '',
        date: reservationData.date || '',
        time: reservationData.time || '',
        duration: reservationData.duration || 60,
        price: reservationData.price || 0,
        status: reservationData.status || 'pending',
        paymentStatus: reservationData.paymentStatus || 'pending',
        createdAt: new Date().toISOString(),
        notes: reservationData.notes || ''
      };
      setReservations([...reservations, newReservation]);
      alert('Reserva creada exitosamente');
      setShowCreateModal(false);
    }
  };

  const handleCreateReservation = () => {
    setSelectedReservation(null);
    setShowCreateModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-emerald-400 bg-emerald-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      case 'completed': return 'text-blue-400 bg-blue-400/10';
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
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = selectedStatus === 'all' || reservation.status === selectedStatus;
    const matchesDate = !selectedDate || reservation.date === selectedDate;
    const matchesSearch = !searchTerm || 
      reservation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.court.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesDate && matchesSearch;
  });

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
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Cargando reservas...</div>
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

  // Get reservations for calendar view
  const getReservationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Reservas</h1>
          <p className="text-gray-400 mt-1">Administra todas las reservas de tu establecimiento</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              <span>Calendario</span>
            </button>
          </div>
          
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
          <button 
            onClick={handleCreateReservation}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Reserva</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{reservations.filter(r => r.status === 'completed').length}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Confirmadas</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.confirmed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Canceladas</p>
              <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completadas</p>
              <span className="text-2xl font-bold text-white">{stats.total}</span>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos</p>
              <p className="text-2xl font-bold text-emerald-400">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Calendar Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por cliente, email o cancha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-80"
                suppressHydrationWarning={true}
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="confirmed">Confirmadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
              <option value="completed">Completadas</option>
            </select>

            {/* Date Filter - Only show in list view */}
            {viewMode === 'list' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            )}

            {/* Calendar View Controls */}
            {viewMode === 'calendar' && (
              <div className="flex items-center space-x-2">
                {/* Calendar View Type */}
                <select
                  value={calendarView}
                  onChange={(e) => setCalendarView(e.target.value as 'month' | 'week' | 'day')}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="month">Mes</option>
                  <option value="week">Semana</option>
                  <option value="day">Día</option>
                </select>

                {/* Calendar Navigation */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => navigateCalendar('prev')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="px-4 py-2 bg-gray-700 rounded-lg text-white min-w-[200px] text-center">
                    {getCalendarTitle()}
                  </div>
                  <button
                    onClick={() => navigateCalendar('next')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area - List or Calendar View */}
      {viewMode === 'list' ? (
        /* Reservations Table */
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cancha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duración</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pago</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredReservations.map((reservation, index) => (
                  <motion.tr
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {reservation.clientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{reservation.clientName}</div>
                          <div className="text-sm text-gray-400">{reservation.clientEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-white">{reservation.court}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {new Date(reservation.date).toLocaleDateString('es-AR')}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {reservation.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {reservation.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-400">
                      ${reservation.price.toLocaleString()}
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewReservation(reservation)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditReservation(reservation)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar reserva"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {reservation.status === 'pending' && (
                          <button 
                            onClick={() => handleConfirmReservation(reservation.id)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title="Confirmar reserva"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                          <button 
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Cancelar reserva"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {reservation.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCompleteReservation(reservation.id)}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                            title="Marcar como completada"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteReservation(reservation.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {calendarView === 'month' && (
            /* Month View */
            <div className="p-6">
              <div className="grid grid-cols-7 gap-px bg-gray-700 rounded-lg overflow-hidden">
                {/* Day Headers */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="bg-gray-600 px-3 py-2 text-center text-xs font-medium text-gray-300">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {generateCalendarDays().map((day, index) => {
                  const dayReservations = getReservationsForDate(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`bg-gray-800 min-h-[120px] p-2 ${
                        !isCurrentMonth ? 'opacity-40' : ''
                      } ${isToday ? 'ring-2 ring-emerald-500' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayReservations.slice(0, 3).map((reservation) => (
                          <div
                            key={reservation.id}
                            onClick={() => handleViewReservation(reservation)}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(reservation.status)}`}
                          >
                            <div className="font-medium truncate">{reservation.clientName}</div>
                            <div className="truncate">{reservation.time} - {reservation.court}</div>
                          </div>
                        ))}
                        {dayReservations.length > 3 && (
                          <div className="text-xs text-gray-400 p-1">
                            +{dayReservations.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {calendarView === 'week' && (
            /* Week View */
            <div className="p-6">
              <div className="grid grid-cols-8 gap-px bg-gray-700 rounded-lg overflow-hidden">
                {/* Time Column Header */}
                <div className="bg-gray-600 px-3 py-2 text-center text-xs font-medium text-gray-300">
                  Hora
                </div>
                
                {/* Day Headers */}
                {generateWeekDays().map((day) => (
                  <div key={day.toISOString()} className="bg-gray-600 px-3 py-2 text-center text-xs font-medium text-gray-300">
                    <div>{day.toLocaleDateString('es-AR', { weekday: 'short' })}</div>
                    <div className="text-white font-bold">{day.getDate()}</div>
                  </div>
                ))}
                
                {/* Time Slots */}
                {generateDayHours().map((hour) => (
                  <React.Fragment key={hour}>
                    {/* Time Label */}
                    <div className="bg-gray-800 px-3 py-4 text-xs text-gray-400 border-r border-gray-700">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    
                    {/* Day Columns */}
                    {generateWeekDays().map((day) => {
                      const dayReservations = getReservationsForDate(day).filter(r => {
                        const reservationHour = parseInt(r.time.split(':')[0]);
                        return reservationHour === hour;
                      });
                      
                      return (
                        <div key={`${day.toISOString()}-${hour}`} className="bg-gray-800 min-h-[60px] p-1 border-r border-gray-700">
                          {dayReservations.map((reservation) => (
                            <div
                              key={reservation.id}
                              onClick={() => handleViewReservation(reservation)}
                              className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity mb-1 ${getStatusColor(reservation.status)}`}
                            >
                              <div className="font-medium truncate">{reservation.clientName}</div>
                              <div className="truncate">{reservation.court}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {calendarView === 'day' && (
            /* Day View */
            <div className="p-6">
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-600 px-6 py-4 text-center">
                  <h3 className="text-lg font-medium text-white">
                    {currentDate.toLocaleDateString('es-AR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-700">
                  {generateDayHours().map((hour) => {
                    const hourReservations = getReservationsForDate(currentDate).filter(r => {
                      const reservationHour = parseInt(r.time.split(':')[0]);
                      return reservationHour === hour;
                    });
                    
                    return (
                      <div key={hour} className="flex">
                        <div className="w-20 bg-gray-800 px-4 py-6 text-sm text-gray-400 border-r border-gray-700">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="flex-1 bg-gray-800 p-4 min-h-[80px]">
                          {hourReservations.map((reservation) => (
                            <div
                              key={reservation.id}
                              onClick={() => handleViewReservation(reservation)}
                              className={`p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity mb-2 ${getStatusColor(reservation.status)}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-white">{reservation.clientName}</div>
                                  <div className="text-sm opacity-80">{reservation.court}</div>
                                  <div className="text-xs opacity-60">{reservation.time} - {reservation.duration} min</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">${reservation.price.toLocaleString()}</div>
                                  <div className="text-xs opacity-80 capitalize">{reservation.status}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {hourReservations.length === 0 && (
                            <div className="text-gray-500 text-sm italic">Sin reservas</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reservation Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalles de la Reserva</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Cliente</label>
                  <div className="mt-1 flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {selectedReservation.clientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedReservation.clientName}</p>
                      <p className="text-gray-400 text-sm">{selectedReservation.clientEmail}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Teléfono</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{selectedReservation.clientPhone}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Cancha</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{selectedReservation.court}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Fecha y Hora</label>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{new Date(selectedReservation.date).toLocaleDateString('es-AR')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{selectedReservation.time} ({selectedReservation.duration} min)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Precio</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-emerald-400 font-medium">${selectedReservation.price.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Estado</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReservation.status)}`}>
                      {getStatusIcon(selectedReservation.status)}
                      <span className="ml-1 capitalize">{selectedReservation.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedReservation.notes && (
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-300">Notas</label>
                <p className="mt-1 text-white bg-gray-700 rounded-lg p-3">{selectedReservation.notes}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cerrar
              </button>
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditReservation(selectedReservation);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
              >
                Editar Reserva
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Reservation Modal */}
      {showEditModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Reserva</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

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
            }} className="space-y-4">
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cancha *
                  </label>
                  <select
                    name="court"
                    required
                    defaultValue={selectedReservation.court}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Cancha 1 - Fútbol 5">Cancha 1 - Fútbol 5</option>
                    <option value="Cancha 2 - Paddle">Cancha 2 - Paddle</option>
                    <option value="Cancha 3 - Tenis">Cancha 3 - Tenis</option>
                    <option value="Cancha 4 - Básquet">Cancha 4 - Básquet</option>
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Notas adicionales sobre la reserva..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Reservation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Nueva Reserva</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

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
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ej: Juan Pérez"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="juan.perez@email.com"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cancha *
                  </label>
                  <select
                    name="court"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Seleccionar cancha</option>
                    <option value="Cancha 1 - Fútbol 5">Cancha 1 - Fútbol 5</option>
                    <option value="Cancha 2 - Paddle">Cancha 2 - Paddle</option>
                    <option value="Cancha 3 - Tenis">Cancha 3 - Tenis</option>
                    <option value="Cancha 4 - Básquet">Cancha 4 - Básquet</option>
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
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duración (minutos) *
                  </label>
                  <select
                    name="duration"
                    required
                    defaultValue="90"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    defaultValue="8000"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue="pending"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado de Pago *
                  </label>
                  <select
                    name="paymentStatus"
                    required
                    defaultValue="pending"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Notas adicionales sobre la reserva..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                >
                  Crear Reserva
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
