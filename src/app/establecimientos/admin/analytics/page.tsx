'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useEstablishmentAdmin } from '@/hooks/useEstablishmentAdmin';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Clock,
  MapPin,
  Target,
  Activity,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Star,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  reservations: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  customers: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  occupancy: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  reservations: number;
}

interface CourtUtilization {
  court: string;
  utilization: number;
  revenue: number;
  reservations: number;
}

interface CustomerInsight {
  segment: string;
  count: number;
  revenue: number;
  percentage: number;
}

const AnalyticsPage = () => {
  const { establishment, loading: establishmentLoading } = useEstablishment();
  const { stats, reservations, courts, statsLoading, refreshAll } = useEstablishmentAdmin();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'reservations' | 'customers'>('revenue');

  const loading = establishmentLoading || statsLoading;

  // Calculate analytics from real API data
  const analyticsData: AnalyticsData = useMemo(() => {
    const totalRevenue = stats.monthlyRevenue;
    const totalReservations = stats.confirmedBookings + stats.pendingBookings + stats.cancelledBookings;
    const totalCustomers = stats.totalClients;
    
    // Calculate occupancy based on courts and reservations
    const totalCourts = courts.length;
    const occupancyRate = totalCourts > 0 ? Math.min(100, (totalReservations / (totalCourts * 30)) * 100) : 0;

    return {
      revenue: {
        current: totalRevenue,
        previous: 0, // TODO: Get previous period from API
        trend: totalRevenue > 0 ? 'up' : 'stable',
        percentage: 0
      },
      reservations: {
        current: totalReservations,
        previous: 0,
        trend: totalReservations > 0 ? 'up' : 'stable',
        percentage: 0
      },
      customers: {
        current: totalCustomers,
        previous: 0,
        trend: totalCustomers > 0 ? 'up' : 'stable',
        percentage: 0
      },
      occupancy: {
        current: Math.round(occupancyRate * 10) / 10,
        previous: 0,
        trend: occupancyRate > 0 ? 'up' : 'stable',
        percentage: 0
      }
    };
  }, [stats, reservations, courts]);

  // Generate revenue chart data from reservations
  const revenueChartData: RevenueData[] = useMemo(() => {
    if (reservations.length === 0) return [];
    
    // Group reservations by date
    const groupedByDate = reservations.reduce((acc, r) => {
      const date = r.date;
      if (!acc[date]) {
        acc[date] = { revenue: 0, reservations: 0 };
      }
      acc[date].revenue += r.price;
      acc[date].reservations += 1;
      return acc;
    }, {} as Record<string, { revenue: number; reservations: number }>);
    
    return Object.entries(groupedByDate)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  }, [reservations]);

  // Generate court utilization from real data
  const courtUtilizationData: CourtUtilization[] = useMemo(() => {
    return courts.map(court => {
      const courtReservations = reservations.filter(r => r.courtId === court.id);
      const revenue = courtReservations.reduce((sum, r) => sum + r.price, 0);
      const utilization = courtReservations.length > 0 ? Math.min(100, (courtReservations.length / 30) * 100) : 0;
      
      return {
        court: court.name,
        utilization: Math.round(utilization * 10) / 10,
        revenue,
        reservations: courtReservations.length
      };
    });
  }, [courts, reservations]);

  // Customer segments - calculated from reservations
  const customerSegments: CustomerInsight[] = useMemo(() => {
    if (reservations.length === 0) {
      return [
        { segment: 'Sin datos', count: 0, revenue: 0, percentage: 100 }
      ];
    }
    
    // For now, show basic segment
    const totalRevenue = reservations.reduce((sum, r) => sum + r.price, 0);
    return [
      { segment: 'Todos los clientes', count: stats.totalClients, revenue: totalRevenue, percentage: 100 }
    ];
  }, [reservations, stats.totalClients]);

  // Peak hours from reservations
  const peakHoursData: ChartData[] = useMemo(() => {
    const hourCounts: Record<string, number> = {};
    
    // Initialize all hours
    for (let i = 6; i <= 23; i++) {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      hourCounts[hour] = 0;
    }
    
    // Count reservations by hour
    reservations.forEach(r => {
      const hour = r.time?.substring(0, 5) || '00:00';
      if (hourCounts[hour] !== undefined) {
        hourCounts[hour]++;
      }
    });
    
    return Object.entries(hourCounts).map(([label, value]) => ({ label, value }));
  }, [reservations]);

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

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case '90d': return 'Últimos 90 días';
      case '1y': return 'Último año';
    }
  };

  // Simple bar chart component
  const BarChart = ({ data, height = 200 }: { data: ChartData[], height?: number }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="w-full overflow-hidden">
        <div className="flex items-end justify-between space-x-1 pb-8" style={{ height }}>
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1 min-w-0">
              <div className="w-full bg-gray-700 rounded-t relative overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / maxValue) * (height - 60)}px` }}
                  transition={{ delay: index * 0.05, duration: 0.8 }}
                  className="bg-gradient-to-t from-emerald-600 to-emerald-400 w-full"
                />
              </div>
              <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-center whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple line chart component
  const RevenueLineChart = ({ data }: { data: RevenueData[] }) => {
    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.revenue / maxRevenue) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
            fill="none"
            stroke="#10b981"
            strokeWidth="0.5"
            points={points}
          />
          <motion.polygon
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
            fill="url(#lineGradient)"
            points={`${points} 100,100 0,100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-between px-2 pb-2">
          {data.slice(0, 7).map((item, index) => (
            <div key={index} className="text-xs text-gray-400">
              {new Date(item.date).getDate()}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading || !analyticsData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Cargando analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Análisis y Métricas</h1>
          <p className="text-gray-400 mt-1">Insights detallados sobre el rendimiento de tu establecimiento</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Date Range Selector */}
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
          
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
          <button className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
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
              <p className="text-2xl font-bold text-white">{formatCurrency(analyticsData.revenue.current)}</p>
              <div className="flex items-center space-x-1 mt-2">
                {getTrendIcon(analyticsData.revenue.trend)}
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.revenue.trend)}`}>
                  {analyticsData.revenue.percentage}%
                </span>
                <span className="text-gray-400 text-sm">vs período anterior</span>
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
              <p className="text-2xl font-bold text-white">{analyticsData.reservations.current.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-2">
                {getTrendIcon(analyticsData.reservations.trend)}
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.reservations.trend)}`}>
                  {analyticsData.reservations.percentage}%
                </span>
                <span className="text-gray-400 text-sm">vs período anterior</span>
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
              <p className="text-2xl font-bold text-white">{analyticsData.customers.current}</p>
              <div className="flex items-center space-x-1 mt-2">
                {getTrendIcon(analyticsData.customers.trend)}
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.customers.trend)}`}>
                  {analyticsData.customers.percentage}%
                </span>
                <span className="text-gray-400 text-sm">vs período anterior</span>
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
              <p className="text-gray-400 text-sm">Ocupación Promedio</p>
              <p className="text-2xl font-bold text-white">{analyticsData.occupancy.current}%</p>
              <div className="flex items-center space-x-1 mt-2">
                {getTrendIcon(analyticsData.occupancy.trend)}
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.occupancy.trend)}`}>
                  {analyticsData.occupancy.percentage}%
                </span>
                <span className="text-gray-400 text-sm">vs período anterior</span>
              </div>
            </div>
            <Target className="h-8 w-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Tendencia de Ingresos</h3>
              <p className="text-gray-400 text-sm">{getDateRangeLabel()}</p>
            </div>
            <LineChart className="h-5 w-5 text-emerald-400" />
          </div>
          <RevenueLineChart data={revenueChartData} />
        </motion.div>

        {/* Peak Hours Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Horarios Pico</h3>
              <p className="text-gray-400 text-sm">Reservas por hora del día</p>
            </div>
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <BarChart data={peakHoursData} />
        </motion.div>
      </div>

      {/* Court Utilization and Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Court Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Utilización por Cancha</h3>
              <p className="text-gray-400 text-sm">Rendimiento de cada cancha</p>
            </div>
            <MapPin className="h-5 w-5 text-orange-400" />
          </div>
          <div className="space-y-4">
            {courtUtilizationData.map((court, index) => (
              <motion.div
                key={court.court}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{court.court}</h4>
                    <span className="text-sm font-medium text-emerald-400">{court.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${court.utilization}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                    <span>{formatCurrency(court.revenue)}</span>
                    <span>{court.reservations} reservas</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Customer Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Segmentos de Clientes</h3>
              <p className="text-gray-400 text-sm">Análisis por tipo de cliente</p>
            </div>
            <Users className="h-5 w-5 text-purple-400" />
          </div>
          <div className="space-y-4">
            {customerSegments.map((segment, index) => (
              <motion.div
                key={segment.segment}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{segment.segment}</h4>
                    <span className="text-sm font-medium text-purple-400">{segment.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${segment.percentage}%` }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 1 }}
                      className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                    <span>{segment.count} clientes</span>
                    <span>{formatCurrency(segment.revenue)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Satisfacción</h4>
                <p className="text-gray-400 text-sm">Promedio de calificaciones</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">4.8</div>
            <div className="text-sm text-gray-400">de 5 estrellas</div>
            <div className="text-xs text-gray-500 mt-1">Basado en 127 reseñas</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Tiempo Promedio</h4>
                <p className="text-gray-400 text-sm">Duración de reservas</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">95</div>
            <div className="text-sm text-gray-400">minutos</div>
            <div className="text-xs text-gray-500 mt-1">+8 min vs mes anterior</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Conversión</h4>
                <p className="text-gray-400 text-sm">Visitas a reservas</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">23.4%</div>
            <div className="text-sm text-gray-400">tasa de conversión</div>
            <div className="text-xs text-gray-500 mt-1">+2.1% vs mes anterior</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
