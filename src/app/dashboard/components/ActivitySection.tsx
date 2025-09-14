'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Search, 
  Filter,
  Trophy,
  Calendar,
  Users,
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  MapPin,
  Clock,
  ChevronDown
} from 'lucide-react';

interface ActivitySectionProps {
  user: any;
}

const ActivitySection: React.FC<ActivitySectionProps> = ({ user }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real API call
  const activities = [
    {
      id: 1,
      type: 'match',
      title: 'Completó un partido de Tenis',
      description: 'Partido en Club Deportivo Central',
      location: 'Palermo, CABA',
      timestamp: '2024-01-12 18:30',
      timeAgo: '2 horas',
      user: 'Carlos Mendez',
      avatar: null,
      details: {
        result: 'Victoria 6-4, 6-2',
        opponent: 'Ana Rodriguez',
        duration: '1h 30min'
      }
    },
    {
      id: 2,
      type: 'reservation',
      title: 'Nueva reserva confirmada',
      description: 'Cancha de Padel #3 - Padel Club Norte',
      location: 'Belgrano, CABA',
      timestamp: '2024-01-12 16:15',
      timeAgo: '4 horas',
      user: user?.name || 'Usuario',
      avatar: user?.avatar,
      details: {
        date: '2024-01-18',
        time: '20:00 - 21:00',
        price: '$1,800'
      }
    },
    {
      id: 3,
      type: 'friend',
      title: 'Nuevo amigo agregado',
      description: 'Se conectó con Diego Martinez',
      location: 'Villa Crespo, CABA',
      timestamp: '2024-01-12 14:20',
      timeAgo: '6 horas',
      user: user?.name || 'Usuario',
      avatar: user?.avatar,
      details: {
        mutualFriends: 2,
        commonSports: ['Padel', 'Tenis']
      }
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Nuevo logro desbloqueado',
      description: '¡10 partidos completados!',
      timestamp: '2024-01-11 22:45',
      timeAgo: '1 día',
      user: user?.name || 'Usuario',
      avatar: user?.avatar,
      details: {
        achievement: 'Jugador Activo',
        points: 100
      }
    },
    {
      id: 5,
      type: 'review',
      title: 'Nueva reseña recibida',
      description: 'Calificación de 5 estrellas en Club Central',
      location: 'Palermo, CABA',
      timestamp: '2024-01-11 19:30',
      timeAgo: '1 día',
      user: 'Laura Gonzalez',
      avatar: null,
      details: {
        rating: 5,
        comment: 'Excelente compañero de juego, muy puntual y deportivo.'
      }
    }
  ];

  const filters = [
    { id: 'all', name: 'Todas', count: activities.length },
    { id: 'match', name: 'Partidos', count: activities.filter(a => a.type === 'match').length },
    { id: 'reservation', name: 'Reservas', count: activities.filter(a => a.type === 'reservation').length },
    { id: 'friend', name: 'Social', count: activities.filter(a => a.type === 'friend').length },
    { id: 'achievement', name: 'Logros', count: activities.filter(a => a.type === 'achievement').length }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Trophy className="w-5 h-5 text-emerald-400" />;
      case 'reservation':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'friend':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'achievement':
        return <Star className="w-5 h-5 text-yellow-400" />;
      case 'review':
        return <MessageCircle className="w-5 h-5 text-pink-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'match':
        return 'bg-emerald-500/20 border-emerald-500/30';
      case 'reservation':
        return 'bg-blue-500/20 border-blue-500/30';
      case 'friend':
        return 'bg-purple-500/20 border-purple-500/30';
      case 'achievement':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'review':
        return 'bg-pink-500/20 border-pink-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredActivities = activeFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === activeFilter);

  const ActivityCard = ({ activity }: { activity: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getActivityColor(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-white font-semibold">{activity.title}</h3>
              <p className="text-gray-400 text-sm">{activity.description}</p>
            </div>
            <span className="text-gray-500 text-xs">{activity.timeAgo}</span>
          </div>

          {activity.location && (
            <div className="flex items-center space-x-1 text-gray-400 text-sm mb-3">
              <MapPin className="w-4 h-4" />
              <span>{activity.location}</span>
            </div>
          )}

          {/* Activity Details */}
          {activity.details && (
            <div className="bg-gray-700 rounded-lg p-3 mb-3">
              {activity.type === 'match' && (
                <div className="space-y-1">
                  <div className="text-emerald-400 font-medium">{activity.details.result}</div>
                  <div className="text-gray-300 text-sm">vs {activity.details.opponent}</div>
                  <div className="text-gray-400 text-xs">{activity.details.duration}</div>
                </div>
              )}
              {activity.type === 'reservation' && (
                <div className="space-y-1">
                  <div className="text-blue-400 font-medium">{activity.details.date}</div>
                  <div className="text-gray-300 text-sm">{activity.details.time}</div>
                  <div className="text-emerald-400 text-sm">{activity.details.price}</div>
                </div>
              )}
              {activity.type === 'friend' && (
                <div className="space-y-1">
                  <div className="text-purple-400 text-sm">{activity.details.mutualFriends} amigos en común</div>
                  <div className="text-gray-300 text-sm">
                    Deportes: {activity.details.commonSports.join(', ')}
                  </div>
                </div>
              )}
              {activity.type === 'achievement' && (
                <div className="space-y-1">
                  <div className="text-yellow-400 font-medium">{activity.details.achievement}</div>
                  <div className="text-emerald-400 text-sm">+{activity.details.points} puntos</div>
                </div>
              )}
              {activity.type === 'review' && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    {[...Array(activity.details.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-gray-300 text-sm italic">"{activity.details.comment}"</div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                {activity.avatar ? (
                  <img src={activity.avatar} alt={activity.user} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">{getInitials(activity.user)}</span>
                )}
              </div>
              <span className="text-gray-300 text-sm">{activity.user}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-400 text-xs">
              <Clock className="w-3 h-3" />
              <span>{activity.timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Actividad Social
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar actividad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Actividades Hoy</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <Activity className="w-8 h-8 text-emerald-400" />
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
              <p className="text-gray-400 text-sm">Esta Semana</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
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
              <p className="text-gray-400 text-sm">Partidos</p>
              <p className="text-2xl font-bold text-white">
                {activities.filter(a => a.type === 'match').length}
              </p>
            </div>
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Logros</p>
              <p className="text-2xl font-bold text-white">
                {activities.filter(a => a.type === 'achievement').length}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeFilter === filter.id
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span className="font-medium">{filter.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeFilter === filter.id ? 'bg-white/20' : 'bg-gray-600'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Activity Feed */}
      {filteredActivities.length > 0 ? (
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No hay actividad reciente
          </h3>
          <p className="text-gray-500">
            Tu actividad deportiva aparecerá aquí cuando comiences a jugar.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ActivitySection;
