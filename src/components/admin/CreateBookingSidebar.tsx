'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  UserPlus,
  ArrowLeft
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useEstablishment } from '@/contexts/EstablishmentContext';

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
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  priceSchedules?: PriceSchedule[];
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
  capacity?: number;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  noShows: number;
  hasDebt: boolean;
}

interface ExistingReservation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  duration: number;
  notes?: string;
  depositAmount?: number;
  depositMethod?: string;
  bookingType?: string;
  date?: string;
  startTime?: string;
}

interface ExistingBooking {
  id: string;
  courtId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: string;
}

interface CreateBookingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingData: any) => Promise<void>;
  court: Court | null;
  selectedTime: string;
  selectedDate: Date;
  editingReservation?: ExistingReservation | null;
  onUpdate?: (reservationId: string, data: any) => Promise<void>;
  existingBookings?: ExistingBooking[];
  requestPin?: (action: () => void, options?: { title?: string; description?: string }) => void;
  amenities?: Amenity[];
}

const DURATION_OPTIONS = [
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 min' },
  { value: 120, label: '2 horas' },
];

const BOOKING_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'profesor', label: 'Profesor' },
  { value: 'torneo', label: 'Torneo' },
  { value: 'escuela', label: 'Escuela' },
  { value: 'cumpleanos', label: 'Cumpleaños' },
  { value: 'abonado', label: 'Abonado' },
];

