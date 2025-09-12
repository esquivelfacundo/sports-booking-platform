'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Clock, Users, Wifi, Car, Coffee } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface FacilityCardProps {
  facility: {
    id: string;
    name: string;
    sport: string;
    location: string;
    price: number;
    rating: number;
    reviews: number;
    amenities: string[];
    availability: string[];
  };
  onReserve?: () => void;
  onBookingClick?: () => void;
  onLoginRequired?: () => void;
}

const FacilityCard = ({ facility, onReserve, onBookingClick, onLoginRequired }: FacilityCardProps) => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  // Check if facility is in user's favorites
  useEffect(() => {
    if (user && user.favoriteVenues.includes(facility.id)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [user, facility.id]);

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
      'paddle': 'Paddle',
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

          {/* Sport type */}
          <div className="mb-3">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide bg-emerald-500/10 px-2 py-1 rounded-full">
              {getSportName(facility.sport)}
            </span>
          </div>

          {/* Availability */}
          <div className="flex items-center space-x-1 mb-3">
            <Clock className="w-3 h-3 text-gray-400" />
            <div className="flex space-x-1 overflow-hidden">
              {facility.availability.slice(0, 2).map((time, index) => (
                <span
                  key={index}
                  className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30"
                >
                  {time}
                </span>
              ))}
              {facility.availability.length > 2 && (
                <span className="text-xs text-gray-400">
                  +{facility.availability.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Price and Buttons */}
          <div className="space-y-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-semibold text-white">
                ${facility.price}
              </span>
              <span className="text-xs text-gray-400">hora</span>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    onLoginRequired?.();
                  } else {
                    onBookingClick?.() || onReserve?.();
                  }
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1.5 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl"
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
                className="flex-1 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-xl hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200 font-medium text-sm"
              >
                Ver detalle
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FacilityCard;
