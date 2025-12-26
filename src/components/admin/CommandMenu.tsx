'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  ShoppingCart,
  X,
  Command,
  Loader2,
  User,
  Phone,
  Mail,
  Clock,
  MapPin,
  Wallet
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  // Direct fields on booking (from admin-created bookings)
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  // Legacy guest fields
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  court?: {
    name: string;
    sport: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  // Client relation (when clientId is set)
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

interface CommandMenuProps {
  onOpenReservation: (bookingId: string) => void;
  onCreateReservation: () => void;
  onCreateSale: () => void;
}

type MenuMode = 'main' | 'search';

const CommandMenu: React.FC<CommandMenuProps> = ({
  onOpenReservation,
  onCreateReservation,
  onCreateSale
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<MenuMode>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { establishment } = useEstablishment();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        if (mode === 'search') {
          setMode('main');
          setSearchQuery('');
          setSearchResults([]);
        } else {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setMode('main');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedIndex(0);
      setStatusFilter(null);
    }
  }, [isOpen]);

  // Search bookings
  const searchBookings = useCallback(async (query: string) => {
    console.log('searchBookings called with:', query, 'establishment:', establishment?.id);
    if (!query.trim() || !establishment?.id) {
      console.log('Search aborted - no query or establishment');
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Get bookings from 6 months ago to 6 months ahead
      const today = new Date();
      const startDate = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await apiClient.getEstablishmentBookings(establishment.id, {
        startDate,
        endDate,
        limit: 1000
      }) as any;

      const bookings = response.bookings || [];
      
      // Debug: log first few bookings to see their structure
      console.log('Total bookings:', bookings.length);
      if (bookings.length > 0) {
        console.log('Sample booking structure:', JSON.stringify({
          id: bookings[0].id,
          guestName: bookings[0].guestName,
          user: bookings[0].user,
          client: bookings[0].client
        }, null, 2));
      }
      
      // Filter by search query (name, phone, email) - case insensitive
      const queryLower = query.toLowerCase().trim();
      const queryWords = queryLower.split(/\s+/);
      
      const filtered = bookings.filter((booking: Booking) => {
        // Direct fields on booking (from admin-created bookings)
        const directName = (booking.clientName || booking.guestName || '').toLowerCase();
        const directPhone = (booking.clientPhone || booking.guestPhone || '').replace(/\D/g, '');
        const directEmail = (booking.clientEmail || booking.guestEmail || '').toLowerCase();
        
        // User relation (from user-created bookings)
        const userName = `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.toLowerCase().trim();
        const userPhone = (booking.user?.phone || '').replace(/\D/g, '');
        const userEmail = (booking.user?.email || '').toLowerCase();
        
        // Client relation (when clientId is set)
        const clientRelationName = (booking.client?.name || '').toLowerCase();
        const clientRelationPhone = (booking.client?.phone || '').replace(/\D/g, '');
        const clientRelationEmail = (booking.client?.email || '').toLowerCase();
        
        // All names combined for searching
        const allNames = `${directName} ${userName} ${clientRelationName}`.trim();
        const allPhones = `${directPhone} ${userPhone} ${clientRelationPhone}`;
        const allEmails = `${directEmail} ${userEmail} ${clientRelationEmail}`;
        
        // Search query without non-digits for phone matching
        const queryDigits = query.replace(/\D/g, '');
        
        // Check if ALL words match (precise search)
        const matchesName = queryWords.every(word => allNames.includes(word));
        const matchesPhone = queryDigits.length >= 3 && allPhones.includes(queryDigits);
        const matchesEmail = allEmails.includes(queryLower);

        return matchesName || matchesPhone || matchesEmail;
      });

      // Sort by date: upcoming first, then past (most recent first)
      const now = new Date();
      const sorted = filtered.sort((a: Booking, b: Booking) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        const isAFuture = dateA >= now;
        const isBFuture = dateB >= now;

        // Future bookings come first
        if (isAFuture && !isBFuture) return -1;
        if (!isAFuture && isBFuture) return 1;

        // Both future: sort ascending (soonest first)
        if (isAFuture && isBFuture) {
          return dateA.getTime() - dateB.getTime();
        }

        // Both past: sort descending (most recent first)
        return dateB.getTime() - dateA.getTime();
      });

      setSearchResults(sorted.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('Error searching bookings:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [establishment?.id]);

  // Debounced search - trigger when in search mode and query changes
  useEffect(() => {
    if (mode !== 'search') return;
    
    // Clear results if query is empty
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const timer = setTimeout(() => {
      console.log('Searching for:', searchQuery);
      searchBookings(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, mode, searchBookings]);

  // Handle keyboard navigation
  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (mode === 'main') {
      const items = mainMenuItems;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        items[selectedIndex].action();
      }
    } else if (mode === 'search') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
        e.preventDefault();
        handleSelectBooking(searchResults[selectedIndex]);
      }
    }
  };

  const handleSelectBooking = (booking: Booking) => {
    setIsOpen(false);
    onOpenReservation(booking.id);
  };

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  // Page navigation items for smart search
  const pageItems = [
    { id: 'reservas', label: 'Reservas', description: 'Ver grilla de reservas', path: '/establecimientos/admin/reservas', keywords: ['turnos', 'bookings', 'calendario', 'grilla'] },
    { id: 'clientes', label: 'Clientes', description: 'Gestionar clientes', path: '/establecimientos/admin/clientes', keywords: ['usuarios', 'contactos'] },
    { id: 'productos', label: 'Productos', description: 'Gestionar productos y stock', path: '/establecimientos/admin/productos', keywords: ['inventario', 'stock', 'items'] },
    { id: 'caja', label: 'Caja', description: 'Gestionar caja registradora', path: '/establecimientos/admin/caja', keywords: ['dinero', 'efectivo', 'cobros'] },
    { id: 'finanzas', label: 'Finanzas', description: 'Ver reportes financieros', path: '/establecimientos/admin/finanzas', keywords: ['ingresos', 'gastos', 'reportes', 'ventas'] },
    { id: 'canchas', label: 'Canchas', description: 'Gestionar canchas', path: '/establecimientos/admin/canchas', keywords: ['courts', 'espacios'] },
    { id: 'personal', label: 'Personal', description: 'Gestionar empleados', path: '/establecimientos/admin/personal', keywords: ['empleados', 'staff', 'equipo'] },
    { id: 'configuracion', label: 'Configuración', description: 'Ajustes del establecimiento', path: '/establecimientos/admin/configuracion', keywords: ['ajustes', 'settings'] },
    { id: 'config-pagos', label: 'Configuración > Pagos', description: 'Métodos de pago y Mercado Pago', path: '/establecimientos/admin/configuracion?tab=pagos', keywords: ['mercadopago', 'mercado pago', 'tarjeta', 'transferencia', 'metodos de pago'] },
    { id: 'config-horarios', label: 'Configuración > Horarios', description: 'Horarios de apertura', path: '/establecimientos/admin/configuracion?tab=horarios', keywords: ['apertura', 'cierre', 'schedule'] },
    { id: 'config-notificaciones', label: 'Configuración > Notificaciones', description: 'Configurar notificaciones', path: '/establecimientos/admin/configuracion?tab=notificaciones', keywords: ['alertas', 'emails', 'whatsapp'] },
    { id: 'analytics', label: 'Analytics', description: 'Estadísticas y métricas', path: '/establecimientos/admin/analytics', keywords: ['estadisticas', 'metricas', 'graficos'] },
    { id: 'marketing', label: 'Marketing', description: 'Promociones y campañas', path: '/establecimientos/admin/marketing', keywords: ['promociones', 'descuentos', 'campañas'] },
  ];

  // Filter pages based on search query in main mode
  const filteredPages = useMemo(() => {
    if (mode !== 'main' || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return pageItems.filter(page => 
      page.label.toLowerCase().includes(query) ||
      page.description.toLowerCase().includes(query) ||
      page.keywords.some(k => k.includes(query))
    ).slice(0, 5);
  }, [searchQuery, mode]);

  // Status filter options
  const statusFilters = [
    { value: null, label: 'Todos' },
    { value: 'confirmed', label: 'Confirmado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { value: 'in_progress', label: 'En curso', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'completed', label: 'Completado', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    { value: 'no_show', label: 'No asistió', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ];

  // Filter by status and split into upcoming (confirmed, in_progress) and past (completed, no_show, cancelled)
  const { futureBookings, pastBookings, filteredCount } = useMemo(() => {
    const upcoming: Booking[] = [];
    const past: Booking[] = [];
    
    // Apply status filter from pills
    const filtered = statusFilter 
      ? searchResults.filter(b => b.status === statusFilter)
      : searchResults;
    
    // Split by status instead of date
    // Upcoming: confirmed, in_progress
    // Past: completed, no_show, cancelled
    filtered.forEach(booking => {
      if (booking.status === 'confirmed' || booking.status === 'in_progress') {
        upcoming.push(booking);
      } else if (booking.status === 'completed' || booking.status === 'no_show' || booking.status === 'cancelled') {
        past.push(booking);
      } else {
        // Any other status (pending, etc) goes to upcoming
        upcoming.push(booking);
      }
    });
    
    // Sort upcoming by date ascending (soonest first)
    upcoming.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Sort past by date descending (most recent first)
    past.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    return { futureBookings: upcoming, pastBookings: past, filteredCount: filtered.length };
  }, [searchResults, statusFilter]);

  const mainMenuItems = [
    {
      id: 'search',
      icon: Search,
      label: 'Buscar turno',
      description: 'Buscar por nombre, teléfono o email',
      shortcut: '1',
      action: () => {
        setMode('search');
        setSearchQuery('');
        setSelectedIndex(0);
      }
    },
    {
      id: 'reservation',
      icon: Calendar,
      label: 'Nueva reserva',
      description: 'Crear una nueva reserva',
      shortcut: '2',
      action: () => handleAction(onCreateReservation)
    },
    {
      id: 'sale',
      icon: ShoppingCart,
      label: 'Nueva venta',
      description: 'Registrar una venta directa',
      shortcut: '3',
      action: () => handleAction(onCreateSale)
    },
    {
      id: 'cash',
      icon: Wallet,
      label: 'Caja',
      description: 'Ir a la página de caja',
      shortcut: '4',
      action: () => {
        setIsOpen(false);
        router.push('/establecimientos/admin/caja');
      }
    }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-AR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-gray-500/20 text-gray-400';
      case 'no_show': return 'bg-orange-500/20 text-orange-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'in_progress': return 'En curso';
      case 'completed': return 'Completado';
      case 'no_show': return 'No asistió';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 flex items-start justify-center pt-[10vh] sm:pt-[15vh] z-[101] pointer-events-none"
            onKeyDown={handleKeyNavigation}
          >
            <div className="w-full max-w-xl mx-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden pointer-events-auto">
              {/* Header / Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                {mode === 'search' ? (
                  <button
                    onClick={() => {
                      setMode('main');
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={mode === 'search' ? 'Buscar por nombre, teléfono o email...' : 'Escribe un comando o busca...'}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm"
                />
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400">esc</kbd>
                  <span>para cerrar</span>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto">
                {mode === 'main' ? (
                  /* Main Menu */
                  <div className="p-2">
                    {/* Page search results */}
                    {filteredPages.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ir a
                        </div>
                        {filteredPages.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => {
                              setIsOpen(false);
                              router.push(page.path);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium">{page.label}</p>
                              <p className="text-xs text-gray-500">{page.description}</p>
                            </div>
                          </button>
                        ))}
                        <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                      </>
                    )}
                    
                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones rápidas
                    </div>
                    {mainMenuItems.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          selectedIndex === index 
                            ? 'bg-emerald-600/20 text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          selectedIndex === index 
                            ? 'bg-emerald-600/30' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <item.icon className={`w-4 h-4 ${
                            selectedIndex === index 
                              ? 'text-emerald-400' 
                              : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 dark:text-gray-400">
                          {item.shortcut}
                        </kbd>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Search Results */
                  <div className="p-2">
                    {/* Status filter pills */}
                    {searchResults.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-2 pb-3 mb-2 border-b border-gray-200 dark:border-gray-700">
                        {statusFilters.map((filter) => (
                          <button
                            key={filter.value || 'all'}
                            onClick={() => setStatusFilter(filter.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                              statusFilter === filter.value
                                ? filter.value === null 
                                  ? 'bg-white/10 text-white border-white/20'
                                  : filter.color
                                : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                      </div>
                    ) : searchQuery && searchResults.length === 0 ? (
                      <div className="text-center py-8">
                        <Search className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                        <p className="text-gray-400 text-sm">No se encontraron turnos</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Intenta con otro nombre, teléfono o email
                        </p>
                      </div>
                    ) : searchResults.length > 0 && filteredCount === 0 ? (
                      <div className="text-center py-8">
                        <Search className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                        <p className="text-gray-400 text-sm">No hay turnos con este estado</p>
                        <button 
                          onClick={() => setStatusFilter(null)}
                          className="text-emerald-400 text-xs mt-2 hover:underline"
                        >
                          Ver todos los resultados
                        </button>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {/* Future bookings */}
                        {futureBookings.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Próximas reservas ({futureBookings.length})
                            </div>
                            {futureBookings.map((booking) => {
                              const globalIndex = searchResults.indexOf(booking);
                              const clientName = booking.clientName || booking.client?.name || booking.guestName || 
                                (booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Sin nombre');
                              const clientPhone = booking.clientPhone || booking.client?.phone || booking.guestPhone || booking.user?.phone;
                              const clientEmail = booking.clientEmail || booking.client?.email || booking.guestEmail || booking.user?.email;

                              return (
                                <button
                                  key={booking.id}
                                  onClick={() => handleSelectBooking(booking)}
                                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-colors ${
                                    selectedIndex === globalIndex 
                                      ? 'bg-emerald-600/20' 
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <div className={`p-2 rounded-lg ${
                                    selectedIndex === globalIndex 
                                      ? 'bg-emerald-600/30' 
                                      : 'bg-gray-100 dark:bg-gray-800'
                                  }`}>
                                    <Calendar className={`w-4 h-4 ${
                                      selectedIndex === globalIndex 
                                        ? 'text-emerald-400' 
                                        : 'text-gray-400'
                                    }`} />
                                  </div>
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {clientName}
                                      </p>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(booking.status)}`}>
                                        {getStatusLabel(booking.status)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(booking.date)} • {booking.startTime}
                                      </span>
                                      {booking.court && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {booking.court.name}
                                        </span>
                                      )}
                                    </div>
                                    {(clientPhone || clientEmail) && (
                                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        {clientPhone && (
                                          <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {clientPhone}
                                          </span>
                                        )}
                                        {clientEmail && (
                                          <span className="flex items-center gap-1 truncate">
                                            <Mail className="w-3 h-3" />
                                            {clientEmail}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </>
                        )}

                        {/* Past bookings divider and list */}
                        {pastBookings.length > 0 && (
                          <>
                            <div className="px-2 py-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reservas pasadas ({pastBookings.length})
                              </span>
                            </div>
                            {pastBookings.map((booking) => {
                              const globalIndex = searchResults.indexOf(booking);
                              const clientName = booking.clientName || booking.client?.name || booking.guestName || 
                                (booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Sin nombre');
                              const clientPhone = booking.clientPhone || booking.client?.phone || booking.guestPhone || booking.user?.phone;
                              const clientEmail = booking.clientEmail || booking.client?.email || booking.guestEmail || booking.user?.email;

                              return (
                                <button
                                  key={booking.id}
                                  onClick={() => handleSelectBooking(booking)}
                                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-colors opacity-70 ${
                                    selectedIndex === globalIndex 
                                      ? 'bg-emerald-600/20 opacity-100' 
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:opacity-100'
                                  }`}
                                >
                                  <div className={`p-2 rounded-lg ${
                                    selectedIndex === globalIndex 
                                      ? 'bg-emerald-600/30' 
                                      : 'bg-gray-100 dark:bg-gray-800'
                                  }`}>
                                    <Calendar className={`w-4 h-4 ${
                                      selectedIndex === globalIndex 
                                        ? 'text-emerald-400' 
                                        : 'text-gray-400'
                                    }`} />
                                  </div>
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {clientName}
                                      </p>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(booking.status)}`}>
                                        {getStatusLabel(booking.status)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(booking.date)} • {booking.startTime}
                                      </span>
                                      {booking.court && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {booking.court.name}
                                        </span>
                                      )}
                                    </div>
                                    {(clientPhone || clientEmail) && (
                                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        {clientPhone && (
                                          <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {clientPhone}
                                          </span>
                                        )}
                                        {clientEmail && (
                                          <span className="flex items-center gap-1 truncate">
                                            <Mail className="w-3 h-3" />
                                            {clientEmail}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                        <p className="text-gray-400 text-sm">Busca un turno</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Escribe el nombre, teléfono o email del cliente
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑↓</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↵</kbd>
                    seleccionar
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Command className="w-3 h-3" />
                  <span>+ K para abrir</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CommandMenu;
