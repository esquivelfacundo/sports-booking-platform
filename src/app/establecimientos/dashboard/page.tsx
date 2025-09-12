'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Eye,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

const EstablishmentDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const stats = [
    {
      title: 'Reservas Hoy',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Ingresos del Mes',
      value: '$45,280',
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Ocupación Promedio',
      value: '78%',
      change: '+5%',
      trend: 'up',
      icon: BarChart3,
      color: 'purple'
    },
    {
      title: 'Clientes Activos',
      value: '342',
      change: '-2%',
      trend: 'down',
      icon: Users,
      color: 'orange'
    }
  ];

  const recentBookings = [
    {
      id: 1,
      court: 'Cancha 1 - Fútbol 5',
      client: 'Juan Pérez',
      time: '18:00 - 19:00',
      status: 'confirmed',
      amount: '$1,200'
    },
    {
      id: 2,
      court: 'Cancha 2 - Paddle',
      client: 'María García',
      time: '19:30 - 21:00',
      status: 'pending',
      amount: '$800'
    },
    {
      id: 3,
      court: 'Cancha 3 - Tenis',
      client: 'Carlos López',
      time: '20:00 - 21:30',
      status: 'confirmed',
      amount: '$1,000'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      task: 'Mantenimiento Cancha 1',
      time: '09:00',
      priority: 'high'
    },
    {
      id: 2,
      task: 'Reunión con proveedor',
      time: '14:00',
      priority: 'medium'
    },
    {
      id: 3,
      task: 'Revisión inventario',
      time: '16:30',
      priority: 'low'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel de Control
            </h1>
            <p className="text-gray-600">
              Bienvenido de vuelta, aquí tienes un resumen de tu establecimiento
            </p>
          </motion.div>

          {/* Period Selector */}
          <div className="mt-6 flex space-x-2">
            {['day', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period === 'day' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.title}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Reservas Recientes
                </h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver todas
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{booking.court}</div>
                      <div className="text-sm text-gray-600">{booking.client}</div>
                      <div className="text-sm text-gray-500">{booking.time}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">{booking.amount}</span>
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'confirmed' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Tareas Pendientes
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' 
                        ? 'bg-red-500' 
                        : task.priority === 'medium' 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{task.task}</div>
                      <div className="text-sm text-gray-500">{task.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todas las tareas
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Nueva Reserva</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Ver Reportes</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Gestionar Personal</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Settings className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Configuración</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EstablishmentDashboard;
