'use client';

import { useState, useEffect } from 'react';
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
  Settings,
  Trophy,
  MapPin,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TutorialOverlay from '@/components/tutorial/TutorialOverlay';
import { useTutorial } from '@/hooks/useTutorial';
import { firstLoginTutorialSteps, dashboardTutorialSteps } from '@/constants/tutorialSteps';
import CourtModal from '@/components/dashboard/CourtModal';
import StaffModal from '@/components/dashboard/StaffModal';

const EstablishmentDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { establishment, loading } = useEstablishment();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const {
    tutorialState,
    startFirstLoginTutorial,
    completeTutorial,
    skipTutorial,
    shouldShowFirstLoginTutorial
  } = useTutorial();
  
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/establecimientos/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Start tutorial for first-time users
  useEffect(() => {
    if (!loading && establishment && shouldShowFirstLoginTutorial()) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        startFirstLoginTutorial();
      }, 1000);
    }
  }, [loading, establishment, shouldShowFirstLoginTutorial, startFirstLoginTutorial]);

  // Show loading screen while data is being fetched
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del establecimiento...</p>
        </div>
      </div>
    );
  }

  // Show message if establishment not found or not approved
  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Establecimiento no encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            No se pudo cargar la información de tu establecimiento. Por favor, verifica tu registro.
          </p>
          <Link
            href="/establecimientos/registro"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Ir a Registro
          </Link>
        </div>
      </div>
    );
  }

  // Show approval status message for non-approved establishments
  if (establishment.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Establecimiento en Revisión
          </h2>
          <p className="text-gray-600 mb-4">
            Tu establecimiento está siendo revisado por nuestro equipo. Te notificaremos cuando sea aprobado.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Estado:</strong> {establishment.status === 'pending' ? 'Pendiente de revisión' : 'Rechazado'}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Establecimiento:</strong> {establishment.name}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // Calculate real stats from establishment data
  const courtsCount = establishment.courts?.length || 0;
  const staffCount = establishment.staff?.length || 0;
  
  const stats = [
    {
      title: 'Canchas Disponibles',
      value: courtsCount.toString(),
      change: courtsCount > 0 ? '+100%' : '0%',
      trend: courtsCount > 0 ? 'up' : 'neutral',
      icon: MapPin,
      color: 'blue'
    },
    {
      title: 'Personal Registrado',
      value: staffCount.toString(),
      change: staffCount > 0 ? '+100%' : '0%',
      trend: staffCount > 0 ? 'up' : 'neutral',
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'Estado del Establecimiento',
      value: 'Aprobado',
      change: '+100%',
      trend: 'up',
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'Reservas Hoy',
      value: '0',
      change: '0%',
      trend: 'neutral',
      icon: Calendar,
      color: 'orange'
    }
  ];

  // Generate recent bookings based on real court data
  const recentBookings = establishment.courts?.slice(0, 3).map((court, index) => ({
    id: index + 1,
    court: `${court.name} - ${court.type}`,
    client: 'Sin reservas aún',
    time: 'Disponible',
    status: 'available',
    amount: court.pricePerHour ? `$${court.pricePerHour}/hora` : 'Precio no definido'
  })) || [];

  // Generate tasks based on establishment data
  const upcomingTasks = [
    ...(establishment.courts?.length > 0 ? [{
      id: 1,
      task: `Configurar precios para ${establishment.courts.length} cancha${establishment.courts.length > 1 ? 's' : ''}`,
      time: 'Pendiente',
      priority: 'high'
    }] : []),
    ...(establishment.staff?.length > 0 ? [{
      id: 2,
      task: `Gestionar ${establishment.staff.length} miembro${establishment.staff.length > 1 ? 's' : ''} del personal`,
      time: 'Pendiente',
      priority: 'medium'
    }] : []),
    {
      id: 3,
      task: 'Configurar horarios de apertura',
      time: 'Pendiente',
      priority: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8" data-tutorial="dashboard-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {establishment.name}
            </h1>
            <p className="text-gray-600">
              Bienvenido de vuelta, aquí tienes un resumen de tu establecimiento
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {establishment.address}, {establishment.city}
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Estado: Aprobado
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-4" data-tutorial="quick-actions">
            <Link
              href="/establecimientos/dashboard/torneos"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Trophy className="w-5 h-5" />
              <span>Gestionar Torneos</span>
            </Link>
            
            <div className="flex space-x-2">
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
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tutorial="stats-cards">
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
            data-tutorial="establishment-info"
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
                          : booking.status === 'available'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'confirmed' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : booking.status === 'available' ? (
                          <MapPin className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {booking.status === 'confirmed' ? 'Confirmada' : booking.status === 'available' ? 'Disponible' : 'Pendiente'}
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

        {/* Establishment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Courts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            data-tutorial="courts-section"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Canchas Registradas ({courtsCount})
            </h2>
            {establishment.courts && establishment.courts.length > 0 ? (
              <div className="space-y-3">
                {establishment.courts.map((court, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{court.name}</div>
                      <div className="text-sm text-gray-600">
                        {court.type} • {court.surface} • Capacidad: {court.capacity}
                      </div>
                      <div className="text-sm text-gray-500">
                        {court.openTime} - {court.closeTime}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${court.pricePerHour}/hora
                      </div>
                      <div className="text-xs text-gray-500">
                        {court.lighting ? '🔆 Iluminada' : '🌙 Sin luz'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay canchas registradas</p>
                <p className="text-sm">Agrega canchas para comenzar a recibir reservas</p>
              </div>
            )}
          </motion.div>

          {/* Staff Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            data-tutorial="staff-section"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-green-600" />
              Personal Registrado ({staffCount})
            </h2>
            {establishment.staff && establishment.staff.length > 0 ? (
              <div className="space-y-3">
                {establishment.staff.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {member.role}
                      </div>
                      <div className="text-xs text-gray-500">{member.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay personal registrado</p>
                <p className="text-sm">Agrega miembros del equipo para gestionar el establecimiento</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
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
            <button 
              onClick={() => {
                console.log('Court button clicked');
                setShowAddCourtModal(true);
              }}
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <MapPin className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Nueva Cancha</span>
            </button>
            <button 
              onClick={() => {
                console.log('Staff button clicked');
                setShowAddStaffModal(true);
              }}
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Agregar Personal</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Settings className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Configuración</span>
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Tutorial Overlay */}
      <TutorialOverlay
        steps={shouldShowFirstLoginTutorial() ? firstLoginTutorialSteps : dashboardTutorialSteps}
        isActive={tutorialState.isActive}
        onComplete={() => completeTutorial('firstLogin')}
        onSkip={skipTutorial}
      />
      
      {/* Modals */}
      <CourtModal 
        isOpen={showAddCourtModal}
        onClose={() => {
          console.log('Closing court modal');
          setShowAddCourtModal(false);
        }}
        onSuccess={() => {
          console.log('Court modal success');
          setShowAddCourtModal(false);
          window.location.reload();
        }}
      />
      
      <StaffModal 
        isOpen={showAddStaffModal}
        onClose={() => {
          console.log('Closing staff modal');
          setShowAddStaffModal(false);
        }}
        onSuccess={() => {
          console.log('Staff modal success');
          setShowAddStaffModal(false);
          window.location.reload();
        }}
      />
    </div>
  );
};

export default EstablishmentDashboard;