export const CreateBookingSidebar: React.FC<CreateBookingSidebarProps> = ({
  isOpen,
  onClose,
  onSuccess,
  court,
  selectedTime,
  selectedDate,
  editingReservation,
  onUpdate,
  existingBookings = [],
  requestPin,
  amenities = []
}) => {
  const isEditMode = !!editingReservation;
  const { establishment } = useEstablishment();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Client search state
  const [clientMode, setClientMode] = useState<'search' | 'create' | 'selected'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    duration: 60,
    bookingType: 'normal',
    isRecurring: false,
    depositAmount: 0,
    depositMethod: 'efectivo',
    notes: '',
    selectedAmenityIds: [] as string[],
  });
  
  // Recurring booking (Turno Fijo) state
  const [recurringWeeks, setRecurringWeeks] = useState(8);
  
  // State for editable date and time (only used in edit mode)
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');

  // State for custom duration
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [customDurationMinutes, setCustomDurationMinutes] = useState(60);

  // Dynamic price calculation state
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate maximum available duration from selected time
  const maxAvailableDuration = React.useMemo(() => {
    if (!court || !selectedTime) return 480; // Default 8 hours max
    
    const [startHours, startMinutes] = selectedTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    
    // Find the next booking on this court after the selected time
    const courtBookingsForThisCourt = existingBookings.filter(b => 
      b.courtId === court.id && b.status !== 'cancelled'
    );
    
    const courtBookings = courtBookingsForThisCourt
      .map(b => {
        const [h, m] = b.startTime.split(':').map(Number);
        return h * 60 + m;
      })
      .filter(bookingStart => bookingStart > startTotalMinutes)
      .sort((a, b) => a - b);
    
    // Also consider end of day (23:00 = 1380 minutes)
    const endOfDay = 23 * 60;
    const nextBlocker = courtBookings.length > 0 ? courtBookings[0] : endOfDay;
    
    const maxDuration = nextBlocker - startTotalMinutes;
    
    // Debug log
    console.log('Duration calculation:', {
      court: court.name,
      courtId: court.id,
      selectedTime,
      startTotalMinutes,
      existingBookingsCount: existingBookings.length,
      courtBookingsCount: courtBookingsForThisCourt.length,
      nextBlocker,
      maxDuration
    });
    
    return maxDuration;
  }, [court, selectedTime, existingBookings]);

  // Reset form when sidebar opens or load existing reservation data
  useEffect(() => {
    if (isOpen) {
      if (editingReservation) {
        // Edit mode - preload data
        const duration = editingReservation.duration || 60;
        const isCustomDuration = ![60, 90, 120].includes(duration);
        
        setFormData({
          clientName: editingReservation.clientName || '',
          clientPhone: editingReservation.clientPhone || '',
          clientEmail: editingReservation.clientEmail || '',
          duration: duration,
          bookingType: editingReservation.bookingType || 'normal',
          isRecurring: false,
          depositAmount: editingReservation.depositAmount || 0,
          depositMethod: editingReservation.depositMethod || 'efectivo',
          notes: editingReservation.notes || '',
          selectedAmenityIds: [],
        });
        
        // Handle custom duration
        if (isCustomDuration) {
          setShowCustomDuration(true);
          setCustomDurationMinutes(duration);
        } else {
          setShowCustomDuration(false);
        }
        
        // Initialize date and time for editing
        if (editingReservation.date) {
          setEditDate(editingReservation.date);
        } else {
          // Fallback to selectedDate
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          setEditDate(`${year}-${month}-${day}`);
        }
        setEditTime(editingReservation.startTime || selectedTime);
        
        setClientMode('selected');
        setSelectedClient({
          id: 'existing',
          name: editingReservation.clientName,
          phone: editingReservation.clientPhone,
          email: editingReservation.clientEmail,
          totalBookings: 0,
          noShows: 0,
          hasDebt: false
        });
      } else {
        // Create mode - reset form
        setFormData({
          clientName: '',
          clientPhone: '',
          clientEmail: '',
          duration: 60,
          bookingType: 'normal',
          isRecurring: false,
          depositAmount: 0,
          depositMethod: 'efectivo',
          notes: '',
          selectedAmenityIds: [],
        });
        setClientMode('search');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedClient(null);
        setShowCustomDuration(false);
        setCustomDurationMinutes(60);
      }
    }
  }, [isOpen, editingReservation]);

  // Search clients
  useEffect(() => {
    const searchClients = async () => {
      if (!establishment?.id || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await apiClient.searchClients(establishment.id, searchQuery) as any;
        setSearchResults(response.data || []);
      } catch (error) {
        console.error('Error searching clients:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchClients, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, establishment?.id]);

  // Select a client from search results
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientName: client.name,
      clientPhone: client.phone || '',
      clientEmail: client.email || ''
    }));
    setClientMode('selected');
  };

  // Create new client
  const handleCreateClient = async () => {
    if (!establishment?.id || !formData.clientName.trim()) return;
    
    setIsCreatingClient(true);
    try {
      const response = await apiClient.createClient(establishment.id, {
        name: formData.clientName,
        phone: formData.clientPhone,
        email: formData.clientEmail
      }) as any;
      
      const newClient = response.data;
      setSelectedClient(newClient);
      setClientMode('selected');
    } catch (error: any) {
      // If client already exists, use the existing one
      if (error.message?.includes('already exists')) {
        alert('Ya existe un cliente con ese teléfono');
      } else {
        console.error('Error creating client:', error);
        alert('Error al crear el cliente');
      }
    } finally {
      setIsCreatingClient(false);
    }
  };

  // Go back to search mode
  const handleBackToSearch = () => {
    setClientMode('search');
    setSelectedClient(null);
    setFormData(prev => ({
      ...prev,
      clientName: '',
      clientPhone: '',
      clientEmail: ''
    }));
  };

  // Fetch dynamic price when court, date, time or duration changes
  useEffect(() => {
    const fetchDynamicPrice = async () => {
      if (!court || !selectedDate || !selectedTime || !formData.duration) {
        setCalculatedPrice(null);
        return;
      }

      setIsCalculatingPrice(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + formData.duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        
        const response = await fetch(
          `${API_URL}/api/courts/${court.id}/calculate-price?startTime=${selectedTime}&endTime=${endTime}&date=${selectedDate}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setCalculatedPrice(data.totalPrice);
        } else {
          setCalculatedPrice(null);
        }
      } catch (err) {
        console.error('Error fetching dynamic price:', err);
        setCalculatedPrice(null);
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    fetchDynamicPrice();
  }, [court, selectedDate, selectedTime, formData.duration]);

  // Calculate price based on duration
  const calculatePrice = (): number => {
    // Use calculated price from backend if available
    if (calculatedPrice !== null) return calculatedPrice;
    
    // Fallback to simple calculation
    if (!court) return 0;
    
    let courtPrice = 0;
    switch (formData.duration) {
      case 60:
        courtPrice = court.pricePerHour;
        break;
      case 90:
        courtPrice = court.pricePerHour90 || court.pricePerHour * 1.5;
        break;
      case 120:
        courtPrice = court.pricePerHour120 || court.pricePerHour * 2;
        break;
      default:
        // For custom durations, calculate proportionally based on price per hour
        courtPrice = Math.round((court.pricePerHour / 60) * formData.duration);
    }
    
    return courtPrice;
  };

  // Calculate end time
  const calculateEndTime = (): string => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + formData.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date without timezone issues
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (!court || !formData.clientName.trim()) return;
    
    // Validate that the booking is not in the past
    const now = new Date();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDateTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hours, minutes);
    
    if (bookingDateTime <= now) {
      alert('No se puede crear una reserva en un horario pasado.');
      return;
    }
    
    const executeSubmit = async () => {
      setIsSubmitting(true);
      try {
        // Determine if this is a court or amenity booking
        const isAmenityBooking = court.sport === 'amenity';
        
        // Use edited date/time in edit mode, otherwise use selected values
        const finalDate = isEditMode && editDate ? editDate : formatDateForAPI(selectedDate);
        const finalTime = isEditMode && editTime ? editTime : selectedTime;
        
        // Calculate end time based on the final start time
        const calculateFinalEndTime = (): string => {
          const [hours, minutes] = finalTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + formData.duration;
          const endHours = Math.floor(totalMinutes / 60);
          const endMinutes = totalMinutes % 60;
          return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        };
        
        // Use new recurring booking API for turnos fijos (non-amenity only)
        if (formData.isRecurring && !isAmenityBooking && establishment?.id) {
          const response = await apiClient.createRecurringBooking({
            establishmentId: establishment.id,
            courtId: court.id,
            clientId: selectedClient?.id !== 'existing' ? selectedClient?.id : undefined,
            clientName: formData.clientName,
            clientPhone: formData.clientPhone,
            clientEmail: formData.clientEmail || undefined,
            startDate: finalDate,
            startTime: finalTime,
            duration: formData.duration,
            sport: court.sport,
            bookingType: formData.bookingType,
            totalWeeks: recurringWeeks,
            pricePerBooking: calculatePrice(),
            notes: formData.notes || `Turno fijo - ${formData.depositMethod}`,
            initialPayment: formData.depositAmount > 0 ? {
              amount: formData.depositAmount,
              method: formData.depositMethod
            } : undefined
          }) as any;
          
          if (response.success) {
            alert(`Turno fijo creado con ${response.bookings?.length || recurringWeeks} reservas`);
            // Just close - the recurring booking was already created via API
            // Don't call onSuccess as it would try to create another booking
            onClose();
            // Force page refresh to show new bookings
            window.location.reload();
          } else {
            throw new Error(response.error || 'Error al crear turno fijo');
          }
          return;
        }
        
        // Regular booking flow
        const bookingData: Record<string, any> = {
          date: finalDate,
          startTime: finalTime,
          endTime: calculateFinalEndTime(),
          duration: formData.duration,
          totalAmount: calculatePrice(),
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          clientEmail: formData.clientEmail,
          bookingType: formData.bookingType,
          isRecurring: false,
          depositAmount: formData.depositAmount,
          depositMethod: formData.depositMethod,
          notes: formData.notes,
          status: 'confirmed',
        };
        
        if (isAmenityBooking) {
          bookingData.amenityId = court.id;
        } else {
          bookingData.courtId = court.id;
        }
        
        if (isEditMode && editingReservation && onUpdate) {
          await onUpdate(editingReservation.id, bookingData);
        } else {
          await onSuccess(bookingData);
        }
        onClose();
      } catch (error: any) {
        console.error('Error saving booking:', error);
        const errorMessage = error?.message || '';
        if (errorMessage.includes('Ya existe una reserva') || errorMessage.includes('conflict')) {
          alert('El horario seleccionado se superpone con otra reserva existente. Por favor elige otro horario o reduce la duración.');
        } else {
          alert(isEditMode ? 'Error al actualizar la reserva.' : 'Error al crear la reserva. Por favor intenta de nuevo.');
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    // Use PIN validation if available
    if (requestPin) {
      requestPin(executeSubmit, { 
        title: isEditMode ? 'Editar reserva' : formData.isRecurring ? 'Crear turno fijo' : 'Crear reserva', 
        description: 'Ingresa tu PIN para confirmar' 
      });
    } else {
      await executeSubmit();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && court && (
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
            className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-800 border-l border-gray-700 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditMode ? 'Editar Reserva' : `Crear Turno ${selectedTime}hs`}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {court.name}
                  </span>
                  <span>•</span>
                  <span>{formatDate(selectedDate)}</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Client Info Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Jugador
                  </h3>
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
                          value={formData.clientName}
                          onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                          placeholder="Nombre del cliente"
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.clientPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
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
                          value={formData.clientEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                          placeholder="email@ejemplo.com"
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Save Client Button */}
                    <button
                      onClick={handleCreateClient}
                      disabled={!formData.clientName.trim() || isCreatingClient}
                      className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-colors ${
                        formData.clientName.trim() && !isCreatingClient
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isCreatingClient ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          <span>Guardar y continuar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Selected Mode - Show selected client info */}
                {clientMode === 'selected' && selectedClient && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">
                          {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{selectedClient.name}</div>
                        <div className="text-sm text-gray-400">
                          {selectedClient.phone || 'Sin teléfono'}
                          {selectedClient.email && ` • ${selectedClient.email}`}
                        </div>
                      </div>
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                    {(selectedClient.noShows > 0 || selectedClient.hasDebt) && (
                      <div className="mt-3 pt-3 border-t border-emerald-500/30 flex gap-3 text-xs">
                        {selectedClient.noShows > 0 && (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {selectedClient.noShows} ausencias
                          </span>
                        )}
                        {selectedClient.hasDebt && (
                          <span className="text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Tiene deuda
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Booking Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Características del Turno
                </h3>

                {/* Sport (auto-detected) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deporte
                  </label>
                  <div className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-300 capitalize">
                    {court.sport}
                  </div>
                </div>

                {/* Recurring */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor="isRecurring" className="text-sm text-gray-300">
                      Turno fijo (se repite semanalmente)
                    </label>
                  </div>
                  
                  {/* Recurring weeks selector */}
                  {formData.isRecurring && (
                    <div className="ml-7 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-3">
                      <label className="block text-sm font-medium text-blue-300">
                        Cantidad de semanas
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          value={recurringWeeks}
                          onChange={(e) => setRecurringWeeks(Math.max(1, Number(e.target.value) || 1))}
                          className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Semanas"
                        />
                        <span className="text-gray-400 text-sm">semanas</span>
                      </div>
                      
                      {/* Upcoming dates preview */}
                      <div className="bg-gray-800/50 rounded-lg p-2 max-h-40 overflow-y-auto">
                        <p className="text-xs text-gray-400 mb-2 sticky top-0 bg-gray-800/90 py-1">
                          📅 Fechas del turno fijo:
                        </p>
                        <div className="space-y-1">
                          {Array.from({ length: recurringWeeks }).map((_, idx) => {
                            const bookingDate = new Date(selectedDate);
                            bookingDate.setDate(bookingDate.getDate() + (idx * 7));
                            const isFirst = idx === 0;
                            return (
                              <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-gray-700/50 last:border-0">
                                <span className={isFirst ? 'text-blue-400 font-medium' : 'text-gray-300'}>
                                  {idx + 1}. {bookingDate.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                                <span className="text-gray-400">
                                  {selectedTime}hs
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs pt-2 border-t border-blue-500/30">
                        <span className="text-gray-400">Total:</span>
                        <span className="text-blue-300 font-medium">
                          {recurringWeeks} turnos = ${(calculatePrice() * recurringWeeks).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de turno
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BOOKING_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData(prev => ({ ...prev, bookingType: type.value }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.bookingType === type.value
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date and Time - Only in Edit Mode */}
                {isEditMode && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hora
                      </label>
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duración
                    {maxAvailableDuration < 120 && (
                      <span className="ml-2 text-xs text-yellow-400">
                        (máx. {maxAvailableDuration} min disponibles)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {DURATION_OPTIONS.map((option) => {
                      const isDisabled = option.value > maxAvailableDuration;
                      return (
                        <button
                          key={option.value}
                          onClick={() => !isDisabled && setFormData(prev => ({ ...prev, duration: option.value }))}
                          disabled={isDisabled}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isDisabled
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : formData.duration === option.value && !showCustomDuration
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                          title={isDisabled ? `No hay ${option.value} min disponibles` : ''}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                    {/* Custom duration button */}
                    <button
                      onClick={() => {
                        setShowCustomDuration(!showCustomDuration);
                        if (!showCustomDuration) {
                          setCustomDurationMinutes(Math.min(60, maxAvailableDuration));
                        }
                      }}
                      disabled={maxAvailableDuration < 30}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        maxAvailableDuration < 30
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : showCustomDuration
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Otro
                    </button>
                  </div>
                  
                  {/* Custom duration input */}
                  {showCustomDuration && (
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="number"
                        min={30}
                        max={maxAvailableDuration}
                        step={30}
                        value={customDurationMinutes}
                        onChange={(e) => {
                          const val = Math.min(Math.max(30, parseInt(e.target.value) || 30), maxAvailableDuration);
                          setCustomDurationMinutes(val);
                          setFormData(prev => ({ ...prev, duration: val }));
                        }}
                        className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center"
                      />
                      <span className="text-gray-400 text-sm">minutos</span>
                      <span className="text-xs text-gray-500">(máx. {maxAvailableDuration} min)</span>
                    </div>
                  )}
                </div>


                {/* Price Display */}
                <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Precio</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(calculatePrice())}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {selectedTime} - {calculateEndTime()} ({formData.duration} min)
                  </div>
                </div>

                {/* Deposit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Seña / Adelanto
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.depositAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <select
                      value={formData.depositMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositMethod: e.target.value }))}
                      className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="mercadopago">MercadoPago</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notas adicionales..."
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || clientMode !== 'selected'}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors
                  ${clientMode === 'selected' && !isSubmitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{isEditMode ? 'Guardando...' : 'Creando...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>{isEditMode ? 'Guardar Cambios' : 'Crear'}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CreateBookingSidebar;
