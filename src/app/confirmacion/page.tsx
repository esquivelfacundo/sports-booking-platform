'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Download, 
  Share2, 
  Phone, 
  Mail,
  ArrowRight,
  CreditCard,
  Users
} from 'lucide-react';

interface BookingDetails {
  id: string;
  facilityName: string;
  facilityLocation: string;
  sport: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  total: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingCode: string;
}

const ConfirmationContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular obtención de datos de reserva
    setTimeout(() => {
      const mockBooking: BookingDetails = {
        id: '1',
        facilityName: searchParams.get('facility') || 'Complejo Deportivo San Lorenzo',
        facilityLocation: 'Palermo, Buenos Aires',
        sport: searchParams.get('sport') || 'Fútbol 5',
        date: searchParams.get('date') || new Date().toISOString().split('T')[0],
        time: searchParams.get('time') || '19:00',
        duration: Number(searchParams.get('duration')) || 1,
        price: Number(searchParams.get('price')) || 2500,
        total: Number(searchParams.get('total')) || 2500,
        status: 'confirmed',
        bookingCode: 'MC' + Math.random().toString(36).substr(2, 9).toUpperCase()
      };
      setBooking(mockBooking);
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDownloadReceipt = () => {
    // Simular descarga de comprobante
    alert('Descargando comprobante...');
  };

  const handleShare = () => {
    if (navigator.share && booking) {
      navigator.share({
        title: 'Mi reserva en Mis Canchas',
        text: `Reservé ${booking.facilityName} para el ${formatDate(booking.date)} a las ${booking.time}`,
        url: window.location.href,
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Procesando tu reserva...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Reserva no encontrada</h2>
          <p className="text-gray-400 mb-4">No pudimos encontrar los detalles de tu reserva.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="bg-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">¡Reserva confirmada!</h1>
          <p className="text-xl text-gray-300 mb-2">Tu cancha está reservada</p>
          <p className="text-gray-400">Código de reserva: <span className="font-mono text-emerald-400">{booking.bookingCode}</span></p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Detalles de la reserva</h2>
              
              {/* Facility Info */}
              <div className="mb-8">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">
                    {booking.sport === 'Fútbol 5' && '⚽'}
                    {booking.sport === 'Paddle' && '🏓'}
                    {booking.sport === 'Tenis' && '🎾'}
                    {booking.sport === 'Básquet' && '🏀'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{booking.facilityName}</h3>
                    <div className="flex items-center text-gray-400 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{booking.facilityLocation}</span>
                    </div>
                    <div className="inline-block bg-emerald-600 text-white text-sm px-3 py-1 rounded-full">
                      {booking.sport}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-white">Fecha</span>
                  </div>
                  <p className="text-gray-300 capitalize">{formatDate(booking.date)}</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-white">Horario</span>
                  </div>
                  <p className="text-gray-300">{booking.time} - {booking.time.split(':')[0]}:{(parseInt(booking.time.split(':')[1]) + booking.duration * 60).toString().padStart(2, '0')}</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-white">Duración</span>
                  </div>
                  <p className="text-gray-300">{booking.duration} hora{booking.duration > 1 ? 's' : ''}</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-white">Total pagado</span>
                  </div>
                  <p className="text-gray-300 text-xl font-semibold">${booking.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Important Info */}
              <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-400 mb-2">Información importante</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Llegá 15 minutos antes del horario reservado</li>
                  <li>• Presentá este comprobante en recepción</li>
                  <li>• Podés cancelar hasta 2 horas antes sin cargo</li>
                  <li>• En caso de lluvia, la reserva se reprograma automáticamente</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Actions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-6">Acciones</h3>
              
              <div className="space-y-4">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar comprobante</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors border border-gray-600"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="font-medium text-white mb-3">¿Necesitás ayuda?</h4>
                  <div className="space-y-2">
                    <a
                      href="tel:+541123456789"
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>+54 11 2345-6789</span>
                    </a>
                    <a
                      href="mailto:soporte@miscanchas.com"
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>soporte@miscanchas.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Próximos pasos</h3>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/buscar')}
                  className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors"
                >
                  <span>Buscar otra cancha</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors"
                >
                  <span>Volver al inicio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando confirmación...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
};

export default ConfirmationPage;
