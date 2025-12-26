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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trophy
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
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 5;
  
  // Design variant selector (for testing different layouts)
  const [designVariant, setDesignVariant] = useState<'A' | 'B' | 'C'>('A');
  
  // Step navigation helpers
  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!selectedSport;
      case 2: return !!selectedDate;
      case 3: return !!selectedDuration;
      case 4: return !!selectedTime;
      case 5: return !!selectedCourt;
      default: return false;
    }
  };
  
  const goToNextStep = () => {
    if (canGoNext() && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  // Generate dates respecting maxAdvanceBookingDays, with proper calendar alignment
  const generateDates = () => {
    const dates: Array<{
      value: string;
      dayName: string;
      dayNumber: number;
      month: string;
      isToday: boolean;
      isWeekend: boolean;
      isEmpty?: boolean;
    }> = [];
    const today = new Date();
    // Day names starting from Monday (index 0 = Monday, 6 = Sunday)
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Start from today if same day booking is allowed, otherwise tomorrow
    const startDay = allowSameDayBooking ? 0 : 1;
    
    // Helper to get day index where Monday = 0, Sunday = 6
    const getMondayBasedDay = (jsDay: number) => jsDay === 0 ? 6 : jsDay - 1;
    
    // Get the first date
    const firstDate = new Date(today);
    firstDate.setDate(today.getDate() + startDay);
    const firstDayOfWeek = getMondayBasedDay(firstDate.getDay());
    
    // Add empty cells for days before the first date (to align with Monday start)
    for (let i = 0; i < firstDayOfWeek; i++) {
      dates.push({
        value: `empty-${i}`,
        dayName: dayNames[i],
        dayNumber: 0,
        month: '',
        isToday: false,
        isWeekend: false,
        isEmpty: true
      });
    }
    
    // Add actual dates
    for (let i = startDay; i < maxAdvanceBookingDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateValue = `${year}-${month}-${day}`;
      const mondayBasedDay = getMondayBasedDay(date.getDay());
      
      dates.push({
        value: dateValue,
        dayName: dayNames[mondayBasedDay],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday: i === startDay,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
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

  // Shared booking form component for all designs
  const BookingForm = ({ compact = false }: { compact?: boolean }) => (
    <div className={`bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden ${compact ? '' : 'mb-12'}`}>
      {/* Booking Header with Progress */}
      <div className="p-4 md:p-6 border-b border-gray-800 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Reservar cancha</h2>
            <p className="text-gray-400 text-sm">Paso {currentStep} de {TOTAL_STEPS}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Total</div>
            <div className="text-2xl font-bold text-white">${getPrice()}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
            <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all ${idx + 1 <= currentStep ? 'bg-emerald-500' : 'bg-gray-700'}`} />
          ))}
        </div>
      </div>

      <div className={`p-4 md:p-6 ${compact ? 'max-h-[60vh] overflow-y-auto' : 'min-h-[400px]'}`}>
        <AnimatePresence mode="wait">
          {/* Step 1: Sport Selection */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">¿Qué deporte querés jugar?</h3>
              </div>
              <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-3 gap-4'}`}>
                {availableSports.map((sport) => {
                  const sportIcons: Record<string, string> = { 'futbol': '⚽', 'padel': '🎾', 'paddle': '🎾', 'tenis': '🎾', 'basquet': '🏀', 'voley': '🏐' };
                  const icon = sportIcons[sport.toLowerCase()] || '🏟️';
                  const courtCount = establishment?.courts?.filter(c => c.sport === sport).length || 0;
                  return (
                    <button key={sport} onClick={() => { setSelectedSport(sport); setCurrentStep(2); }}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${selectedSport === sport ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-800 border-gray-700 hover:border-emerald-500/50'}`}>
                      <div className="text-3xl mb-2">{icon}</div>
                      <div className="font-semibold text-white capitalize">{sport}</div>
                      <div className="text-xs text-gray-400">{courtCount} canchas</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Date Selection */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-1">¿Qué día?</h3>
              </div>
              <div className={`grid ${compact ? 'grid-cols-5 gap-1' : 'grid-cols-7 gap-2'}`}>
                {dates.map((date) => (
                  date.isEmpty ? <div key={date.value} className="p-2" /> : (
                    <button key={date.value} onClick={() => { setSelectedDate(date.value); setCurrentStep(3); }}
                      className={`relative flex flex-col items-center p-2 rounded-lg border-2 transition-all ${selectedDate === date.value ? 'bg-emerald-500 border-emerald-500 text-white' : date.isWeekend ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-emerald-500/50' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500/50'}`}>
                      {date.isToday && <span className={`absolute top-0.5 right-0.5 text-[6px] px-1 rounded ${selectedDate === date.value ? 'bg-white/20' : 'bg-emerald-500/20 text-emerald-400'}`}>Hoy</span>}
                      <span className="text-[9px] opacity-70 uppercase">{date.dayName}</span>
                      <span className="text-lg font-bold">{date.dayNumber}</span>
                      <span className="text-[9px] opacity-70">{date.month}</span>
                    </button>
                  )
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Duration */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-4"><h3 className="text-xl font-bold text-white">¿Cuánto tiempo?</h3></div>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 60, label: '1 hora' }, { value: 90, label: '1:30 hs' }, { value: 120, label: '2 horas' }].map((d) => (
                  <button key={d.value} onClick={() => { setSelectedDuration(d.value); setShowCustomDuration(false); setCurrentStep(4); }}
                    className={`p-4 rounded-xl border-2 text-center ${selectedDuration === d.value && !showCustomDuration ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-800 border-gray-700 hover:border-emerald-500/50'}`}>
                    <div className="text-xl font-bold text-white">{d.label}</div>
                  </button>
                ))}
                <button onClick={() => { setShowCustomDuration(!showCustomDuration); if (!showCustomDuration) setCustomDuration(150); }}
                  className={`p-4 rounded-xl border-2 text-center ${showCustomDuration ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-800 border-gray-700 hover:border-emerald-500/50'}`}>
                  <div className="text-xl font-bold text-white">Otro</div>
                </button>
              </div>
              {showCustomDuration && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button onClick={() => setCustomDuration(Math.max(150, customDuration - 30))} disabled={customDuration <= 150} className="w-10 h-10 rounded-lg bg-gray-700 text-white disabled:opacity-50">-</button>
                    <span className="text-2xl font-bold text-white">{Math.floor(customDuration / 60)}:{String(customDuration % 60).padStart(2, '0')}</span>
                    <button onClick={() => setCustomDuration(Math.min(480, customDuration + 30))} className="w-10 h-10 rounded-lg bg-gray-700 text-white">+</button>
                  </div>
                  <button onClick={() => { setSelectedDuration(customDuration); setCurrentStep(4); }} className="w-full py-2 rounded-lg bg-emerald-500 text-white font-medium">Confirmar</button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Time */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-4"><h3 className="text-xl font-bold text-white">¿A qué hora?</h3></div>
              {loadingSlots ? (
                <div className="text-center py-8"><div className="w-8 h-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : availableSlots.length > 0 ? (
                <div className={`grid ${compact ? 'grid-cols-4 gap-1' : 'grid-cols-6 gap-2'}`}>
                  {availableSlots.map((slot) => (
                    <button key={slot.time} onClick={() => { if (slot.available) { setSelectedTime(slot.time); setCurrentStep(5); } }} disabled={!slot.available}
                      className={`py-2 rounded-lg text-sm font-medium ${selectedTime === slot.time ? 'bg-emerald-500 text-white' : slot.available ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-800/30 text-gray-600 line-through'}`}>
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : <div className="text-center py-8 text-gray-500">No hay horarios disponibles</div>}
            </motion.div>
          )}

          {/* Step 5: Court */}
          {currentStep === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-4"><h3 className="text-xl font-bold text-white">Elegí tu cancha</h3></div>
              {availableCourtsAtTime.length > 0 ? (
                <div className="space-y-3">
                  {availableCourtsAtTime.map((court) => (
                    <div key={court.id} onClick={() => setSelectedCourt(court)}
                      className={`p-4 rounded-xl border-2 cursor-pointer ${selectedCourt?.id === court.id ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-800 border-gray-700 hover:border-emerald-500/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${selectedCourt?.id === court.id ? 'bg-emerald-500' : 'bg-gray-700'}`}>🏟️</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{court.name}</h4>
                          <p className="text-sm text-gray-400 capitalize">{court.sport} • {court.surface}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-400">${Math.round(court.pricePerHour * (selectedDuration / 60))}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-8 text-gray-500">No hay canchas disponibles</div>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
          <button onClick={goToPrevStep} disabled={currentStep === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm ${currentStep === 1 ? 'opacity-0' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          {currentStep === 5 && selectedCourt ? (
            <button onClick={handleBooking} className="px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500">
              {!isAuthenticated ? 'Iniciar sesión' : 'Confirmar'}
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Design Variant Tabs */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-medium hidden sm:block">{establishment.name}</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {(['A', 'B', 'C'] as const).map((variant) => (
              <button
                key={variant}
                onClick={() => setDesignVariant(variant)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  designVariant === variant
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Diseño {variant}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFavorite(!isFavorite)} className={`p-2 rounded-lg ${isFavorite ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-lg bg-gray-800 text-gray-400"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="pt-16">
        {/* DESIGN A: Two Column Layout (Airbnb style) */}
        {designVariant === 'A' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column - Info */}
              <div className="lg:col-span-3 space-y-6">
                {/* Gallery */}
                <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[400px]">
                  <div className="col-span-2 row-span-2">
                    <img src={mainImage} alt={establishment.name} className="w-full h-full object-cover" />
                  </div>
                  {images.slice(1, 5).map((img: string, idx: number) => (
                    <div key={idx} className="bg-gray-800">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{establishment.name}</h1>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{establishment.rating || '4.5'}</span>
                      </div>
                      <span className="text-gray-400">({establishment.reviewCount || 0} reseñas)</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{establishment.address}, {establishment.city}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { icon: Timer, label: 'Canchas', value: `${establishment.courts?.length || 0}` },
                      { icon: Clock, label: 'Horario', value: '8 - 23hs' },
                      { icon: Users, label: 'Deportes', value: `${availableSports.length}` },
                      { icon: CreditCard, label: 'Pago', value: 'Online' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gray-900 rounded-xl p-3 border border-gray-800 text-center">
                        <item.icon className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-400">{item.label}</div>
                        <div className="text-white font-semibold text-sm">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-800 pt-4">
                    <h2 className="text-lg font-semibold text-white mb-2">Sobre el establecimiento</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {establishment.description || 'Moderno complejo deportivo con instalaciones de primera calidad.'}
                    </p>
                  </div>

                  {/* Amenities */}
                  {establishment.amenities && establishment.amenities.length > 0 && (
                    <div className="border-t border-gray-800 pt-4">
                      <h2 className="text-lg font-semibold text-white mb-3">Servicios</h2>
                      <div className="flex flex-wrap gap-2">
                        {establishment.amenities.slice(0, 6).map((amenity: string, idx: number) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-800 rounded-full text-sm text-gray-300">{amenity}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Sticky Booking Form */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-24">
                  <BookingForm compact />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DESIGN B: Compact Hero + Prominent Form */}
        {designVariant === 'B' && (
          <div>
            {/* Compact Hero */}
            <div className="relative h-[30vh] overflow-hidden">
              <img src={mainImage} alt={establishment.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{establishment.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{establishment.rating || '4.5'}</span>
                    </div>
                    <span className="text-gray-300">{establishment.address}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-300">{establishment.courts?.length || 0} canchas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Form First */}
            <div className="max-w-4xl mx-auto px-4 py-8">
              <BookingForm />

              {/* Secondary Info in Tabs/Accordion */}
              <div className="mt-8 space-y-4">
                <details className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
                  <summary className="p-4 cursor-pointer flex items-center justify-between text-white font-medium">
                    <span>Sobre el establecimiento</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="p-4 pt-0 text-gray-400 text-sm">
                    {establishment.description || 'Moderno complejo deportivo con instalaciones de primera calidad.'}
                  </div>
                </details>

                <details className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
                  <summary className="p-4 cursor-pointer flex items-center justify-between text-white font-medium">
                    <span>Servicios y amenities</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="p-4 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {(establishment.amenities || ['Estacionamiento', 'WiFi', 'Vestuarios']).map((amenity: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-gray-800 rounded-full text-sm text-gray-300">{amenity}</span>
                      ))}
                    </div>
                  </div>
                </details>

                <details className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
                  <summary className="p-4 cursor-pointer flex items-center justify-between text-white font-medium">
                    <span>Ubicación</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="p-4 pt-0">
                    <div className="h-40 bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                        <p className="text-gray-400 text-sm">{establishment.address}, {establishment.city}</p>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* DESIGN C: Fullscreen Checkout Flow */}
        {designVariant === 'C' && (
          <div className="min-h-[calc(100vh-4rem)] flex flex-col">
            {/* Mini Header with Establishment Info */}
            <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
              <div className="max-w-3xl mx-auto flex items-center gap-4">
                <img src={mainImage} alt="" className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-white truncate">{establishment.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Star className="w-3 h-3 text-emerald-400 fill-current" />
                    <span>{establishment.rating || '4.5'}</span>
                    <span>•</span>
                    <span className="truncate">{establishment.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${getPrice()}</div>
                  <div className="text-xs text-gray-400">total</div>
                </div>
              </div>
            </div>

            {/* Fullscreen Form */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  {/* Progress Steps */}
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      {['Deporte', 'Fecha', 'Duración', 'Hora', 'Cancha'].map((step, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            idx + 1 < currentStep ? 'bg-emerald-500 text-white' :
                            idx + 1 === currentStep ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500' :
                            'bg-gray-800 text-gray-500'
                          }`}>
                            {idx + 1 < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          {idx < 4 && <div className={`w-8 md:w-16 h-0.5 mx-1 ${idx + 1 < currentStep ? 'bg-emerald-500' : 'bg-gray-700'}`} />}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      {['Deporte', 'Fecha', 'Duración', 'Hora', 'Cancha'].map((step, idx) => (
                        <span key={idx} className={`${idx + 1 === currentStep ? 'text-emerald-400' : ''}`}>{step}</span>
                      ))}
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-6 min-h-[350px]">
                    <AnimatePresence mode="wait">
                      {currentStep === 1 && (
                        <motion.div key="c1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                          <h2 className="text-2xl font-bold text-white text-center">¿Qué deporte querés jugar?</h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableSports.map((sport) => {
                              const icons: Record<string, string> = { 'futbol': '⚽', 'padel': '🎾', 'tenis': '🎾', 'basquet': '🏀' };
                              return (
                                <button key={sport} onClick={() => { setSelectedSport(sport); setCurrentStep(2); }}
                                  className={`p-6 rounded-2xl border-2 text-center transition-all ${selectedSport === sport ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-800 border-gray-700 hover:border-emerald-500/50'}`}>
                                  <div className="text-4xl mb-2">{icons[sport.toLowerCase()] || '🏟️'}</div>
                                  <div className="text-lg font-semibold text-white capitalize">{sport}</div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                      {currentStep === 2 && (
                        <motion.div key="c2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                          <h2 className="text-2xl font-bold text-white text-center">¿Qué día?</h2>
                          <div className="grid grid-cols-7 gap-2">
                            {dates.map((date) => (
                              date.isEmpty ? <div key={date.value} /> : (
                                <button key={date.value} onClick={() => { setSelectedDate(date.value); setCurrentStep(3); }}
                                  className={`relative p-3 rounded-xl border-2 text-center ${selectedDate === date.value ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 hover:border-emerald-500/50 text-gray-300'}`}>
                                  {date.isToday && <span className="absolute top-1 right-1 text-[7px] px-1 bg-emerald-500/20 text-emerald-400 rounded">Hoy</span>}
                                  <div className="text-xs opacity-70">{date.dayName}</div>
                                  <div className="text-xl font-bold">{date.dayNumber}</div>
                                  <div className="text-xs opacity-70">{date.month}</div>
                                </button>
                              )
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {currentStep === 3 && (
                        <motion.div key="c3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                          <h2 className="text-2xl font-bold text-white text-center">¿Cuánto tiempo?</h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[{ v: 60, l: '1h' }, { v: 90, l: '1:30h' }, { v: 120, l: '2h' }, { v: 150, l: '2:30h' }].map((d) => (
                              <button key={d.v} onClick={() => { setSelectedDuration(d.v); setCurrentStep(4); }}
                                className={`p-6 rounded-2xl border-2 ${selectedDuration === d.v ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-800 border-gray-700 hover:border-emerald-500/50'}`}>
                                <div className="text-3xl font-bold text-white">{d.l}</div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {currentStep === 4 && (
                        <motion.div key="c4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                          <h2 className="text-2xl font-bold text-white text-center">¿A qué hora?</h2>
                          {loadingSlots ? (
                            <div className="flex justify-center py-12"><div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
                          ) : (
                            <div className="grid grid-cols-5 md:grid-cols-8 gap-2">
                              {availableSlots.map((slot) => (
                                <button key={slot.time} onClick={() => { if (slot.available) { setSelectedTime(slot.time); setCurrentStep(5); } }} disabled={!slot.available}
                                  className={`py-3 rounded-xl font-medium ${selectedTime === slot.time ? 'bg-emerald-500 text-white' : slot.available ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-800/30 text-gray-600 line-through'}`}>
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                      {currentStep === 5 && (
                        <motion.div key="c5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                          <h2 className="text-2xl font-bold text-white text-center">Elegí tu cancha</h2>
                          <div className="space-y-3">
                            {availableCourtsAtTime.map((court) => (
                              <div key={court.id} onClick={() => setSelectedCourt(court)}
                                className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center gap-4 ${selectedCourt?.id === court.id ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-800 border-gray-700 hover:border-emerald-500/50'}`}>
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${selectedCourt?.id === court.id ? 'bg-emerald-500' : 'bg-gray-700'}`}>🏟️</div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-white">{court.name}</h4>
                                  <p className="text-sm text-gray-400">{court.sport} • {court.surface}</p>
                                </div>
                                <div className="text-xl font-bold text-emerald-400">${Math.round(court.pricePerHour * (selectedDuration / 60))}</div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-800 flex items-center justify-between">
                    <button onClick={goToPrevStep} disabled={currentStep === 1}
                      className={`px-6 py-3 rounded-xl font-medium ${currentStep === 1 ? 'opacity-0' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                      ← Anterior
                    </button>
                    {currentStep === 5 && selectedCourt && (
                      <button onClick={handleBooking}
                        className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg">
                        Confirmar reserva →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }} />
      <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }} />
    </div>
  );
};

export default BookingPage;
