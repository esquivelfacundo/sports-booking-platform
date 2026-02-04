'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Trophy, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  Search,
  Loader2,
  CheckCircle,
  UserPlus,
  Repeat,
  CalendarRange,
  ArrowLeft,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Court {
  id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  isActive: boolean;
}

interface Amenity {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  isBookable: boolean;
  isPublic: boolean;
  isActive: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  courts: string[]; // IDs de canchas disponibles en ese horario
}

interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ClientInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  noShows: number;
  hasDebt: boolean;
}

type ClientMode = 'search' | 'create' | 'selected';

interface CreateReservationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentId: string;
  courts: Court[];
  onReservationCreated: () => void;
  amenities?: Amenity[];
}

type Step = 'sport' | 'datetime' | 'court' | 'player' | 'confirmation';

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'sport', label: 'Deporte', icon: Trophy },
  { key: 'datetime', label: 'Fecha', icon: Calendar },
  { key: 'court', label: 'Cancha', icon: MapPin },
  { key: 'player', label: 'Jugador', icon: User },
  { key: 'confirmation', label: 'Confirmación', icon: CheckCircle },
];

// Payment methods loaded from establishment configuration
const DEFAULT_PAYMENT_METHODS = [
  { id: 'cash', name: 'Efectivo', code: 'cash', icon: 'Banknote' },
  { id: 'transfer', name: 'Transferencia', code: 'transfer', icon: 'Building2' },
  { id: 'card', name: 'Tarjeta', code: 'card', icon: 'CreditCard' },
];

