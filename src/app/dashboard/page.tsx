'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Heart, 
  Users, 
  Search, 
  Trophy,
  Star,
  MapPin,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Award,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ImmersiveAuthScreen from '@/components/auth/ImmersiveAuthScreen';

// Import section components
import ProfileSection from './components/ProfileSection';
import ReservationsSection from './components/ReservationsSection';
import FavoritesSection from './components/FavoritesSection';
import FriendsSection from './components/FriendsSection';
import MatchesSection from './components/MatchesSection';
import TeamsSection from './components/TeamsSection';
import ActivitySection from './components/ActivitySection';
import RatingsSection from './components/RatingsSection';

// Import Settings Section
import SettingsSection from './components/SettingsSection';

const PlayerDashboard = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('overview');

  // Handle URL section parameter
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  if (!isAuthenticated || !user) {
    return <ImmersiveAuthScreen defaultMode="login" />;
  }

  const menuItems = [
    {
      id: 'overview',
      name: 'Resumen',
      icon: BarChart3,
      href: '/dashboard'
    },
    {
      id: 'profile',
      name: 'Mi Perfil',
      icon: User
    },
    {
      id: 'reservations',
      name: 'Mis Reservas',
      icon: Calendar
    },
    {
      id: 'favorites',
      name: 'Favoritos',
      icon: Heart
    },
    {
      id: 'friends',
      name: 'Amigos',
      icon: Users
    },
    {
      id: 'matches',
      name: 'Buscar Jugadores',
      icon: Search
    },
    {
      id: 'teams',
      name: 'Mis Equipos',
      icon: Trophy
    },
    {
      id: 'activity',
      name: 'Actividad Social',
      icon: Activity
    },
    {
      id: 'ratings',
      name: 'Calificaciones',
      icon: Star
    }
  ];

  const stats = [
    {
      title: 'Partidos Jugados',
      value: user?.stats?.totalGames || 0,
      change: '+3 este mes',
      trend: 'up',
      icon: Trophy,
      color: 'emerald'
    },
    {
      title: 'Reservas Activas',
      value: user?.stats?.totalReservations || 0,
      change: '2 próximas',
      trend: 'up',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Rating Promedio',
      value: user?.stats?.rating?.toFixed(1) || '0.0',
      change: '+0.2 este mes',
      trend: 'up',
      icon: Star,
      color: 'yellow'
    },
    {
      title: 'Amigos',
      value: user?.stats?.friendsCount || 0,
      change: '+2 nuevos',
      trend: 'up',
      icon: Users,
      color: 'purple'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'match',
      title: 'Partido de Fútbol 5',
      location: 'Club Atlético River',
      time: 'Ayer 19:00',
      status: 'completed'
    },
    {
      id: 2,
      type: 'reservation',
      title: 'Reserva confirmada',
      location: 'Paddle Club Norte',
      time: 'Mañana 18:30',
      status: 'upcoming'
    },
    {
      id: 3,
      type: 'friend',
      title: 'Nuevo amigo agregado',
      location: 'Carlos López',
      time: 'Hace 2 días',
      status: 'social'
    }
  ];

  const upcomingMatches = [
    {
      id: 1,
      sport: 'Fútbol 5',
      location: 'Complejo Deportivo Sur',
      date: 'Mañana',
      time: '19:00',
      players: '8/10'
    },
    {
      id: 2,
      sport: 'Paddle',
      location: 'Club Náutico',
      date: 'Viernes',
      time: '20:30',
      players: '3/4'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* User Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{user.name}</h3>
              <p className="text-sm text-gray-400">{user.level || 'Jugador'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-gray-700">
          <button
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${
              activeSection === 'settings'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveSection('settings')}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configuración</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderActiveSection()}
      </div>
    </div>
  );

  function renderActiveSection() {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection user={user} updateProfile={updateProfile} />;
      case 'reservations':
        return <ReservationsSection user={user} />;
      case 'favorites':
        return <FavoritesSection user={user} />;
      case 'friends':
        return <FriendsSection user={user} />;
      case 'matches':
        return <MatchesSection user={user} />;
      case 'teams':
        return <TeamsSection user={user} />;
      case 'activity':
        return <ActivitySection user={user} />;
      case 'ratings':
        return <RatingsSection user={user} />;
      case 'settings':
        return <SettingsSection />;
      default:
        return renderOverviewSection();
    }
  }

  function renderOverviewSection() {
    return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              ¡Hola, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-400">
              Aquí tienes un resumen de tu actividad deportiva
            </p>
          </motion.div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <div className="flex items-center text-sm text-emerald-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">
                {stat.title}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl"
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Actividad Reciente
                </h2>
                <button 
                  onClick={() => setActiveSection('activity')}
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                >
                  Ver todo
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'match' ? 'bg-emerald-500/20' :
                        activity.type === 'reservation' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                      }`}>
                        {activity.type === 'match' && <Trophy className="w-5 h-5 text-emerald-400" />}
                        {activity.type === 'reservation' && <Calendar className="w-5 h-5 text-blue-400" />}
                        {activity.type === 'friend' && <Users className="w-5 h-5 text-purple-400" />}
                      </div>
                      <div>
                        <div className="font-medium text-white">{activity.title}</div>
                        <div className="text-sm text-gray-400">{activity.location}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gray-800 border border-gray-700 rounded-xl"
          >
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                Próximos Partidos
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{match.sport}</span>
                      <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">
                        {match.players}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {match.location}
                    </div>
                    <div className="text-sm text-gray-400">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {match.date} - {match.time}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveSection('matches')}
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 text-center"
              >
                Buscar más partidos
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/buscar"
              className="flex flex-col items-center p-4 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
            >
              <Search className="w-6 h-6 text-emerald-400 mb-2" />
              <span className="text-sm font-medium text-emerald-400">Buscar Canchas</span>
            </Link>
            <button 
              onClick={() => setActiveSection('matches')}
              className="flex flex-col items-center p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20"
            >
              <Users className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-sm font-medium text-blue-400">Buscar Jugadores</span>
            </button>
            <button 
              onClick={() => setActiveSection('favorites')}
              className="flex flex-col items-center p-4 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/20"
            >
              <Heart className="w-6 h-6 text-purple-400 mb-2" />
              <span className="text-sm font-medium text-purple-400">Mis Favoritos</span>
            </button>
            <button 
              onClick={() => setActiveSection('profile')}
              className="flex flex-col items-center p-4 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors border border-orange-500/20"
            >
              <User className="w-6 h-6 text-orange-400 mb-2" />
              <span className="text-sm font-medium text-orange-400">Mi Perfil</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
};

export default PlayerDashboard;
