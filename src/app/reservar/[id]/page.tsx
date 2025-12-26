'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEstablishmentDetails } from '@/hooks/useEstablishmentDetails';
import { apiClient } from '@/lib/api';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { 
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
  Share2,
  Heart,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Shield,
  Zap,
  Timer,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  availableCourtIds?: string[]; // Track which courts are available at this time
}

interface Court {
  id: string;
  name: string;
  sport: string;
  surface: string;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  images?: string[];
  isIndoor?: boolean;
}

interface EstablishmentData {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  images: any;
  amenities: string[];
  rating: number;
  reviewCount: number;
  courts: Court[];
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  latitude?: number;
  longitude?: number;
  // Booking restrictions
  maxAdvanceBookingDays?: number;
  minAdvanceBookingHours?: number;
  allowSameDayBooking?: boolean;
}

const BookingPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const idOrSlug = params.id as string;
  
  // Check if it's a UUID or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  const { establishment, loading, error } = useEstablishmentDetails({
    establishmentId: isUUID ? idOrSlug : undefined,
    slug: !isUUID ? idOrSlug : undefined,
    autoFetch: true
  }) as { establishment: EstablishmentData | null; loading: boolean; error: string | null };

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [customDuration, setCustomDuration] = useState<number>(60);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking restrictions (defaults, could come from establishment config)
  const maxAdvanceBookingDays = establishment?.maxAdvanceBookingDays || 14;
  const minAdvanceBookingHours = establishment?.minAdvanceBookingHours || 1;
  const allowSameDayBooking = establishment?.allowSameDayBooking !== false;
  
  // Debug log
  console.log('[Booking Config]', {
    maxAdvanceBookingDays,
    minAdvanceBookingHours,
    allowSameDayBooking,
    fromEstablishment: {
      maxAdvanceBookingDays: establishment?.maxAdvanceBookingDays,
      minAdvanceBookingHours: establishment?.minAdvanceBookingHours,
      allowSameDayBooking: establishment?.allowSameDayBooking
    }
  });

  // Get unique sports from courts
  const availableSports = establishment?.courts 
    ? [...new Set(establishment.courts.map(c => c.sport).filter(Boolean))]
    : [];

  // Filter courts by selected sport
  const filteredCourts = establishment?.courts?.filter(court => 
    selectedSport === 'all' || court.sport === selectedSport
  ) || [];

  // Get courts available at the selected time
  const getAvailableCourtsAtTime = () => {
    if (!selectedTime) return [];
    const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
    if (!selectedSlot?.availableCourtIds?.length) return [];
    
    // Filter courts that are available at this time AND match the sport filter
    return filteredCourts.filter(court => 
      selectedSlot.availableCourtIds?.includes(court.id)
    );
  };
  
  const availableCourtsAtTime = getAvailableCourtsAtTime();

  // Generate dates respecting maxAdvanceBookingDays
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Start from today if same day booking is allowed, otherwise tomorrow
    const startDay = allowSameDayBooking ? 0 : 1;
    
    console.log('[generateDates] allowSameDayBooking:', allowSameDayBooking, 'startDay:', startDay);
    
    for (let i = startDay; i < maxAdvanceBookingDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Use local date format instead of ISO (which uses UTC)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateValue = `${year}-${month}-${day}`;
      
      dates.push({
        value: dateValue,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday: i === startDay,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
      
      if (i === startDay) {
        console.log('[generateDates] First date:', dateValue, 'isToday:', i === startDay);
      }
    }
    return dates;
  };

  const dates = generateDates();

  // Check if a time slot is bookable (not in the past and respects minAdvanceBookingHours)
  const isSlotBookable = useCallback((slotTime: string, slotDate: string): boolean => {
    const now = new Date();
    const [hours, minutes] = slotTime.split(':').map(Number);
    
    // Parse date in local timezone
    const [year, month, day] = slotDate.split('-').map(Number);
    const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    // Check if slot date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDateOnly = new Date(year, month - 1, day, 0, 0, 0, 0);
    const isToday = slotDateOnly.getTime() === today.getTime();
    
    // Debug log
    if (hours === 8 && minutes === 0) {
      console.log(`[isSlotBookable] Date: ${slotDate}, IsToday: ${isToday}, Today: ${today.toLocaleDateString()}, SlotDate: ${slotDateOnly.toLocaleDateString()}`);
    }
    
    // For today: apply minimum advance hours restriction
    if (isToday) {
      const minBookingTime = new Date(now.getTime() + minAdvanceBookingHours * 60 * 60 * 1000);
      const isBookable = slotDateTime > minBookingTime;
      
      // Debug log for all slots
      console.log(`[Slot ${slotTime}] Now: ${now.toLocaleTimeString()}, MinTime: ${minBookingTime.toLocaleTimeString()}, SlotTime: ${slotDateTime.toLocaleTimeString()}, Bookable: ${isBookable}`);
      
      return isBookable;
    }
    
    // For future dates: only check that slot is not in the past
    return slotDateTime > now;
  }, [minAdvanceBookingHours]);

  // Set default date to today
  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].value);
    }
  }, [dates]);


  // Fetch availability from backend for all courts (same logic as admin sidebar)
  const fetchAvailability = useCallback(async () => {
    if (!selectedDate || !establishment?.courts?.length) return;
    
    setLoadingSlots(true);
    try {
      // Filter courts by selected sport if any
      const courtsToCheck = selectedSport === 'all' 
        ? establishment.courts 
        : establishment.courts.filter(c => c.sport === selectedSport);
      
      if (courtsToCheck.length === 0) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return;
      }

      // Generate all possible time slots from 8:00 to 23:00 every 30 minutes
      const slots: Map<string, string[]> = new Map();
      for (let hour = 8; hour <= 23; hour++) {
        slots.set(`${hour.toString().padStart(2, '0')}:00`, []);
        if (hour < 23) {
          slots.set(`${hour.toString().padStart(2, '0')}:30`, []);
        }
      }
      
      // Check availability for each court
      for (const court of courtsToCheck) {
        try {
          const response = await apiClient.getCourtAvailability(court.id, selectedDate, selectedDuration) as any;
          const availability = response.availableSlots || [];
          
          // Add court to available slots
          availability.forEach((slot: any) => {
            const time = slot.startTime || slot.time;
            if (slot.available !== false && slots.has(time)) {
              const courtIds = slots.get(time) || [];
              courtIds.push(court.id);
              slots.set(time, courtIds);
            }
          });
        } catch (err) {
          console.error(`Error loading availability for court ${court.id}:`, err);
        }
      }
      
      // Convert to array - only slots with at least one available court AND bookable time are available
      const slotsArray: TimeSlot[] = Array.from(slots.entries())
        .map(([time, courtIds]) => ({
          time,
          // Slot is available only if: has courts AND is bookable (not in past, respects min advance)
          available: courtIds.length > 0 && isSlotBookable(time, selectedDate),
          price: courtsToCheck[0]?.pricePerHour || 2500,
          availableCourtIds: courtIds // Store which courts are available at this time
        }))
        .sort((a, b) => a.time.localeCompare(b.time));
      
      setAvailableSlots(slotsArray);
    } catch (error) {
      console.error('Error fetching availability:', error);
      generateFallbackSlots();
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, selectedDuration, selectedSport, establishment?.courts, isSlotBookable]);

  // Fallback slot generation if API fails
  const generateFallbackSlots = () => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = new Date(selectedDate).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    let startHour = 8;
    let endHour = 23;
    
    if (establishment?.openingHours?.[dayName]) {
      const daySchedule = establishment.openingHours[dayName];
      if (!daySchedule.closed) {
        startHour = parseInt(daySchedule.open?.split(':')[0] || '8');
        endHour = parseInt(daySchedule.close?.split(':')[0] || '23');
      }
    }
    
    const durationHours = selectedDuration / 60;
    
    for (let hour = startHour; hour <= endHour - durationHours; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotEndHour = hour + (minute + selectedDuration) / 60;
        if (slotEndHour > endHour) continue;
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          // Apply time restrictions in fallback too
          available: isSlotBookable(time, selectedDate),
          price: 2500
        });
      }
    }
    
    setAvailableSlots(slots);
  };

  // Update slots when date, duration, or sport changes
  useEffect(() => {
    if (selectedDate && selectedDuration && establishment?.courts?.length) {
      setSelectedTime('');
      setSelectedCourt(null);
      fetchAvailability();
    }
  }, [selectedDate, selectedDuration, selectedSport, fetchAvailability]);

  const getPrice = () => {
    if (!selectedCourt) return 0;
    const hourlyRate = selectedCourt.pricePerHour;
    // Calculate price based on duration (pro-rated)
    return Math.round(hourlyRate * (selectedDuration / 60));
  };

  // Calculate end time based on start time and duration
  const getEndTime = () => {
    if (!selectedTime) return '';
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + selectedDuration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    if (!selectedDate || !selectedTime || !selectedCourt) {
      alert('Por favor selecciona fecha, cancha y horario');
      return;
    }
    
    const bookingParams = new URLSearchParams({
      establishmentId: establishment?.id || '',
      establishmentName: establishment?.name || '',
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      date: selectedDate,
      time: selectedTime,
      endTime: getEndTime(),
      duration: selectedDuration.toString(),
      price: getPrice().toString(),
      sport: selectedCourt.sport || ''
    });
    
    // Go to payment page first
    router.push(`/reservar/pago?${bookingParams.toString()}`);
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      'estacionamiento': Car,
      'parking': Car,
      'wifi': Wifi,
      'vestuarios': Users,
      'duchas': Sparkles,
      'cafeteria': Coffee,
      'buffet': Coffee,
      'iluminacion': Zap,
      'techado': Shield,
    };
    
    const key = amenity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const [k, Icon] of Object.entries(iconMap)) {
      if (key.includes(k)) return Icon;
    }
    return Check;
  };

  const getImages = () => {
    let imgs: string[] = [];
    if (!establishment?.images) return imgs;
    if (Array.isArray(establishment.images)) {
      imgs = establishment.images;
    } else if (establishment.images.photos) {
      imgs = establishment.images.photos;
    }
    // Convert relative URLs to full backend URLs
    return imgs.map((img: string) => apiClient.getImageUrl(img));
  };

  const images = getImages();
  const mainImage = images[0] || '/assets/default-card.png';

  // Show loader while loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <UnifiedLoader size="lg" />
      </div>
    );
  }

  // Only show error if loading is complete and there's an error
  if (!loading && (error || !establishment)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Establecimiento no encontrado</h2>
          <p className="text-gray-400 mb-6">
            {error || 'El establecimiento que buscás no existe o no está disponible.'}
          </p>
          <button 
            onClick={() => router.push('/buscar')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all"
          >
            Buscar establecimientos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Hero Section */}
      <section>
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {/* Main Image */}
          <div className="absolute inset-0">
            <img 
              src={mainImage} 
              alt={establishment.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
          </div>
          
          {/* Gallery thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-6 right-6 flex gap-2">
              {images.slice(1, 4).map((img: string, idx: number) => (
                <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 hover:border-white/50 transition-colors cursor-pointer">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {images.length > 4 && (
                <div className="w-16 h-16 rounded-lg bg-black/50 backdrop-blur flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-black/70 transition-colors">
                  +{images.length - 4}
                </div>
              )}
            </div>
          )}
          
          {/* Floating info cards container */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Main info card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-gray-700 flex-1 lg:max-w-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{establishment.name}</h1>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium">{establishment.rating || '4.5'}</span>
                        </div>
                        <span className="text-gray-400">({establishment.reviewCount || 0} reseñas)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`p-2 rounded-full transition-all ${isFavorite ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        title="Compartir"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 mt-3">
                    <div className="flex items-center gap-2 text-gray-400 flex-1 min-w-0">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{establishment.address}, {establishment.city}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-400">desde</div>
                      <div className="text-xl font-bold text-white">
                        ${establishment.courts?.[0]?.pricePerHour || 2500}
                        <span className="text-xs font-normal text-gray-400">/hr</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Info Cards */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="hidden lg:grid grid-cols-4 gap-3 flex-1"
                >
                  {[
                    { icon: Timer, label: 'Canchas', value: `${establishment.courts?.length || 0}` },
                    { icon: Clock, label: 'Horario', value: '8 - 23hs' },
                    { icon: Users, label: 'Capacidad', value: 'Hasta 10' },
                    { icon: CreditCard, label: 'Pago', value: 'Online' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 border border-gray-700 flex flex-col justify-center">
                      <item.icon className="w-5 h-5 text-emerald-400 mb-1" />
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</div>
                      <div className="text-white font-semibold text-sm">{item.value}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Info - Mobile Only */}
        <div className="grid grid-cols-4 gap-2 mb-6 lg:hidden">
          {[
            { icon: Timer, label: 'Canchas', value: `${establishment.courts?.length || 0}` },
            { icon: Clock, label: 'Horario', value: '8-23hs' },
            { icon: Users, label: 'Capacidad', value: '10' },
            { icon: CreditCard, label: 'Pago', value: 'Online' },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-900 rounded-lg p-2 border border-gray-800 text-center">
              <item.icon className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[9px] text-gray-400 uppercase">{item.label}</div>
              <div className="text-white font-medium text-xs">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Booking Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-12"
        >
          {/* Booking Header */}
          <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Reservar cancha</h2>
                <p className="text-gray-400 text-sm">Selecciona cancha, fecha y horario para tu reserva</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-3xl font-bold text-white">${getPrice()}</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Sport Filter Pills */}
            {availableSports.length > 1 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSport('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSport === 'all'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Todos
                  </button>
                  {availableSports.map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                        selectedSport === sport
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Date Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                <h3 className="text-lg font-semibold text-white">Elige el día</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(date.value)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border-2 transition-all min-w-[65px] ${
                      selectedDate === date.value
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : date.isWeekend
                        ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-emerald-500/50'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500/50'
                    }`}
                  >
                    <span className="text-[10px] font-medium opacity-70 uppercase">{date.dayName}</span>
                    <span className="text-lg font-bold">{date.dayNumber}</span>
                    {date.isToday && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        selectedDate === date.value ? 'bg-white/20' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        Hoy
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Duration Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${selectedDate ? 'bg-emerald-500' : 'bg-gray-600'}`}>2</div>
                <h3 className="text-lg font-semibold text-white">Duración del partido</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 60, label: '1 hora' },
                  { value: 90, label: '1:30 hs' },
                  { value: 120, label: '2 horas' },
                  { value: 180, label: '3 horas' }
                ].map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => {
                      setSelectedDuration(duration.value);
                      setShowCustomDuration(false);
                    }}
                    disabled={!selectedDate}
                    className={`px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                      !selectedDate
                        ? 'opacity-50 cursor-not-allowed bg-gray-800 border-gray-700'
                        : selectedDuration === duration.value && !showCustomDuration
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500/50'
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomDuration(!showCustomDuration)}
                  disabled={!selectedDate}
                  className={`px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                    !selectedDate
                      ? 'opacity-50 cursor-not-allowed bg-gray-800 border-gray-700'
                      : showCustomDuration
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500/50'
                  }`}
                >
                  Personalizado
                </button>
              </div>
              
              {/* Custom Duration Input */}
              {showCustomDuration && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 flex items-center gap-4"
                >
                  <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-2">
                    <button
                      onClick={() => setCustomDuration(Math.max(30, customDuration - 30))}
                      className="w-10 h-10 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center text-xl font-bold"
                    >
                      -
                    </button>
                    <div className="w-24 text-center">
                      <span className="text-2xl font-bold text-white">{customDuration}</span>
                      <span className="text-gray-400 ml-1">min</span>
                    </div>
                    <button
                      onClick={() => setCustomDuration(Math.min(480, customDuration + 30))}
                      className="w-10 h-10 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDuration(customDuration);
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Aplicar
                  </button>
                  <span className="text-gray-400 text-sm">
                    = {Math.floor(customDuration / 60)}h {customDuration % 60 > 0 ? `${customDuration % 60}min` : ''}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Step 3: Time Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${selectedDate && selectedDuration ? 'bg-emerald-500' : 'bg-gray-600'}`}>3</div>
                <h3 className="text-lg font-semibold text-white">Horario disponible</h3>
                {selectedDuration && (
                  <span className="text-sm text-gray-400">
                    (turnos de {selectedDuration >= 60 ? `${Math.floor(selectedDuration / 60)}h` : ''}{selectedDuration % 60 > 0 ? ` ${selectedDuration % 60}min` : ''})
                  </span>
                )}
              </div>
              {loadingSlots ? (
                <div className="text-center py-10 bg-gray-800/50 rounded-xl">
                  <div className="w-8 h-8 mx-auto mb-2 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Cargando horarios disponibles...</p>
                </div>
              ) : selectedDate && availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {availableSlots.map((slot: TimeSlot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`py-2.5 px-2 rounded-lg text-sm font-semibold transition-all ${
                        selectedTime === slot.time
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : slot.available
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'bg-gray-800/30 text-gray-600 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-800/50 rounded-xl">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Selecciona día y duración para ver horarios</p>
                </div>
              )}
            </div>

            {/* Step 4: Court Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${selectedTime ? 'bg-emerald-500' : 'bg-gray-600'}`}>4</div>
                <h3 className="text-lg font-semibold text-white">Selecciona la cancha</h3>
                {selectedTime && availableCourtsAtTime.length > 0 && (
                  <span className="text-sm text-gray-400">({availableCourtsAtTime.length} disponibles)</span>
                )}
              </div>
              {selectedTime ? (
                availableCourtsAtTime.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableCourtsAtTime.map((court) => (
                      <motion.div
                        key={court.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCourt(court)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedCourt?.id === court.id 
                            ? 'bg-emerald-500/10 border-emerald-500' 
                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                            selectedCourt?.id === court.id ? 'bg-emerald-500' : 'bg-gray-700'
                          }`}>
                            🏟️
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white truncate">{court.name}</h4>
                            <p className="text-xs text-gray-400 truncate">{court.sport} • {court.surface}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-400">${Math.round(court.pricePerHour * (selectedDuration / 60))}</p>
                            <p className="text-[10px] text-gray-500">{selectedDuration} min</p>
                          </div>
                          {selectedCourt?.id === court.id && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500 bg-gray-800/50 rounded-xl">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay canchas disponibles en este horario</p>
                    <p className="text-xs mt-1">Selecciona otro horario</p>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-800/50 rounded-xl">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Selecciona un horario para ver las canchas disponibles</p>
                </div>
              )}
            </div>

            {/* Summary & Book Button */}
            <div className="border-t border-gray-800 pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Summary */}
                {selectedTime && selectedCourt ? (
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
                      <span className="text-gray-400">Cancha:</span>
                      <span className="text-white font-medium">{selectedCourt.name}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
                      <span className="text-gray-400">Fecha:</span>
                      <span className="text-white font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
                      <span className="text-gray-400">Horario:</span>
                      <span className="text-white font-medium">{selectedTime} - {getEndTime()}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                      <span className="text-emerald-400">Total:</span>
                      <span className="text-emerald-400 font-bold text-lg">${getPrice()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Completa los pasos anteriores para continuar</p>
                )}
                
                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  disabled={!selectedTime || !selectedCourt || !selectedDate}
                  className="w-full lg:w-auto px-12 py-4 rounded-xl font-semibold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                >
                  {!isAuthenticated ? 'Iniciar sesión para reservar' : 'Confirmar reserva'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Description */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Sobre el establecimiento</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              {establishment.description || 'Moderno complejo deportivo con instalaciones de primera calidad para disfrutar del deporte con amigos.'}
            </p>
            
            {/* Contact */}
            <div className="flex flex-wrap gap-3">
              {establishment.phone && (
                <a href={`tel:${establishment.phone}`} className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-xl border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{establishment.phone}</span>
                </a>
              )}
              {establishment.email && (
                <a href={`mailto:${establishment.email}`} className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-xl border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{establishment.email}</span>
                </a>
              )}
              {establishment.website && (
                <a href={establishment.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-xl border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-colors">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Sitio web</span>
                </a>
              )}
            </div>
          </div>

          {/* Amenities */}
          {establishment.amenities && establishment.amenities.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Servicios</h2>
              <div className="grid grid-cols-2 gap-3">
                {establishment.amenities.map((amenity, idx) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl border border-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-gray-300 text-sm">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Ubicación</h2>
          <div className="h-64 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">{establishment.address}</p>
              <p className="text-gray-500 text-xs">{establishment.city}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Floating Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur-xl border-t border-gray-800 lg:hidden z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xl font-bold text-white">${getPrice()}</div>
            <div className="text-xs text-gray-400">
              {selectedTime ? `${selectedDate} • ${selectedTime}` : 'Selecciona horario'}
            </div>
          </div>
          <button
            onClick={handleBooking}
            disabled={!selectedTime || !selectedCourt || !selectedDate}
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 bg-gradient-to-r from-emerald-500 to-cyan-500"
          >
            Reservar
          </button>
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
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
