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
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import GooglePlacesAutocomplete from '@/components/ui/GooglePlacesAutocomplete';

import { FileText, Shield } from 'lucide-react';

// Step definitions
const STEPS = [
  { id: 'info', title: 'Información', icon: Building2, description: 'Nombre y contacto' },
  { id: 'location', title: 'Ubicación', icon: MapPin, description: 'Dirección del complejo' },
  { id: 'schedule', title: 'Horarios', icon: Clock, description: 'Días y horas de atención' },
  { id: 'amenities', title: 'Servicios', icon: Sparkles, description: 'Qué ofreces' },
  { id: 'courts', title: 'Canchas', icon: LayoutGrid, description: 'Tus espacios deportivos' },
  { id: 'account', title: 'Tu Cuenta', icon: User, description: 'Datos de acceso' },
  { id: 'terms', title: 'Términos', icon: FileText, description: 'Contrato legal' },
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
  coordinates?: { lat: number; lng: number };
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
  // Terms
  termsAccepted: boolean;
  termsReadComplete: boolean;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'creating' | 'configuring' | 'success'>('creating');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    coordinates: undefined,
    schedule: defaultSchedule,
    amenities: [],
    sports: [],
    courts: [],
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    termsReadComplete: false,
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
      case 6: // Terms
        return formData.termsAccepted && formData.termsReadComplete;
      default:
        return false;
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
    setShowSuccessAnimation(true);
    setRegistrationStep('creating');

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
        // Translate common error messages to Spanish
        let errorMessage = registerResult.message || 'Error al crear la cuenta';
        if (errorMessage.includes('already exists')) {
          errorMessage = 'Ya existe una cuenta con este correo electrónico';
        } else if (errorMessage.includes('Invalid email')) {
          errorMessage = 'Correo electrónico inválido';
        } else if (errorMessage.includes('Password')) {
          errorMessage = 'La contraseña no cumple con los requisitos';
        }
        throw new Error(errorMessage);
      }

      // Step 2: Use the token from registration to create the establishment
      const token = registerResult.token || registerResult.data?.token;
      if (!token) {
        console.error('Register result:', registerResult);
        throw new Error('No se pudo obtener el token de autenticación. Por favor, intenta iniciar sesión.');
      }

      // Save token for future use
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(registerResult.user));

      setRegistrationStep('configuring');

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
          coordinates: formData.coordinates,
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
        setRegistrationStep('success');
        localStorage.removeItem('establishmentRegistrationProgress');
        localStorage.setItem('registrationSuccess', JSON.stringify({
          establishment: result.establishment,
          status: result.status,
          timestamp: new Date().toISOString()
        }));
        
        // Dispatch auth change event
        window.dispatchEvent(new Event('auth-change'));
        
        // Wait for animation then redirect
        setTimeout(() => {
          router.replace('/establecimientos/admin');
        }, 2000);
      } else {
        throw new Error(result.message || 'Error al registrar el establecimiento');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setShowSuccessAnimation(false);
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

  const handleAddressPlaceSelect = (place: any) => {
    if (place.formatted_address) {
      updateFormData({ address: place.formatted_address });
    }
    
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      updateFormData({ coordinates: { lat, lng } });
    }
    
    // Extract city from address components
    if (place.address_components) {
      const cityComponent = place.address_components.find((component: any) =>
        component.types.includes('locality') || component.types.includes('administrative_area_level_2')
      );
      if (cityComponent) {
        updateFormData({ city: cityComponent.long_name });
      }
      
      const provinceComponent = place.address_components.find((component: any) =>
        component.types.includes('administrative_area_level_1')
      );
      if (provinceComponent) {
        updateFormData({ province: provinceComponent.long_name });
      }
    }
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
    6: {
      title: '📄 Términos Legales',
      tips: [
        'Lee completamente el contrato antes de aceptar',
        'Incluye protección legal para ambas partes',
        'Define responsabilidades y comisiones claramente',
      ]
    },
  };

  return (
    <>
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
            >
              <div className="text-center space-y-6">
                {/* Animated Icon */}
                <div className="relative">
                  {registrationStep === 'creating' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 mx-auto"
                    >
                      <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
                    </motion.div>
                  )}
                  {registrationStep === 'configuring' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 mx-auto"
                    >
                      <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                    </motion.div>
                  )}
                  {registrationStep === 'success' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                      className="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Check className="w-10 h-10 text-white" strokeWidth={3} />
                      </motion.div>
                    </motion.div>
                  )}
                </div>

                {/* Status Text */}
                <div>
                  {registrationStep === 'creating' && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Creando tu cuenta</h3>
                      <p className="text-gray-600">Configurando tu perfil de establecimiento...</p>
                    </>
                  )}
                  {registrationStep === 'configuring' && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Configurando establecimiento</h3>
                      <p className="text-gray-600">Registrando canchas y servicios...</p>
                    </>
                  )}
                  {registrationStep === 'success' && (
                    <>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-emerald-600 mb-2"
                      >
                        ¡Registro completado!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600"
                      >
                        Redirigiendo a tu dashboard...
                      </motion.p>
                    </>
                  )}
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2">
                  {['creating', 'configuring', 'success'].map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ scale: 0.8 }}
                      animate={{
                        scale: registrationStep === step ? 1.2 : 0.8,
                        backgroundColor: 
                          registrationStep === 'success' && index <= 2 ? '#10b981' :
                          registrationStep === 'configuring' && index <= 1 ? '#3b82f6' :
                          registrationStep === 'creating' && index === 0 ? '#10b981' :
                          '#e5e7eb'
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-2 h-2 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Sidebar - Steps Navigation */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 bottom-0 z-30">
        {/* Logo Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Registrar Establecimiento</h1>
              <p className="text-xs text-gray-500">Paso {currentStep + 1} de {STEPS.length}</p>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  disabled={index > currentStep}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                      : isCompleted
                        ? 'text-gray-700 hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed'
                  } ${index <= currentStep ? 'cursor-pointer' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-white' 
                      : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-emerald-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Help Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowGuideSidebar(!showGuideSidebar)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <HelpCircle className="w-4 h-4" />
            {showGuideSidebar ? 'Ocultar Guía' : 'Mostrar Guía'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 h-14">
          <div className="h-full px-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900">{STEPS[currentStep].title}</h2>
            </div>
            <div className="text-xs text-gray-500">
              Guardado automáticamente
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`transition-all duration-300 ${showGuideSidebar ? 'mr-80' : ''}`}>

          {/* Form Content */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Step 0: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Información Básica</h3>
                      <p className="text-sm text-gray-500 mb-6">Cuéntanos sobre tu complejo deportivo</p>
                    
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Establecimiento *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateFormData({ name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-gray-900 placeholder-gray-400"
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
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
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
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                              placeholder="+54 11 1234-5678"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Location */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Ubicación</h3>
                      <p className="text-sm text-gray-500 mb-6">¿Dónde se encuentra tu establecimiento?</p>
                    
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección *
                          </label>
                          <GooglePlacesAutocomplete
                            value={formData.address}
                            onChange={(value) => updateFormData({ address: value })}
                            onPlaceSelect={handleAddressPlaceSelect}
                            placeholder="Buscar dirección en Google Maps..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                            types={['address']}
                          />
                          {formData.coordinates && (
                            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Ubicación verificada en el mapa
                            </p>
                          )}
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
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                              placeholder="Buenos Aires"
                              style={{ color: '#111827' }}
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
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                              placeholder="Buenos Aires"
                              style={{ color: '#111827' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Schedule */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Horarios de Atención</h3>
                      <p className="text-sm text-gray-500 mb-6">Define cuándo está abierto tu establecimiento</p>
                    
                      <div className="space-y-2">
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
                  </div>
                )}

                {/* Step 3: Amenities & Sports */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Deportes y Servicios</h3>
                      <p className="text-sm text-gray-500 mb-6">¿Qué deportes y servicios ofreces?</p>
                    
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-base font-semibold text-gray-800 mb-3">Deportes *</h4>
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
                        <h4 className="text-base font-semibold text-gray-800 mb-3">Servicios</h4>
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
                    </div>
                  </div>
                )}

                {/* Step 4: Courts */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Tus Canchas</h3>
                      <p className="text-sm text-gray-500 mb-6">Agrega al menos una cancha para comenzar</p>
                    
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
                  </div>
                )}

                {/* Step 5: Account */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Tu Cuenta</h3>
                      <p className="text-sm text-gray-500 mb-6">Crea tu contraseña para acceder al sistema</p>
                    
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="text-emerald-800 font-medium text-sm">Email de acceso</p>
                            <p className="text-emerald-600 text-sm">{formData.email || 'Tu email del paso 1'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => updateFormData({ password: e.target.value })}
                              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                              placeholder="Mínimo 6 caracteres"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Contraseña *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-400"
                              placeholder="Repite tu contraseña"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">Las contraseñas no coinciden</p>
                          )}
                        </div>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6: Terms and Conditions */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Términos y Condiciones</h3>
                          <p className="text-sm text-gray-500">Contrato de Prestación de Servicios</p>
                        </div>
                      </div>

                      {/* Terms Content - Scrollable */}
                      <div 
                        className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-6 bg-gray-50 text-sm text-gray-700 leading-relaxed space-y-4 mb-6"
                        onScroll={(e) => {
                          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
                          if (isAtBottom && !formData.termsReadComplete) {
                            updateFormData({ termsReadComplete: true });
                          }
                        }}
                      >
                        <section>
                          <h4 className="font-semibold text-gray-900 mb-2">1. OBJETO DEL CONTRATO</h4>
                          <p>El presente contrato regula la prestación de servicios de la plataforma digital de reservas deportivas ("la Plataforma"), que permite a establecimientos deportivos ("el Establecimiento") ofrecer sus servicios de alquiler de canchas y espacios deportivos a usuarios finales ("los Usuarios").</p>
                        </section>

                        <section>
                          <h4 className="font-semibold text-gray-900 mb-2">2. OBLIGACIONES DEL ESTABLECIMIENTO</h4>
                          <div className="space-y-2">
                            <p><strong>2.1 Información Veraz:</strong> Proporcionar información veraz, actualizada y completa sobre instalaciones, servicios, horarios y tarifas.</p>
                            <p><strong>2.2 Disponibilidad:</strong> Mantener actualizada la disponibilidad de canchas en tiempo real.</p>
                            <p><strong>2.3 Calidad del Servicio:</strong> Brindar servicios conforme a estándares publicitados y mantener instalaciones en condiciones óptimas de seguridad e higiene.</p>
                            <p><strong>2.4 Atención al Cliente:</strong> Proporcionar atención adecuada respetando horarios de reserva confirmados.</p>
                            <p><strong>2.5 Cumplimiento Legal:</strong> Cumplir con todas las normativas locales, provinciales y nacionales aplicables.</p>
                            <p><strong>2.6 Seguros:</strong> Mantener vigente seguro de responsabilidad civil que cubra daños a terceros por monto mínimo de $5.000.000 ARS.</p>
                          </div>
                        </section>

                        <section>
                          <h4 className="font-semibold text-gray-900 mb-2">3. COMISIONES Y TARIFAS</h4>
                          <div className="space-y-2">
                            <p><strong>3.1 Comisión de Plataforma:</strong> La Plataforma cobrará una comisión del 8% sobre el valor de cada reserva confirmada y efectivamente utilizada.</p>
                            <p><strong>3.2 Tarifa de Servicio al Usuario:</strong> Se aplicará una tarifa de servicio del 5% al Usuario final, la cual será claramente informada antes de confirmar la reserva.</p>
                            <p><strong>3.3 Liquidación:</strong> Las liquidaciones se realizarán semanalmente, descontando comisiones e impuestos aplicables.</p>
                            <p><strong>3.4 Procesamiento de Pagos:</strong> Los pagos se procesarán a través de Mercado Pago. Las comisiones de procesamiento de pago son adicionales y serán descontadas automáticamente.</p>
                            <p><strong>3.5 Facturación:</strong> El Establecimiento deberá emitir facturación correspondiente conforme a legislación fiscal vigente.</p>
                            <p><strong>3.6 Impuestos:</strong> Cada parte será responsable del pago de impuestos que le correspondan según legislación aplicable.</p>
                          </div>
                        </section>

                        <section>
                          <h4 className="font-semibold text-gray-900 mb-2">4. PAGOS Y REEMBOLSOS</h4>
                          <div className="space-y-2">
                            <p><strong>4.1 Métodos de Pago:</strong> Los Usuarios podrán pagar mediante tarjetas de crédito/débito, transferencias bancarias o efectivo (según disponibilidad del Establecimiento).</p>
                            <p><strong>4.2 Depósitos:</strong> El Establecimiento podrá requerir un depósito del 50% al momento de la reserva, con el saldo restante pagadero antes o al momento del uso.</p>
                            <p><strong>4.3 Cancelaciones con Reembolso:</strong> Cancelaciones con más de 24 horas de anticipación: reembolso del 100%. Cancelaciones con menos de 24 horas: reembolso del 50%.</p>
                            <p><strong>4.4 No-Show:</strong> Si el Usuario no se presenta sin cancelar, no habrá reembolso y se cobrará el 100% de la reserva.</p>
                            <p><strong>4.5 Fuerza Mayor:</strong> En casos de fuerza mayor (clima adverso, emergencias sanitarias, etc.), se aplicará reembolso del 100%.</p>
                            <p><strong>4.6 Cancelación por Establecimiento:</strong> Si el Establecimiento cancela una reserva confirmada, deberá reembolsar el 100% más una penalidad del 20% del valor.</p>
                            <p><strong>4.7 Tiempo de Reembolso:</strong> Los reembolsos se procesarán en un plazo máximo de 10 días hábiles.</p>
                          </div>
                        </section>

                        <section>
                          <h4 className="font-semibold text-gray-900 mb-2">5. RESPONSABILIDADES Y LIMITACIONES</h4>
                          <div className="space-y-2">
                            <p><strong>5.1 Responsabilidad del Establecimiento:</strong> El Establecimiento es ÚNICO RESPONSABLE por:</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                              <li>Seguridad de las instalaciones y equipamiento</li>
                              <li>Lesiones, accidentes o daños que ocurran en sus predios</li>
                              <li>Cumplimiento de normativas de seguridad, higiene y habilitaciones municipales</li>
                              <li>Mantenimiento adecuado de canchas y espacios deportivos</li>
                              <li>Disponibilidad de servicios ofrecidos (iluminación, vestuarios, etc.)</li>
                            </ul>
                            <p><strong>5.2 Limitación de Responsabilidad de la Plataforma:</strong> La Plataforma actúa EXCLUSIVAMENTE como intermediario tecnológico y NO será responsable por:</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                              <li>Daños, lesiones o perjuicios que ocurran en instalaciones del Establecimiento</li>
                              <li>Calidad de servicios prestados por el Establecimiento</li>
                              <li>Disputas entre Establecimiento y Usuarios</li>
                              <li>Pérdida de objetos personales en las instalaciones</li>
                              <li>Incumplimientos contractuales del Establecimiento con Usuarios</li>
                            </ul>
                            <p><strong>5.3 Indemnización:</strong> El Establecimiento se compromete a indemnizar y mantener indemne a la Plataforma de cualquier reclamo, demanda o acción legal derivada de su actividad.</p>
                            <p><strong>5.4 Seguro Obligatorio:</strong> El Establecimiento DEBE mantener vigente un seguro de responsabilidad civil por monto mínimo de $5.000.000 ARS y presentar comprobante anual.</p>
                          </div>
                        </section>

                        <section>
                          <h4 className="font-semibold text-gray-900 mb-2">6. PROTECCIÓN DE DATOS Y PRIVACIDAD</h4>
                          <div className="space-y-2">
                            <p><strong>6.1 Ley Aplicable:</strong> Tratamiento de datos personales conforme a Ley 25.326 de Protección de Datos Personales y normativas complementarias.</p>
                            <p><strong>6.2 Confidencialidad:</strong> La información comercial y de usuarios será tratada con estricta confidencialidad.</p>
                            <p><strong>6.3 Uso de Datos:</strong> Los datos solo podrán utilizarse para fines relacionados con la prestación del servicio.</p>
                            <p><strong>6.4 Seguridad:</strong> Implementación de medidas técnicas y organizativas apropiadas para proteger datos.</p>
                          </div>
                        </section>

                        <section>
                          <h4 className="font-semibold text-gray-900 mb-2">7. SUSPENSIÓN Y TERMINACIÓN</h4>
                          <div className="space-y-2">
                            <p><strong>7.1 Suspensión Inmediata:</strong> La Plataforma podrá suspender la cuenta del Establecimiento inmediatamente en caso de:</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                              <li>Incumplimiento grave de obligaciones contractuales</li>
                              <li>Fraude o actividades ilegales</li>
                              <li>Múltiples reclamos de Usuarios</li>
                              <li>Falta de pago de comisiones</li>
                              <li>Información falsa o engañosa</li>
                            </ul>
                            <p><strong>7.2 Terminación Voluntaria:</strong> Cualquier parte podrá terminar el contrato con 30 días de preaviso.</p>
                            <p><strong>7.3 Obligaciones Post-Terminación:</strong> Las reservas confirmadas deberán honrarse incluso después de la terminación.</p>
                          </div>
                        </section>

                        <section>
                          <h4 className="font-semibold text-gray-900 mb-2">8. PROPIEDAD INTELECTUAL</h4>
                          <div className="space-y-2">
                            <p><strong>8.1 Derechos de la Plataforma:</strong> Todos los derechos de propiedad intelectual sobre la Plataforma pertenecen a la empresa operadora.</p>
                            <p><strong>8.2 Licencia de Contenido:</strong> El Establecimiento otorga licencia no exclusiva para uso de sus imágenes y contenidos en la Plataforma.</p>
                            <p><strong>8.3 Prohibiciones:</strong> Queda prohibido copiar, modificar o realizar ingeniería inversa de la Plataforma.</p>
                          </div>
                        </section>

                        <section>
                          <h4 className="font-semibold text-gray-900 mb-2">9. RESOLUCIÓN DE CONFLICTOS</h4>
                          <div className="space-y-2">
                            <p><strong>9.1 Mediación:</strong> Las partes intentarán resolver controversias mediante mediación antes de recurrir a instancias judiciales.</p>
                            <p><strong>9.2 Jurisdicción:</strong> Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires.</p>
                            <p><strong>9.3 Ley Aplicable:</strong> Leyes de la República Argentina.</p>
                          </div>
                        </section>

                        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="text-yellow-800 font-semibold mb-2 flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            DECLARACIÓN DE CONFORMIDAD
                          </h4>
                          <p className="text-yellow-900 mb-2">Al aceptar estos términos, el representante legal del establecimiento declara bajo juramento que:</p>
                          <ul className="list-disc list-inside space-y-1 text-yellow-900">
                            <li>Tiene capacidad legal para contratar en nombre del establecimiento</li>
                            <li>La información proporcionada es veraz y completa</li>
                            <li>El establecimiento cumple con todas las habilitaciones municipales requeridas</li>
                            <li>Cuenta con los seguros de responsabilidad civil correspondientes</li>
                            <li>Se compromete a cumplir con todas las obligaciones establecidas</li>
                            <li>Acepta las comisiones y tarifas de servicio establecidas</li>
                            <li>Comprende y acepta las limitaciones de responsabilidad de la Plataforma</li>
                          </ul>
                        </section>

                        <div className="text-center py-4 text-gray-500 border-t border-gray-300">
                          <p className="font-medium">--- Fin del Documento ---</p>
                          <p className="text-xs mt-2">
                            Documento generado el {new Date().toLocaleDateString('es-AR')} - Versión 1.0<br />
                            Plataforma de Reservas Deportivas - MisCanchas
                          </p>
                        </div>
                      </div>

                      {/* Reading Progress */}
                      {!formData.termsReadComplete && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Eye className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-blue-900 font-medium text-sm">Debes leer completamente los términos</p>
                              <p className="text-blue-700 text-xs">Desplázate hasta el final del documento para continuar</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Acceptance Checkbox */}
                      <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="terms-acceptance"
                          checked={formData.termsAccepted}
                          onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
                          disabled={!formData.termsReadComplete}
                          className="w-5 h-5 text-emerald-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed mt-0.5"
                        />
                        <label 
                          htmlFor="terms-acceptance" 
                          className={`text-sm leading-relaxed ${
                            formData.termsReadComplete ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <strong>Acepto los términos y condiciones</strong> del contrato de prestación de servicios. 
                          Declaro que he leído, entendido y acepto todas las cláusulas establecidas. 
                          Confirmo que tengo autoridad legal para comprometer al establecimiento en este acuerdo 
                          y que toda la información proporcionada es veraz y completa.
                        </label>
                      </div>

                      {formData.termsAccepted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4"
                        >
                          <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-emerald-600" />
                            <div>
                              <p className="text-emerald-900 font-medium text-sm">Términos aceptados correctamente</p>
                              <p className="text-emerald-700 text-xs">Fecha: {new Date().toLocaleString('es-AR')}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="bg-white border-t border-gray-200 p-6 sticky bottom-0">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                    currentStep === 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </button>
                
                {currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                      canProceed()
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-lg font-medium transition-all ${
                      canProceed() && !isSubmitting
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Completar Registro
                      </>
                    )}
                  </button>
                )}
              </div>
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
              className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 overflow-y-auto z-30"
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
    </>
  );
};

export default EstablishmentRegistrationPage;
