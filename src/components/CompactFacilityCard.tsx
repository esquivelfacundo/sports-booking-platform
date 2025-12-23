'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  duration: number;
}

interface Facility {
  id: string;
  name: string;
  sport: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image?: string;
  coordinates?: [number, number];
  amenities: string[];
  availability: string[];
  timeSlots?: TimeSlot[];
  priceFrom?: number;
}

interface CompactFacilityCardProps {
  facility: Facility;
  onReserve: () => void;
  onTimeSlotSelect?: (facility: Facility, timeSlot: TimeSlot) => void;
  onLoginRequired?: () => void;
}

const CompactFacilityCard = ({ facility, onReserve, onTimeSlotSelect, onLoginRequired }: CompactFacilityCardProps) => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Generate mock time slots if not provided
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    
    times.forEach(time => {
      slots.push({
        time,
        available: Math.random() > 0.3,
        price: facility.price,
        duration: 60
      });
    });
    
    return slots;
  };

  const timeSlots = facility.timeSlots || generateTimeSlots();
  const availableSlots = timeSlots.filter(slot => slot.available);

  // Check if facility is in user's favorites
  useEffect(() => {
    if (user && user.favoriteVenues && user.favoriteVenues.includes(facility.id)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [user, facility.id]);

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      return () => scrollElement.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 100;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !user) {
      onLoginRequired?.();
      return;
    }

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);

    // Update user's favorites
    let updatedFavorites;
    if (newIsLiked) {
      updatedFavorites = [...user.favoriteVenues, facility.id];
    } else {
      updatedFavorites = user.favoriteVenues.filter(id => id !== facility.id);
    }

    await updateProfile({
      favoriteVenues: updatedFavorites,
      stats: {
        ...user.stats,
        favoriteVenuesCount: updatedFavorites.length
      }
    });
  };

  const getSportName = (sport: string) => {
    const sportNames: { [key: string]: string } = {
      'futbol5': 'Fútbol 5',
      'paddle': 'Padel',
      'tenis': 'Tenis',
      'basquet': 'Básquet',
      'voley': 'Vóley',
      'hockey': 'Hockey',
      'rugby': 'Rugby'
    };
    return sportNames[sport] || sport;
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer backdrop-blur-sm"
    >
      {/* Image */}
      <div className="relative w-full h-40">
        {facility.image ? (
          <img 
            src={facility.image} 
            alt={facility.name}
            className="w-full h-full object-cover border-b border-gray-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-b border-gray-700">
            <div className="text-3xl opacity-80">
              {facility.sport === 'futbol5' && '⚽'}
              {facility.sport === 'paddle' && '🏓'}
              {facility.sport === 'tenis' && '🎾'}
              {facility.sport === 'basquet' && '🏀'}
              {facility.sport === 'voley' && '🏐'}
              {facility.sport === 'hockey' && '🏒'}
              {facility.sport === 'rugby' && '🏉'}
            </div>
          </div>
        )}
        
        {/* Like button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-1.5 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-gray-900 transition-all duration-200 border border-gray-600"
        >
          <Heart 
            className={`w-3 h-3 ${isLiked ? 'fill-emerald-500 text-emerald-500' : 'text-gray-400'}`} 
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center space-x-1 mb-1">
          <Star className="w-3 h-3 fill-current text-emerald-400" />
          <span className="text-xs font-medium text-white">{facility.rating}</span>
          <span className="text-xs text-gray-400">({facility.reviews})</span>
        </div>
        
        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">
          {facility.name}
        </h3>
        
        <div className="flex items-center text-gray-400 mb-2">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="text-xs truncate">{facility.location}</span>
        </div>

        {/* Sport type */}
        <div className="mb-2">
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide bg-emerald-500/10 px-2 py-1 rounded-full">
            {getSportName(facility.sport)}
          </span>
        </div>

        {/* Time Slots Carousel */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">Disponibles</span>
            </div>
            <span className="text-xs text-emerald-400">
              desde ${facility.priceFrom || facility.price}
            </span>
          </div>
          
          <div className="relative">
            {/* Scroll buttons */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 backdrop-blur-sm rounded-full p-0.5 hover:bg-gray-900 transition-all duration-200 border border-gray-600"
              >
                <ChevronLeft className="w-2.5 h-2.5 text-white" />
              </button>
            )}
            
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 backdrop-blur-sm rounded-full p-0.5 hover:bg-gray-900 transition-all duration-200 border border-gray-600"
              >
                <ChevronRight className="w-2.5 h-2.5 text-white" />
              </button>
            )}
            
            {/* Time slots carousel */}
            <div 
              ref={scrollRef}
              className="flex space-x-1.5 overflow-x-auto scrollbar-hide pb-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {availableSlots.slice(0, 6).map((slot, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!isAuthenticated) {
                      onLoginRequired?.();
                    } else {
                      onTimeSlotSelect?.(facility, slot);
                    }
                  }}
                  className="flex-shrink-0 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/30 hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all duration-200 text-xs font-medium min-w-[50px] text-center"
                >
                  {slot.time}
                </motion.button>
              ))}
              
              {availableSlots.length === 0 && (
                <div className="text-xs text-gray-500 py-1">
                  Sin horarios
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price and Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-semibold text-white">
                ${facility.priceFrom || facility.price}
              </span>
              <span className="text-xs text-gray-400">desde</span>
            </div>
            <div className="text-xs text-gray-400">
              {availableSlots.length} slots
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  onLoginRequired?.();
                } else {
                  onReserve();
                }
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1.5 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl"
            >
              Reservar
            </button>
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  onLoginRequired?.();
                } else {
                  window.location.href = `/reservar/${facility.id}`;
                }
              }}
              className="w-full border border-gray-600 text-gray-300 px-3 py-1.5 rounded-xl hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200 font-medium text-sm"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompactFacilityCard;
