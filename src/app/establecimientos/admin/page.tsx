'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Activity,
  Eye,
  Plus
} from 'lucide-react';

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      name: 'Ingresos Hoy',
      value: '$45,250',
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      color: 'emerald'
    },
    {
      name: 'Reservas Hoy',
      value: '28',
      change: '+8%',
      trend: 'up',
      icon: Calendar,
      color: 'blue'
    },
    {
      name: 'Ocupación Actual',
      value: '75%',
      change: '+5%',
      trend: 'up',
      icon: Activity,
      color: 'purple'
    },
    {
      name: 'Clientes Activos',
      value: '342',
      change: '-2%',
      trend: 'down',
      icon: Users,
      color: 'orange'
    }
  ];

  const todayReservations = [
    {
      id: 1,
      time: '09:00',
      court: 'Cancha 1',
      sport: 'Fútbol 5',
      client: 'Juan Pérez',
      duration: '2h',
      status: 'confirmed',
      price: 5000
    },
    {
      id: 2,
      time: '11:00',
      court: 'Cancha 2',
      sport: 'Paddle',
      client: 'María García',
      duration: '1.5h',
      status: 'pending',
      price: 3500
    },
    {
      id: 3,
      time: '14:00',
      court: 'Cancha 1',
      sport: 'Fútbol 5',
      client: 'Carlos López',
      duration: '2h',
      status: 'confirmed',
      price: 5000
    },
    {
      id: 4,
      time: '16:30',
      court: 'Cancha 3',
      sport: 'Tenis',
      client: 'Ana Martín',
      duration: '1h',
      status: 'confirmed',
      price: 2500
    },
    {
      id: 5,
      time: '19:00',
      court: 'Cancha 2',
      sport: 'Paddle',
      client: 'Roberto Silva',
      duration: '1.5h',
      status: 'pending',
      price: 3500
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Cancha 3 necesita mantenimiento de césped',
      time: '2 horas'
    },
    {
      id: 2,
      type: 'info',
      message: 'Nueva reserva pendiente de confirmación',
      time: '30 min'
    },
    {
      id: 3,
      type: 'success',
      message: 'Pago de $15,000 procesado correctamente',
      time: '1 hora'
    }
  ];

  const courtStatus = [
    { name: 'Cancha 1', status: 'occupied', sport: 'Fútbol 5', until: '11:00' },
    { name: 'Cancha 2', status: 'available', sport: 'Paddle', until: null },
    { name: 'Cancha 3', status: 'maintenance', sport: 'Tenis', until: '15:00' },
    { name: 'Cancha 4', status: 'occupied', sport: 'Básquet', until: '12:30' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-500';
      case 'available': return 'bg-emerald-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied': return 'Ocupada';
      case 'available': return 'Disponible';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            {currentTime.toLocaleDateString('es-AR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} - {currentTime.toLocaleTimeString('es-AR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        <button 
          onClick={() => {
            // Store action in localStorage for cross-page communication
            localStorage.setItem('dashboardAction', JSON.stringify({
              action: 'create',
              timestamp: Date.now()
            }));
            // Navigate to reservations page
            window.location.href = '/establecimientos/admin/reservas';
          }}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Reserva</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
              <span className="text-gray-400 text-sm ml-1">vs ayer</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Reservations */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Reservas de Hoy</h2>
            <button className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Ver todas</span>
            </button>
          </div>
          <div className="space-y-4">
            {todayReservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-emerald-400 font-bold">{reservation.time}</div>
                    <div className="text-gray-400 text-xs">{reservation.duration}</div>
                  </div>
                  <div>
                    <div className="text-white font-medium">{reservation.client}</div>
                    <div className="text-gray-400 text-sm">{reservation.court} • {reservation.sport}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-white font-bold">${reservation.price.toLocaleString()}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'confirmed' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Court Status & Alerts */}
        <div className="space-y-6">
          {/* Court Status */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Estado de Canchas</h2>
            <div className="space-y-3">
              {courtStatus.map((court, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(court.status)}`}></div>
                    <div>
                      <div className="text-white font-medium">{court.name}</div>
                      <div className="text-gray-400 text-sm">{court.sport}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-300 text-sm">{getStatusText(court.status)}</div>
                    {court.until && (
                      <div className="text-gray-400 text-xs">hasta {court.until}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Alertas</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                  {alert.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />}
                  {alert.type === 'info' && <Clock className="w-5 h-5 text-blue-400 mt-0.5" />}
                  {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{alert.message}</p>
                    <p className="text-gray-400 text-xs mt-1">hace {alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
