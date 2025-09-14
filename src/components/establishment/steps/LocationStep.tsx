'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation
} from 'lucide-react';
import { EstablishmentRegistration } from '@/types/establishment';
import { ARGENTINA_PROVINCES } from '@/constants/argentina';
import GooglePlacesAutocomplete from '@/components/ui/GooglePlacesAutocomplete';

interface LocationStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({ data, onUpdate, onValidation }) => {
  const [formData, setFormData] = useState({
    location: data.location || { address: '', city: '', state: '', zipCode: '', coordinates: { lat: 0, lng: 0 } }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation and update effects
  useEffect(() => {
    if (!mounted) return;

    const newErrors: Record<string, string> = {};
    
    if (touched.address && !formData.location.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (touched.city && !formData.location.city.trim()) newErrors.city = 'La ciudad es obligatoria';
    if (touched.state && !formData.location.state.trim()) newErrors.state = 'La provincia es obligatoria';

    setErrors(newErrors);
    
    const allRequiredFilled = 
      formData.location.address.trim() &&
      formData.location.city.trim() &&
      formData.location.state.trim();
    
    onValidation(Boolean(allRequiredFilled));
    onUpdate(formData);
  }, [formData.location.address, formData.location.city, formData.location.state, formData.location.zipCode, touched.address, touched.city, touched.state, mounted]);

  const updateLocation = (field: string, value: string | { lat: number; lng: number }) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en este navegador');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation('coordinates', { lat: latitude, lng: longitude });
        
        // Reverse geocoding to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const result = results[0];
                updateLocation('address', result.formatted_address);
                
                // Extract components
                const components = result.address_components;
                components.forEach((component) => {
                  const types = component.types;
                  if (types.includes('locality')) {
                    updateLocation('city', component.long_name);
                  }
                  if (types.includes('administrative_area_level_1')) {
                    updateLocation('state', component.short_name);
                  }
                  if (types.includes('postal_code')) {
                    updateLocation('zipCode', component.long_name);
                  }
                });
              }
              setIsDetectingLocation(false);
            }
          );
        } else {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener la ubicación. Verifica los permisos del navegador.');
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleCityPlaceSelect = (place: any) => {
    if (place.address_components) {
      place.address_components.forEach((component: any) => {
        const types = component.types;
        if (types.includes('locality')) {
          updateLocation('city', component.long_name);
        }
        if (types.includes('administrative_area_level_1')) {
          updateLocation('state', component.short_name);
        }
        if (types.includes('postal_code')) {
          updateLocation('zipCode', component.long_name);
        }
      });
    }
    
    if (place.geometry && place.geometry.location) {
      updateLocation('coordinates', {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
    }
  };

  const handleAddressPlaceSelect = (place: any) => {
    if (place.address_components) {
      place.address_components.forEach((component: any) => {
        const types = component.types;
        if (types.includes('locality')) {
          updateLocation('city', component.long_name);
        }
        if (types.includes('administrative_area_level_1')) {
          updateLocation('state', component.short_name);
        }
        if (types.includes('postal_code')) {
          updateLocation('zipCode', component.long_name);
        }
      });
    }
    
    if (place.geometry && place.geometry.location) {
      updateLocation('coordinates', {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Ubicación</h2>
        <p className="text-gray-400">¿Dónde se encuentra tu establecimiento?</p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="flex items-center space-x-2 mb-6">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Dirección del Establecimiento</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dirección Completa *
          </label>
          <GooglePlacesAutocomplete
            value={formData.location.address}
            onChange={(value) => updateLocation('address', value)}
            onPlaceSelect={handleAddressPlaceSelect}
            placeholder="Ej: Av. Corrientes 1234"
            className="w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors border-gray-600 focus:ring-emerald-500"
            error={errors.address}
            types={['address']}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ciudad *
            </label>
            <GooglePlacesAutocomplete
              value={formData.location.city}
              onChange={(value) => updateLocation('city', value)}
              onPlaceSelect={handleCityPlaceSelect}
              placeholder="Buenos Aires"
              className="w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors border-gray-600 focus:ring-emerald-500"
              error={errors.city}
              types={['(cities)']}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Provincia *
            </label>
            <select
              value={formData.location.state}
              onChange={(e) => updateLocation('state', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
              }`}
            >
              <option value="">Selecciona una provincia</option>
              {ARGENTINA_PROVINCES.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Código Postal
            </label>
            <input
              type="text"
              value={formData.location.zipCode}
              onChange={(e) => updateLocation('zipCode', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              placeholder="1234"
              spellCheck="false"
              autoComplete="postal-code"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="w-full px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Navigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Detectando...' : 'Detectar mi ubicación'}</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">Tip de ubicación</h4>
              <p className="text-gray-400 text-sm">
                Una dirección precisa ayuda a que los jugadores te encuentren fácilmente. 
                Incluye referencias si es necesario (ej: "Al lado del shopping").
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationStep;
