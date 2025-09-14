'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation
} from 'lucide-react';
import { EstablishmentRegistration } from '@/types/establishment';

interface LocationStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({ data, onUpdate, onValidation }) => {
  const [formData, setFormData] = useState({
    location: data.location || { address: '', city: '', state: '', zipCode: '' }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation
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
  }, [formData, touched, mounted, onValidation]);

  // Update parent data
  useEffect(() => {
    if (!mounted) return;
    onUpdate(formData);
  }, [formData, mounted, onUpdate]);

  const updateLocation = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
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
          <input
            type="text"
            value={formData.location.address}
            onChange={(e) => updateLocation('address', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
            }`}
            placeholder="Ej: Av. Corrientes 1234"
            spellCheck="false"
            autoComplete="street-address"
          />
          {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ciudad *
            </label>
            <input
              type="text"
              value={formData.location.city}
              onChange={(e) => updateLocation('city', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
              }`}
              placeholder="Buenos Aires"
              spellCheck="false"
              autoComplete="address-level2"
            />
            {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Provincia *
            </label>
            <input
              type="text"
              value={formData.location.state}
              onChange={(e) => updateLocation('state', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
              }`}
              placeholder="CABA"
              spellCheck="false"
              autoComplete="address-level1"
            />
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
              className="w-full px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center justify-center space-x-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Detectar mi ubicación</span>
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
