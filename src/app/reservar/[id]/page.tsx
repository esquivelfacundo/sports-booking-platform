'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  Check,
  X,
  Wifi,
  Car,
  Coffee
} from 'lucide-react';

interface Facility {
  id: number;
  name: string;
  sport: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  coordinates: [number, number];
  amenities: string[];
  availability: string[];
  description: string;
  rules: string[];
}

const BookingPage = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Mock facility data - En una app real esto vendría de una API
  const mockFacility: Facility = {
    id: 1,
    name: 'Complejo Deportivo San Lorenzo',
    sport: 'futbol5',
    location: 'Palermo, Buenos Aires',
    price: 2500,
    rating: 4.8,
    reviews: 124,
    image: '/api/placeholder/800/400',
    coordinates: [-34.5875, -58.4260],
    amenities: ['Estacionamiento', 'Vestuarios', 'Parrilla', 'Buffet', 'Duchas', 'Iluminación LED'],
    availability: ['18:00', '19:00', '20:00', '21:00', '22:00'],
    description: 'Moderno complejo deportivo con cancha de césped sintético de última generación. Ubicado en el corazón de Palermo, cuenta con todas las comodidades para una experiencia deportiva completa.',
    rules: [
      'Llegar 15 minutos antes del horario reservado',
      'Usar botines con tapones de goma únicamente',
      'Máximo 10 jugadores por equipo',
      'No se permite el ingreso de bebidas alcohólicas',
      'Respetar los horarios de inicio y finalización'
    ]
  };

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setFacility(mockFacility);
      setLoading(false);
    }, 1000);
  }, []);

  // Check authentication when component mounts
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [loading, isAuthenticated]);

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      'Estacionamiento': Car,
      'Vestuarios': Users,
      'Parrilla': Coffee,
      'Buffet': Coffee,
      'Duchas': Users,
      'Iluminación LED': Wifi
    };
    const IconComponent = icons[amenity] || Wifi;
    return <IconComponent className="w-4 h-4" />;
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-AR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        })
      });
    }
    return dates;
  };

  const calculateTotal = () => {
    if (!facility) return 0;
    return facility.price * selectedDuration;
  };

  const handleBooking = () => {
    if (bookingStep === 1) {
      if (!selectedDate || !selectedTime) {
        alert('Por favor selecciona fecha y horario');
        return;
      }
      setBookingStep(2);
    } else {
      // Redirigir a página de confirmación con parámetros
      const params = new URLSearchParams({
        facility: facility?.name || '',
        sport: getSportName(facility?.sport || ''),
        date: selectedDate,
        time: selectedTime,
        duration: selectedDuration.toString(),
        price: facility?.price.toString() || '0',
        total: calculateTotal().toString()
      });
      router.push(`/confirmacion?${params.toString()}`);
    }
  };

  const getSportName = (sport: string) => {
    const sportNames: { [key: string]: string } = {
      'futbol5': 'Fútbol 5',
      'paddle': 'Paddle',
      'tenis': 'Tenis',
      'basquet': 'Básquet'
    };
    return sportNames[sport] || sport;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando información de la cancha...</p>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Cancha no encontrada</h2>
          <p className="text-gray-400 mb-4">La cancha que buscás no existe o no está disponible.</p>
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className={`bg-gray-800 border-b border-gray-700 ${showLoginModal || showRegisterModal ? 'blur-sm' : ''} transition-all duration-300`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showLoginModal || showRegisterModal ? 'blur-sm' : ''} transition-all duration-300`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Facility Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Image */}
              <div className="w-full h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-gray-700 rounded-xl mb-6 flex items-center justify-center">
                <div className="text-6xl">⚽</div>
              </div>

              {/* Basic Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-semibold text-white">{facility.name}</h1>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-current text-emerald-400" />
                    <span className="font-medium text-white">{facility.rating}</span>
                    <span className="text-gray-400">({facility.reviews} reseñas)</span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-400 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{facility.location}</span>
                </div>

                <p className="text-gray-300 leading-relaxed">{facility.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Servicios incluidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {facility.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-emerald-400">{getAmenityIcon(amenity)}</div>
                      <span className="text-gray-300">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Normas del establecimiento</h3>
                <ul className="space-y-2">
                  {facility.rules.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 sticky top-32"
            >
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-semibold text-white">${facility.price}</span>
                  <span className="text-gray-400">por hora</span>
                </div>
              </div>

              {bookingStep === 1 ? (
                <>
                  {/* Date Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Seleccionar fecha</option>
                      {generateDates().map((date) => (
                        <option key={date.value} value={date.value}>
                          {date.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Horario
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {facility.availability.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            selectedTime === time
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-500'
                              : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duración (horas)
                    </label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value={1}>1 hora</option>
                      <option value={2}>2 horas</option>
                      <option value={3}>3 horas</option>
                    </select>
                  </div>

                </>
              ) : (
                <>
                  {/* Booking Summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Resumen de la reserva</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fecha:</span>
                        <span className="font-medium text-white">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Horario:</span>
                        <span className="font-medium text-white">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duración:</span>
                        <span className="font-medium text-white">{selectedDuration} hora(s)</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Total */}
              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-xl font-semibold text-white">${calculateTotal()}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {bookingStep === 1 ? 'Continuar' : 'Confirmar reserva'}
              </button>

              {bookingStep === 2 && (
                <button
                  onClick={() => setBookingStep(1)}
                  className="w-full mt-3 bg-gray-700 text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  Volver
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Login Modal with blur background */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};

export default BookingPage;
