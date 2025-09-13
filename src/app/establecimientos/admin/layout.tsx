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
  User, 
  Settings, 
  LogOut, 
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  UserPlus,
  Shield,
  ChevronDown,
  Trash2,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();

  // Mock notifications data
  const notifications = [
    {
      id: '1',
      type: 'booking',
      title: 'Nueva reserva',
      message: 'Juan Pérez reservó Cancha de Fútbol 1 para mañana a las 18:00',
      time: '5 min',
      read: false,
      icon: Calendar
    },
    {
      id: '2',
      type: 'payment',
      title: 'Pago recibido',
      message: 'Se recibió el pago de $15.000 por la reserva #1234',
      time: '15 min',
      read: false,
      icon: DollarSign
    },
    {
      id: '3',
      type: 'maintenance',
      title: 'Mantenimiento programado',
      message: 'Recordatorio: Mantenimiento de Cancha de Tenis 2 programado para mañana',
      time: '1 hora',
      read: true,
      icon: Wrench
    },
    {
      id: '4',
      type: 'system',
      title: 'Actualización del sistema',
      message: 'Nueva versión disponible con mejoras de seguridad',
      time: '2 horas',
      read: true,
      icon: Settings
    },
    {
      id: '5',
      type: 'cancellation',
      title: 'Reserva cancelada',
      message: 'María González canceló su reserva para el viernes',
      time: '3 horas',
      read: false,
      icon: X
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Comprehensive search database with intelligent suggestions
  const searchDatabase = [
    // Dashboard
    { id: 'dashboard', title: 'Dashboard', description: 'Vista general del sistema', href: '/establecimientos/admin', icon: LayoutDashboard, category: 'Navegación', keywords: ['inicio', 'principal', 'resumen', 'overview'] },
    
    // Reservas
    { id: 'reservas', title: 'Reservas', description: 'Gestión de reservas', href: '/establecimientos/admin/reservas', icon: Calendar, category: 'Reservas', keywords: ['bookings', 'citas', 'turnos'] },
    { id: 'nueva-reserva', title: 'Nueva Reserva', description: 'Crear nueva reserva', href: '/establecimientos/admin/reservas', action: 'create', icon: Plus, category: 'Reservas', keywords: ['crear reserva', 'nueva cita', 'agendar'] },
    { id: 'calendario-reservas', title: 'Calendario de Reservas', description: 'Ver reservas en calendario', href: '/establecimientos/admin/reservas', action: 'calendar', icon: Calendar, category: 'Reservas', keywords: ['calendario', 'agenda', 'horarios'] },
    
    // Finanzas
    { id: 'finanzas', title: 'Finanzas', description: 'Gestión financiera', href: '/establecimientos/admin/finanzas', icon: DollarSign, category: 'Finanzas', keywords: ['dinero', 'pagos', 'ingresos', 'gastos'] },
    { id: 'nueva-transaccion', title: 'Nueva Transacción', description: 'Registrar ingreso o gasto', href: '/establecimientos/admin/finanzas', action: 'create', icon: Plus, category: 'Finanzas', keywords: ['pago', 'cobro', 'factura', 'gasto'] },
    { id: 'reportes-financieros', title: 'Reportes Financieros', description: 'Ver reportes de ingresos y gastos', href: '/establecimientos/admin/finanzas', action: 'reports', icon: BarChart3, category: 'Finanzas', keywords: ['reporte', 'balance', 'ganancias'] },
    
    // Personal
    { id: 'personal', title: 'Personal', description: 'Gestión de empleados', href: '/establecimientos/admin/personal', icon: Users, category: 'Personal', keywords: ['empleados', 'staff', 'trabajadores'] },
    { id: 'nuevo-empleado', title: 'Nuevo Empleado', description: 'Agregar empleado', href: '/establecimientos/admin/personal', action: 'create', icon: UserPlus, category: 'Personal', keywords: ['contratar', 'agregar empleado'] },
    { id: 'permisos', title: 'Permisos', description: 'Gestionar permisos de empleados', href: '/establecimientos/admin/personal', action: 'permissions', icon: Shield, category: 'Personal', keywords: ['roles', 'accesos', 'privilegios'] },
    
    // Canchas
    { id: 'canchas', title: 'Canchas', description: 'Gestión de canchas', href: '/establecimientos/admin/canchas', icon: MapPin, category: 'Canchas', keywords: ['courts', 'campos', 'instalaciones'] },
    { id: 'nueva-cancha', title: 'Nueva Cancha', description: 'Agregar cancha', href: '/establecimientos/admin/canchas', action: 'create', icon: Plus, category: 'Canchas', keywords: ['crear cancha', 'nueva instalación'] },
    
    // Clientes
    { id: 'clientes', title: 'Clientes', description: 'Gestión de clientes', href: '/establecimientos/admin/clientes', icon: Users, category: 'Clientes', keywords: ['usuarios', 'customers', 'jugadores'] },
    { id: 'nuevo-cliente', title: 'Nuevo Cliente', description: 'Registrar cliente', href: '/establecimientos/admin/clientes', action: 'create', icon: UserPlus, category: 'Clientes', keywords: ['registrar cliente', 'nuevo usuario'] },
    
    // Torneos
    { id: 'torneos', title: 'Torneos', description: 'Gestión de torneos', href: '/establecimientos/admin/torneos', icon: Trophy, category: 'Torneos', keywords: ['tournaments', 'competencias', 'campeonatos'] },
    { id: 'nuevo-torneo', title: 'Nuevo Torneo', description: 'Crear nuevo torneo', href: '/establecimientos/admin/torneos', action: 'create', icon: Plus, category: 'Torneos', keywords: ['crear torneo', 'nueva competencia'] },
    { id: 'horarios-canchas', title: 'Horarios de Canchas', description: 'Configurar horarios', href: '/establecimientos/admin/canchas', action: 'schedules', icon: Clock, category: 'Canchas', keywords: ['horarios', 'disponibilidad', 'cambiar horarios'] },
    
    // Mantenimiento
    { id: 'mantenimiento', title: 'Mantenimiento', description: 'Gestión de mantenimiento', href: '/establecimientos/admin/mantenimiento', icon: Wrench, category: 'Mantenimiento', keywords: ['reparaciones', 'maintenance', 'arreglos'] },
    { id: 'nueva-tarea', title: 'Nueva Tarea de Mantenimiento', description: 'Crear tarea de mantenimiento', href: '/establecimientos/admin/mantenimiento', action: 'create', icon: Plus, category: 'Mantenimiento', keywords: ['reparar', 'arreglar', 'mantener'] },
    
    // Marketing
    { id: 'marketing', title: 'Marketing', description: 'Gestión de marketing', href: '/establecimientos/admin/marketing', icon: Target, category: 'Marketing', keywords: ['publicidad', 'promociones', 'campañas'] },
    { id: 'nueva-campaña', title: 'Nueva Campaña', description: 'Crear campaña de marketing', href: '/establecimientos/admin/marketing', action: 'create', icon: Plus, category: 'Marketing', keywords: ['promoción', 'descuento', 'oferta'] },
    
    // Analytics
    { id: 'analytics', title: 'Análisis', description: 'Reportes y análisis', href: '/establecimientos/admin/analytics', icon: BarChart3, category: 'Análisis', keywords: ['estadísticas', 'métricas', 'reportes'] },
    
    // Configuración
    { id: 'configuracion', title: 'Configuración', description: 'Configuración del sistema', href: '/establecimientos/admin/configuracion', icon: Settings, category: 'Configuración', keywords: ['settings', 'ajustes', 'preferencias'] },
    { id: 'horarios-configuracion', title: 'Configuración de Horarios', description: 'Configurar horarios del establecimiento', href: '/establecimientos/admin/configuracion', action: 'schedules', icon: Clock, category: 'Configuración', keywords: ['horarios', 'cambiar horarios', 'disponibilidad'] }
  ];

  // Intelligent search function
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const results = searchDatabase.filter(item => {
      // Direct title match (highest priority)
      if (item.title.toLowerCase().includes(searchTerm)) return true;
      
      // Description match
      if (item.description.toLowerCase().includes(searchTerm)) return true;
      
      // Keywords match
      if (item.keywords.some(keyword => keyword.includes(searchTerm))) return true;
      
      // Category match
      if (item.category.toLowerCase().includes(searchTerm)) return true;
      
      // Fuzzy matching for common terms
      const fuzzyMatches = [
        { terms: ['horario', 'hora', 'tiempo'], matches: ['horarios', 'configuracion', 'canchas'] },
        { terms: ['dinero', 'plata', 'pago'], matches: ['finanzas', 'transaccion'] },
        { terms: ['empleado', 'trabajador', 'staff'], matches: ['personal', 'empleado'] },
        { terms: ['cancha', 'campo', 'instalacion'], matches: ['canchas', 'cancha'] },
        { terms: ['cliente', 'usuario', 'jugador'], matches: ['clientes', 'cliente'] },
        { terms: ['reserva', 'cita', 'turno'], matches: ['reservas', 'reserva'] },
        { terms: ['reparar', 'arreglar', 'mantener'], matches: ['mantenimiento', 'tarea'] },
        { terms: ['promocion', 'descuento', 'oferta'], matches: ['marketing', 'campaña'] }
      ];
      
      return fuzzyMatches.some(fuzzy => 
        fuzzy.terms.some(term => searchTerm.includes(term)) &&
        fuzzy.matches.some(match => item.id.includes(match) || item.title.toLowerCase().includes(match))
      );
    });

    // Sort results by relevance
    const sortedResults = results.sort((a, b) => {
      // Exact title match first
      const aExactTitle = a.title.toLowerCase() === searchTerm ? 10 : 0;
      const bExactTitle = b.title.toLowerCase() === searchTerm ? 10 : 0;
      
      // Title starts with search term
      const aTitleStart = a.title.toLowerCase().startsWith(searchTerm) ? 5 : 0;
      const bTitleStart = b.title.toLowerCase().startsWith(searchTerm) ? 5 : 0;
      
      // Title contains search term
      const aTitleContains = a.title.toLowerCase().includes(searchTerm) ? 3 : 0;
      const bTitleContains = b.title.toLowerCase().includes(searchTerm) ? 3 : 0;
      
      // Keywords match
      const aKeywordMatch = a.keywords.some(k => k.includes(searchTerm)) ? 2 : 0;
      const bKeywordMatch = b.keywords.some(k => k.includes(searchTerm)) ? 2 : 0;
      
      const aScore = aExactTitle + aTitleStart + aTitleContains + aKeywordMatch;
      const bScore = bExactTitle + bTitleStart + bTitleContains + bKeywordMatch;
      
      return bScore - aScore;
    });

    setSearchResults(sortedResults.slice(0, 8)); // Show top 8 results
    setShowSearchResults(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleSearchResultClick = (result: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    // Handle different actions
    if (result.action) {
      // Store action in localStorage to be picked up by the target page
      localStorage.setItem('dashboardAction', JSON.stringify({
        action: result.action,
        timestamp: Date.now()
      }));
    }
    
    // Navigate to the page
    window.location.href = result.href;
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
              <Building2 className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold text-white">SportAdmin</span>
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
            <Building2 className="h-8 w-8 text-emerald-400" />
            <span className="ml-3 text-xl font-bold text-white">Mis Canchas</span>
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
        {/* Top navigation - Header style */}
        <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
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
                <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  SportAdmin
                </div>
              </div>

              {/* Spacer to push content to the right */}
              <div className="flex-1"></div>

              {/* Desktop Actions */}
              <div className="flex items-center space-x-4">
                {/* Intelligent Search Bar */}
                <div className="relative">
                  <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
                  <input
                    className="block h-10 w-64 border border-gray-600 bg-gray-800 py-0 pl-10 pr-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl"
                    placeholder="Buscar en el dashboard..."
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                    suppressHydrationWarning={true}
                  />
                  
                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-12 left-0 w-96 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="p-2">
                        {searchResults.map((result, index) => (
                          <button
                            key={result.id}
                            onClick={() => handleSearchResultClick(result)}
                            className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <result.icon className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-white group-hover:text-emerald-100">
                                    {result.title}
                                  </p>
                                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                                    {result.category}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 truncate">
                                  {result.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {searchResults.length === 0 && searchQuery && (
                        <div className="p-4 text-center">
                          <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-400">
                            No se encontraron resultados para "{searchQuery}"
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button 
                    className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
                        <div className="flex items-center space-x-2">
                          <button className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                            Marcar todas como leídas
                          </button>
                          <button 
                            onClick={() => setNotificationsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification, index) => {
                          const Icon = notification.icon;
                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-emerald-900/20' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  notification.type === 'booking' ? 'bg-blue-900/50 text-blue-400' :
                                  notification.type === 'payment' ? 'bg-emerald-900/50 text-emerald-400' :
                                  notification.type === 'maintenance' ? 'bg-orange-900/50 text-orange-400' :
                                  notification.type === 'system' ? 'bg-purple-900/50 text-purple-400' :
                                  'bg-red-900/50 text-red-400'
                                }`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-white">{notification.title}</p>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-400">{notification.time}</span>
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button className="text-gray-400 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="p-4 border-t border-gray-700">
                        <button className="w-full text-center text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                          Ver todas las notificaciones
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 border border-gray-700 rounded-xl px-4 py-2 hover:bg-gray-800 transition-all duration-200 hover:border-gray-600"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">CA</span>
                    </div>
                    <span className="hidden sm:block text-white font-medium">Complejo Atlético</span>
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

            {/* Mobile Search Bar */}
            <div className="lg:hidden pb-4">
              <div className="relative">
                <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
                <input
                  className="block h-12 w-full border border-gray-600 bg-gray-800 py-0 pl-10 pr-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl"
                  placeholder="Buscar..."
                  type="search"
                  suppressHydrationWarning={true}
                />
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
