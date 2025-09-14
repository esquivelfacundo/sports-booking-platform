'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Upload,
  X,
  Check,
  Globe,
  Wifi,
  Car,
  Coffee,
  ShoppingBag,
  Shirt,
  Droplets,
  Wind,
  Thermometer,
  Volume2,
  Video,
  Heart
} from 'lucide-react';
import { EstablishmentRegistration, AMENITIES_OPTIONS } from '@/types/establishment';
import PhoneInput from '@/components/ui/PhoneInput';

interface BasicInfoStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onUpdate, onValidation }) => {
  const [formData, setFormData] = useState({
    basicInfo: data.basicInfo || { name: '', description: '', phone: '', email: '' },
    location: data.location || { address: '', city: '', state: '', zipCode: '' },
    schedule: data.schedule || {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '08:00', close: '22:00', closed: false }
    },
    amenities: data.amenities || [],
    images: data.images || { photos: [] }
  });

  const [sameScheduleAllDays, setSameScheduleAllDays] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  const amenityIcons: Record<string, React.ComponentType<any>> = {
    'Vestuarios': Shirt,
    'Estacionamiento': Car,
    'Cafetería/Bar': Coffee,
    'Tienda deportiva': ShoppingBag,
    'WiFi gratuito': Wifi,
    'Duchas': Droplets,
    'Aire acondicionado': Wind,
    'Calefacción': Thermometer,
    'Sonido': Volume2,
    'Transmisión en vivo': Video,
    'Primeros auxilios': Heart
  };

  const dayLabels = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  // Mount effect to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation and update effects
  useEffect(() => {
    if (!mounted) return;

    const newErrors: Record<string, string> = {};
    
    if (touched.name && !formData.basicInfo.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (touched.description && !formData.basicInfo.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (touched.phone && !formData.basicInfo.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (touched.email && !formData.basicInfo.email.trim()) newErrors.email = 'El email es obligatorio';
    if (touched.email && formData.basicInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.basicInfo.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    
    const allRequiredFilled = 
      formData.basicInfo.name.trim() &&
      formData.basicInfo.description.trim() &&
      formData.basicInfo.phone.trim() &&
      formData.basicInfo.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.basicInfo.email) &&
      formData.location.address.trim() &&
      formData.location.city.trim() &&
      formData.location.state.trim();
    
    onValidation(Boolean(allRequiredFilled));
  }, [formData, touched, mounted, onValidation]);

  // Update parent data when form changes
  useEffect(() => {
    if (!mounted) return;
    onUpdate(formData);
  }, [formData, mounted, onUpdate]);

  const updateBasicInfo = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFormData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value }
    }));
  };

  const updateLocation = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const updateSchedule = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    if (sameScheduleAllDays && (field === 'open' || field === 'close')) {
      // Update all days
      const newSchedule = { ...formData.schedule };
      Object.keys(newSchedule).forEach(dayKey => {
        newSchedule[dayKey] = { ...newSchedule[dayKey], [field]: value };
      });
      setFormData(prev => ({ ...prev, schedule: newSchedule }));
    } else {
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: { ...prev.schedule[day], [field]: value }
        }
      }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    // In a real app, you'd upload these to a server
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        photos: [...prev.images.photos, ...imageUrls]
      }
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        photos: prev.images.photos.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Información del Establecimiento</h2>
        <p className="text-gray-400">Completa los datos básicos de tu establecimiento</p>
      </div>

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Datos Básicos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Establecimiento *
            </label>
            <input
              type="text"
              value={formData.basicInfo.name}
              onChange={(e) => updateBasicInfo('name', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
              }`}
              placeholder="Ej: Club Deportivo Central"
              spellCheck="false"
              autoComplete="off"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Teléfono *
            </label>
            <PhoneInput
              value={formData.basicInfo.phone}
              onChange={(value) => updateBasicInfo('phone', value)}
              placeholder="Número de teléfono"
              className="w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors border-gray-600 focus:ring-emerald-500"
              error={errors.phone}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email de Contacto *
          </label>
          <input
            type="email"
            value={formData.basicInfo.email}
            onChange={(e) => updateBasicInfo('email', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
            }`}
            placeholder="contacto@miestablecimiento.com"
            spellCheck="false"
            autoComplete="email"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción *
          </label>
          <textarea
            value={formData.basicInfo.description}
            onChange={(e) => updateBasicInfo('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
              errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
            }`}
            placeholder="Describe tu establecimiento, servicios y lo que lo hace especial..."
            spellCheck="false"
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
        </div>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Ubicación</h3>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </motion.div>

      {/* Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Horarios de Operación</h3>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sameScheduleAllDays}
              onChange={(e) => setSameScheduleAllDays(e.target.checked)}
              className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-300">Mismo horario todos los días</span>
          </label>
        </div>

        <div className="space-y-4">
          {Object.entries(formData.schedule).map(([day, schedule]) => (
            <div key={day} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
              <div className="w-20">
                <span className="text-white font-medium">{dayLabels[day as keyof typeof dayLabels]}</span>
              </div>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={schedule.closed}
                  onChange={(e) => updateSchedule(day, 'closed', e.target.checked)}
                  className="w-4 h-4 text-red-500 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-300">Cerrado</span>
              </label>

              {!schedule.closed && (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Abre:</span>
                    <input
                      type="time"
                      value={schedule.open}
                      onChange={(e) => updateSchedule(day, 'open', e.target.value)}
                      className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Cierra:</span>
                    <input
                      type="time"
                      value={schedule.close}
                      onChange={(e) => updateSchedule(day, 'close', e.target.value)}
                      className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Amenities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Servicios Disponibles</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AMENITIES_OPTIONS.map((amenity) => {
            const Icon = amenityIcons[amenity] || Globe;
            const isSelected = formData.amenities.includes(amenity);
            
            return (
              <motion.button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center">{amenity}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Images */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Imágenes del Establecimiento</h3>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Haz clic para subir imágenes</p>
              <p className="text-gray-500 text-sm">PNG, JPG hasta 10MB cada una</p>
            </label>
          </div>

          {formData.images.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BasicInfoStep;
