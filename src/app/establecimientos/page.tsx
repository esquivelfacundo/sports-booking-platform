'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Building2, 
  BarChart3, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Settings, 
  Plus,
  Zap,
  Shield,
  Smartphone,
  TrendingUp,
  MessageSquare,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  CreditCard,
  Bell,
  FileText,
  Ticket,
  Gift,
  Printer,
  Wifi,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

const EstablishmentPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const mainFeatures = [
    {
      icon: Calendar,
      title: 'Gestión Inteligente de Reservas',
      description: 'Sistema completo de reservas online con calendario visual, confirmación automática y recordatorios por WhatsApp.',
      benefits: ['Reservas 24/7', 'Confirmación instantánea', 'Recordatorios automáticos'],
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: DollarSign,
      title: 'Control Financiero Total',
      description: 'Caja registradora digital, cuentas corrientes, facturación automática y reportes de ingresos en tiempo real.',
      benefits: ['Caja digital', 'Cuentas corrientes', 'Reportes detallados'],
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Base de Datos de Clientes',
      description: 'Gestión completa de clientes con historial de reservas, preferencias y sistema de fidelización.',
      benefits: ['Historial completo', 'Segmentación', 'Fidelización'],
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Estadísticas y Analytics',
      description: 'Métricas en tiempo real de ocupación, ingresos, horarios pico y rendimiento de cada cancha.',
      benefits: ['Dashboards en vivo', 'Análisis predictivo', 'Exportación de datos'],
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Ticket,
      title: 'Sistema de Cupones',
      description: 'Crea cupones de descuento personalizados para promociones, clientes VIP o campañas especiales.',
      benefits: ['Descuentos flexibles', 'Cupones individuales', 'Tracking de uso'],
      color: 'pink',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Star,
      title: 'Sistema de Reseñas',
      description: 'Recolecta valoraciones automáticas vía QR en tickets y mejora tu reputación online.',
      benefits: ['QR en tickets', 'NPS Score', 'Respuestas a clientes'],
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const allFeatures = [
    { icon: Smartphone, title: 'App Móvil', description: 'Gestiona desde cualquier lugar', color: 'blue' },
    { icon: Printer, title: 'Tickets Térmicos', description: 'Impresión con QR de valoración', color: 'purple' },
    { icon: CreditCard, title: 'Pagos Online', description: 'Mercado Pago integrado', color: 'green' },
    { icon: MessageSquare, title: 'WhatsApp Auto', description: 'Confirmaciones automáticas', color: 'emerald' },
    { icon: FileText, title: 'Facturación', description: 'Facturas automáticas', color: 'orange' },
    { icon: Shield, title: 'Seguridad', description: 'Datos encriptados', color: 'red' },
    { icon: Bell, title: 'Notificaciones', description: 'Alertas en tiempo real', color: 'yellow' },
    { icon: Wifi, title: 'Modo Offline', description: 'Sin conexión necesaria', color: 'cyan' },
    { icon: Target, title: 'Marketing', description: 'Campañas automatizadas', color: 'pink' },
    { icon: Gift, title: 'Promociones', description: 'Cupones y descuentos', color: 'indigo' },
    { icon: Clock, title: 'Horarios Flex', description: 'Precios por franja', color: 'teal' },
    { icon: Settings, title: 'Personalización', description: 'Adapta a tu negocio', color: 'slate' }
  ];

  const stats = [
    { label: 'Establecimientos', value: '500+', icon: Building2 },
    { label: 'Reservas/mes', value: '15K+', icon: Calendar },
    { label: 'Ahorro', value: '40%', icon: TrendingUp },
    { label: 'Satisfacción', value: '98%', icon: Star }
  ];

  const benefits = [
    {
      title: 'Ahorra Tiempo',
      description: 'Automatiza tareas repetitivas y dedica más tiempo a hacer crecer tu negocio',
      icon: Clock,
      stat: '10 horas/semana'
    },
    {
      title: 'Aumenta Ingresos',
      description: 'Optimiza la ocupación de tus canchas y reduce cancelaciones',
      icon: TrendingUp,
      stat: '+35% ingresos'
    },
    {
      title: 'Mejora Experiencia',
      description: 'Ofrece a tus clientes una experiencia digital moderna y profesional',
      icon: Sparkles,
      stat: '98% satisfacción'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">La plataforma más completa de Argentina</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Gestiona tu establecimiento
              <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                de forma inteligente
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Sistema completo de gestión para canchas deportivas. Reservas online, caja digital, 
              estadísticas en tiempo real y mucho más. <strong className="text-white">Todo en una sola plataforma.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/establecimientos/registro"
                className="group bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 flex items-center gap-2 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Comenzar Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/establecimientos/login"
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center gap-2"
              >
                Acceder al Panel
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Configuración en 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Soporte en español</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="relative -mt-16 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Mis Canchas?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más que un software, es tu socio estratégico para hacer crecer tu negocio
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{benefit.stat}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Funcionalidades que transforman tu negocio
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Todo lo que necesitas para gestionar tu establecimiento de forma profesional
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* All Features Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Y mucho más...
            </h2>
            <p className="text-xl text-gray-600">
              Todas las herramientas que necesitas en un solo lugar
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group bg-gray-50 rounded-xl p-6 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-cyan-50 transition-all duration-300 border border-gray-200 hover:border-emerald-200 hover:shadow-lg"
              >
                <feature.icon className={`w-8 h-8 text-${feature.color}-500 mb-3 group-hover:scale-110 transition-transform duration-300`} />
                <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white py-24">
        <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Comienza a transformar tu establecimiento hoy
            </h2>
            <p className="text-xl mb-10 text-emerald-100 max-w-2xl mx-auto">
              Únete a cientos de establecimientos que ya están creciendo con Mis Canchas. 
              Sin costos iniciales, sin permanencia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/establecimientos/registro"
                className="group bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                Comenzar Gratis Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/establecimientos/demo"
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                Ver Demo en Vivo
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-emerald-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Datos seguros y encriptados</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Activación inmediata</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-emerald-400" />
                <span className="text-white font-bold text-lg">Mis Canchas</span>
              </div>
              <p className="text-sm leading-relaxed">
                La plataforma más completa para gestionar establecimientos deportivos en Argentina.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/establecimientos" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/establecimientos/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/precios" className="hover:text-white transition-colors">Precios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><a href="mailto:soporte@miscanchas.com" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-white transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Mis Canchas. Todos los derechos reservados.</p>
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-400">🇦🇷 Hecho en Argentina</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EstablishmentPage;
