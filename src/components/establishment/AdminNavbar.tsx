'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Settings, 
  Users, 
  Calendar, 
  BarChart3, 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CashRegisterIndicator from '@/components/admin/CashRegisterIndicator';

const AdminNavbar = () => {
  const { establishment, isDemo } = useEstablishment();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigationItems = [
    { 
      name: 'Dashboard', 
      href: '/establecimientos/admin', 
      icon: BarChart3,
      active: pathname === '/establecimientos/admin'
    },
    { 
      name: 'Reservas', 
      href: '/establecimientos/admin/reservas', 
      icon: Calendar,
      active: pathname.includes('/reservas')
    },
    { 
      name: 'Canchas', 
      href: '/establecimientos/admin/canchas', 
      icon: Building2,
      active: pathname.includes('/canchas')
    },
    { 
      name: 'Clientes', 
      href: '/establecimientos/admin/clientes', 
      icon: User,
      active: pathname.includes('/clientes')
    },
    { 
      name: 'Caja', 
      href: '/establecimientos/admin/caja', 
      icon: Clock,
      active: pathname.includes('/caja')
    },
    { 
      name: 'Configuración', 
      href: '/establecimientos/admin/configuracion', 
      icon: Settings,
      active: pathname.includes('/configuracion')
    }
  ];

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'Nueva reserva',
      message: 'Juan Pérez reservó la Cancha 1 para mañana a las 18:00',
      time: '5 min',
      read: false,
      icon: Calendar
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Mantenimiento pendiente',
      message: 'La Cancha 2 necesita mantenimiento programado',
      time: '1 hora',
      read: false,
      icon: AlertCircle
    },
    {
      id: 3,
      type: 'payment',
      title: 'Pago recibido',
      message: 'Se recibió el pago de $15.000 por reserva de María García',
      time: '2 horas',
      read: true,
      icon: CheckCircle
    },
    {
      id: 4,
      type: 'staff',
      title: 'Personal disponible',
      message: 'Carlos Rodríguez confirmó su turno para el fin de semana',
      time: '3 horas',
      read: true,
      icon: Users
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: number) => {
    // In a real app, this would update the notification status
    console.log('Marking notification as read:', notificationId);
  };

  const markAllAsRead = () => {
    // In a real app, this would mark all notifications as read
    console.log('Marking all notifications as read');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre del establecimiento */}
          <div className="flex items-center space-x-4">
            <Link href="/establecimientos/admin" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  {establishment?.name || 'Mi Establecimiento'}
                </h1>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  {establishment?.address && (
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {establishment.city}
                    </span>
                  )}
                  {establishment?.phone && (
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {establishment.phone.replace(/^54/, '+54 ')}
                    </span>
                  )}
                  {isDemo && (
                    <span className="flex items-center px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      <Award className="w-3 h-3 mr-1" />
                      Demo
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Navegación principal */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Usuario y notificaciones */}
          <div className="flex items-center space-x-4">
            {/* Cash Register Indicator */}
            <CashRegisterIndicator establishmentId={establishment?.id || null} />
            
            {/* Notificaciones */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                  >
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">No hay notificaciones</p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const IconComponent = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={`p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-gray-750' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  notification.type === 'booking' ? 'bg-emerald-500/20 text-emerald-400' :
                                  notification.type === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                                  notification.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                                  'bg-blue-500/20 text-blue-400'
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
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-400 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {notification.time}
                                      </span>
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-700">
                        <Link
                          href="/establecimientos/admin/notificaciones"
                          className="block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                          onClick={() => setShowNotifications(false)}
                        >
                          Ver todas las notificaciones
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menú de usuario */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">
                    {user?.name || establishment?.representative?.fullName || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {establishment?.representative?.position || 'Administrador'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {user?.name || establishment?.representative?.fullName || 'Usuario'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {establishment?.representative?.email || user?.email}
                          </p>
                        </div>
                      </div>
                      {establishment && (
                        <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                          <p className="text-xs font-medium text-gray-300 mb-1">Establecimiento</p>
                          <p className="text-sm text-white">{establishment.name}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            {establishment.address}, {establishment.city}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <Link
                        href="/establecimientos/admin/configuracion"
                        className="flex items-center space-x-2 w-full p-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full p-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="md:hidden border-t border-gray-700">
          <div className="flex overflow-x-auto py-2 space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  item.active
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
