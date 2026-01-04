'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Clock, Users, Wifi, Car, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  duration: number; // in minutes
}

interface Court {
  id: string;
  name: string;
  type: string;
  timeSlots: TimeSlot[];
}

interface FacilityCardProps {
  facility: {
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
    courts?: Court[];
    timeSlots?: TimeSlot[];
    priceFrom?: number;
  };
  onReserve?: () => void;
  onBookingClick?: () => void;
  onTimeSlotSelect?: (facility: any, timeSlot: TimeSlot) => void;
  onLoginRequired?: () => void;
}

const FacilityCard = ({ facility, onReserve, onBookingClick, onTimeSlotSelect, onLoginRequired }: FacilityCardProps) => {
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
        available: Math.random() > 0.3, // 70% availability
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
      const scrollAmount = 120;
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

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      'Estacionamiento': Car,
      'Vestuarios': Users,
      'Parrilla': Coffee,
      'Buffet': Coffee,
      'Cafetería': Coffee,
      'Aire acondicionado': Wifi,
      'Tribuna': Users,
      'Tienda': Coffee,
      'Instructor': Users,
      'Alquiler de paletas': Users,
      'Alquiler de raquetas': Users
    };
    const IconComponent = icons[amenity] || Wifi;
    return <IconComponent className="w-4 h-4" />;
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
      <div className="flex flex-col">
        {/* Image */}
        <div className="relative w-full h-48 flex-shrink-0">
          {facility.image ? (
            <img 
              src={facility.image} 
              alt={facility.name}
              className="w-full h-full object-cover border-b border-gray-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-b border-gray-700">
              <div className="text-4xl opacity-80">
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
            className="absolute top-3 right-3 p-2 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-gray-900 transition-all duration-200 border border-gray-600"
          >
            <Heart 
              className={`w-4 h-4 ${isLiked ? 'fill-emerald-500 text-emerald-500' : 'text-gray-400'}`} 
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-1">
                <Star className="w-4 h-4 fill-current text-emerald-400" />
                <span className="text-sm font-medium text-white">{facility.rating}</span>
                <span className="text-sm text-gray-400">({facility.reviews})</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 truncate">
                {facility.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center text-gray-400 mb-2">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="text-xs truncate">{facility.location}</span>
          </div>

          {/* Reservar Button */}
          <button 
            onClick={() => {
              window.location.href = `/reservar/${facility.id}`;
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl"
          >
            Reservar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FacilityCard;
