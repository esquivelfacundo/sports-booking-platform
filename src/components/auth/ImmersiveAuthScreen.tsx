'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, ArrowRight, ArrowLeft, Check, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProvinceSelect from '@/components/ProvinceSelect';
import CountrySelect, { countries } from '@/components/CountrySelect';

interface ImmersiveAuthScreenProps {
  defaultMode?: 'login' | 'register';
}

const ImmersiveAuthScreen: React.FC<ImmersiveAuthScreenProps> = ({ defaultMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration form data
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'AR', // Default to Argentina
    phone: '',
    province: '',
    city: '',
    postalCode: '',
    sports: [] as { sportId: string; skillLevel: string }[],
    preferredTimes: [] as string[],
    birthDate: '',
    bio: ''
  });

  const availableSports = [
    { id: 'futbol5', name: 'Fútbol 5', icon: '⚽', color: 'from-green-500 to-emerald-500' },
    { id: 'futbol11', name: 'Fútbol 11', icon: '⚽', color: 'from-green-600 to-emerald-600' },
    { id: 'paddle', name: 'Pádel', icon: '🎾', color: 'from-blue-500 to-cyan-500' },
    { id: 'tenis', name: 'Tenis', icon: '🎾', color: 'from-yellow-500 to-orange-500' },
    { id: 'basquet', name: 'Básquet', icon: '🏀', color: 'from-orange-500 to-red-500' },
    { id: 'voley', name: 'Vóley', icon: '🏐', color: 'from-purple-500 to-pink-500' },
    { id: 'hockey', name: 'Hockey', icon: '🏑', color: 'from-indigo-500 to-purple-500' },
    { id: 'rugby', name: 'Rugby', icon: '🏉', color: 'from-red-500 to-pink-500' }
  ];

  const skillLevels = [
    { id: 'beginner', name: 'Principiante', description: 'Recién empiezo', icon: '🌱', color: 'from-green-400 to-emerald-400' },
    { id: 'intermediate', name: 'Intermedio', description: 'Tengo experiencia', icon: '⚡', color: 'from-blue-400 to-cyan-400' },
    { id: 'advanced', name: 'Avanzado', description: 'Nivel competitivo', icon: '🔥', color: 'from-orange-400 to-red-400' },
    { id: 'professional', name: 'Profesional', description: 'Juego profesionalmente', icon: '👑', color: 'from-purple-400 to-pink-400' }
  ];

  const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  // Format phone number with country code
  const formatPhoneNumber = (phone: string, countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    const phonePrefix = country?.phoneCode || '+54';
    
    // Remove all non-digits and any existing country code
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Remove country code if it's already included
    if (cleanPhone.startsWith('54') && countryCode === 'AR') {
      cleanPhone = cleanPhone.substring(2);
    }
    
    // For Argentina, ensure proper format: +54 9 area_code number
    if (countryCode === 'AR') {
      // Add the mobile prefix '9' if not present for mobile numbers
      if (cleanPhone.length === 10 && !cleanPhone.startsWith('9')) {
        cleanPhone = '9' + cleanPhone;
      }
      return `+54${cleanPhone}`;
    }
    
    return `${phonePrefix}${cleanPhone}`;
  };

  // Loading progress simulation
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(0);
    }
  }, [isLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(loginData);
      if (!success) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.');
      }
    } catch (error) {
      console.error('ImmersiveAuthScreen: Login error:', error);
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    setError('');
    
    if (step === 1) {
      if (!registerData.country || !registerData.phone) {
        setError('Por favor selecciona tu país y completa tu número de teléfono');
        return;
      }
      setIsVerifying(true);
      return;
    } else if (step === 2) {
      if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.password) {
        setError('Por favor completa todos los campos obligatorios');
        return;
      }
      if (registerData.password !== registerData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (registerData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    } else if (step === 3) {
      if (!registerData.province || !registerData.city || !registerData.postalCode) {
        setError('Por favor completa tu ubicación completa');
        return;
      }
    } else if (step === 4) {
      if (registerData.sports.length === 0) {
        setError('Selecciona al menos un deporte');
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (verificationCode === '123456') {
        setIsVerifying(false);
        setStep(2);
      } else {
        setError('Código incorrecto. Intenta nuevamente.');
      }
    } catch (error) {
      setError('Error en la verificación. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');

    try {
      const finalData = {
        ...registerData,
        phone: formatPhoneNumber(registerData.phone, registerData.country)
      };
      const success = await register({
        firstName: finalData.firstName,
        lastName: finalData.lastName,
        email: finalData.email,
        password: finalData.password,
        country: finalData.country,
        phone: finalData.phone,
        province: finalData.province,
        city: finalData.city,
        postalCode: finalData.postalCode,
        sports: finalData.sports,
        preferredTimes: finalData.preferredTimes,
        birthDate: finalData.birthDate,
        bio: finalData.bio
      });

      if (!success) {
        setError('Error al crear la cuenta. Intenta nuevamente.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message.includes('User already exists') || error.message.includes('email already exists')) {
        setError('Este email ya está registrado. Intenta con otro email o inicia sesión.');
      } else if (error.message.includes('validation') || error.message.includes('input data')) {
        setError('Por favor verifica que todos los campos estén completos y correctos.');
      } else {
        setError('Error al registrarse. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSport = (sportId: string) => {
    setRegisterData(prev => {
      const existingSport = prev.sports.find(s => s.sportId === sportId);
      if (existingSport) {
        return {
          ...prev,
          sports: prev.sports.filter(s => s.sportId !== sportId)
        };
      } else {
        return {
          ...prev,
          sports: [...prev.sports, { sportId, skillLevel: 'intermediate' }]
        };
      }
    });
  };

  const updateSportSkillLevel = (sportId: string, skillLevel: string) => {
    setRegisterData(prev => ({
      ...prev,
      sports: prev.sports.map(s => 
        s.sportId === sportId ? { ...s, skillLevel } : s
      )
    }));
  };

  const toggleTimeSlot = (time: string) => {
    setRegisterData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(time)
        ? prev.preferredTimes.filter(t => t !== time)
        : [...prev.preferredTimes, time]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Dynamic Background with Floating Particles */}
      <div className="absolute inset-0">
        {/* Animated Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Floating Particles - Fixed positions to prevent hydration mismatch */}
        {[
          { left: 21.8, top: 9.2, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 36.5, top: 91.7, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 1.7, top: 46.2, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 58.5, top: 23.7, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 27.0, top: 51.2, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 39.3, top: 17.7, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 93.5, top: 61.4, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 1.1, top: 72.0, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 97.4, top: 43.8, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 71.9, top: 15.6, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 7.8, top: 55.0, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 66.1, top: 93.4, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 39.8, top: 0.2, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 93.3, top: 52.3, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 6.9, top: 19.8, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 25.9, top: 18.7, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 50.5, top: 71.6, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 22.8, top: 96.5, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 18.7, top: 88.4, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          { left: 88.1, top: 37.3, size: 'w-1 h-1', color: 'bg-emerald-400/30' },
          // Smaller particles
          { left: 70.9, top: 61.6, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 87.5, top: 45.3, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 68.2, top: 38.0, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 0.5, top: 33.6, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 72.9, top: 78.2, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 90.1, top: 28.3, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 55.7, top: 17.0, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 75.5, top: 47.8, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 84.9, top: 72.8, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 74.8, top: 65.5, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 12.1, top: 28.3, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 91.8, top: 68.5, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 73.6, top: 26.2, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 54.6, top: 92.3, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' },
          { left: 24.4, top: 6.1, size: 'w-0.5 h-0.5', color: 'bg-cyan-400/40' }
        ].map((particle, i) => (
          <motion.div
            key={i}
            className={`absolute ${particle.size} ${particle.color} rounded-full`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              x: [0, 20, -10, 15, 0],
              y: [0, -15, 25, -20, 0],
            }}
            transition={{
              duration: 20 + (i % 10),
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          className={`w-full ${mode === 'register' && step >= 3 ? 'max-w-4xl' : 'max-w-md'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="bg-gray-900/40 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo inside container */}
            <motion.div
              className="flex items-center justify-center pt-8 pb-4"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                className="flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.img
                  src="/assets/logo-3.png"
                  alt="Mis Canchas"
                  className="h-20 w-auto"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                />
              </motion.div>
            </motion.div>

            {/* Header */}
            <motion.div 
              className="px-8 pb-8 text-center relative overflow-hidden"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.p 
                className="text-gray-300 text-xl relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {mode === 'login' ? 'Bienvenido de vuelta' : 'Únete a la red de jugadores más grande de Latinoamérica'}
              </motion.p>
            </motion.div>

            {/* Form Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  <motion.form
                    key="login"
                    onSubmit={handleLogin}
                    className="space-y-6"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-10 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full pl-10 pr-12 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
                      >
                        <p className="text-sm text-red-400">{error}</p>
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-4 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </motion.button>

                    {/* Switch to Register */}
                    <div className="text-center pt-4">
                      <span className="text-gray-400">¿No tienes cuenta? </span>
                      <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        Regístrate
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <AnimatePresence mode="wait">
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-white mb-2">País y teléfono</h3>
                          <p className="text-gray-400 text-sm">Paso 1 de 6</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: '16.67%' }}></div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">País *</label>
                          <CountrySelect
                            value={registerData.country}
                            onChange={(country) => setRegisterData(prev => ({ ...prev, country: country.code }))}
                            className="backdrop-blur-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp *</label>
                          <div className="flex space-x-2">
                            <div className="w-24 flex-shrink-0">
                              <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl px-3 py-4 text-white text-center">
                                {countries.find(c => c.code === registerData.country)?.phoneCode || '+54'}
                              </div>
                            </div>
                            <div className="flex-1 relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type="tel"
                                value={registerData.phone}
                                onChange={(e) => {
                                  // Only allow numbers
                                  const phone = e.target.value.replace(/\D/g, '');
                                  setRegisterData(prev => ({ ...prev, phone }));
                                }}
                                className="w-full pl-10 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                                placeholder="11 1234 5678"
                                required
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Te enviaremos un código de verificación</p>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
                          >
                            <p className="text-sm text-red-400">{error}</p>
                          </motion.div>
                        )}

                        <motion.button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-4 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>Continuar</span>
                          <ArrowRight className="w-5 h-5" />
                        </motion.button>

                        <div className="text-center pt-4">
                          <span className="text-gray-400">¿Ya tienes cuenta? </span>
                          <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                          >
                            Inicia sesión
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Contact & Location */}
                    {step === 2 && !isVerifying && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-white mb-2">Información básica</h3>
                          <p className="text-gray-400 text-sm">Paso 2 de 6</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: '33.33%' }}></div>
                          </div>
                        </div>

                        {/* Nombre y Apellido en 2 columnas en desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type="text"
                                value={registerData.firstName}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                                className="w-full pl-10 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                                placeholder="Tu nombre"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Apellido *</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type="text"
                                value={registerData.lastName}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                                className="w-full pl-10 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                                placeholder="Tu apellido"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="email"
                              value={registerData.email}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full pl-10 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                              placeholder="tu@email.com"
                              required
                            />
                          </div>
                        </div>

                        {/* Contraseñas en 2 columnas en desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña *</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={registerData.password}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full pl-10 pr-12 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                                placeholder="••••••••"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Contraseña *</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={registerData.confirmPassword}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full pl-10 pr-12 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                                placeholder="••••••••"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
                          >
                            <p className="text-sm text-red-400">{error}</p>
                          </motion.div>
                        )}

                        <div className="flex space-x-4">
                          <motion.button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 py-4 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Anterior</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={handleNextStep}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>Continuar</span>
                            <ArrowRight className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* WhatsApp Verification */}
                    {isVerifying && (
                      <motion.div
                        key="verification"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-white mb-2">Verificación WhatsApp</h3>
                          <p className="text-gray-400 text-sm">Ingresa el código que enviamos a {registerData.phone}</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full py-4 text-center text-2xl tracking-widest bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                            placeholder="123456"
                            maxLength={6}
                          />
                          <p className="text-xs text-center text-gray-500">Código de prueba: 123456</p>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
                          >
                            {error}
                          </motion.div>
                        )}

                        <motion.button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={isLoading || verificationCode.length !== 6}
                          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-4 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin mr-2" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Verificar Código
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Step 3: Location Details */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-white mb-2">¿Dónde vives?</h3>
                          <p className="text-gray-400 text-sm">Paso 3 de 6 - Información de ubicación</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                          </div>
                        </div>

                        {/* Provincia, Ciudad y Código Postal en 3 columnas en desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Provincia *</label>
                            <ProvinceSelect
                              value={registerData.province}
                              onChange={(province) => setRegisterData(prev => ({ ...prev, province }))}
                              className="w-full py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad *</label>
                            <input
                              type="text"
                              value={registerData.city}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, city: e.target.value }))}
                              className="w-full py-4 px-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                              placeholder="Tu ciudad"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Código Postal *</label>
                            <input
                              type="text"
                              value={registerData.postalCode}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, postalCode: e.target.value }))}
                              className="w-full py-4 px-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                              placeholder="Ej: 1425"
                              required
                            />
                          </div>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
                          >
                            <p className="text-sm text-red-400">{error}</p>
                          </motion.div>
                        )}

                        <div className="flex space-x-4">
                          <motion.button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 py-4 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Anterior</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={handleNextStep}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>Continuar</span>
                            <ArrowRight className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Sports Selection */}
                    {step === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-white mb-2">Deportes favoritos</h3>
                          <p className="text-gray-400 text-sm">Paso 4 de 6</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: '66.67%' }}></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {availableSports.map((sport) => {
                            const selectedSport = registerData.sports.find(s => s.sportId === sport.id);
                            const isSelected = !!selectedSport;
                            
                            return (
                              <motion.div
                                key={sport.id}
                                className="space-y-2"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: availableSports.indexOf(sport) * 0.1 }}
                              >
                                <motion.button
                                  type="button"
                                  onClick={() => toggleSport(sport.id)}
                                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                                    isSelected
                                      ? `bg-gradient-to-r ${sport.color} border-transparent text-white shadow-lg`
                                      : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-gray-500'
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <div className="text-2xl mb-2">{sport.icon}</div>
                                  <div className="text-sm font-medium">{sport.name}</div>
                                </motion.button>
                                
                                {isSelected && (
                                  <motion.select
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    value={selectedSport?.skillLevel || ''}
                                    onChange={(e) => updateSportSkillLevel(sport.id, e.target.value)}
                                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  >
                                    <option value="">Nivel</option>
                                    <option value="principiante">Principiante</option>
                                    <option value="intermedio">Intermedio</option>
                                    <option value="avanzado">Avanzado</option>
                                    <option value="profesional">Profesional</option>
                                  </motion.select>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
                          >
                            <p className="text-sm text-red-400">{error}</p>
                          </motion.div>
                        )}

                        <div className="flex space-x-4">
                          <motion.button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 py-4 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Atrás</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={handleNextStep}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>Continuar</span>
                            <ArrowRight className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 5: Preferred Times */}
                    {step === 5 && (
                      <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-white mb-2">¿Cuándo prefieres jugar?</h3>
                          <p className="text-gray-400 text-sm">Paso 5 de 6 - Selecciona tus horarios preferidos</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: '83.33%' }}></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.map((time) => (
                            <motion.button
                              key={time}
                              type="button"
                              onClick={() => toggleTimeSlot(time)}
                              className={`p-3 rounded-lg border transition-all duration-300 text-sm ${
                                registerData.preferredTimes.includes(time)
                                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 border-transparent text-white shadow-lg'
                                  : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-gray-500'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {time}
                            </motion.button>
                          ))}
                        </div>

                        <div className="flex space-x-4">
                          <motion.button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 py-4 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Atrás</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={handleNextStep}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>Continuar</span>
                            <ArrowRight className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 6: Final Info */}
                    {step === 6 && (
                      <motion.div
                        key="step6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-white mb-2">Información adicional</h3>
                          <p className="text-gray-400 text-sm">Paso 6 de 6 - ¡Casi terminamos!</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de nacimiento</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="date"
                              value={registerData.birthDate}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, birthDate: e.target.value }))}
                              className="w-full pl-10 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Cuéntanos sobre ti</label>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                              value={registerData.bio}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, bio: e.target.value }))}
                              className="w-full pl-10 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 backdrop-blur-sm resize-none"
                              placeholder="¿Qué te gusta de los deportes? ¿Cuáles son tus objetivos?"
                              rows={4}
                            />
                          </div>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
                          >
                            {error}
                          </motion.div>
                        )}

                        <div className="flex space-x-4">
                          <motion.button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 py-4 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Atrás</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={handleRegister}
                            disabled={isLoading}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                {loadingProgress < 100 && (
                                  <div className="w-20 bg-white/20 rounded-full h-1 mr-2">
                                    <div 
                                      className="bg-white h-1 rounded-full transition-all duration-300" 
                                      style={{ width: `${loadingProgress}%` }}
                                    ></div>
                                  </div>
                                )}
                                Creando cuenta...
                              </>
                            ) : (
                              <>
                                <Check className="w-5 h-5 mr-2" />
                                Crear Cuenta
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImmersiveAuthScreen;
