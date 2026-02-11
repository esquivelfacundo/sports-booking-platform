'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEstablishmentDetails } from '@/hooks/useEstablishmentDetails';
import { apiClient } from '@/lib/api';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModalWithEmail from '@/components/auth/RegisterModalWithEmail';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  Check,
  X,
  ChevronDown,
  ChevronUp,
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
  Trophy,
  Menu,
  Home,
  Search,
  LogOut,
  Settings,
  User,
  Bell,
  Lock,
  Loader2,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  availableCourtIds?: string[]; // Track which courts are available at this time
}

interface PriceSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  pricePerHour: string;
  daysOfWeek: number[];
  isActive: boolean;
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
  priceSchedules?: PriceSchedule[];
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
  // Open/Closed status
  isOpen?: boolean;
}

const BookingPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, logout } = useAuth();
  const idOrSlug = params.id as string;
  
  // Check if it's a UUID or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  const { establishment, loading, error } = useEstablishmentDetails({
    establishmentId: isUUID ? idOrSlug : undefined,
    slug: !isUUID ? idOrSlug : undefined,
    autoFetch: true
  }) as { establishment: EstablishmentData | null; loading: boolean; error: string | null };

  // State initialization - will be restored from sessionStorage in useEffect
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [customDuration, setCustomDuration] = useState<number>(60);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isEstablishmentInfoExpanded, setIsEstablishmentInfoExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [userFavorites, setUserFavorites] = useState<Array<{ id: string; name: string; slug: string; image?: string }>>([]);
  const [hasRestoredState, setHasRestoredState] = useState(false);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 5;
  
  // Restore state from sessionStorage on client-side hydration
  useEffect(() => {
    if (typeof window === 'undefined' || hasRestoredState) return;
    
    const saved = sessionStorage.getItem(`booking_state_${idOrSlug}`);
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        console.log('📦 Restoring booking state:', savedState);
        
        if (savedState.selectedSport) setSelectedSport(savedState.selectedSport);
        if (savedState.selectedDuration) setSelectedDuration(savedState.selectedDuration);
        if (savedState.customDuration) setCustomDuration(savedState.customDuration);
        if (savedState.showCustomDuration) setShowCustomDuration(savedState.showCustomDuration);
        if (savedState.selectedDate) setSelectedDate(savedState.selectedDate);
        if (savedState.selectedTime) setSelectedTime(savedState.selectedTime);
        if (savedState.selectedCourt) setSelectedCourt(savedState.selectedCourt);
        if (savedState.currentStep) setCurrentStep(savedState.currentStep);
        
        setHasRestoredState(true);
      } catch (e) {
        console.error('Error restoring booking state:', e);
        setHasRestoredState(true);
      }
    } else {
      setHasRestoredState(true);
    }
  }, [idOrSlug, hasRestoredState]);
  
  // Save booking state to sessionStorage whenever it changes (only after initial restoration)
  useEffect(() => {
    if (typeof window === 'undefined' || !hasRestoredState) return;
    
    const stateToSave = {
      selectedDate,
      selectedCourt,
      selectedTime,
      selectedDuration,
      customDuration,
      showCustomDuration,
      selectedSport,
      currentStep
    };
    sessionStorage.setItem(`booking_state_${idOrSlug}`, JSON.stringify(stateToSave));
  }, [selectedDate, selectedCourt, selectedTime, selectedDuration, customDuration, showCustomDuration, selectedSport, currentStep, idOrSlug, hasRestoredState]);
  
  // Clear saved state in specific scenarios
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const hasPaymentParams = urlParams.get('payment_id') || urlParams.get('collection_id');
    const hasSuccessParam = urlParams.get('payment_success') === 'true';
    
    // Clear state if payment was completed
    if (hasPaymentParams || hasSuccessParam) {
      sessionStorage.removeItem(`booking_state_${idOrSlug}`);
    }
  }, [idOrSlug]);
  
  // Local state for custom duration to avoid re-renders
  const [tempCustomDuration, setTempCustomDuration] = useState(150);
  
  // Sidebar state - same as admin dashboard
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Payment state (for step 5)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  // Pre-fill WhatsApp number from user's phone if available
  useEffect(() => {
    if (user?.phone && !whatsappNumber) {
      let phone = user.phone.replace(/[^\d]/g, '');
      // Strip leading 54 (country code)
      if (phone.startsWith('54')) phone = phone.substring(2);
      // Strip leading 9 (mobile prefix)
      if (phone.startsWith('9') && phone.length > 10) phone = phone.substring(1);
      setWhatsappNumber(phone);
    }
  }, [user?.phone]);
  
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');
  const [depositInfo, setDepositInfo] = useState({
    required: true,
    type: 'percentage' as 'percentage' | 'fixed',
    percent: 50,
    baseAmount: 0,
    fee: 0,
    generalFee: 0,
    totalAmount: 0,
    remainingAmount: 0
  });
  const [fullPaymentInfo, setFullPaymentInfo] = useState({
    enabled: false,
    baseAmount: 0,
    fee: 0,
    generalFee: 0,
    totalAmount: 0,
    remainingAmount: 0
  });
  const [feeDiscount, setFeeDiscount] = useState({
    hasDiscount: false,
    generalFeePercent: 10,
    generalFee: 0,
    discountPercent: 0,
    actualFee: 0
  });
  const [pendingDebt, setPendingDebt] = useState({
    hasDebt: false,
    totalDebt: 0,
    debts: [] as Array<{ id: string; amount: number; reason: string; description: string }>
  });
  
  // Dynamic price calculation state (for time-based pricing)
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<Array<{ scheduleName: string; minutes: number; amount: number }>>([]);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [courtPrices, setCourtPrices] = useState<Record<string, number>>({});
  
  // Step navigation helpers (new order: 1.Deporte, 2.Duración, 3.Fecha+Hora, 4.Cancha, 5.Resumen)
  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!selectedSport;
      case 2: return !!selectedDuration;
      case 3: return !!selectedDate && !!selectedTime;
      case 4: return !!selectedCourt;
      case 5: return true; // Summary step - always can proceed to payment
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
  const filteredCourts = useMemo(() => 
    establishment?.courts?.filter(court => 
      selectedSport === 'all' || court.sport === selectedSport
    ) || []
  , [establishment?.courts, selectedSport]);

  // Get courts available at the selected time (memoized to avoid infinite render loops)
  const availableCourtsAtTime = useMemo(() => {
    if (!selectedTime) return [];
    const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
    if (!selectedSlot?.availableCourtIds?.length) return [];
    
    // Filter courts that are available at this time AND match the sport filter
    return filteredCourts.filter(court => 
      selectedSlot.availableCourtIds?.includes(court.id)
    );
  }, [selectedTime, availableSlots, filteredCourts]);

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

  // Set default date to today when entering step 3
  useEffect(() => {
    if (currentStep === 3 && !selectedDate && dates.length > 0) {
      // Find first non-empty date
      const firstValidDate = dates.find(d => !d.isEmpty);
      if (firstValidDate) {
        setSelectedDate(firstValidDate.value);
      }
    }
  }, [currentStep, dates, selectedDate]);

  // Fetch user favorites and check if current establishment is favorite
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !user) {
        setUserFavorites([]);
        setIsFavorite(false);
        return;
      }
      try {
        const response = await apiClient.get('/api/favorites') as any;
        if (response && response.data) {
          setUserFavorites(response.data.map((fav: any) => ({
            id: fav.id,
            name: fav.name,
            slug: fav.slug || fav.id,
            image: fav.images?.[0]
          })));
          // Check if current establishment is in favorites
          const currentIsFavorite = response.data.some((fav: any) => 
            fav.id === establishment?.id
          );
          setIsFavorite(currentIsFavorite);
        } else {
          setUserFavorites([]);
          setIsFavorite(false);
        }
      } catch (err) {
        // Silently handle error - user might not have favorites endpoint access
        console.log('Could not fetch favorites (this is normal if not logged in)');
        setUserFavorites([]);
        setIsFavorite(false);
      }
    };
    fetchFavorites();
  }, [isAuthenticated, user, establishment?.id]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!establishment?.id) return;
    
    try {
      if (isFavorite) {
        await apiClient.delete(`/api/favorites/${establishment.id}`);
        setUserFavorites(prev => prev.filter(f => f.id !== establishment.id));
        setIsFavorite(false);
      } else {
        await apiClient.post('/api/favorites', { establishmentId: establishment.id });
        setUserFavorites(prev => [...prev, {
          id: establishment.id,
          name: establishment.name,
          slug: establishment.slug || establishment.id,
          image: establishment.images?.[0]
        }]);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

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

      // Generate time slots based on establishment opening hours
      const dayOfWeek = new Date(selectedDate + 'T00:00:00').getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek];
      const daySchedule = establishment?.openingHours?.[dayName];
      
      let openHour = 8;
      let closeHour = 23;
      if (daySchedule && !daySchedule.closed) {
        openHour = parseInt(daySchedule.open?.split(':')[0] || '8');
        closeHour = parseInt(daySchedule.close?.split(':')[0] || '23');
        if (closeHour <= openHour) closeHour += 24;
      }
      
      // Compute next day date string for post-midnight slots
      const crossesMidnight = closeHour > 24;
      let nextDateStr = selectedDate;
      if (crossesMidnight) {
        const nextDay = new Date(selectedDate + 'T00:00:00');
        nextDay.setDate(nextDay.getDate() + 1);
        nextDateStr = nextDay.toISOString().split('T')[0];
      }
      
      // Helper to get the actual date for a slot
      const getSlotActualDate = (time: string): string => {
        if (!crossesMidnight) return selectedDate;
        const [h] = time.split(':').map(Number);
        return h < (closeHour - 24) ? nextDateStr : selectedDate;
      };
      
      const slots: Map<string, string[]> = new Map();
      for (let hour = openHour; hour < closeHour; hour++) {
        const displayHour = hour % 24;
        slots.set(`${displayHour.toString().padStart(2, '0')}:00`, []);
        slots.set(`${displayHour.toString().padStart(2, '0')}:30`, []);
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
      
      // Convert to array - preserve insertion order (which follows opening hours)
      const slotsArray: TimeSlot[] = Array.from(slots.entries())
        .map(([time, courtIds]) => ({
          time,
          // Slot is available only if: has courts AND is bookable (not in past, respects min advance)
          // Use the actual date for the slot (next day for post-midnight slots)
          available: courtIds.length > 0 && isSlotBookable(time, getSlotActualDate(time)),
          price: courtsToCheck[0]?.pricePerHour || 2500,
          availableCourtIds: courtIds // Store which courts are available at this time
        }));
      
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
        // If close is before or equal to open, it crosses midnight
        if (endHour <= startHour) endHour += 24;
      }
    }
    
    const durationHours = selectedDuration / 60;
    
    // Compute next day date string for post-midnight slots
    const fbCrossesMidnight = endHour > 24;
    let fbNextDateStr = selectedDate;
    if (fbCrossesMidnight) {
      const nextDay = new Date(selectedDate + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      fbNextDateStr = nextDay.toISOString().split('T')[0];
    }
    
    for (let hour = startHour; hour <= endHour - durationHours; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotEndHour = hour + (minute + selectedDuration) / 60;
        if (slotEndHour > endHour) continue;
        
        const displayHour = hour % 24;
        const time = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const fbSlotDate = (fbCrossesMidnight && displayHour < (endHour - 24)) ? fbNextDateStr : selectedDate;
        slots.push({
          time,
          available: isSlotBookable(time, fbSlotDate),
          price: 2500
        });
      }
    }
    
    setAvailableSlots(slots);
  };

  // Track previous values to detect actual user changes vs initial load
  const prevDateRef = useRef<string | null>(null);
  const prevDurationRef = useRef<number | null>(null);
  const prevSportRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  
  // Update slots when date, duration, or sport changes
  useEffect(() => {
    if (selectedDate && selectedDuration && establishment?.courts?.length) {
      // Only reset time/court if user CHANGED the values (not on initial load or login)
      const dateChanged = prevDateRef.current !== null && prevDateRef.current !== selectedDate;
      const durationChanged = prevDurationRef.current !== null && prevDurationRef.current !== selectedDuration;
      const sportChanged = prevSportRef.current !== null && prevSportRef.current !== selectedSport;
      
      // If user changed date, duration, or sport - reset time and court
      if (isInitializedRef.current && (dateChanged || durationChanged || sportChanged)) {
        setSelectedTime('');
        setSelectedCourt(null);
      }
      
      // Update refs
      prevDateRef.current = selectedDate;
      prevDurationRef.current = selectedDuration;
      prevSportRef.current = selectedSport;
      isInitializedRef.current = true;
      
      fetchAvailability();
    }
  }, [selectedDate, selectedDuration, selectedSport, fetchAvailability]);

  // Calculate end time based on start time and duration
  const getEndTime = useCallback(() => {
    if (!selectedTime) return '';
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + selectedDuration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }, [selectedTime, selectedDuration]);

  // Get the actual booking date (adjusts for post-midnight slots)
  const getActualBookingDate = useCallback((): string => {
    if (!selectedDate || !selectedTime || !establishment?.openingHours) return selectedDate;
    const dayOfWeek = new Date(selectedDate + 'T00:00:00').getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const daySchedule = establishment.openingHours[dayName];
    if (!daySchedule || daySchedule.closed) return selectedDate;
    
    const openH = parseInt(daySchedule.open?.split(':')[0] || '8');
    let closeH = parseInt(daySchedule.close?.split(':')[0] || '23');
    if (closeH <= openH) closeH += 24;
    
    if (closeH <= 24) return selectedDate; // No midnight crossing
    
    const [slotH] = selectedTime.split(':').map(Number);
    if (slotH < (closeH - 24)) {
      // Post-midnight slot — actual date is next day
      const nextDay = new Date(selectedDate + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    }
    return selectedDate;
  }, [selectedDate, selectedTime, establishment?.openingHours]);

  // Fetch dynamic price from backend based on time schedules
  const fetchDynamicPrice = useCallback(async () => {
    if (!selectedCourt || !selectedDate || !selectedTime) {
      setCalculatedPrice(null);
      setPriceBreakdown([]);
      return;
    }
    
    setIsCalculatingPrice(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const endTime = getEndTime();
      const response = await fetch(
        `${API_URL}/api/courts/${selectedCourt.id}/calculate-price?startTime=${selectedTime}&endTime=${endTime}&date=${getActualBookingDate()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setCalculatedPrice(data.totalPrice);
        setPriceBreakdown(data.breakdown || []);
      } else {
        // Fallback to simple calculation
        setCalculatedPrice(null);
        setPriceBreakdown([]);
      }
    } catch (err) {
      console.error('Error fetching dynamic price:', err);
      setCalculatedPrice(null);
      setPriceBreakdown([]);
    } finally {
      setIsCalculatingPrice(false);
    }
  }, [selectedCourt, selectedDate, selectedTime, getEndTime, getActualBookingDate]);

  // Fetch price when court, date, time or duration changes
  useEffect(() => {
    if (selectedCourt && selectedDate && selectedTime) {
      fetchDynamicPrice();
    }
  }, [selectedCourt, selectedDate, selectedTime, selectedDuration, fetchDynamicPrice]);

  // Calculate prices for all available courts when entering step 4
  useEffect(() => {
    const calculateCourtPrices = async () => {
      if (currentStep !== 4 || !selectedDate || !selectedTime || availableCourtsAtTime.length === 0) {
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + selectedDuration;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      const prices: Record<string, number> = {};
      
      for (const court of availableCourtsAtTime) {
        try {
          const response = await fetch(
            `${API_URL}/api/courts/${court.id}/calculate-price?startTime=${selectedTime}&endTime=${endTime}&date=${selectedDate}`
          );
          if (response.ok) {
            const data = await response.json();
            prices[court.id] = data.totalPrice;
          }
        } catch (err) {
          console.error(`Error calculating price for court ${court.id}:`, err);
        }
      }
      
      setCourtPrices(prices);
    };

    calculateCourtPrices();
  }, [currentStep, selectedDate, selectedTime, selectedDuration, availableCourtsAtTime]);

  // Slot prices feature removed per user request

  // Helper to get price display for a court (range or single)
  const getCourtPriceDisplay = (court: Court, forSpecificTime: boolean = false) => {
    // If we have a calculated price for this court in step 4, use it
    if (courtPrices[court.id]) {
      return `$${courtPrices[court.id].toLocaleString('es-AR')}`;
    }
    
    // If we're in step 4 and prices are being calculated, show loading
    if (currentStep === 4 && Object.keys(courtPrices).length === 0) {
      return 'Calculando...';
    }
    
    // If we have a specific time selected and we're in step 4, show calculated price
    if (forSpecificTime && selectedTime && calculatedPrice !== null && selectedCourt?.id === court.id) {
      return `$${calculatedPrice.toLocaleString('es-AR')}`;
    }
    
    if (court.priceSchedules && court.priceSchedules.length > 0) {
      const activeSchedules = court.priceSchedules.filter(s => s.isActive);
      if (activeSchedules.length > 0) {
        const prices = activeSchedules.map(s => parseFloat(s.pricePerHour));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const priceForDuration = (price: number) => Math.round(price * (selectedDuration / 60));
        
        if (minPrice === maxPrice) {
          return `$${priceForDuration(minPrice).toLocaleString('es-AR')}`;
        }
        return `$${priceForDuration(minPrice).toLocaleString('es-AR')} - $${priceForDuration(maxPrice).toLocaleString('es-AR')}`;
      }
    }
    // Fallback to base price
    return `$${Math.round(court.pricePerHour * (selectedDuration / 60)).toLocaleString('es-AR')}`;
  };

  const getPrice = () => {
    // Use calculated price from backend if available
    if (calculatedPrice !== null) return calculatedPrice;
    // Fallback to simple calculation
    if (!selectedCourt) return 0;
    const hourlyRate = selectedCourt.pricePerHour;
    return Math.round(hourlyRate * (selectedDuration / 60));
  };

  // Fetch fee and deposit info when entering step 5
  useEffect(() => {
    const fetchFeeAndDeposit = async () => {
      if (currentStep !== 5 || !selectedCourt || !establishment?.id) return;
      
      const price = getPrice();
      if (price <= 0) return;
      
      setIsLoadingFee(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const clientEmail = user?.email || '';
        const response = await fetch(`${API_URL}/api/mp/payments/calculate-fee?amount=${price}&establishmentId=${establishment.id}&clientEmail=${encodeURIComponent(clientEmail)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.deposit) {
            setDepositInfo(data.deposit);
          }
          if (data.fullPayment) {
            setFullPaymentInfo(data.fullPayment);
          }
          if (data.pendingDebt) {
            setPendingDebt(data.pendingDebt);
          }
          if (data.feeDiscount) {
            setFeeDiscount(data.feeDiscount);
          }
        }
      } catch (err) {
        console.error('Error fetching fee and deposit:', err);
      } finally {
        setIsLoadingFee(false);
      }
    };
    
    fetchFeeAndDeposit();
  }, [currentStep, selectedCourt, establishment?.id, user?.email, calculatedPrice]);

  // Handle payment - redirect to Mercado Pago
  const handlePayment = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    if (!selectedDate || !selectedTime || !selectedCourt || !establishment) {
      setPaymentError('Datos de reserva incompletos');
      return;
    }
    
    setPaymentError('');
    
    const price = getPrice();
    const isFullPayment = paymentType === 'full';
    const selectedPaymentInfo = isFullPayment ? fullPaymentInfo : depositInfo;
    const basePaymentAmount = selectedPaymentInfo.totalAmount;
    const debtAmount = pendingDebt.hasDebt ? pendingDebt.totalDebt : 0;
    const paymentAmount = basePaymentAmount + debtAmount;
    
    if (paymentAmount <= 0) {
      setPaymentError('Error: No se pudo calcular el monto a pagar');
      return;
    }
    
    setIsProcessingPayment(true);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const token = localStorage.getItem('auth_token');
      const endTime = getEndTime();
      
      let paymentTitle = isFullPayment 
        ? `Pago completo - ${selectedCourt.name} (${establishment.name})`
        : `Seña - ${selectedCourt.name} (${establishment.name})`;
      let paymentDescription = isFullPayment
        ? `Pago completo - ${formatSelectedDate()} de ${selectedTime} a ${endTime}`
        : `Seña ${depositInfo.percent}% - ${formatSelectedDate()} de ${selectedTime} a ${endTime}`;
      
      if (debtAmount > 0) {
        paymentTitle += ' + Deuda';
        paymentDescription += ` + Deuda acumulada: $${debtAmount.toLocaleString('es-AR')}`;
      }
      
      const response = await fetch(`${API_URL}/api/mp/payments/create-split-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          establishmentId: establishment.id,
          items: [{
            title: paymentTitle,
            description: paymentDescription,
            quantity: 1,
            unit_price: paymentAmount,
            currency_id: 'ARS'
          }],
          payer: {
            email: user?.email || '',
            name: user?.firstName || '',
            surname: user?.lastName || ''
          },
          metadata: {
            courtId: selectedCourt.id,
            establishmentId: establishment.id,
            date: getActualBookingDate(),
            startTime: selectedTime,
            endTime,
            duration: selectedDuration,
            fullPrice: price,
            paymentType: isFullPayment ? 'full' : 'deposit',
            depositBaseAmount: isFullPayment ? price : depositInfo.baseAmount,
            depositFee: selectedPaymentInfo.fee,
            depositTotal: basePaymentAmount,
            depositPercent: isFullPayment ? 100 : depositInfo.percent,
            remainingAmount: selectedPaymentInfo.remainingAmount,
            debtAmount: debtAmount,
            debtIds: pendingDebt.debts.map(d => d.id),
            clientName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || user?.email || ''),
            clientEmail: user?.email || '',
            clientPhone: whatsappNumber ? `+54${whatsappNumber}` : (user?.phone || ''),
            userId: user?.id || ''
          },
          back_urls: {
            success: `${window.location.origin}/reservar/confirmacion`,
            failure: `${window.location.origin}/reservar/${idOrSlug}?error=payment_failed`,
            pending: `${window.location.origin}/reservar/confirmacion?status=pending`
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear preferencia de pago');
      }
      
      const data = await response.json();
      const checkoutUrl = data.preference?.initPoint || data.preference?.init_point || data.init_point || data.initPoint;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No se recibió URL de pago');
      }
      
    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Error al procesar el pago. Intenta nuevamente.');
      setIsProcessingPayment(false);
    }
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

  // Shared booking form render function (NOT a component — avoids remount on every state change)
  const renderBookingForm = (compact = false) => (
    <div className="bg-white dark:bg-gray-900 flex flex-col h-full min-h-[calc(100vh-56px)] lg:min-h-0 lg:h-auto lg:relative">
      {/* Booking Header with Progress */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 dark:from-emerald-500/10 dark:to-cyan-500/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reservar cancha</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Paso {currentStep} de {TOTAL_STEPS}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">${getPrice()}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
            <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all ${idx + 1 <= currentStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
      </div>

      {/* Content area - flex-1 to fill available space */}
      <div className={`p-4 flex-1 overflow-y-auto pb-24 lg:pb-4 ${compact ? 'max-h-[60vh]' : ''}`}>
        <AnimatePresence mode="wait">
          {/* Step 1: Sport Selection */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">¿Qué deporte querés jugar?</h3>
              </div>
              <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-3 gap-4'}`}>
                {availableSports.map((sport) => {
                  const sportImages: Record<string, string> = { 
                    'futbol': '/assets/sports/futbol.jpg', 
                    'padel': '/assets/sports/padel.jpg', 
                    'paddle': '/assets/sports/padel.jpg', 
                    'tenis': '/assets/sports/tenis.jpg',
                    'basquet': '/assets/sports/futbol.jpg',
                    'voley': '/assets/sports/futbol.jpg'
                  };
                  const sportImage = sportImages[sport.toLowerCase()] || '/assets/sports/futbol.jpg';
                  const courtCount = establishment?.courts?.filter(c => c.sport === sport).length || 0;
                  const displayName = sport.toLowerCase() === 'paddle' ? 'Padel' : sport;
                  return (
                    <button key={sport} onClick={() => { setSelectedSport(sport); setCurrentStep(2); }}
                      className={`relative h-28 rounded-xl overflow-hidden transition-all ${
                        selectedSport === sport 
                          ? 'ring-3 ring-emerald-500 ring-offset-2 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}>
                      <img src={sportImage} alt={displayName} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                        <div className="font-bold text-white capitalize text-base leading-tight">{displayName}</div>
                        <div className="text-xs text-white/80">{courtCount} canchas</div>
                      </div>
                      {selectedSport === sport && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Duration */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-4"><h3 className="text-xl font-bold text-gray-900 dark:text-white">¿Cuánto tiempo?</h3></div>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 60, label: '1 hora' }, { value: 90, label: '1:30 hs' }, { value: 120, label: '2 horas' }].map((d) => (
                  <button key={d.value} onClick={() => { setSelectedDuration(d.value); setShowCustomDuration(false); setCurrentStep(3); }}
                    className={`p-4 rounded-xl border-2 text-center ${selectedDuration === d.value && !showCustomDuration ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-500/50'}`}>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{d.label}</div>
                  </button>
                ))}
                <button onClick={() => { setShowCustomDuration(!showCustomDuration); if (!showCustomDuration) setTempCustomDuration(150); }}
                  className={`p-4 rounded-xl border-2 text-center ${showCustomDuration ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-500/50'}`}>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">Otro</div>
                </button>
              </div>
              {showCustomDuration && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button onClick={() => setTempCustomDuration(Math.max(150, tempCustomDuration - 30))} disabled={tempCustomDuration <= 150} className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">-</button>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.floor(tempCustomDuration / 60)}:{String(tempCustomDuration % 60).padStart(2, '0')}</span>
                    <button onClick={() => setTempCustomDuration(Math.min(480, tempCustomDuration + 30))} className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">+</button>
                  </div>
                  <button onClick={() => { setSelectedDuration(tempCustomDuration); setCurrentStep(3); }} className="w-full py-2 rounded-lg bg-emerald-500 text-white font-medium">Confirmar</button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Date + Time */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-4"><h3 className="text-xl font-bold text-gray-900 dark:text-white">Fecha y hora</h3></div>
              
              {/* Date selector - horizontal scroll */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {dates.map((date) => (
                  date.isEmpty ? null : (
                    <button key={date.value} onClick={() => setSelectedDate(date.value)}
                      className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border-2 transition-all min-w-[56px] ${
                        selectedDate === date.value 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500/50'
                      }`}>
                      <span className="text-[10px] opacity-70 uppercase">{date.dayName}</span>
                      <span className="text-base font-bold">{date.dayNumber}</span>
                      <span className="text-[10px] opacity-70">{date.month}</span>
                    </button>
                  )
                ))}
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Horarios disponibles para el {formatSelectedDate()}</p>
                  {loadingSlots ? (
                    <div className="text-center py-6"><div className="w-8 h-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button key={slot.time} onClick={() => { if (slot.available) { setSelectedTime(slot.time); setCurrentStep(4); } }} disabled={!slot.available}
                          className={`py-2 px-1 rounded-lg text-xs font-medium ${selectedTime === slot.time ? 'bg-emerald-500 text-white' : slot.available ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30' : 'bg-gray-100/50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-600 line-through'}`}>
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : <div className="text-center py-6 text-gray-500">No hay horarios disponibles</div>}
                </div>
              )}
              
              {!selectedDate && (
                <p className="text-center text-gray-500 py-4">Seleccioná una fecha para ver los horarios</p>
              )}
            </motion.div>
          )}

          {/* Step 4: Court */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-4"><h3 className="text-xl font-bold text-gray-900 dark:text-white">Elegí tu cancha</h3></div>
              {availableCourtsAtTime.length > 0 ? (
                <div className="space-y-3">
                  {availableCourtsAtTime.map((court) => (
                    <div key={court.id} onClick={async () => { 
                      setSelectedCourt(court);
                      // Calculate price before advancing
                      if (selectedDate && selectedTime) {
                        setIsCalculatingPrice(true);
                        try {
                          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
                          const endTime = getEndTime();
                          const response = await fetch(
                            `${API_URL}/api/courts/${court.id}/calculate-price?startTime=${selectedTime}&endTime=${endTime}&date=${selectedDate}`
                          );
                          if (response.ok) {
                            const data = await response.json();
                            setCalculatedPrice(data.totalPrice);
                            setPriceBreakdown(data.breakdown || []);
                          }
                        } catch (err) {
                          console.error('Error calculating price:', err);
                        } finally {
                          setIsCalculatingPrice(false);
                        }
                      }
                      setCurrentStep(5);
                    }}
                      className={`p-4 rounded-xl border-2 cursor-pointer ${selectedCourt?.id === court.id ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-500/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${selectedCourt?.id === court.id ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>🏟️</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{court.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{court.sport} • {court.surface}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-500">{getCourtPriceDisplay(court)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-8 text-gray-500">No hay canchas disponibles</div>}
            </motion.div>
          )}

          {/* Step 5: Summary & Payment */}
          {currentStep === 5 && selectedCourt && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-2"><h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirmar y pagar</h3></div>
              
              {/* Booking details card */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Establecimiento</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{establishment?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cancha</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedCourt.name} • <span className="capitalize">{selectedCourt.sport}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fecha y hora</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm capitalize">{formatSelectedDate()} • {selectedTime} - {getEndTime()}</p>
                  </div>
                </div>
              </div>

              {/* Pending Debt Alert */}
              {pendingDebt.hasDebt && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-orange-400 font-medium text-sm">Deuda acumulada</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        Tenés una deuda pendiente de <span className="text-orange-400 font-semibold">${pendingDebt.totalDebt.toLocaleString('es-AR')}</span>. Este monto se sumará a tu pago.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment type selector */}
              {isLoadingFee ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <>
                  {fullPaymentInfo.enabled && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Elegí cómo pagar</p>
                      
                      {/* Deposit option */}
                      <button type="button" onClick={() => setPaymentType('deposit')}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                          paymentType === 'deposit'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium text-sm ${paymentType === 'deposit' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                              Pagar seña ({depositInfo.percent}%)
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              ${depositInfo.totalAmount.toLocaleString('es-AR')} ahora, ${depositInfo.remainingAmount.toLocaleString('es-AR')} en el lugar
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentType === 'deposit' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {paymentType === 'deposit' && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                      </button>
                      
                      {/* Full payment option */}
                      <button type="button" onClick={() => setPaymentType('full')}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                          paymentType === 'full'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium text-sm ${paymentType === 'full' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                              Pago completo
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              ${fullPaymentInfo.totalAmount.toLocaleString('es-AR')} ahora, nada en el lugar
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentType === 'full' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {paymentType === 'full' && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Price breakdown */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Precio del turno</span>
                      <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        {isCalculatingPrice && <Loader2 className="w-3 h-3 animate-spin" />}
                        ${getPrice().toLocaleString('es-AR')}
                      </span>
                    </div>
                    {/* Time-based price breakdown */}
                    {priceBreakdown.length > 1 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 mt-2">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Desglose por franjas:</p>
                        {priceBreakdown.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
                            <span>{item.scheduleName} ({item.minutes} min)</span>
                            <span>${item.amount.toLocaleString('es-AR')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                        {paymentType === 'full' ? 'Pago completo' : `Pago de seña (${depositInfo.percent}%)`}
                      </p>
                      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                        <span>{paymentType === 'full' ? 'Cancha' : 'Seña'}</span>
                        <span>${(paymentType === 'full' ? getPrice() : depositInfo.baseAmount).toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                        <span>Tarifa de servicio</span>
                        <span className="flex items-center gap-2">
                          {feeDiscount.hasDiscount && (
                            <span className="line-through text-gray-400 dark:text-gray-500">
                              ${(paymentType === 'full' ? fullPaymentInfo.generalFee : depositInfo.generalFee)?.toLocaleString('es-AR') || feeDiscount.generalFee.toLocaleString('es-AR')}
                            </span>
                          )}
                          <span className={feeDiscount.hasDiscount ? 'text-emerald-500' : ''}>
                            {(paymentType === 'full' ? fullPaymentInfo.fee : depositInfo.fee) === 0 
                              ? '$0' 
                              : `$${(paymentType === 'full' ? fullPaymentInfo.fee : depositInfo.fee).toLocaleString('es-AR')}`
                            }
                          </span>
                          {feeDiscount.hasDiscount && feeDiscount.discountPercent === 100 && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">¡Gratis!</span>
                          )}
                        </span>
                      </div>
                      {pendingDebt.hasDebt && (
                        <div className="flex justify-between text-sm text-orange-400">
                          <span>Deuda acumulada</span>
                          <span>${pendingDebt.totalDebt.toLocaleString('es-AR')}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">Total a pagar ahora</span>
                      <span className="font-bold text-emerald-500 text-lg">
                        ${((paymentType === 'full' ? fullPaymentInfo.totalAmount : depositInfo.totalAmount) + (pendingDebt.hasDebt ? pendingDebt.totalDebt : 0)).toLocaleString('es-AR')}
                      </span>
                    </div>
                    {paymentType !== 'full' && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Restante a pagar en el lugar</span>
                        <span>${depositInfo.remainingAmount.toLocaleString('es-AR')}</span>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp number input */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      <Phone className="w-4 h-4 inline mr-1.5 text-emerald-500" />
                      Número de WhatsApp *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg">+54</span>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej: 3795061706"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        maxLength={12}
                      />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Te enviaremos la confirmación y el QR por WhatsApp</p>
                  </div>

                  {/* Mercado Pago info */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-[#009ee3] rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">MP</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium text-sm">Mercado Pago</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Serás redirigido a Mercado Pago para completar el pago de forma segura.
                    </p>
                  </div>

                  {/* Error message */}
                  {paymentError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{paymentError}</span>
                    </div>
                  )}

                  {/* Cancellation policy */}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Cancelación flexible</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Podés cancelar hasta 24 horas antes y recibir el reembolso completo.</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation - fixed at bottom on mobile */}
      <div className="fixed lg:relative bottom-0 left-0 right-0 flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
        <div className="flex items-center justify-between">
          <button onClick={goToPrevStep} disabled={currentStep === 1 || isProcessingPayment}
            className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          {currentStep === 5 && selectedCourt ? (
            <button 
              onClick={handlePayment} 
              disabled={isProcessingPayment || isLoadingFee || (isAuthenticated && !whatsappNumber)}
              className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : !isAuthenticated ? (
                'Iniciar sesión para pagar'
              ) : !whatsappNumber ? (
                'Ingresá tu WhatsApp para pagar'
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pagar con Mercado Pago
                </>
              )}
            </button>
          ) : currentStep === 4 && selectedCourt ? (
            <button onClick={() => setCurrentStep(5)} className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500">
              Continuar
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );

  // Step titles for progress bar (new order)
  const stepTitles = ['Deporte', 'Duración', 'Fecha y hora', 'Cancha', 'Resumen'];
  const stepIcons = [Trophy, Timer, Calendar, MapPin, Shield];

  // Format selected date for display
  const formatSelectedDate = () => {
    if (!selectedDate) return '-';
    const date = new Date(selectedDate + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Format duration for display
  const formatDuration = () => {
    if (!selectedDuration) return '-';
    const hours = Math.floor(selectedDuration / 60);
    const mins = selectedDuration % 60;
    return mins > 0 ? `${hours}:${String(mins).padStart(2, '0')} hs` : `${hours} hora${hours > 1 ? 's' : ''}`;
  };

  // Closed establishment overlay
  if (establishment && establishment.isOpen === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header with establishment image */}
          <div className="relative h-40 bg-gradient-to-br from-red-500 to-orange-500">
            {mainImage && (
              <img src={mainImage} alt={establishment.name} className="w-full h-full object-cover opacity-30" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Establecimiento Temporalmente Cerrado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              <span className="font-semibold text-gray-900 dark:text-white">{establishment.name}</span> no está aceptando reservas en este momento. Por favor, intenta nuevamente más tarde.
            </p>
            
            {/* Contact info if available */}
            {(establishment.phone || establishment.email) && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">¿Necesitas contactarlos?</p>
                <div className="flex flex-col gap-2">
                  {establishment.phone && (
                    <a 
                      href={`tel:${establishment.phone}`}
                      className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {establishment.phone}
                    </a>
                  )}
                  {establishment.email && (
                    <a 
                      href={`mailto:${establishment.email}`}
                      className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {establishment.email}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/assets/logos/logo-light.svg" alt="Mis Canchas" className="h-10 w-auto dark:hidden" />
              <img src="/assets/logos/logo-dark.svg" alt="Mis Canchas" className="h-10 w-auto hidden dark:block" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto flex flex-col">
            <div className="px-2 space-y-1">
              <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
                Resumen
              </Link>
              <Link href="/dashboard?section=reservations" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Calendar className="mr-3 h-5 w-5 flex-shrink-0" />
                Mis Reservas
              </Link>
              <Link href="/dashboard?section=favorites" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Heart className="mr-3 h-5 w-5 flex-shrink-0" />
                Favoritos
              </Link>
              <Link href="/dashboard?section=profile" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <User className="mr-3 h-5 w-5 flex-shrink-0" />
                Mi Perfil
              </Link>
              <Link href="/dashboard?section=settings" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                Configuración
              </Link>
            </div>
            
            {/* Spacer to push quick access to bottom */}
            <div className="flex-1" />
            
            {/* Favorite establishments - Quick access */}
            {userFavorites.length > 0 && (
              <>
                <div className="mx-4 mb-3 border-t border-gray-200 dark:border-gray-700" />
                <div className="px-4 mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Accesos rápidos</p>
                </div>
                <div className="px-2 space-y-1">
                  {userFavorites.slice(0, 5).map((fav) => (
                    <Link 
                      key={fav.id} 
                      href={`/reservar/${fav.slug}`} 
                      onClick={() => setSidebarOpen(false)} 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {fav.image ? (
                        <img src={fav.image} alt="" className="mr-3 h-6 w-6 rounded-md object-cover flex-shrink-0" />
                      ) : (
                        <div className="mr-3 h-6 w-6 rounded-md bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                          <Star className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                      <span className="truncate">{fav.name}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>
          {/* User info at bottom of mobile sidebar */}
          {isAuthenticated && user && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setSidebarOpen(false); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile topbar */}
      <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-2">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src={mainImage} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{establishment.name}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stepTitles[currentStep - 1]}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleFavorite} className={`p-2 rounded-lg ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}>
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-lg text-gray-400">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile content - fullscreen */}
      <div className="lg:hidden flex-1 bg-gray-50 dark:bg-gray-900">
        {renderBookingForm()}
      </div>

      {/* DESKTOP LAYOUT - Same structure as admin dashboard */}
      <div className="hidden lg:block min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Desktop sidebar - collapsible with hover (same as admin) */}
        <div 
          className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-[width] duration-200 ease-out z-40 ${
            sidebarCollapsed ? 'lg:w-16' : 'lg:w-52'
          }`}
          onMouseEnter={() => setSidebarCollapsed(false)}
          onMouseLeave={() => setSidebarCollapsed(true)}
        >
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-4 pb-4 overflow-hidden shadow-lg dark:shadow-none relative">
            {/* Logo section - same as admin dashboard */}
            <div className="flex items-center flex-shrink-0 px-3 h-12 transition-none">
              <Link href="/" className="w-full flex items-center justify-start transition-none">
                <img 
                  src={sidebarCollapsed ? '/assets/logos/favicon-light.svg' : '/assets/logos/logo-light.svg'}
                  alt="Mis Canchas" 
                  className="h-10 w-auto transition-none dark:hidden"
                  style={{ transition: 'none' }}
                />
                <img 
                  src={sidebarCollapsed ? '/assets/logos/favicon-dark.svg' : '/assets/logos/logo-dark.svg'}
                  alt="Mis Canchas" 
                  className="h-10 w-auto transition-none hidden dark:block"
                  style={{ transition: 'none' }}
                />
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="mt-6 flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-2">
              <div className="space-y-1">
                <Link href="/dashboard" className="group flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <BarChart3 className="flex-shrink-0 h-5 w-5" />
                  <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>Resumen</span>
                </Link>
                <Link href="/dashboard?section=reservations" className="group flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Calendar className="flex-shrink-0 h-5 w-5" />
                  <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>Mis Reservas</span>
                </Link>
                <Link href="/dashboard?section=favorites" className="group flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Heart className="flex-shrink-0 h-5 w-5" />
                  <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>Favoritos</span>
                </Link>
                <Link href="/dashboard?section=profile" className="group flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <User className="flex-shrink-0 h-5 w-5" />
                  <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>Mi Perfil</span>
                </Link>
                <Link href="/dashboard?section=settings" className="group flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Settings className="flex-shrink-0 h-5 w-5" />
                  <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>Configuración</span>
                </Link>
              </div>
              
              {/* Spacer to push quick access to bottom */}
              <div className="flex-1" />
              
              {/* Favorite establishments - Quick access */}
              {userFavorites.length > 0 && (
                <>
                  <div className="mx-3 mb-2 border-t border-gray-200 dark:border-gray-700" />
                  <div className={`px-3 mb-1 transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Accesos rápidos</p>
                  </div>
                  <div className="space-y-1">
                    {userFavorites.slice(0, 5).map((fav) => (
                      <Link 
                        key={fav.id} 
                        href={`/reservar/${fav.slug}`}
                        className="group flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {fav.image ? (
                          <img src={fav.image} alt="" className="flex-shrink-0 h-5 w-5 rounded object-cover" />
                        ) : (
                          <Star className="flex-shrink-0 h-5 w-5 text-emerald-500" />
                        )}
                        <span className={`ml-3 text-sm font-medium whitespace-nowrap truncate transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{fav.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </nav>
            
            {/* User info at bottom */}
            {isAuthenticated && user && (
              <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className={`flex-1 min-w-0 ml-3 transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className={`p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content with sidebar offset */}
        <div className={`flex flex-col min-h-screen transition-[padding] duration-200 ease-out ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-52'}`}>
          {/* Top navigation bar */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="w-full px-4">
              <div className="flex items-center h-14">
                {/* Establishment info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={mainImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-900 dark:text-white text-sm">{establishment.name}</h1>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                      <span>{establishment.rating || '4.5'}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Progress Steps */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
                    {stepTitles.map((title, idx) => {
                      const isCompleted = idx + 1 < currentStep;
                      const isCurrent = idx + 1 === currentStep;
                      return (
                        <div key={idx} className="flex items-center">
                          <button
                            onClick={() => isCompleted && setCurrentStep(idx + 1)}
                            disabled={!isCompleted && !isCurrent}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                              isCurrent ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : isCompleted ? 'text-emerald-600 dark:text-emerald-400 hover:bg-white/50 dark:hover:bg-gray-600/50 cursor-pointer' : 'text-gray-400'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCompleted || isCurrent ? 'bg-emerald-500 text-white' : 'bg-gray-300 dark:bg-gray-500 text-white'
                            }`}>
                              {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                            </span>
                            <span>{title}</span>
                          </button>
                          {idx < 3 && <div className={`w-4 h-0.5 mx-0.5 rounded ${isCompleted ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-500'}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Step title + Actions */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stepTitles[currentStep - 1]}</span>
                  <div className="h-4 w-px bg-gray-200 dark:bg-gray-600" />
                  <button onClick={toggleFavorite} className={`p-2 rounded-lg transition-all ${isFavorite ? 'bg-red-50 dark:bg-red-500/20 text-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Side - Form Content */}
          <main className="flex-1">
            <div className="max-w-3xl mx-auto px-8 py-10">
              <AnimatePresence mode="wait">
                {/* Step 1: Sport Selection */}
                {currentStep === 1 && (
                  <motion.div key="d1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <p className="text-gray-500 mb-6">Seleccioná el deporte para ver las canchas disponibles</p>
                    <div className="grid grid-cols-2 gap-4">
                      {availableSports.map((sport) => {
                        const sportImages: Record<string, string> = { 
                          'futbol': '/assets/sports/futbol.jpg', 
                          'padel': '/assets/sports/padel.jpg', 
                          'paddle': '/assets/sports/padel.jpg', 
                          'tenis': '/assets/sports/tenis.jpg',
                          'basquet': '/assets/sports/futbol.jpg',
                          'voley': '/assets/sports/futbol.jpg'
                        };
                        const sportImage = sportImages[sport.toLowerCase()] || '/assets/sports/futbol.jpg';
                        const courtCount = establishment?.courts?.filter(c => c.sport === sport).length || 0;
                        const displayName = sport.toLowerCase() === 'paddle' ? 'Padel' : sport;
                        return (
                          <motion.button 
                            key={sport} 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setSelectedSport(sport); setCurrentStep(2); }}
                            className={`group relative h-40 rounded-2xl overflow-hidden transition-all ${
                              selectedSport === sport 
                                ? 'ring-4 ring-emerald-500 ring-offset-2 shadow-xl' 
                                : 'hover:shadow-lg'
                            }`}>
                            {/* Background Image */}
                            <img 
                              src={sportImage} 
                              alt={displayName}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Gradient Overlay - stronger at bottom */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                              <div className="font-bold text-white capitalize text-xl leading-tight">{displayName}</div>
                              <div className="text-sm text-white/80">{courtCount} canchas</div>
                            </div>
                            {selectedSport === sport && (
                              <div className="absolute top-3 right-3 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Duration */}
                {currentStep === 2 && (
                  <motion.div key="d2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <p className="text-gray-500 mb-6">Elegí la duración de tu reserva</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[{ value: 60, label: '1 hora', popular: false }, { value: 90, label: '1:30 hs', popular: true }, { value: 120, label: '2 horas', popular: false }, { value: 150, label: '2:30 hs', popular: false }].map((d) => (
                        <motion.button 
                          key={d.value} 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { setSelectedDuration(d.value); setShowCustomDuration(false); setCurrentStep(3); }}
                          className={`relative p-6 rounded-2xl border-2 text-center transition-all ${
                            selectedDuration === d.value && !showCustomDuration 
                              ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-lg shadow-emerald-100' 
                              : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                          }`}>
                          {d.popular && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">Popular</span>
                          )}
                          <Timer className={`w-8 h-8 mx-auto mb-2 ${selectedDuration === d.value ? 'text-emerald-500' : 'text-gray-300'}`} />
                          <div className="text-2xl font-bold text-gray-900">{d.label}</div>
                        </motion.button>
                      ))}
                    </div>
                    <button onClick={() => { setShowCustomDuration(!showCustomDuration); if (!showCustomDuration) setCustomDuration(180); }}
                      className={`w-full p-4 rounded-2xl border-2 border-dashed text-center transition-all ${showCustomDuration ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-300'}`}>
                      <span className="text-gray-600 font-medium">⏱️ Personalizar duración</span>
                    </button>
                    {showCustomDuration && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-6 bg-white rounded-2xl border-2 border-emerald-200 shadow-lg"
                      >
                        <div className="flex items-center justify-center gap-6 mb-6">
                          <button onClick={() => setCustomDuration(Math.max(150, customDuration - 30))} className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-600 text-2xl font-bold hover:bg-gray-200 transition-colors">-</button>
                          <div className="text-center">
                            <span className="text-4xl font-bold text-gray-900">{Math.floor(customDuration / 60)}:{String(customDuration % 60).padStart(2, '0')}</span>
                            <div className="text-sm text-gray-500 mt-1">horas</div>
                          </div>
                          <button onClick={() => setCustomDuration(Math.min(480, customDuration + 30))} className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-600 text-2xl font-bold hover:bg-gray-200 transition-colors">+</button>
                        </div>
                        <button onClick={() => { setSelectedDuration(customDuration); setCurrentStep(3); }} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md">
                          Confirmar duración
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Date + Time */}
                {currentStep === 3 && (
                  <motion.div key="d3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <p className="text-gray-500 mb-6">Elegí el día y horario de tu reserva</p>
                    
                    {/* Date selector - card style */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          Seleccioná el día
                        </h3>
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
                        </div>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {dates.slice(0, 10).filter(d => !d.isEmpty).map((date) => (
                          <motion.button 
                            key={date.value} 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDate(date.value)}
                            className={`flex-shrink-0 p-3 rounded-xl text-center transition-all min-w-[72px] ${
                              selectedDate === date.value 
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                : date.isToday
                                  ? 'bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400'
                                  : 'bg-gray-50 hover:bg-gray-100'
                            }`}>
                            <div className={`text-[10px] font-medium uppercase ${selectedDate === date.value ? 'text-emerald-100' : 'text-gray-400'}`}>{date.dayName}</div>
                            <div className={`text-xl font-bold ${selectedDate === date.value ? 'text-white' : 'text-gray-900'}`}>{date.dayNumber}</div>
                            <div className={`text-[10px] ${selectedDate === date.value ? 'text-emerald-100' : 'text-gray-400'}`}>{date.month}</div>
                            {date.isToday && !selectedDate && (
                              <span className="text-[8px] text-emerald-600 font-bold">HOY</span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Time slots */}
                    {selectedDate && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
                      >
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
                          <Clock className="w-4 h-4 text-emerald-500" />
                          Horarios disponibles
                          <span className="text-sm font-normal text-gray-400">• {formatSelectedDate()}</span>
                        </h3>
                        {loadingSlots ? (
                          <div className="flex justify-center py-8">
                            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-5 gap-2">
                            {availableSlots.map((slot) => (
                              <motion.button 
                                key={slot.time} 
                                whileHover={slot.available ? { scale: 1.05 } : {}}
                                whileTap={slot.available ? { scale: 0.95 } : {}}
                                onClick={() => { if (slot.available) setSelectedTime(slot.time); }} 
                                disabled={!slot.available}
                                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                                  selectedTime === slot.time 
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md' 
                                    : slot.available 
                                      ? 'bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 border border-emerald-500/30' 
                                      : 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                }`}>
                                {slot.time}
                              </motion.button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                              <Clock className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {!selectedDate && (
                      <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">Seleccioná una fecha para ver los horarios disponibles</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Court */}
                {currentStep === 4 && (
                  <motion.div key="d4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <p className="text-gray-500 mb-6">Seleccioná la cancha que más te guste</p>
                    {availableCourtsAtTime.length > 0 ? (
                      <div className="space-y-4">
                        {availableCourtsAtTime.map((court) => (
                          <motion.button 
                            key={court.id} 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => { setSelectedCourt(court); setCurrentStep(5); }}
                            className={`w-full p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
                              selectedCourt?.id === court.id 
                                ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-white shadow-lg shadow-emerald-100' 
                                : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                            }`}>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all ${
                              selectedCourt?.id === court.id ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg' : 'bg-gray-100'
                            }`}>
                              {selectedCourt?.id === court.id ? '✓' : '🏟️'}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-lg">{court.name}</div>
                              <div className="text-sm text-gray-500 capitalize flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{court.sport}</span>
                                <span>•</span>
                                <span>{court.surface}</span>
                                {court.isIndoor && <span className="text-emerald-600">• Techada</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-600">{getCourtPriceDisplay(court)}</div>
                              <div className="text-xs text-gray-400">por {formatDuration()}</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-500">No hay canchas disponibles en este horario</p>
                        <button onClick={() => setCurrentStep(3)} className="mt-4 text-emerald-600 font-medium hover:underline">
                          ← Elegir otro horario
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 5: Summary & Payment (Desktop) */}
                {currentStep === 5 && selectedCourt && (
                  <motion.div key="d5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <p className="text-gray-500 mb-6">Revisá los datos y completá el pago</p>
                    
                    {/* Booking Summary Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Resumen de tu reserva
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <MapPin className="w-5 h-5 text-emerald-500" />
                          <div>
                            <p className="text-xs text-gray-400">Establecimiento</p>
                            <p className="font-medium text-gray-900">{establishment?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Trophy className="w-5 h-5 text-emerald-500" />
                          <div>
                            <p className="text-xs text-gray-400">Cancha</p>
                            <p className="font-medium text-gray-900">{selectedCourt.name} • <span className="capitalize">{selectedCourt.sport}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Calendar className="w-5 h-5 text-emerald-500" />
                          <div>
                            <p className="text-xs text-gray-400">Fecha y hora</p>
                            <p className="font-medium text-gray-900 capitalize">{formatSelectedDate()} • {selectedTime} - {getEndTime()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pending Debt Alert */}
                    {pendingDebt.hasDebt && (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-orange-700 font-medium">Deuda acumulada</p>
                            <p className="text-orange-600 text-sm mt-1">
                              Tenés una deuda pendiente de <span className="font-semibold">${pendingDebt.totalDebt.toLocaleString('es-AR')}</span>. Este monto se sumará a tu pago.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Type Selector */}
                    {isLoadingFee ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {fullPaymentInfo.enabled && (
                          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4">Elegí cómo pagar</h3>
                            <div className="space-y-3">
                              <button type="button" onClick={() => setPaymentType('deposit')}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                  paymentType === 'deposit'
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className={`font-semibold ${paymentType === 'deposit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                      Pagar seña ({depositInfo.percent}%)
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      ${depositInfo.totalAmount.toLocaleString('es-AR')} ahora, ${depositInfo.remainingAmount.toLocaleString('es-AR')} en el lugar
                                    </p>
                                  </div>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    paymentType === 'deposit' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                  }`}>
                                    {paymentType === 'deposit' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                  </div>
                                </div>
                              </button>
                              
                              <button type="button" onClick={() => setPaymentType('full')}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                  paymentType === 'full'
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className={`font-semibold ${paymentType === 'full' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                      Pago completo
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      ${fullPaymentInfo.totalAmount.toLocaleString('es-AR')} ahora, nada en el lugar
                                    </p>
                                  </div>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    paymentType === 'full' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                  }`}>
                                    {paymentType === 'full' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                          <h3 className="font-semibold text-gray-900 mb-4">Detalle del pago</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Precio del turno</span>
                              <span className="text-gray-900 flex items-center gap-2">
                                {isCalculatingPrice && <Loader2 className="w-3 h-3 animate-spin" />}
                                ${getPrice().toLocaleString('es-AR')}
                              </span>
                            </div>
                            {/* Time-based price breakdown */}
                            {priceBreakdown.length > 1 && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-blue-600 mb-2 font-medium">Desglose por franjas horarias:</p>
                                {priceBreakdown.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-xs text-blue-700">
                                    <span>{item.scheduleName} ({item.minutes} min)</span>
                                    <span>${item.amount.toLocaleString('es-AR')}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="border-t border-gray-100 pt-3">
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                {paymentType === 'full' ? 'Pago completo' : `Pago de seña (${depositInfo.percent}%)`}
                              </p>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{paymentType === 'full' ? 'Cancha' : 'Seña'}</span>
                                <span className="text-gray-900">${(paymentType === 'full' ? getPrice() : depositInfo.baseAmount).toLocaleString('es-AR')}</span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600">Tarifa de servicio</span>
                                <span className="flex items-center gap-2">
                                  {feeDiscount.hasDiscount && (
                                    <span className="line-through text-gray-400">
                                      ${(paymentType === 'full' ? fullPaymentInfo.generalFee : depositInfo.generalFee)?.toLocaleString('es-AR') || feeDiscount.generalFee.toLocaleString('es-AR')}
                                    </span>
                                  )}
                                  <span className={feeDiscount.hasDiscount ? 'text-emerald-600' : 'text-gray-900'}>
                                    {(paymentType === 'full' ? fullPaymentInfo.fee : depositInfo.fee) === 0 
                                      ? '$0' 
                                      : `$${(paymentType === 'full' ? fullPaymentInfo.fee : depositInfo.fee).toLocaleString('es-AR')}`
                                    }
                                  </span>
                                  {feeDiscount.hasDiscount && feeDiscount.discountPercent === 100 && (
                                    <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">¡Gratis!</span>
                                  )}
                                </span>
                              </div>
                              {pendingDebt.hasDebt && (
                                <div className="flex justify-between text-sm mt-1 text-orange-600">
                                  <span>Deuda acumulada</span>
                                  <span>${pendingDebt.totalDebt.toLocaleString('es-AR')}</span>
                                </div>
                              )}
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between">
                              <span className="font-semibold text-gray-900">Total a pagar ahora</span>
                              <span className="font-bold text-emerald-600 text-xl">
                                ${((paymentType === 'full' ? fullPaymentInfo.totalAmount : depositInfo.totalAmount) + (pendingDebt.hasDebt ? pendingDebt.totalDebt : 0)).toLocaleString('es-AR')}
                              </span>
                            </div>
                            {paymentType !== 'full' && (
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Restante a pagar en el lugar</span>
                                <span>${depositInfo.remainingAmount.toLocaleString('es-AR')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* WhatsApp number input */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            <Phone className="w-4 h-4 inline mr-1.5 text-emerald-500" />
                            Número de WhatsApp *
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2.5 rounded-xl">+54</span>
                            <input
                              type="tel"
                              value={whatsappNumber}
                              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                              placeholder="Ej: 3795061706"
                              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                              maxLength={12}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Te enviaremos la confirmación y el QR por WhatsApp</p>
                        </div>

                        {/* Mercado Pago Info */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-6">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-[#009ee3] rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-sm">MP</span>
                            </div>
                            <span className="text-gray-900 font-semibold">Mercado Pago</span>
                          </div>
                          <p className="text-gray-500 text-sm">
                            Serás redirigido a Mercado Pago para completar el pago de forma segura.
                          </p>
                        </div>

                        {/* Error message */}
                        {paymentError && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 mb-6">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{paymentError}</span>
                          </div>
                        )}

                        {/* Cancellation Policy */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-emerald-700">Cancelación flexible</p>
                            <p className="text-sm text-emerald-600">Podés cancelar hasta 24 horas antes y recibir el reembolso completo.</p>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* Right Sidebar - Booking Summary */}
          <aside className="w-[380px] bg-gray-800 border-l border-gray-700 flex flex-col h-[calc(100vh-120px)] sticky top-14">
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Establishment Info - Collapsible */}
              <div className="bg-gray-700/50 rounded-xl border border-gray-600 mb-4">
                <button
                  onClick={() => setIsEstablishmentInfoExpanded(!isEstablishmentInfoExpanded)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-700/30 transition-colors"
                >
                  <img src={mainImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-semibold text-white truncate">{establishment.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span>{establishment.rating || '4.5'}</span>
                      <span>•</span>
                      <span className="truncate">{establishment.city}</span>
                    </div>
                  </div>
                  {isEstablishmentInfoExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {/* Expanded Info */}
                <AnimatePresence>
                  {isEstablishmentInfoExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-600 pt-3">
                        {/* Address */}
                        {establishment.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-300">{establishment.address}</div>
                          </div>
                        )}
                        
                        {/* Phone */}
                        {establishment.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a href={`tel:${establishment.phone}`} className="text-sm text-emerald-400 hover:text-emerald-300">
                              {establishment.phone}
                            </a>
                          </div>
                        )}
                        
                        {/* Opening Hours */}
                        {establishment.openingHours && (
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-300">
                              {typeof establishment.openingHours === 'string' 
                                ? establishment.openingHours
                                : 'Ver horarios en el establecimiento'
                              }
                            </div>
                          </div>
                        )}
                        
                        {/* Google Map */}
                        {establishment.latitude && establishment.longitude && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-gray-600">
                            <iframe
                              width="100%"
                              height="200"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${establishment.latitude},${establishment.longitude}&zoom=15`}
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Booking Details */}
              <div className="space-y-3">
                {/* Sport */}
                <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedSport ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-700/30 border border-gray-700'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedSport ? 'bg-emerald-500/20' : 'bg-gray-700'}`}>
                    {selectedSport ? (
                      <span className="text-xl">{{'futbol': '⚽', 'padel': '🎾', 'tenis': '🎾', 'basquet': '🏀'}[selectedSport.toLowerCase()] || '🏟️'}</span>
                    ) : (
                      <Trophy className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium">Deporte</div>
                    <div className={`font-semibold capitalize ${selectedSport ? 'text-white' : 'text-gray-500'}`}>
                      {selectedSport === 'paddle' ? 'Padel' : selectedSport || 'Sin seleccionar'}
                    </div>
                  </div>
                  {selectedSport && <Check className="w-5 h-5 text-emerald-400" />}
                </div>

                {/* Duration */}
                <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedDuration ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-700/30 border border-gray-700'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedDuration ? 'bg-emerald-500/20' : 'bg-gray-700'}`}>
                    <Timer className={`w-5 h-5 ${selectedDuration ? 'text-emerald-400' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium">Duración</div>
                    <div className={`font-semibold ${selectedDuration ? 'text-white' : 'text-gray-500'}`}>
                      {formatDuration()}
                    </div>
                  </div>
                  {selectedDuration && <Check className="w-5 h-5 text-emerald-400" />}
                </div>

                {/* Date & Time */}
                <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedDate && selectedTime ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-700/30 border border-gray-700'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedDate ? 'bg-emerald-500/20' : 'bg-gray-700'}`}>
                    <Calendar className={`w-5 h-5 ${selectedDate ? 'text-emerald-400' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium">Fecha y hora</div>
                    <div className={`font-semibold capitalize ${selectedDate ? 'text-white' : 'text-gray-500'}`}>
                      {selectedDate ? formatSelectedDate() : 'Sin seleccionar'}
                    </div>
                    {selectedTime && <div className="text-sm text-emerald-400 font-medium">{selectedTime} - {getEndTime()}</div>}
                  </div>
                  {selectedDate && selectedTime && <Check className="w-5 h-5 text-emerald-400" />}
                </div>

                {/* Court */}
                <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedCourt ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-700/30 border border-gray-700'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedCourt ? 'bg-emerald-500/20' : 'bg-gray-700'}`}>
                    <span className="text-xl">🏟️</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium">Cancha</div>
                    <div className={`font-semibold ${selectedCourt ? 'text-white' : 'text-gray-500'}`}>
                      {selectedCourt?.name || 'Sin seleccionar'}
                    </div>
                    {selectedCourt && <div className="text-xs text-gray-400 capitalize">{selectedCourt.surface}</div>}
                  </div>
                  {selectedCourt && <Check className="w-5 h-5 text-emerald-400" />}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer with Navigation */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3 sticky bottom-0">
          <div className="flex items-center justify-between">
            <button onClick={goToPrevStep} disabled={currentStep === 1 || isProcessingPayment}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <ChevronLeft className="w-4 h-4" />
              Volver
            </button>
            
            <div className="flex items-center gap-3">
              {currentStep === 5 && selectedCourt ? (
                <button 
                  onClick={handlePayment}
                  disabled={isProcessingPayment || isLoadingFee || (isAuthenticated && !whatsappNumber)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : !isAuthenticated ? (
                    'Iniciar sesión para pagar'
                  ) : !whatsappNumber ? (
                    'Ingresá tu WhatsApp para pagar'
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pagar con Mercado Pago
                    </>
                  )}
                </button>
              ) : currentStep === 4 && selectedCourt ? (
                <button onClick={() => setCurrentStep(5)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                  Continuar
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={goToNextStep} disabled={!canGoNext()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all ${
                    canGoNext() 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}>
                  Continuar
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </footer>
        </div>
      </div>

      {/* Modals */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }} />
      <RegisterModalWithEmail isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }} />
    </div>
  );
};

export default BookingPage;
