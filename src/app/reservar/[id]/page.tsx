'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Coffee,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  duration: number;
}

interface Court {
  id: string;
  name: string;
  type: string;
  surface: string;
  timeSlots: TimeSlot[];
}

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
  courts?: Court[];
  priceFrom?: number;
}

const BookingPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [expandedCourts, setExpandedCourts] = useState<string[]>([]);
  const [paymentOption, setPaymentOption] = useState<'full' | 'split'>('full');

  // Generate mock time slots - each slot is 1 hour
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const times = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
    
    times.forEach(time => {
      slots.push({
        time,
        available: Math.random() > 0.3, // Random availability
        price: 2500,
        duration: 60 // All slots are 1 hour
      });
    });
    
    return slots;
  };

  // Mock facility data - En una app real esto vendría de una API
  const mockFacility: Facility = {
    id: 1,
    name: 'Complejo Deportivo San Lorenzo',
    sport: 'futbol5',
    location: 'Palermo, Buenos Aires',
    price: 2500,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop&auto=format',
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
    ],
    courts: [
      {
        id: '1',
        name: 'Cancha 1',
        type: 'Exterior',
        surface: 'Césped Sintético | Dobles',
        timeSlots: generateTimeSlots()
      },
      {
        id: '2',
        name: 'Cancha 2', 
        type: 'Exterior',
        surface: 'Césped Sintético | Dobles',
        timeSlots: generateTimeSlots()
      },
      {
        id: '3',
        name: 'Cancha 3',
        type: 'Cubierta',
        surface: 'Césped Sintético | Dobles',
        timeSlots: generateTimeSlots()
      }
    ],
    priceFrom: 2200
  };

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setFacility(mockFacility);
      setLoading(false);
      
      // Pre-select first court
      if (mockFacility.courts && mockFacility.courts.length > 0) {
        setSelectedCourt(mockFacility.courts[0]);
        setExpandedCourts([mockFacility.courts[0].id]);
      }
      
      // Set pre-selected time from URL if available
      const timeParam = searchParams.get('time');
      if (timeParam) {
        setSelectedTimes([timeParam]);
      }
    }, 1000);
  }, [searchParams]);

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
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday: i === 0,
        label: date.toLocaleDateString('es-AR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        })
      });
    }
    return dates;
  };

  const toggleCourtExpansion = (courtId: string) => {
    setExpandedCourts(prev => 
      prev.includes(courtId) 
        ? prev.filter(id => id !== courtId)
        : [...prev, courtId]
    );
  };

  const getAvailableSlots = (court: Court) => {
    if (!showOnlyAvailable) return court.timeSlots;
    return court.timeSlots.filter(slot => slot.available);
  };

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  };

  const calculateTotal = () => {
    if (!selectedCourt || selectedTimes.length === 0) return 0;
    return selectedTimes.length * 2500; // Each slot is $2500
  };

  const calculateSplitPrice = () => {
    const total = calculateTotal();
    const players = 4; // Default players for split
    return Math.ceil(total / players);
  };

  const handleBooking = () => {
    if (bookingStep === 1) {
      if (!selectedDate || selectedTimes.length === 0 || !selectedCourt) {
        alert('Por favor selecciona fecha, cancha y al menos un horario');
        return;
      }
      setBookingStep(2);
    } else {
      // Redirigir a página de confirmación con parámetros
      const params = new URLSearchParams({
        facility: facility?.name || '',
        court: selectedCourt?.name || '',
        sport: getSportName(facility?.sport || ''),
        date: selectedDate,
        times: selectedTimes.join(','),
        paymentOption: paymentOption,
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
              <div className="w-full h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-gray-700 rounded-xl mb-6 overflow-hidden">
                {facility.image ? (
                  <img 
                    src={facility.image} 
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl">⚽</div>
                  </div>
                )}
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
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-white">¿Qué día quieres jugar?</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {generateDates().slice(0, 6).map((date) => (
                        <button
                          key={date.value}
                          onClick={() => setSelectedDate(date.value)}
                          className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
                            selectedDate === date.value
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                          }`}
                        >
                          <span className="text-xs font-medium">{date.dayName}</span>
                          <span className="text-lg font-bold">{date.dayNumber}</span>
                          <span className="text-xs">{date.month}</span>
                          {date.isToday && (
                            <span className="text-xs text-emerald-400 mt-1">Hoy</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show Only Available Toggle */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Mostrar solo horarios disponibles</span>
                      <button
                        onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          showOnlyAvailable ? 'bg-emerald-500' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            showOnlyAvailable ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Court Selection */}
                  {facility.courts && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-white mb-3">Reserva una cancha</h3>
                      <p className="text-xs text-gray-400 mb-4">
                        Crea un partido privado donde puedes invitar a tus amigos
                      </p>
                      
                      <div className="space-y-3">
                        {facility.courts.map((court) => {
                          const availableSlots = getAvailableSlots(court);
                          const isExpanded = expandedCourts.includes(court.id);
                          
                          return (
                            <div key={court.id} className="border border-gray-600 rounded-lg">
                              <button
                                onClick={() => toggleCourtExpansion(court.id)}
                                className="w-full p-4 text-left hover:bg-gray-700 transition-colors rounded-lg"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-white">{court.name}</h4>
                                    <p className="text-sm text-gray-400">{court.surface}</p>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </button>
                              
                              {isExpanded && (
                                <div className="px-4 pb-4">
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-white">
                                        Horarios disponibles (1 hora cada uno)
                                      </span>
                                      <span className="text-sm text-emerald-400">
                                        $2500 por hora
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                      {court.timeSlots.map((slot) => {
                                        const isSelected = selectedTimes.includes(slot.time) && selectedCourt?.id === court.id;
                                        return (
                                          <button
                                            key={slot.time}
                                            onClick={() => {
                                              setSelectedCourt(court);
                                              handleTimeToggle(slot.time);
                                            }}
                                            className={`px-2 py-1.5 text-xs rounded-md border transition-all duration-200 relative ${
                                              isSelected
                                                ? 'bg-emerald-500 text-white border-emerald-500'
                                                : slot.available
                                                ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                                                : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'
                                            }`}
                                          >
                                            <span className={!slot.available ? 'line-through' : ''}>
                                              {slot.time}
                                            </span>
                                            {!slot.available && (
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <X className="w-3 h-3 text-red-400" />
                                              </div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {selectedTimes.length > 0 && selectedCourt?.id === court.id && (
                                      <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                                        <p className="text-xs text-emerald-400">
                                          Seleccionados: {selectedTimes.join(', ')} ({selectedTimes.length} hora{selectedTimes.length > 1 ? 's' : ''})
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                        <span className="text-gray-400">Cancha:</span>
                        <span className="font-medium text-white">{selectedCourt?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Horarios:</span>
                        <span className="font-medium text-white">{selectedTimes.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total horas:</span>
                        <span className="font-medium text-white">{selectedTimes.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Opciones de pago</h3>
                    
                    {/* Split Payment Option */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setPaymentOption('split')}
                        className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                          paymentOption === 'split'
                            ? 'bg-emerald-500/20 border-emerald-500 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">x4</span>
                            </div>
                            <span className="font-medium">Pagas tu parte</span>
                          </div>
                          <span className="font-bold text-emerald-400">${calculateSplitPrice()}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-left">
                          Si el resto de jugadores no paga antes del {new Date().toLocaleDateString()} 15:00 asumirás el pago de su parte (${calculateTotal()})
                        </p>
                      </button>

                      {/* Full Payment Option */}
                      <button
                        onClick={() => setPaymentOption('full')}
                        className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                          paymentOption === 'full'
                            ? 'bg-emerald-500/20 border-emerald-500 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">x4</span>
                            </div>
                            <span className="font-medium">Pagas todo</span>
                          </div>
                          <span className="font-bold text-emerald-400">${calculateTotal()}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Total */}
              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">
                    {bookingStep === 2 && paymentOption === 'split' ? 'Tu parte' : 'Total'}
                  </span>
                  <span className="text-xl font-semibold text-white">
                    ${bookingStep === 2 && paymentOption === 'split' ? calculateSplitPrice() : calculateTotal()}
                  </span>
                </div>
                {bookingStep === 2 && (
                  <div className="text-xs text-gray-400 mt-2">
                    {selectedTimes.length} hora{selectedTimes.length > 1 ? 's' : ''} • {selectedCourt?.name} • {facility.name}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleBooking}
                disabled={!selectedDate || selectedTimes.length === 0 || !selectedCourt}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {bookingStep === 1 ? 'Continuar' : `Continuar pagando $${bookingStep === 2 && paymentOption === 'split' ? calculateSplitPrice() : calculateTotal()}`}
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
