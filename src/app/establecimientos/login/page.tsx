'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Building2, 
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const EstablishmentLoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Mock credentials for demo
  const mockCredentials = {
    email: 'admin@clubcentral.com',
    password: 'admin123'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (formData.email === mockCredentials.email && formData.password === mockCredentials.password) {
        setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
        
        // Simulate storing auth token
        localStorage.setItem('establishment_auth', 'true');
        localStorage.setItem('establishment_data', JSON.stringify({
          id: '1',
          name: 'Club Deportivo Central',
          email: formData.email,
          role: 'admin'
        }));

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/establecimientos/admin');
        }, 1500);
      } else {
        setError('Credenciales incorrectas. Intenta nuevamente.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const fillDemoCredentials = () => {
    setFormData(mockCredentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Portal de Establecimientos</h1>
          <p className="text-gray-400">Accede a tu panel de administración</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 p-3 bg-red-900/50 border border-red-700 rounded-lg"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 p-3 bg-emerald-900/50 border border-emerald-700 rounded-lg"
              >
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-300 text-sm">{success}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">Credenciales de demostración:</p>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="inline-flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Usar credenciales de prueba</span>
              </button>
              <div className="mt-2 text-xs text-gray-500">
                <p>Email: admin@clubcentral.com</p>
                <p>Contraseña: admin123</p>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <a href="#" className="block text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
            <p className="text-gray-500 text-xs">
              ¿No tienes cuenta?{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Contacta con soporte
              </a>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          <p>© 2025 Mis Canchas. Todos los derechos reservados.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default EstablishmentLoginPage;
