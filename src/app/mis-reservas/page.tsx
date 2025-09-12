'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CreditCard, 
  Filter, 
  Search, 
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  Star,
  TrendingUp,
  Trophy,
  Target
} from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types/booking';

const MisReservasPage = () => {
  const { getFilteredBookings, bookingStats, filters, setFilters, cancelBooking, isLoading } = useBooking();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Requerido</h1>
          <p className="text-gray-400">Debes iniciar sesión para ver tus reservas.</p>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings().filter(booking =>
    booking.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      await cancelBooking(bookingId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Mis Reservas
          </h1>
          <p className="text-gray-400 text-lg">
            Gestiona todas tus reservas deportivas en un solo lugar
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Próximas</p>
                <p className="text-2xl font-bold text-emerald-400">{bookingStats.upcomingBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completadas</p>
                <p className="text-2xl font-bold text-blue-400">{bookingStats.completedBookings}</p>
              </div>
              <Trophy className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Horas Jugadas</p>
                <p className="text-2xl font-bold text-cyan-400">{bookingStats.hoursPlayed}h</p>
              </div>
              <Target className="w-8 h-8 text-cyan-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Gastado</p>
                <p className="text-2xl font-bold text-yellow-400">{formatPrice(bookingStats.totalSpent)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por establecimiento o deporte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todos</option>
                    <option value="upcoming">Próximas</option>
                    <option value="completed">Completadas</option>
                    <option value="cancelled">Canceladas</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
                  <select
                    value={filters.sortBy || 'date'}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="date">Fecha</option>
                    <option value="price">Precio</option>
                    <option value="facility">Establecimiento</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Orden</label>
                  <select
                    value={filters.sortOrder || 'desc'}
                    onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay reservas</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron reservas que coincidan con tu búsqueda.' : 'Aún no tienes reservas realizadas.'}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {booking.facilityName}
                          </h3>
                          <div className="flex items-center text-gray-400 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{booking.facilityAddress}</span>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="text-sm font-medium">{getStatusText(booking.status)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-4 h-4 mr-2 text-emerald-400" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Users className="w-4 h-4 mr-2 text-yellow-400" />
                          <span>{booking.sport}</span>
                        </div>
                      </div>

                      {booking.participants && booking.participants.length > 0 && (
                        <div className="mt-3 flex items-center text-sm text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Participantes: {booking.participants.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-400">{formatPrice(booking.price)}</p>
                        <p className="text-sm text-gray-400">{booking.paymentMethod}</p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver</span>
                        </button>
                        
                        {booking.status === 'confirmed' && new Date(booking.date) > new Date() && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={isLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancelar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
            <div className="fixed inset-0 z-[99999] overflow-y-auto pointer-events-none">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl my-8 pointer-events-auto"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-semibold text-white">Detalle de Reserva</h2>
                    <button
                      onClick={() => setSelectedBooking(null)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Facility Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Establecimiento</h3>
                        <div className="bg-gray-700 rounded-xl p-4">
                          <h4 className="font-medium text-white mb-2">{selectedBooking.facilityName}</h4>
                          <p className="text-gray-300 text-sm flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {selectedBooking.facilityAddress}
                          </p>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Detalles de la Reserva</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-700 rounded-xl p-4">
                            <p className="text-gray-400 text-sm mb-1">Deporte</p>
                            <p className="text-white font-medium">{selectedBooking.sport}</p>
                          </div>
                          <div className="bg-gray-700 rounded-xl p-4">
                            <p className="text-gray-400 text-sm mb-1">Fecha</p>
                            <p className="text-white font-medium">{formatDate(selectedBooking.date)}</p>
                          </div>
                          <div className="bg-gray-700 rounded-xl p-4">
                            <p className="text-gray-400 text-sm mb-1">Horario</p>
                            <p className="text-white font-medium">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                          </div>
                          <div className="bg-gray-700 rounded-xl p-4">
                            <p className="text-gray-400 text-sm mb-1">Duración</p>
                            <p className="text-white font-medium">{selectedBooking.duration}h</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Información de Pago</h3>
                        <div className="bg-gray-700 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Precio:</span>
                            <span className="text-emerald-400 font-bold text-lg">{formatPrice(selectedBooking.price)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Método de pago:</span>
                            <span className="text-white">{selectedBooking.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Estado del pago:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedBooking.paymentStatus === 'paid' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : selectedBooking.paymentStatus === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {selectedBooking.paymentStatus === 'paid' ? 'Pagado' : 
                               selectedBooking.paymentStatus === 'pending' ? 'Pendiente' : 'Fallido'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Participants */}
                      {selectedBooking.participants && selectedBooking.participants.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Participantes</h3>
                          <div className="bg-gray-700 rounded-xl p-4">
                            <div className="flex flex-wrap gap-2">
                              {selectedBooking.participants.map((participant, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm"
                                >
                                  {participant}
                                </span>
                              ))}
                            </div>
                            {selectedBooking.maxParticipants && (
                              <p className="text-gray-400 text-sm mt-2">
                                {selectedBooking.participants.length} de {selectedBooking.maxParticipants} participantes
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {selectedBooking.notes && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Notas</h3>
                          <div className="bg-gray-700 rounded-xl p-4">
                            <p className="text-gray-300">{selectedBooking.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisReservasPage;
