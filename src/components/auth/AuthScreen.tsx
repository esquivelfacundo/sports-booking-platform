'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProvinceSelect from '@/components/ProvinceSelect';

interface AuthScreenProps {
  defaultMode?: 'login' | 'register';
}

const AuthScreen: React.FC<AuthScreenProps> = ({ defaultMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration form data
  const [registerData, setRegisterData] = useState({
    // Step 1: Basic info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Contact & Location
    phone: '',
    location: '',
    
    // Step 3: Sports preferences
    sports: [] as string[],
    skillLevel: '',
    preferredTimes: [] as string[],
    
    // Step 4: Additional info
    birthDate: '',
    bio: ''
  });

  const availableSports = [
    { id: 'futbol5', name: 'Fútbol 5', icon: '⚽' },
    { id: 'futbol11', name: 'Fútbol 11', icon: '⚽' },
    { id: 'paddle', name: 'Pádel', icon: '🏓' },
    { id: 'tenis', name: 'Tenis', icon: '🎾' },
    { id: 'basquet', name: 'Básquet', icon: '🏀' },
    { id: 'voley', name: 'Vóley', icon: '🏐' },
    { id: 'hockey', name: 'Hockey', icon: '🏑' },
    { id: 'rugby', name: 'Rugby', icon: '🏉' }
  ];

  const skillLevels = [
    { id: 'beginner', name: 'Principiante', description: 'Recién empiezo' },
    { id: 'intermediate', name: 'Intermedio', description: 'Tengo experiencia' },
    { id: 'advanced', name: 'Avanzado', description: 'Nivel competitivo' },
    { id: 'professional', name: 'Profesional', description: 'Juego profesionalmente' }
  ];

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

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
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    setError('');
    
    if (step === 1) {
      // Validate basic info
      if (!registerData.name || !registerData.email || !registerData.password) {
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
    } else if (step === 2) {
      // Validate contact info
      if (!registerData.phone || !registerData.location) {
        setError('Por favor completa tu teléfono y ubicación');
        return;
      }
      // Here we would normally send WhatsApp verification
      setIsVerifying(true);
      return;
    } else if (step === 3) {
      // Validate sports preferences
      if (registerData.sports.length === 0) {
        setError('Selecciona al menos un deporte');
        return;
      }
      if (!registerData.skillLevel) {
        setError('Selecciona tu nivel de habilidad');
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleWhatsAppVerification = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mock WhatsApp verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (verificationCode === '123456') {
        setIsVerifying(false);
        setStep(3);
      } else {
        setError('Código de verificación incorrecto');
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
      const success = await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        location: registerData.location,
        sports: registerData.sports,
        skillLevel: registerData.skillLevel,
        preferredTimes: registerData.preferredTimes,
        birthDate: registerData.birthDate,
        bio: registerData.bio
      });

      if (!success) {
        setError('Error al crear la cuenta. Intenta nuevamente.');
      }
    } catch (error) {
      setError('Error al registrarse. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSport = (sportId: string) => {
    setRegisterData(prev => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter(s => s !== sportId)
        : [...prev.sports, sportId]
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating Sports Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {['⚽', '🏓', '🎾', '🏀', '🏐', '🏑'].map((icon, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl opacity-20"
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${10 + (index * 12)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + index,
              repeat: Infinity,
              delay: index * 2,
              ease: "easeInOut"
            }}
          >
            {icon}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden"
          >
          {/* Header */}
          <motion.div 
            className="p-8 border-b border-gray-700/50 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent relative z-10"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
            >
              SportBooking
            </motion.h1>
            <motion.p 
              className="text-gray-400 mt-3 text-lg relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Únete a la comunidad deportiva'}
            </motion.p>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {mode === 'login' ? (
              // Login Form
              <motion.form 
                onSubmit={handleLogin} 
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
                  <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>

                <div className="text-center">
                  <p className="text-gray-400">
                    ¿No tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Regístrate aquí
                    </button>
                  </p>
                </div>
              </motion.form>
            ) : (
              // Registration Form - Multi-step
              <div className="space-y-6">
                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNumber 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-600 text-gray-400'
                      }`}>
                        {stepNumber}
                      </div>
                      {stepNumber < 4 && (
                        <div className={`w-8 h-1 mx-2 ${
                          step > stepNumber ? 'bg-emerald-500' : 'bg-gray-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

{/* Step Content */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Información Básica</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre completo *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={registerData.name}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Contraseña *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={registerData.password}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirmar contraseña *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
                )}

                {step === 2 && !isVerifying && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Contacto y Ubicación</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Número de WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="+54 9 11 1234-5678"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Debe ser un número de WhatsApp válido para recibir notificaciones
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Provincia *
                      </label>
                      <ProvinceSelect
                        value={registerData.location}
                        onChange={(value) => setRegisterData(prev => ({ ...prev, location: value }))}
                        placeholder="Selecciona tu provincia"
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>
                )}

                {step === 2 && isVerifying && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Verificación por WhatsApp</h3>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-300 mb-4">
                        Enviamos un código de verificación a<br />
                        <span className="font-semibold text-emerald-400">{registerData.phone}</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Código de verificación
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="123456"
                        maxLength={6}
                      />
                    </div>

                    <button
                      onClick={handleWhatsAppVerification}
                      disabled={isLoading || verificationCode.length !== 6}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Verificando...
                        </>
                      ) : (
                        'Verificar Código'
                      )}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      Para pruebas, usa el código: <span className="font-mono text-emerald-400">123456</span>
                    </p>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Preferencias Deportivas</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        ¿Qué deportes practicas? *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {availableSports.map((sport) => (
                          <button
                            key={sport.id}
                            type="button"
                            onClick={() => toggleSport(sport.id)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              registerData.sports.includes(sport.id)
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                            }`}
                          >
                            <div className="text-2xl mb-1">{sport.icon}</div>
                            <div className="text-sm font-medium">{sport.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        ¿Cuál es tu nivel general? *
                      </label>
                      <div className="space-y-2">
                        {skillLevels.map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setRegisterData(prev => ({ ...prev, skillLevel: level.id }))}
                            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                              registerData.skillLevel === level.id
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                            }`}
                          >
                            <div className="font-medium">{level.name}</div>
                            <div className="text-sm opacity-75">{level.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        ¿Cuáles son tus horarios preferidos? (opcional)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => toggleTimeSlot(time)}
                            className={`p-2 rounded-lg text-sm transition-all ${
                              registerData.preferredTimes.includes(time)
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Información Adicional</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha de nacimiento (opcional)
                      </label>
                      <input
                        type="date"
                        value={registerData.birthDate}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cuéntanos sobre ti (opcional)
                      </label>
                      <textarea
                        value={registerData.bio}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                        placeholder="Describe tu experiencia deportiva, objetivos, o cualquier cosa que quieras compartir..."
                        rows={4}
                      />
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                      <h4 className="text-emerald-400 font-medium mb-2">¡Ya casi terminamos!</h4>
                      <p className="text-sm text-gray-300">
                        Estás a punto de crear tu cuenta deportiva. Podrás conectar con otros jugadores, 
                        reservar canchas y unirte a partidos que coincidan con tus preferencias.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                {!isVerifying && (
                  <div className="flex space-x-3">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>
                    )}
                    
                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        <span>Siguiente</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Creando cuenta...
                          </>
                        ) : (
                          'Crear Cuenta'
                        )}
                      </button>
                    )}
                  </div>
                )}

                <div className="text-center">
                  <p className="text-gray-400">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthScreen;
