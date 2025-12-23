'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useEstablishmentAdminContext } from '@/contexts/EstablishmentAdminContext';
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
  Plus,
  Building2,
  Award,
  RefreshCw
} from 'lucide-react';

interface UserData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  userType?: string;
  isStaff?: boolean;
}

const AdminDashboard = () => {
  const searchParams = useSearchParams();
  const { establishment, loading: establishmentLoading } = useEstablishment();
  const { 
    establishmentId,
    reservations, 
    courts, 
    stats: adminStats, 
    notifications,
    loading: adminLoading,
    statsLoading,
    loadReservations,
    refreshAll 
  } = useEstablishmentAdminContext();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [userName, setUserName] = useState<string>('');

  const loading = establishmentLoading || adminLoading || statsLoading;

  // Load today's reservations when establishment is available
  useEffect(() => {
    if (establishmentId) {
      const today = new Date().toISOString().split('T')[0];
      loadReservations({ date: today, limit: 100 });
    }
  }, [establishmentId, loadReservations]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load user name from localStorage (only first name for greeting)
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user: UserData = JSON.parse(userData);
        // Get only the first name for the greeting
        let firstName = '';
        if (user.name) {
          // Staff users have 'name' - get first part
          firstName = user.name.split(' ')[0];
        } else if (user.firstName) {
          firstName = user.firstName;
        } else if (user.email) {
          firstName = user.email.split('@')[0];
        } else {
          firstName = 'Usuario';
        }
        setUserName(firstName);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  useEffect(() => {
    // Check if user just completed registration
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      const registrationSuccess = localStorage.getItem('registrationSuccess');
      if (registrationSuccess) {
        const data = JSON.parse(registrationSuccess);
        setRegistrationData(data);
        setShowRegistrationSuccess(true);
        // Clear the registration data after showing
        localStorage.removeItem('registrationSuccess');
      }
    }
  }, [searchParams]);

  // Generate stats from real API data
  const stats = [
    {
      name: 'Ingresos Hoy',
      value: `$${adminStats.todayRevenue.toLocaleString()}`,
      change: '+0%',
      trend: adminStats.todayRevenue > 0 ? 'up' : 'neutral',
      icon: DollarSign,
      color: 'green'
    },
    {
      name: 'Reservas Hoy',
      value: adminStats.todayBookings.toString(),
      change: `${adminStats.pendingBookings} pendientes`,
      trend: adminStats.todayBookings > 0 ? 'up' : 'neutral',
      icon: Calendar,
      color: 'blue'
    },
    {
      name: 'Clientes Totales',
      value: adminStats.totalClients.toString(),
      change: '+0%',
      trend: 'neutral',
      icon: Users,
      color: 'purple'
    },
    {
      name: 'Ingresos Mes',
      value: `$${adminStats.monthlyRevenue.toLocaleString()}`,
      change: `${adminStats.confirmedBookings} confirmadas`,
      trend: adminStats.monthlyRevenue > 0 ? 'up' : 'neutral',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  // Get upcoming reservations for today (next 5 from current time)
  const today = new Date().toISOString().split('T')[0];
  const currentTimeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
  
  const upcomingReservations = reservations
    .filter(r => r.date === today && r.time >= currentTimeStr)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      time: r.time,
      court: r.court,
      client: r.clientName,
      sport: r.court,
      status: r.status,
      duration: `${r.duration} min`,
      price: r.price
    }));

  // Get alerts from notifications
  const alerts = notifications.slice(0, 5).map(n => ({
    id: n.id,
    type: n.type === 'booking_confirmed' ? 'success' : 
          n.type === 'payment_failed' ? 'warning' : 'info',
    message: n.message,
    time: n.time
  }));

  // Generate court status from real data
  const courtStatus = courts.length > 0 
    ? courts.map((court) => {
        // Check if court has a current booking
        const now = new Date();
        const currentHour = `${now.getHours().toString().padStart(2, '0')}:00`;
        const currentBooking = reservations.find(
          r => r.courtId === court.id && 
               r.date === today && 
               r.time <= currentHour && 
               r.status === 'confirmed'
        );
        
        const sportNames: Record<string, string> = {
          'futbol5': 'Fútbol 5',
          'futbol': 'Fútbol 5',
          'paddle': 'Paddle',
          'tenis': 'Tenis',
          'basquet': 'Básquet',
          'voley': 'Vóley',
          'futbol11': 'Fútbol 11'
        };
        
        return {
          name: court.name,
          status: currentBooking ? 'occupied' : (court.isActive ? 'available' : 'maintenance'),
          sport: sportNames[court.sport] || court.sport,
          until: currentBooking ? currentBooking.endTime : null
        };
      })
    : [{ name: 'Sin canchas registradas', status: 'available', sport: 'N/A', until: null }];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando datos del establecimiento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Registration Success Banner */}
        {showRegistrationSuccess && registrationData && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl p-6 text-white"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">¡Registro Exitoso!</h2>
                <p className="text-white/90 mb-4">
                  Tu establecimiento "{registrationData.establishment?.name}" ha sido registrado correctamente.
                </p>
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Estado del Registro
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="bg-yellow-500 w-3 h-3 rounded-full"></div>
                    <span className="capitalize">{registrationData.status?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-white/80 mt-2">
                    Tu establecimiento está en proceso de revisión. Recibirás una notificación por email una vez aprobado.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowRegistrationSuccess(false)}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    Entendido
                  </button>
                  <div className="flex items-center text-sm text-white/80">
                    <Award className="w-4 h-4 mr-1" />
                    Tiempo estimado de aprobación: 24-48 horas
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden"
        >
          {/* Main container with gradient background like Caja Activa */}
          <div className="bg-gradient-to-r from-emerald-900/50 to-gray-800 rounded-xl border border-emerald-700/50 p-6">
            <div className="flex items-center justify-between">
              {/* Left: Welcome message */}
              <div className="flex items-center space-x-4">
                {/* Decorative icon */}
                <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/20">
                  <Building2 className="w-7 h-7 text-emerald-400" />
                </div>
                
                <div>
                  {/* Greeting with user name */}
                  <h1 className="text-xl sm:text-2xl text-white">
                    ¡{(() => {
                      const hour = currentTime.getHours();
                      if (hour >= 0 && hour < 12) return 'Buenos días';
                      if (hour >= 12 && hour < 19) return 'Buenas tardes';
                      return 'Buenas noches';
                    })()}, <span className="font-bold">{userName || 'Usuario'}</span>!
                  </h1>
                    
                  {/* Establishment name */}
                  <p className="text-gray-400 text-sm sm:text-base mt-0.5">
                    {establishment?.name || 'Panel de Control'}
                  </p>
                </div>
                </div>

              {/* Right: Action button */}
              <Link 
                href="/establecimientos/admin/reservas"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-emerald-500/25"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nueva Reserva</span>
              </Link>
            </div>
          </div>
        </motion.div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Today's Reservations */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Próximas Reservas</h2>
            <Link href="/establecimientos/admin/reservas" className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Ver todas</span>
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-emerald-400 font-bold">{reservation.time}</div>
                      <span className="text-gray-400">${reservation.price || 0}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{reservation.client}</div>
                      <div className="text-gray-400 text-sm">{reservation.court} • {reservation.sport}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-white font-bold">${(reservation.price || 0).toLocaleString()}</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reservation.status === 'confirmed' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No hay más reservas para hoy</p>
                <p className="text-gray-500 text-sm mt-2">
                  Las próximas reservas aparecerán aquí automáticamente
                </p>
              </div>
            )}
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
    </div>
  );
};

export default AdminDashboard;
