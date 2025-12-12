'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  Users, 
  MapPin, 
  Wrench, 
  Target, 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  X,
  ChevronDown,
  Trophy,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEstablishmentAdmin } from '@/hooks/useEstablishmentAdmin';
import HeaderSearchBar from '@/components/HeaderSearchBar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { establishment } = useEstablishment();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { notifications, stats, markNotificationRead } = useEstablishmentAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Authentication guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('AdminLayout: User not authenticated, redirecting to login');
      router.push('/establecimientos/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    // Force reload establishment context after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/establecimientos/admin',
      icon: LayoutDashboard,
      current: pathname === '/establecimientos/admin'
    },
    {
      name: 'Reservas',
      href: '/establecimientos/admin/reservas',
      icon: Calendar,
      current: pathname.startsWith('/establecimientos/admin/reservas'),
      badge: '12'
    },
    {
      name: 'Torneos',
      href: '/establecimientos/admin/torneos',
      icon: Trophy,
      current: pathname.startsWith('/establecimientos/admin/torneos')
    },
    {
      name: 'Análisis',
      href: '/establecimientos/admin/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/establecimientos/admin/analytics')
    },
    {
      name: 'Finanzas',
      href: '/establecimientos/admin/finanzas',
      icon: DollarSign,
      current: pathname.startsWith('/establecimientos/admin/finanzas')
    },
    {
      name: 'Personal',
      href: '/establecimientos/admin/personal',
      icon: Users,
      current: pathname.startsWith('/establecimientos/admin/personal')
    },
    {
      name: 'Canchas',
      href: '/establecimientos/admin/canchas',
      icon: MapPin,
      current: pathname.startsWith('/establecimientos/admin/canchas')
    },
    {
      name: 'Clientes',
      href: '/establecimientos/admin/clientes',
      icon: Users,
      current: pathname.startsWith('/establecimientos/admin/clientes')
    },
    {
      name: 'Mantenimiento',
      href: '/establecimientos/admin/mantenimiento',
      icon: Wrench,
      current: pathname.startsWith('/establecimientos/admin/mantenimiento')
    },
    {
      name: 'Marketing',
      href: '/establecimientos/admin/marketing',
      icon: Target,
      current: pathname.startsWith('/establecimientos/admin/marketing')
    }
  ];

  // Get unread count from API notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_reminder':
        return Calendar;
      case 'payment_received':
      case 'payment_failed':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Verificando autenticación...</div>
      </div>
    );
  }

  // Don't render admin layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/logo-3.png" 
                alt="Mis Canchas" 
                className="h-8 w-auto"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
                {item.badge && (
                  <span className="ml-auto bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <img 
              src="/assets/logo-3.png" 
              alt="Mis Canchas" 
              className="h-8 w-auto"
            />
          </div>
          <nav className="mt-8 flex-1 flex flex-col divide-y divide-gray-700 overflow-y-auto">
            <div className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile Menu Button */}
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo - Hidden on desktop since sidebar has it */}
              <div className="lg:hidden flex items-center">
                <img 
                  src="/assets/logo-3.png" 
                  alt="Mis Canchas" 
                  className="h-8 w-auto"
                />
              </div>

              {/* Spacer for layout balance */}
              <div className="flex-1"></div>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map((notification) => {
                          const IconComponent = getNotificationIcon(notification.type);
                          return (
                            <div
                              key={notification.id}
                              onClick={() => markNotificationRead(notification.id)}
                              className={`p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-gray-750' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  notification.type.includes('booking') ? 'bg-emerald-500/20 text-emerald-400' :
                                  notification.type.includes('payment') ? 'bg-green-500/20 text-green-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${
                                      !notification.read ? 'text-white' : 'text-gray-300'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <span className="text-xs text-gray-400 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {notification.time}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="p-8 text-center text-gray-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No hay notificaciones</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Configuration */}
                <Link
                  href="/establecimientos/admin/configuracion"
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    pathname.startsWith('/establecimientos/admin/configuracion')
                      ? 'text-emerald-400 bg-emerald-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Settings className="h-6 w-6" />
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 border border-gray-700 rounded-xl px-4 py-2 hover:bg-gray-800 transition-all duration-200 hover:border-gray-600"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : establishment?.name ? establishment.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-white font-medium text-sm">
                        {user?.name || user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : establishment?.representative?.fullName || establishment?.name || 'Usuario'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user?.email || establishment?.representative?.email || establishment?.email || ''}
                      </div>
                      {user?.userType === 'establishment' && (
                        <div className="text-xs text-emerald-400">Administrador</div>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-gray-800 py-2 shadow-xl ring-1 ring-gray-700 border border-gray-600">
                      <Link
                        href="/establecimientos/admin/perfil"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        Mi Perfil
                      </Link>
                      <Link
                        href="/establecimientos/admin/configuracion"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        Configuración
                      </Link>
                      <hr className="my-2 border-gray-700" />
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
