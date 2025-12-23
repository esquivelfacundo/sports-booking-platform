'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Share2,
  Download,
  Home,
  CalendarPlus,
  Loader2,
  PartyPopper
} from 'lucide-react';

function ConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get booking details from URL params
  const bookingId = searchParams.get('bookingId') || '';
  const establishmentName = searchParams.get('establishmentName') || '';
  const courtName = searchParams.get('courtName') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const endTime = searchParams.get('endTime') || '';
  const duration = parseInt(searchParams.get('duration') || '60');
  const price = parseInt(searchParams.get('price') || '0');
  const depositPaid = parseInt(searchParams.get('depositPaid') || '0');
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Add to calendar (Google Calendar)
  const addToCalendar = () => {
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);
    
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', `Reserva en ${establishmentName} - ${courtName}`);
    googleCalendarUrl.searchParams.set('dates', 
      `${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
    );
    googleCalendarUrl.searchParams.set('details', `Reserva de cancha\nCancha: ${courtName}\nDuración: ${duration} minutos`);
    
    window.open(googleCalendarUrl.toString(), '_blank');
  };
  
  // Share booking
  const shareBooking = async () => {
    const shareData = {
      title: `Reserva en ${establishmentName}`,
      text: `¡Reservé una cancha en ${establishmentName}! ${courtName} el ${formatDate(date)} de ${time} a ${endTime}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text);
      alert('Copiado al portapapeles');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-2xl mx-auto px-4">
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
              className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute -top-2 -right-2"
            >
              <PartyPopper className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mt-6"
          >
            ¡Reserva confirmada!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 mt-2"
          >
            Tu cancha está reservada. Te enviamos los detalles por email.
          </motion.p>
        </motion.div>
        
        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Código de reserva</p>
                <p className="text-white font-mono text-xl font-bold">{bookingId.slice(0, 8).toUpperCase() || 'XXXXXXXX'}</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 rounded-full">
                <span className="text-emerald-400 text-sm font-medium">Confirmada</span>
              </div>
            </div>
          </div>
          
          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">{establishmentName}</p>
                <p className="text-gray-400 text-sm">{courtName}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium capitalize">{formatDate(date)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">{time} - {endTime}</p>
                <p className="text-gray-400 text-sm">{duration} minutos</p>
              </div>
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="p-6 bg-gray-800/50 border-t border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Seña pagada</span>
              <span className="text-emerald-400 font-semibold">${depositPaid.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Restante a pagar</span>
              <span className="text-white font-semibold">${(price - depositPaid).toLocaleString('es-AR')}</span>
            </div>
          </div>
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <button
            onClick={addToCalendar}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white hover:bg-gray-700 transition-colors"
          >
            <CalendarPlus className="w-5 h-5" />
            <span>Agregar al calendario</span>
          </button>
          <button
            onClick={shareBooking}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white hover:bg-gray-700 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Compartir</span>
          </button>
        </motion.div>
        
        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6"
        >
          <p className="text-blue-400 text-sm">
            <strong>Recordá:</strong> Presentate 10 minutos antes de tu turno. 
            El saldo restante se abona en el establecimiento.
          </p>
        </motion.div>
        
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/mis-reservas"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all"
          >
            Ver mis reservas
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 border border-gray-700 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  );
}
