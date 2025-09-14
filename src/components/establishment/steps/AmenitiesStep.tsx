'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Car, 
  Coffee, 
  Utensils, 
  Shirt, 
  Shield, 
  Zap, 
  Waves,
  Check
} from 'lucide-react';
import { EstablishmentRegistration, AMENITIES } from '@/types/establishment';

interface AmenitiesStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

const AmenitiesStep: React.FC<AmenitiesStepProps> = ({ data, onUpdate, onValidation }) => {
  const [formData, setFormData] = useState({
    amenities: data.amenities || []
  });

  const [mounted, setMounted] = useState(false);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation and update effects
  useEffect(() => {
    if (!mounted) return;
    onValidation(true);
    onUpdate(formData);
  }, [mounted, formData.amenities]);

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return Wifi;
      case 'parking': return Car;
      case 'cafeteria': return Coffee;
      case 'restaurant': return Utensils;
      case 'locker_rooms': return Shirt;
      case 'security': return Shield;
      case 'air_conditioning': return Zap;
      case 'pool': return Waves;
      default: return Check;
    }
  };

  const getAmenityLabel = (amenity: string) => {
    const labels: Record<string, string> = {
      wifi: 'WiFi Gratuito',
      parking: 'Estacionamiento',
      cafeteria: 'Cafetería',
      restaurant: 'Restaurante',
      locker_rooms: 'Vestuarios',
      security: 'Seguridad 24hs',
      air_conditioning: 'Aire Acondicionado',
      pool: 'Piscina'
    };
    return labels[amenity] || amenity;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Servicios y Comodidades</h2>
        <p className="text-gray-400">¿Qué servicios adicionales ofrece tu establecimiento?</p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <p className="text-gray-300">
            Selecciona todos los servicios que apliquen. Esto ayuda a los jugadores a elegir tu establecimiento.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AMENITIES.map((amenity) => {
            const Icon = getAmenityIcon(amenity);
            const isSelected = formData.amenities.includes(amenity);
            
            return (
              <motion.button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon className="w-8 h-8" />
                  <span className="text-sm font-medium text-center">
                    {getAmenityLabel(amenity)}
                  </span>
                </div>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {formData.amenities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4"
          >
            <h4 className="text-emerald-400 font-medium mb-2">
              Servicios seleccionados ({formData.amenities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full"
                >
                  {getAmenityLabel(amenity)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">Servicios opcionales</h4>
              <p className="text-gray-400 text-sm">
                Puedes agregar o quitar servicios en cualquier momento desde tu panel de administración. 
                Los servicios destacados ayudan a atraer más jugadores.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AmenitiesStep;
