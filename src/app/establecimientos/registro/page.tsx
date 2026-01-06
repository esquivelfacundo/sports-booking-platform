'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Sparkles, 
  Camera, 
  LayoutGrid, 
  User, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
  ChevronRight,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

// Step definitions
const STEPS = [
  { id: 'info', title: 'Información', icon: Building2, description: 'Nombre y contacto' },
  { id: 'location', title: 'Ubicación', icon: MapPin, description: 'Dirección del complejo' },
  { id: 'schedule', title: 'Horarios', icon: Clock, description: 'Días y horas de atención' },
  { id: 'amenities', title: 'Servicios', icon: Sparkles, description: 'Qué ofreces' },
  { id: 'courts', title: 'Canchas', icon: LayoutGrid, description: 'Tus espacios deportivos' },
  { id: 'account', title: 'Tu Cuenta', icon: User, description: 'Datos de acceso' },
];

interface FormData {
  // Basic Info
  name: string;
  description: string;
  phone: string;
  email: string;
  // Location
  address: string;
  city: string;
  province: string;
  // Schedule
  schedule: Record<string, { open: string; close: string; closed: boolean }>;
  // Amenities
  amenities: string[];
  sports: string[];
  // Courts
  courts: Array<{
    name: string;
    sport: string;
    surfaceType: string;
    pricePerHour: number;
    hasLighting: boolean;
    isIndoor: boolean;
  }>;
  // Account
  password: string;
  confirmPassword: string;
}

const defaultSchedule = {
  monday: { open: '08:00', close: '23:00', closed: false },
  tuesday: { open: '08:00', close: '23:00', closed: false },
  wednesday: { open: '08:00', close: '23:00', closed: false },
  thursday: { open: '08:00', close: '23:00', closed: false },
  friday: { open: '08:00', close: '23:00', closed: false },
  saturday: { open: '09:00', close: '23:00', closed: false },
  sunday: { open: '09:00', close: '22:00', closed: false },
};

const availableSports = [
  { id: 'futbol5', label: 'Fútbol 5', icon: '⚽' },
  { id: 'futbol7', label: 'Fútbol 7', icon: '⚽' },
  { id: 'futbol11', label: 'Fútbol 11', icon: '⚽' },
  { id: 'paddle', label: 'Pádel', icon: '🎾' },
  { id: 'tenis', label: 'Tenis', icon: '🎾' },
  { id: 'basquet', label: 'Básquet', icon: '🏀' },
  { id: 'voley', label: 'Vóley', icon: '🏐' },
];

const availableAmenities = [
  { id: 'parking', label: 'Estacionamiento', icon: '🅿️' },
  { id: 'showers', label: 'Vestuarios', icon: '🚿' },
  { id: 'bar', label: 'Bar/Cantina', icon: '🍺' },
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'grill', label: 'Parrilla', icon: '🔥' },
  { id: 'lockers', label: 'Lockers', icon: '🔐' },
  { id: 'equipment', label: 'Alquiler de equipos', icon: '🎽' },
  { id: 'lights', label: 'Iluminación nocturna', icon: '💡' },
];

