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

// Import section components
import ProfileSection from './ProfileSection';
import ReservationsSection from './ReservationsSection';
import FavoritesSection from './FavoritesSection';
import FriendsSection from './FriendsSection';
import MatchesSection from './MatchesSection';
import TeamsSection from './TeamsSection';
import ActivitySection from './ActivitySection';
import RatingsSection from './RatingsSection';
import SettingsSection from './SettingsSection';

const DashboardContent = () => {
  const { user, updateProfile } = useAuth();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('overview');

  // Handle URL section parameter
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const sidebarItems = [
    {
      id: 'overview',
      name: 'Resumen',
      icon: BarChart3
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
      name: 'Partidos',
      icon: Trophy
    },
    {
      id: 'teams',
      name: 'Equipos',
      icon: Users
    },
    {
      id: 'activity',
      name: 'Actividad',
      icon: Activity
    },
    {
      id: 'ratings',
      name: 'Valoraciones',
      icon: Star
    },
    {
      id: 'settings',
      name: 'Configuración',
      icon: Settings
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection user={user} onUpdateProfile={updateProfile} />;
      case 'reservations':
        return <ReservationsSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'friends':
        return <FriendsSection />;
      case 'matches':
        return <MatchesSection />;
      case 'teams':
        return <TeamsSection />;
      case 'activity':
        return <ActivitySection />;
      case 'ratings':
        return <RatingsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return (
          <div className="space-y-6">
            {/* Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Reservas Totales</p>
                    <p className="text-2xl font-bold text-white">24</p>
                  </div>
                  <Calendar className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400">+12%</span>
                  <span className="text-gray-400 ml-1">vs mes anterior</span>
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
                    <p className="text-gray-400 text-sm">Partidos Jugados</p>
                    <p className="text-2xl font-bold text-white">18</p>
                  </div>
                  <Trophy className="w-8 h-8 text-blue-400" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Target className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-blue-400">75%</span>
                  <span className="text-gray-400 ml-1">tasa de asistencia</span>
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
                    <p className="text-gray-400 text-sm">Amigos</p>
                    <p className="text-2xl font-bold text-white">42</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Users className="w-4 h-4 text-purple-400 mr-1" />
                  <span className="text-purple-400">+3</span>
                  <span className="text-gray-400 ml-1">esta semana</span>
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
                    <p className="text-gray-400 text-sm">Rating Promedio</p>
                    <p className="text-2xl font-bold text-white">4.8</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Award className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-yellow-400">Top 10%</span>
                  <span className="text-gray-400 ml-1">en tu zona</span>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/buscar"
                  className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Search className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">Buscar Canchas</p>
                    <p className="text-sm text-gray-400">Encuentra tu próximo partido</p>
                  </div>
                </Link>

                <Link
                  href="/buscar-jugadores"
                  className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Users className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Buscar Jugadores</p>
                    <p className="text-sm text-gray-400">Únete a un partido</p>
                  </div>
                </Link>

                <Link
                  href="/torneos"
                  className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Trophy className="w-6 h-6 text-purple-400" />
                  <div>
                    <p className="font-medium text-white">Ver Torneos</p>
                    <p className="text-sm text-gray-400">Compite y gana premios</p>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white">Reservaste una cancha en Club Central</p>
                    <p className="text-sm text-gray-400">Hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white">Te uniste al partido de Juan en Polideportivo Norte</p>
                    <p className="text-sm text-gray-400">Hace 1 día</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white">Recibiste una valoración de 5 estrellas</p>
                    <p className="text-sm text-gray-400">Hace 2 días</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Mi Dashboard</h2>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                ¡Hola, {user?.name || 'Jugador'}! 👋
              </h1>
              <p className="text-gray-400">
                Aquí tienes un resumen de tu actividad deportiva
              </p>
            </div>

            {/* Content */}
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
