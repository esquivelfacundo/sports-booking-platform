'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Heart, 
  Settings,
  BarChart3,
  TrendingUp,
  DollarSign,
  MapPin,
  Clock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayerDashboard } from '@/hooks/usePlayerDashboard';

// Import section components
import ProfileSection from './ProfileSection';
import ReservationsSection from './ReservationsSection';
import FavoritesSection from './FavoritesSection';
import SettingsSection from './SettingsSection';

const DashboardContent = () => {
  const { user, updateProfile } = useAuth();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('overview');
  const { 
    stats, 
    upcomingBookings, 
    loading: dashboardLoading,
    refresh 
  } = usePlayerDashboard();

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
      id: 'profile',
      name: 'Mi Perfil',
      icon: User
    },
    {
      id: 'settings',
      name: 'Configuración',
      icon: Settings
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection user={user} updateProfile={updateProfile} />;
      case 'reservations':
        return <ReservationsSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return (
          <div className="space-y-4 sm:space-y-5">
            {/* Loading State */}
            {dashboardLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            )}

            {/* Overview Dashboard */}
            {!dashboardLoading && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {/* Stats Cards - Real Data */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-3 sm:p-4 lg:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-xs sm:text-sm truncate">Reservas Totales</p>
                        <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalReservations}</p>
                      </div>
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 flex-shrink-0 ml-2" />
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 mr-1" />
                      <span className="text-emerald-400">{stats.completedReservations}</span>
                      <span className="text-gray-400 ml-1 hidden sm:inline">completadas</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-3 sm:p-4 lg:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-xs sm:text-sm truncate">Próximas</p>
                        <p className="text-xl sm:text-2xl font-bold text-white">{stats.upcomingReservations}</p>
                      </div>
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0 ml-2" />
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-blue-400">{stats.cancelledReservations}</span>
                      <span className="text-gray-400 ml-1 hidden sm:inline">canceladas</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-3 sm:p-4 lg:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-xs sm:text-sm truncate">Favoritos</p>
                        <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalFavorites}</p>
                      </div>
                      <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 flex-shrink-0 ml-2" />
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-gray-400 truncate hidden sm:inline">guardados</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-3 sm:p-4 lg:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-xs sm:text-sm truncate">Total Gastado</p>
                        <p className="text-lg sm:text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalSpent)}</p>
                      </div>
                      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0 ml-2" />
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-gray-400 truncate hidden sm:inline">completadas</span>
                    </div>
                  </motion.div>
                </div>

                {/* Upcoming Reservations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white">Próximas Reservas</h3>
                    <button 
                      onClick={() => setActiveSection('reservations')}
                      className="text-emerald-400 hover:text-emerald-300 text-xs sm:text-sm"
                    >
                      Ver todas
                    </button>
                  </div>
                  
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {upcomingBookings.slice(0, 3).map((booking) => (
                        <div 
                          key={booking.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-700 rounded-lg gap-3"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white text-sm sm:text-base truncate">{booking.courtName}</p>
                              <p className="text-xs sm:text-sm text-gray-400 truncate">{booking.establishmentName}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:block sm:text-right pl-13 sm:pl-0">
                            <div>
                              <p className="text-white font-medium text-sm">{formatDate(booking.date)}</p>
                              <p className="text-xs sm:text-sm text-gray-400">{booking.startTime}</p>
                            </div>
                            <p className="text-emerald-400 text-sm font-medium">{formatCurrency(booking.totalAmount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm sm:text-base">No tienes reservas próximas</p>
                      <Link 
                        href="/buscar"
                        className="inline-block mt-3 text-emerald-400 hover:text-emerald-300 text-sm"
                      >
                        Buscar canchas →
                      </Link>
                    </div>
                  )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Acciones Rápidas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <Link
                      href="/buscar"
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm sm:text-base">Buscar Canchas</p>
                        <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Encuentra tu próximo partido</p>
                      </div>
                    </Link>

                    <button
                      onClick={() => setActiveSection('reservations')}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                    >
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm sm:text-base">Mis Reservas</p>
                        <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Ver historial completo</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveSection('favorites')}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                    >
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm sm:text-base">Mis Favoritos</p>
                        <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Lugares guardados</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        );
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Menu Button - Fixed below topbar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-24 left-4 z-50 p-2 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar - Fixed on desktop, slide-in on mobile */}
        <div className={`
          fixed lg:fixed top-20 left-0 z-30
          w-64 bg-gray-800 border-r border-gray-700 
          h-[calc(100vh-5rem)] overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4">
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
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
        <div className="flex-1 min-w-0 lg:ml-64 pt-20">
          <div className={`px-4 sm:px-5 lg:px-6 pb-4 ${activeSection === 'overview' ? 'pt-2' : 'pt-4'}`}>
            <div className="max-w-6xl mx-auto">
              {/* Content */}
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