export const CreateReservationSidebar: React.FC<CreateReservationSidebarProps> = ({
  isOpen,
  onClose,
  establishmentId,
  courts: propCourts,
  onReservationCreated,
  amenities = [],
}) => {
  // Current step
  const [currentStep, setCurrentStep] = useState<Step>('sport');
  
  // Internal courts state (fallback if props are empty)
  const [internalCourts, setInternalCourts] = useState<Court[]>([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  
  // Payment methods from establishment
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string; code: string; icon: string | null }[]>(DEFAULT_PAYMENT_METHODS);
  
  // Use prop courts if available, otherwise use internal
  const courts = propCourts.length > 0 ? propCourts : internalCourts;
  
  // Form data
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  
  // Player data
  const [playerName, setPlayerName] = useState<string>('');
  const [playerPhone, setPlayerPhone] = useState<string>('');
  const [playerEmail, setPlayerEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [depositAmount, setDepositAmount] = useState<number>(0);
  
  // Client search and selection
  const [clientMode, setClientMode] = useState<ClientMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClientInfo[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientInfo | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateClientForm, setShowCreateClientForm] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  
  // Recurring reservation
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [recurringCount, setRecurringCount] = useState(4); // Number of occurrences
  
  // Availability check for recurring
  const [availabilityResults, setAvailabilityResults] = useState<any[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [dateOverrides, setDateOverrides] = useState<Map<string, { courtId: string; time: string }>>(new Map());
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Reset internal courts when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setInternalCourts([]);
    }
  }, [isOpen]);

  // Load courts internally if props are empty
  useEffect(() => {
    if (isOpen && establishmentId && propCourts.length === 0) {
      const loadCourts = async () => {
        setLoadingCourts(true);
        try {
          console.log('[CreateReservationSidebar] Loading courts for establishment:', establishmentId);
          const response = await apiClient.getCourts(establishmentId) as any;
          // API returns {success: true, data: [...]} or {courts: [...]}
          const loadedCourts = response.data || response.courts || [];
          console.log('[CreateReservationSidebar] Loaded courts:', loadedCourts.length, loadedCourts.map((c: any) => c.sport));
          setInternalCourts(loadedCourts);
        } catch (error) {
          console.error('Error loading courts:', error);
        } finally {
          setLoadingCourts(false);
        }
      };
      loadCourts();
    }
  }, [isOpen, establishmentId, propCourts.length]);

  // Load payment methods from establishment configuration
  useEffect(() => {
    if (isOpen && establishmentId) {
      const loadPaymentMethods = async () => {
        try {
          const response = await apiClient.getPaymentMethods(establishmentId) as { paymentMethods: { id: string; name: string; code: string; icon: string | null }[] };
          if (response.paymentMethods?.length > 0) {
            setPaymentMethods(response.paymentMethods);
            // Set default payment method
            const defaultMethod = response.paymentMethods.find(m => m.code === 'cash') || response.paymentMethods[0];
            setPaymentMethod(defaultMethod.code);
          }
        } catch (error) {
          console.error('Error loading payment methods:', error);
          // Keep default methods on error
        }
      };
      loadPaymentMethods();
    }
  }, [isOpen, establishmentId]);

  // Get unique sports from courts + amenities
  const availableSports = useMemo(() => {
    const sports = [...new Set(courts.filter(c => c.isActive).map(c => c.sport))];
    return sports;
  }, [courts]);

  // Get bookable amenities (amenities prop is already filtered, but double-check)
  const bookableAmenities = useMemo(() => {
    // If amenities are already filtered, just return them
    // Otherwise filter by isBookable and isActive
    return amenities.filter(a => {
      // If properties exist, check them; otherwise assume they're valid
      const isBookable = a.isBookable === undefined || a.isBookable === true;
      const isActive = a.isActive === undefined || a.isActive === true;
      return isBookable && isActive;
    });
  }, [amenities]);

  // Get courts filtered by selected sport (or amenities if 'amenity' is selected)
  const courtsForSport = useMemo(() => {
    if (selectedSport === 'amenity') {
      // Return amenities as court-like objects
      return bookableAmenities.map(a => ({
        id: a.id,
        name: a.name,
        sport: 'amenity',
        pricePerHour: a.pricePerHour,
        pricePerHour90: a.pricePerHour90,
        pricePerHour120: a.pricePerHour120,
        isActive: a.isActive
      }));
    }
    return courts.filter(c => c.isActive && c.sport === selectedSport);
  }, [courts, selectedSport, bookableAmenities]);

  // Get courts available at selected time
  const availableCourtsAtTime = useMemo(() => {
    if (!selectedTime || !availableSlots.length) return courtsForSport;
    
    const slot = availableSlots.find(s => s.time === selectedTime);
    if (!slot) return courtsForSport;
    
    return courtsForSport.filter(c => slot.courts.includes(c.id));
  }, [courtsForSport, selectedTime, availableSlots]);

  // Generate calendar days for current month
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [calendarMonth]);

  // Load availability when date changes
  useEffect(() => {
    if (selectedDate && selectedSport) {
      loadAvailability();
    }
  }, [selectedDate, selectedSport]);

  const loadAvailability = async () => {
    if (!selectedDate || !selectedSport) return;
    
    setLoadingSlots(true);
    try {
      const slots: Map<string, string[]> = new Map();
      
      // Generate time slots from 8:00 to 23:00 every 30 minutes
      for (let hour = 8; hour <= 23; hour++) {
        slots.set(`${hour.toString().padStart(2, '0')}:00`, []);
        if (hour < 23) {
          slots.set(`${hour.toString().padStart(2, '0')}:30`, []);
        }
      }
      
      // For amenities, generate default slots (no availability API yet)
      if (selectedSport === 'amenity') {
        const amenityIds = bookableAmenities.map(a => a.id);
        // All slots are available for all amenities by default
        slots.forEach((_, time) => {
          slots.set(time, amenityIds);
        });
        
        const slotsArray: TimeSlot[] = Array.from(slots.entries())
          .map(([time, itemIds]) => ({
            time,
            available: itemIds.length > 0,
            courts: itemIds,
          }))
          .sort((a, b) => a.time.localeCompare(b.time));
        
        setAvailableSlots(slotsArray);
        setLoadingSlots(false);
        return;
      }
      
      // Get availability for all courts of the selected sport
      const sportCourts = courts.filter(c => c.isActive && c.sport === selectedSport);
      
      // Check availability for each court
      for (const court of sportCourts) {
        try {
          const response = await apiClient.getCourtAvailability(court.id, selectedDate) as any;
          // Backend returns availableSlots
          const availability = response.availableSlots || response.availability || response.slots || [];
          
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
          // If API fails for this court, skip it (don't assume available)
        }
      }
      
      // Convert to array and sort by time
      const slotsArray: TimeSlot[] = Array.from(slots.entries())
        .map(([time, courtIds]) => ({
          time,
          available: courtIds.length > 0,
          courts: courtIds,
        }))
        .sort((a, b) => a.time.localeCompare(b.time));
      
      setAvailableSlots(slotsArray);
    } catch (err) {
      console.error('Error loading availability:', err);
      // Generate default slots every 30 minutes
      const defaultSlots: TimeSlot[] = [];
      for (let hour = 8; hour <= 23; hour++) {
        defaultSlots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          available: true,
          courts: courtsForSport.map(c => c.id),
        });
        if (hour < 23) {
          defaultSlots.push({
            time: `${hour.toString().padStart(2, '0')}:30`,
            available: true,
            courts: courtsForSport.map(c => c.id),
          });
        }
      }
      setAvailableSlots(defaultSlots);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Search clients by name or phone
  useEffect(() => {
    const searchClientsApi = async () => {
      if (searchQuery.length < 2 || !establishmentId) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        // Search clients for this establishment
        const response = await apiClient.searchClients(establishmentId, searchQuery) as any;
        const clients = response.data || [];
        setSearchResults(clients.map((c: any) => ({
          id: c.id,
          name: c.name || '',
          email: c.email || '',
          phone: c.phone || '',
          totalBookings: c.totalBookings || 0,
          noShows: c.noShows || 0,
          hasDebt: c.hasDebt || false,
        })));
      } catch (err) {
        console.error('Error searching clients:', err);
        // If API fails, clear results
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    const debounce = setTimeout(searchClientsApi, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, establishmentId]);

  // Handle client selection from search
  const handleSelectClient = (client: ClientInfo) => {
    setSelectedClient(client);
    setPlayerName(client.name);
    setPlayerEmail(client.email);
    setPlayerPhone(client.phone);
    setSearchResults([]);
    setClientMode('selected');
  };

  // Handle back to search
  const handleBackToSearch = () => {
    setClientMode('search');
    setSelectedClient(null);
    setSearchQuery('');
    setPlayerName('');
    setPlayerPhone('');
    setPlayerEmail('');
  };

  // Create new client
  const handleCreateClient = async () => {
    if (!playerName || !playerPhone) return;
    
    setIsCreatingClient(true);
    try {
      // Split name into first and last
      const nameParts = playerName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create client via API (if available)
      // For now, just mark as new client and continue
      setShowCreateClientForm(false);
      alert('Cliente creado exitosamente');
    } catch (err) {
      console.error('Error creating client:', err);
      alert('Error al crear el cliente');
    } finally {
      setIsCreatingClient(false);
    }
  };

  // Calculate recurring dates
  const getRecurringDates = () => {
    if (!isRecurring || !selectedDate) return [selectedDate];
    
    const dates: string[] = [selectedDate];
    const baseDate = new Date(selectedDate + 'T00:00:00');
    
    for (let i = 1; i < recurringCount; i++) {
      const newDate = new Date(baseDate);
      
      switch (recurringType) {
        case 'weekly':
          newDate.setDate(baseDate.getDate() + (7 * i));
          break;
        case 'biweekly':
          newDate.setDate(baseDate.getDate() + (14 * i));
          break;
        case 'monthly':
          newDate.setMonth(baseDate.getMonth() + i);
          break;
      }
      
      dates.push(newDate.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Calculate price
  const calculatePrice = () => {
    // Check if it's an amenity booking
    if (selectedSport === 'amenity') {
      const amenity = bookableAmenities.find(a => a.id === selectedCourt);
      if (!amenity) return 0;
      
      switch (selectedDuration) {
        case 90:
          return amenity.pricePerHour90 || amenity.pricePerHour * 1.5;
        case 120:
          return amenity.pricePerHour120 || amenity.pricePerHour * 2;
        default:
          return amenity.pricePerHour;
      }
    }
    
    // Court booking
    const court = courts.find(c => c.id === selectedCourt);
    if (!court) return 0;
    
    switch (selectedDuration) {
      case 90:
        return court.pricePerHour90 || court.pricePerHour * 1.5;
      case 120:
        return court.pricePerHour120 || court.pricePerHour * 2;
      default:
        return court.pricePerHour;
    }
  };

  // Check if a time slot is in the past
  const isSlotInPast = (time: string): boolean => {
    if (!selectedDate) return false;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Parse selectedDate (YYYY-MM-DD format)
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selectedDay = new Date(year, month - 1, day);
    
    // If selected date is in the past, all slots are in the past
    if (selectedDay < today) return true;
    
    // If selected date is in the future, no slots are in the past
    if (selectedDay > today) return false;
    
    // For today, check if the time slot is before current time
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    return slotTime <= now;
  };

  // Check availability for recurring bookings (Turnos Fijos)
  const checkAvailability = async () => {
    if (!isRecurring || !selectedCourt || !selectedTime || !establishmentId) return;
    
    setIsCheckingAvailability(true);
    try {
      const response = await apiClient.checkRecurringAvailability({
        establishmentId,
        courtId: selectedCourt,
        startDate: selectedDate,
        startTime: selectedTime,
        duration: selectedDuration,
        totalWeeks: recurringCount,
        sport: selectedSport !== 'amenity' ? selectedSport : undefined
      }) as any;
      
      // Transform response to our format
      const results = (response.availability || []).map((item: any) => ({
        date: item.date,
        available: item.primaryCourt?.available ?? true,
        conflict: item.primaryCourt?.conflictWith,
        alternatives: item.alternatives || [],
        selectedCourt: item.selectedCourt,
        isSkipped: item.isSkipped || false,
        resolved: item.primaryCourt?.available || item.selectedCourt !== null
      }));
      
      setAvailabilityResults(results);
      setHasConflicts(response.summary?.unavailable > 0 || response.summary?.needsAlternative > 0);
    } catch (err) {
      console.error('Error checking availability:', err);
      setAvailabilityResults([]);
      setHasConflicts(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Apply alternative for a specific date
  const applyAlternative = (date: string, alternative: { courtId: string; time: string }) => {
    const newOverrides = new Map(dateOverrides);
    newOverrides.set(date, alternative);
    setDateOverrides(newOverrides);
    
    // Update availability results to show as resolved
    setAvailabilityResults(prev => prev.map(r => 
      r.date === date ? { ...r, resolved: true, selectedAlternative: alternative } : r
    ));
  };

  // Navigation
  const goToNextStep = async () => {
    const currentIndex = STEPS.findIndex(s => s.key === currentStep);
    
    // If going from player to confirmation and is recurring, check availability first
    if (currentStep === 'player' && isRecurring) {
      await checkAvailability();
    }
    
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].key);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = STEPS.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'sport':
        return !!selectedSport;
      case 'datetime':
        return !!selectedDate && !!selectedTime;
      case 'court':
        return !!selectedCourt;
      case 'player':
        // In selected mode, we have a client selected
        if (clientMode === 'selected' && selectedClient) return true;
        // In create mode, need name and phone
        if (clientMode === 'create') return !!playerName && !!playerPhone;
        // In search mode, can't proceed
        return false;
      case 'confirmation':
        // For recurring, all conflicts must be resolved
        if (isRecurring && hasConflicts) {
          const unresolvedConflicts = availabilityResults.filter(r => !r.available && !r.resolved);
          return unresolvedConflicts.length === 0;
        }
        return true;
      default:
        return false;
    }
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Submit reservation
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const isAmenityBooking = selectedSport === 'amenity';
      const pricePerBooking = calculatePrice();
      
      // Use new recurring booking system for turnos fijos
      if (isRecurring && !isAmenityBooking) {
        // Build date configurations from availability results and overrides
        const dateConfigurations = availabilityResults
          .filter(r => !r.isSkipped)
          .map(r => {
            const override = dateOverrides.get(r.date);
            return {
              date: r.date,
              courtId: override?.courtId || r.selectedCourt?.id || selectedCourt,
              skip: r.isSkipped || false
            };
          });
        
        // Create recurring booking group
        const response = await apiClient.createRecurringBooking({
          establishmentId,
          courtId: selectedCourt,
          clientId: selectedClient?.id,
          clientName: playerName,
          clientPhone: playerPhone,
          clientEmail: playerEmail || undefined,
          startDate: selectedDate,
          startTime: selectedTime,
          duration: selectedDuration,
          sport: selectedSport,
          bookingType: 'normal',
          totalWeeks: recurringCount,
          pricePerBooking,
          notes: `Turno fijo - ${paymentMethods.find(m => m.code === paymentMethod)?.name || paymentMethod}`,
          dateConfigurations,
          initialPayment: depositAmount > 0 ? {
            amount: depositAmount,
            method: paymentMethod
          } : undefined
        }) as any;
        
        if (response.success) {
          alert(`Turno fijo creado exitosamente con ${response.bookings?.length || recurringCount} reservas`);
        } else {
          throw new Error(response.error || 'Error al crear turno fijo');
        }
      } else {
        // Regular booking flow (single or amenity)
        const dates = getRecurringDates();
        let successCount = 0;
        let errorCount = 0;
        
        for (const date of dates) {
          try {
            const override = dateOverrides.get(date);
            const bookingItemId = override?.courtId || selectedCourt;
            const bookingTime = override?.time || selectedTime;
            const bookingEndTime = calculateEndTime(bookingTime, selectedDuration);
            
            let totalAmount = 0;
            if (isAmenityBooking) {
              const bookingAmenity = bookableAmenities.find(a => a.id === bookingItemId);
              if (bookingAmenity) {
                totalAmount = selectedDuration === 90 ? (bookingAmenity.pricePerHour90 || bookingAmenity.pricePerHour * 1.5) :
                  selectedDuration === 120 ? (bookingAmenity.pricePerHour120 || bookingAmenity.pricePerHour * 2) :
                  bookingAmenity.pricePerHour;
              }
            } else {
              const bookingCourt = courts.find(c => c.id === bookingItemId);
              if (bookingCourt) {
                totalAmount = selectedDuration === 90 ? (bookingCourt.pricePerHour90 || bookingCourt.pricePerHour * 1.5) :
                  selectedDuration === 120 ? (bookingCourt.pricePerHour120 || bookingCourt.pricePerHour * 2) :
                  bookingCourt.pricePerHour;
              }
            }
            
            if (totalAmount === 0) {
              totalAmount = pricePerBooking;
            }
            
            const bookingData: any = {
              date: date,
              startTime: bookingTime,
              endTime: bookingEndTime,
              duration: selectedDuration,
              totalAmount: totalAmount,
              clientName: playerName,
              clientPhone: playerPhone,
              clientEmail: playerEmail || undefined,
              paymentType: 'full',
              depositAmount: depositAmount,
              depositMethod: depositAmount > 0 ? paymentMethod : undefined,
              notes: `Método de pago: ${paymentMethods.find(m => m.code === paymentMethod)?.name || paymentMethod}`,
            };
            
            if (isAmenityBooking) {
              bookingData.amenityId = bookingItemId;
            } else {
              bookingData.courtId = bookingItemId;
            }
            
            await apiClient.createBooking(bookingData);
            successCount++;
          } catch (err: any) {
            console.error(`Error creating reservation for ${date}:`, err);
            errorCount++;
          }
        }
        
        if (errorCount > 0 && successCount > 0) {
          alert(`Se crearon ${successCount} reservas. ${errorCount} fallaron.`);
        } else if (errorCount > 0) {
          alert('Error al crear las reservas. Por favor intenta de nuevo.');
        }
      }
      
      onReservationCreated();
      handleClose();
    } catch (err) {
      console.error('Error creating reservation:', err);
      alert('Error al crear la reserva. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate dates for horizontal scroll (14 days from today)
  const horizontalDates = useMemo(() => {
    const dates: Array<{
      value: string;
      dayName: string;
      dayNumber: number;
      month: string;
      isToday: boolean;
      isWeekend: boolean;
    }> = [];
    const today = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateValue = `${year}-${month}-${day}`;
      
      dates.push({
        value: dateValue,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday: i === 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return dates;
  }, []);

  // Reset form
  const handleClose = () => {
    setCurrentStep('sport');
    setSelectedSport('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedCourt('');
    setSelectedDuration(60);
    setPlayerName('');
    setPlayerPhone('');
    setPlayerEmail('');
    setPaymentMethod('cash');
    setDepositAmount(0);
    setClientMode('search');
    setSearchQuery('');
    setSelectedClient(null);
    setSelectedUser(null);
    setSearchResults([]);
    setShowCreateClientForm(false);
    setIsRecurring(false);
    setRecurringType('weekly');
    setRecurringCount(4);
    setAvailabilityResults([]);
    setHasConflicts(false);
    setDateOverrides(new Map());
    onClose();
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  // Get selected court info
  const selectedCourtInfo = courts.find(c => c.id === selectedCourt);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'sport':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Seleccionar Deporte</h3>
            <div className="grid grid-cols-2 gap-3">
              {availableSports.map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSport === sport
                      ? 'border-emerald-500 bg-emerald-500/20 text-white'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Trophy className="h-8 w-8 mx-auto mb-2" />
                  <span className="block text-sm font-medium capitalize">{sport}</span>
                  <span className="block text-xs text-gray-400 mt-1">
                    {courts.filter(c => c.sport === sport && c.isActive).length} canchas
                  </span>
                </button>
              ))}
              {/* Amenities option */}
              {bookableAmenities.length > 0 && (
                <button
                  onClick={() => setSelectedSport('amenity')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSport === 'amenity'
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                  <span className="block text-sm font-medium">Amenities</span>
                  <span className="block text-xs text-gray-400 mt-1">
                    {bookableAmenities.length} disponibles
                  </span>
                </button>
              )}
            </div>
            {loadingCourts && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="ml-2 text-gray-400">Cargando deportes...</span>
              </div>
            )}
            {!loadingCourts && availableSports.length === 0 && bookableAmenities.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                No hay deportes disponibles
              </p>
            )}
          </div>
        );

      case 'datetime':
        const presetDurations = [60, 90, 120];
        const isCustomDuration = !presetDurations.includes(selectedDuration);
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Fecha y hora</h3>
            
            {/* Horizontal date selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-gray-600">
              {horizontalDates.map((date) => (
                <button
                  key={date.value}
                  onClick={() => setSelectedDate(date.value)}
                  className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border-2 transition-all min-w-[56px] ${
                    selectedDate === date.value
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : date.isWeekend
                        ? 'bg-gray-700/70 border-gray-600 text-gray-300 hover:border-emerald-500/50'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500/50'
                  }`}
                >
                  <span className="text-[10px] opacity-70 uppercase">{date.dayName}</span>
                  <span className="text-base font-bold">{date.dayNumber}</span>
                  <span className="text-[10px] opacity-70">{date.month}</span>
                </button>
              ))}
            </div>

            {selectedDate && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-emerald-400 text-sm text-center">
                  {formatDate(selectedDate)}
                </p>
              </div>
            )}
            
            {/* Duration selector */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Duración</label>
              <div className="flex gap-2 flex-wrap">
                {presetDurations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      selectedDuration === duration
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {duration} min
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="30"
                    max="480"
                    step="30"
                    value={isCustomDuration ? selectedDuration : ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 60;
                      setSelectedDuration(Math.max(30, Math.min(480, val)));
                    }}
                    placeholder="Otro"
                    className={`w-20 py-2 px-3 rounded-lg text-sm transition-all ${
                      isCustomDuration
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-gray-700 text-gray-300 border-gray-600'
                    } border focus:outline-none focus:border-emerald-500`}
                  />
                  <span className="text-gray-400 text-sm">min</span>
                </div>
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Horarios disponibles</label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                    {availableSlots.map((slot) => {
                      const isPast = isSlotInPast(slot.time);
                      const isAvailable = slot.available && !isPast;
                      
                      return (
                        <button
                          key={slot.time}
                          onClick={() => isAvailable && setSelectedTime(slot.time)}
                          disabled={!isAvailable}
                          className={`
                            py-2 px-1 rounded-lg text-xs font-medium transition-all
                            ${isPast ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed line-through' : ''}
                            ${!isAvailable && !isPast ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : ''}
                            ${selectedTime === slot.time ? 'bg-emerald-500 text-white' : ''}
                            ${isAvailable && selectedTime !== slot.time ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : ''}
                          `}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay horarios disponibles
                  </div>
                )}
              </div>
            )}

            {!selectedDate && (
              <p className="text-center text-gray-500 py-4">Seleccioná una fecha para ver los horarios</p>
            )}

            {/* Recurring reservation option */}
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Repeat className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-medium">Reserva Recurrente</span>
                </div>
                <button
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isRecurring ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRecurring ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {isRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Frecuencia</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'weekly', label: 'Semanal' },
                        { value: 'biweekly', label: 'Quincenal' },
                        { value: 'monthly', label: 'Mensual' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setRecurringType(option.value as any)}
                          className={`py-2 px-3 rounded-lg text-sm transition-all ${
                            recurringType === option.value
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Cantidad de semanas</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="4"
                        max="24"
                        value={recurringCount}
                        onChange={(e) => setRecurringCount(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-blue-300 font-medium min-w-[60px] text-right">
                        {recurringCount} sem.
                      </span>
                    </div>
                  </div>

                  {/* Preview of recurring dates */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CalendarRange className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 text-sm font-medium">Fechas del turno fijo:</span>
                    </div>
                    <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {getRecurringDates().map((date, index) => {
                        const isFirst = index === 0;
                        return (
                          <div key={date} className="flex justify-between items-center py-1 border-b border-gray-700/50 last:border-0">
                            <span className={isFirst ? 'text-blue-400 font-medium' : 'text-gray-300'}>
                              {index + 1}. {formatDate(date)}
                            </span>
                            <span className="text-gray-400">
                              {selectedTime || '--:--'}hs
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs pt-2 mt-2 border-t border-blue-500/30">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-blue-300 font-medium">
                        {recurringCount} turnos = ${(calculatePrice() * recurringCount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'court':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Seleccionar Cancha</h3>
            <div className="space-y-3">
              {availableCourtsAtTime.map((court) => (
                <button
                  key={court.id}
                  onClick={() => setSelectedCourt(court.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCourt === court.id
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{court.name}</h4>
                      <p className="text-sm text-gray-400 capitalize">{court.sport}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold">
                        ${court.pricePerHour.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">por hora</p>
                    </div>
                  </div>
                  {selectedCourt === court.id && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-sm text-gray-300">
                        Total por {selectedDuration} min: 
                        <span className="text-emerald-400 font-semibold ml-2">
                          ${(selectedDuration === 60 
                            ? court.pricePerHour 
                            : selectedDuration === 90 
                              ? (court.pricePerHour90 || court.pricePerHour * 1.5)
                              : (court.pricePerHour120 || court.pricePerHour * 2)
                          ).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {availableCourtsAtTime.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                No hay canchas disponibles en este horario
              </p>
            )}
          </div>
        );

      case 'player':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Datos del Jugador</h3>
              {clientMode !== 'search' && (
                <button
                  onClick={handleBackToSearch}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Cambiar cliente
                </button>
              )}
            </div>
            
            {/* Search Mode */}
            {clientMode === 'search' && (
              <div className="space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar cliente por nombre o teléfono..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="bg-gray-700/50 rounded-xl border border-gray-600 max-h-48 overflow-y-auto">
                    {searchResults.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className="w-full p-3 text-left hover:bg-gray-600/50 transition-colors border-b border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{client.name}</div>
                            <div className="text-sm text-gray-400">{client.phone || 'Sin teléfono'}</div>
                          </div>
                          <div className="text-right text-xs">
                            <div className="text-gray-400">{client.totalBookings} turnos</div>
                            {client.noShows > 0 && (
                              <div className="text-yellow-400">{client.noShows} ausencias</div>
                            )}
                            {client.hasDebt && (
                              <div className="text-red-400">Tiene deuda</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No se encontraron clientes
                  </div>
                )}

                {/* Create New Client Button */}
                <button
                  onClick={() => setClientMode('create')}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-emerald-400 transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Crear nuevo cliente</span>
                </button>
              </div>
            )}

            {/* Create Mode - Show form fields */}
            {clientMode === 'create' && (
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Nombre del cliente"
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    WhatsApp <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      placeholder="+54 9 11 1234-5678"
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email (opcional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={playerEmail}
                      onChange={(e) => setPlayerEmail(e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Selected Mode - Show selected client info */}
            {clientMode === 'selected' && selectedClient && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{selectedClient.name}</h4>
                    <p className="text-sm text-gray-400">{selectedClient.phone || selectedClient.email}</p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-gray-400">{selectedClient.totalBookings} turnos</div>
                    {selectedClient.noShows > 0 && (
                      <div className="text-yellow-400">{selectedClient.noShows} ausencias</div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment method - Show in all modes */}
            <div className="pt-4 border-t border-gray-700">
              <label className="block text-sm text-gray-400 mb-2">
                Método de pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.code)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === method.code
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <span className="block text-sm text-gray-300">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Seña / Adelanto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  max={calculatePrice()}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Math.min(Number(e.target.value) || 0, calculatePrice()))}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-400">Total: ${calculatePrice().toLocaleString()}</span>
                <span className="text-gray-400">
                  Pendiente: <span className={depositAmount >= calculatePrice() ? 'text-emerald-400' : 'text-yellow-400'}>
                    ${(calculatePrice() - depositAmount).toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
          </div>
        );

      case 'confirmation':
        const recurringDates = getRecurringDates();
        const totalPrice = calculatePrice() * recurringDates.length;
        const unresolvedConflicts = availabilityResults.filter(r => !r.available && !r.resolved);
        const resolvedConflicts = availabilityResults.filter(r => !r.available && r.resolved);
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Confirmar Reserva{isRecurring ? 's' : ''}
            </h3>
            
            {/* Conflicts Section for Recurring */}
            {isRecurring && hasConflicts && (
              <div className="space-y-3">
                {/* Unresolved Conflicts */}
                {unresolvedConflicts.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <span className="text-red-400 font-medium">
                        {unresolvedConflicts.length} fecha{unresolvedConflicts.length > 1 ? 's' : ''} con conflicto
                      </span>
                    </div>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {unresolvedConflicts.map((result: any) => (
                        <div key={result.date} className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium text-sm">{formatDate(result.date)}</span>
                            <span className="text-red-400 text-xs">Ocupado</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">
                            {result.conflict?.courtName} ocupada {result.conflict?.existingBooking?.startTime}-{result.conflict?.existingBooking?.endTime}
                          </p>
                          
                          {/* Alternatives */}
                          {result.alternatives && result.alternatives.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 mb-1">Alternativas:</p>
                              {result.alternatives.map((alt: any, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => applyAlternative(result.date, { courtId: alt.courtId, time: alt.time })}
                                  className="w-full text-left px-2 py-1.5 bg-gray-700 hover:bg-emerald-600/20 rounded text-xs transition-colors flex items-center justify-between"
                                >
                                  <span className="text-gray-300 flex items-center">
                                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                    {alt.type === 'different_court' ? (
                                      <span>{alt.time} - {alt.courtName}</span>
                                    ) : (
                                      <span>{alt.time}hs</span>
                                    )}
                                  </span>
                                  <span className="text-emerald-400">${alt.price?.toLocaleString()}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Resolved Conflicts */}
                {resolvedConflicts.length > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-medium">
                        {resolvedConflicts.length} conflicto{resolvedConflicts.length > 1 ? 's' : ''} resuelto{resolvedConflicts.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {resolvedConflicts.map((result: any) => {
                        const alt = result.selectedAlternative;
                        const altCourt = courts.find(c => c.id === alt?.courtId);
                        return (
                          <div key={result.date} className="flex items-center justify-between text-gray-300">
                            <span>{formatDate(result.date)}</span>
                            <span className="text-emerald-400">
                              {alt?.time !== selectedTime ? `${alt?.time}hs` : altCourt?.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Loading state for availability check */}
            {isCheckingAvailability && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400 mr-2" />
                <span className="text-gray-400">Verificando disponibilidad...</span>
              </div>
            )}
            
            <div className="bg-gray-700/50 rounded-xl p-4 space-y-4">
              {/* Sport */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Deporte</span>
                <span className="text-white font-medium capitalize">{selectedSport}</span>
              </div>
              
              {/* Date(s) */}
              {isRecurring ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Fechas</span>
                    <span className="text-blue-400 font-medium flex items-center">
                      <Repeat className="h-4 w-4 mr-1" />
                      {recurringDates.length} reservas
                    </span>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2 max-h-24 overflow-y-auto">
                    <div className="text-xs text-gray-300 space-y-1">
                      {recurringDates.map((date, index) => {
                        const override = dateOverrides.get(date);
                        const conflict = availabilityResults.find(r => r.date === date && !r.available);
                        return (
                          <div key={date} className="flex items-center justify-between">
                            <span className={conflict && !conflict.resolved ? 'text-red-400' : ''}>
                              {index + 1}. {formatDate(date)}
                            </span>
                            {override && (
                              <span className="text-emerald-400 text-xs">
                                {override.time !== selectedTime ? override.time : courts.find(c => c.id === override.courtId)?.name}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Fecha</span>
                  <span className="text-white font-medium">{formatDate(selectedDate)}</span>
                </div>
              )}
              
              {/* Time */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Hora</span>
                <span className="text-white font-medium">{selectedTime} ({selectedDuration} min)</span>
              </div>
              
              {/* Court */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Cancha</span>
                <span className="text-white font-medium">{selectedCourtInfo?.name}</span>
              </div>
              
              <div className="border-t border-gray-600 my-2" />
              
              {/* Player */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Jugador</span>
                <div className="flex items-center">
                  {clientMode === 'create' && (
                    <span className="text-emerald-400 text-xs mr-2 bg-emerald-400/10 px-2 py-0.5 rounded">NUEVO</span>
                  )}
                  <span className="text-white font-medium">{playerName}</span>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">WhatsApp</span>
                <span className="text-white font-medium">{playerPhone}</span>
              </div>
              
              {/* Email */}
              {playerEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white font-medium">{playerEmail}</span>
                </div>
              )}
              
              {/* Payment */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Método de pago</span>
                <span className="text-white font-medium">
                  {paymentMethods.find(m => m.code === paymentMethod)?.name}
                </span>
              </div>
              
              <div className="border-t border-gray-600 my-2" />
              
              {/* Price per reservation */}
              {isRecurring && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Precio por reserva</span>
                  <span className="text-gray-300">${calculatePrice().toLocaleString()}</span>
                </div>
              )}
              
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-300">
                  {isRecurring ? 'Total (' + recurringDates.length + ' reservas)' : 'Total'}
                </span>
                <span className="text-2xl font-bold text-emerald-400">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>

              {/* Deposit info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Seña abonada</span>
                <span className={depositAmount > 0 ? 'text-emerald-400 font-medium' : 'text-gray-500'}>
                  ${depositAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pendiente a pagar</span>
                <span className={`font-medium ${(totalPrice - depositAmount) > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  ${(totalPrice - depositAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-800 border-l border-gray-700 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Nueva Reserva</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Progress steps */}
            <div className="px-4 py-3 border-b border-gray-700">
              <div className="flex items-center justify-between">
                {STEPS.map((step, index) => {
                  const currentIndex = STEPS.findIndex(s => s.key === currentStep);
                  const isCompleted = index < currentIndex;
                  const isCurrent = step.key === currentStep;
                  const Icon = step.icon;
                  
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center transition-colors
                            ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                            ${isCurrent ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500' : ''}
                            ${!isCompleted && !isCurrent ? 'bg-gray-700 text-gray-400' : ''}
                          `}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <span className={`text-xs mt-1 ${isCurrent ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {step.label}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 ${
                            index < currentIndex ? 'bg-emerald-500' : 'bg-gray-700'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex items-center justify-between">
              <button
                onClick={goToPrevStep}
                disabled={currentStep === 'sport'}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors
                  ${currentStep === 'sport' 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Anterior</span>
              </button>
              
              {currentStep === 'confirmation' ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                  <span>{isSubmitting ? 'Creando...' : 'Confirmar Reserva'}</span>
                </button>
              ) : (
                <button
                  onClick={goToNextStep}
                  disabled={!canProceed()}
                  className={`
                    flex items-center space-x-2 px-6 py-2 rounded-xl transition-colors
                    ${canProceed()
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateReservationSidebar;
