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
  Menu, 
  Bell, 
  Settings, 
  LogOut, 
  X,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  ShoppingCart,
  Wallet,
  CreditCard,
  Plug,
  Star,
  Megaphone,
  Ticket
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { EstablishmentAdminProvider, useEstablishmentAdminContext } from '@/contexts/EstablishmentAdminContext';
import HeaderSearchBar from '@/components/HeaderSearchBar';
import CashRegisterTopbar from '@/components/admin/CashRegisterTopbar';
import { CommandMenuProvider } from '@/contexts/CommandMenuContext';
import { UserProfileSidebar } from '@/components/admin/UserProfileSidebar';
import { SetupPinSidebar } from '@/components/admin/SetupPinSidebar';
import { usePinConfirmation } from '@/components/admin/PinConfirmation';
import { ThemeToggle } from '@/components/admin/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayoutContent = ({ children }: AdminLayoutProps) => {
  const { establishment } = useEstablishment();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { notifications, stats, markNotificationRead } = useEstablishmentAdminContext();
  const { requestPin, PinModal } = usePinConfirmation();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [staffMenuOpen, setStaffMenuOpen] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showSetupPinSidebar, setShowSetupPinSidebar] = useState(false);
  const [hasCheckedPin, setHasCheckedPin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check if user is staff-only (role: 'staff')
  const isStaffOnly = user?.isStaff && user?.staffRole === 'staff';
  
  // Check if user is staff (has isStaff flag)
  const isStaff = user?.isStaff === true;

  // Check if user is a player (not allowed in establishment admin)
  const isPlayerOnly = user?.userType === 'player' && !user?.isStaff;

  // Authentication guard and role-based redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('AdminLayout: User not authenticated, redirecting to login');
      router.push('/establecimientos/login');
      return;
    }

    // Redirect player users to 404 - they shouldn't access establishment routes
    if (!isLoading && isAuthenticated && isPlayerOnly) {
      console.log('AdminLayout: Player user trying to access establishment admin, redirecting to 404');
      router.push('/404');
      return;
    }

    // Redirect staff-only users to reservas page if they're on a different page
    if (!isLoading && isAuthenticated && isStaffOnly) {
      const allowedPaths = ['/establecimientos/admin/reservas'];
      const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));
      
      if (!isAllowedPath) {
        console.log('AdminLayout: Staff-only user, redirecting to reservas');
        router.push('/establecimientos/admin/reservas');
      }
    }
  }, [isAuthenticated, isLoading, router, isStaffOnly, isPlayerOnly, pathname]);

  // Check if user has PIN configured
  useEffect(() => {
    const checkUserPin = async () => {
      if (!isAuthenticated || isLoading || hasCheckedPin) return;
      
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        
        // Check endpoint based on user type
        const endpoint = isStaff 
          ? `${API_URL}/api/staff/me`
          : `${API_URL}/api/establishments/my/profile`;
        
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.profile) {
          setHasCheckedPin(true);
          // If user doesn't have PIN, show setup sidebar
          if (!data.profile.hasPin) {
            setShowSetupPinSidebar(true);
          }
        }
      } catch (error) {
        console.error('Error checking user PIN:', error);
      }
    };
    
    checkUserPin();
  }, [isAuthenticated, isLoading, hasCheckedPin, isStaff]);

  const handleLogout = () => {
    // Clear all auth tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_data');
    }
    logout();
    // Force reload establishment context after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/establecimientos/login';
    }
  };

  // Open profile sidebar with PIN validation
  const handleOpenProfile = () => {
    requestPin(() => {
      setShowProfileSidebar(true);
    }, { title: 'Acceder al perfil', description: 'Ingresa tu PIN para continuar' });
  };

  // Navigate to configuration with PIN validation
  const handleOpenConfiguration = () => {
    requestPin(() => {
      router.push('/establecimientos/admin/configuracion');
    }, { title: 'Acceder a configuración', description: 'Ingresa tu PIN para continuar' });
  };

  // Sidebar collapsed state - collapsed by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Navigation items grouped with separators
  const navigationGroups = [
    {
      items: [
        {
          name: 'Dashboard',
          href: '/establecimientos/admin',
          icon: LayoutDashboard,
          current: pathname === '/establecimientos/admin'
        }
      ]
    },
    {
      items: [
        {
          name: 'Reservas',
          href: '/establecimientos/admin/reservas',
          icon: Calendar,
          current: pathname.startsWith('/establecimientos/admin/reservas'),
          badge: stats.pendingBookings > 0 ? stats.pendingBookings.toString() : undefined
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
          name: 'Reseñas',
          href: '/establecimientos/admin/resenas',
          icon: Star,
          current: pathname.startsWith('/establecimientos/admin/resenas')
        }
      ]
    },
    {
      items: [
        {
          name: 'Marketing',
          href: '/establecimientos/admin/marketing',
          icon: Megaphone,
          current: pathname.startsWith('/establecimientos/admin/marketing')
        },
        {
          name: 'Cupones',
          href: '/establecimientos/admin/cupones',
          icon: Ticket,
          current: pathname.startsWith('/establecimientos/admin/cupones')
        }
      ]
    },
    {
      items: [
        {
          name: 'Ventas',
          href: '/establecimientos/admin/ventas',
          icon: ShoppingCart,
          current: pathname.startsWith('/establecimientos/admin/ventas')
        },
        {
          name: 'Stock',
          href: '/establecimientos/admin/stock',
          icon: Package,
          current: pathname.startsWith('/establecimientos/admin/stock')
        },
        {
          name: 'Cuentas',
          href: '/establecimientos/admin/cuentas-corrientes',
          icon: CreditCard,
          current: pathname.startsWith('/establecimientos/admin/cuentas-corrientes')
        }
      ]
    },
    {
      items: [
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
        }
      ]
    },
    {
      items: [
        {
          name: 'Integraciones',
          href: '/establecimientos/admin/integraciones',
          icon: Plug,
          current: pathname.startsWith('/establecimientos/admin/integraciones')
        }
      ]
    }
  ];

  // Flat navigation for mobile
  const navigation = navigationGroups.flatMap(group => group.items);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <UnifiedLoader size="lg" />
      </div>
    );
  }

  // Don't render admin layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // For staff-only users, render a simplified layout without sidebar
  if (isStaffOnly) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Staff-only header with logo */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="w-full px-4">
            <div className="flex items-center h-12">
              {/* Logo */}
              <div className="flex items-center space-x-3 mr-4">
                <img 
                  src={theme === 'dark' ? '/assets/logos/logo-dark.svg' : '/assets/logos/logo-light.svg'}
                  alt="Mis Canchas" 
                  className="h-10 w-auto"
                />
              </div>

              {/* Page controls slot - same as admin layout */}
              <div id="header-page-controls" className="flex-1 flex items-center"></div>

              {/* Right side - user info and menu */}
              <div className="flex items-center space-x-2 ml-4">
                {/* Desktop: show user info and logout */}
                <div className="hidden sm:flex items-center space-x-3">
                  <button
                    onClick={handleOpenProfile}
                    className="flex items-center gap-3 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {/* Establishment logo or placeholder */}
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center overflow-hidden">
                      {establishment?.logo ? (
                        <img 
                          src={establishment.logo.startsWith('http') ? establishment.logo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}${establishment.logo}`}
                          alt={establishment.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">{establishment?.name || 'Establecimiento'}</p>
                      <p className="text-xs text-gray-400">{user?.firstName || user?.name || 'Personal'}</p>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all duration-200"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile: menu button */}
                <div className="relative sm:hidden">
                  <button
                    onClick={() => setStaffMenuOpen(!staffMenuOpen)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="4" cy="10" r="2" />
                      <circle cx="10" cy="10" r="2" />
                      <circle cx="16" cy="10" r="2" />
                    </svg>
                  </button>

                  {/* Mobile dropdown menu */}
                  {staffMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setStaffMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                        <div className="p-3 border-b border-gray-700">
                          <p className="text-sm text-white font-medium">{establishment?.name}</p>
                          <p className="text-xs text-gray-400">{user?.firstName || 'Personal'}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setStaffMenuOpen(false);
                              handleOpenProfile();
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Mi Perfil
                          </button>
                          <button
                            onClick={() => {
                              setStaffMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Full-width content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <CommandMenuProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <img 
                src={theme === 'dark' ? '/assets/logos/logo-dark.svg' : '/assets/logos/logo-light.svg'}
                alt="Mis Canchas" 
                className="h-10 w-auto"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {navigationGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Separator between groups */}
                {groupIndex > 0 && (
                  <div className="mx-4 my-3 border-t border-gray-200 dark:border-gray-700" />
                )}
                
                <div className="px-2 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        item.current
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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
                </div>
              </div>
            ))}
          </nav>
          
          {/* Establishment info at bottom of mobile sidebar - clickable to open profile */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={() => {
                setSidebarOpen(false);
                handleOpenProfile();
              }}
              className="w-full flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 -m-1 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {establishment?.logo ? (
                  <img 
                    src={establishment.logo.startsWith('http') ? establishment.logo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}${establishment.logo}`}
                    alt={establishment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {establishment?.name ? establishment.name.charAt(0).toUpperCase() : 'E'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Usuario')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {establishment?.name || 'Mi Establecimiento'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar - collapsible with hover */}
      <div 
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-[width] duration-200 ease-out z-40 ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-52'
        }`}
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
      >
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-4 pb-4 overflow-hidden shadow-lg dark:shadow-none relative">
          {/* Logo section */}
          <div className="flex items-center flex-shrink-0 px-3 h-12 transition-none">
            <div className="w-full flex items-center justify-start transition-none">
              <img 
                src={sidebarCollapsed 
                  ? (theme === 'dark' ? '/assets/logos/favicon-dark.svg' : '/assets/logos/favicon-light.svg')
                  : (theme === 'dark' ? '/assets/logos/logo-dark.svg' : '/assets/logos/logo-light.svg')
                }
                alt="Mis Canchas" 
                className="h-10 w-auto transition-none"
                style={{ transition: 'none' }}
              />
            </div>
          </div>
          
          {/* Navigation with groups and separators */}
          <nav className="mt-6 flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
            {navigationGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Separator between groups */}
                {groupIndex > 0 && (
                  <div className="mx-3 my-2 border-t border-gray-200 dark:border-gray-700" />
                )}
                
                <div className="px-2 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                        item.current
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon className="flex-shrink-0 h-5 w-5" />
                      <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                        sidebarCollapsed ? 'opacity-0' : 'opacity-100'
                      }`}>
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className={`ml-auto bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full transition-opacity duration-200 ${
                          sidebarCollapsed ? 'opacity-0' : 'opacity-100'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          
          {/* Establishment info at bottom of sidebar - clickable to open profile */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3">
            <button
              onClick={handleOpenProfile}
              className="w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 -m-1 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {establishment?.logo ? (
                  <img 
                    src={establishment.logo.startsWith('http') ? establishment.logo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}${establishment.logo}`}
                    alt={establishment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {establishment?.name ? establishment.name.charAt(0).toUpperCase() : 'E'}
                  </span>
                )}
              </div>
              <div className={`flex-1 min-w-0 ml-3 text-left transition-opacity duration-200 ${
                sidebarCollapsed ? 'opacity-0' : 'opacity-100'
              }`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Usuario')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {establishment?.name || 'Mi Establecimiento'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content - padding adjusts based on sidebar state */}
      <div className={`flex flex-col flex-1 transition-[padding] duration-200 ease-out ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-52'
      }`}>
        {/* Top navigation bar - fixed height, contains page controls on left and global actions on right */}
        <header id="admin-header" className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="w-full px-4">
            <div className="flex items-center h-12">
              {/* Mobile Menu Button */}
              <button
                type="button"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Logo - Hidden on desktop since sidebar has it */}
              <div className="lg:hidden flex items-center mr-3">
                <img 
                  src={theme === 'dark' ? '/assets/logos/logo-dark.svg' : '/assets/logos/logo-light.svg'}
                  alt="Mis Canchas" 
                  className="h-10 w-auto"
                />
              </div>

              {/* Page controls slot - pages will use a portal to inject content here */}
              <div id="header-page-controls" className="flex-1 flex items-center"></div>

              {/* Right side actions - always visible */}
              <div className="flex items-center space-x-1 ml-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Cash Register */}
                <CashRegisterTopbar establishmentId={establishment?.id || null} />

                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                  >
                    <Bell className="h-5 w-5" />
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
                      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
                              className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-gray-50 dark:bg-gray-750' : ''
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
                                      !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {notification.time}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No hay notificaciones</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Configuration */}
                <button
                  onClick={handleOpenConfiguration}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    pathname.startsWith('/establecimientos/admin/configuracion')
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title="Configuración"
                >
                  <Settings className="h-5 w-5" />
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
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

    {/* User Profile Sidebar */}
    <UserProfileSidebar
      isOpen={showProfileSidebar}
      onClose={() => setShowProfileSidebar(false)}
    />

    {/* Setup PIN Sidebar - shown when user doesn't have PIN configured */}
    <SetupPinSidebar
      isOpen={showSetupPinSidebar}
      onComplete={() => setShowSetupPinSidebar(false)}
    />

    {/* PIN Confirmation Modal */}
    <PinModal />
    </CommandMenuProvider>
  );
};

// Wrap with provider
const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <EstablishmentAdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </EstablishmentAdminProvider>
  );
};

export default AdminLayout;
