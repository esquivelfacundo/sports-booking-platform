'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Share2,
  Home,
  CalendarPlus,
  Loader2,
  PartyPopper,
  QrCode,
  Bell,
  BarChart3,
  Heart,
  User,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

function ConfirmationPageContent() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { user, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking details using bookingId
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) {
        setError('No se encontró el ID de reserva');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch booking details
        const response = await apiClient.get(`/api/bookings/${bookingId}`) as any;
        if (response) {
          setBookingDetails(response);
          
          // Fetch QR code
          setQrLoading(true);
          try {
            const qrResponse = await apiClient.get(`/api/bookings/${bookingId}/qr?format=dataurl`) as any;
            if (qrResponse && qrResponse.qr) {
              setQrCode(qrResponse.qr);
            }
          } catch (qrErr) {
            console.log('Could not fetch QR code:', qrErr);
          }
          setQrLoading(false);
        }
      } catch (err: any) {
        console.log('Could not fetch booking data:', err);
        setError('No se pudo cargar la reserva');
      } finally {
        setLoading(false);
      }
    };
    
    // Small delay to allow webhook to process the payment and create booking
    const timer = setTimeout(fetchBookingData, 500);
    return () => clearTimeout(timer);
  }, [bookingId]);

  const sidebarItems = [
    { id: 'overview', name: 'Resumen', icon: BarChart3, href: '/dashboard' },
    { id: 'reservations', name: 'Mis Reservas', icon: Calendar, href: '/dashboard?section=reservations' },
    { id: 'favorites', name: 'Favoritos', icon: Heart, href: '/dashboard?section=favorites' },
    { id: 'profile', name: 'Mi Perfil', icon: User, href: '/dashboard?section=profile' },
    { id: 'settings', name: 'Configuración', icon: Settings, href: '/dashboard?section=settings' }
  ];
  
  // Get display values from fetched data
  const displayEstablishment = bookingDetails?.court?.establishment?.name || bookingDetails?.establishment?.name || '';
  const displayCourt = bookingDetails?.court?.name || '';
  const displayDate = bookingDetails?.date || '';
  const displayTime = bookingDetails?.startTime || '';
  const displayEndTime = bookingDetails?.endTime || '';
  const displayDuration = bookingDetails?.duration || 60;
  const displayPrice = bookingDetails?.totalAmount || 0;
  const displayDeposit = bookingDetails?.depositAmount || 0;

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr + 'T12:00:00');
    return dateObj.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Add to calendar (Google Calendar)
  const addToCalendar = () => {
    if (!displayDate || !displayTime || !displayEndTime) return;
    const startDateTime = new Date(`${displayDate}T${displayTime}:00`);
    const endDateTime = new Date(`${displayDate}T${displayEndTime}:00`);
    
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', `Reserva en ${displayEstablishment} - ${displayCourt}`);
    googleCalendarUrl.searchParams.set('dates', 
      `${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
    );
    googleCalendarUrl.searchParams.set('details', `Reserva de cancha\nCancha: ${displayCourt}\nDuración: ${displayDuration} minutos`);
    
    window.open(googleCalendarUrl.toString(), '_blank');
  };
  
  // Share booking
  const shareBooking = async () => {
    const shareData = {
      title: `Reserva en ${displayEstablishment}`,
      text: `¡Reservé una cancha en ${displayEstablishment}! ${displayCourt} el ${formatDate(displayDate)} de ${displayTime} a ${displayEndTime}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      alert('Copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-gray-500 mt-3">Cargando reserva...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/dashboard?section=reservations" className="text-emerald-500 hover:underline">
            Ver mis reservas
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-200 ease-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-52'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center h-14 border-b border-gray-200 px-3 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className={`font-semibold text-gray-900 transition-opacity duration-200 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                Mis Canchas
              </span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-gray-500" />
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
                    sidebarCollapsed ? 'lg:justify-center' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`text-sm font-medium transition-opacity duration-200 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User info at bottom */}
          {user && (
            <div className="flex-shrink-0 border-t border-gray-200 p-3">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className={`flex-1 min-w-0 ml-3 transition-opacity duration-200 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="w-full px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              {/* Left: Menu button (mobile) and Title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  Confirmación de Reserva
                </h1>
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
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-3xl mx-auto">
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="relative inline-block">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-1 -right-1"
                >
                  <PartyPopper className="w-6 h-6 text-yellow-500" />
                </motion.div>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4"
              >
                ¡Reserva confirmada!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 mt-2"
              >
                Tu cancha está reservada. Te enviamos los detalles por email.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Booking Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Código de reserva</p>
                      <p className="text-gray-900 font-mono text-xl font-bold">
                        {bookingId ? bookingId.slice(0, 8).toUpperCase() : 'XXXXXXXX'}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 rounded-full">
                      <span className="text-emerald-600 text-sm font-medium">Confirmada</span>
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{displayEstablishment || 'Establecimiento'}</p>
                      <p className="text-gray-500 text-sm">{displayCourt || 'Cancha'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium capitalize">{formatDate(displayDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{displayTime} - {displayEndTime}</p>
                      <p className="text-gray-500 text-sm">{displayDuration} minutos</p>
                    </div>
                  </div>
                </div>
                
                {/* Payment Summary */}
                <div className="p-5 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">Seña pagada</span>
                    <span className="text-emerald-600 font-semibold">${displayDeposit?.toLocaleString('es-AR') || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Restante a pagar</span>
                    <span className="text-gray-900 font-semibold">${((displayPrice || 0) - (displayDeposit || 0)).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </motion.div>

              {/* QR Code Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <QrCode className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Código QR</h3>
                  </div>
                  
                  {qrLoading ? (
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                  ) : qrCode ? (
                    <div className="bg-white p-3 rounded-xl border border-gray-200 inline-block">
                      <img 
                        src={qrCode} 
                        alt="QR Code de reserva" 
                        className="w-44 h-44 mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">QR no disponible</p>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-500 text-sm mt-4">
                    Mostrá este código en el establecimiento para iniciar tu turno
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 gap-4 mt-6"
            >
              <button
                onClick={addToCalendar}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <CalendarPlus className="w-5 h-5" />
                <span>Agregar al calendario</span>
              </button>
              <button
                onClick={shareBooking}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Share2 className="w-5 h-5" />
                <span>Compartir</span>
              </button>
            </motion.div>
            
            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6"
            >
              <p className="text-blue-700 text-sm">
                <strong>Recordá:</strong> Presentate 10 minutos antes de tu turno. 
                El saldo restante se abona en el establecimiento.
              </p>
            </motion.div>
            
            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 mt-6"
            >
              <Link
                href="/dashboard?section=reservations"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
              >
                Ver mis reservas
              </Link>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5" />
                Volver al inicio
              </Link>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  );
}
