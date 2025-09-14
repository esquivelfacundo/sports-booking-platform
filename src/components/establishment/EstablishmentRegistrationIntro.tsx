'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Shield, 
  Smartphone, 
  BarChart3,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe,
  Target
} from 'lucide-react';

interface EstablishmentRegistrationIntroProps {
  onContinue: () => void;
}

const EstablishmentRegistrationIntro: React.FC<EstablishmentRegistrationIntroProps> = ({
  onContinue
}) => {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const benefits = [
    {
      icon: TrendingUp,
      title: "Aumenta tus Ingresos",
      description: "Incrementa tu facturación hasta un 40% con mayor visibilidad y ocupación",
      color: "emerald"
    },
    {
      icon: Users,
      title: "Más Clientes",
      description: "Accede a miles de jugadores activos buscando canchas en tu zona",
      color: "blue"
    },
    {
      icon: Calendar,
      title: "Gestión Automática",
      description: "Sistema de reservas 24/7 que funciona mientras duermes",
      color: "purple"
    },
    {
      icon: CreditCard,
      title: "Pagos Seguros",
      description: "Cobros garantizados con procesamiento automático de pagos",
      color: "cyan"
    }
  ];

  const features = [
    { icon: Smartphone, text: "App móvil para gestión" },
    { icon: BarChart3, text: "Analytics y reportes" },
    { icon: Shield, text: "Pagos 100% seguros" },
    { icon: Clock, text: "Soporte 24/7" },
    { icon: Star, text: "Sistema de calificaciones" },
    { icon: Globe, text: "Presencia online" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [benefits.length]);

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(() => {
      onContinue();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden"
        >
          {/* Background Animation */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>

          <div className="relative z-10 min-h-screen flex flex-col">
            {/* Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center pt-16 pb-8"
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Building2 className="w-12 h-12 text-emerald-400" />
                </motion.div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Únete a la Plataforma
                </h1>
              </div>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Transforma tu establecimiento deportivo en un negocio digital exitoso
              </p>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Side - Benefits Carousel */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-8"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentBenefit}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.5 }}
                      className="text-center lg:text-left"
                    >
                      <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${
                          benefits[currentBenefit].color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                          benefits[currentBenefit].color === 'blue' ? 'from-blue-500 to-blue-600' :
                          benefits[currentBenefit].color === 'purple' ? 'from-purple-500 to-purple-600' :
                          'from-cyan-500 to-cyan-600'
                        } shadow-lg`}>
                          {React.createElement(benefits[currentBenefit].icon, { className: "w-8 h-8 text-white" })}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white">
                            {benefits[currentBenefit].title}
                          </h2>
                        </div>
                      </div>
                      <p className="text-xl text-gray-300 leading-relaxed">
                        {benefits[currentBenefit].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Benefit Indicators */}
                  <div className="flex justify-center lg:justify-start space-x-3">
                    {benefits.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentBenefit ? 'bg-emerald-400 scale-125' : 'bg-gray-600'
                        }`}
                        whileHover={{ scale: 1.2 }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Right Side - Features Grid */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold text-white text-center lg:text-left mb-8">
                    Todo lo que necesitas incluido
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="flex items-center space-x-3 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300"
                      >
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          {React.createElement(feature.icon, { className: "w-5 h-5 text-emerald-400" })}
                        </div>
                        <span className="text-gray-300 font-medium">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="py-12 px-4"
            >
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="space-y-2"
                  >
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      500+
                    </div>
                    <div className="text-gray-300">Establecimientos activos</div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="space-y-2"
                  >
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      10K+
                    </div>
                    <div className="text-gray-300">Reservas mensuales</div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="space-y-2"
                  >
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      4.8★
                    </div>
                    <div className="text-gray-300">Calificación promedio</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-center pb-16 px-4"
            >
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">
                  ¿Listo para hacer crecer tu negocio?
                </h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  Únete a cientos de establecimientos que ya están aumentando sus ingresos
                </p>
                
                <motion.button
                  onClick={handleContinue}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300"
                >
                  <Zap className="w-6 h-6 group-hover:animate-pulse" />
                  <span>Comenzar Registro</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
                </motion.button>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Registro gratuito • Sin comisiones el primer mes</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EstablishmentRegistrationIntro;
