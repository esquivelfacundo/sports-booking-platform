'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Loader2,
  Menu,
  X,
  Star,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayerDashboard } from '@/hooks/usePlayerDashboard';
import { apiClient } from '@/lib/api';

// Import section components
import ProfileSection from './ProfileSection';
import ReservationsSection from './ReservationsSection';
import FavoritesSection from './FavoritesSection';
import SettingsSection from './SettingsSection';

const DashboardContent = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userFavorites, setUserFavorites] = useState<Array<{ id: string; name: string; slug: string; image?: string }>>([]);
  const [activeSubTab, setActiveSubTab] = useState('notifications');
  const [reservationsTab, setReservationsTab] = useState('upcoming');
  const { 
    stats, 
    upcomingBookings, 
    loading: dashboardLoading,
    refresh 
  } = usePlayerDashboard();

  // Fetch user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !user) {
        setUserFavorites([]);
        return;
      }
      try {
        const response = await apiClient.get('/api/users/favorites') as any;
        if (response && response.favorites) {
          setUserFavorites(response.favorites.map((fav: any) => ({
            id: fav.id || fav.establishmentId,
            name: fav.name || fav.establishmentName,
            slug: fav.slug || fav.id,
            image: fav.image || fav.images?.[0]
          })));
        } else {
          setUserFavorites([]);
        }
      } catch (err) {
        // Silently handle error - user might not have favorites endpoint access
        console.log('Could not fetch favorites (this is normal if not logged in)');
        setUserFavorites([]);
      }
    };
    fetchFavorites();
  }, [isAuthenticated, user]);

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
        return <ReservationsSection activeTab={reservationsTab} />;
      case 'favorites':
        return <FavoritesSection />;
      case 'settings':
        return <SettingsSection activeTab={activeSubTab} />;
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
                    className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs sm:text-sm truncate">Reservas Totales</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 mr-1" />
                      <span className="text-emerald-600 font-medium">{stats.completedReservations}</span>
                      <span className="text-gray-500 ml-1 hidden sm:inline">completadas</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs sm:text-sm truncate">Próximas</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.upcomingReservations}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-orange-500 font-medium">{stats.cancelledReservations}</span>
                      <span className="text-gray-500 ml-1 hidden sm:inline">canceladas</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs sm:text-sm truncate">Favoritos</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalFavorites}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-gray-500 truncate hidden sm:inline">guardados</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs sm:text-sm truncate">Total Gastado</p>
                        <p className="text-lg sm:text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalSpent)}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-gray-500 truncate hidden sm:inline">en reservas</span>
                    </div>
                  </motion.div>
                </div>

                {/* Upcoming Reservations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Próximas Reservas</h3>
                    <button 
                      onClick={() => setActiveSection('reservations')}
                      className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium"
                    >
                      Ver todas →
                    </button>
                  </div>
                  
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {upcomingBookings.slice(0, 3).map((booking) => (
                        <div 
                          key={booking.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg gap-3 transition-colors"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{booking.courtName}</p>
                              <p className="text-xs sm:text-sm text-gray-500 truncate">{booking.establishmentName}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:block sm:text-right pl-13 sm:pl-0">
                            <div>
                              <p className="text-gray-900 font-medium text-sm">{formatDate(booking.date)}</p>
                              <p className="text-xs sm:text-sm text-gray-500">{booking.startTime}</p>
                            </div>
                            <p className="text-emerald-600 text-sm font-semibold">{formatCurrency(booking.totalAmount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base">No tienes reservas próximas</p>
                      <Link 
                        href="/buscar"
                        className="inline-block mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
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
                  className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Acciones Rápidas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <Link
                      href="/buscar"
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Buscar Canchas</p>
                        <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Encuentra tu próximo partido</p>
                      </div>
                    </Link>

                    <button
                      onClick={() => setActiveSection('reservations')}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Mis Reservas</p>
                        <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Ver historial completo</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveSection('favorites')}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Mis Favoritos</p>
                        <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Lugares guardados</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/assets/logos/logo-light.svg" alt="Mis Canchas" className="h-10 w-auto" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="px-2 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                    className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </button>
                );
              })}
            </div>
            
            {/* Favorite establishments - Quick access */}
            {userFavorites.length > 0 && (
              <>
                <div className="mx-4 my-3 border-t border-gray-200" />
                <div className="px-4 mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Accesos rápidos</p>
                </div>
                <div className="px-2 space-y-1">
                  {userFavorites.slice(0, 5).map((fav) => (
                    <Link 
                      key={fav.id} 
                      href={`/reservar/${fav.slug}`} 
                      onClick={() => setSidebarOpen(false)} 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      {fav.image ? (
                        <img src={fav.image} alt="" className="mr-3 h-6 w-6 rounded-md object-cover flex-shrink-0" />
                      ) : (
                        <div className="mr-3 h-6 w-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Star className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                      )}
                      <span className="truncate">{fav.name}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>
          {/* User info at bottom of mobile sidebar */}
          {user && (
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile topbar */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg mr-2">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src="/assets/logos/favicon-light.svg" alt="" className="w-8 h-8" />
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 text-sm truncate">Mi Dashboard</h1>
              <p className="text-xs text-gray-500">{sidebarItems.find(i => i.id === activeSection)?.name}</p>
            </div>
          </div>
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile content */}
      <div className="lg:hidden flex-1 bg-gray-50">
        <div className="px-4 py-6">
          {renderActiveSection()}
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block min-h-screen bg-gray-50">
        {/* Desktop sidebar - collapsible with hover */}
        <div 
          className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-[width] duration-200 ease-out z-40 ${
            sidebarCollapsed ? 'lg:w-16' : 'lg:w-52'
          }`}
          onMouseEnter={() => setSidebarCollapsed(false)}
          onMouseLeave={() => setSidebarCollapsed(true)}
        >
          <div className="flex flex-col flex-grow bg-white pt-4 pb-4 overflow-hidden shadow-lg relative">
            {/* Logo section */}
            <div className="flex items-center flex-shrink-0 px-3 h-12 transition-none">
              <Link href="/" className="w-full flex items-center justify-start transition-none">
                <img 
                  src={sidebarCollapsed ? '/assets/logos/favicon-light.svg' : '/assets/logos/logo-light.svg'}
                  alt="Mis Canchas" 
                  className="h-10 w-auto transition-none"
                  style={{ transition: 'none' }}
                />
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="mt-6 flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-2 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`group flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="flex-shrink-0 h-5 w-5" />
                    <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{item.name}</span>
                  </button>
                );
              })}
              
              {/* Favorite establishments - Quick access */}
              {userFavorites.length > 0 && (
                <>
                  <div className="mx-3 my-2 border-t border-gray-200" />
                  <div className={`px-3 mb-1 transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Accesos rápidos</p>
                  </div>
                  {userFavorites.slice(0, 5).map((fav) => (
                    <Link 
                      key={fav.id} 
                      href={`/reservar/${fav.slug}`}
                      className="group flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      {fav.image ? (
                        <img src={fav.image} alt="" className="flex-shrink-0 h-5 w-5 rounded object-cover" />
                      ) : (
                        <Star className="flex-shrink-0 h-5 w-5 text-emerald-500" />
                      )}
                      <span className={`ml-3 text-sm font-medium whitespace-nowrap truncate transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{fav.name}</span>
                    </Link>
                  ))}
                </>
              )}
            </nav>
            
            {/* User info at bottom */}
            {user && (
              <div className="flex-shrink-0 border-t border-gray-200 p-3">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className={`flex-1 min-w-0 ml-3 transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content with sidebar offset */}
        <div className={`flex flex-col min-h-screen transition-[padding] duration-200 ease-out ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-52'}`}>
          {/* Top navigation bar */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="w-full px-6">
              <div className="flex items-center justify-between h-14">
                {/* Left: Title and Tabs */}
                <div className="flex items-center gap-6">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {sidebarItems.find(i => i.id === activeSection)?.name || 'Dashboard'}
                  </h1>
                  
                  {/* Settings sub-tabs */}
                  {activeSection === 'settings' && (
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                      {[
                        { id: 'notifications', label: 'Notificaciones' },
                        { id: 'privacy', label: 'Privacidad' },
                        { id: 'preferences', label: 'Preferencias' },
                        { id: 'security', label: 'Seguridad' },
                        { id: 'account', label: 'Cuenta' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSubTab(tab.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            activeSubTab === tab.id
                              ? 'bg-white text-emerald-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Reservations sub-tabs */}
                  {activeSection === 'reservations' && (
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                      {[
                        { id: 'upcoming', label: 'Próximas' },
                        { id: 'past', label: 'Pasadas' },
                        { id: 'cancelled', label: 'Canceladas' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setReservationsTab(tab.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            reservationsTab === tab.id
                              ? 'bg-white text-emerald-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                  <Link 
                    href="/buscar"
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                  >
                    Reservar cancha
                  </Link>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              {renderActiveSection()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
