'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Trophy, 
  Ruler, 
  DollarSign, 
  Clock, 
  Settings,
  Camera,
  Loader2,
  CheckCircle,
  Lightbulb,
  Umbrella
} from 'lucide-react';
import { SPORTS_OPTIONS, SURFACE_OPTIONS } from '@/types/establishment';

interface CreateCourtSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (courtData: any) => void;
  editingCourt?: any | null;
}

type Step = 'sport' | 'details' | 'pricing' | 'features' | 'photos' | 'confirmation';

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'sport', label: 'Deporte', icon: Trophy },
  { key: 'details', label: 'Detalles', icon: Ruler },
  { key: 'pricing', label: 'Precios', icon: DollarSign },
  { key: 'features', label: 'Características', icon: Settings },
  { key: 'photos', label: 'Fotos', icon: Camera },
  { key: 'confirmation', label: 'Confirmar', icon: CheckCircle },
];

const SPORT_ICONS: Record<string, string> = {
  futbol: '⚽',
  futbol5: '⚽',
  futbol7: '⚽',
  futbol11: '⚽',
  padel: '🎾',
  tenis: '🎾',
  basquet: '🏀',
  voley: '🏐',
  hockey: '🏑',
  handball: '🤾',
};

export const CreateCourtSidebar: React.FC<CreateCourtSidebarProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingCourt,
}) => {
  // Current step
  const [currentStep, setCurrentStep] = useState<Step>('sport');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    type: 'futbol',
    surface: 'Césped sintético',
    pricePerHour: 5000,
    pricePerHour90: 0,
    pricePerHour120: 0,
    lighting: true,
    lightingPrice: 0,
    lightingStartTime: '18:00',
    lightingEndTime: '23:00',
    covered: false,
    description: '',
    images: [] as string[],
    amenities: [] as string[],
  });

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with editing court data
  useEffect(() => {
    if (editingCourt) {
      setFormData({
        name: editingCourt.name || '',
        type: editingCourt.type || 'futbol',
        surface: editingCourt.surface || 'Césped sintético',
        pricePerHour: editingCourt.pricePerHour || 5000,
        pricePerHour90: editingCourt.pricePerHour90 || 0,
        pricePerHour120: editingCourt.pricePerHour120 || 0,
        lighting: editingCourt.lighting ?? true,
        lightingPrice: editingCourt.lightingPrice || 0,
        lightingStartTime: editingCourt.lightingStartTime || '18:00',
        lightingEndTime: editingCourt.lightingEndTime || '23:00',
        covered: editingCourt.covered || false,
        description: editingCourt.description || '',
        images: editingCourt.images || [],
        amenities: editingCourt.amenities || [],
      });
    }
  }, [editingCourt]);

  // Navigation
  const goToNextStep = () => {
    const currentIndex = STEPS.findIndex(s => s.key === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].key);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = STEPS.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'sport':
        return !!formData.type;
      case 'details':
        return !!formData.name.trim() && !!formData.surface;
      case 'pricing':
        return formData.pricePerHour > 0;
      case 'features':
        return true;
      case 'photos':
        return true;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const courtData = {
        name: formData.name,
        sport: formData.type,
        surface: formData.surface,
        pricePerHour: formData.pricePerHour,
        pricePerHour90: formData.pricePerHour90 || undefined,
        pricePerHour120: formData.pricePerHour120 || undefined,
        isIndoor: formData.covered,
        description: formData.description,
        amenities: [
          ...(formData.lighting ? ['Iluminación LED'] : []),
          ...(formData.covered ? ['Techada'] : []),
          ...formData.amenities,
        ],
        // Extra fields for lighting schedule
        lighting: formData.lighting,
        lightingPrice: formData.lightingPrice,
        lightingStartTime: formData.lightingStartTime,
        lightingEndTime: formData.lightingEndTime,
      };
      
      await onSuccess(courtData);
    } catch (err) {
      console.error('Error creating court:', err);
      alert('Error al crear la cancha. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleClose = () => {
    setCurrentStep('sport');
    setFormData({
      name: '',
      type: 'futbol',
      surface: 'Césped sintético',
      pricePerHour: 5000,
      pricePerHour90: 0,
      pricePerHour120: 0,
      lighting: true,
      lightingPrice: 0,
      lightingStartTime: '18:00',
      lightingEndTime: '23:00',
      covered: false,
      description: '',
      images: [],
      amenities: [],
    });
    onClose();
  };

  // Get sport label
  const getSportLabel = (type: string) => {
    const sport = SPORTS_OPTIONS.find(s => s.value === type);
    return sport?.label || type;
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'sport':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Seleccionar Deporte</h3>
              <p className="text-gray-400 text-sm mb-4">Elige el deporte principal de esta cancha</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {SPORTS_OPTIONS.map((sport) => (
                <button
                  key={sport.value}
                  onClick={() => setFormData(prev => ({ ...prev, type: sport.value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.type === sport.value
                      ? 'border-emerald-500 bg-emerald-500/20 text-white'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{sport.icon}</span>
                  <span className="block text-sm font-medium">{sport.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Detalles de la Cancha</h3>
              <p className="text-gray-400 text-sm mb-4">Información básica sobre la cancha</p>
            </div>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de la Cancha <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Cancha 1, Pista Central"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Surface */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Superficie <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SURFACE_OPTIONS.map((surface) => (
                  <button
                    key={surface}
                    onClick={() => setFormData(prev => ({ ...prev, surface }))}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      formData.surface === surface
                        ? 'border-emerald-500 bg-emerald-500/20 text-white'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {surface}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Características especiales de la cancha..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Configurar Precios</h3>
              <p className="text-gray-400 text-sm mb-4">Define los precios por duración de reserva</p>
            </div>

            {/* Price per hour */}
            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <label className="block text-sm font-medium text-white mb-3">
                Precio por 60 minutos <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: parseInt(e.target.value) || 0 }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-lg font-semibold focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>
            </div>

            {/* Price for 90 min */}
            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <label className="block text-sm font-medium text-white mb-3">
                Precio por 90 minutos
                <span className="text-gray-400 text-xs ml-2">(opcional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.pricePerHour90}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour90: parseInt(e.target.value) || 0 }))}
                  placeholder={`Sugerido: $${Math.round(formData.pricePerHour * 1.4)}`}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>
            </div>

            {/* Price for 120 min */}
            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <label className="block text-sm font-medium text-white mb-3">
                Precio por 120 minutos
                <span className="text-gray-400 text-xs ml-2">(opcional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.pricePerHour120}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour120: parseInt(e.target.value) || 0 }))}
                  placeholder={`Sugerido: $${Math.round(formData.pricePerHour * 1.8)}`}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <h4 className="text-emerald-400 font-medium mb-3">Vista previa de precios</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">60 minutos</span>
                  <span className="text-white font-semibold">${formData.pricePerHour.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">90 minutos</span>
                  <span className="text-white font-semibold">
                    ${(formData.pricePerHour90 || Math.round(formData.pricePerHour * 1.4)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">120 minutos</span>
                  <span className="text-white font-semibold">
                    ${(formData.pricePerHour120 || Math.round(formData.pricePerHour * 1.8)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Características</h3>
              <p className="text-gray-400 text-sm mb-4">Selecciona las características de la cancha</p>
            </div>

            {/* Lighting */}
            <div className={`rounded-xl p-4 border-2 transition-all ${
              formData.lighting 
                ? 'border-yellow-500/50 bg-yellow-500/10' 
                : 'border-gray-600 bg-gray-700/50'
            }`}>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Lightbulb className={`w-6 h-6 ${formData.lighting ? 'text-yellow-400' : 'text-gray-400'}`} />
                  <div>
                    <span className="text-white font-medium">Iluminación artificial</span>
                    <p className="text-sm text-gray-400">La cancha cuenta con luces para jugar de noche</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.lighting}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, lighting: e.target.checked }));
                    if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, lightingPrice: 0 }));
                    }
                  }}
                  className="w-5 h-5 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                />
              </label>
              
              {formData.lighting && (
                <div className="mt-4 pt-4 border-t border-gray-600 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio extra por iluminación
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.lightingPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, lightingPrice: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Horario de iluminación
                    </label>
                    <p className="text-xs text-gray-400 mb-3">
                      Define desde qué hora hasta qué hora se cobra el extra por iluminación
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Desde</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="time"
                            value={formData.lightingStartTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, lightingStartTime: e.target.value }))}
                            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Hasta</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="time"
                            value={formData.lightingEndTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, lightingEndTime: e.target.value }))}
                            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Covered */}
            <div className={`rounded-xl p-4 border-2 transition-all ${
              formData.covered 
                ? 'border-blue-500/50 bg-blue-500/10' 
                : 'border-gray-600 bg-gray-700/50'
            }`}>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Umbrella className={`w-6 h-6 ${formData.covered ? 'text-blue-400' : 'text-gray-400'}`} />
                  <div>
                    <span className="text-white font-medium">Cancha techada</span>
                    <p className="text-sm text-gray-400">Protegida de la lluvia y el sol</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.covered}
                  onChange={(e) => setFormData(prev => ({ ...prev, covered: e.target.checked }))}
                  className="w-5 h-5 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                />
              </label>
            </div>

            {/* Summary */}
            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <h4 className="text-white font-medium mb-3">Características seleccionadas</h4>
              <div className="flex flex-wrap gap-2">
                {formData.lighting && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                    🔆 Iluminación
                  </span>
                )}
                {formData.covered && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    ☂️ Techada
                  </span>
                )}
                {!formData.lighting && !formData.covered && (
                  <span className="text-gray-400 text-sm">Sin características adicionales</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Fotos de la Cancha</h3>
              <p className="text-gray-400 text-sm mb-4">Agrega fotos para mostrar la cancha a los clientes</p>
            </div>

            {/* Upload area */}
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="court-image-upload"
              />
              <label htmlFor="court-image-upload" className="cursor-pointer">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">Subir fotos</p>
                <p className="text-gray-400 text-sm">Arrastra o haz clic para seleccionar</p>
              </label>
            </div>

            {/* Image preview */}
            {formData.images.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-3">Fotos subidas ({formData.images.length})</h4>
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={image}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.images.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Las fotos son opcionales pero ayudan a atraer más clientes
                </p>
              </div>
            )}
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Confirmar Cancha</h3>
              <p className="text-gray-400 text-sm mb-4">Revisa los datos antes de guardar</p>
            </div>

            <div className="bg-gray-700/50 rounded-xl p-4 space-y-4 border border-gray-600">
              {/* Sport & Name */}
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-600">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">
                  {SPORT_ICONS[formData.type] || '🏟️'}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">{formData.name || 'Sin nombre'}</h4>
                  <p className="text-gray-400">{getSportLabel(formData.type)}</p>
                </div>
              </div>

              {/* Details */}
              <div className="text-sm">
                <div>
                  <span className="text-gray-400">Superficie</span>
                  <p className="text-white font-medium">{formData.surface}</p>
                </div>
                {formData.description && (
                  <div className="mt-2">
                    <span className="text-gray-400">Descripción</span>
                    <p className="text-white font-medium">{formData.description}</p>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="pt-4 border-t border-gray-600">
                <span className="text-gray-400 text-sm">Precios</span>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-300">60 min</span>
                    <span className="text-emerald-400 font-semibold">${formData.pricePerHour.toLocaleString()}</span>
                  </div>
                  {formData.pricePerHour90 > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">90 min</span>
                      <span className="text-emerald-400 font-semibold">${formData.pricePerHour90.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.pricePerHour120 > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">120 min</span>
                      <span className="text-emerald-400 font-semibold">${formData.pricePerHour120.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="pt-4 border-t border-gray-600">
                <span className="text-gray-400 text-sm">Características</span>
                <div className="mt-2 space-y-2">
                  {formData.lighting && (
                    <div className="flex flex-col">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs inline-block w-fit">
                        🔆 Iluminación {formData.lightingPrice > 0 && `(+$${formData.lightingPrice})`}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        Horario: {formData.lightingStartTime} - {formData.lightingEndTime}
                      </span>
                    </div>
                  )}
                  {formData.covered && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs inline-block">
                      ☂️ Techada
                    </span>
                  )}
                  {!formData.lighting && !formData.covered && (
                    <span className="text-gray-500 text-xs">Sin características adicionales</span>
                  )}
                </div>
              </div>

              {/* Photos */}
              {formData.images.length > 0 && (
                <div className="pt-4 border-t border-gray-600">
                  <span className="text-gray-400 text-sm">{formData.images.length} foto(s) subida(s)</span>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  // Use portal to render outside of parent container
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
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
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-gray-800 border-l border-gray-700 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingCourt ? 'Editar Cancha' : 'Nueva Cancha'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Progress steps */}
            <div className="px-4 py-3 border-b border-gray-700 overflow-x-auto">
              <div className="flex items-center justify-between min-w-max">
                {STEPS.map((step, index) => {
                  const currentIndex = STEPS.findIndex(s => s.key === currentStep);
                  const isCompleted = index < currentIndex;
                  const isCurrent = step.key === currentStep;
                  const Icon = step.icon;
                  
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center transition-colors
                            ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                            ${isCurrent ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500' : ''}
                            ${!isCompleted && !isCurrent ? 'bg-gray-700 text-gray-400' : ''}
                          `}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <span className={`text-xs mt-1 whitespace-nowrap ${isCurrent ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {step.label}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 min-w-[20px] ${
                            index < currentIndex ? 'bg-emerald-500' : 'bg-gray-700'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex items-center justify-between">
              <button
                onClick={goToPrevStep}
                disabled={currentStep === 'sport'}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors
                  ${currentStep === 'sport' 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Anterior</span>
              </button>
              
              {currentStep === 'confirmation' ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                  <span>{isSubmitting ? 'Guardando...' : (editingCourt ? 'Guardar Cambios' : 'Crear Cancha')}</span>
                </button>
              ) : (
                <button
                  onClick={goToNextStep}
                  disabled={!canProceed()}
                  className={`
                    flex items-center space-x-2 px-6 py-2 rounded-xl transition-colors
                    ${canProceed()
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CreateCourtSidebar;
