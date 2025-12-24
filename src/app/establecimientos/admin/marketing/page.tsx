'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useEstablishmentAdminContext } from '@/contexts/EstablishmentAdminContext';
import { 
  Megaphone, 
  Mail, 
  MessageSquare, 
  Lock,
  TrendingUp,
  Users,
  Target,
  Zap,
  Calendar,
  Gift,
  Bell,
  Send,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const UNLOCK_THRESHOLD = 200; // Reservas necesarias para desbloquear

const MarketingPage = () => {
  const { establishment, loading } = useEstablishment();
  const { stats } = useEstablishmentAdminContext();
  const [totalBookings, setTotalBookings] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  useEffect(() => {
    const fetchTotalBookings = async () => {
      if (!establishment?.id) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_URL}/api/bookings/establishment/${establishment.id}/count`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        const data = await response.json();
        if (data.success) {
          setTotalBookings(data.count || 0);
        }
      } catch (error) {
        // Use stats as fallback
        setTotalBookings(stats?.totalBookings || 0);
      }
    };

    fetchTotalBookings();
  }, [establishment?.id, stats?.totalBookings, API_URL]);

  const remainingBookings = Math.max(0, UNLOCK_THRESHOLD - totalBookings);
  const progress = Math.min(100, (totalBookings / UNLOCK_THRESHOLD) * 100);
  const isUnlocked = totalBookings >= UNLOCK_THRESHOLD;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'Difusión por WhatsApp',
      description: 'Envía mensajes masivos a tus clientes con promociones, recordatorios y novedades.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Mail,
      title: 'Campañas de Email',
      description: 'Crea newsletters profesionales y campañas de email marketing automatizadas.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Target,
      title: 'Segmentación Inteligente',
      description: 'Segmenta tu audiencia por frecuencia de reservas, deportes favoritos y más.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Calendar,
      title: 'Campañas Programadas',
      description: 'Programa tus campañas para fechas especiales y horarios óptimos.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: TrendingUp,
      title: 'Análisis de Resultados',
      description: 'Métricas detalladas de apertura, clicks y conversiones de cada campaña.',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      icon: Zap,
      title: 'Automatizaciones',
      description: 'Mensajes automáticos de bienvenida, cumpleaños y recuperación de clientes.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-8 md:p-12"
      >
        <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Megaphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Marketing & Difusión</h1>
              <p className="text-emerald-100">Potencia tu negocio con herramientas de marketing profesionales</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Unlock Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-8 border ${
          isUnlocked 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-gray-800 border-gray-700'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            isUnlocked ? 'bg-emerald-500/20' : 'bg-gray-700'
          }`}>
            {isUnlocked ? (
              <Sparkles className="w-10 h-10 text-emerald-400" />
            ) : (
              <Lock className="w-10 h-10 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            {isUnlocked ? (
              <>
                <h2 className="text-2xl font-bold text-emerald-400 mb-2">
                  ¡Funcionalidad Desbloqueada!
                </h2>
                <p className="text-gray-300">
                  Has alcanzado las {UNLOCK_THRESHOLD} reservas. Pronto habilitaremos las herramientas de marketing para tu establecimiento.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-white">
                    Te faltan <span className="text-emerald-400">{remainingBookings}</span> reservas
                  </h2>
                </div>
                <p className="text-gray-400 mb-4">
                  Alcanza las {UNLOCK_THRESHOLD} reservas por la plataforma para desbloquear nuestras herramientas de marketing profesionales.
                </p>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progreso actual</span>
                    <span className="text-emerald-400 font-medium">{totalBookings} / {UNLOCK_THRESHOLD} reservas</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-3 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {progress.toFixed(0)}% completado
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          ¿Qué podrás hacer con Marketing?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${
                !isUnlocked ? 'opacity-75' : ''
              }`}
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Beneficios de nuestro sistema de Marketing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Aumenta la recurrencia de tus clientes hasta un 40%',
            'Recupera clientes inactivos con campañas automatizadas',
            'Promociona horarios de baja demanda con ofertas especiales',
            'Fideliza a tus mejores clientes con beneficios exclusivos',
            'Comunica novedades y eventos de forma masiva',
            'Mide el ROI de cada campaña con métricas detalladas'
          ].map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      {!isUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            ¿Quieres acelerar el desbloqueo? Comparte tu página de reservas con más jugadores.
          </p>
          <a 
            href={`/reservar/${establishment?.slug || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Ver mi página de reservas
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      )}
    </div>
  );
};

export default MarketingPage;