const dayNames: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const EstablishmentRegistrationPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuideSidebar, setShowGuideSidebar] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    schedule: defaultSchedule,
    amenities: [],
    sports: [],
    courts: [],
    password: '',
    confirmPassword: '',
  });

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('establishmentRegistrationProgress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error loading saved progress:', e);
      }
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem('establishmentRegistrationProgress', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [formData]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Info
        return formData.name.trim() && formData.email.trim() && formData.phone.trim();
      case 1: // Location
        return formData.address.trim() && formData.city.trim();
      case 2: // Schedule
        return true; // Schedule has defaults
      case 3: // Amenities
        return formData.sports.length > 0;
      case 4: // Courts
        return formData.courts.length > 0;
      case 5: // Account
        return formData.password.length >= 6 && formData.password === formData.confirmPassword;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      
      // Step 1: Create user account first
      const registerResponse = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.name.split(' ')[0] || 'Admin',
          lastName: formData.name.split(' ').slice(1).join(' ') || 'Establecimiento',
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          userType: 'establishment'
        }),
      });

      const registerResult = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerResult.message || 'Error al crear la cuenta');
      }

      // Step 2: Use the token from registration to create the establishment
      const token = registerResult.token;
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      // Save token for future use
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(registerResult.user));

      const payload = {
        basicInfo: {
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
        },
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.province,
          zipCode: '',
        },
        schedule: formData.schedule,
        amenities: formData.amenities,
        images: { photos: [] },
        courts: formData.courts.map(court => ({
          name: court.name,
          sport: court.sport,
          surfaceType: court.surfaceType,
          pricePerHour: court.pricePerHour,
          hasLighting: court.hasLighting,
          isIndoor: court.isIndoor,
        })),
      };

      const response = await fetch(`${apiUrl}/api/establishments/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.removeItem('establishmentRegistrationProgress');
        localStorage.setItem('registrationSuccess', JSON.stringify({
          establishment: result.establishment,
          status: result.status,
          timestamp: new Date().toISOString()
        }));
        
        // Dispatch auth change event
        window.dispatchEvent(new Event('auth-change'));
        
        router.replace('/establecimientos/registro/exito');
      } else {
        throw new Error(result.message || 'Error al registrar el establecimiento');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCourt = () => {
    setFormData(prev => ({
      ...prev,
      courts: [
        ...prev.courts,
        {
          name: `Cancha ${prev.courts.length + 1}`,
          sport: prev.sports[0] || 'futbol5',
          surfaceType: 'synthetic',
          pricePerHour: 15000,
          hasLighting: true,
          isIndoor: false,
        }
      ]
    }));
  };

  const removeCourt = (index: number) => {
    setFormData(prev => ({
      ...prev,
      courts: prev.courts.filter((_, i) => i !== index)
    }));
  };

  const updateCourt = (index: number, updates: Partial<FormData['courts'][0]>) => {
    setFormData(prev => ({
      ...prev,
      courts: prev.courts.map((court, i) => i === index ? { ...court, ...updates } : court)
    }));
  };

  // Guide content for sidebar
  const guideContent: Record<number, { title: string; tips: string[] }> = {
    0: {
      title: '📋 Información Básica',
      tips: [
        'Usa el nombre oficial de tu complejo deportivo',
        'El email será tu medio de contacto principal',
        'Agrega un teléfono donde los clientes puedan contactarte',
      ]
    },
    1: {
      title: '📍 Ubicación',
      tips: [
        'La dirección ayuda a los clientes a encontrarte',
        'Asegúrate de que la ciudad sea correcta',
        'Una buena descripción de ubicación mejora tu visibilidad',
      ]
    },
    2: {
      title: '🕐 Horarios',
      tips: [
        'Define tus horarios de atención para cada día',
        'Puedes marcar días como cerrado si no atiendes',
        'Los horarios se pueden modificar después',
      ]
    },
    3: {
      title: '✨ Servicios y Deportes',
      tips: [
        'Selecciona todos los deportes que ofreces',
        'Los servicios adicionales atraen más clientes',
        'Puedes agregar más servicios después',
      ]
    },
    4: {
      title: '🏟️ Tus Canchas',
      tips: [
        'Agrega al menos una cancha para comenzar',
        'El precio por hora es lo que cobrarás',
        'Puedes agregar más canchas después del registro',
      ]
    },
    5: {
      title: '🔐 Tu Cuenta',
      tips: [
        'Crea una contraseña segura (mínimo 6 caracteres)',
        'Usarás tu email para iniciar sesión',
        'Podrás cambiar tu contraseña después',
      ]
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Steps */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">Registrar Establecimiento</h1>
              </div>
            </div>
            
            {/* Steps - Centered */}
            <div className="flex-1 flex justify-center px-4 overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-2">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <React.Fragment key={step.id}>
                      <button
                        onClick={() => index <= currentStep && setCurrentStep(index)}
                        disabled={index > currentStep}
                        className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : isCompleted
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-gray-400'
                        } ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isActive 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                            : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap hidden md:block">{step.title}</span>
                      </button>
                      
                      {index < STEPS.length - 1 && (
                        <div className={`w-6 sm:w-10 h-0.5 rounded ${
                          index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            
            {/* Help Button */}
            <button
              onClick={() => setShowGuideSidebar(!showGuideSidebar)}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex-shrink-0"
              title="Mostrar/ocultar guía"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${showGuideSidebar ? 'mr-80' : ''}`}>

          {/* Form Content */}
          <div className="max-w-2xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8"
              >
                {/* Step 0: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Información del Establecimiento</h2>
                      <p className="text-gray-500">Cuéntanos sobre tu complejo deportivo</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Establecimiento *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateFormData({ name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                          placeholder="Ej: Complejo Deportivo La Cancha"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => updateFormData({ description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-gray-900 placeholder-gray-400"
                          placeholder="Describe tu establecimiento, qué lo hace especial..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData({ email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                            placeholder="contacto@ejemplo.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono *
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateFormData({ phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                            placeholder="+54 11 1234-5678"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Location */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubicación</h2>
                      <p className="text-gray-500">¿Dónde se encuentra tu establecimiento?</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección *
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => updateFormData({ address: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                          placeholder="Av. Ejemplo 1234"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ciudad *
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => updateFormData({ city: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                            placeholder="Buenos Aires"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Provincia
                          </label>
                          <input
                            type="text"
                            value={formData.province}
                            onChange={(e) => updateFormData({ province: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                            placeholder="Buenos Aires"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Schedule */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Horarios de Atención</h2>
                      <p className="text-gray-500">Define cuándo está abierto tu establecimiento</p>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(formData.schedule).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                          <div className="w-24">
                            <span className="font-medium text-gray-700">{dayNames[day]}</span>
                          </div>
                          
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!hours.closed}
                              onChange={(e) => updateFormData({
                                schedule: {
                                  ...formData.schedule,
                                  [day]: { ...hours, closed: !e.target.checked }
                                }
                              })}
                              className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-600">Abierto</span>
                          </label>
                          
                          {!hours.closed && (
                            <>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => updateFormData({
                                  schedule: {
                                    ...formData.schedule,
                                    [day]: { ...hours, open: e.target.value }
                                  }
                                })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                              <span className="text-gray-400">a</span>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => updateFormData({
                                  schedule: {
                                    ...formData.schedule,
                                    [day]: { ...hours, close: e.target.value }
                                  }
                                })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Amenities & Sports */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Deportes y Servicios</h2>
                      <p className="text-gray-500">¿Qué deportes y servicios ofreces?</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Deportes *</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableSports.map((sport) => (
                          <button
                            key={sport.id}
                            type="button"
                            onClick={() => {
                              const newSports = formData.sports.includes(sport.id)
                                ? formData.sports.filter(s => s !== sport.id)
                                : [...formData.sports, sport.id];
                              updateFormData({ sports: newSports });
                            }}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              formData.sports.includes(sport.id)
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            <span className="text-2xl mb-1 block">{sport.icon}</span>
                            <span className="text-sm font-medium">{sport.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Servicios</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {availableAmenities.map((amenity) => (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => {
                              const newAmenities = formData.amenities.includes(amenity.id)
                                ? formData.amenities.filter(a => a !== amenity.id)
                                : [...formData.amenities, amenity.id];
                              updateFormData({ amenities: newAmenities });
                            }}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${
                              formData.amenities.includes(amenity.id)
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            <span className="text-xl mb-1 block">{amenity.icon}</span>
                            <span className="text-xs font-medium">{amenity.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Courts */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tus Canchas</h2>
                      <p className="text-gray-500">Agrega al menos una cancha para comenzar</p>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.courts.map((court, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-800">Cancha {index + 1}</h4>
                            <button
                              onClick={() => removeCourt(index)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                              <input
                                type="text"
                                value={court.name}
                                onChange={(e) => updateCourt(index, { name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Deporte</label>
                              <select
                                value={court.sport}
                                onChange={(e) => updateCourt(index, { sport: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                {availableSports.map(s => (
                                  <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Precio por hora ($)</label>
                              <input
                                type="number"
                                value={court.pricePerHour}
                                onChange={(e) => updateCourt(index, { pricePerHour: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Superficie</label>
                              <select
                                value={court.surfaceType}
                                onChange={(e) => updateCourt(index, { surfaceType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                <option value="synthetic">Sintético</option>
                                <option value="grass">Césped</option>
                                <option value="clay">Polvo de ladrillo</option>
                                <option value="cement">Cemento</option>
                                <option value="wood">Madera</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex gap-6 mt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={court.hasLighting}
                                onChange={(e) => updateCourt(index, { hasLighting: e.target.checked })}
                                className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                              />
                              <span className="text-sm text-gray-600">Con iluminación</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={court.isIndoor}
                                onChange={(e) => updateCourt(index, { isIndoor: e.target.checked })}
                                className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                              />
                              <span className="text-sm text-gray-600">Techada</span>
                            </label>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={addCourt}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <LayoutGrid className="w-5 h-5" />
                        Agregar Cancha
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Account */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu Cuenta</h2>
                      <p className="text-gray-500">Crea tu contraseña para acceder al sistema</p>
                    </div>
                    
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-emerald-800 font-medium">Email de acceso</p>
                          <p className="text-emerald-600 text-sm">{formData.email || 'Tu email del paso 1'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña *
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => updateFormData({ password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Contraseña *
                        </label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                          placeholder="Repite tu contraseña"
                        />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">Las contraseñas no coinciden</p>
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Anterior
              </button>
              
              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    canProceed()
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                    canProceed() && !isSubmitting
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Completar Registro
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Guide Sidebar */}
        <AnimatePresence>
          {showGuideSidebar && (
            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-200 overflow-y-auto z-30"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Guía de Registro</h3>
                  <button
                    onClick={() => setShowGuideSidebar(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    {guideContent[currentStep]?.title}
                  </h4>
                  <ul className="space-y-3">
                    {guideContent[currentStep]?.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                  <p className="text-sm text-emerald-800">
                    💡 <strong>¿Necesitas ayuda?</strong> Contáctanos por WhatsApp y te guiamos en el proceso.
                  </p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EstablishmentRegistrationPage;
