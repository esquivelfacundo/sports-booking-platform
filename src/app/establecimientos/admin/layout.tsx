'use client';

import { useState } from 'react';
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
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEstablishment } from '@/contexts/EstablishmentContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { establishment, isDemo } = useEstablishment();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

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
    },
    {
      name: 'Configuración',
      href: '/establecimientos/admin/configuracion',
      icon: Settings,
      current: pathname.startsWith('/establecimientos/admin/configuracion')
    }
  ];

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

              {/* Search Bar */}
              <div className="flex-1 max-w-lg mx-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
                  <input
                    className="block h-10 w-full border border-gray-600 bg-gray-800 py-0 pl-10 pr-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl"
                    placeholder="Buscar en el dashboard..."
                    type="search"
                  />
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white">
                    3
                  </span>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 border border-gray-700 rounded-xl px-4 py-2 hover:bg-gray-800 transition-all duration-200 hover:border-gray-600"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {establishment?.name ? establishment.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-white font-medium text-sm">
                        {establishment?.name || 'Usuario'}
                      </div>
                      {isDemo && (
                        <div className="text-xs text-yellow-400">Cuenta Demo</div>
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
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
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
