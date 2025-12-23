'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Slider images
const SLIDER_IMAGES = [
  '/assets/slider-login/1.jpg',
  '/assets/slider-login/2.jpg',
  '/assets/slider-login/3.jpg',
  '/assets/slider-login/4.jpg',
  '/assets/slider-login/5.jpg',
  '/assets/slider-login/6.jpg',
  '/assets/slider-login/pexels-danielellis-11182335.jpg',
];

const EstablishmentLoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Image slider effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isStaff && user.staffRole === 'staff') {
        router.push('/establecimientos/admin/reservas');
      } else {
        router.push('/establecimientos/admin');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(formData);
      
      if (success) {
        setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
        
        const userData = localStorage.getItem('user_data');
        let redirectPath = '/establecimientos/admin';
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.isStaff && user.staffRole === 'staff') {
              redirectPath = '/establecimientos/admin/reservas';
            }
          } catch (e) {
            console.error('Error parsing user data', e);
          }
        }
        
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Background Slider - Full screen behind everything */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={SLIDER_IMAGES[currentImageIndex]}
              alt="Background"
              fill
              className="object-cover"
              priority
              quality={85}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>
        
        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 md:left-auto md:right-8 md:transform-none">
          {SLIDER_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Sidebar - Fixed width, always visible */}
      <div className="relative z-10 w-full md:w-[480px] lg:w-[520px] min-h-screen bg-gray-900/95 backdrop-blur-sm flex flex-col">
        {/* Logo and Header */}
        <div className="p-8 pt-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Image
              src="/assets/logo-3.png"
              alt="Mis Canchas"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Mis Canchas</h1>
              <p className="text-sm text-gray-400">Panel de Administración</p>
            </div>
          </motion.div>
        </div>

        {/* Login Form - Centered vertically */}
        <div className="flex-1 flex items-center px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Bienvenido</h2>
              <p className="text-gray-400">Ingresa tus credenciales para acceder</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="admin@tuestablecimiento.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                  >
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                  >
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-300 text-sm">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Support Link */}
            <p className="mt-8 text-center text-gray-500 text-sm">
              ¿No tienes cuenta?{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                Contacta con soporte
              </a>
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <p className="text-gray-600 text-sm">
            © 2025 Mis Canchas. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right side - Empty space for background image visibility */}
      <div className="hidden md:block flex-1" />
    </div>
  );
};

export default EstablishmentLoginPage;
