'use client';

import { motion } from 'framer-motion';
import { Building2, BarChart3, Calendar, Users, DollarSign, Clock, Settings, Plus } from 'lucide-react';
import Link from 'next/link';

const EstablishmentPage = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Gestión de Reservas',
      description: 'Control completo de todas las reservas, horarios y disponibilidad de tus canchas.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Análisis y Reportes',
      description: 'Estadísticas detalladas de ocupación, ingresos y rendimiento de tu establecimiento.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: DollarSign,
      title: 'Control Contable',
      description: 'Registro completo de ingresos, gastos y facturación automatizada.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Gestión de Personal',
      description: 'Control de empleados, horarios trabajados y seguimiento de tareas.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Clock,
      title: 'Horarios Flexibles',
      description: 'Configuración personalizada de horarios y precios por franja horaria.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Settings,
      title: 'Configuración Avanzada',
      description: 'Personalización completa de tu establecimiento y servicios adicionales.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const stats = [
    { label: 'Establecimientos registrados', value: '500+' },
    { label: 'Reservas gestionadas mensualmente', value: '15,000+' },
    { label: 'Ahorro promedio en gestión', value: '40%' },
    { label: 'Satisfacción del cliente', value: '98%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-green-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Building2 className="w-10 h-10" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sistema de Gestión para
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Establecimientos Deportivos
              </span>
            </h1>
            
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              La plataforma más completa para administrar tu establecimiento deportivo. 
              Control total de reservas, finanzas, personal y mucho más.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/establecimientos/demo"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Solicitar Demo Gratuita
              </Link>
              <Link
                href="/establecimientos/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200"
              >
                Acceder al Panel
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitás para gestionar tu establecimiento
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Una solución integral que te permite controlar todos los aspectos de tu negocio deportivo
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para transformar tu establecimiento?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a cientos de establecimientos que ya confían en nuestra plataforma
            </p>
            <Link
              href="/establecimientos/registro"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
            >
              <Building2 className="w-5 h-5" />
              Comenzar Ahora - Es Gratis
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentPage;
