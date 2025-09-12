'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Facility {
  id: string;
  name: string;
  sport: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  amenities: string[];
  availability: string[];
}

interface CompactFacilityCardProps {
  facility: Facility;
  onReserve: () => void;
  onLoginRequired?: () => void;
}

const CompactFacilityCard = ({ facility, onReserve, onLoginRequired }: CompactFacilityCardProps) => {
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
      {/* Image */}
      <div className="relative w-full h-40">
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

        {/* Availability */}
        <div className="flex items-center space-x-1 mb-3">
          <Clock className="w-3 h-3 text-gray-400" />
          <div className="flex space-x-1 overflow-hidden">
            {facility.availability.slice(0, 2).map((time, index) => (
              <span
                key={index}
                className="text-xs bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded-full border border-emerald-500/30"
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
