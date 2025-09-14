'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Filter,
  Search,
  ChevronDown,
  Trophy,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ReservationsSectionProps {
  user: any;
}

const ReservationsSection: React.FC<ReservationsSectionProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Mock data - replace with real API call
  const reservations = {
    upcoming: [
      {
        id: 1,
        facility: 'Club Deportivo Central',
        court: 'Cancha de Tenis #1',
        sport: 'Tenis',
        date: '2024-01-15',
        time: '18:00 - 19:30',
        duration: '1h 30min',
        price: '$2,500',
        status: 'confirmed',
        players: 2,
        location: 'Palermo, CABA'
      },
      {
        id: 2,
        facility: 'Padel Club Norte',
        court: 'Cancha de Padel #3',
        sport: 'Padel',
        date: '2024-01-18',
        time: '20:00 - 21:00',
        duration: '1h',
        price: '$1,800',
        status: 'confirmed',
        players: 4,
        location: 'Belgrano, CABA'
      }
    ],
    past: [
      {
        id: 3,
        facility: 'Futbol 5 San Telmo',
        court: 'Cancha Sintética #2',
        sport: 'Fútbol 5',
        date: '2024-01-10',
        time: '19:00 - 20:00',
        duration: '1h',
        price: '$3,200',
        status: 'completed',
        players: 10,
        location: 'San Telmo, CABA'
      },
      {
        id: 4,
        facility: 'Basketball Arena',
        court: 'Cancha Principal',
        sport: 'Basketball',
        date: '2024-01-08',
        time: '17:30 - 18:30',
        duration: '1h',
        price: '$2,000',
        status: 'completed',
        players: 8,
        location: 'Villa Crespo, CABA'
      }
    ],
    cancelled: [
      {
        id: 5,
        facility: 'Tenis Club Premium',
        court: 'Cancha de Tenis #2',
        sport: 'Tenis',
        date: '2024-01-12',
        time: '16:00 - 17:00',
        duration: '1h',
        price: '$2,200',
        status: 'cancelled',
        players: 2,
        location: 'Recoleta, CABA'
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  const tabs = [
    { id: 'upcoming', name: 'Próximas', count: reservations.upcoming.length },
    { id: 'past', name: 'Pasadas', count: reservations.past.length },
    { id: 'cancelled', name: 'Canceladas', count: reservations.cancelled.length }
  ];

  const currentReservations = reservations[activeTab as keyof typeof reservations] || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Mis Reservas
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar reservas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Reservas</p>
              <p className="text-2xl font-bold text-white">
                {reservations.upcoming.length + reservations.past.length + reservations.cancelled.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Próximas</p>
              <p className="text-2xl font-bold text-white">{reservations.upcoming.length}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completadas</p>
              <p className="text-2xl font-bold text-white">{reservations.past.length}</p>
            </div>
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span className="font-medium">{tab.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
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
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{reservation.facility}</h3>
                    <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(reservation.status)}`}>
                      {getStatusIcon(reservation.status)}
                      <span>{getStatusText(reservation.status)}</span>
                    </span>
                  </div>
                  <p className="text-gray-400 mb-2">{reservation.court}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{reservation.sport}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{reservation.players} jugadores</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{reservation.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400 mb-1">{reservation.price}</p>
                  <p className="text-sm text-gray-400">{reservation.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{reservation.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{reservation.time}</span>
                  </div>
                </div>
                
                {activeTab === 'upcoming' && (
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                      Ver detalles
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                      Cancelar
                    </button>
                  </div>
                )}
                
                {activeTab === 'past' && (
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm">
                      Reservar de nuevo
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                      Calificar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No hay reservas {activeTab === 'upcoming' ? 'próximas' : activeTab === 'past' ? 'pasadas' : 'canceladas'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'upcoming' 
                ? 'Cuando hagas una reserva, aparecerá aquí.'
                : activeTab === 'past'
                ? 'Tus reservas completadas aparecerán aquí.'
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
