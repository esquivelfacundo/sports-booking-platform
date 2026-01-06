'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Calendar,
  DollarSign,
  TrendingUp,
  XCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { superAdminApi, EstablishmentData } from '@/services/superAdminApi';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

export default function ControlDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [establishments, setEstablishments] = useState<EstablishmentData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [platformStats, setPlatformStats] = useState<{
    establishments: { total: number; approved: number; pending: number; rejected: number };
    users: { total: number; active: number; players: number; establishments: number };
    bookings: { total: number; confirmed: number; completed: number; cancelled: number };
    payments: { total: number; completed: number; totalRevenue: number };
    courts: { total: number };
    reviews: { total: number };
  } | null>(null);
  const [platformConfig, setPlatformConfig] = useState({ defaultFeePercent: 10 });

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [establishmentsData, statsData] = await Promise.all([
        superAdminApi.getAllEstablishments(),
        superAdminApi.getPlatformStats()
      ]);
      setEstablishments(establishmentsData);
      if (statsData) setPlatformStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEstablishment = async (id: string) => {
    const success = await superAdminApi.approveEstablishment(id);
    if (success) {
      setEstablishments(prev => prev.map(e => 
        e.id === id ? { ...e, registrationStatus: 'approved' } : e
      ));
    }
  };

  const handleRejectEstablishment = async (id: string) => {
    const success = await superAdminApi.rejectEstablishment(id);
    if (success) {
      setEstablishments(prev => prev.map(e => 
        e.id === id ? { ...e, registrationStatus: 'rejected' } : e
      ));
    }
  };

  const stats = {
    totalEstablishments: platformStats?.establishments?.total || establishments.length,
    approvedEstablishments: platformStats?.establishments?.approved || establishments.filter(e => e.registrationStatus === 'approved').length,
    pendingEstablishments: platformStats?.establishments?.pending || establishments.filter(e => e.registrationStatus === 'pending').length,
    totalUsers: platformStats?.users?.total || 0,
    activeUsers: platformStats?.users?.active || 0,
    totalReservations: platformStats?.bookings?.total || 0,
    confirmedBookings: platformStats?.bookings?.confirmed || 0,
    completedBookings: platformStats?.bookings?.completed || 0,
    cancelledBookings: platformStats?.bookings?.cancelled || 0,
    totalRevenue: platformStats?.payments?.totalRevenue || 0,
    totalCourts: platformStats?.courts?.total || 0,
    totalReviews: platformStats?.reviews?.total || 0
  };

  // Topbar content via portal
  const topbarContent = mounted && document.getElementById('header-page-controls') ? createPortal(
    <div className="flex items-center gap-4">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
    </div>,
    document.getElementById('header-page-controls')!
  ) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <UnifiedLoader size="lg" />
      </div>
    );
  }

  return (
    <>
      {topbarContent}
      <div className="p-6 space-y-6">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Establecimientos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEstablishments}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">{stats.approvedEstablishments} activos</span>
                  {stats.pendingEstablishments > 0 && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">{stats.pendingEstablishments} pendientes</span>
                  )}
                </div>
              </div>
              <Building2 className="w-8 h-8 text-emerald-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">{stats.activeUsers} activos</p>
              </div>
              <Users className="w-8 h-8 text-cyan-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reservas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReservations}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">{stats.completedBookings} completadas</span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">{stats.confirmedBookings} confirmadas</span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Facturación Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue.toLocaleString('es-AR')}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Ingresos de establecimientos</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourts}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Canchas registradas</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReviews}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reseñas totales</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cancelledBookings}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reservas canceladas</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Platform Commission Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-500/10 dark:to-cyan-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comisión de Plataforma</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Comisión por defecto: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{platformConfig.defaultFeePercent}%</span>
                {' '}sobre cada reserva
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${Math.round(stats.totalRevenue * (platformConfig.defaultFeePercent / 100)).toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Comisiones estimadas</p>
            </div>
          </div>
        </motion.div>

        {/* Pending Approvals */}
        {stats.pendingEstablishments > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Establecimientos Pendientes de Aprobación</h3>
            </div>
            <div className="space-y-3">
              {establishments.filter(e => e.registrationStatus === 'pending').map((est) => (
                <div key={est.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{est.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{est.city} • {est.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveEstablishment(est.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleRejectEstablishment(est.id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Establishments */}
        {establishments.filter(e => e.registrationStatus === 'approved').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Establecimientos por Facturación</h3>
            <div className="space-y-3">
              {establishments
                .filter(e => e.registrationStatus === 'approved')
                .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                .slice(0, 5)
                .map((est, index) => (
                  <div key={est.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{est.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{est.city} • {est.totalBookings || 0} reservas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">${(est.totalRevenue || 0).toLocaleString('es-AR')}</p>
                      <p className="text-xs text-gray-500">{est.courtsCount || 0} canchas</p>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
