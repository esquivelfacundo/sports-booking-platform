'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import { 
  DollarSign,
  Calendar,
  Users,
  Clock,
  Target,
  Download,
  RefreshCw,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Percent,
  CreditCard,
  TrendingUp
} from 'lucide-react';

interface AnalyticsResponse {
  success: boolean;
  period: {
    start: string;
    end: string;
    label: string;
  };
  summary: {
    revenue: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'stable' };
    reservations: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'stable' };
    customers: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'stable' };
    occupancy: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'stable' };
    averageBookingValue: { current: number; previous: number };
    cancellationRate: number;
    deposits: { total: number; bookingsWithDeposit: number; percentage: number };
  };
  charts: {
    dailyRevenue: { date: string; revenue: number; reservations: number }[];
    courtUtilization: { courtId: string; court: string; utilization: number; revenue: number; reservations: number }[];
    peakHours: { hour: string; reservations: number; revenue: number }[];
    dayOfWeek: { name: string; count: number; revenue: number }[];
    bookingTypes: { type: string; count: number; revenue: number; percentage: number }[];
  };
}

interface TopCustomer {
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalRevenue: number;
  lastBooking: string;
}

const AnalyticsPage = () => {
  const { establishment, loading: establishmentLoading } = useEstablishment();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!establishment?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [analyticsRes, customersRes] = await Promise.all([
        apiClient.getEstablishmentAnalytics(establishment.id, dateRange),
        apiClient.getTopCustomers(establishment.id, dateRange, 5)
      ]);
      
      setAnalytics(analyticsRes);
      setTopCustomers(customersRes.topCustomers || []);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Error al cargar analytics');
    } finally {
      setLoading(false);
    }
  }, [establishment?.id, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-emerald-400" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-400" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-emerald-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const getBookingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      normal: 'Normal',
      profesor: 'Profesor',
      torneo: 'Torneo',
      escuela: 'Escuela',
      cumpleanos: 'Cumpleaños',
      abonado: 'Abonado'
    };
    return labels[type] || type;
  };

  if (establishmentLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
          <span className="text-white text-xl">Cargando analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, charts } = analytics;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Análisis y Métricas</h1>
          <p className="text-gray-400 mt-1">
            {analytics.period.start} - {analytics.period.end}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="appearance-none bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-8"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="1y">Último año</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          <button 
            onClick={fetchAnalytics}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.revenue.current)}</p>
              <div className="flex items-center space-x-1 mt-2">
                {getTrendIcon(summary.revenue.trend)}
                <span className={`text-sm font-medium ${getTrendColor(summary.revenue.trend)}`}>
                  {Math.abs(summary.revenue.change)}%
                </span>
                <span className="text-gray-400 text-sm">vs anterior</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Reservas</p>
              <p className="text-2xl font-bold text-white">{summary.reservations.current}</p>
              <div className="flex items-center space-x-1 mt-2">
                {getTrendIcon(summary.reservations.trend)}
                <span className={`text-sm font-medium ${getTrendColor(summary.reservations.trend)}`}>
                  {Math.abs(summary.reservations.change)}%
                </span>
                <span className="text-gray-400 text-sm">vs anterior</span>
              </div>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Clientes Únicos</p>
              <p className="text-2xl font-bold text-white">{summary.customers.current}</p>
              <div className="flex items-center space-x-1 mt-2">
                {getTrendIcon(summary.customers.trend)}
                <span className={`text-sm font-medium ${getTrendColor(summary.customers.trend)}`}>
                  {Math.abs(summary.customers.change)}%
                </span>
                <span className="text-gray-400 text-sm">vs anterior</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ocupación</p>
              <p className="text-2xl font-bold text-white">{summary.occupancy.current}%</p>
              <div className="flex items-center space-x-1 mt-2">
                {getTrendIcon(summary.occupancy.trend)}
                <span className={`text-sm font-medium ${getTrendColor(summary.occupancy.trend)}`}>
                  {Math.abs(summary.occupancy.change)}%
                </span>
                <span className="text-gray-400 text-sm">vs anterior</span>
              </div>
            </div>
            <Target className="h-8 w-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="text-gray-400 text-sm">Ticket Promedio</p>
              <p className="text-xl font-bold text-white">{formatCurrency(summary.averageBookingValue.current)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Percent className="h-6 w-6 text-red-400" />
            <div>
              <p className="text-gray-400 text-sm">Tasa de Cancelación</p>
              <p className="text-xl font-bold text-white">{summary.cancellationRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">Señas Cobradas</p>
              <p className="text-xl font-bold text-white">{formatCurrency(summary.deposits.total)}</p>
              <p className="text-xs text-gray-500">{summary.deposits.percentage}% de reservas con seña</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Ingresos Diarios</h3>
          {charts.dailyRevenue.length > 0 ? (
            <div>
              <div className="flex items-end justify-between space-x-1" style={{ height: '200px' }}>
                {charts.dailyRevenue.slice(-14).map((day, index) => {
                  const maxRevenue = Math.max(...charts.dailyRevenue.slice(-14).map(d => d.revenue));
                  const heightPx = maxRevenue > 0 ? Math.max(4, (day.revenue / maxRevenue) * 180) : 4;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: heightPx }}
                        transition={{ delay: index * 0.03, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t cursor-pointer hover:from-emerald-500 hover:to-emerald-300"
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {formatDate(day.date)}: {formatCurrency(day.revenue)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-400">
                {charts.dailyRevenue.slice(-14).filter((_, i) => i % 2 === 0).map((day, index) => (
                  <span key={index}>{formatDate(day.date)}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No hay datos para mostrar
            </div>
          )}
        </div>

        {/* Court Utilization */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Utilización por Cancha</h3>
          <div className="space-y-4">
            {charts.courtUtilization.map((court, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{court.court}</span>
                  <span className="text-gray-400">{court.utilization}% • {court.reservations} reservas</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${court.utilization}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(court.revenue)}</p>
              </div>
            ))}
            {charts.courtUtilization.length === 0 && (
              <p className="text-gray-400 text-center py-8">No hay datos de canchas</p>
            )}
          </div>
        </div>
      </div>

      {/* Peak Hours & Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Horarios Pico</h3>
          {charts.peakHours.length > 0 ? (
            <div>
              <div className="flex items-end justify-between space-x-1" style={{ height: '180px' }}>
                {(() => {
                  // Sort by hour for display, show all hours from 6 to 23
                  const allHours = [];
                  for (let i = 6; i <= 23; i++) {
                    const hourStr = `${i.toString().padStart(2, '0')}:00`;
                    const hourData = charts.peakHours.find(h => h.hour === hourStr);
                    allHours.push({
                      hour: hourStr,
                      reservations: hourData?.reservations || 0,
                      revenue: hourData?.revenue || 0
                    });
                  }
                  const maxReservations = Math.max(...allHours.map(h => h.reservations));
                  
                  return allHours.map((hour, index) => {
                    const heightPx = maxReservations > 0 ? Math.max(2, (hour.reservations / maxReservations) * 160) : 2;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: heightPx }}
                          transition={{ delay: index * 0.02, duration: 0.4 }}
                          className={`w-full rounded-t cursor-pointer ${
                            hour.reservations > 0 
                              ? 'bg-gradient-to-t from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-300'
                              : 'bg-gray-700'
                          }`}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {hour.hour}: {hour.reservations} reservas
                          {hour.revenue > 0 && <br />}
                          {hour.revenue > 0 && formatCurrency(hour.revenue)}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-400">
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              No hay datos
            </div>
          )}
        </div>

        {/* Day of Week */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Reservas por Día</h3>
          <div className="space-y-2">
            {charts.dayOfWeek.map((day, index) => {
              const maxCount = Math.max(...charts.dayOfWeek.map(d => d.count));
              const width = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-gray-400 w-24">{day.name}</span>
                  <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2"
                    >
                      {day.count > 0 && (
                        <span className="text-xs text-white font-medium">{day.count}</span>
                      )}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Types & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Types */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Tipos de Reserva</h3>
          <div className="space-y-3">
            {charts.bookingTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{getBookingTypeLabel(type.type)}</p>
                  <p className="text-sm text-gray-400">{type.count} reservas ({type.percentage.toFixed(1)}%)</p>
                </div>
                <p className="text-emerald-400 font-semibold">{formatCurrency(type.revenue)}</p>
              </div>
            ))}
            {charts.bookingTypes.length === 0 && (
              <p className="text-gray-400 text-center py-4">No hay datos</p>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Mejores Clientes</h3>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-400">{customer.totalBookings} reservas</p>
                  </div>
                </div>
                <p className="text-emerald-400 font-semibold">{formatCurrency(customer.totalRevenue)}</p>
              </div>
            ))}
            {topCustomers.length === 0 && (
              <p className="text-gray-400 text-center py-4">No hay datos de clientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
