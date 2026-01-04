'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Filter,
  Search,
  ChevronDown,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  QrCode
} from 'lucide-react';
import { usePlayerDashboard } from '@/hooks/usePlayerDashboard';

interface ReservationsSectionProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const ReservationsSection: React.FC<ReservationsSectionProps> = ({ activeTab: externalActiveTab, onTabChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState('upcoming');
  const activeTab = externalActiveTab || internalActiveTab;
  
  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  
  const { 
    upcomingBookings, 
    pastBookings, 
    cancelledBookings,
    noShowBookings, 
    stats,
    loading,
    cancelBooking 
  } = usePlayerDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Transform bookings to display format
  const transformBooking = (booking: any) => ({
    id: booking.id,
    facility: booking.establishmentName,
    court: booking.courtName,
    sport: booking.sport,
    date: booking.date,
    time: `${booking.startTime} - ${booking.endTime || ''}`,
    duration: `${booking.duration}min`,
    price: formatCurrency(booking.totalAmount),
    status: booking.status,
    location: booking.location || ''
  });

  const reservations = {
    upcoming: upcomingBookings.map(transformBooking),
    past: pastBookings.map(transformBooking),
    cancelled: cancelledBookings.map(transformBooking),
    noShow: noShowBookings.map(transformBooking)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'in_progress':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'no_show':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'in_progress':
        return 'En curso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'no_show':
        return 'No asistió';
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'in_progress':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      case 'no_show':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  const tabs = [
    { id: 'upcoming', name: 'Próximas', count: reservations.upcoming.length },
    { id: 'past', name: 'Completadas', count: reservations.past.length },
    { id: 'cancelled', name: 'Canceladas', count: reservations.cancelled.length },
    { id: 'noShow', name: 'No asistidas', count: reservations.noShow.length }
  ];

  const currentReservations = reservations[activeTab as keyof typeof reservations] || [];

  return (
    <div>
      {/* Header - Mobile optimized */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Mis Reservas
        </h1>
        
        {/* Search bar - Full width on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar reservas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm sm:w-auto"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        
        {/* Tabs - Only visible on mobile (hidden on desktop as they're in topbar) */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">{tab.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards - Horizontal scroll on mobile, grid on desktop */}
      <div className="mb-8">
        <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm min-w-[160px] snap-start flex-shrink-0"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-gray-500 text-xs mb-1">Total Reservas</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservations.upcoming.length + reservations.past.length + reservations.cancelled.length + reservations.noShow.length}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm min-w-[160px] snap-start flex-shrink-0"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-gray-500 text-xs mb-1">Próximas</p>
              <p className="text-2xl font-bold text-gray-900">{reservations.upcoming.length}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm min-w-[160px] snap-start flex-shrink-0"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-gray-500 text-xs mb-1">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">{reservations.past.length}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm min-w-[160px] snap-start flex-shrink-0"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-gray-500 text-xs mb-1">Canceladas</p>
              <p className="text-2xl font-bold text-gray-900">{reservations.cancelled.length}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm min-w-[160px] snap-start flex-shrink-0"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-gray-500 text-xs mb-1">No asistidas</p>
              <p className="text-2xl font-bold text-gray-900">{reservations.noShow.length}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {currentReservations.length > 0 ? (
          currentReservations.map((reservation, index) => (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-gray-300 hover:shadow-md transition-all"
            >
              {/* Nombre del establecimiento */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{reservation.facility}</h3>
              
              {/* Cancha - Deporte - Ubicación */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="font-medium">{reservation.court}</span>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>{reservation.sport}</span>
                </div>
                {reservation.location && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{reservation.location}</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Estado - Monto - Duración */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(reservation.status)}`}>
                  {getStatusIcon(reservation.status)}
                  <span>{getStatusText(reservation.status)}</span>
                </span>
                <span className="text-emerald-600 font-bold text-lg">{reservation.price}</span>
                <span className="text-gray-500 text-sm">{reservation.duration}</span>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>
              
              {/* Fecha - Hora */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{reservation.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{reservation.time}</span>
                </div>
              </div>
              
              {/* Botones de acción */}
              {activeTab === 'upcoming' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/reservar/confirmacion/${reservation.id}`}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <QrCode className="w-4 h-4" />
                    Ver QR
                  </Link>
                  <button 
                    onClick={async () => {
                      if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                        await cancelBooking(reservation.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              
              {activeTab === 'past' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/reservar/confirmacion/${reservation.id}`}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalle
                  </Link>
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium">
                    Reservar de nuevo
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">
                    Calificar
                  </button>
                </div>
              )}
              
              {(activeTab === 'cancelled' || activeTab === 'noShow') && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/reservar/confirmacion/${reservation.id}`}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalle
                  </Link>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay reservas {activeTab === 'upcoming' ? 'próximas' : activeTab === 'past' ? 'pasadas' : activeTab === 'noShow' ? 'no asistidas' : 'canceladas'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'upcoming' 
                ? 'Cuando hagas una reserva, aparecerá aquí.'
                : activeTab === 'past'
                ? 'Tus reservas completadas aparecerán aquí.'
                : activeTab === 'noShow'
                ? 'Las reservas donde no asististe aparecerán aquí.'
                : 'Las reservas canceladas aparecerán aquí.'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReservationsSection;
