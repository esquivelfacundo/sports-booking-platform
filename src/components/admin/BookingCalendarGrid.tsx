'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock,
  User,
  Phone,
  GripVertical,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Court {
  id: string;
  name: string;
  sport: string;
  pricePerHour: number;
}

interface Amenity {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  pricePerHour: number;
  isBookable: boolean;
  isPublic: boolean;
  isActive: boolean;
}

interface Booking {
  id: string;
  courtId?: string;
  amenityId?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  clientName: string;
  clientPhone?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'cancelled' | 'completed' | 'no_show';
  isRecurring?: boolean;
  price?: number;
  depositAmount?: number;
}

interface BookingCalendarGridProps {
  courts: Court[];
  bookings: Booking[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSlotClick: (courtId: string, time: string, date: Date) => void;
  onBookingClick: (booking: Booking) => void;
  onBookingMove?: (bookingId: string, newCourtId: string, newStartTime: string) => void;
  onBookingCancel?: (bookingId: string) => void;
  startHour?: number;
  endHour?: number;
  amenities?: Amenity[];
}

// Parse time string (handles both HH:MM and HH:MM:SS formats)
const parseTimeToMinutes = (time: string): number => {
  if (!time) return 0;
  const parts = time.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

// Check if a time slot is in the post-midnight range (belongs to next calendar day)
const isTimePostMidnight = (time: string, startHour: number, endHour: number): boolean => {
  if (endHour <= 24) return false; // No midnight crossing
  const [hours] = time.split(':').map(Number);
  // Post-midnight slots have hours < endHour-24 (e.g., 00:xx, 01:xx for endHour=25)
  return hours < (endHour - 24);
};

// Get the next day date from a given date
const getNextDay = (date: Date): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
};

// Get the actual calendar date for a slot (next day if post-midnight)
const getSlotDate = (time: string, selectedDate: Date, startHour: number, endHour: number): Date => {
  if (isTimePostMidnight(time, startHour, endHour)) {
    return getNextDay(selectedDate);
  }
  return selectedDate;
};

// Generate time slots for the day (supports endHour > 24 for midnight-crossing schedules)
const generateTimeSlots = (startHour: number, endHour: number): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const displayHour = hour % 24;
    slots.push(`${displayHour.toString().padStart(2, '0')}:00`);
    slots.push(`${displayHour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Format date for comparison (without timezone issues)
const formatDateForComparison = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Check if a slot is booked
const getBookingForSlot = (
  bookings: Booking[], 
  courtId: string, 
  time: string, 
  date: Date
): Booking | null => {
  const dateStr = formatDateForComparison(date);
  
  return bookings.find(booking => {
    // Skip cancelled bookings
    if (booking.status === 'cancelled') return false;
    if (booking.courtId !== courtId || booking.date !== dateStr) return false;
    
    // Parse times - handle both HH:MM and HH:MM:SS formats
    const parseTime = (t: string): number => {
      const parts = t.split(':');
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };
    
    const slotMinutes = parseTime(time);
    const startMinutes = parseTime(booking.startTime);
    const endMinutes = startMinutes + booking.duration;
    
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  }) || null;
};

// Check if this is the first slot of a booking
const isFirstSlotOfBooking = (
  booking: Booking,
  time: string
): boolean => {
  // Normalize both times to HH:MM for comparison
  const normalizeTime = (t: string): string => t.substring(0, 5);
  return normalizeTime(booking.startTime) === normalizeTime(time);
};

// Get booking span (number of 30-min slots)
const getBookingSpan = (booking: Booking): number => {
  return Math.ceil(booking.duration / 30);
};

export const BookingCalendarGrid: React.FC<BookingCalendarGridProps> = ({
  courts,
  bookings,
  selectedDate,
  onDateChange,
  onSlotClick,
  onBookingClick,
  onBookingMove,
  onBookingCancel,
  startHour = 8,
  endHour = 23,
  amenities = []
}) => {
  const timeSlots = useMemo(() => generateTimeSlots(startHour, endHour), [startHour, endHour]);
  
  // Drag and drop state - DISABLED FOR NOW
  // const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  // const [dropTarget, setDropTarget] = useState<{ courtId: string; time: string } | null>(null);
  const draggedBooking = null as Booking | null; // Placeholder to avoid breaking references
  const dropTarget = null as { courtId: string; time: string } | null; // Placeholder
  
  // Mobile state - selected court index for swipe
  const [mobileCourtIndex, setMobileCourtIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  // Current time indicator state (only for today)
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null);
  
  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Calculate current time position (only for today)
  useEffect(() => {
    const updateCurrentTimePosition = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      // Only show indicator if selected date is today
      if (selectedDay.getTime() !== today.getTime()) {
        setCurrentTimePosition(null);
        return;
      }
      
      // Calculate position based on current time
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      let currentTotalMinutes = currentHours * 60 + currentMinutes;
      const startTotalMinutes = startHour * 60;
      
      // If schedule crosses midnight and current time is post-midnight, add 1440
      if (endHour > 24 && currentTotalMinutes < startTotalMinutes) {
        currentTotalMinutes += 1440;
      }
      
      // Only show if current time is within grid range
      if (currentTotalMinutes < startTotalMinutes || currentTotalMinutes >= endHour * 60) {
        setCurrentTimePosition(null);
        return;
      }
      
      // Calculate position: each slot is 30 minutes and 33px (slotHeight)
      const minutesFromStart = currentTotalMinutes - startTotalMinutes;
      const slotHeight = 33;
      let position = (minutesFromStart / 30) * slotHeight;
      // Add separator height offset if current time is in the post-midnight range
      if (endHour > 24 && currentHours * 60 + currentMinutes < startTotalMinutes) {
        position += 26; // DAY_SEPARATOR_HEIGHT
      }
      
      setCurrentTimePosition(position);
    };
    
    // Update immediately
    updateCurrentTimePosition();
    
    // Update every minute
    const interval = setInterval(updateCurrentTimePosition, 60000);
    
    return () => clearInterval(interval);
  }, [selectedDate, startHour, endHour]);
  
  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && mobileCourtIndex < courts.length - 1) {
        // Swipe left - next court
        setMobileCourtIndex(prev => prev + 1);
      } else if (diff < 0 && mobileCourtIndex > 0) {
        // Swipe right - previous court
        setMobileCourtIndex(prev => prev - 1);
      }
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };
  
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };
  
  const goToToday = () => {
    onDateChange(new Date());
  };

  // Pre-calculate which slots have bookings (for blocking clicks on occupied slots)
  // This now excludes the dragged booking so we can move it to adjacent slots
  const slotData = useMemo(() => {
    const data: Record<string, { booking: Booking | null }> = {};
    const dateStr = formatDateForComparison(selectedDate);
    const nextDateStr = formatDateForComparison(getNextDay(selectedDate));
    
    // Filter active bookings, excluding the one being dragged
    // Include both selectedDate and next day (for post-midnight slots)
    const activeBookings = bookings.filter(b => 
      b.status !== 'cancelled' && 
      (b.date === dateStr || b.date === nextDateStr) &&
      b.id !== draggedBooking?.id // Exclude dragged booking
    );
    
    // Combine courts and bookable amenities for slot calculation
    const allItems = [
      ...courts,
      ...(amenities?.filter(a => a.isBookable && a.isActive) || []).map(a => ({ id: a.id, name: a.name, sport: 'amenity', pricePerHour: a.pricePerHour }))
    ];
    
    timeSlots.forEach(time => {
      // Determine which date this slot belongs to
      const slotDateStr = isTimePostMidnight(time, startHour, endHour) ? nextDateStr : dateStr;
      
      allItems.forEach(item => {
        const key = `${item.id}-${time}`;
        const booking = activeBookings.find(b => {
          // Match by courtId OR amenityId
          const matchesItem = b.courtId === item.id || b.amenityId === item.id;
          if (!matchesItem) return false;
          // Match by the slot's actual date
          if (b.date !== slotDateStr) return false;
          
          const slotMinutes = parseTimeToMinutes(time);
          const startMinutes = parseTimeToMinutes(b.startTime);
          const endMinutes = startMinutes + b.duration;
          
          return slotMinutes >= startMinutes && slotMinutes < endMinutes;
        });
        
        data[key] = { booking: booking || null };
      });
    });
    
    return data;
  }, [bookings, courts, amenities, timeSlots, selectedDate, draggedBooking]);

  // Drag and drop handlers - DISABLED FOR NOW
  // TODO: Re-enable when drag and drop functionality is properly implemented
  /*
  const handleDragStart = useCallback((e: React.DragEvent, booking: Booking) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', booking.id);
    
    requestAnimationFrame(() => {
      (e.target as HTMLElement).style.opacity = '0';
      setDraggedBooking(booking);
    });
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedBooking(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, courtId: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const key = `${courtId}-${time}`;
    const slot = slotData[key];
    
    if (!slot?.booking || slot.booking.id === draggedBooking?.id) {
      setDropTarget({ courtId, time });
    }
  }, [draggedBooking, slotData]);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, courtId: string, time: string) => {
    e.preventDefault();
    
    if (draggedBooking && onBookingMove) {
      const dateStr = formatDateForComparison(selectedDate);
      const parseTime = (t: string): number => {
        const parts = t.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      };
      
      const newStartMinutes = parseTime(time);
      const newEndMinutes = newStartMinutes + draggedBooking.duration;
      
      const hasConflict = bookings.some(b => {
        if (b.id === draggedBooking.id) return false;
        if (b.courtId !== courtId || b.date !== dateStr) return false;
        if (b.status === 'cancelled') return false;
        
        const existingStart = parseTime(b.startTime);
        const existingEnd = existingStart + b.duration;
        
        return (newStartMinutes < existingEnd && newEndMinutes > existingStart);
      });
      
      if (!hasConflict) {
        onBookingMove(draggedBooking.id, courtId, time);
      } else {
        console.warn('Cannot move booking: slot is occupied');
      }
    }
    
    setDraggedBooking(null);
    setDropTarget(null);
  }, [draggedBooking, onBookingMove, bookings, selectedDate]);
  */
  
  // Placeholder functions to avoid breaking references
  const handleDragStart = useCallback((e: React.DragEvent, booking: Booking) => {
    e.preventDefault();
  }, []);
  const handleDragEnd = useCallback((e: React.DragEvent) => {}, []);
  const handleDragOver = useCallback((e: React.DragEvent, courtId: string, time: string) => {
    e.preventDefault();
  }, []);
  const handleDragLeave = useCallback(() => {}, []);
  const handleDrop = useCallback((e: React.DragEvent, courtId: string, time: string) => {
    e.preventDefault();
  }, []);

  // Check if a slot can accept a drop
  const canDropOnSlot = useCallback((courtId: string, time: string): boolean => {
    if (!draggedBooking) return false;
    
    const dateStr = formatDateForComparison(selectedDate);
    
    const newStartMinutes = parseTimeToMinutes(time);
    const newEndMinutes = newStartMinutes + draggedBooking.duration;
    
    // Check for conflicts
    return !bookings.some(b => {
      if (b.id === draggedBooking.id) return false; // Exclude the booking being dragged
      if (b.courtId !== courtId || b.date !== dateStr) return false;
      if (b.status === 'cancelled') return false;
      
      const existingStart = parseTimeToMinutes(b.startTime);
      // Use endTime if available, otherwise calculate from duration
      const existingEnd = b.endTime 
        ? parseTimeToMinutes(b.endTime)
        : existingStart + b.duration;
      
      return (newStartMinutes < existingEnd && newEndMinutes > existingStart);
    });
  }, [draggedBooking, bookings, selectedDate]);

  // Check if a time slot is in the past (for today only)
  // Post-midnight slots belong to the next calendar day
  const isSlotInPast = useCallback((time: string): boolean => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const postMidnight = isTimePostMidnight(time, startHour, endHour);
    
    // The actual date this slot belongs to
    const slotDay = postMidnight ? getNextDay(selectedDay) : selectedDay;
    
    // If slot's actual date is in the past, it's past
    if (slotDay < today) return true;
    
    // If slot's actual date is in the future, it's not past
    if (slotDay > today) return false;
    
    // Slot is today — check if the time is before current time
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    return slotTime <= now;
  }, [selectedDate, startHour, endHour]);

  const getStatusColor = (status: string, isRecurring?: boolean) => {
    // Recurring bookings get purple color regardless of status
    if (isRecurring) {
      return 'bg-purple-600 hover:bg-purple-700 border-purple-500';
    }
    
    switch (status) {
      case 'pending': return 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500';
      case 'confirmed': return 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500';
      case 'in_progress': return 'bg-blue-600 hover:bg-blue-700 border-blue-500';
      case 'completed': return 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500';
      case 'no_show': return 'bg-red-600/50 hover:bg-red-700/50 border-red-500';
      case 'cancelled': return 'bg-red-800/50 hover:bg-red-900/50 border-red-700';
      default: return 'bg-gray-600 hover:bg-gray-700 border-gray-500';
    }
  };

  // Get courts to display based on mobile/desktop
  const displayCourts = isMobile ? [courts[mobileCourtIndex]].filter(Boolean) : courts;
  const mobileCurrentCourt = courts[mobileCourtIndex];

  // Height of the day separator row (used to offset post-midnight overlays)
  const DAY_SEPARATOR_HEIGHT = endHour > 24 ? 26 : 0;

  // Render booking card (shared between mobile and desktop)
  const renderBookingCard = (booking: Booking, courtIndex: number, totalCourts: number) => {
    let startMinutes = parseTimeToMinutes(booking.startTime);
    const slotStartMinutes = startHour * 60;
    const isPostMidnightBooking = endHour > 24 && startMinutes < slotStartMinutes;
    // If schedule crosses midnight and booking is post-midnight, adjust
    if (isPostMidnightBooking) {
      startMinutes += 1440;
    }
    const topSlots = (startMinutes - slotStartMinutes) / 30;
    const heightSlots = Math.ceil(booking.duration / 30);
    const isBeingDragged = draggedBooking?.id === booking.id;
    
    const slotHeight = 33;
    // Add separator height offset for post-midnight bookings
    const topPosition = topSlots * slotHeight + (isPostMidnightBooking ? DAY_SEPARATOR_HEIGHT : 0);
    
    const calculateEndTime = () => {
      const endMinutes = startMinutes + booking.duration;
      const displayHour = Math.floor(endMinutes / 60) % 24;
      return `${displayHour.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
    };

    const handleCancelClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onBookingCancel && confirm(`¿Cancelar turno de ${booking.clientName}?`)) {
        onBookingCancel(booking.id);
      }
    };

    return (
      <div
        key={booking.id}
        // Drag and drop disabled for now
        draggable={false}
        // onDragStart={(e) => handleDragStart(e, booking)}
        // onDragEnd={(e) => handleDragEnd(e)}
        onClick={() => !isBeingDragged && onBookingClick(booking)}
        className={`
          absolute p-1 text-left select-none group
          ${getStatusColor(booking.status, booking.isRecurring)} border-t-4
          overflow-hidden cursor-pointer
          /* Drag cursor disabled for now */
        `}
        style={{ 
          top: `${topPosition}px`,
          height: `${heightSlots * slotHeight - 2}px`,
          left: isMobile ? '52px' : `calc(80px + (100% - 80px) * ${courtIndex / totalCourts} + 2px)`,
          width: isMobile ? 'calc(100% - 56px)' : `calc((100% - 80px) / ${totalCourts} - 4px)`,
          zIndex: 10,
        }}
      >
        {/* Action buttons - show on hover (desktop only) */}
        <div className="absolute top-0 right-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          {/* GripVertical icon disabled - drag and drop is disabled for now */}
          {!isMobile && onBookingCancel && booking.status !== 'cancelled' && booking.status !== 'completed' && booking.status !== 'no_show' && (
            <button
              onClick={handleCancelClick}
              className="p-0.5 hover:bg-red-500/50 rounded transition-colors"
              title="Cancelar turno"
            >
              <X className="h-3 w-3 text-white/70 hover:text-white" />
            </button>
          )}
        </div>
        <div className="text-xs font-medium text-white truncate pr-6">
          {booking.clientName}
        </div>
        <div className="text-xs text-white/70 truncate">
          {booking.startTime.substring(0, 5)} - {booking.endTime ? booking.endTime.substring(0, 5) : calculateEndTime()}
        </div>
        {heightSlots > 1 && (
          <div className={`text-xs mt-0.5 font-medium inline-block px-1.5 py-0.5 rounded-full ${
            (booking.depositAmount || 0) >= (booking.price || 0) && (booking.price || 0) > 0
              ? 'bg-emerald-600 text-white border border-emerald-700' 
              : (booking.depositAmount || 0) > 0 
                ? 'bg-yellow-600 text-white border border-yellow-700' 
                : 'bg-red-600 text-white border border-red-700'
          }`}>
            {(booking.depositAmount || 0) >= (booking.price || 0) && (booking.price || 0) > 0
              ? 'Pagado' 
              : (booking.depositAmount || 0) > 0 
                ? 'Pago parcial' 
                : 'No pagado'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Mobile Court Selector */}
      {isMobile && courts.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50">
          <button
            onClick={() => setMobileCourtIndex(prev => Math.max(0, prev - 1))}
            disabled={mobileCourtIndex === 0}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center flex-1">
            <div className="font-medium text-gray-900 dark:text-white text-sm">{mobileCurrentCourt?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{mobileCurrentCourt?.sport}</div>
          </div>
          <button
            onClick={() => setMobileCourtIndex(prev => Math.min(courts.length - 1, prev + 1))}
            disabled={mobileCourtIndex === courts.length - 1}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Mobile court indicator dots */}
      {isMobile && courts.length > 1 && (
        <div className="flex justify-center gap-1.5 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          {courts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setMobileCourtIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === mobileCourtIndex ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      <div 
        className="overflow-x-auto flex-1 flex flex-col"
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        <div className={`${isMobile ? '' : 'min-w-[800px]'} flex flex-col h-full`}>
          {/* Court + Amenity Headers - Desktop only */}
          {!isMobile && (
            <div className="grid border-b border-gray-200 dark:border-gray-700 flex-shrink-0" style={{ gridTemplateColumns: `80px repeat(${courts.length + amenities.length}, 1fr)` }}>
              <div className="p-3 bg-gray-100 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-600">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-auto" />
              </div>
              {courts.map((court) => (
                <div 
                  key={court.id} 
                  className="p-3 bg-gray-100 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-600 text-center"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{court.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{court.sport}</div>
                </div>
              ))}
              {amenities.map((amenity) => (
                <div 
                  key={`amenity-${amenity.id}`} 
                  className="p-3 bg-purple-100 dark:bg-purple-900/30 border-r border-gray-200 dark:border-gray-600 last:border-r-0 text-center"
                >
                  <div className="font-medium text-purple-700 dark:text-purple-300 text-sm">{amenity.name}</div>
                  <div className="text-xs text-purple-500 dark:text-purple-400/70">{amenity.isPublic ? 'Amenity' : 'Interno'}</div>
                </div>
              ))}
            </div>
          )}

          {/* Time Slots Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="relative">
              {/* Background grid with time labels and empty slots */}
              {timeSlots.map((time, slotIndex) => {
                const isPostMidnight = isTimePostMidnight(time, startHour, endHour);
                const prevTime = slotIndex > 0 ? timeSlots[slotIndex - 1] : null;
                const prevIsPostMidnight = prevTime ? isTimePostMidnight(prevTime, startHour, endHour) : false;
                const showDaySeparator = isPostMidnight && !prevIsPostMidnight;
                
                return (
                <React.Fragment key={time}>
                {/* Day separator when crossing midnight */}
                {showDaySeparator && (
                  <div 
                    className="grid border-b-2 border-orange-400 dark:border-orange-500"
                    style={{ gridTemplateColumns: isMobile ? '50px 1fr' : `80px repeat(${courts.length + amenities.length}, 1fr)` }}
                  >
                    <div className={`px-2 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 text-right border-r border-gray-200 dark:border-gray-600 bg-orange-50 dark:bg-orange-900/20 ${isMobile ? 'pr-1' : 'pr-3'}`}>
                      {getNextDay(selectedDate).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div className={`bg-orange-50 dark:bg-orange-900/20 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center`} style={{ gridColumn: `2 / -1` }}>
                      Día siguiente
                    </div>
                  </div>
                )}
                <div 
                  className={`grid border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0`}
                  style={{ gridTemplateColumns: isMobile ? '50px 1fr' : `80px repeat(${courts.length + amenities.length}, 1fr)` }}
                >
                  {/* Time Label */}
                  <div className={`p-2 text-xs text-gray-500 dark:text-gray-400 text-right pr-2 border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 h-8 ${isMobile ? 'pr-1' : 'pr-3'}`}>
                    {time}
                  </div>

                  {/* Court Slots */}
                  {displayCourts.map((court, courtIndex) => {
                    if (!court) return null;
                    const key = `${court.id}-${time}`;
                    const slot = slotData[key];
                    const hasBooking = slot?.booking;
                    const isDropTarget = dropTarget?.courtId === court.id && dropTarget?.time === time;
                    const canDrop = draggedBooking && canDropOnSlot(court.id, time);
                    const isPast = isSlotInPast(time);
                    const isClickable = !hasBooking && !draggedBooking && !isPast;
                    
                    return (
                      <div
                        key={key}
                        className={`relative border-r border-gray-200 dark:border-gray-600 last:border-r-0 h-8 transition-colors ${
                          hasBooking 
                            ? '' 
                            : isPast
                              ? 'bg-gray-200 dark:bg-gray-700/80'
                              : draggedBooking 
                                ? canDrop 
                                  ? isDropTarget 
                                    ? 'bg-emerald-500/40' 
                                    : 'bg-emerald-500/10' 
                                  : 'bg-red-500/10'
                                : 'hover:bg-emerald-100 dark:hover:bg-emerald-500/20 cursor-pointer group'
                        }`}
                        onClick={() => isClickable && onSlotClick(court.id, time, getSlotDate(time, selectedDate, startHour, endHour))}
                        onDragOver={(e) => !isPast && !isMobile && handleDragOver(e, court.id, time)}
                        onDragLeave={!isMobile ? handleDragLeave : undefined}
                        onDrop={(e) => !isPast && !isMobile && handleDrop(e, court.id, time)}
                      >
                        {isClickable && !isMobile && (
                          <span className="opacity-0 group-hover:opacity-100 text-xs text-emerald-400 transition-opacity absolute inset-0 flex items-center justify-center">
                            + Reservar
                          </span>
                        )}
                        {isClickable && isMobile && (
                          <span className="text-xs text-emerald-400/50 absolute inset-0 flex items-center justify-center">
                            +
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Amenity Slots */}
                  {!isMobile && amenities.map((amenity) => {
                    const key = `${amenity.id}-${time}`;
                    const slot = slotData[key];
                    const hasBooking = slot?.booking;
                    const isPast = isSlotInPast(time);
                    const isClickable = !hasBooking && !isPast;
                    
                    return (
                      <div
                        key={`amenity-slot-${amenity.id}-${time}`}
                        className={`relative border-r border-gray-200 dark:border-gray-600 last:border-r-0 h-8 transition-colors bg-purple-50 dark:bg-purple-900/10 ${
                          hasBooking
                            ? ''
                            : isPast
                              ? 'bg-gray-200 dark:bg-gray-700/80'
                              : 'hover:bg-purple-100 dark:hover:bg-purple-500/20 cursor-pointer group'
                        }`}
                        onClick={() => isClickable && onSlotClick(amenity.id, time, getSlotDate(time, selectedDate, startHour, endHour))}
                      >
                        {isClickable && (
                          <span className="opacity-0 group-hover:opacity-100 text-xs text-purple-600 dark:text-purple-400 transition-opacity absolute inset-0 flex items-center justify-center">
                            + Reservar
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                </React.Fragment>
                );
              })}

              {/* Current time indicator - red line for today */}
              {currentTimePosition !== null && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{ top: `${currentTimePosition}px` }}
                >
                  <div className="relative">
                    {/* Red circle on the left */}
                    <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg" />
                    {/* Red line across the grid */}
                    <div className="h-0.5 bg-red-500 shadow-lg" />
                  </div>
                </div>
              )}

              {/* Booking overlays - positioned absolutely */}
              {isMobile ? (
                // Mobile: show only current court's bookings
                mobileCurrentCourt && (() => {
                  const dateStr = formatDateForComparison(selectedDate);
                  const nextDateStr = endHour > 24 ? formatDateForComparison(getNextDay(selectedDate)) : null;
                  const courtBookings = bookings.filter(b => 
                    b.courtId === mobileCurrentCourt.id && 
                    (b.date === dateStr || (nextDateStr && b.date === nextDateStr)) && 
                    b.status !== 'cancelled'
                  );
                  return courtBookings.map(booking => renderBookingCard(booking, 0, 1));
                })()
              ) : (
                // Desktop: show all courts' and amenities' bookings
                <>
                  {/* Court bookings */}
                  {courts.map((court, courtIndex) => {
                    const dateStr = formatDateForComparison(selectedDate);
                    const nextDateStr = endHour > 24 ? formatDateForComparison(getNextDay(selectedDate)) : null;
                    const courtBookings = bookings.filter(b => 
                      b.courtId === court.id && 
                      (b.date === dateStr || (nextDateStr && b.date === nextDateStr)) && 
                      b.status !== 'cancelled'
                    );
                    // Total columns = courts + amenities
                    const totalColumns = courts.length + amenities.length;
                    return courtBookings.map(booking => renderBookingCard(booking, courtIndex, totalColumns));
                  })}
                  {/* Amenity bookings */}
                  {amenities.map((amenity, amenityIndex) => {
                    const dateStr = formatDateForComparison(selectedDate);
                    const nextDateStrAmenity = endHour > 24 ? formatDateForComparison(getNextDay(selectedDate)) : null;
                    // Match by amenityId OR by courtId being null/undefined (amenity bookings don't have courtId)
                    const amenityBookings = bookings.filter(b => {
                      if ((b.date !== dateStr && (!nextDateStrAmenity || b.date !== nextDateStrAmenity)) || b.status === 'cancelled') return false;
                      // Match by amenityId if available
                      if (b.amenityId === amenity.id) return true;
                      // Fallback: match bookings without courtId (these are amenity bookings)
                      // We need to check if this booking belongs to this amenity somehow
                      // For now, we can't match without amenityId, so skip
                      return false;
                    });
                    // Total columns = courts + amenities
                    // Amenity column index = courts.length + amenityIndex
                    const totalColumns = courts.length + amenities.length;
                    const columnIndex = courts.length + amenityIndex;
                    return amenityBookings.map(booking => renderBookingCard(booking, columnIndex, totalColumns));
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex items-center justify-end gap-4 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500 dark:bg-yellow-600"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500 dark:bg-blue-600"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">En curso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500 dark:bg-emerald-600"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-400 dark:bg-red-600/50"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">No asistió</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-600 dark:bg-red-800/50"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Cancelada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500 dark:bg-purple-600"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Turno fijo</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendarGrid;
